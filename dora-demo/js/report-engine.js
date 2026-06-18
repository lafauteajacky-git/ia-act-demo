function safe(value, fallback = "—") {
  return value || fallback;
}

function list(items) {
  if (!items || !items.length) return "<p>—</p>";
  return `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>`;
}

export function buildReportHtml({ state, portfolio, domainRows, findings, actions, summaryText, strengths, exposures, entityTypeLabel, objectiveLabel }) {
  if (portfolio.indicativeMaturity == null) {
    return '<div class="empty-state">Chargez ou réalisez une évaluation pour générer le rapport.</div>';
  }

  return `
    <div class="report-cover">
      <p class="eyebrow">Auria Advisory</p>
      <h2>Restitution DORA</h2>
      <p>Évaluation indicative du niveau de maîtrise et de la capacité à démontrer l’effectivité du dispositif.</p>
      <div class="report-meta-grid">
        <div><strong>Organisation</strong><br>${safe(state.organization.name, "Non renseignée")}</div>
        <div><strong>Type d’entité</strong><br>${safe(entityTypeLabel)}</div>
        <div><strong>Objectif</strong><br>${safe(objectiveLabel)}</div>
        <div><strong>Date de génération</strong><br>${new Date().toLocaleDateString("fr-FR")}</div>
      </div>
    </div>
    <section class="report-section">
      <h3>Avertissement méthodologique</h3>
      <p>Cette restitution présente une lecture indicative de la maturité DORA, de la couverture des exigences analysées, de l’effectivité opérationnelle, de la qualité des preuves et de l’exposition résiduelle. Elle ne constitue ni une certification de conformité ni une validation réglementaire formelle.</p>
    </section>
    <section class="report-section">
      <h3>Synthèse dirigeant</h3>
      <p>${summaryText}</p>
    </section>
    <section class="report-section">
      <h3>Indicateurs clés</h3>
      <div class="report-meta-grid">
        <div><strong>Indice indicatif de maturité</strong><br>${portfolio.indicativeMaturity} / 100</div>
        <div><strong>Taux de couverture</strong><br>${portfolio.coverageRate} %</div>
        <div><strong>Niveau d’effectivité moyen</strong><br>${portfolio.effectivenessRate} %</div>
        <div><strong>Niveau de preuve</strong><br>${portfolio.evidenceRate} %</div>
        <div><strong>Exposition résiduelle</strong><br>${portfolio.residualExposure} %</div>
        <div><strong>Findings critiques / élevés</strong><br>${findings.filter((finding) => finding.severity === "critical" || finding.severity === "high").length}</div>
      </div>
    </section>
    <section class="report-section">
      <h3>Résultats par domaine</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>Domaine</th>
            <th>Maturité</th>
            <th>Couverture</th>
            <th>Effectivité</th>
            <th>Preuve</th>
            <th>Exposition</th>
          </tr>
        </thead>
        <tbody>
          ${domainRows.map((row) => `
            <tr>
              <td>${row.label}</td>
              <td>${row.maturityScore ?? "—"}</td>
              <td>${row.coverage ?? "—"} %</td>
              <td>${row.effectiveness ?? "—"} %</td>
              <td>${row.evidence ?? "—"} %</td>
              <td>${row.exposure ?? "—"} %</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
    <section class="report-section">
      <h3>Principales expositions</h3>
      ${list(exposures)}
    </section>
    <section class="report-section">
      <h3>Points de maîtrise</h3>
      ${list(strengths)}
    </section>
    <section class="report-section">
      <h3>Findings critiques et élevés</h3>
      ${findings.filter((finding) => finding.severity === "critical" || finding.severity === "high").map((finding) => `
        <div class="report-finding">
          <h4>${finding.title}</h4>
          <p><strong>Observation :</strong> ${finding.observation}</p>
          <p><strong>Impact :</strong> ${finding.impactRisk}</p>
          <p><strong>Recommandation :</strong> ${finding.recommendation}</p>
        </div>
      `).join("") || "<p>Aucun finding critique ou élevé.</p>"}
    </section>
    <section class="report-section">
      <h3>Plan de remédiation</h3>
      <table class="report-table">
        <thead>
          <tr>
            <th>Action</th>
            <th>Owner</th>
            <th>Priorité</th>
            <th>Horizon</th>
          </tr>
        </thead>
        <tbody>
          ${actions.map((action) => `
            <tr>
              <td>${action.title}</td>
              <td>${action.owner}</td>
              <td>${action.priority}</td>
              <td>${action.horizon}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </section>
  `;
}
