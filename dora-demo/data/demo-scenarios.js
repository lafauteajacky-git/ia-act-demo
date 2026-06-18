import { REGULATORY_REQUIREMENTS } from "./regulatory-requirements.js";

const baseByDomain = {
  applicability: "operational",
  governance: "operational",
  incidents: "operational",
  "third-party": "operational",
  testing: "operational",
  "threat-sharing": "initiated",
  documentation: "operational"
};

const retailBankOverrides = {
  "APP-04": "partiallyOperational",
  "GOV-07": "partiallyOperational",
  "INC-02": "partiallyOperational",
  "INC-03": "initiated",
  "INC-06": "initiated",
  "TPR-01": "partiallyOperational",
  "TPR-02": "initiated",
  "TPR-04": "notInPlace",
  "TPR-05": "partiallyOperational",
  "TPR-06": "initiated",
  "TPR-07": "initiated",
  "TST-02": "partiallyOperational",
  "TST-03": "initiated",
  "TST-04": "partiallyOperational",
  "DOC-02": "initiated",
  "DOC-03": "partiallyOperational"
};

const retailBankEvidenceLinks = {
  "APP-03": ["EVD-009"],
  "GOV-01": ["EVD-001"],
  "GOV-03": ["EVD-002"],
  "GOV-04": ["EVD-008"],
  "GOV-08": ["EVD-008"],
  "INC-01": ["EVD-003"],
  "INC-02": ["EVD-003"],
  "INC-04": ["EVD-003", "EVD-004"],
  "INC-05": ["EVD-004", "EVD-010"],
  "TPR-01": ["EVD-005"],
  "TPR-04": ["EVD-006"],
  "TPR-05": ["EVD-005"],
  "TPR-07": ["EVD-009"],
  "TST-01": ["EVD-007"],
  "TST-02": ["EVD-007", "EVD-009"],
  "TST-03": ["EVD-004"],
  "TST-04": ["EVD-010"],
  "DOC-01": ["EVD-001"],
  "DOC-02": ["EVD-004", "EVD-005"],
  "DOC-03": ["EVD-010"]
};

function buildResponses(overrides, evidenceLinks) {
  const responses = {};

  for (const requirement of REGULATORY_REQUIREMENTS) {
    responses[requirement.id] = {
      mainLevel: overrides[requirement.id] || baseByDomain[requirement.domainId] || "notAssessed",
      comment: "",
      evidenceIds: evidenceLinks[requirement.id] || []
    };
  }

  return responses;
}

export const DEMO_SCENARIOS = [
  {
    id: "retail-bank-intermediate",
    name: "Banque de détail — Maturité intermédiaire",
    description: "Établissement financier disposant d’un cadre DORA formalisé, mais présentant encore des écarts sur la qualité du registre des tiers TIC, l’industrialisation des tests de résilience et la traçabilité des incidents.",
    organization: {
      name: "Banque Horizon",
      entityType: "retailBank",
      sector: "Banque de détail",
      size: "grande",
      groupStructure: "groupe",
      geography: "France et Union européenne",
      criticalFunctions: "oui",
      initialMaturity: "intermédiaire",
      objective: "remediationPlan"
    },
    responses: buildResponses(retailBankOverrides, retailBankEvidenceLinks),
    scenarioLabel: "Banque de détail — Maturité intermédiaire"
  }
];
