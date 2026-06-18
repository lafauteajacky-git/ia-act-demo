export const DOMAIN_METADATA = [
  { id: "applicability", label: "Applicabilité et proportionnalité", shortLabel: "Applicabilité" },
  { id: "governance", label: "Gouvernance et gestion du risque TIC", shortLabel: "Gouvernance" },
  { id: "incidents", label: "Gestion et notification des incidents TIC", shortLabel: "Incidents TIC" },
  { id: "third-party", label: "Gestion du risque lié aux tiers TIC", shortLabel: "Tiers TIC" },
  { id: "testing", label: "Tests de résilience opérationnelle numérique", shortLabel: "Tests" },
  { id: "threat-sharing", label: "Partage d’informations sur les cybermenaces", shortLabel: "Partage" },
  { id: "documentation", label: "Documentation, preuves et préparation au contrôle", shortLabel: "Preuves" }
];

function requirement({
  id,
  domainId,
  subdomain,
  title,
  description,
  criticality,
  expectedControls,
  expectedEvidence,
  applicability = { organizationTypes: ["all"] }
}) {
  return {
    id,
    domainId,
    subdomain,
    title,
    description,
    regulation: "Règlement (UE) 2022/2554",
    articleRefs: ["Référence réglementaire à valider"],
    level2Refs: [],
    criticality,
    expectedControls,
    expectedEvidence,
    applicability
  };
}

