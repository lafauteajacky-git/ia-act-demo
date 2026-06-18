import { MAIN_LEVEL_OPTIONS, DIMENSION_OPTIONS, SCORING_WEIGHTS, EXPOSURE_WEIGHTS, SEVERITY_LABELS } from "../config/scoring-config.js";
import { DOMAIN_METADATA, REGULATORY_REQUIREMENTS } from "../data/regulatory-requirements.js";
import { ASSESSMENT_QUESTIONS } from "../data/assessment-questions.js";
import { DEMO_SCENARIOS } from "../data/demo-scenarios.js";
import { DEMO_EVIDENCE } from "../data/demo-evidence.js";
import { applyMainLevel, getCompletionStats, hydrateAssessment, normalizeScenarioResponses } from "./assessment-engine.js";
import { generateFindings, mergeGeneratedFindings } from "./finding-engine.js";
import { buildActionsFromFindings, groupActionsByHorizon } from "./roadmap-engine.js";
import { activateRoute, getRoute, setRoute } from "./router.js";
import { buildReportHtml } from "./report-engine.js";
import { aggregateDomainScores, aggregatePortfolio, scoreAssessment } from "./scoring-engine.js";
import { clearState, createDefaultState, loadState, saveState } from "./state.js";

const ENTITY_TYPES = [
  { value: "retailBank", label: "Banque de détail" },
  { value: "investmentBank", label: "Banque de financement et d’investissement" },
  { value: "paymentInstitution", label: "Établissement de paiement" },
  { value: "assetManager", label: "Société de gestion" },
  { value: "insuranceCompany", label: "Entreprise d’assurance" },
  { value: "mutual", label: "Mutuelle" },
  { value: "financialGroup", label: "Groupe financier" },
  { value: "ictProvider", label: "Prestataire de services TIC" },
  { value: "otherFinancialEntity", label: "Autre entité financière" }
];

const OBJECTIVES = [
  { value: "initialDiagnostic", label: "Diagnostic initial" },
  { value: "internalReview", label: "Préparation à une revue interne" },
  { value: "regulatoryReview", label: "Préparation à un contrôle" },
  { value: "remediationPlan", label: "Suivi d’un plan de remédiation" },
  { value: "thirdPartyReview", label: "Revue du dispositif de tiers TIC" },
  { value: "incidentReview", label: "Revue du dispositif de gestion des incidents" }
];

const REQUIREMENTS_BY_ID = Object.fromEntries(REGULATORY_REQUIREMENTS.map((requirement) => [requirement.id, requirement]));
const DOMAINS_BY_ID = Object.fromEntries(DOMAIN_METADATA.map((domain) => [domain.id, domain]));

let appState = loadState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function updateState(mutator) {
  mutator(appState);
  appState.metadata.updatedAt = new Date().toISOString();
  syncDerivedArtifacts();
  appState = saveState(appState);
  renderApp();
}

function setState(nextState) {
  appState = nextState;
  syncDerivedArtifacts();
  appState = saveState(appState);
  renderApp();
}

function syncDerivedArtifacts() {
  const scored = scoreAssessment(REGULATORY_REQUIREMENTS, appState.assessment, appState.evidence);
  const generatedFindings = generateFindings(REGULATORY_REQUIREMENTS, scored.scoredRequirements, scored.evidenceIndex);
  appState.findings = mergeGeneratedFindings(appState.findings, generatedFindings);
  appState.actions = buildActionsFromFindings(appState.findings);

  const stats = getCompletionStats(appState, ASSESSMENT_QUESTIONS, REQUIREMENTS_BY_ID);
  appState.metadata.status = stats.percentage === 100 && stats.total > 0 ? "finalized" : "draft";
}

function getDerivedData() {
  const scored = scoreAssessment(REGULATORY_REQUIREMENTS, appState.assessment, appState.evidence);
  const domainScores = aggregateDomainScores(REGULATORY_REQUIREMENTS, scored.scoredRequirements);
  const portfolio = aggregatePortfolio(domainScores);
  const completion = getCompletionStats(appState, ASSESSMENT_QUESTIONS, REQUIREMENTS_BY_ID);
  const groupedActions = groupActionsByHorizon(appState.actions);
  const summary = buildExecutiveSummary(domainScores, portfolio);

  return {
    scoredRequirements: scored.scoredRequirements,
    evidenceIndex: scored.evidenceIndex,
    domainScores,
    portfolio,
    completion,
    groupedActions,
    summary
  };
}

