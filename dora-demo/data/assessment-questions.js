import { REGULATORY_REQUIREMENTS } from "./regulatory-requirements.js";

export const ASSESSMENT_QUESTIONS = REGULATORY_REQUIREMENTS.map((requirement, index) => ({
  id: requirement.id,
  requirementId: requirement.id,
  domainId: requirement.domainId,
  order: index + 1,
  prompt: `Dans quelle mesure ${requirement.description.charAt(0).toLowerCase()}${requirement.description.slice(1)}`,
  guidance: `Exigence analysée : ${requirement.title}. Appréciez la couverture, la qualité de conception, l’effectivité et le niveau de preuve disponibles.`,
  expectedEvidence: requirement.expectedEvidence,
  expectedControls: requirement.expectedControls
}));
