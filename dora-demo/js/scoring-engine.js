import {
  EXPOSURE_LEVELS,
  EXPOSURE_WEIGHTS,
  MAIN_LEVEL_OPTIONS,
  MATURITY_LEVELS,
  SCORING_WEIGHTS
} from "../config/scoring-config.js";

function clampScore(value) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.max(0, Math.min(1, Number(value)));
}

function percent(value) {
  if (value == null) return null;
  return Math.round(value * 100);
}

function findBand(value, bands) {
  return Object.entries(bands).find(([, band]) => value >= band.min && value <= band.max)?.[0] || null;
}

function findMaturityLabel(score) {
  const match = MATURITY_LEVELS.find((band) => score >= band.min && score <= band.max);
  return match ? match.label : "Non évaluée";
}

function evidenceStatusSummary(relatedEvidence) {
  if (!relatedEvidence.length) {
    return { status: "none", label: "Absente" };
  }

  if (relatedEvidence.some((evidence) => evidence.status === "obsolete")) {
    return { status: "obsolete", label: "Obsolète" };
  }

  if (relatedEvidence.some((evidence) => evidence.status === "review")) {
    return { status: "review", label: "À revoir" };
  }

  if (relatedEvidence.some((evidence) => evidence.status === "verified")) {
    return { status: "verified", label: "Vérifiée et récente" };
  }

  if (relatedEvidence.some((evidence) => evidence.status === "available")) {
    return { status: "documented", label: "Documentée" };
  }

  return { status: "declarative", label: "Déclarative" };
}

export function buildEvidenceIndex(evidence = []) {
  const byRequirement = {};

  for (const item of evidence) {
    for (const requirementId of item.relatedRequirementIds || []) {
      if (!byRequirement[requirementId]) byRequirement[requirementId] = [];
      byRequirement[requirementId].push(item);
    }
  }

  return byRequirement;
}

export function scoreRequirement(requirement, response, relatedEvidence = []) {
  if (!response || response.nonApplicable) {
    return {
      requirementId: requirement.id,
      status: "notApplicable",
      maturityScore: null,
      weightedExposure: null,
      evidenceStatus: { status: "none", label: "Absente" }
    };
  }

  if (!response.mainLevel || response.mainLevel === "notAssessed") {
    return {
      requirementId: requirement.id,
      status: "notAssessed",
      maturityScore: null,
      weightedExposure: null,
      evidenceStatus: evidenceStatusSummary(relatedEvidence)
    };
  }

  const coverage = clampScore(response.coverage);
  const design = clampScore(response.design);
  const effectiveness = clampScore(response.effectiveness);
  const evidence = clampScore(response.evidence);

  const maturityScore = Math.round(
    100 * (
      coverage * SCORING_WEIGHTS.coverage +
      design * SCORING_WEIGHTS.design +
      effectiveness * SCORING_WEIGHTS.effectiveness +
      evidence * SCORING_WEIGHTS.evidence
    )
  );

  const residualExposure = 100 * (
    (1 - effectiveness) * EXPOSURE_WEIGHTS.effectivenessGap +
    (1 - coverage) * EXPOSURE_WEIGHTS.coverageGap +
    (1 - design) * EXPOSURE_WEIGHTS.designGap +
    (1 - evidence) * EXPOSURE_WEIGHTS.evidenceGap
  );

  const weightedExposure = Math.max(0, Math.min(100, Math.round(residualExposure * (requirement.criticality / 5))));
  const evidenceStatus = evidenceStatusSummary(relatedEvidence);
  const exposureBand = findBand(weightedExposure, EXPOSURE_LEVELS);

  return {
    requirementId: requirement.id,
    status: "evaluated",
    mainLevel: response.mainLevel,
    coverage,
    design,
    effectiveness,
    evidence,
    maturityScore,
    maturityLabel: findMaturityLabel(maturityScore),
    residualExposure: Math.round(residualExposure),
    weightedExposure,
    exposureBand,
    exposureLabel: exposureBand ? EXPOSURE_LEVELS[exposureBand].label : "Exposition à déterminer",
    criticality: requirement.criticality,
    evidenceStatus,
    relatedEvidenceIds: relatedEvidence.map((item) => item.id),
    explanation: {
      mainLevel: MAIN_LEVEL_OPTIONS.find((option) => option.id === response.mainLevel)?.label || "Non évalué",
      weights: SCORING_WEIGHTS,
      responseValues: {
        coverage: percent(coverage),
        design: percent(design),
        effectiveness: percent(effectiveness),
        evidence: percent(evidence)
      }
    }
  };
}