function buildExecutiveSummary(domainScores, portfolio) {
  if (portfolio.indicativeMaturity == null) {
    return {
      text: "Lancez ou chargez une évaluation pour visualiser une synthèse dirigeant structurée.",
      strengths: [],
      exposures: []
    };
  }

  const domainRows = Object.values(domainScores).filter((domain) => Number.isFinite(domain.maturityScore));
  const strongest = domainRows
    .filter((domain) => domain.maturityScore >= 70)
    .sort((left, right) => right.maturityScore - left.maturityScore)
    .slice(0, 3)
    .map((domain) => DOMAINS_BY_ID[domain.domainId]?.label || domain.domainId);
  const mostExposed = domainRows
    .filter((domain) => Number.isFinite(domain.exposure))
    .sort((left, right) => right.exposure - left.exposure)
    .slice(0, 3)
    .map((domain) => DOMAINS_BY_ID[domain.domainId]?.label || domain.domainId);

  const evidenceDescriptor = portfolio.evidenceRate >= 70 ? "solide" : portfolio.evidenceRate >= 45 ? "intermédiaire" : "à renforcer";

  const text = [
    `Le dispositif présente un niveau de maturité ${portfolio.maturityLabel?.toLowerCase() || "indicatif"} (${portfolio.indicativeMaturity}/100).`,
    strongest.length ? `Les principaux points de maîtrise concernent ${strongest.join(", ")}.` : "Aucun point de maîtrise significatif ne ressort encore à ce stade.",
    mostExposed.length ? `Les expositions prioritaires portent sur ${mostExposed.join(", ")}.` : "Aucune exposition prioritaire n’est encore déterminée.",
    portfolio.effectivenessRate != null ? `L’effectivité moyenne ressort à ${portfolio.effectivenessRate} % et doit être renforcée sur les sujets les plus critiques.` : "",
    `Le niveau de preuve est ${evidenceDescriptor}.`,
    appState.actions.length ? `Les actions prioritaires concernent ${appState.actions.slice(0, 3).map((action) => action.title.toLowerCase()).join(", ")}.` : "Aucune action de remédiation n’est encore calculée."
  ].filter(Boolean).join(" ");

  return {
    text,
    strengths: strongest,
    exposures: mostExposed
  };
}

function labelForEntityType(value) {
  return ENTITY_TYPES.find((item) => item.value === value)?.label || value || "Non renseigné";
}

function labelForObjective(value) {
  return OBJECTIVES.find((item) => item.value === value)?.label || value || "Non renseigné";
}

function formatPercent(value) {
  return value == null ? "—" : `${value} %`;
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("fr-FR");
  } catch (error) {
    return value;
  }
}

function buildSelectOptions(options, selectedValue) {
  return options.map((option) => `
    <option value="${option.value}" ${option.value === selectedValue ? "selected" : ""}>${option.label}</option>
  `).join("");
}

function renderOrganizationForm() {
  document.getElementById("org-name").value = appState.organization.name || "";
  document.getElementById("org-entity-type").innerHTML = buildSelectOptions(ENTITY_TYPES, appState.organization.entityType);
  document.getElementById("org-sector").value = appState.organization.sector || "";
  document.getElementById("org-size").value = appState.organization.size || "non-renseignée";
  document.getElementById("org-group-structure").value = appState.organization.groupStructure || "autonome";
  document.getElementById("org-geography").value = appState.organization.geography || "";
  document.getElementById("org-critical-functions").value = appState.organization.criticalFunctions || "oui";
  document.getElementById("org-initial-maturity").value = appState.organization.initialMaturity || "initial";
  document.getElementById("org-objective").innerHTML = buildSelectOptions(OBJECTIVES, appState.organization.objective);
}

function renderScenarioControls() {
  const scenarioSelect = document.getElementById("scenario-select");
  scenarioSelect.innerHTML = DEMO_SCENARIOS.map((scenario) => `
    <option value="${scenario.id}" ${appState.metadata.scenarioId === scenario.id ? "selected" : ""}>${scenario.name}</option>
  `).join("");

  const selectedScenario = DEMO_SCENARIOS.find((scenario) => scenario.id === scenarioSelect.value) || DEMO_SCENARIOS[0];
  document.getElementById("scenario-description").textContent = selectedScenario?.description || "";
  document.getElementById("resume-evaluation").disabled = !appState.metadata.resumeAvailable;
}

function renderOrganizationSummary(derived) {
  const container = document.getElementById("organization-summary");
  const statusBadge = document.getElementById("evaluation-status-badge");
  const statusLabel = appState.metadata.status === "finalized" ? "Évaluation finalisée" : "Brouillon";
  statusBadge.textContent = statusLabel;

  if (!appState.organization.name && derived.completion.completed === 0 && !appState.metadata.scenarioName) {
    container.className = "empty-state";
    container.textContent = "Lancez ou chargez une évaluation pour visualiser le profil de l’organisation et le statut du parcours.";
    return;
  }

  container.className = "data-grid";
  container.innerHTML = `
    <div class="info-tile"><strong>Organisation</strong><br>${appState.organization.name || "Non renseignée"}</div>
    <div class="info-tile"><strong>Type d’entité</strong><br>${labelForEntityType(appState.organization.entityType)}</div>
    <div class="info-tile"><strong>Objectif</strong><br>${labelForObjective(appState.organization.objective)}</div>
    <div class="info-tile"><strong>Progression</strong><br>${derived.completion.completed} / ${derived.completion.total}</div>
    <div class="info-tile"><strong>Scénario</strong><br>${appState.metadata.scenarioName || "Aucun scénario chargé"}</div>
    <div class="info-tile"><strong>Dernière mise à jour</strong><br>${formatDate(appState.metadata.updatedAt)}</div>
  `;
}

function renderExecutiveMetrics(derived) {
  const container = document.getElementById("executive-metrics");
  if (derived.portfolio.indicativeMaturity == null) {
    container.className = "empty-state";
    container.textContent = "Lancez ou chargez une évaluation pour visualiser les résultats.";
    return;
  }

  const criticalCount = appState.findings.filter((finding) => finding.severity === "critical").length;
  const highCount = appState.findings.filter((finding) => finding.severity === "high").length;

  container.className = "metric-grid";
  container.innerHTML = `
    ${metricCard("Indice indicatif de maturité", `${derived.portfolio.indicativeMaturity}`, derived.portfolio.maturityLabel)}
    ${metricCard("Taux de couverture", formatPercent(derived.portfolio.coverageRate), "Couverture du dispositif")}
    ${metricCard("Effectivité moyenne", formatPercent(derived.portfolio.effectivenessRate), "Capacité opérationnelle")}
    ${metricCard("Niveau de preuve", formatPercent(derived.portfolio.evidenceRate), "Démonstration disponible")}
    ${metricCard("Exposition résiduelle", formatPercent(derived.portfolio.residualExposure), derived.portfolio.exposureLabel)}
    ${metricCard("Findings critiques", `${criticalCount}`, "Niveau d’alerte maximal")}
    ${metricCard("Findings élevés", `${highCount}`, "Actions prioritaires")}
    ${metricCard("Actions identifiées", `${appState.actions.length}`, "Suivi de remédiation")}
  `;
}

