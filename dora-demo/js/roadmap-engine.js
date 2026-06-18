import { ACTION_HORIZON_LABELS } from "../config/scoring-config.js";

function priorityFromSeverity(severity) {
  if (severity === "critical") return "high";
  if (severity === "high") return "high";
  if (severity === "medium") return "medium";
  return "low";
}

function effortFromSeverity(severity) {
  if (severity === "critical") return "high";
  if (severity === "high") return "medium";
  return "medium";
}

export function buildActionsFromFindings(findings) {
  return findings.map((finding, index) => ({
    id: `ACT-${String(index + 1).padStart(3, "0")}`,
    findingId: finding.id,
    title: `Renforcer ${finding.title.replace(" insuffisamment démontré", "").toLowerCase()}`,
    description: finding.recommendation,
    owner: finding.suggestedOwner,
    priority: priorityFromSeverity(finding.severity),
    horizon: finding.targetHorizon,
    effort: effortFromSeverity(finding.severity),
    status: "notStarted",
    dependencies: [],
    deliverables: [
      "Mesures documentées",
      "Responsabilités confirmées",
      "Preuves à jour"
    ],
    closureCriteria: finding.closureCriteria
  }));
}

export function groupActionsByHorizon(actions) {
  const grouped = {
    "0-30": [],
    "31-90": [],
    "91-180": [],
    "180+": []
  };

  for (const action of actions) {
    if (!grouped[action.horizon]) grouped[action.horizon] = [];
    grouped[action.horizon].push(action);
  }

  return Object.entries(grouped).map(([horizon, items]) => ({
    horizon,
    label: ACTION_HORIZON_LABELS[horizon],
    items
  }));
}
