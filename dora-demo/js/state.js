import { createAssessmentEntry, hydrateAssessment } from "./assessment-engine.js";

export const STORAGE_KEY = "auria-dora-demo-state";

export function createDefaultState(requirements, demoEvidence) {
  const assessment = {};

  for (const requirement of requirements) {
    assessment[requirement.id] = createAssessmentEntry();
  }

  return {
    organization: {
      name: "",
      entityType: "retailBank",
      sector: "",
      size: "non-renseignée",
      groupStructure: "autonome",
      geography: "",
      criticalFunctions: "oui",
      initialMaturity: "initial",
      objective: "initialDiagnostic"
    },
    assessment,
    evidence: structuredCloneSafe(demoEvidence),
    findings: [],
    actions: [],
    ui: {
      route: "executive",
      currentQuestionIndex: 0,
      requirementsFilters: {
        domain: "all",
        exposure: "all",
        evidence: "all",
        criticality: "all",
        status: "all",
        search: ""
      },
      evidenceFilters: {
        status: "all",
        search: ""
      },
      findingFilters: {
        severity: "all",
        domain: "all",
        status: "all"
      }
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
      scenarioId: null,
      scenarioName: null,
      resumeAvailable: false,
      corruptionRecovered: false
    }
  };
}

export function loadState(requirements, demoEvidence) {
  const fallback = createDefaultState(requirements, demoEvidence);

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    const merged = {
      ...fallback,
      ...parsed,
      organization: { ...fallback.organization, ...parsed.organization },
      assessment: hydrateAssessment(parsed.assessment, requirements),
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence : fallback.evidence,
      findings: Array.isArray(parsed.findings) ? parsed.findings : [],
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      ui: {
        ...fallback.ui,
        ...(parsed.ui || {}),
        requirementsFilters: { ...fallback.ui.requirementsFilters, ...(parsed.ui?.requirementsFilters || {}) },
        evidenceFilters: { ...fallback.ui.evidenceFilters, ...(parsed.ui?.evidenceFilters || {}) },
        findingFilters: { ...fallback.ui.findingFilters, ...(parsed.ui?.findingFilters || {}) }
      },
      metadata: {
        ...fallback.metadata,
        ...(parsed.metadata || {}),
        resumeAvailable: true,
        corruptionRecovered: false
      }
    };

    return merged;
  } catch (error) {
    return {
      ...fallback,
      metadata: {
        ...fallback.metadata,
        corruptionRecovered: true
      }
    };
  }
}

export function saveState(state) {
  const payload = {
    ...state,
    metadata: {
      ...state.metadata,
      updatedAt: new Date().toISOString(),
      resumeAvailable: true
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  return payload;
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}

function structuredCloneSafe(value) {
  return JSON.parse(JSON.stringify(value));
}