function metricCard(label, value, subvalue) {
  return `
    <article class="metric-card">
      <span class="label">${label}</span>
      <span class="value">${value}</span>
      <span class="subvalue">${subvalue}</span>
    </article>
  `;
}

function renderExecutiveSummary(derived) {
  const summaryNode = document.getElementById("executive-summary");
  summaryNode.className = "info-tile";
  summaryNode.textContent = derived.summary.text;

  const strengthNode = document.getElementById("executive-strengths");
  if (!derived.summary.strengths.length) {
    strengthNode.className = "empty-state";
    strengthNode.textContent = "Les points de maîtrise ressortiront automatiquement selon les dimensions évaluées.";
  } else {
    strengthNode.className = "strength-list";
    strengthNode.innerHTML = derived.summary.strengths.map((item) => `<div class="strength-item">${item}</div>`).join("");
  }

  const exposureNode = document.getElementById("executive-exposures");
  if (!derived.summary.exposures.length) {
    exposureNode.className = "empty-state";
    exposureNode.textContent = "Les principales expositions apparaîtront ici après calcul.";
  } else {
    exposureNode.className = "exposure-list";
    exposureNode.innerHTML = derived.summary.exposures.map((item) => `<div class="exposure-item">${item}</div>`).join("");
  }
}

function renderHeatmap(derived) {
  const node = document.getElementById("heatmap-container");
  const rows = Object.values(derived.domainScores).filter((row) => Number.isFinite(row.maturityScore));

  if (!rows.length) {
    node.className = "empty-state";
    node.textContent = "La heatmap des domaines sera disponible une fois l’évaluation renseignée.";
    return;
  }

  node.className = "heatmap-grid";
  node.innerHTML = rows.map((row) => `
    <article class="heatmap-card">
      <h4>${DOMAINS_BY_ID[row.domainId]?.label || row.domainId}</h4>
      <div class="stat-grid">
        <div class="stat-row"><strong>Maturité</strong><br>${row.maturityScore}/100</div>
        <div class="stat-row"><strong>Couverture</strong><br>${formatPercent(row.coverage)}</div>
        <div class="stat-row"><strong>Effectivité</strong><br>${formatPercent(row.effectiveness)}</div>
        <div class="stat-row"><strong>Preuve</strong><br>${formatPercent(row.evidence)}</div>
        <div class="stat-row"><strong>Exposition</strong><br>${formatPercent(row.exposure)}</div>
        <div class="stat-row"><strong>Findings</strong><br>${appState.findings.filter((finding) => finding.domainId === row.domainId).length}</div>
      </div>
    </article>
  `).join("");
}

function renderCalculationExplainer() {
  document.getElementById("calculation-explainer").innerHTML = `
    <p>Le score de maturité par exigence est calculé comme suit : couverture 20 %, conception 25 %, effectivité 35 %, qualité de preuve 20 %.</p>
    <p>L’exposition résiduelle repose sur les déficits d’effectivité, de couverture, de conception et de preuve, avec un coefficient de criticité appliqué à chaque exigence.</p>
    <p>Le résultat reste indicatif : il synthétise les réponses, les pondérations configurées, les exigences concernées et les preuves associées, sans constituer une validation formelle de conformité.</p>
    <ul class="bullet-list">
      <li>Poids de la maturité : ${JSON.stringify(SCORING_WEIGHTS)}</li>
      <li>Poids de l’exposition : ${JSON.stringify(EXPOSURE_WEIGHTS)}</li>
      <li>Chaque exigence est pondérée par sa criticité.</li>
      <li>Les références réglementaires affichées proviennent exclusivement de la base centralisée.</li>
    </ul>
  `;
}

