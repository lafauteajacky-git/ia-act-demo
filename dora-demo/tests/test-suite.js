import { MAIN_LEVEL_DEFAULTS } from "../config/scoring-config.js";
import { DEMO_EVIDENCE } from "../data/demo-evidence.js";
import { DEMO_SCENARIOS } from "../data/demo-scenarios.js";
import { REGULATORY_REQUIREMENTS } from "../data/regulatory-requirements.js";
import { createAssessmentEntry, normalizeScenarioResponses } from "../js/assessment-engine.js";
import { generateFindings } from "../js/finding-engine.js";
import { buildActionsFromFindings } from "../js/roadmap-engine.js";
import { aggregateDomainScores, aggregatePortfolio, scoreAssessment } from "../js/scoring-engine.js";
import { clearState, createDefaultState, loadState, saveState } from "../js/state.js";

function test(name, run) {
  try {
    run();
    return { name, ok: true };
  } catch (error) {
    return { name, ok: false, error: error.message };
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function buildScenarioState() {
  const scenario = DEMO_SCENARIOS[0];
  const state = createDefaultState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
  state.organization = { ...state.organization, ...scenario.organization };
  state.assessment = normalizeScenarioResponses(scenario.responses, REGULATORY_REQUIREMENTS);
  state.evidence = JSON.parse(JSON.stringify(DEMO_EVIDENCE));
  return state;
}

export function runSuite() {
  const results = [];

  results.push(test("Scoring: default initiated dimensions", () => {
    assert(MAIN_LEVEL_DEFAULTS.initiated.coverage === 0.25, "Expected initiated coverage to equal 0.25");
  }));

  results.push(test("Scoring: maturity and exposure are bounded", () => {
    const state = buildScenarioState();
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, state.assessment, state.evidence);
    const domainScores = aggregateDomainScores(REGULATORY_REQUIREMENTS, scored.scoredRequirements);
    const portfolio = aggregatePortfolio(domainScores);
    assert(portfolio.indicativeMaturity >= 0 && portfolio.indicativeMaturity <= 100, "Indicative maturity out of range");
    assert(portfolio.residualExposure >= 0 && portfolio.residualExposure <= 100, "Exposure out of range");
  }));

  results.push(test("Scoring: not assessed requirement stays null", () => {
    const state = buildScenarioState();
    state.assessment["GOV-01"] = createAssessmentEntry();
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, state.assessment, state.evidence);
    assert(scored.scoredRequirements["GOV-01"].maturityScore == null, "Expected GOV-01 maturity to remain null");
  }));

  results.push(test("Findings: scenario generates high or critical findings", () => {
    const state = buildScenarioState();
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, state.assessment, state.evidence);
    const findings = generateFindings(REGULATORY_REQUIREMENTS, scored.scoredRequirements, scored.evidenceIndex);
    assert(findings.some((finding) => ["critical", "high"].includes(finding.severity)), "Expected at least one high or critical finding");
  }));

  results.push(test("Findings: mastered requirement does not create finding", () => {
    const requirement = REGULATORY_REQUIREMENTS.find((item) => item.id === "GOV-01");
    const evidence = DEMO_EVIDENCE.filter((item) => item.relatedRequirementIds.includes("GOV-01"));
    const assessment = {
      "GOV-01": {
        mainLevel: "controlledAndTested",
        coverage: 1,
        design: 1,
        effectiveness: 1,
        evidence: 1,
        comment: "",
        evidenceIds: evidence.map((item) => item.id),
        nonApplicable: false,
        expertMode: false
      }
    };
    const scored = scoreAssessment([requirement], assessment, evidence);
    const findings = generateFindings([requirement], scored.scoredRequirements, scored.evidenceIndex);
    assert(findings.length === 0, "Expected no finding for a fully mastered requirement");
  }));

  results.push(test("Findings: obsolete evidence triggers a finding", () => {
    const state = buildScenarioState();
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, state.assessment, state.evidence);
    const findings = generateFindings(REGULATORY_REQUIREMENTS, scored.scoredRequirements, scored.evidenceIndex);
    assert(findings.some((finding) => finding.triggerSummary.includes("Présence d’une preuve obsolète")), "Expected an obsolete evidence trigger");
  }));

  results.push(test("Roadmap: actions are generated without duplicates", () => {
    const state = buildScenarioState();
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, state.assessment, state.evidence);
    const findings = generateFindings(REGULATORY_REQUIREMENTS, scored.scoredRequirements, scored.evidenceIndex);
    const actions = buildActionsFromFindings(findings);
    const ids = new Set(actions.map((action) => action.id));
    assert(ids.size === actions.length, "Expected unique action ids");
  }));

  results.push(test("State: scenario can be saved and loaded", () => {
    clearState();
    const state = buildScenarioState();
    saveState(state);
    const loaded = loadState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
    assert(loaded.organization.name === state.organization.name, "Expected loaded organization to match saved state");
    clearState();
  }));

  return results;
}
