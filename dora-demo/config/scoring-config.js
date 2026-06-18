export const MAIN_LEVEL_OPTIONS = [
  { id: "notAssessed", label: "Non évalué", value: null },
  { id: "notInPlace", label: "Non en place", value: 0 },
  { id: "initiated", label: "Initialisé", value: 0.25 },
  { id: "partiallyOperational", label: "Partiellement opérationnel", value: 0.5 },
  { id: "operational", label: "Opérationnel", value: 0.75 },
  { id: "controlledAndTested", label: "Maîtrisé et régulièrement testé", value: 1 }
];

export const MAIN_LEVEL_DEFAULTS = {
  notAssessed: { coverage: null, design: null, effectiveness: null, evidence: null },
  notInPlace: { coverage: 0, design: 0, effectiveness: 0, evidence: 0 },
  initiated: { coverage: 0.25, design: 0.25, effectiveness: 0, evidence: 0.25 },
  partiallyOperational: { coverage: 0.5, design: 0.5, effectiveness: 0.25, evidence: 0.5 },
  operational: { coverage: 0.75, design: 0.75, effectiveness: 0.75, evidence: 0.75 },
  controlledAndTested: { coverage: 1, design: 1, effectiveness: 1, evidence: 1 }
};

export const DIMENSION_OPTIONS = {
  coverage: [
    { value: 0, label: "Absente" },
    { value: 0.5, label: "Partielle" },
    { value: 1, label: "Complète" }
  ],
  design: [
    { value: 0, label: "Inadaptée" },
    { value: 0.5, label: "À renforcer" },
    { value: 1, label: "Robuste" }
  ],
  effectiveness: [
    { value: 0, label: "Non démontrée" },
    { value: 0.5, label: "Ponctuelle" },
    { value: 0.75, label: "Régulière" },
    { value: 1, label: "Régulièrement testée" }
  ],
  evidence: [
    { value: 0, label: "Absente" },
    { value: 0.33, label: "Déclarative" },
    { value: 0.66, label: "Documentée" },
    { value: 1, label: "Vérifiée et récente" }
  ]
};

export const SCORING_WEIGHTS = {
  coverage: 0.2,
  design: 0.25,
  effectiveness: 0.35,
  evidence: 0.2
};

export const EXPOSURE_WEIGHTS = {
  effectivenessGap: 0.45,
  coverageGap: 0.25,
  designGap: 0.15,
  evidenceGap: 0.15
};

export const EXPOSURE_LEVELS = {
  controlled: { min: 0, max: 24, label: "Exposition maîtrisée" },
  moderate: { min: 25, max: 49, label: "Exposition modérée" },
  high: { min: 50, max: 74, label: "Exposition élevée" },
  critical: { min: 75, max: 100, label: "Exposition critique" }
};

export const MATURITY_LEVELS = [
  { min: 0, max: 24, label: "Initiale" },
  { min: 25, max: 49, label: "Partielle" },
  { min: 50, max: 74, label: "Intermédiaire" },
  { min: 75, max: 100, label: "Avancée" }
];

export const SEVERITY_ORDER = ["low", "medium", "high", "critical"];

export const SEVERITY_LABELS = {
  critical: "Critique",
  high: "Élevée",
  medium: "Modérée",
  low: "Faible"
};

export const ACTION_HORIZONS = {
  critical: "0-30",
  high: "31-90",
  medium: "91-180",
  low: "180+"
};

export const ACTION_HORIZON_LABELS = {
  "0-30": "0 à 30 jours — Sécurisation immédiate",
  "31-90": "31 à 90 jours — Mise sous contrôle",
  "91-180": "91 à 180 jours — Industrialisation",
  "180+": "Au-delà de 180 jours — Amélioration continue"
};