function renderQuestionCard(derived) {
  const node = document.getElementById("question-card");
  const question = ASSESSMENT_QUESTIONS[appState.ui.currentQuestionIndex] || ASSESSMENT_QUESTIONS[0];
  const requirement = REQUIREMENTS_BY_ID[question.requirementId];
  const response = appState.assessment[question.requirementId];
  const score = derived.scoredRequirements[question.requirementId];
  const evidenceOptions = appState.evidence.map((item) => `
    <option value="${item.id}" ${response.evidenceIds.includes(item.id) ? "selected" : ""}>${item.id} — ${item.title}</option>
  `).join("");

  document.getElementById("question-counter").textContent = `Question ${question.order} / ${ASSESSMENT_QUESTIONS.length}`;
  document.getElementById("completion-label").textContent = `${derived.completion.percentage} % complété`;
  document.getElementById("assessment-progress-bar").style.width = `${derived.completion.percentage}%`;

  node.className = "question-card";
  node.innerHTML = `
    <div class="question-meta">
      <span class="status-pill">${DOMAINS_BY_ID[question.domainId]?.label || question.domainId}</span>
      <span class="metric-pill">Criticité ${requirement.criticality}</span>
      <span class="metric-pill">${score?.status === "evaluated" ? `Maturité ${score.maturityScore}/100` : "Non évaluée"}</span>
      <span class="metric-pill">${score?.status === "evaluated" ? score.exposureLabel : "Exposition à calculer"}</span>
    </div>
    <div class="stack">
      <p class="section-kicker">Exigence ${requirement.id}</p>
      <h3 class="question-title">${requirement.title}</h3>
      <p class="question-description">${question.prompt}</p>
      <div class="section-grid two-col">
        <div class="info-tile">
          <strong>Explication</strong>
          <p>${question.guidance}</p>
        </div>
        <div class="info-tile">
          <strong>Référence réglementaire</strong>
          <p>${requirement.articleRefs.join(", ")}</p>
        </div>
      </div>
    </div>
    <div class="form-grid">
      <label class="field">
        <span>Réponse principale</span>
        <select id="question-main-level">
          ${MAIN_LEVEL_OPTIONS.map((option) => `<option value="${option.id}" ${option.id === response.mainLevel ? "selected" : ""}>${option.label}</option>`).join("")}
        </select>
      </label>
      <label class="field">
        <span>Applicabilité</span>
        <select id="question-applicability">
          <option value="applicable" ${response.nonApplicable ? "" : "selected"}>Applicable</option>
          <option value="notApplicable" ${response.nonApplicable ? "selected" : ""}>Non applicable</option>
        </select>
      </label>
      <label class="field field-full">
        <span>Commentaire</span>
        <textarea id="question-comment" rows="3" placeholder="Commentaires, hypothèses, éléments de contexte">${response.comment || ""}</textarea>
      </label>
      <label class="field field-full">
        <span>Associer des preuves</span>
        <select id="question-evidence" class="question-evidence" multiple size="6">${evidenceOptions}</select>
      </label>
    </div>
    <details class="explainer" ${response.expertMode ? "open" : ""}>
      <summary>Affiner l’évaluation</summary>
      <div class="dimension-grid">
        ${dimensionSelect("Couverture", "coverage", response.coverage)}
        ${dimensionSelect("Conception", "design", response.design)}
        ${dimensionSelect("Effectivité", "effectiveness", response.effectiveness)}
        ${dimensionSelect("Qualité de preuve", "evidence", response.evidence)}
      </div>
      <div class="section-grid two-col">
        <div class="info-tile">
          <strong>Contrôles attendus</strong>
          <p>${requirement.expectedControls.join(" · ")}</p>
        </div>
        <div class="info-tile">
          <strong>Preuves attendues</strong>
          <p>${question.expectedEvidence.join(" · ")}</p>
        </div>
      </div>
    </details>
    <div class="question-actions">
      <button id="question-prev" class="button tertiary" type="button" ${appState.ui.currentQuestionIndex === 0 ? "disabled" : ""}>Précédent</button>
      <div class="button-row">
        <button id="question-save-executive" class="button secondary" type="button">Voir la vue exécutive</button>
        <button id="question-next" class="button primary" type="button">${appState.ui.currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Terminer" : "Suivant"}</button>
      </div>
    </div>
  `;

  bindQuestionCardEvents(question.requirementId);
}

function dimensionSelect(label, dimensionKey, value) {
  return `
    <label class="field">
      <span>${label}</span>
      <select data-dimension-key="${dimensionKey}" class="question-dimension-select">
        ${DIMENSION_OPTIONS[dimensionKey].map((option) => `<option value="${option.value}" ${Number(value) === Number(option.value) ? "selected" : ""}>${option.label}</option>`).join("")}
      </select>
    </label>
  `;
}

function bindQuestionCardEvents(requirementId) {
  document.getElementById("question-main-level").addEventListener("change", (event) => {
    updateState((state) => {
      state.assessment[requirementId] = applyMainLevel(state.assessment[requirementId], event.target.value);
    });
  });

  document.getElementById("question-applicability").addEventListener("change", (event) => {
    updateState((state) => {
      state.assessment[requirementId].nonApplicable = event.target.value === "notApplicable";
    });
  });

  document.getElementById("question-comment").addEventListener("input", (event) => {
    updateState((state) => {
      state.assessment[requirementId].comment = event.target.value;
    });
  });

  document.getElementById("question-evidence").addEventListener("change", (event) => {
    updateState((state) => {
      state.assessment[requirementId].evidenceIds = Array.from(event.target.selectedOptions).map((option) => option.value);
    });
  });

  document.querySelectorAll(".question-dimension-select").forEach((select) => {
    select.addEventListener("change", (event) => {
      updateState((state) => {
        const key = event.target.dataset.dimensionKey;
        state.assessment[requirementId][key] = Number(event.target.value);
        state.assessment[requirementId].expertMode = true;
      });
    });
  });

  document.querySelector(".explainer").addEventListener("toggle", (event) => {
    updateState((state) => {
      state.assessment[requirementId].expertMode = event.target.open;
    });
  });

  document.getElementById("question-prev").addEventListener("click", () => {
    updateState((state) => {
      state.ui.currentQuestionIndex = Math.max(0, state.ui.currentQuestionIndex - 1);
    });
  });

  document.getElementById("question-next").addEventListener("click", () => {
    updateState((state) => {
      state.ui.currentQuestionIndex = Math.min(ASSESSMENT_QUESTIONS.length - 1, state.ui.currentQuestionIndex + 1);
    });
  });

  document.getElementById("question-save-executive").addEventListener("click", () => {
    navigateTo("executive");
  });
}

