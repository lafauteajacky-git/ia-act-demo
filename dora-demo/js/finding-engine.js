import { ACTION_HORIZONS, SEVERITY_LABELS, SEVERITY_ORDER } from "../config/scoring-config.js";

const DOMAIN_OWNERS = {
  applicability: "Responsable du dispositif DORA",
  governance: "Direction des risques",
  incidents: "CISO",
  "third-party": "Responsable du risque tiers TIC",
  testing: "Responsable de la résilience opérationnelle",
  "threat-sharing": "Responsable cyber",
  documentation: "PMO conformité"
};

function severityFromExposure(weightedExposure) {
  if (weightedExposure >= 75) return "critical";
  if (weightedExposure >= 55) return "high";
  if (weightedExposure >= 35) return "medium";
  if (weightedExposure >= 15) return "low";
  return null;
}

function maxSeverity(current, next) {
  if (!current) return next;
  if (!next) return current;
  return SEVERITY_ORDER.indexOf(next) > SEVERITY_ORDER.indexOf(current) ? next : current;
}

export function generateFindings(requirements, scoredRequirements, evidenceIndex) {
  const findings = [];
  let counter = 1;

  for (const requirement of requirements) {
    const score = scoredRequirements[requirement.id];
    if (!score || score.status !== "evaluated") continue;

    const evidenceList = evidenceIndex[requirement.id] || [];
    let severity = severityFromExposure(score.weightedExposure);
    const triggers = [];

    if (score.weightedExposure >= 75) triggers.push("Exposition résiduelle critique");
    else if (score.weightedExposure >= 55) triggers.push("Exposition résiduelle élevée");
    else if (score.weightedExposure >= 35) triggers.push("Exposition résiduelle modérée");

    if (requirement.criticality === 5 && score.effectiveness <= 0.25) {
      severity = maxSeverity(severity, "high");
      triggers.push("Effectivité insuffisante sur une exigence critique");
    }

    if (requirement.criticality === 5 && evidenceList.length === 0) {
      severity = maxSeverity(severity, "medium");
      triggers.push("Absence de preuve sur une exigence critique");
    }

    if (evidenceList.some((item) => item.status === "obsolete")) {
      severity = maxSeverity(severity, requirement.criticality >= 4 ? "high" : "medium");
      triggers.push("Présence d’une preuve obsolète");
    }

    if (score.coverage <= 0.25 && requirement.criticality === 5) {
      severity = maxSeverity(severity, "high");
      triggers.push("Couverture partielle sur un sujet sensible");
    }

    if (score.mainLevel === "controlledAndTested" && evidenceList.length === 0) {
      severity = maxSeverity(severity, "medium");
      triggers.push("Réponse positive non appuyée par une preuve");
    }

    const shouldCreateFinding =
      severity === "critical" ||
      severity === "high" ||
      (severity === "medium" && requirement.criticality >= 4) ||
      triggers.includes("Absence de preuve sur une exigence critique") ||
      triggers.includes("Présence d’une preuve obsolète") ||
      triggers.includes("Effectivité insuffisante sur une exigence critique");

    if (!severity || !shouldCreateFinding) continue;

    const relatedEvidenceIds = evidenceList.map((item) => item.id);
    findings.push({
      id: `FND-${String(counter).padStart(3, "0")}`,
      requirementId: requirement.id,
      domainId: requirement.domainId,
      title: `${requirement.title} insuffisamment démontré`,
      observation: `${requirement.description} Les éléments disponibles ne démontrent pas un niveau de maîtrise suffisant au regard des attentes évaluées.`,
      expectedCriterion: `L’organisation doit pouvoir démontrer : ${requirement.expectedControls.join(", ").toLowerCase()}.`,
      probableCause: "Processus encore partiellement structuré, responsabilités diffuses ou documentation incomplète.",
      impactRisk: `Risque de maîtrise insuffisante sur le domaine ${requirement.subdomain.toLowerCase()}, avec difficulté à démontrer l’effectivité du dispositif en cas de revue ou de contrôle.`,
      severity,
      severityLabel: SEVERITY_LABELS[severity],
      recommendation: `Renforcer ${requirement.title.toLowerCase()} en documentant et en mettant sous contrôle les éléments suivants : ${requirement.expectedControls.slice(0, 3).join(", ").toLowerCase()}.`,
      suggestedOwner: DOMAIN_OWNERS[requirement.domainId] || "Responsable à définir",
      targetHorizon: ACTION_HORIZONS[severity],
      dueDate: null,
      closureCriteria: [
        "Contrôle attendu documenté",
        "Responsable désigné",
        "Preuve actualisée disponible",
        "Validation formalisée"
      ],
      regulatoryRefs: requirement.articleRefs,
      relatedEvidenceIds,
      status: "open",
      triggerSummary: triggers,
      weightedExposure: score.weightedExposure,
      evidenceLevel: score.evidenceStatus.label
    });
    counter += 1;
  }

  return findings;
}

export function mergeGeneratedFindings(existingFindings, generatedFindings) {
  const existingMap = Object.fromEntries(existingFindings.map((finding) => [finding.requirementId, finding]));

  return generatedFindings.map((finding) => {
    const existing = existingMap[finding.requirementId];
    if (!existing) return finding;

    return {
      ...finding,
      probableCause: existing.probableCause || finding.probableCause,
      recommendation: existing.recommendation || finding.recommendation,
      suggestedOwner: existing.suggestedOwner || finding.suggestedOwner,
      dueDate: existing.dueDate || null,
      closureCriteria: Array.isArray(existing.closureCriteria) && existing.closureCriteria.length ? existing.closureCriteria : finding.closureCriteria,
      status: existing.status || finding.status
    };
  });
}