export function scoreAssessment(requirements, assessment, evidence = []) {
  const evidenceIndex = buildEvidenceIndex(evidence);
  const requirementsById = {};
  const scoredRequirements = {};

  for (const requirement of requirements) {
    requirementsById[requirement.id] = requirement;
    scoredRequirements[requirement.id] = scoreRequirement(requirement, assessment[requirement.id], evidenceIndex[requirement.id] || []);
  }

  return {
    requirementsById,
    evidenceIndex,
    scoredRequirements
  };
}

export function aggregateDomainScores(requirements, scoredRequirements) {
  const domainScores = {};

  for (const requirement of requirements) {
    const scored = scoredRequirements[requirement.id];
    if (!domainScores[requirement.domainId]) {
      domainScores[requirement.domainId] = {
        domainId: requirement.domainId,
        maturityWeighted: 0,
        exposureWeighted: 0,
        coverageWeighted: 0,
        designWeighted: 0,
        effectivenessWeighted: 0,
        evidenceWeighted: 0,
        criticalityTotal: 0,
        findingsCount: 0,
        evaluatedCount: 0,
        notAssessedCount: 0,
        notApplicableCount: 0
      };
    }

    const bucket = domainScores[requirement.domainId];

    if (scored.status === "notApplicable") {
      bucket.notApplicableCount += 1;
      continue;
    }

    if (scored.status !== "evaluated") {
      bucket.notAssessedCount += 1;
      continue;
    }

    const weight = requirement.criticality;
    bucket.evaluatedCount += 1;
    bucket.criticalityTotal += weight;
    bucket.maturityWeighted += scored.maturityScore * weight;
    bucket.exposureWeighted += scored.weightedExposure * weight;
    bucket.coverageWeighted += scored.coverage * 100 * weight;
    bucket.designWeighted += scored.design * 100 * weight;
    bucket.effectivenessWeighted += scored.effectiveness * 100 * weight;
    bucket.evidenceWeighted += scored.evidence * 100 * weight;
  }

  for (const bucket of Object.values(domainScores)) {
    if (!bucket.criticalityTotal) continue;

    bucket.maturityScore = Math.round(bucket.maturityWeighted / bucket.criticalityTotal);
    bucket.exposure = Math.round(bucket.exposureWeighted / bucket.criticalityTotal);
    bucket.coverage = Math.round(bucket.coverageWeighted / bucket.criticalityTotal);
    bucket.design = Math.round(bucket.designWeighted / bucket.criticalityTotal);
    bucket.effectiveness = Math.round(bucket.effectivenessWeighted / bucket.criticalityTotal);
    bucket.evidence = Math.round(bucket.evidenceWeighted / bucket.criticalityTotal);
    bucket.maturityLabel = findMaturityLabel(bucket.maturityScore);
    bucket.exposureBand = findBand(bucket.exposure, EXPOSURE_LEVELS);
    bucket.exposureLabel = bucket.exposureBand ? EXPOSURE_LEVELS[bucket.exposureBand].label : "Exposition à déterminer";
  }

  return domainScores;
}

export function aggregatePortfolio(domainScores) {
  const domains = Object.values(domainScores).filter((domain) => Number.isFinite(domain.maturityScore));

  if (!domains.length) {
    return {
      indicativeMaturity: null,
      coverageRate: null,
      effectivenessRate: null,
      evidenceRate: null,
      residualExposure: null
    };
  }

  const weight = domains.reduce((sum, domain) => sum + domain.criticalityTotal, 0) || 1;

  const indicativeMaturity = Math.round(domains.reduce((sum, domain) => sum + (domain.maturityScore * domain.criticalityTotal), 0) / weight);
  const coverageRate = Math.round(domains.reduce((sum, domain) => sum + (domain.coverage * domain.criticalityTotal), 0) / weight);
  const effectivenessRate = Math.round(domains.reduce((sum, domain) => sum + (domain.effectiveness * domain.criticalityTotal), 0) / weight);
  const evidenceRate = Math.round(domains.reduce((sum, domain) => sum + (domain.evidence * domain.criticalityTotal), 0) / weight);
  const residualExposure = Math.round(domains.reduce((sum, domain) => sum + (domain.exposure * domain.criticalityTotal), 0) / weight);

  return {
    indicativeMaturity,
    maturityLabel: findMaturityLabel(indicativeMaturity),
    coverageRate,
    effectivenessRate,
    evidenceRate,
    residualExposure,
    exposureBand: findBand(residualExposure, EXPOSURE_LEVELS),
    exposureLabel: findBand(residualExposure, EXPOSURE_LEVELS) ? EXPOSURE_LEVELS[findBand(residualExposure, EXPOSURE_LEVELS)].label : "Exposition à déterminer"
  };
}