function renderRequirementsView(derived) {
  const domainFilter = document.getElementById("requirements-domain-filter");
  domainFilter.innerHTML = `<option value="all">Tous les domaines</option>${DOMAIN_METADATA.map((domain) => `
    <option value="${domain.id}" ${appState.ui.requirementsFilters.domain === domain.id ? "selected" : ""}>${domain.label}</option>
  `).join("")}`;

  const filters = appState.ui.requirementsFilters;
  document.getElementById("requirements-exposure-filter").value = filters.exposure;
  document.getElementById("requirements-evidence-filter").value = filters.evidence;
  document.getElementById("requirements-criticality-filter").value = filters.criticality;
  document.getElementById("requirements-status-filter").value = filters.status;
  document.getElementById("requirements-search").value = filters.search;

  const rows = REGULATORY_REQUIREMENTS.filter((requirement) => {
    const score = derived.scoredRequirements[requirement.id];
    const evidenceList = derived.evidenceIndex[requirement.id] || [];
    const finding = appState.findings.find((item) => item.requirementId === requirement.id);
    const haystack = `${requirement.id} ${requirement.title} ${requirement.description} ${DOMAINS_BY_ID[requirement.domainId]?.label || ""}`.toLowerCase();

    if (filters.domain !== "all" && requirement.domainId !== filters.domain) return false;
    if (filters.criticality !== "all" && String(requirement.criticality) !== filters.criticality) return false;
    if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;

    if (filters.exposure !== "all") {
      if (score?.exposureBand !== filters.exposure) return false;
    }

    if (filters.evidence !== "all") {
      const status = score?.evidenceStatus?.status || "none";
      if (filters.evidence === "none" && evidenceList.length > 0) return false;
      if (filters.evidence === "declarative" && status !== "declarative") return false;
      if (filters.evidence === "documented" && !["documented", "review"].includes(status)) return false;
      if (filters.evidence === "verified" && status !== "verified") return false;
    }

    if (filters.status === "evaluated" && score?.status !== "evaluated") return false;
    if (filters.status === "notAssessed" && score?.status !== "notAssessed") return false;
    if (filters.status === "notApplicable" && score?.status !== "notApplicable") return false;
    if (filters.status === "withFinding" && !finding) return false;
    if (filters.status === "withEvidence" && evidenceList.length === 0) return false;

    return true;
  });

  const container = document.getElementById("requirements-table");
  if (!rows.length) {
    container.innerHTML = '<div class="empty-state">Aucune exigence ne correspond aux filtres sélectionnés.</div>';
    return;
  }

  container.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Exigence</th>
            <th>Domaine</th>
            <th>Criticité</th>
            <th>Statut</th>
            <th>Maturité</th>
            <th>Preuve</th>
            <th>Exposition</th>
            <th>Finding</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((requirement) => requirementRow(requirement, derived)).join("")}
        </tbody>
      </table>
    </div>
  `;

  document.querySelectorAll("[data-jump-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const index = ASSESSMENT_QUESTIONS.findIndex((question) => question.requirementId === button.dataset.jumpQuestion);
      updateState((state) => {
        state.ui.currentQuestionIndex = index >= 0 ? index : 0;
      });
      navigateTo("assessment");
    });
  });
}

function requirementRow(requirement, derived) {
  const score = derived.scoredRequirements[requirement.id];
  const finding = appState.findings.find((item) => item.requirementId === requirement.id);
  const domainLabel = DOMAINS_BY_ID[requirement.domainId]?.shortLabel || requirement.domainId;

  return `
    <tr>
      <td>
        <strong>${requirement.id}</strong><br>
        ${requirement.title}<br>
        <span class="table-note">${requirement.articleRefs.join(", ")}</span><br>
        <button class="button tertiary" type="button" data-jump-question="${requirement.id}">Évaluer</button>
      </td>
      <td>${domainLabel}</td>
      <td>${requirement.criticality}</td>
      <td>${statusLabel(score?.status)}</td>
      <td>${score?.maturityScore ?? "—"}</td>
      <td><span class="evidence-pill ${score?.evidenceStatus?.status || "none"}">${score?.evidenceStatus?.label || "Absente"}</span></td>
      <td>${score?.weightedExposure ?? "—"}</td>
      <td>${finding ? `<span class="severity-pill ${finding.severity}">${finding.severityLabel}</span>` : "—"}</td>
    </tr>
  `;
}

function statusLabel(status) {
  if (status === "evaluated") return "Évaluée";
  if (status === "notApplicable") return "Non applicable";
  return "Non évaluée";
}

function renderEvidenceView() {
  const requirementSelect = document.getElementById("evidence-related-requirements");
  requirementSelect.innerHTML = REGULATORY_REQUIREMENTS.map((requirement) => `
    <option value="${requirement.id}">${requirement.id} — ${requirement.title}</option>
  `).join("");

  const filters = appState.ui.evidenceFilters;
  document.getElementById("evidence-status-filter").value = filters.status;
  document.getElementById("evidence-search").value = filters.search;

  const evidenceCards = appState.evidence.filter((item) => {
    const haystack = `${item.title} ${item.owner} ${(item.relatedRequirementIds || []).join(" ")}`.toLowerCase();
    if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
    if (filters.status === "all") return true;
    if (filters.status === "missing") return false;
    return item.status === filters.status;
  });

  const missingEvidenceRequirements = filters.status === "missing"
    ? REGULATORY_REQUIREMENTS.filter((requirement) => !(appState.evidence.some((item) => (item.relatedRequirementIds || []).includes(requirement.id))))
    : [];

  const container = document.getElementById("evidence-list");
  if (filters.status === "missing") {
    container.innerHTML = missingEvidenceRequirements.length
      ? `<div class="data-card-list">${missingEvidenceRequirements.map((requirement) => `
          <article class="data-card">
            <h4>${requirement.id} — ${requirement.title}</h4>
            <p>${requirement.description}</p>
          </article>
        `).join("")}</div>`
      : '<div class="empty-state">Toutes les exigences disposent au moins d’un rattachement de preuve dans la session.</div>';
    return;
  }

  if (!evidenceCards.length) {
    container.innerHTML = '<div class="empty-state">Aucune preuve ne correspond aux filtres sélectionnés.</div>';
    return;
  }

  container.innerHTML = `<div class="data-card-list">${evidenceCards.map((item) => evidenceCard(item)).join("")}</div>`;
  bindEvidenceCardEvents();
}

function evidenceCard(item) {
  return `
    <article class="data-card" data-evidence-card="${item.id}">
      <div class="finding-head">
        <div>
          <h4>${item.id} — ${item.title}</h4>
          <p>${item.description || "Aucune description"}</p>
        </div>
        <span class="evidence-pill ${item.status}">${evidenceStatusLabel(item.status)}</span>
      </div>
      <div class="data-grid">
        <label class="field">
          <span>Owner</span>
          <input type="text" data-evidence-field="owner" data-evidence-id="${item.id}" value="${item.owner || ""}">
        </label>
        <label class="field">
          <span>Version</span>
          <input type="text" data-evidence-field="version" data-evidence-id="${item.id}" value="${item.version || ""}">
        </label>
        <label class="field">
          <span>Date du document</span>
          <input type="date" data-evidence-field="documentDate" data-evidence-id="${item.id}" value="${item.documentDate || ""}">
        </label>
        <label class="field">
          <span>Date de revue</span>
          <input type="date" data-evidence-field="reviewDate" data-evidence-id="${item.id}" value="${item.reviewDate || ""}">
        </label>
        <label class="field">
          <span>Statut</span>
          <select data-evidence-field="status" data-evidence-id="${item.id}">
            ${[
              ["declared", "Déclarée"],
              ["available", "Disponible"],
              ["review", "À revoir"],
              ["verified", "Vérifiée"],
              ["obsolete", "Obsolète"]
            ].map(([value, label]) => `<option value="${value}" ${item.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Exigences associées</span>
          <input type="text" data-evidence-field="relatedRequirementIds" data-evidence-id="${item.id}" value="${(item.relatedRequirementIds || []).join(", ")}">
        </label>
      </div>
      ${item.source === "demo" ? "" : `<button class="button tertiary danger" type="button" data-delete-evidence="${item.id}">Supprimer</button>`}
    </article>
  `;
}

function evidenceStatusLabel(status) {
  return {
    declared: "Déclarée",
    available: "Disponible",
    review: "À revoir",
    verified: "Vérifiée",
    obsolete: "Obsolète"
  }[status] || "Déclarée";
}

function bindEvidenceCardEvents() {
  document.querySelectorAll("[data-evidence-field]").forEach((field) => {
    field.addEventListener("change", (event) => {
      updateState((state) => {
        const evidence = state.evidence.find((item) => item.id === event.target.dataset.evidenceId);
        if (!evidence) return;
        const key = event.target.dataset.evidenceField;
        evidence[key] = key === "relatedRequirementIds"
          ? event.target.value.split(",").map((item) => item.trim()).filter(Boolean)
          : event.target.value;
      });
    });
  });

  document.querySelectorAll("[data-delete-evidence]").forEach((button) => {
    button.addEventListener("click", () => {
      if (!window.confirm("Supprimer cette preuve ajoutée dans la session ?")) return;
      updateState((state) => {
        state.evidence = state.evidence.filter((item) => item.id !== button.dataset.deleteEvidence);
      });
    });
  });
}

function renderFindingsView() {
  const domainFilter = document.getElementById("finding-domain-filter");
  domainFilter.innerHTML = `<option value="all">Tous les domaines</option>${DOMAIN_METADATA.map((domain) => `
    <option value="${domain.id}" ${appState.ui.findingFilters.domain === domain.id ? "selected" : ""}>${domain.label}</option>
  `).join("")}`;

  document.getElementById("finding-severity-filter").value = appState.ui.findingFilters.severity;
  document.getElementById("finding-status-filter").value = appState.ui.findingFilters.status;

  const findings = appState.findings.filter((finding) => {
    if (appState.ui.findingFilters.severity !== "all" && finding.severity !== appState.ui.findingFilters.severity) return false;
    if (appState.ui.findingFilters.domain !== "all" && finding.domainId !== appState.ui.findingFilters.domain) return false;
    if (appState.ui.findingFilters.status !== "all" && finding.status !== appState.ui.findingFilters.status) return false;
    return true;
  });

  const container = document.getElementById("findings-list");
  if (!findings.length) {
    container.innerHTML = '<div class="empty-state">Aucun finding ne correspond aux filtres sélectionnés.</div>';
    return;
  }

  container.innerHTML = findings.map((finding) => findingCard(finding)).join("");
  bindFindingEvents();
}

function findingCard(finding) {
  return `
    <article class="finding-card" data-finding-id="${finding.id}">
      <div class="finding-head">
        <div>
          <h4>${finding.id} — ${finding.title}</h4>
          <p>${finding.observation}</p>
        </div>
        <span class="severity-pill ${finding.severity}">${finding.severityLabel}</span>
      </div>
      <div class="data-grid">
        <div class="info-tile"><strong>Exigence</strong><br>${finding.requirementId}</div>
        <div class="info-tile"><strong>Domaine</strong><br>${DOMAINS_BY_ID[finding.domainId]?.label || finding.domainId}</div>
        <div class="info-tile"><strong>Niveau de preuve</strong><br>${finding.evidenceLevel}</div>
        <div class="info-tile"><strong>Déclencheurs</strong><br>${finding.triggerSummary.join(" · ")}</div>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Cause probable</span>
          <textarea rows="3" data-finding-field="probableCause" data-finding-id="${finding.id}">${finding.probableCause}</textarea>
        </label>
        <label class="field">
          <span>Recommendation</span>
          <textarea rows="3" data-finding-field="recommendation" data-finding-id="${finding.id}">${finding.recommendation}</textarea>
        </label>
        <label class="field">
          <span>Owner</span>
          <input type="text" data-finding-field="suggestedOwner" data-finding-id="${finding.id}" value="${finding.suggestedOwner}">
        </label>
        <label class="field">
          <span>Date cible</span>
          <input type="date" data-finding-field="dueDate" data-finding-id="${finding.id}" value="${finding.dueDate || ""}">
        </label>
        <label class="field">
          <span>Statut</span>
          <select data-finding-field="status" data-finding-id="${finding.id}">
            ${[
              ["open", "Ouvert"],
              ["inProgress", "En cours"],
              ["pending", "En attente"],
              ["readyForReview", "Prêt pour revue"],
              ["closed", "Clos"]
            ].map(([value, label]) => `<option value="${value}" ${finding.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label class="field">
          <span>Critères de clôture</span>
          <input type="text" data-finding-field="closureCriteria" data-finding-id="${finding.id}" value="${finding.closureCriteria.join(" | ")}">
        </label>
      </div>
    </article>
  `;
}

function bindFindingEvents() {
  document.querySelectorAll("[data-finding-field]").forEach((field) => {
    field.addEventListener("change", (event) => {
      updateState((state) => {
        const finding = state.findings.find((item) => item.id === event.target.dataset.findingId);
        if (!finding) return;
        const key = event.target.dataset.findingField;
        finding[key] = key === "closureCriteria"
          ? event.target.value.split("|").map((item) => item.trim()).filter(Boolean)
          : event.target.value;
      });
    });
  });
}

function renderRemediationView(derived) {
  const timelineNode = document.getElementById("remediation-timeline");
  const tableNode = document.getElementById("remediation-table");

  if (!appState.actions.length) {
    timelineNode.innerHTML = '<div class="empty-state">Aucune action de remédiation n’est générée pour le moment.</div>';
    tableNode.innerHTML = "";
    return;
  }

  timelineNode.innerHTML = `
    <div class="timeline-grid">
      ${derived.groupedActions.map((group) => `
        <article class="timeline-column">
          <h4>${group.label}</h4>
          <ul>
            ${group.items.map((item) => `<li><strong>${item.title}</strong><br>${item.owner}</li>`).join("") || "<li>Aucune action</li>"}
          </ul>
        </article>
      `).join("")}
    </div>
  `;

  tableNode.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Action</th>
            <th>Owner</th>
            <th>Priorité</th>
            <th>Horizon</th>
            <th>Effort</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${appState.actions.map((action) => `
            <tr>
              <td>${action.title}</td>
              <td>${action.owner}</td>
              <td>${action.priority}</td>
              <td>${action.horizon}</td>
              <td>${action.effort}</td>
              <td>${action.status}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderReportView(derived) {
  const domainRows = Object.values(derived.domainScores).map((domain) => ({
    ...domain,
    label: DOMAINS_BY_ID[domain.domainId]?.label || domain.domainId
  }));

  document.getElementById("report-content").innerHTML = buildReportHtml({
    state: appState,
    portfolio: derived.portfolio,
    domainRows,
    findings: appState.findings,
    actions: appState.actions,
    summaryText: derived.summary.text,
    strengths: derived.summary.strengths,
    exposures: derived.summary.exposures,
    entityTypeLabel: labelForEntityType(appState.organization.entityType),
    objectiveLabel: labelForObjective(appState.organization.objective)
  });
}

function renderApp() {
  const derived = getDerivedData();
  activateRoute(appState.ui.route);
  renderOrganizationForm();
  renderScenarioControls();
  renderOrganizationSummary(derived);
  renderExecutiveMetrics(derived);
  renderExecutiveSummary(derived);
  renderHeatmap(derived);
  renderCalculationExplainer();
  renderQuestionCard(derived);
  renderRequirementsView(derived);
  renderEvidenceView();
  renderFindingsView();
  renderRemediationView(derived);
  renderReportView(derived);

  if (appState.metadata.corruptionRecovered) {
    document.getElementById("assessment-feedback").textContent = "Les données locales n’ont pas pu être relues correctement. Une nouvelle session a été initialisée.";
  }
}

function navigateTo(route) {
  updateState((state) => {
    state.ui.route = route;
  });
  setRoute(route);
}

function loadScenario(scenarioId) {
  const scenario = DEMO_SCENARIOS.find((item) => item.id === scenarioId);
  if (!scenario) return;

  const nextState = createDefaultState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
  nextState.organization = {
    ...nextState.organization,
    ...scenario.organization
  };
  nextState.assessment = hydrateAssessment(normalizeScenarioResponses(scenario.responses, REGULATORY_REQUIREMENTS), REGULATORY_REQUIREMENTS);
  nextState.evidence = clone(DEMO_EVIDENCE);
  nextState.metadata.scenarioId = scenario.id;
  nextState.metadata.scenarioName = scenario.name;
  nextState.metadata.resumeAvailable = true;
  nextState.ui.route = "assessment";
  setState(nextState);
  setRoute("assessment");
  document.getElementById("assessment-feedback").textContent = `Scénario chargé : ${scenario.name}. Vous pouvez ajuster librement les réponses et les preuves.`;
}

function bindStaticEvents() {
  document.querySelectorAll("[data-route]").forEach((button) => {
    button.addEventListener("click", () => {
      appState.ui.route = button.dataset.route;
      saveState(appState);
      activateRoute(appState.ui.route);
      setRoute(appState.ui.route);
    });
  });

  window.addEventListener("hashchange", () => {
    const route = getRoute();
    if (!route) return;
    appState.ui.route = route;
    saveState(appState);
    activateRoute(route);
  });

  const syncOrganizationField = (event) => {
    updateState((state) => {
      const key = event.target.id.replace("org-", "");
      const mapping = {
        name: "name",
        "entity-type": "entityType",
        sector: "sector",
        size: "size",
        "group-structure": "groupStructure",
        geography: "geography",
        "critical-functions": "criticalFunctions",
        "initial-maturity": "initialMaturity",
        objective: "objective"
      };
      const property = mapping[key];
      if (property) state.organization[property] = event.target.value;
    });
  };

  document.getElementById("organization-form").addEventListener("input", syncOrganizationField);
  document.getElementById("organization-form").addEventListener("change", syncOrganizationField);

  document.getElementById("scenario-select").addEventListener("change", (event) => {
    const scenario = DEMO_SCENARIOS.find((item) => item.id === event.target.value);
    document.getElementById("scenario-description").textContent = scenario?.description || "";
  });

  document.getElementById("load-demo-scenario").addEventListener("click", () => {
    loadScenario(document.getElementById("scenario-select").value);
  });

  document.getElementById("resume-evaluation").addEventListener("click", () => {
    appState = loadState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
    syncDerivedArtifacts();
    renderApp();
    document.getElementById("assessment-feedback").textContent = "Évaluation locale rechargée.";
  });

  document.getElementById("reset-evaluation").addEventListener("click", () => {
    if (!window.confirm("Réinitialiser l’évaluation et supprimer les données locales de cette session ?")) return;
    clearState();
    appState = createDefaultState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
    syncDerivedArtifacts();
    renderApp();
    document.getElementById("assessment-feedback").textContent = "Évaluation réinitialisée.";
  });

  document.getElementById("requirements-exposure-filter").addEventListener("change", (event) => updateFilter("requirementsFilters", "exposure", event.target.value));
  document.getElementById("requirements-evidence-filter").addEventListener("change", (event) => updateFilter("requirementsFilters", "evidence", event.target.value));
  document.getElementById("requirements-criticality-filter").addEventListener("change", (event) => updateFilter("requirementsFilters", "criticality", event.target.value));
  document.getElementById("requirements-status-filter").addEventListener("change", (event) => updateFilter("requirementsFilters", "status", event.target.value));
  document.getElementById("requirements-search").addEventListener("input", (event) => updateFilter("requirementsFilters", "search", event.target.value));
  document.getElementById("requirements-domain-filter").addEventListener("change", (event) => updateFilter("requirementsFilters", "domain", event.target.value));

  document.getElementById("evidence-status-filter").addEventListener("change", (event) => updateFilter("evidenceFilters", "status", event.target.value));
  document.getElementById("evidence-search").addEventListener("input", (event) => updateFilter("evidenceFilters", "search", event.target.value));
  document.getElementById("finding-severity-filter").addEventListener("change", (event) => updateFilter("findingFilters", "severity", event.target.value));
  document.getElementById("finding-domain-filter").addEventListener("change", (event) => updateFilter("findingFilters", "domain", event.target.value));
  document.getElementById("finding-status-filter").addEventListener("change", (event) => updateFilter("findingFilters", "status", event.target.value));

  document.getElementById("evidence-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const relatedRequirementIds = Array.from(document.getElementById("evidence-related-requirements").selectedOptions).map((option) => option.value);
    const fileInput = document.getElementById("evidence-file");
    const nextId = `EVD-${String(appState.evidence.length + 1).padStart(3, "0")}`;

    updateState((state) => {
      state.evidence.push({
        id: nextId,
        title: document.getElementById("evidence-title").value,
        evidenceType: document.getElementById("evidence-type").value,
        owner: document.getElementById("evidence-owner").value,
        documentDate: document.getElementById("evidence-date").value,
        reviewDate: document.getElementById("evidence-review-date").value,
        status: document.getElementById("evidence-status").value,
        freshness: "current",
        version: "1.0",
        description: document.getElementById("evidence-description").value,
        relatedRequirementIds,
        source: "session",
        fileName: fileInput.files?.[0]?.name || null
      });
    });

    event.target.reset();
  });

  document.getElementById("export-pdf").addEventListener("click", () => {
    navigateTo("report");
    window.print();
  });
}

function updateFilter(filterGroup, key, value) {
  updateState((state) => {
    state.ui[filterGroup][key] = value;
  });
}

function initialize() {
  syncDerivedArtifacts();
  appState.ui.route = getRoute();
  bindStaticEvents();
  renderApp();
}

initialize();