export const REGULATORY_REQUIREMENTS = [
  requirement({
    id: "APP-01",
    domainId: "applicability",
    subdomain: "Périmètre",
    title: "Qualification du périmètre DORA",
    description: "L’organisation formalise le périmètre retenu, les entités couvertes et les exclusions éventuelles.",
    criticality: 4,
    expectedControls: ["Périmètre documenté", "Entités couvertes identifiées", "Exclusions justifiées"],
    expectedEvidence: ["Note de cadrage", "Cartographie des entités", "Matrice de périmètre"]
  }),
  requirement({
    id: "APP-02",
    domainId: "applicability",
    subdomain: "Proportionnalité",
    title: "Prise en compte des principes de proportionnalité",
    description: "L’organisation explicite la manière dont la taille, le profil de risque et la complexité influencent le dispositif.",
    criticality: 3,
    expectedControls: ["Critères de proportionnalité", "Hypothèses de calibration", "Revue périodique"],
    expectedEvidence: ["Note méthodologique", "Critères de segmentation", "Support de gouvernance"]
  }),
  requirement({
    id: "APP-03",
    domainId: "applicability",
    subdomain: "Fonctions critiques",
    title: "Identification des fonctions critiques ou importantes",
    description: "Les fonctions critiques ou importantes et leurs dépendances TIC sont identifiées et tenues à jour.",
    criticality: 5,
    expectedControls: ["Inventaire des fonctions critiques", "Lien avec les actifs TIC", "Mise à jour périodique"],
    expectedEvidence: ["Inventaire des fonctions critiques", "Cartographie des dépendances", "Compte rendu de revue"]
  }),
  requirement({
    id: "APP-04",
    domainId: "applicability",
    subdomain: "Objectif de contrôle",
    title: "Préparation à la revue interne ou au contrôle",
    description: "L’organisation structure les attendus documentaires et les responsabilités de réponse en cas de revue.",
    criticality: 3,
    expectedControls: ["Plan de préparation", "Responsables identifiés", "Kit documentaire disponible"],
    expectedEvidence: ["Checklist de contrôle", "RACI de réponse", "Référentiel documentaire"]
  }),
  requirement({
    id: "GOV-01",
    domainId: "governance",
    subdomain: "Organe de direction",
    title: "Supervision du cadre de gestion du risque TIC",
    description: "L’organisation définit et formalise les responsabilités de gouvernance relatives au risque TIC.",
    criticality: 5,
    expectedControls: ["Responsabilités formalisées", "Approbation du cadre", "Revue périodique", "Reporting à l’organe de direction"],
    expectedEvidence: ["Politique de gestion du risque TIC", "Procès-verbal d’approbation", "Support de comité", "Matrice de responsabilités"]
  }),
  requirement({
    id: "GOV-02",
    domainId: "governance",
    subdomain: "Politiques",
    title: "Cadre documentaire de gestion du risque TIC",
    description: "Les politiques et standards TIC sont cohérents, accessibles et mis à jour.",
    criticality: 4,
    expectedControls: ["Corpus documentaire complet", "Versioning maîtrisé", "Validation périodique"],
    expectedEvidence: ["Corpus documentaire", "Registre des versions", "Planning de revue"]
  }),
  requirement({
    id: "GOV-03",
    domainId: "governance",
    subdomain: "Rôles et responsabilités",
    title: "Matrice de responsabilités sur la résilience numérique",
    description: "Les rôles entre risques, sécurité, résilience, architecture, achats et métiers sont clarifiés.",
    criticality: 4,
    expectedControls: ["RACI formalisée", "Interfaces documentées", "Escalade définie"],
    expectedEvidence: ["Matrice RACI", "Schéma de gouvernance", "Comptes rendus de coordination"]
  }),
  requirement({
    id: "GOV-04",
    domainId: "governance",
    subdomain: "Appétence au risque",
    title: "Pilotage du risque TIC par indicateurs",
    description: "Les indicateurs clés et seuils d’alerte relatifs au risque TIC sont définis et suivis.",
    criticality: 4,
    expectedControls: ["KRI définis", "Seuils d’alerte", "Suivi périodique"],
    expectedEvidence: ["Tableau de bord risque TIC", "Historique des indicateurs", "Support de comité"]
  }),
  requirement({
    id: "GOV-05",
    domainId: "governance",
    subdomain: "Changements",
    title: "Intégration du risque TIC dans les transformations",
    description: "Les projets et changements majeurs prennent en compte les exigences de résilience numérique.",
    criticality: 3,
    expectedControls: ["Critères de revue", "Validation risques", "Suivi des impacts"],
    expectedEvidence: ["Checklists projet", "Comptes rendus CAB", "Avis risque"]
  }),
  requirement({
    id: "GOV-06",
    domainId: "governance",
    subdomain: "Compétences",
    title: "Compétences et sensibilisation des parties prenantes",
    description: "Les acteurs clés disposent d’un niveau de compréhension adapté sur les responsabilités DORA.",
    criticality: 3,
    expectedControls: ["Plan de sensibilisation", "Publics cibles", "Suivi des sessions"],
    expectedEvidence: ["Plan de formation", "Feuilles de présence", "Supports de sensibilisation"]
  }),
  requirement({
    id: "GOV-07",
    domainId: "governance",
    subdomain: "Contrôles",
    title: "Programme de contrôle du dispositif TIC",
    description: "Les contrôles de niveau 1 et de niveau 2 relatifs au risque TIC sont définis et tracés.",
    criticality: 4,
    expectedControls: ["Plan de contrôle", "Exécution tracée", "Suivi des anomalies"],
    expectedEvidence: ["Plan de contrôle", "Fiches de contrôle", "Registre des anomalies"]
  }),
  requirement({
    id: "GOV-08",
    domainId: "governance",
    subdomain: "Reporting",
    title: "Reporting périodique à la direction",
    description: "Le dispositif prévoit un reporting consolidé, lisible et actionnable à destination de la direction.",
    criticality: 4,
    expectedControls: ["Format de reporting", "Périodicité", "Décisions tracées"],
    expectedEvidence: ["Supports de comité", "Décisions formalisées", "Journal de suivi"]
  }),
  requirement({
    id: "INC-01",
    domainId: "incidents",
    subdomain: "Détection",
    title: "Dispositif de détection des incidents TIC",
    description: "Les événements et incidents TIC sont détectés selon des mécanismes cohérents et supervisés.",
    criticality: 5,
    expectedControls: ["Sources de détection identifiées", "Surveillance structurée", "Escalade définie"],
    expectedEvidence: ["Procédure de surveillance", "Catalogue des alertes", "Journal d’astreinte"]
  }),
  requirement({
    id: "INC-02",
    domainId: "incidents",
    subdomain: "Classification",
    title: "Classification et qualification des incidents",
    description: "Les incidents sont classifiés selon des critères connus, cohérents et documentés.",
    criticality: 5,
    expectedControls: ["Critères de classification", "Rôles de qualification", "Traçabilité des décisions"],
    expectedEvidence: ["Procédure incidents", "Grille de classification", "Journal de décision"]
  }),
  requirement({
    id: "INC-03",
    domainId: "incidents",
    subdomain: "Notification",
    title: "Préparation aux notifications réglementaires",
    description: "Les éléments attendus pour une notification réglementaire sont structurés et testés.",
    criticality: 4,
    expectedControls: ["Processus de notification", "Points de contact", "Critères d’activation"],
    expectedEvidence: ["Mode opératoire de notification", "Liste de contacts", "Exercice de notification"]
  }),
  requirement({
    id: "INC-04",
    domainId: "incidents",
    subdomain: "Coordination de crise",
    title: "Coordination des incidents majeurs et de crise",
    description: "Les rôles, circuits d’escalade et décisions de gestion de crise sont encadrés et tracés.",
    criticality: 5,
    expectedControls: ["Escalade de crise", "Rôles de coordination", "Journal de crise"],
    expectedEvidence: ["Plan de crise", "Journal de crise", "Comptes rendus d’exercice"]
  }),
  requirement({
    id: "INC-05",
    domainId: "incidents",
    subdomain: "Retour d’expérience",
    title: "Capitalisation et actions post-incident",
    description: "Les incidents donnent lieu à un retour d’expérience et à des actions suivies jusqu’à clôture.",
    criticality: 4,
    expectedControls: ["RETEX formalisé", "Plan d’actions", "Suivi de clôture"],
    expectedEvidence: ["Comptes rendus RETEX", "Registre d’actions", "Validation de clôture"]
  }),
  requirement({
    id: "INC-06",
    domainId: "incidents",
    subdomain: "Traçabilité",
    title: "Traçabilité de bout en bout des incidents",
    description: "Les événements, décisions et remédiations sont enregistrés de manière exploitable.",
    criticality: 4,
    expectedControls: ["Journal centralisé", "Horodatage", "Conservation maîtrisée"],
    expectedEvidence: ["Outil de ticketing", "Exports d’incidents", "Journal des décisions"]
  }),
  requirement({
    id: "TPR-01",
    domainId: "third-party",
    subdomain: "Registre",
    title: "Registre des prestataires TIC",
    description: "L’organisation dispose d’une information complète, à jour et exploitable sur ses prestataires TIC.",
    criticality: 5,
    expectedControls: ["Registre consolidé", "Attributs minimaux", "Propriétaire désigné"],
    expectedEvidence: ["Registre des tiers TIC", "Mode opératoire de mise à jour", "Contrôle de complétude"]
  }),
  requirement({
    id: "TPR-02",
    domainId: "third-party",
    subdomain: "Dépendances",
    title: "Identification des dépendances critiques",
    description: "Les dépendances critiques, concentrations et points uniques de défaillance sont identifiés.",
    criticality: 5,
    expectedControls: ["Cartographie des dépendances", "Analyse de concentration", "Seuils d’alerte"],
    expectedEvidence: ["Cartographie de dépendances", "Analyse de concentration", "Comité tiers critiques"]
  }),
  requirement({
    id: "TPR-03",
    domainId: "third-party",
    subdomain: "Due diligence",
    title: "Évaluation préalable des prestataires TIC",
    description: "Une due diligence adaptée est menée avant contractualisation ou renouvellement.",
    criticality: 4,
    expectedControls: ["Critères d’évaluation", "Validation préalable", "Traçabilité des décisions"],
    expectedEvidence: ["Questionnaires de due diligence", "Avis risques", "Dossier d’homologation"]
  }),
  requirement({
    id: "TPR-04",
    domainId: "third-party",
    subdomain: "Clauses contractuelles",
    title: "Couverture contractuelle des exigences essentielles",
    description: "Les contrats couvrent les exigences clés de sécurité, audit, continuité, notification et sortie.",
    criticality: 5,
    expectedControls: ["Clauses standard", "Revue juridique", "Écarts documentés"],
    expectedEvidence: ["Modèle de clause contractuelle", "Matrice de conformité contractuelle", "Avis juridique"]
  }),
  requirement({
    id: "TPR-05",
    domainId: "third-party",
    subdomain: "Surveillance",
    title: "Surveillance continue des prestataires critiques",
    description: "Les prestataires critiques font l’objet d’un suivi régulier, structuré et documenté.",
    criticality: 4,
    expectedControls: ["Revue périodique", "Indicateurs de suivi", "Escalade des incidents"],
    expectedEvidence: ["Tableau de bord fournisseurs", "Comptes rendus de revue", "Journal d’escalade"]
  }),
  requirement({
    id: "TPR-06",
    domainId: "third-party",
    subdomain: "Sous-traitance en chaîne",
    title: "Visibilité sur la sous-traitance des prestataires TIC",
    description: "Les mécanismes de sous-traitance et leurs impacts sont identifiés et suivis.",
    criticality: 4,
    expectedControls: ["Clauses sur la sous-traitance", "Notification des changements", "Revue des impacts"],
    expectedEvidence: ["Registre des sous-traitants", "Clauses contractuelles", "Avis de changement"]
  }),
  requirement({
    id: "TPR-07",
    domainId: "third-party",
    subdomain: "Stratégie de sortie",
    title: "Préparation des stratégies de sortie",
    description: "Les stratégies de sortie et de substitution sont définies pour les prestataires les plus sensibles.",
    criticality: 5,
    expectedControls: ["Plans de sortie", "Critères de déclenchement", "Tests ou revues"],
    expectedEvidence: ["Plans de sortie", "Analyse de réversibilité", "Compte rendu de revue"]
  }),
  requirement({
    id: "TST-01",
    domainId: "testing",
    subdomain: "Programme",
    title: "Programme de tests de résilience",
    description: "Le programme de tests couvre les scénarios, actifs et fonctions sensibles de manière planifiée.",
    criticality: 5,
    expectedControls: ["Programme annuel", "Périmètre défini", "Validation du programme"],
    expectedEvidence: ["Plan annuel de tests", "Calendrier", "Validation de gouvernance"]
  }),
  requirement({
    id: "TST-02",
    domainId: "testing",
    subdomain: "Couverture",
    title: "Couverture des actifs et fonctions critiques",
    description: "Les tests sont reliés aux actifs et fonctions critiques ou importantes.",
    criticality: 5,
    expectedControls: ["Lien avec les fonctions critiques", "Traçabilité du périmètre", "Revue de couverture"],
    expectedEvidence: ["Matrice de couverture", "Cartographie des actifs", "Compte rendu de revue"]
  }),
  requirement({
    id: "TST-03",
    domainId: "testing",
    subdomain: "Scénarios",
    title: "Réalisation d’exercices réalistes",
    description: "Les exercices couvrent des scénarios crédibles, transverses et exploitables en retour d’expérience.",
    criticality: 4,
    expectedControls: ["Scénarios réalistes", "Participation transverse", "RETEX"],
    expectedEvidence: ["Scénarios d’exercice", "Comptes rendus", "RETEX"]
  }),
  requirement({
    id: "TST-04",
    domainId: "testing",
    subdomain: "Suivi",
    title: "Suivi des plans de remédiation issus des tests",
    description: "Les résultats des tests donnent lieu à des actions, suivies jusqu’à clôture.",
    criticality: 4,
    expectedControls: ["Plan d’actions", "Owner désigné", "Critères de clôture"],
    expectedEvidence: ["Registre des remédiations", "Décisions de clôture", "Tableau de suivi"]
  }),
  requirement({
    id: "TST-05",
    domainId: "testing",
    subdomain: "Fréquence",
    title: "Fréquence et calendrier des tests",
    description: "Les tests sont réalisés selon une fréquence adaptée et documentée.",
    criticality: 3,
    expectedControls: ["Fréquence définie", "Dérogations documentées", "Suivi des retards"],
    expectedEvidence: ["Calendrier des tests", "Compte rendu de pilotage", "Justificatifs de dérogation"]
  }),
  requirement({
    id: "TST-06",
    domainId: "testing",
    subdomain: "Indépendance",
    title: "Revue de la qualité et de l’indépendance des tests",
    description: "Les tests les plus sensibles font l’objet d’un regard indépendant ou d’une revue renforcée.",
    criticality: 3,
    expectedControls: ["Critères d’indépendance", "Revue qualité", "Validation des résultats"],
    expectedEvidence: ["Compte rendu de revue", "Plan de test validé", "Avis indépendant"]
  }),
  requirement({
    id: "CTI-01",
    domainId: "threat-sharing",
    subdomain: "Partage d’informations",
    title: "Cadre de partage d’informations sur les cybermenaces",
    description: "Le partage d’informations sur les cybermenaces est encadré, utile et cohérent avec le profil de risque.",
    criticality: 2,
    expectedControls: ["Cadre défini", "Canaux identifiés", "Périmètre maîtrisé"],
    expectedEvidence: ["Note de cadrage", "Adhésions à des cercles de partage", "Compte rendu de veille"]
  }),
  requirement({
    id: "CTI-02",
    domainId: "threat-sharing",
    subdomain: "Exploitation",
    title: "Exploitation des informations de menace",
    description: "Les informations partagées sur les menaces sont exploitées dans les dispositifs de veille et de défense.",
    criticality: 2,
    expectedControls: ["Intégration à la veille", "Actions déclenchées", "Traçabilité"],
    expectedEvidence: ["Comptes rendus de veille", "Règles de détection", "Journal d’actions"]
  }),
  requirement({
    id: "DOC-01",
    domainId: "documentation",
    subdomain: "Référentiel",
    title: "Référentiel documentaire de démonstration",
    description: "L’organisation sait produire rapidement les pièces structurantes attendues lors d’une revue ou d’un contrôle.",
    criticality: 4,
    expectedControls: ["Référentiel structuré", "Indexation", "Responsables de mise à jour"],
    expectedEvidence: ["Référentiel documentaire", "Index des pièces", "RACI documentaire"]
  }),
  requirement({
    id: "DOC-02",
    domainId: "documentation",
    subdomain: "Fraîcheur des preuves",
    title: "Fraîcheur et qualité des éléments de preuve",
    description: "Les preuves sont datées, exploitables et suffisamment récentes pour soutenir une revue.",
    criticality: 4,
    expectedControls: ["Cycle de revue", "Dates de validité", "Contrôle de fraîcheur"],
    expectedEvidence: ["Registre des preuves", "Dates de revue", "Journal de vérification"]
  }),
  requirement({
    id: "DOC-03",
    domainId: "documentation",
    subdomain: "Auditabilité",
    title: "Traçabilité des décisions et des remédiations",
    description: "Les décisions, exceptions et remédiations sont traçables avec un historique exploitable.",
    criticality: 4,
    expectedControls: ["Historique des décisions", "Journal des exceptions", "Critères de clôture"],
    expectedEvidence: ["Registre des décisions", "Journal des exceptions", "Registre des actions"]
  })
];
