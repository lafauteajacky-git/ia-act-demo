import { MAIN_LEVEL_DEFAULTS } from "../config/scoring-config.js";

export function createAssessmentEntry(mainLevel = "notAssessed") {
  const defaults = MAIN_LEVEL_DEFAULTS[mainLevel] || MAIN_LEVEL_DEFAULTS.notAssessed;

  return {
    mainLevel,
    coverage: defaults.coverage,
    design: defaults.design,
    effectiveness: defaults.effectiveness,
    evidence: defaults.evidence,
    comment: "",
    evidenceIds: [],
    nonApplicable: false,
    expertMode: false
  };
}

export function applyMainLevel(entry, mainLevel) {
  const defaults = MAIN_LEVEL_DEFAULTS[mainLevel] || MAIN_LEVEL_DEFAULTS.notAssessed;

  return {
    ...entry,
    mainLevel,
    coverage: defaults.coverage,
    design: defaults.design,
    effectiveness: defaults.effectiveness,
    evidence: defaults.evidence
  };
}

export function hydrateAssessment(assessment = {}, requirements = []) {
  const hydrated = {};

  for (const requirement of requirements) {
    const existing = assessment[requirement.id];
    if (!existing) {
      hydrated[requirement.id] = createAssessmentEntry();
      continue;
    }

    hydrated[requirement.id] = {
      ...createAssessmentEntry(existing.mainLevel || "notAssessed"),
      ...existing,
      evidenceIds: Array.isArray(existing.evidenceIds) ? existing.evidenceIds : []
    };
  }

  return hydrated;
}

export function isRequirementApplicable(requirement, organization) {
  const types = requirement.applicability?.organizationTypes || ["all"];
  if (types.includes("all")) return true;
  return types.includes(organization.entityType);
}

export function getApplicableQuestions(questions, organization) {
  return questions.filter((question) => {
    if (!question.applicability) return true;
    const types = question.applicability.organizationTypes || ["all"];
    if (types.includes("all")) return true;
    return types.includes(organization.entityType);
  });
}

export function getCompletionStats(state, questions, requirementsById) {
  const applicable = questions.filter((question) => {
    const requirement = requirementsById[question.requirementId];
    return requirement ? isRequirementApplicable(requirement, state.organization) : true;
  });

  const completed = applicable.filter((question) => {
    const entry = state.assessment[question.requirementId];
    if (!entry) return false;
    if (entry.nonApplicable) return true;
    return entry.mainLevel && entry.mainLevel !== "notAssessed";
  }).length;

  const total = applicable.length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { completed, total, percentage };
}

export function normalizeScenarioResponses(scenarioResponses = {}, requirements = []) {
  const normalized = {};

  for (const requirement of requirements) {
    const scenarioResponse = scenarioResponses[requirement.id];
    if (!scenarioResponse) {
      normalized[requirement.id] = createAssessmentEntry();
      continue;
    }

    const base = applyMainLevel(createAssessmentEntry(), scenarioResponse.mainLevel || "notAssessed");
    normalized[requirement.id] = {
      ...base,
      ...scenarioResponse,
      evidenceIds: Array.isArray(scenarioResponse.evidenceIds) ? scenarioResponse.evidenceIds : []
    };
  }

  return normalized;
}
