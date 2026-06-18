(function () {
  const MAIN_LEVEL_OPTIONS = [
    { id: "notAssessed", label: "Non évalué", value: null },
    { id: "notInPlace", label: "Non en place", value: 0 },
    { id: "initiated", label: "Initialisé", value: 0.25 },
    { id: "partiallyOperational", label: "Partiellement opérationnel", value: 0.5 },
    { id: "operational", label: "Opérationnel", value: 0.75 },
    { id: "controlledAndTested", label: "Maîtrisé et régulièrement testé", value: 1 }
  ];

  const MAIN_LEVEL_DEFAULTS = {
    notAssessed: { coverage: null, design: null, effectiveness: null, evidence: null },
    notInPlace: { coverage: 0, design: 0, effectiveness: 0, evidence: 0 },
    initiated: { coverage: 0.25, design: 0.25, effectiveness: 0, evidence: 0.25 },
    partiallyOperational: { coverage: 0.5, design: 0.5, effectiveness: 0.25, evidence: 0.5 },
    operational: { coverage: 0.75, design: 0.75, effectiveness: 0.75, evidence: 0.75 },
    controlledAndTested: { coverage: 1, design: 1, effectiveness: 1, evidence: 1 }
  };

  const DIMENSION_OPTIONS = {
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

  const SCORING_WEIGHTS = { coverage: 0.2, design: 0.25, effectiveness: 0.35, evidence: 0.2 };
  const EXPOSURE_WEIGHTS = { effectivenessGap: 0.45, coverageGap: 0.25, designGap: 0.15, evidenceGap: 0.15 };
  const EXPOSURE_LEVELS = {
    controlled: { min: 0, max: 24, label: "Exposition maîtrisée" },
    moderate: { min: 25, max: 49, label: "Exposition modérée" },
    high: { min: 50, max: 74, label: "Exposition élevée" },
    critical: { min: 75, max: 100, label: "Exposition critique" }
  };
  const MATURITY_LEVELS = [
    { min: 0, max: 24, label: "Initiale" },
    { min: 25, max: 49, label: "Partielle" },
    { min: 50, max: 74, label: "Intermédiaire" },
    { min: 75, max: 100, label: "Avancée" }
  ];
  const SEVERITY_ORDER = ["low", "medium", "high", "critical"];
  const SEVERITY_LABELS = { critical: "Critique", high: "Élevée", medium: "Modérée", low: "Faible" };
  const ACTION_HORIZONS = { critical: "0-30", high: "31-90", medium: "91-180", low: "180+" };
  const ACTION_HORIZON_LABELS = {
    "0-30": "0 à 30 jours — Sécurisation immédiate",
    "31-90": "31 à 90 jours — Mise sous contrôle",
    "91-180": "91 à 180 jours — Industrialisation",
    "180+": "Au-delà de 180 jours — Amélioration continue"
  };

  const DOMAIN_METADATA = [
    { id: "applicability", label: "Applicabilité et proportionnalité", shortLabel: "Applicabilité" },
    { id: "governance", label: "Gouvernance et gestion du risque TIC", shortLabel: "Gouvernance" },
    { id: "incidents", label: "Gestion et notification des incidents TIC", shortLabel: "Incidents TIC" },
    { id: "third-party", label: "Gestion du risque lié aux tiers TIC", shortLabel: "Tiers TIC" },
    { id: "testing", label: "Tests de résilience opérationnelle numérique", shortLabel: "Tests" },
    { id: "threat-sharing", label: "Partage d’informations sur les cybermenaces", shortLabel: "Partage" },
    { id: "documentation", label: "Documentation, preuves et préparation au contrôle", shortLabel: "Preuves" }
  ];

  function requirement(config) {
    return {
      id: config.id,
      domainId: config.domainId,
      subdomain: config.subdomain,
      title: config.title,
      description: config.description,
      regulation: "Règlement (UE) 2022/2554",
      articleRefs: ["Référence réglementaire à valider"],
      level2Refs: [],
      criticality: config.criticality,
      expectedControls: config.expectedControls,
      expectedEvidence: config.expectedEvidence,
      applicability: config.applicability || { organizationTypes: ["all"] }
    };
  }

  const REGULATORY_REQUIREMENTS = [
    requirement({ id: "APP-01", domainId: "applicability", subdomain: "Périmètre", title: "Qualification du périmètre DORA", description: "L’organisation formalise le périmètre retenu, les entités couvertes et les exclusions éventuelles.", criticality: 4, expectedControls: ["Périmètre documenté", "Entités couvertes identifiées", "Exclusions justifiées"], expectedEvidence: ["Note de cadrage", "Cartographie des entités", "Matrice de périmètre"] }),
    requirement({ id: "APP-02", domainId: "applicability", subdomain: "Proportionnalité", title: "Prise en compte des principes de proportionnalité", description: "L’organisation explicite la manière dont la taille, le profil de risque et la complexité influencent le dispositif.", criticality: 3, expectedControls: ["Critères de proportionnalité", "Hypothèses de calibration", "Revue périodique"], expectedEvidence: ["Note méthodologique", "Critères de segmentation", "Support de gouvernance"] }),
    requirement({ id: "APP-03", domainId: "applicability", subdomain: "Fonctions critiques", title: "Identification des fonctions critiques ou importantes", description: "Les fonctions critiques ou importantes et leurs dépendances TIC sont identifiées et tenues à jour.", criticality: 5, expectedControls: ["Inventaire des fonctions critiques", "Lien avec les actifs TIC", "Mise à jour périodique"], expectedEvidence: ["Inventaire des fonctions critiques", "Cartographie des dépendances", "Compte rendu de revue"] }),
    requirement({ id: "APP-04", domainId: "applicability", subdomain: "Objectif de contrôle", title: "Préparation à la revue interne ou au contrôle", description: "L’organisation structure les attendus documentaires et les responsabilités de réponse en cas de revue.", criticality: 3, expectedControls: ["Plan de préparation", "Responsables identifiés", "Kit documentaire disponible"], expectedEvidence: ["Checklist de contrôle", "RACI de réponse", "Référentiel documentaire"] }),
    requirement({ id: "GOV-01", domainId: "governance", subdomain: "Organe de direction", title: "Supervision du cadre de gestion du risque TIC", description: "L’organisation définit et formalise les responsabilités de gouvernance relatives au risque TIC.", criticality: 5, expectedControls: ["Responsabilités formalisées", "Approbation du cadre", "Revue périodique", "Reporting à l’organe de direction"], expectedEvidence: ["Politique de gestion du risque TIC", "Procès-verbal d’approbation", "Support de comité", "Matrice de responsabilités"] }),
    requirement({ id: "GOV-02", domainId: "governance", subdomain: "Politiques", title: "Cadre documentaire de gestion du risque TIC", description: "Les politiques et standards TIC sont cohérents, accessibles et mis à jour.", criticality: 4, expectedControls: ["Corpus documentaire complet", "Versioning maîtrisé", "Validation périodique"], expectedEvidence: ["Corpus documentaire", "Registre des versions", "Planning de revue"] }),
    requirement({ id: "GOV-03", domainId: "governance", subdomain: "Rôles et responsabilités", title: "Matrice de responsabilités sur la résilience numérique", description: "Les rôles entre risques, sécurité, résilience, architecture, achats et métiers sont clarifiés.", criticality: 4, expectedControls: ["RACI formalisée", "Interfaces documentées", "Escalade définie"], expectedEvidence: ["Matrice RACI", "Schéma de gouvernance", "Comptes rendus de coordination"] }),
    requirement({ id: "GOV-04", domainId: "governance", subdomain: "Appétence au risque", title: "Pilotage du risque TIC par indicateurs", description: "Les indicateurs clés et seuils d’alerte relatifs au risque TIC sont définis et suivis.", criticality: 4, expectedControls: ["KRI définis", "Seuils d’alerte", "Suivi périodique"], expectedEvidence: ["Tableau de bord risque TIC", "Historique des indicateurs", "Support de comité"] }),
    requirement({ id: "GOV-05", domainId: "governance", subdomain: "Changements", title: "Intégration du risque TIC dans les transformations", description: "Les projets et changements majeurs prennent en compte les exigences de résilience numérique.", criticality: 3, expectedControls: ["Critères de revue", "Validation risques", "Suivi des impacts"], expectedEvidence: ["Checklists projet", "Comptes rendus CAB", "Avis risque"] }),
    requirement({ id: "GOV-06", domainId: "governance", subdomain: "Compétences", title: "Compétences et sensibilisation des parties prenantes", description: "Les acteurs clés disposent d’un niveau de compréhension adapté sur les responsabilités DORA.", criticality: 3, expectedControls: ["Plan de sensibilisation", "Publics cibles", "Suivi des sessions"], expectedEvidence: ["Plan de formation", "Feuilles de présence", "Supports de sensibilisation"] }),
    requirement({ id: "GOV-07", domainId: "governance", subdomain: "Contrôles", title: "Programme de contrôle du dispositif TIC", description: "Les contrôles de niveau 1 et de niveau 2 relatifs au risque TIC sont définis et tracés.", criticality: 4, expectedControls: ["Plan de contrôle", "Exécution tracée", "Suivi des anomalies"], expectedEvidence: ["Plan de contrôle", "Fiches de contrôle", "Registre des anomalies"] }),
    requirement({ id: "GOV-08", domainId: "governance", subdomain: "Reporting", title: "Reporting périodique à la direction", description: "Le dispositif prévoit un reporting consolidé, lisible et actionnable à destination de la direction.", criticality: 4, expectedControls: ["Format de reporting", "Périodicité", "Décisions tracées"], expectedEvidence: ["Supports de comité", "Décisions formalisées", "Journal de suivi"] }),
    requirement({ id: "INC-01", domainId: "incidents", subdomain: "Détection", title: "Dispositif de détection des incidents TIC", description: "Les événements et incidents TIC sont détectés selon des mécanismes cohérents et supervisés.", criticality: 5, expectedControls: ["Sources de détection identifiées", "Surveillance structurée", "Escalade définie"], expectedEvidence: ["Procédure de surveillance", "Catalogue des alertes", "Journal d’astreinte"] }),
    requirement({ id: "INC-02", domainId: "incidents", subdomain: "Classification", title: "Classification et qualification des incidents", description: "Les incidents sont classifiés selon des critères connus, cohérents et documentés.", criticality: 5, expectedControls: ["Critères de classification", "Rôles de qualification", "Traçabilité des décisions"], expectedEvidence: ["Procédure incidents", "Grille de classification", "Journal de décision"] }),
    requirement({ id: "INC-03", domainId: "incidents", subdomain: "Notification", title: "Préparation aux notifications réglementaires", description: "Les éléments attendus pour une notification réglementaire sont structurés et testés.", criticality: 4, expectedControls: ["Processus de notification", "Points de contact", "Critères d’activation"], expectedEvidence: ["Mode opératoire de notification", "Liste de contacts", "Exercice de notification"] }),
    requirement({ id: "INC-04", domainId: "incidents", subdomain: "Coordination de crise", title: "Coordination des incidents majeurs et de crise", description: "Les rôles, circuits d’escalade et décisions de gestion de crise sont encadrés et tracés.", criticality: 5, expectedControls: ["Escalade de crise", "Rôles de coordination", "Journal de crise"], expectedEvidence: ["Plan de crise", "Journal de crise", "Comptes rendus d’exercice"] }),
    requirement({ id: "INC-05", domainId: "incidents", subdomain: "Retour d’expérience", title: "Capitalisation et actions post-incident", description: "Les incidents donnent lieu à un retour d’expérience et à des actions suivies jusqu’à clôture.", criticality: 4, expectedControls: ["RETEX formalisé", "Plan d’actions", "Suivi de clôture"], expectedEvidence: ["Comptes rendus RETEX", "Registre d’actions", "Validation de clôture"] }),
    requirement({ id: "INC-06", domainId: "incidents", subdomain: "Traçabilité", title: "Traçabilité de bout en bout des incidents", description: "Les événements, décisions et remédiations sont enregistrés de manière exploitable.", criticality: 4, expectedControls: ["Journal centralisé", "Horodatage", "Conservation maîtrisée"], expectedEvidence: ["Outil de ticketing", "Exports d’incidents", "Journal des décisions"] }),
    requirement({ id: "TPR-01", domainId: "third-party", subdomain: "Registre", title: "Registre des prestataires TIC", description: "L’organisation dispose d’une information complète, à jour et exploitable sur ses prestataires TIC.", criticality: 5, expectedControls: ["Registre consolidé", "Attributs minimaux", "Propriétaire désigné"], expectedEvidence: ["Registre des tiers TIC", "Mode opératoire de mise à jour", "Contrôle de complétude"] }),
    requirement({ id: "TPR-02", domainId: "third-party", subdomain: "Dépendances", title: "Identification des dépendances critiques", description: "Les dépendances critiques, concentrations et points uniques de défaillance sont identifiés.", criticality: 5, expectedControls: ["Cartographie des dépendances", "Analyse de concentration", "Seuils d’alerte"], expectedEvidence: ["Cartographie de dépendances", "Analyse de concentration", "Comité tiers critiques"] }),
    requirement({ id: "TPR-03", domainId: "third-party", subdomain: "Due diligence", title: "Évaluation préalable des prestataires TIC", description: "Une due diligence adaptée est menée avant contractualisation ou renouvellement.", criticality: 4, expectedControls: ["Critères d’évaluation", "Validation préalable", "Traçabilité des décisions"], expectedEvidence: ["Questionnaires de due diligence", "Avis risques", "Dossier d’homologation"] }),
    requirement({ id: "TPR-04", domainId: "third-party", subdomain: "Clauses contractuelles", title: "Couverture contractuelle des exigences essentielles", description: "Les contrats couvrent les exigences clés de sécurité, audit, continuité, notification et sortie.", criticality: 5, expectedControls: ["Clauses standard", "Revue juridique", "Écarts documentés"], expectedEvidence: ["Modèle de clause contractuelle", "Matrice de conformité contractuelle", "Avis juridique"] }),
    requirement({ id: "TPR-05", domainId: "third-party", subdomain: "Surveillance", title: "Surveillance continue des prestataires critiques", description: "Les prestataires critiques font l’objet d’un suivi régulier, structuré et documenté.", criticality: 4, expectedControls: ["Revue périodique", "Indicateurs de suivi", "Escalade des incidents"], expectedEvidence: ["Tableau de bord fournisseurs", "Comptes rendus de revue", "Journal d’escalade"] }),
    requirement({ id: "TPR-06", domainId: "third-party", subdomain: "Sous-traitance en chaîne", title: "Visibilité sur la sous-traitance des prestataires TIC", description: "Les mécanismes de sous-traitance et leurs impacts sont identifiés et suivis.", criticality: 4, expectedControls: ["Clauses sur la sous-traitance", "Notification des changements", "Revue des impacts"], expectedEvidence: ["Registre des sous-traitants", "Clauses contractuelles", "Avis de changement"] }),
    requirement({ id: "TPR-07", domainId: "third-party", subdomain: "Stratégie de sortie", title: "Préparation des stratégies de sortie", description: "Les stratégies de sortie et de substitution sont définies pour les prestataires les plus sensibles.", criticality: 5, expectedControls: ["Plans de sortie", "Critères de déclenchement", "Tests ou revues"], expectedEvidence: ["Plans de sortie", "Analyse de réversibilité", "Compte rendu de revue"] }),
    requirement({ id: "TST-01", domainId: "testing", subdomain: "Programme", title: "Programme de tests de résilience", description: "Le programme de tests couvre les scénarios, actifs et fonctions sensibles de manière planifiée.", criticality: 5, expectedControls: ["Programme annuel", "Périmètre défini", "Validation du programme"], expectedEvidence: ["Plan annuel de tests", "Calendrier", "Validation de gouvernance"] }),
    requirement({ id: "TST-02", domainId: "testing", subdomain: "Couverture", title: "Couverture des actifs et fonctions critiques", description: "Les tests sont reliés aux actifs et fonctions critiques ou importantes.", criticality: 5, expectedControls: ["Lien avec les fonctions critiques", "Traçabilité du périmètre", "Revue de couverture"], expectedEvidence: ["Matrice de couverture", "Cartographie des actifs", "Compte rendu de revue"] }),
    requirement({ id: "TST-03", domainId: "testing", subdomain: "Scénarios", title: "Réalisation d’exercices réalistes", description: "Les exercices couvrent des scénarios crédibles, transverses et exploitables en retour d’expérience.", criticality: 4, expectedControls: ["Scénarios réalistes", "Participation transverse", "RETEX"], expectedEvidence: ["Scénarios d’exercice", "Comptes rendus", "RETEX"] }),
    requirement({ id: "TST-04", domainId: "testing", subdomain: "Suivi", title: "Suivi des plans de remédiation issus des tests", description: "Les résultats des tests donnent lieu à des actions, suivies jusqu’à clôture.", criticality: 4, expectedControls: ["Plan d’actions", "Owner désigné", "Critères de clôture"], expectedEvidence: ["Registre des remédiations", "Décisions de clôture", "Tableau de suivi"] }),
    requirement({ id: "TST-05", domainId: "testing", subdomain: "Fréquence", title: "Fréquence et calendrier des tests", description: "Les tests sont réalisés selon une fréquence adaptée et documentée.", criticality: 3, expectedControls: ["Fréquence définie", "Dérogations documentées", "Suivi des retards"], expectedEvidence: ["Calendrier des tests", "Compte rendu de pilotage", "Justificatifs de dérogation"] }),
    requirement({ id: "TST-06", domainId: "testing", subdomain: "Indépendance", title: "Revue de la qualité et de l’indépendance des tests", description: "Les tests les plus sensibles font l’objet d’un regard indépendant ou d’une revue renforcée.", criticality: 3, expectedControls: ["Critères d’indépendance", "Revue qualité", "Validation des résultats"], expectedEvidence: ["Compte rendu de revue", "Plan de test validé", "Avis indépendant"] }),
    requirement({ id: "CTI-01", domainId: "threat-sharing", subdomain: "Partage d’informations", title: "Cadre de partage d’informations sur les cybermenaces", description: "Le partage d’informations sur les cybermenaces est encadré, utile et cohérent avec le profil de risque.", criticality: 2, expectedControls: ["Cadre défini", "Canaux identifiés", "Périmètre maîtrisé"], expectedEvidence: ["Note de cadrage", "Adhésions à des cercles de partage", "Compte rendu de veille"] }),
    requirement({ id: "CTI-02", domainId: "threat-sharing", subdomain: "Exploitation", title: "Exploitation des informations de menace", description: "Les informations partagées sur les menaces sont exploitées dans les dispositifs de veille et de défense.", criticality: 2, expectedControls: ["Intégration à la veille", "Actions déclenchées", "Traçabilité"], expectedEvidence: ["Comptes rendus de veille", "Règles de détection", "Journal d’actions"] }),
    requirement({ id: "DOC-01", domainId: "documentation", subdomain: "Référentiel", title: "Référentiel documentaire de démonstration", description: "L’organisation sait produire rapidement les pièces structurantes attendues lors d’une revue ou d’un contrôle.", criticality: 4, expectedControls: ["Référentiel structuré", "Indexation", "Responsables de mise à jour"], expectedEvidence: ["Référentiel documentaire", "Index des pièces", "RACI documentaire"] }),
    requirement({ id: "DOC-02", domainId: "documentation", subdomain: "Fraîcheur des preuves", title: "Fraîcheur et qualité des éléments de preuve", description: "Les preuves sont datées, exploitables et suffisamment récentes pour soutenir une revue.", criticality: 4, expectedControls: ["Cycle de revue", "Dates de validité", "Contrôle de fraîcheur"], expectedEvidence: ["Registre des preuves", "Dates de revue", "Journal de vérification"] }),
    requirement({ id: "DOC-03", domainId: "documentation", subdomain: "Auditabilité", title: "Traçabilité des décisions et des remédiations", description: "Les décisions, exceptions et remédiations sont traçables avec un historique exploitable.", criticality: 4, expectedControls: ["Historique des décisions", "Journal des exceptions", "Critères de clôture"], expectedEvidence: ["Registre des décisions", "Journal des exceptions", "Registre des actions"] })
  ];

  const ASSESSMENT_QUESTIONS = REGULATORY_REQUIREMENTS.map(function (requirementItem, index) {
    return {
      id: requirementItem.id,
      requirementId: requirementItem.id,
      domainId: requirementItem.domainId,
      order: index + 1,
      prompt: "Dans quelle mesure " + requirementItem.description.charAt(0).toLowerCase() + requirementItem.description.slice(1),
      guidance: "Exigence analysée : " + requirementItem.title + ". Appréciez la couverture, la qualité de conception, l’effectivité et le niveau de preuve disponibles.",
      expectedEvidence: requirementItem.expectedEvidence,
      expectedControls: requirementItem.expectedControls
    };
  });

  const DEMO_EVIDENCE = [
    { id: "EVD-001", title: "Politique de gestion du risque TIC", evidenceType: "Politique", owner: "Direction des risques", documentDate: "2026-01-15", reviewDate: "2027-01-15", status: "verified", freshness: "current", version: "3.2", description: "Politique approuvée par l’organe de direction.", relatedRequirementIds: ["GOV-01", "GOV-02", "DOC-01"], source: "demo", fileName: null },
    { id: "EVD-002", title: "Matrice RACI de résilience numérique", evidenceType: "Gouvernance", owner: "Secrétariat de gouvernance", documentDate: "2025-11-10", reviewDate: "2026-11-10", status: "verified", freshness: "current", version: "2.0", description: "Répartition des responsabilités entre risques, sécurité, architecture et achats.", relatedRequirementIds: ["GOV-03", "GOV-08"], source: "demo", fileName: null },
    { id: "EVD-003", title: "Procédure de gestion des incidents TIC", evidenceType: "Procédure", owner: "CISO", documentDate: "2025-09-01", reviewDate: "2026-09-01", status: "available", freshness: "current", version: "4.1", description: "Procédure décrivant la détection, l’escalade et la gestion des incidents.", relatedRequirementIds: ["INC-01", "INC-02", "INC-04"], source: "demo", fileName: null },
    { id: "EVD-004", title: "Compte rendu d’exercice de crise", evidenceType: "Compte rendu", owner: "Résilience opérationnelle", documentDate: "2024-10-20", reviewDate: "2025-10-20", status: "obsolete", freshness: "outdated", version: "1.4", description: "Exercice de crise annuel avec plan d’actions partiellement clos.", relatedRequirementIds: ["INC-04", "INC-05", "TST-03"], source: "demo", fileName: null },
    { id: "EVD-005", title: "Registre des tiers TIC", evidenceType: "Registre", owner: "Responsable du risque tiers TIC", documentDate: "2026-02-28", reviewDate: "2026-06-30", status: "review", freshness: "current", version: "6.8", description: "Registre partiellement réconcilié avec les données achats et contrats.", relatedRequirementIds: ["TPR-01", "TPR-02", "TPR-05"], source: "demo", fileName: null },
    { id: "EVD-006", title: "Modèle de clause contractuelle DORA", evidenceType: "Contractuel", owner: "Juridique achats", documentDate: "2025-03-15", reviewDate: "2026-03-15", status: "available", freshness: "current", version: "1.9", description: "Clauses types incluant audit, continuité, sécurité et notification.", relatedRequirementIds: ["TPR-04", "TPR-06"], source: "demo", fileName: null },
    { id: "EVD-007", title: "Plan annuel de tests de résilience", evidenceType: "Plan", owner: "Résilience opérationnelle", documentDate: "2026-01-08", reviewDate: "2026-12-31", status: "available", freshness: "current", version: "2.3", description: "Plan de tests avec couverture partielle des fonctions critiques.", relatedRequirementIds: ["TST-01", "TST-02", "TST-05"], source: "demo", fileName: null },
    { id: "EVD-008", title: "Compte rendu du comité des risques", evidenceType: "Comité", owner: "Direction des risques", documentDate: "2026-03-30", reviewDate: "2026-09-30", status: "verified", freshness: "current", version: "1.0", description: "Support consolidé présentant les indicateurs TIC et décisions associées.", relatedRequirementIds: ["GOV-04", "GOV-08"], source: "demo", fileName: null },
    { id: "EVD-009", title: "Plan de continuité des services critiques", evidenceType: "Continuité", owner: "Continuité d’activité", documentDate: "2025-12-12", reviewDate: "2026-12-12", status: "available", freshness: "current", version: "5.0", description: "Plan de continuité couvrant les principaux services et dépendances.", relatedRequirementIds: ["APP-03", "TST-02", "TPR-07"], source: "demo", fileName: null },
    { id: "EVD-010", title: "Registre des actions de remédiation", evidenceType: "Suivi", owner: "PMO conformité", documentDate: "2026-02-10", reviewDate: "2026-08-10", status: "review", freshness: "current", version: "3.1", description: "Registre présentant des critères de clôture hétérogènes selon les domaines.", relatedRequirementIds: ["INC-05", "TST-04", "DOC-03"], source: "demo", fileName: null }
  ];

  const baseByDomain = { applicability: "operational", governance: "operational", incidents: "operational", "third-party": "operational", testing: "operational", "threat-sharing": "initiated", documentation: "operational" };
  const retailBankOverrides = { "APP-04": "partiallyOperational", "GOV-07": "partiallyOperational", "INC-02": "partiallyOperational", "INC-03": "initiated", "INC-06": "initiated", "TPR-01": "partiallyOperational", "TPR-02": "initiated", "TPR-04": "notInPlace", "TPR-05": "partiallyOperational", "TPR-06": "initiated", "TPR-07": "initiated", "TST-02": "partiallyOperational", "TST-03": "initiated", "TST-04": "partiallyOperational", "DOC-02": "initiated", "DOC-03": "partiallyOperational" };
  const retailBankEvidenceLinks = { "APP-03": ["EVD-009"], "GOV-01": ["EVD-001"], "GOV-03": ["EVD-002"], "GOV-04": ["EVD-008"], "GOV-08": ["EVD-008"], "INC-01": ["EVD-003"], "INC-02": ["EVD-003"], "INC-04": ["EVD-003", "EVD-004"], "INC-05": ["EVD-004", "EVD-010"], "TPR-01": ["EVD-005"], "TPR-04": ["EVD-006"], "TPR-05": ["EVD-005"], "TPR-07": ["EVD-009"], "TST-01": ["EVD-007"], "TST-02": ["EVD-007", "EVD-009"], "TST-03": ["EVD-004"], "TST-04": ["EVD-010"], "DOC-01": ["EVD-001"], "DOC-02": ["EVD-004", "EVD-005"], "DOC-03": ["EVD-010"] };
  const advancedInsuranceBase = { applicability: "controlledAndTested", governance: "controlledAndTested", incidents: "controlledAndTested", "third-party": "operational", testing: "operational", "threat-sharing": "operational", documentation: "controlledAndTested" };
  const advancedInsuranceOverrides = { "TPR-02": "partiallyOperational", "TPR-06": "partiallyOperational", "TPR-07": "partiallyOperational", "TST-03": "controlledAndTested", "TST-04": "controlledAndTested", "CTI-01": "controlledAndTested", "CTI-02": "partiallyOperational" };
  const advancedInsuranceEvidenceLinks = { "APP-01": ["EVD-001"], "APP-03": ["EVD-009"], "APP-04": ["EVD-001"], "GOV-01": ["EVD-001"], "GOV-02": ["EVD-001"], "GOV-03": ["EVD-002"], "GOV-04": ["EVD-008"], "GOV-07": ["EVD-008"], "GOV-08": ["EVD-008"], "INC-01": ["EVD-003"], "INC-02": ["EVD-003"], "INC-03": ["EVD-003"], "INC-04": ["EVD-003", "EVD-004"], "INC-05": ["EVD-004", "EVD-010"], "INC-06": ["EVD-003", "EVD-010"], "TPR-01": ["EVD-005"], "TPR-02": ["EVD-005", "EVD-009"], "TPR-04": ["EVD-006"], "TPR-05": ["EVD-005"], "TPR-06": ["EVD-006"], "TPR-07": ["EVD-009"], "TST-01": ["EVD-007"], "TST-02": ["EVD-007", "EVD-009"], "TST-03": ["EVD-004", "EVD-007"], "TST-04": ["EVD-010"], "TST-05": ["EVD-007"], "DOC-01": ["EVD-001"], "DOC-02": ["EVD-005", "EVD-008"], "DOC-03": ["EVD-010"] };
  const lowMaturityBase = { applicability: "initiated", governance: "initiated", incidents: "notInPlace", "third-party": "notInPlace", testing: "notInPlace", "threat-sharing": "notAssessed", documentation: "initiated" };
  const lowMaturityOverrides = { "APP-03": "partiallyOperational", "GOV-01": "partiallyOperational", "GOV-02": "initiated", "GOV-03": "initiated", "INC-01": "initiated", "INC-02": "notInPlace", "INC-04": "initiated", "TPR-01": "initiated", "TPR-04": "notInPlace", "TST-01": "initiated", "DOC-01": "partiallyOperational", "DOC-02": "initiated", "DOC-03": "initiated" };
  const lowMaturityEvidenceLinks = { "GOV-01": ["EVD-001"], "INC-01": ["EVD-003"], "TPR-01": ["EVD-005"], "TST-01": ["EVD-007"], "DOC-01": ["EVD-001"] };

  function buildResponses(overrides, evidenceLinks, baseLevels) {
    const responses = {};
    REGULATORY_REQUIREMENTS.forEach(function (requirementItem) {
      responses[requirementItem.id] = {
        mainLevel: overrides[requirementItem.id] || (baseLevels || baseByDomain)[requirementItem.domainId] || "notAssessed",
        comment: "",
        evidenceIds: evidenceLinks[requirementItem.id] || []
      };
    });
    return responses;
  }

  const DEMO_SCENARIOS = [{
    id: "retail-bank-intermediate",
    name: "Banque de détail — Maturité intermédiaire",
    description: "Établissement financier disposant d’un cadre DORA formalisé, mais présentant encore des écarts sur la qualité du registre des tiers TIC, l’industrialisation des tests de résilience et la traçabilité des incidents.",
    organization: { name: "Banque Horizon", entityType: "retailBank", sector: "Banque de détail", size: "grande", groupStructure: "groupe", geography: "France et Union européenne", criticalFunctions: "oui", initialMaturity: "intermédiaire", objective: "remediationPlan" },
    responses: buildResponses(retailBankOverrides, retailBankEvidenceLinks),
    scenarioLabel: "Banque de détail — Maturité intermédiaire"
  }, {
    id: "insurance-advanced",
    name: "Assureur de place — Maturité élevée",
    description: "Entreprise d’assurance disposant d’un dispositif DORA largement industrialisé, avec une gouvernance solide, des preuves récentes et quelques points d’attention résiduels sur certaines dépendances critiques aux tiers TIC.",
    organization: { name: "Assurances Concorde", entityType: "insuranceCompany", sector: "Assurance", size: "grande", groupStructure: "groupe", geography: "France, Luxembourg et Belgique", criticalFunctions: "oui", initialMaturity: "avancé", objective: "internalReview" },
    responses: buildResponses(advancedInsuranceOverrides, advancedInsuranceEvidenceLinks, advancedInsuranceBase),
    scenarioLabel: "Assureur de place — Maturité élevée"
  }, {
    id: "payment-institution-low",
    name: "Établissement de paiement — Maturité faible",
    description: "Acteur en forte croissance ayant engagé des travaux DORA, mais dont le dispositif reste encore peu structuré sur les incidents, les tiers TIC, les tests et la documentation de preuve.",
    organization: { name: "PayLink Services", entityType: "paymentInstitution", sector: "Paiement", size: "intermédiaire", groupStructure: "autonome", geography: "France", criticalFunctions: "oui", initialMaturity: "initial", objective: "initialDiagnostic" },
    responses: buildResponses(lowMaturityOverrides, lowMaturityEvidenceLinks, lowMaturityBase),
    scenarioLabel: "Établissement de paiement — Maturité faible"
  }];

  const ENTITY_TYPES = [
    { value: "retailBank", label: "Banque de détail" }, { value: "investmentBank", label: "Banque de financement et d’investissement" }, { value: "paymentInstitution", label: "Établissement de paiement" }, { value: "assetManager", label: "Société de gestion" }, { value: "insuranceCompany", label: "Entreprise d’assurance" }, { value: "mutual", label: "Mutuelle" }, { value: "financialGroup", label: "Groupe financier" }, { value: "ictProvider", label: "Prestataire de services TIC" }, { value: "otherFinancialEntity", label: "Autre entité financière" }
  ];
  const OBJECTIVES = [
    { value: "initialDiagnostic", label: "Diagnostic initial" }, { value: "internalReview", label: "Préparation à une revue interne" }, { value: "regulatoryReview", label: "Préparation à un contrôle" }, { value: "remediationPlan", label: "Suivi d’un plan de remédiation" }, { value: "thirdPartyReview", label: "Revue du dispositif de tiers TIC" }, { value: "incidentReview", label: "Revue du dispositif de gestion des incidents" }
  ];

  const REQUIREMENTS_BY_ID = Object.fromEntries(REGULATORY_REQUIREMENTS.map(function (requirementItem) { return [requirementItem.id, requirementItem]; }));
  const DOMAINS_BY_ID = Object.fromEntries(DOMAIN_METADATA.map(function (domain) { return [domain.id, domain]; }));
  const STORAGE_KEY = "auria-dora-demo-state";

  function clone(value) { return JSON.parse(JSON.stringify(value)); }
  function createAssessmentEntry(mainLevel) {
    const level = mainLevel || "notAssessed";
    const defaults = MAIN_LEVEL_DEFAULTS[level] || MAIN_LEVEL_DEFAULTS.notAssessed;
    return { mainLevel: level, coverage: defaults.coverage, design: defaults.design, effectiveness: defaults.effectiveness, evidence: defaults.evidence, comment: "", evidenceIds: [], nonApplicable: false, expertMode: false };
  }
  function applyMainLevel(entry, mainLevel) {
    const defaults = MAIN_LEVEL_DEFAULTS[mainLevel] || MAIN_LEVEL_DEFAULTS.notAssessed;
    return Object.assign({}, entry, { mainLevel: mainLevel, coverage: defaults.coverage, design: defaults.design, effectiveness: defaults.effectiveness, evidence: defaults.evidence });
  }
  function hydrateAssessment(assessment, requirements) {
    const hydrated = {};
    requirements.forEach(function (requirementItem) {
      const existing = assessment ? assessment[requirementItem.id] : null;
      hydrated[requirementItem.id] = existing ? Object.assign({}, createAssessmentEntry(existing.mainLevel || "notAssessed"), existing, { evidenceIds: Array.isArray(existing.evidenceIds) ? existing.evidenceIds : [] }) : createAssessmentEntry();
    });
    return hydrated;
  }
  function normalizeScenarioResponses(scenarioResponses, requirements) {
    const normalized = {};
    requirements.forEach(function (requirementItem) {
      const response = scenarioResponses ? scenarioResponses[requirementItem.id] : null;
      if (!response) {
        normalized[requirementItem.id] = createAssessmentEntry();
        return;
      }
      normalized[requirementItem.id] = Object.assign({}, applyMainLevel(createAssessmentEntry(), response.mainLevel || "notAssessed"), response, { evidenceIds: Array.isArray(response.evidenceIds) ? response.evidenceIds : [] });
    });
    return normalized;
  }
  function getCompletionStats(state, questions) {
    const completed = questions.filter(function (question) {
      const entry = state.assessment[question.requirementId];
      return entry && (entry.nonApplicable || (entry.mainLevel && entry.mainLevel !== "notAssessed"));
    }).length;
    const total = questions.length;
    return { completed: completed, total: total, percentage: total ? Math.round((completed / total) * 100) : 0 };
  }
  function createDefaultState(requirements, demoEvidence) {
    const assessment = {};
    requirements.forEach(function (requirementItem) { assessment[requirementItem.id] = createAssessmentEntry(); });
    return {
      organization: { name: "", entityType: "retailBank", sector: "", size: "non-renseignée", groupStructure: "autonome", geography: "", criticalFunctions: "oui", initialMaturity: "initial", objective: "initialDiagnostic" },
      assessment: assessment,
      evidence: clone(demoEvidence),
      findings: [],
      actions: [],
      ui: { route: "executive", currentQuestionIndex: 0, assessmentFilters: { domain: "all", search: "" }, requirementsFilters: { domain: "all", exposure: "all", evidence: "all", criticality: "all", status: "all", search: "" }, evidenceFilters: { status: "all", search: "" }, findingFilters: { severity: "all", domain: "all", status: "all" } },
      metadata: { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), status: "draft", scenarioId: null, scenarioName: null, resumeAvailable: false, corruptionRecovered: false }
    };
  }
  function saveState(state) {
    const payload = Object.assign({}, state, { metadata: Object.assign({}, state.metadata, { updatedAt: new Date().toISOString(), resumeAvailable: true }) });
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(payload)); } catch (error) {}
    return payload;
  }
  function loadState(requirements, demoEvidence) {
    const fallback = createDefaultState(requirements, demoEvidence);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return {
        organization: Object.assign({}, fallback.organization, parsed.organization || {}),
        assessment: hydrateAssessment(parsed.assessment || {}, requirements),
        evidence: Array.isArray(parsed.evidence) ? parsed.evidence : fallback.evidence,
        findings: Array.isArray(parsed.findings) ? parsed.findings : [],
        actions: Array.isArray(parsed.actions) ? parsed.actions : [],
        ui: {
          route: ((parsed.ui || {}).route) || fallback.ui.route,
          currentQuestionIndex: ((parsed.ui || {}).currentQuestionIndex) || 0,
          assessmentFilters: Object.assign({}, fallback.ui.assessmentFilters, (parsed.ui || {}).assessmentFilters || {}),
          requirementsFilters: Object.assign({}, fallback.ui.requirementsFilters, (parsed.ui || {}).requirementsFilters || {}),
          evidenceFilters: Object.assign({}, fallback.ui.evidenceFilters, (parsed.ui || {}).evidenceFilters || {}),
          findingFilters: Object.assign({}, fallback.ui.findingFilters, (parsed.ui || {}).findingFilters || {})
        },
        metadata: Object.assign({}, fallback.metadata, parsed.metadata || {}, { resumeAvailable: true, corruptionRecovered: false })
      };
    } catch (error) {
      return Object.assign({}, fallback, { metadata: Object.assign({}, fallback.metadata, { corruptionRecovered: true }) });
    }
  }
  function clearState() { try { localStorage.removeItem(STORAGE_KEY); } catch (error) {} }
  function clampScore(value) { return value == null || Number.isNaN(value) ? null : Math.max(0, Math.min(1, Number(value))); }
  function findBand(value, bands) {
    return Object.keys(bands).find(function (key) { return value >= bands[key].min && value <= bands[key].max; }) || null;
  }
  function findMaturityLabel(score) {
    const match = MATURITY_LEVELS.find(function (band) { return score >= band.min && score <= band.max; });
    return match ? match.label : "Non évaluée";
  }
  function buildEvidenceIndex(evidence) {
    const index = {};
    evidence.forEach(function (item) {
      (item.relatedRequirementIds || []).forEach(function (requirementId) {
        if (!index[requirementId]) index[requirementId] = [];
        index[requirementId].push(item);
      });
    });
    return index;
  }
  function evidenceStatusSummary(relatedEvidence) {
    if (!relatedEvidence.length) return { status: "none", label: "Absente" };
    if (relatedEvidence.some(function (item) { return item.status === "obsolete"; })) return { status: "obsolete", label: "Obsolète" };
    if (relatedEvidence.some(function (item) { return item.status === "review"; })) return { status: "review", label: "À revoir" };
    if (relatedEvidence.some(function (item) { return item.status === "verified"; })) return { status: "verified", label: "Vérifiée et récente" };
    if (relatedEvidence.some(function (item) { return item.status === "available"; })) return { status: "documented", label: "Documentée" };
    return { status: "declarative", label: "Déclarative" };
  }
  function scoreRequirement(requirementItem, response, relatedEvidence) {
    if (!response || response.nonApplicable) return { requirementId: requirementItem.id, status: "notApplicable", maturityScore: null, weightedExposure: null, evidenceStatus: { status: "none", label: "Absente" } };
    if (!response.mainLevel || response.mainLevel === "notAssessed") return { requirementId: requirementItem.id, status: "notAssessed", maturityScore: null, weightedExposure: null, evidenceStatus: evidenceStatusSummary(relatedEvidence) };
    const coverage = clampScore(response.coverage);
    const design = clampScore(response.design);
    const effectiveness = clampScore(response.effectiveness);
    const evidence = clampScore(response.evidence);
    const maturityScore = Math.round(100 * (coverage * SCORING_WEIGHTS.coverage + design * SCORING_WEIGHTS.design + effectiveness * SCORING_WEIGHTS.effectiveness + evidence * SCORING_WEIGHTS.evidence));
    const residualExposure = 100 * ((1 - effectiveness) * EXPOSURE_WEIGHTS.effectivenessGap + (1 - coverage) * EXPOSURE_WEIGHTS.coverageGap + (1 - design) * EXPOSURE_WEIGHTS.designGap + (1 - evidence) * EXPOSURE_WEIGHTS.evidenceGap);
    const weightedExposure = Math.max(0, Math.min(100, Math.round(residualExposure * (requirementItem.criticality / 5))));
    const evidenceStatus = evidenceStatusSummary(relatedEvidence);
    const exposureBand = findBand(weightedExposure, EXPOSURE_LEVELS);
    return {
      requirementId: requirementItem.id, status: "evaluated", mainLevel: response.mainLevel, coverage: coverage, design: design, effectiveness: effectiveness, evidence: evidence, maturityScore: maturityScore, maturityLabel: findMaturityLabel(maturityScore),
      residualExposure: Math.round(residualExposure), weightedExposure: weightedExposure, exposureBand: exposureBand, exposureLabel: exposureBand ? EXPOSURE_LEVELS[exposureBand].label : "Exposition à déterminer", criticality: requirementItem.criticality,
      evidenceStatus: evidenceStatus, relatedEvidenceIds: relatedEvidence.map(function (item) { return item.id; }),
      explanation: { mainLevel: (MAIN_LEVEL_OPTIONS.find(function (option) { return option.id === response.mainLevel; }) || {}).label || "Non évalué", weights: SCORING_WEIGHTS, responseValues: { coverage: coverage == null ? null : Math.round(coverage * 100), design: design == null ? null : Math.round(design * 100), effectiveness: effectiveness == null ? null : Math.round(effectiveness * 100), evidence: evidence == null ? null : Math.round(evidence * 100) } }
    };
  }
  function scoreAssessment(requirements, assessment, evidence) {
    const evidenceIndex = buildEvidenceIndex(evidence);
    const scoredRequirements = {};
    requirements.forEach(function (requirementItem) {
      scoredRequirements[requirementItem.id] = scoreRequirement(requirementItem, assessment[requirementItem.id], evidenceIndex[requirementItem.id] || []);
    });
    return { scoredRequirements: scoredRequirements, evidenceIndex: evidenceIndex };
  }
  function aggregateDomainScores(requirements, scoredRequirements) {
    const domainScores = {};
    requirements.forEach(function (requirementItem) {
      const score = scoredRequirements[requirementItem.id];
      if (!domainScores[requirementItem.domainId]) {
        domainScores[requirementItem.domainId] = { domainId: requirementItem.domainId, maturityWeighted: 0, exposureWeighted: 0, coverageWeighted: 0, designWeighted: 0, effectivenessWeighted: 0, evidenceWeighted: 0, criticalityTotal: 0, evaluatedCount: 0, notAssessedCount: 0, notApplicableCount: 0 };
      }
      const bucket = domainScores[requirementItem.domainId];
      if (score.status === "notApplicable") { bucket.notApplicableCount += 1; return; }
      if (score.status !== "evaluated") { bucket.notAssessedCount += 1; return; }
      const weight = requirementItem.criticality;
      bucket.evaluatedCount += 1;
      bucket.criticalityTotal += weight;
      bucket.maturityWeighted += score.maturityScore * weight;
      bucket.exposureWeighted += score.weightedExposure * weight;
      bucket.coverageWeighted += score.coverage * 100 * weight;
      bucket.designWeighted += score.design * 100 * weight;
      bucket.effectivenessWeighted += score.effectiveness * 100 * weight;
      bucket.evidenceWeighted += score.evidence * 100 * weight;
    });
    Object.keys(domainScores).forEach(function (key) {
      const bucket = domainScores[key];
      if (!bucket.criticalityTotal) return;
      bucket.maturityScore = Math.round(bucket.maturityWeighted / bucket.criticalityTotal);
      bucket.exposure = Math.round(bucket.exposureWeighted / bucket.criticalityTotal);
      bucket.coverage = Math.round(bucket.coverageWeighted / bucket.criticalityTotal);
      bucket.design = Math.round(bucket.designWeighted / bucket.criticalityTotal);
      bucket.effectiveness = Math.round(bucket.effectivenessWeighted / bucket.criticalityTotal);
      bucket.evidence = Math.round(bucket.evidenceWeighted / bucket.criticalityTotal);
      bucket.maturityLabel = findMaturityLabel(bucket.maturityScore);
      bucket.exposureBand = findBand(bucket.exposure, EXPOSURE_LEVELS);
      bucket.exposureLabel = bucket.exposureBand ? EXPOSURE_LEVELS[bucket.exposureBand].label : "Exposition à déterminer";
    });
    return domainScores;
  }
  function aggregatePortfolio(domainScores) {
    const domains = Object.values(domainScores).filter(function (domain) { return Number.isFinite(domain.maturityScore); });
    if (!domains.length) return { indicativeMaturity: null, coverageRate: null, effectivenessRate: null, evidenceRate: null, residualExposure: null };
    const totalWeight = domains.reduce(function (sum, domain) { return sum + domain.criticalityTotal; }, 0) || 1;
    const indicativeMaturity = Math.round(domains.reduce(function (sum, domain) { return sum + domain.maturityScore * domain.criticalityTotal; }, 0) / totalWeight);
    const coverageRate = Math.round(domains.reduce(function (sum, domain) { return sum + domain.coverage * domain.criticalityTotal; }, 0) / totalWeight);
    const effectivenessRate = Math.round(domains.reduce(function (sum, domain) { return sum + domain.effectiveness * domain.criticalityTotal; }, 0) / totalWeight);
    const evidenceRate = Math.round(domains.reduce(function (sum, domain) { return sum + domain.evidence * domain.criticalityTotal; }, 0) / totalWeight);
    const residualExposure = Math.round(domains.reduce(function (sum, domain) { return sum + domain.exposure * domain.criticalityTotal; }, 0) / totalWeight);
    const exposureBand = findBand(residualExposure, EXPOSURE_LEVELS);
    return { indicativeMaturity: indicativeMaturity, maturityLabel: findMaturityLabel(indicativeMaturity), coverageRate: coverageRate, effectivenessRate: effectivenessRate, evidenceRate: evidenceRate, residualExposure: residualExposure, exposureBand: exposureBand, exposureLabel: exposureBand ? EXPOSURE_LEVELS[exposureBand].label : "Exposition à déterminer" };
  }
  function severityFromExposure(weightedExposure) {
    if (weightedExposure >= 75) return "critical";
    if (weightedExposure >= 55) return "high";
    if (weightedExposure >= 35) return "medium";
    if (weightedExposure >= 15) return "low";
    return null;
  }
  function maxSeverity(current, next) {
    if (!current) return next;
    if (!next) return current;
    return SEVERITY_ORDER.indexOf(next) > SEVERITY_ORDER.indexOf(current) ? next : current;
  }
  function generateFindings(requirements, scoredRequirements, evidenceIndex) {
    const findings = [];
    let counter = 1;
    requirements.forEach(function (requirementItem) {
      const score = scoredRequirements[requirementItem.id];
      if (!score || score.status !== "evaluated") return;
      const evidenceList = evidenceIndex[requirementItem.id] || [];
      let severity = severityFromExposure(score.weightedExposure);
      const triggers = [];
      if (score.weightedExposure >= 75) triggers.push("Exposition résiduelle critique");
      else if (score.weightedExposure >= 55) triggers.push("Exposition résiduelle élevée");
      else if (score.weightedExposure >= 35) triggers.push("Exposition résiduelle modérée");
      if (requirementItem.criticality === 5 && score.effectiveness <= 0.25) { severity = maxSeverity(severity, "high"); triggers.push("Effectivité insuffisante sur une exigence critique"); }
      if (requirementItem.criticality === 5 && evidenceList.length === 0) { severity = maxSeverity(severity, "medium"); triggers.push("Absence de preuve sur une exigence critique"); }
      if (evidenceList.some(function (item) { return item.status === "obsolete"; })) { severity = maxSeverity(severity, requirementItem.criticality >= 4 ? "high" : "medium"); triggers.push("Présence d’une preuve obsolète"); }
      if (score.coverage <= 0.25 && requirementItem.criticality === 5) { severity = maxSeverity(severity, "high"); triggers.push("Couverture partielle sur un sujet sensible"); }
      if (score.mainLevel === "controlledAndTested" && evidenceList.length === 0) { severity = maxSeverity(severity, "medium"); triggers.push("Réponse positive non appuyée par une preuve"); }
      const shouldCreateFinding = severity === "critical" || severity === "high" || (severity === "medium" && requirementItem.criticality >= 4) || triggers.includes("Absence de preuve sur une exigence critique") || triggers.includes("Présence d’une preuve obsolète") || triggers.includes("Effectivité insuffisante sur une exigence critique");
      if (!severity || !shouldCreateFinding) return;
      findings.push({
        id: "FND-" + String(counter).padStart(3, "0"), requirementId: requirementItem.id, domainId: requirementItem.domainId, title: requirementItem.title + " insuffisamment démontré",
        observation: requirementItem.description + " Les éléments disponibles ne démontrent pas un niveau de maîtrise suffisant au regard des attentes évaluées.",
        expectedCriterion: "L’organisation doit pouvoir démontrer : " + requirementItem.expectedControls.join(", ").toLowerCase() + ".",
        probableCause: "Processus encore partiellement structuré, responsabilités diffuses ou documentation incomplète.",
        impactRisk: "Risque de maîtrise insuffisante sur le domaine " + requirementItem.subdomain.toLowerCase() + ", avec difficulté à démontrer l’effectivité du dispositif en cas de revue ou de contrôle.",
        severity: severity, severityLabel: SEVERITY_LABELS[severity], recommendation: "Renforcer " + requirementItem.title.toLowerCase() + " en documentant et en mettant sous contrôle les éléments suivants : " + requirementItem.expectedControls.slice(0, 3).join(", ").toLowerCase() + ".", suggestedOwner: ({ applicability: "Responsable du dispositif DORA", governance: "Direction des risques", incidents: "CISO", "third-party": "Responsable du risque tiers TIC", testing: "Responsable de la résilience opérationnelle", "threat-sharing": "Responsable cyber", documentation: "PMO conformité" })[requirementItem.domainId] || "Responsable à définir",
        targetHorizon: ACTION_HORIZONS[severity], dueDate: null, closureCriteria: ["Contrôle attendu documenté", "Responsable désigné", "Preuve actualisée disponible", "Validation formalisée"], regulatoryRefs: requirementItem.articleRefs, relatedEvidenceIds: evidenceList.map(function (item) { return item.id; }), status: "open", triggerSummary: triggers, weightedExposure: score.weightedExposure, evidenceLevel: score.evidenceStatus.label
      });
      counter += 1;
    });
    return findings;
  }
  function mergeGeneratedFindings(existingFindings, generatedFindings) {
    const map = Object.fromEntries(existingFindings.map(function (finding) { return [finding.requirementId, finding]; }));
    return generatedFindings.map(function (finding) {
      const existing = map[finding.requirementId];
      if (!existing) return finding;
      return Object.assign({}, finding, {
        probableCause: existing.probableCause || finding.probableCause,
        recommendation: existing.recommendation || finding.recommendation,
        suggestedOwner: existing.suggestedOwner || finding.suggestedOwner,
        dueDate: existing.dueDate || null,
        closureCriteria: Array.isArray(existing.closureCriteria) && existing.closureCriteria.length ? existing.closureCriteria : finding.closureCriteria,
        status: existing.status || finding.status
      });
    });
  }
  function buildActionsFromFindings(findings) {
    return findings.map(function (finding, index) {
      return { id: "ACT-" + String(index + 1).padStart(3, "0"), findingId: finding.id, title: "Renforcer " + finding.title.replace(" insuffisamment démontré", "").toLowerCase(), description: finding.recommendation, owner: finding.suggestedOwner, priority: (finding.severity === "critical" || finding.severity === "high") ? "high" : (finding.severity === "medium" ? "medium" : "low"), horizon: finding.targetHorizon, effort: finding.severity === "critical" ? "high" : "medium", status: "notStarted", dependencies: [], deliverables: ["Mesures documentées", "Responsabilités confirmées", "Preuves à jour"], closureCriteria: finding.closureCriteria };
    });
  }
  function groupActionsByHorizon(actions) {
    const grouped = { "0-30": [], "31-90": [], "91-180": [], "180+": [] };
    actions.forEach(function (action) { (grouped[action.horizon] || grouped["180+"]).push(action); });
    return Object.keys(grouped).map(function (key) { return { horizon: key, label: ACTION_HORIZON_LABELS[key], items: grouped[key] }; });
  }
  function buildReportHtml(payload) {
    if (payload.portfolio.indicativeMaturity == null) return '<div class="empty-state">Chargez ou réalisez une évaluation pour générer le rapport.</div>';
    const safe = function (value, fallback) { return value || (fallback || "—"); };
    const list = function (items) { return items && items.length ? "<ul>" + items.map(function (item) { return "<li>" + item + "</li>"; }).join("") + "</ul>" : "<p>—</p>"; };
    return '<div class="report-cover"><p class="eyebrow">Auria Advisory</p><h2>Restitution DORA</h2><p>Évaluation indicative du niveau de maîtrise et de la capacité à démontrer l’effectivité du dispositif.</p><div class="report-meta-grid"><div><strong>Organisation</strong><br>' + safe(payload.state.organization.name, "Non renseignée") + '</div><div><strong>Type d’entité</strong><br>' + safe(payload.entityTypeLabel) + '</div><div><strong>Objectif</strong><br>' + safe(payload.objectiveLabel) + '</div><div><strong>Date de génération</strong><br>' + new Date().toLocaleDateString("fr-FR") + '</div></div></div>' +
      '<section class="report-section"><h3>Avertissement méthodologique</h3><p>Cette restitution présente une lecture indicative de la maturité DORA, de la couverture des exigences analysées, de l’effectivité opérationnelle, de la qualité des preuves et de l’exposition résiduelle. Elle ne constitue ni une certification de conformité ni une validation réglementaire formelle.</p></section>' +
      '<section class="report-section"><h3>Synthèse dirigeant</h3><p>' + payload.summaryText + '</p></section>' +
      '<section class="report-section"><h3>Indicateurs clés</h3><div class="report-meta-grid"><div><strong>Indice indicatif de maturité</strong><br>' + payload.portfolio.indicativeMaturity + ' / 100</div><div><strong>Taux de couverture</strong><br>' + payload.portfolio.coverageRate + ' %</div><div><strong>Niveau d’effectivité moyen</strong><br>' + payload.portfolio.effectivenessRate + ' %</div><div><strong>Niveau de preuve</strong><br>' + payload.portfolio.evidenceRate + ' %</div><div><strong>Exposition résiduelle</strong><br>' + payload.portfolio.residualExposure + ' %</div><div><strong>Findings critiques / élevés</strong><br>' + payload.findings.filter(function (finding) { return finding.severity === "critical" || finding.severity === "high"; }).length + '</div></div></section>' +
      '<section class="report-section"><h3>Résultats par domaine</h3><table class="report-table"><thead><tr><th>Domaine</th><th>Maturité</th><th>Couverture</th><th>Effectivité</th><th>Preuve</th><th>Exposition</th></tr></thead><tbody>' + payload.domainRows.map(function (row) { return '<tr><td>' + row.label + '</td><td>' + (row.maturityScore == null ? "—" : row.maturityScore) + '</td><td>' + (row.coverage == null ? "—" : row.coverage + " %") + '</td><td>' + (row.effectiveness == null ? "—" : row.effectiveness + " %") + '</td><td>' + (row.evidence == null ? "—" : row.evidence + " %") + '</td><td>' + (row.exposure == null ? "—" : row.exposure + " %") + '</td></tr>'; }).join("") + '</tbody></table></section>' +
      '<section class="report-section"><h3>Principales expositions</h3>' + list(payload.exposures) + '</section>' +
      '<section class="report-section"><h3>Points de maîtrise</h3>' + list(payload.strengths) + '</section>' +
      '<section class="report-section"><h3>Findings critiques et élevés</h3>' + (payload.findings.filter(function (finding) { return finding.severity === "critical" || finding.severity === "high"; }).map(function (finding) { return '<div class="report-finding"><h4>' + finding.title + '</h4><p><strong>Observation :</strong> ' + finding.observation + '</p><p><strong>Impact :</strong> ' + finding.impactRisk + '</p><p><strong>Recommandation :</strong> ' + finding.recommendation + '</p></div>'; }).join("") || "<p>Aucun finding critique ou élevé.</p>") + '</section>' +
      '<section class="report-section"><h3>Plan de remédiation</h3><table class="report-table"><thead><tr><th>Action</th><th>Owner</th><th>Priorité</th><th>Horizon</th></tr></thead><tbody>' + payload.actions.map(function (action) { return '<tr><td>' + action.title + '</td><td>' + action.owner + '</td><td>' + action.priority + '</td><td>' + action.horizon + '</td></tr>'; }).join("") + '</tbody></table></section>';
  }

  const appStateInit = loadState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
  let appState = appStateInit;

  function getRoute() { return window.location.hash.replace("#", "") || "executive"; }
  function activateRoute(route) {
    document.querySelectorAll("[data-view]").forEach(function (section) { section.classList.toggle("is-active", section.dataset.view === route); });
    document.querySelectorAll("[data-route]").forEach(function (button) { button.classList.toggle("is-active", button.dataset.route === route); });
  }
  function labelForEntityType(value) { return (ENTITY_TYPES.find(function (item) { return item.value === value; }) || {}).label || value || "Non renseigné"; }
  function labelForObjective(value) { return (OBJECTIVES.find(function (item) { return item.value === value; }) || {}).label || value || "Non renseigné"; }
  function formatPercent(value) { return value == null ? "—" : value + " %"; }
  function formatDate(value) { return value ? new Date(value).toLocaleDateString("fr-FR") : "—"; }
  function buildSelectOptions(options, selectedValue) { return options.map(function (option) { return '<option value="' + option.value + '"' + (option.value === selectedValue ? " selected" : "") + '>' + option.label + '</option>'; }).join(""); }
  function metricCard(label, value, subvalue) { return '<article class="metric-card"><span class="label">' + label + '</span><span class="value">' + value + '</span><span class="subvalue">' + subvalue + '</span></article>'; }
  function statusLabel(status) { return status === "evaluated" ? "Évaluée" : (status === "notApplicable" ? "Non applicable" : "Non évaluée"); }
  function evidenceStatusLabel(status) { return { declared: "Déclarée", available: "Disponible", review: "À revoir", verified: "Vérifiée", obsolete: "Obsolète" }[status] || "Déclarée"; }

  function syncDerivedArtifacts() {
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, appState.assessment, appState.evidence);
    const generatedFindings = generateFindings(REGULATORY_REQUIREMENTS, scored.scoredRequirements, scored.evidenceIndex);
    appState.findings = mergeGeneratedFindings(appState.findings, generatedFindings);
    appState.actions = buildActionsFromFindings(appState.findings);
    const stats = getCompletionStats(appState, ASSESSMENT_QUESTIONS);
    appState.metadata.status = stats.percentage === 100 && stats.total > 0 ? "finalized" : "draft";
  }
  function getDerivedData() {
    const scored = scoreAssessment(REGULATORY_REQUIREMENTS, appState.assessment, appState.evidence);
    const domainScores = aggregateDomainScores(REGULATORY_REQUIREMENTS, scored.scoredRequirements);
    const portfolio = aggregatePortfolio(domainScores);
    const completion = getCompletionStats(appState, ASSESSMENT_QUESTIONS);
    const groupedActions = groupActionsByHorizon(appState.actions);
    const summary = buildExecutiveSummary(domainScores, portfolio);
    return { scoredRequirements: scored.scoredRequirements, evidenceIndex: scored.evidenceIndex, domainScores: domainScores, portfolio: portfolio, completion: completion, groupedActions: groupedActions, summary: summary };
  }
  function buildExecutiveSummary(domainScores, portfolio) {
    if (portfolio.indicativeMaturity == null) return { text: "Lancez ou chargez une évaluation pour visualiser une synthèse dirigeant structurée.", strengths: [], exposures: [] };
    const domainRows = Object.values(domainScores).filter(function (domain) { return Number.isFinite(domain.maturityScore); });
    const strongest = domainRows.filter(function (domain) { return domain.maturityScore >= 70; }).sort(function (a, b) { return b.maturityScore - a.maturityScore; }).slice(0, 3).map(function (domain) { return (DOMAINS_BY_ID[domain.domainId] || {}).label || domain.domainId; });
    const mostExposed = domainRows.filter(function (domain) { return Number.isFinite(domain.exposure); }).sort(function (a, b) { return b.exposure - a.exposure; }).slice(0, 3).map(function (domain) { return (DOMAINS_BY_ID[domain.domainId] || {}).label || domain.domainId; });
    const evidenceDescriptor = portfolio.evidenceRate >= 70 ? "solide" : (portfolio.evidenceRate >= 45 ? "intermédiaire" : "à renforcer");
    return {
      text: [
        "Le dispositif présente un niveau de maturité " + ((portfolio.maturityLabel || "indicatif").toLowerCase()) + " (" + portfolio.indicativeMaturity + "/100).",
        strongest.length ? "Les principaux points de maîtrise concernent " + strongest.join(", ") + "." : "Aucun point de maîtrise significatif ne ressort encore à ce stade.",
        mostExposed.length ? "Les expositions prioritaires portent sur " + mostExposed.join(", ") + "." : "Aucune exposition prioritaire n’est encore déterminée.",
        portfolio.effectivenessRate != null ? "L’effectivité moyenne ressort à " + portfolio.effectivenessRate + " % et doit être renforcée sur les sujets les plus critiques." : "",
        "Le niveau de preuve est " + evidenceDescriptor + ".",
        appState.actions.length ? "Les actions prioritaires concernent " + appState.actions.slice(0, 3).map(function (action) { return action.title.toLowerCase(); }).join(", ") + "." : "Aucune action de remédiation n’est encore calculée."
      ].filter(Boolean).join(" "),
      strengths: strongest, exposures: mostExposed
    };
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
  function navigateTo(route) {
    updateState(function (state) { state.ui.route = route; });
    window.location.hash = route;
  }
  function setCurrentQuestionByRequirementId(requirementId, route) {
    const index = ASSESSMENT_QUESTIONS.findIndex(function (question) { return question.requirementId === requirementId; });
    updateState(function (state) {
      state.ui.currentQuestionIndex = index >= 0 ? index : 0;
      if (route) state.ui.route = route;
    });
    if (route) window.location.hash = route;
  }
  function getAssessmentQueueItems(derived) {
    const filters = appState.ui.assessmentFilters;
    return ASSESSMENT_QUESTIONS.filter(function (question) {
      const requirementItem = REQUIREMENTS_BY_ID[question.requirementId];
      const haystack = (question.requirementId + " " + requirementItem.title + " " + requirementItem.description + " " + (((DOMAINS_BY_ID[question.domainId] || {}).label) || "")).toLowerCase();
      if (filters.domain !== "all" && question.domainId !== filters.domain) return false;
      if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
      return true;
    }).map(function (question) {
      const requirementItem = REQUIREMENTS_BY_ID[question.requirementId];
      const response = appState.assessment[question.requirementId];
      const score = derived.scoredRequirements[question.requirementId];
      const isCompleted = Boolean(response && (response.nonApplicable || (response.mainLevel && response.mainLevel !== "notAssessed")));
      return { question: question, requirement: requirementItem, score: score, isCompleted: isCompleted, isActive: appState.ui.currentQuestionIndex === question.order - 1 };
    });
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
    scenarioSelect.innerHTML = DEMO_SCENARIOS.map(function (scenario) { return '<option value="' + scenario.id + '"' + (appState.metadata.scenarioId === scenario.id ? " selected" : "") + '>' + scenario.name + '</option>'; }).join("");
    const selected = DEMO_SCENARIOS.find(function (scenario) { return scenario.id === scenarioSelect.value; }) || DEMO_SCENARIOS[0];
    document.getElementById("scenario-description").textContent = selected ? selected.description : "";
    document.getElementById("resume-evaluation").disabled = !appState.metadata.resumeAvailable;
  }
  function renderOrganizationSummary(derived) {
    const container = document.getElementById("organization-summary");
    const statusBadge = document.getElementById("evaluation-status-badge");
    statusBadge.textContent = appState.metadata.status === "finalized" ? "Évaluation finalisée" : "Brouillon";
    if (!appState.organization.name && derived.completion.completed === 0 && !appState.metadata.scenarioName) {
      container.className = "empty-state";
      container.textContent = "Lancez ou chargez une évaluation pour visualiser le profil de l’organisation et le statut du parcours.";
      return;
    }
    container.className = "data-grid";
    container.innerHTML = '<div class="info-tile"><strong>Organisation</strong><br>' + (appState.organization.name || "Non renseignée") + '</div><div class="info-tile"><strong>Type d’entité</strong><br>' + labelForEntityType(appState.organization.entityType) + '</div><div class="info-tile"><strong>Objectif</strong><br>' + labelForObjective(appState.organization.objective) + '</div><div class="info-tile"><strong>Progression</strong><br>' + derived.completion.completed + ' / ' + derived.completion.total + '</div><div class="info-tile"><strong>Scénario</strong><br>' + (appState.metadata.scenarioName || "Aucun scénario chargé") + '</div><div class="info-tile"><strong>Dernière mise à jour</strong><br>' + formatDate(appState.metadata.updatedAt) + '</div>';
  }
  function renderExecutiveMetrics(derived) {
    const container = document.getElementById("executive-metrics");
    if (derived.portfolio.indicativeMaturity == null) { container.className = "empty-state"; container.textContent = "Lancez ou chargez une évaluation pour visualiser les résultats."; return; }
    const criticalCount = appState.findings.filter(function (finding) { return finding.severity === "critical"; }).length;
    const highCount = appState.findings.filter(function (finding) { return finding.severity === "high"; }).length;
    container.className = "metric-grid";
    container.innerHTML = [
      metricCard("Indice indicatif de maturité", String(derived.portfolio.indicativeMaturity), derived.portfolio.maturityLabel),
      metricCard("Taux de couverture", formatPercent(derived.portfolio.coverageRate), "Couverture du dispositif"),
      metricCard("Effectivité moyenne", formatPercent(derived.portfolio.effectivenessRate), "Capacité opérationnelle"),
      metricCard("Niveau de preuve", formatPercent(derived.portfolio.evidenceRate), "Démonstration disponible"),
      metricCard("Exposition résiduelle", formatPercent(derived.portfolio.residualExposure), derived.portfolio.exposureLabel),
      metricCard("Findings critiques", String(criticalCount), "Niveau d’alerte maximal"),
      metricCard("Findings élevés", String(highCount), "Actions prioritaires"),
      metricCard("Actions identifiées", String(appState.actions.length), "Suivi de remédiation")
    ].join("");
  }
  function renderExecutiveSummary(derived) {
    const summaryNode = document.getElementById("executive-summary");
    summaryNode.className = "info-tile";
    summaryNode.textContent = derived.summary.text;
    const strengthNode = document.getElementById("executive-strengths");
    if (!derived.summary.strengths.length) { strengthNode.className = "empty-state"; strengthNode.textContent = "Les points de maîtrise ressortiront automatiquement selon les dimensions évaluées."; }
    else { strengthNode.className = "strength-list"; strengthNode.innerHTML = derived.summary.strengths.map(function (item) { return '<div class="strength-item">' + item + '</div>'; }).join(""); }
    const exposureNode = document.getElementById("executive-exposures");
    if (!derived.summary.exposures.length) { exposureNode.className = "empty-state"; exposureNode.textContent = "Les principales expositions apparaîtront ici après calcul."; }
    else { exposureNode.className = "exposure-list"; exposureNode.innerHTML = derived.summary.exposures.map(function (item) { return '<div class="exposure-item">' + item + '</div>'; }).join(""); }
  }
  function renderHeatmap(derived) {
    const node = document.getElementById("heatmap-container");
    const rows = Object.values(derived.domainScores).filter(function (row) { return Number.isFinite(row.maturityScore); });
    if (!rows.length) { node.className = "empty-state"; node.textContent = "La heatmap des domaines sera disponible une fois l’évaluation renseignée."; return; }
    node.className = "heatmap-grid";
    node.innerHTML = rows.map(function (row) {
      return '<article class="heatmap-card"><h4>' + ((DOMAINS_BY_ID[row.domainId] || {}).label || row.domainId) + '</h4><div class="stat-grid"><div class="stat-row"><strong>Maturité</strong><br>' + row.maturityScore + '/100</div><div class="stat-row"><strong>Couverture</strong><br>' + formatPercent(row.coverage) + '</div><div class="stat-row"><strong>Effectivité</strong><br>' + formatPercent(row.effectiveness) + '</div><div class="stat-row"><strong>Preuve</strong><br>' + formatPercent(row.evidence) + '</div><div class="stat-row"><strong>Exposition</strong><br>' + formatPercent(row.exposure) + '</div><div class="stat-row"><strong>Findings</strong><br>' + appState.findings.filter(function (finding) { return finding.domainId === row.domainId; }).length + '</div></div></article>';
    }).join("");
  }
  function renderCalculationExplainer() {
    document.getElementById("calculation-explainer").innerHTML = '<p>Le score de maturité par exigence est calculé comme suit : couverture 20 %, conception 25 %, effectivité 35 %, qualité de preuve 20 %.</p><p>L’exposition résiduelle repose sur les déficits d’effectivité, de couverture, de conception et de preuve, avec un coefficient de criticité appliqué à chaque exigence.</p><p>Le résultat reste indicatif : il synthétise les réponses, les pondérations configurées, les exigences concernées et les preuves associées, sans constituer une validation formelle de conformité.</p><ul class="bullet-list"><li>Poids de la maturité : ' + JSON.stringify(SCORING_WEIGHTS) + '</li><li>Poids de l’exposition : ' + JSON.stringify(EXPOSURE_WEIGHTS) + '</li><li>Chaque exigence est pondérée par sa criticité.</li><li>Les références réglementaires affichées proviennent exclusivement de la base centralisée.</li></ul>';
  }
  function dimensionSelect(label, dimensionKey, value) {
    return '<label class="field"><span>' + label + '</span><select data-dimension-key="' + dimensionKey + '" class="question-dimension-select">' + DIMENSION_OPTIONS[dimensionKey].map(function (option) { return '<option value="' + option.value + '"' + (Number(value) === Number(option.value) ? " selected" : "") + '>' + option.label + '</option>'; }).join("") + '</select></label>';
  }
  function renderAssessmentNavigator(derived) {
    const domainFilter = document.getElementById("assessment-domain-filter");
    const queueContainer = document.getElementById("assessment-queue");
    const queueSummary = document.getElementById("assessment-queue-summary");
    domainFilter.innerHTML = '<option value="all">Tous les domaines</option>' + DOMAIN_METADATA.map(function (domain) { return '<option value="' + domain.id + '"' + (appState.ui.assessmentFilters.domain === domain.id ? " selected" : "") + '>' + domain.label + '</option>'; }).join("");
    document.getElementById("assessment-search").value = appState.ui.assessmentFilters.search;
    const items = getAssessmentQueueItems(derived);
    const completed = items.filter(function (item) { return item.isCompleted; }).length;
    queueSummary.textContent = items.length ? completed + " exigence(s) traitée(s) sur " + items.length + " dans la vue courante." : "Aucune exigence ne correspond aux filtres du parcours.";
    if (!items.length) {
      queueContainer.innerHTML = '<div class="empty-state">Aucune exigence ne correspond à la sélection actuelle.</div>';
      return;
    }
    queueContainer.innerHTML = items.map(function (item) {
      const activeClass = item.isActive ? " is-active" : "";
      const statusText = item.score.status === "evaluated" ? "Évaluée" : (item.score.status === "notApplicable" ? "Non applicable" : "À traiter");
      const exposureText = item.score.status === "evaluated" ? item.score.exposureLabel : "Exposition à calculer";
      return '<button class="queue-item' + activeClass + '" type="button" data-assessment-jump="' + item.requirement.id + '"><span class="queue-item-top"><span class="queue-item-id">' + item.requirement.id + '</span><span class="queue-item-status ' + (item.isCompleted ? "is-complete" : "is-pending") + '">' + statusText + '</span></span><strong>' + item.requirement.title + '</strong><span class="queue-item-meta">' + (((DOMAINS_BY_ID[item.requirement.domainId] || {}).shortLabel) || item.requirement.domainId) + ' · Criticité ' + item.requirement.criticality + '</span><span class="queue-item-meta">' + exposureText + '</span></button>';
    }).join("");
    document.querySelectorAll("[data-assessment-jump]").forEach(function (button) {
      button.addEventListener("click", function () { setCurrentQuestionByRequirementId(button.dataset.assessmentJump, "assessment"); });
    });
  }
  function renderQuestionCard(derived) {
    const node = document.getElementById("question-card");
    const question = ASSESSMENT_QUESTIONS[appState.ui.currentQuestionIndex] || ASSESSMENT_QUESTIONS[0];
    const requirementItem = REQUIREMENTS_BY_ID[question.requirementId];
    const response = appState.assessment[question.requirementId];
    const score = derived.scoredRequirements[question.requirementId];
    const domainQuestions = ASSESSMENT_QUESTIONS.filter(function (item) { return item.domainId === question.domainId; });
    const domainPosition = domainQuestions.findIndex(function (item) { return item.requirementId === question.requirementId; }) + 1;
    const evidenceOptions = appState.evidence.map(function (item) { return '<option value="' + item.id + '"' + (response.evidenceIds.includes(item.id) ? " selected" : "") + '>' + item.id + ' — ' + item.title + '</option>'; }).join("");
    document.getElementById("question-counter").textContent = "Question " + question.order + " / " + ASSESSMENT_QUESTIONS.length;
    document.getElementById("completion-label").textContent = derived.completion.percentage + " % complété";
    document.getElementById("assessment-progress-bar").style.width = derived.completion.percentage + "%";
    node.className = "question-card";
    node.innerHTML = '<div class="question-meta"><span class="status-pill">' + (((DOMAINS_BY_ID[question.domainId] || {}).label) || question.domainId) + '</span><span class="metric-pill">Criticité ' + requirementItem.criticality + '</span><span class="metric-pill">' + (score && score.status === "evaluated" ? "Maturité " + score.maturityScore + "/100" : "Non évaluée") + '</span><span class="metric-pill">' + (score && score.status === "evaluated" ? score.exposureLabel : "Exposition à calculer") + '</span></div>' +
      '<div class="stack"><div class="question-header"><div><p class="section-kicker">Exigence ' + requirementItem.id + '</p><h3 class="question-title">' + requirementItem.title + '</h3></div><div class="question-header-side"><span class="status-pill">Étape ' + domainPosition + ' / ' + domainQuestions.length + ' du domaine</span><button id="question-open-requirements" class="button tertiary" type="button">Voir la fiche réglementaire</button></div></div><p class="question-description">' + question.prompt + '</p><div class="section-grid two-col"><div class="info-tile"><strong>Explication</strong><p>' + question.guidance + '</p></div><div class="info-tile"><strong>Référence réglementaire</strong><p>' + requirementItem.articleRefs.join(", ") + '</p></div></div></div>' +
      '<div class="form-grid"><label class="field"><span>Réponse principale</span><select id="question-main-level">' + MAIN_LEVEL_OPTIONS.map(function (option) { return '<option value="' + option.id + '"' + (option.id === response.mainLevel ? " selected" : "") + '>' + option.label + '</option>'; }).join("") + '</select></label><label class="field"><span>Applicabilité</span><select id="question-applicability"><option value="applicable"' + (response.nonApplicable ? "" : " selected") + '>Applicable</option><option value="notApplicable"' + (response.nonApplicable ? " selected" : "") + '>Non applicable</option></select></label><label class="field field-full"><span>Commentaire</span><textarea id="question-comment" rows="3" placeholder="Commentaires, hypothèses, éléments de contexte">' + (response.comment || "") + '</textarea></label><label class="field field-full"><span>Associer des preuves</span><select id="question-evidence" class="question-evidence" multiple size="6">' + evidenceOptions + '</select></label></div>' +
      '<details class="explainer"' + (response.expertMode ? " open" : "") + '><summary>Affiner l’évaluation</summary><div class="dimension-grid">' + dimensionSelect("Couverture", "coverage", response.coverage) + dimensionSelect("Conception", "design", response.design) + dimensionSelect("Effectivité", "effectiveness", response.effectiveness) + dimensionSelect("Qualité de preuve", "evidence", response.evidence) + '</div><div class="section-grid two-col"><div class="info-tile"><strong>Contrôles attendus</strong><p>' + requirementItem.expectedControls.join(" · ") + '</p></div><div class="info-tile"><strong>Preuves attendues</strong><p>' + question.expectedEvidence.join(" · ") + '</p></div></div></details>' +
      '<div class="question-actions"><button id="question-prev" class="button tertiary" type="button"' + (appState.ui.currentQuestionIndex === 0 ? " disabled" : "") + '>Précédent</button><div class="button-row"><button id="question-save-executive" class="button secondary" type="button">Voir la vue exécutive</button><button id="question-next" class="button primary" type="button">' + (appState.ui.currentQuestionIndex === ASSESSMENT_QUESTIONS.length - 1 ? "Terminer" : "Suivant") + '</button></div></div>';
    bindQuestionCardEvents(question.requirementId);
  }
  function bindQuestionCardEvents(requirementId) {
    document.getElementById("question-main-level").addEventListener("change", function (event) { updateState(function (state) { state.assessment[requirementId] = applyMainLevel(state.assessment[requirementId], event.target.value); }); });
    document.getElementById("question-applicability").addEventListener("change", function (event) { updateState(function (state) { state.assessment[requirementId].nonApplicable = event.target.value === "notApplicable"; }); });
    document.getElementById("question-comment").addEventListener("input", function (event) { updateState(function (state) { state.assessment[requirementId].comment = event.target.value; }); });
    document.getElementById("question-evidence").addEventListener("change", function (event) { updateState(function (state) { state.assessment[requirementId].evidenceIds = Array.from(event.target.selectedOptions).map(function (option) { return option.value; }); }); });
    document.querySelectorAll(".question-dimension-select").forEach(function (select) { select.addEventListener("change", function (event) { updateState(function (state) { const key = event.target.dataset.dimensionKey; state.assessment[requirementId][key] = Number(event.target.value); state.assessment[requirementId].expertMode = true; }); }); });
    document.querySelector(".explainer").addEventListener("toggle", function (event) { updateState(function (state) { state.assessment[requirementId].expertMode = event.target.open; }); });
    document.getElementById("question-prev").addEventListener("click", function () { updateState(function (state) { state.ui.currentQuestionIndex = Math.max(0, state.ui.currentQuestionIndex - 1); }); });
    document.getElementById("question-next").addEventListener("click", function () { updateState(function (state) { state.ui.currentQuestionIndex = Math.min(ASSESSMENT_QUESTIONS.length - 1, state.ui.currentQuestionIndex + 1); }); });
    document.getElementById("question-save-executive").addEventListener("click", function () { navigateTo("executive"); });
    document.getElementById("question-open-requirements").addEventListener("click", function () {
      updateState(function (state) {
        state.ui.requirementsFilters.domain = REQUIREMENTS_BY_ID[requirementId].domainId;
        state.ui.requirementsFilters.search = requirementId;
        state.ui.route = "requirements";
      });
      window.location.hash = "requirements";
    });
  }
  function renderRequirementsView(derived) {
    const domainFilter = document.getElementById("requirements-domain-filter");
    domainFilter.innerHTML = '<option value="all">Tous les domaines</option>' + DOMAIN_METADATA.map(function (domain) { return '<option value="' + domain.id + '"' + (appState.ui.requirementsFilters.domain === domain.id ? " selected" : "") + '>' + domain.label + '</option>'; }).join("");
    document.getElementById("requirements-exposure-filter").value = appState.ui.requirementsFilters.exposure;
    document.getElementById("requirements-evidence-filter").value = appState.ui.requirementsFilters.evidence;
    document.getElementById("requirements-criticality-filter").value = appState.ui.requirementsFilters.criticality;
    document.getElementById("requirements-status-filter").value = appState.ui.requirementsFilters.status;
    document.getElementById("requirements-search").value = appState.ui.requirementsFilters.search;
    const rows = REGULATORY_REQUIREMENTS.filter(function (requirementItem) {
      const score = derived.scoredRequirements[requirementItem.id];
      const evidenceList = derived.evidenceIndex[requirementItem.id] || [];
      const finding = appState.findings.find(function (item) { return item.requirementId === requirementItem.id; });
      const haystack = (requirementItem.id + " " + requirementItem.title + " " + requirementItem.description + " " + (((DOMAINS_BY_ID[requirementItem.domainId] || {}).label) || "")).toLowerCase();
      const filters = appState.ui.requirementsFilters;
      if (filters.domain !== "all" && requirementItem.domainId !== filters.domain) return false;
      if (filters.criticality !== "all" && String(requirementItem.criticality) !== filters.criticality) return false;
      if (filters.search && !haystack.includes(filters.search.toLowerCase())) return false;
      if (filters.exposure !== "all" && score.exposureBand !== filters.exposure) return false;
      if (filters.evidence !== "all") {
        const status = ((score || {}).evidenceStatus || {}).status || "none";
        if (filters.evidence === "none" && evidenceList.length > 0) return false;
        if (filters.evidence === "declarative" && status !== "declarative") return false;
        if (filters.evidence === "documented" && !["documented", "review"].includes(status)) return false;
        if (filters.evidence === "verified" && status !== "verified") return false;
      }
      if (filters.status === "evaluated" && score.status !== "evaluated") return false;
      if (filters.status === "notAssessed" && score.status !== "notAssessed") return false;
      if (filters.status === "notApplicable" && score.status !== "notApplicable") return false;
      if (filters.status === "withFinding" && !finding) return false;
      if (filters.status === "withEvidence" && evidenceList.length === 0) return false;
      return true;
    });
    const container = document.getElementById("requirements-table");
    if (!rows.length) { container.innerHTML = '<div class="empty-state">Aucune exigence ne correspond aux filtres sélectionnés.</div>'; return; }
    container.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Exigence</th><th>Domaine</th><th>Criticité</th><th>Statut</th><th>Maturité</th><th>Preuve</th><th>Exposition</th><th>Finding</th></tr></thead><tbody>' + rows.map(function (requirementItem) {
      const score = derived.scoredRequirements[requirementItem.id];
      const finding = appState.findings.find(function (item) { return item.requirementId === requirementItem.id; });
      return '<tr><td><strong>' + requirementItem.id + '</strong><br>' + requirementItem.title + '<br><span class="table-note">' + requirementItem.articleRefs.join(", ") + '</span><br><button class="button tertiary" type="button" data-jump-question="' + requirementItem.id + '">Ouvrir dans l’évaluation</button></td><td>' + (((DOMAINS_BY_ID[requirementItem.domainId] || {}).shortLabel) || requirementItem.domainId) + '</td><td>' + requirementItem.criticality + '</td><td>' + statusLabel(score.status) + '</td><td>' + (score.maturityScore == null ? "—" : score.maturityScore) + '</td><td><span class="evidence-pill ' + (((score.evidenceStatus || {}).status) || "none") + '">' + (((score.evidenceStatus || {}).label) || "Absente") + '</span></td><td>' + (score.weightedExposure == null ? "—" : score.weightedExposure) + '</td><td>' + (finding ? '<span class="severity-pill ' + finding.severity + '">' + finding.severityLabel + '</span>' : "—") + '</td></tr>';
    }).join("") + '</tbody></table></div>';
    document.querySelectorAll("[data-jump-question]").forEach(function (button) { button.addEventListener("click", function () { setCurrentQuestionByRequirementId(button.dataset.jumpQuestion, "assessment"); }); });
  }
  function renderEvidenceView() {
    document.getElementById("evidence-related-requirements").innerHTML = REGULATORY_REQUIREMENTS.map(function (requirementItem) { return '<option value="' + requirementItem.id + '">' + requirementItem.id + ' — ' + requirementItem.title + '</option>'; }).join("");
    document.getElementById("evidence-status-filter").value = appState.ui.evidenceFilters.status;
    document.getElementById("evidence-search").value = appState.ui.evidenceFilters.search;
    const evidenceCards = appState.evidence.filter(function (item) {
      const haystack = (item.title + " " + item.owner + " " + (item.relatedRequirementIds || []).join(" ")).toLowerCase();
      if (appState.ui.evidenceFilters.search && !haystack.includes(appState.ui.evidenceFilters.search.toLowerCase())) return false;
      if (appState.ui.evidenceFilters.status === "all") return true;
      if (appState.ui.evidenceFilters.status === "missing") return false;
      return item.status === appState.ui.evidenceFilters.status;
    });
    const missingEvidenceRequirements = appState.ui.evidenceFilters.status === "missing" ? REGULATORY_REQUIREMENTS.filter(function (requirementItem) { return !appState.evidence.some(function (item) { return (item.relatedRequirementIds || []).includes(requirementItem.id); }); }) : [];
    const container = document.getElementById("evidence-list");
    if (appState.ui.evidenceFilters.status === "missing") {
      container.innerHTML = missingEvidenceRequirements.length ? '<div class="data-card-list">' + missingEvidenceRequirements.map(function (requirementItem) { return '<article class="data-card"><h4>' + requirementItem.id + ' — ' + requirementItem.title + '</h4><p>' + requirementItem.description + '</p></article>'; }).join("") + '</div>' : '<div class="empty-state">Toutes les exigences disposent au moins d’un rattachement de preuve dans la session.</div>';
      return;
    }
    if (!evidenceCards.length) { container.innerHTML = '<div class="empty-state">Aucune preuve ne correspond aux filtres sélectionnés.</div>'; return; }
    container.innerHTML = '<div class="data-card-list">' + evidenceCards.map(function (item) {
      return '<article class="data-card" data-evidence-card="' + item.id + '"><div class="finding-head"><div><h4>' + item.id + ' — ' + item.title + '</h4><p>' + (item.description || "Aucune description") + '</p></div><span class="evidence-pill ' + item.status + '">' + evidenceStatusLabel(item.status) + '</span></div><div class="data-grid"><label class="field"><span>Owner</span><input type="text" data-evidence-field="owner" data-evidence-id="' + item.id + '" value="' + (item.owner || "") + '"></label><label class="field"><span>Version</span><input type="text" data-evidence-field="version" data-evidence-id="' + item.id + '" value="' + (item.version || "") + '"></label><label class="field"><span>Date du document</span><input type="date" data-evidence-field="documentDate" data-evidence-id="' + item.id + '" value="' + (item.documentDate || "") + '"></label><label class="field"><span>Date de revue</span><input type="date" data-evidence-field="reviewDate" data-evidence-id="' + item.id + '" value="' + (item.reviewDate || "") + '"></label><label class="field"><span>Statut</span><select data-evidence-field="status" data-evidence-id="' + item.id + '">' + [["declared","Déclarée"],["available","Disponible"],["review","À revoir"],["verified","Vérifiée"],["obsolete","Obsolète"]].map(function (pair) { return '<option value="' + pair[0] + '"' + (item.status === pair[0] ? " selected" : "") + '>' + pair[1] + '</option>'; }).join("") + '</select></label><label class="field"><span>Exigences associées</span><input type="text" data-evidence-field="relatedRequirementIds" data-evidence-id="' + item.id + '" value="' + (item.relatedRequirementIds || []).join(", ") + '"></label></div>' + (item.source === "demo" ? "" : '<button class="button tertiary danger" type="button" data-delete-evidence="' + item.id + '">Supprimer</button>') + '</article>';
    }).join("") + '</div>';
    document.querySelectorAll("[data-evidence-field]").forEach(function (field) { field.addEventListener("change", function (event) { updateState(function (state) { const evidenceItem = state.evidence.find(function (item) { return item.id === event.target.dataset.evidenceId; }); if (!evidenceItem) return; const key = event.target.dataset.evidenceField; evidenceItem[key] = key === "relatedRequirementIds" ? event.target.value.split(",").map(function (item) { return item.trim(); }).filter(Boolean) : event.target.value; }); }); });
    document.querySelectorAll("[data-delete-evidence]").forEach(function (button) { button.addEventListener("click", function () { if (!window.confirm("Supprimer cette preuve ajoutée dans la session ?")) return; updateState(function (state) { state.evidence = state.evidence.filter(function (item) { return item.id !== button.dataset.deleteEvidence; }); }); }); });
  }
  function renderFindingsView() {
    document.getElementById("finding-domain-filter").innerHTML = '<option value="all">Tous les domaines</option>' + DOMAIN_METADATA.map(function (domain) { return '<option value="' + domain.id + '"' + (appState.ui.findingFilters.domain === domain.id ? " selected" : "") + '>' + domain.label + '</option>'; }).join("");
    document.getElementById("finding-severity-filter").value = appState.ui.findingFilters.severity;
    document.getElementById("finding-status-filter").value = appState.ui.findingFilters.status;
    const findings = appState.findings.filter(function (finding) {
      if (appState.ui.findingFilters.severity !== "all" && finding.severity !== appState.ui.findingFilters.severity) return false;
      if (appState.ui.findingFilters.domain !== "all" && finding.domainId !== appState.ui.findingFilters.domain) return false;
      if (appState.ui.findingFilters.status !== "all" && finding.status !== appState.ui.findingFilters.status) return false;
      return true;
    });
    const container = document.getElementById("findings-list");
    if (!findings.length) { container.innerHTML = '<div class="empty-state">Aucun finding ne correspond aux filtres sélectionnés.</div>'; return; }
    container.innerHTML = findings.map(function (finding) {
      return '<article class="finding-card" data-finding-id="' + finding.id + '"><div class="finding-head"><div><h4>' + finding.id + ' — ' + finding.title + '</h4><p>' + finding.observation + '</p></div><span class="severity-pill ' + finding.severity + '">' + finding.severityLabel + '</span></div><div class="data-grid"><div class="info-tile"><strong>Exigence</strong><br>' + finding.requirementId + '</div><div class="info-tile"><strong>Domaine</strong><br>' + (((DOMAINS_BY_ID[finding.domainId] || {}).label) || finding.domainId) + '</div><div class="info-tile"><strong>Niveau de preuve</strong><br>' + finding.evidenceLevel + '</div><div class="info-tile"><strong>Déclencheurs</strong><br>' + finding.triggerSummary.join(" · ") + '</div></div><div class="form-grid"><label class="field"><span>Cause probable</span><textarea rows="3" data-finding-field="probableCause" data-finding-id="' + finding.id + '">' + finding.probableCause + '</textarea></label><label class="field"><span>Recommendation</span><textarea rows="3" data-finding-field="recommendation" data-finding-id="' + finding.id + '">' + finding.recommendation + '</textarea></label><label class="field"><span>Owner</span><input type="text" data-finding-field="suggestedOwner" data-finding-id="' + finding.id + '" value="' + finding.suggestedOwner + '"></label><label class="field"><span>Date cible</span><input type="date" data-finding-field="dueDate" data-finding-id="' + finding.id + '" value="' + (finding.dueDate || "") + '"></label><label class="field"><span>Statut</span><select data-finding-field="status" data-finding-id="' + finding.id + '">' + [["open","Ouvert"],["inProgress","En cours"],["pending","En attente"],["readyForReview","Prêt pour revue"],["closed","Clos"]].map(function (pair) { return '<option value="' + pair[0] + '"' + (finding.status === pair[0] ? " selected" : "") + '>' + pair[1] + '</option>'; }).join("") + '</select></label><label class="field"><span>Critères de clôture</span><input type="text" data-finding-field="closureCriteria" data-finding-id="' + finding.id + '" value="' + finding.closureCriteria.join(" | ") + '"></label></div></article>';
    }).join("");
    document.querySelectorAll("[data-finding-field]").forEach(function (field) { field.addEventListener("change", function (event) { updateState(function (state) { const finding = state.findings.find(function (item) { return item.id === event.target.dataset.findingId; }); if (!finding) return; const key = event.target.dataset.findingField; finding[key] = key === "closureCriteria" ? event.target.value.split("|").map(function (item) { return item.trim(); }).filter(Boolean) : event.target.value; }); }); });
  }
  function renderRemediationView(derived) {
    const timelineNode = document.getElementById("remediation-timeline");
    const tableNode = document.getElementById("remediation-table");
    if (!appState.actions.length) { timelineNode.innerHTML = '<div class="empty-state">Aucune action de remédiation n’est générée pour le moment.</div>'; tableNode.innerHTML = ""; return; }
    timelineNode.innerHTML = '<div class="timeline-grid">' + derived.groupedActions.map(function (group) { return '<article class="timeline-column"><h4>' + group.label + '</h4><ul>' + (group.items.map(function (item) { return '<li><strong>' + item.title + '</strong><br>' + item.owner + '</li>'; }).join("") || "<li>Aucune action</li>") + '</ul></article>'; }).join("") + '</div>';
    tableNode.innerHTML = '<div class="table-wrap"><table><thead><tr><th>Action</th><th>Owner</th><th>Priorité</th><th>Horizon</th><th>Effort</th><th>Statut</th></tr></thead><tbody>' + appState.actions.map(function (action) { return '<tr><td>' + action.title + '</td><td>' + action.owner + '</td><td>' + action.priority + '</td><td>' + action.horizon + '</td><td>' + action.effort + '</td><td>' + action.status + '</td></tr>'; }).join("") + '</tbody></table></div>';
  }
  function renderReportView(derived) {
    const domainRows = Object.values(derived.domainScores).map(function (domain) { return Object.assign({}, domain, { label: ((DOMAINS_BY_ID[domain.domainId] || {}).label) || domain.domainId }); });
    document.getElementById("report-content").innerHTML = buildReportHtml({ state: appState, portfolio: derived.portfolio, domainRows: domainRows, findings: appState.findings, actions: appState.actions, summaryText: derived.summary.text, strengths: derived.summary.strengths, exposures: derived.summary.exposures, entityTypeLabel: labelForEntityType(appState.organization.entityType), objectiveLabel: labelForObjective(appState.organization.objective) });
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
    renderAssessmentNavigator(derived);
    renderQuestionCard(derived);
    renderRequirementsView(derived);
    renderEvidenceView();
    renderFindingsView();
    renderRemediationView(derived);
    renderReportView(derived);
    if (appState.metadata.corruptionRecovered) document.getElementById("assessment-feedback").textContent = "Les données locales n’ont pas pu être relues correctement. Une nouvelle session a été initialisée.";
  }
  function loadScenario(scenarioId) {
    const scenario = DEMO_SCENARIOS.find(function (item) { return item.id === scenarioId; });
    if (!scenario) return;
    const nextState = createDefaultState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE);
    nextState.organization = Object.assign({}, nextState.organization, scenario.organization);
    nextState.assessment = hydrateAssessment(normalizeScenarioResponses(scenario.responses, REGULATORY_REQUIREMENTS), REGULATORY_REQUIREMENTS);
    nextState.evidence = clone(DEMO_EVIDENCE);
    nextState.metadata.scenarioId = scenario.id;
    nextState.metadata.scenarioName = scenario.name;
    nextState.metadata.resumeAvailable = true;
    nextState.ui.route = "assessment";
    setState(nextState);
    window.location.hash = "assessment";
    document.getElementById("assessment-feedback").textContent = "Scénario chargé : " + scenario.name + ". Vous pouvez ajuster librement les réponses et les preuves.";
  }
  function updateFilter(group, key, value) { updateState(function (state) { state.ui[group][key] = value; }); }
  function bindStaticEvents() {
    document.querySelectorAll("[data-route]").forEach(function (button) { button.addEventListener("click", function () { appState.ui.route = button.dataset.route; saveState(appState); activateRoute(appState.ui.route); window.location.hash = appState.ui.route; renderApp(); }); });
    window.addEventListener("hashchange", function () { appState.ui.route = getRoute(); saveState(appState); activateRoute(appState.ui.route); renderApp(); });
    const syncOrganizationField = function (event) {
      updateState(function (state) {
        const key = event.target.id.replace("org-", "");
        const mapping = { name: "name", "entity-type": "entityType", sector: "sector", size: "size", "group-structure": "groupStructure", geography: "geography", "critical-functions": "criticalFunctions", "initial-maturity": "initialMaturity", objective: "objective" };
        const property = mapping[key];
        if (property) state.organization[property] = event.target.value;
      });
    };
    document.getElementById("organization-form").addEventListener("input", syncOrganizationField);
    document.getElementById("organization-form").addEventListener("change", syncOrganizationField);
    document.getElementById("scenario-select").addEventListener("change", function (event) {
      const scenario = DEMO_SCENARIOS.find(function (item) { return item.id === event.target.value; });
      document.getElementById("scenario-description").textContent = scenario ? scenario.description : "";
    });
    document.getElementById("load-demo-scenario").addEventListener("click", function () { loadScenario(document.getElementById("scenario-select").value); });
    document.getElementById("resume-evaluation").addEventListener("click", function () { appState = loadState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE); syncDerivedArtifacts(); renderApp(); document.getElementById("assessment-feedback").textContent = "Évaluation locale rechargée."; });
    document.getElementById("reset-evaluation").addEventListener("click", function () {
      if (!window.confirm("Réinitialiser l’évaluation et supprimer les données locales de cette session ?")) return;
      clearState(); appState = createDefaultState(REGULATORY_REQUIREMENTS, DEMO_EVIDENCE); syncDerivedArtifacts(); renderApp(); document.getElementById("assessment-feedback").textContent = "Évaluation réinitialisée.";
    });
    document.getElementById("requirements-exposure-filter").addEventListener("change", function (event) { updateFilter("requirementsFilters", "exposure", event.target.value); });
    document.getElementById("requirements-evidence-filter").addEventListener("change", function (event) { updateFilter("requirementsFilters", "evidence", event.target.value); });
    document.getElementById("requirements-criticality-filter").addEventListener("change", function (event) { updateFilter("requirementsFilters", "criticality", event.target.value); });
    document.getElementById("requirements-status-filter").addEventListener("change", function (event) { updateFilter("requirementsFilters", "status", event.target.value); });
    document.getElementById("requirements-search").addEventListener("input", function (event) { updateFilter("requirementsFilters", "search", event.target.value); });
    document.getElementById("requirements-domain-filter").addEventListener("change", function (event) { updateFilter("requirementsFilters", "domain", event.target.value); });
    document.getElementById("assessment-search").addEventListener("input", function (event) { updateFilter("assessmentFilters", "search", event.target.value); });
    document.getElementById("assessment-domain-filter").addEventListener("change", function (event) { updateFilter("assessmentFilters", "domain", event.target.value); });
    document.getElementById("jump-next-pending").addEventListener("click", function () {
      const nextPending = ASSESSMENT_QUESTIONS.find(function (question) {
        const response = appState.assessment[question.requirementId];
        return !(response && (response.nonApplicable || (response.mainLevel && response.mainLevel !== "notAssessed")));
      });
      if (!nextPending) {
        document.getElementById("assessment-feedback").textContent = "Toutes les exigences du parcours ont déjà été renseignées.";
        return;
      }
      setCurrentQuestionByRequirementId(nextPending.requirementId, "assessment");
      document.getElementById("assessment-feedback").textContent = "Exigence ouverte : " + nextPending.requirementId + ".";
    });
    document.getElementById("evidence-status-filter").addEventListener("change", function (event) { updateFilter("evidenceFilters", "status", event.target.value); });
    document.getElementById("evidence-search").addEventListener("input", function (event) { updateFilter("evidenceFilters", "search", event.target.value); });
    document.getElementById("finding-severity-filter").addEventListener("change", function (event) { updateFilter("findingFilters", "severity", event.target.value); });
    document.getElementById("finding-domain-filter").addEventListener("change", function (event) { updateFilter("findingFilters", "domain", event.target.value); });
    document.getElementById("finding-status-filter").addEventListener("change", function (event) { updateFilter("findingFilters", "status", event.target.value); });
    document.getElementById("evidence-form").addEventListener("submit", function (event) {
      event.preventDefault();
      const relatedRequirementIds = Array.from(document.getElementById("evidence-related-requirements").selectedOptions).map(function (option) { return option.value; });
      const fileInput = document.getElementById("evidence-file");
      const nextId = "EVD-" + String(appState.evidence.length + 1).padStart(3, "0");
      updateState(function (state) {
        state.evidence.push({
          id: nextId, title: document.getElementById("evidence-title").value, evidenceType: document.getElementById("evidence-type").value, owner: document.getElementById("evidence-owner").value,
          documentDate: document.getElementById("evidence-date").value, reviewDate: document.getElementById("evidence-review-date").value, status: document.getElementById("evidence-status").value,
          freshness: "current", version: "1.0", description: document.getElementById("evidence-description").value, relatedRequirementIds: relatedRequirementIds, source: "session", fileName: fileInput.files && fileInput.files[0] ? fileInput.files[0].name : null
        });
      });
      event.target.reset();
    });
    document.getElementById("export-pdf").addEventListener("click", function () { navigateTo("report"); window.print(); });
  }
  syncDerivedArtifacts();
  appState.ui.route = getRoute();
  bindStaticEvents();
  renderApp();
})();
