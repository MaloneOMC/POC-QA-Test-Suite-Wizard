const state = {
  versionCounter: 1,
  suites: [],
  scripts: "",
  risk: {
    score: 0,
    highRiskItems: [],
    knowledgeGaps: [],
    mediumRiskItems: [],
    lowRiskSignals: []
  }
};

const projectSaveStateVersion = 4;
const projectSaveStateDate = "2026-05-13";
const projectSaveStateFileName = `qa-suite-save-state-${projectSaveStateDate}-v${String(projectSaveStateVersion).padStart(3, "0")}.json`;

const embeddedProjectSaveState = {
  app: "QA Intelligence Suite",
  saveStateType: "codex-project-handoff",
  savedAt: "2026-05-13T00:00:00.000Z",
  versionCounter: projectSaveStateVersion,
  purpose:
    "Document this chat-driven project progression and provide enough context for another Codex instance to recreate or continue the same application.",
  codexReplicationPrompt:
    "Recreate the QA Intelligence Suite proof of concept as a self-contained static browser app. Build index.html, styles.css, app.js, README.md, and save-states entries. Preserve the GUI sections for Dashboard, Test Plans/Test Suites, Test Scripts, Risk Analysis, Reports, local report export, and project handoff save-state download.",
  projectRequirements: [
    "Quality Assurance Software Suite with a modern, intuitive GUI.",
    "AI-assisted workflows for test plans, test suites, test scripts, risk analysis, and reports.",
    "Documentation upload/paste area that flags high-risk items and knowledge gaps.",
    "Designated sections for each major QA task.",
    "Report outputs for each major task.",
    "Dated versioned save-state documentation for project progression and code handoff."
  ],
  files: [
    "index.html",
    "styles.css",
    "app.js",
    "README.md",
    "save-states/qa-suite-save-state-2026-05-13-v001.json",
    "save-states/qa-suite-save-state-2026-05-13-v002.json",
    "save-states/qa-suite-save-state-2026-05-13-v003.json",
    "save-states/qa-suite-save-state-2026-05-13-v004.json"
  ],
  note:
    "When available, download the static save-state file from save-states for the complete source snapshot. This embedded fallback intentionally excludes user-entered app data."
};

const fieldIds = [
  "projectName",
  "applicationArea",
  "releaseTarget",
  "qaOwner",
  "scopeSummary",
  "platforms",
  "testTypes",
  "constraints",
  "acceptanceCriteria",
  "testDataNotes",
  "documentationInput",
  "testPlanOutput",
  "scriptOutput",
  "riskOutput",
  "reportOutput"
];

const suitesTemplate = [
  {
    name: "Requirements & Content Validation",
    focus: "Confirm every stated requirement, content rule, legal note, and acceptance criterion is testable and accounted for."
  },
  {
    name: "Functional Workflow",
    focus: "Validate primary user journeys, business rules, error states, and expected system behavior."
  },
  {
    name: "Data & Personalization",
    focus: "Check segmentation logic, dynamic content, source data, fallback behavior, and data-driven variations."
  },
  {
    name: "Cross-Platform Regression",
    focus: "Exercise supported devices, browsers, clients, environments, and prior impacted features."
  },
  {
    name: "Accessibility & Compliance",
    focus: "Review semantic structure, readability, keyboard flow, contrast, alt text, legal disclaimers, and required approvals."
  }
];

const riskSignals = [
  { label: "dependency", weight: 11, pattern: /\b(dependency|dependent|blocked|waiting|handoff|integration)\b/gi },
  { label: "unclear ownership", weight: 12, pattern: /\b(tbd|unknown owner|owner tbd|not sure|unclear|to be confirmed)\b/gi },
  { label: "approval risk", weight: 10, pattern: /\b(legal|compliance|approval|review pending|sign.?off|stakeholder)\b/gi },
  { label: "late change", weight: 9, pattern: /\b(last minute|late change|scope change|change request|revised|updated)\b/gi },
  { label: "data complexity", weight: 10, pattern: /\b(segment|personalization|dynamic|mapping|source data|audience|eligibility)\b/gi },
  { label: "environment risk", weight: 8, pattern: /\b(environment|uat|devtest|staging|production|deployment|release)\b/gi },
  { label: "accessibility risk", weight: 8, pattern: /\b(accessibility|ada|wcag|screen reader|alt text|keyboard)\b/gi },
  { label: "compressed timing", weight: 11, pattern: /\b(urgent|rush|expedite|compressed|same day|asap|tight timeline)\b/gi }
];

const requiredKnowledge = [
  { label: "Acceptance criteria", pattern: /\b(acceptance criteria|definition of done|pass criteria|success criteria)\b/i },
  { label: "Supported platforms", pattern: /\b(browser|client|device|platform|ios|android|desktop|mobile)\b/i },
  { label: "Test data", pattern: /\b(test data|sample data|seed data|account|leadid|mapid|audience)\b/i },
  { label: "Dependencies", pattern: /\b(dependency|integration|api|vendor|handoff|upstream|downstream)\b/i },
  { label: "Approval path", pattern: /\b(approval|approver|legal|compliance|sign.?off|stakeholder)\b/i },
  { label: "Out-of-scope items", pattern: /\b(out of scope|not in scope|exclusion|excluded)\b/i },
  { label: "Rollback or escalation", pattern: /\b(rollback|fallback|escalation|incident|contingency)\b/i },
  { label: "Accessibility expectations", pattern: /\b(accessibility|ada|wcag|screen reader|alt text|keyboard)\b/i }
];

function byId(id) {
  return document.getElementById(id);
}

function getValue(id) {
  return byId(id)?.value.trim() || "";
}

function setValue(id, value) {
  const element = byId(id);
  if (element) element.value = value;
}

function splitList(value, fallback) {
  const items = value
    .split(/[,;\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
  return items.length ? items : fallback;
}

function showToast(message) {
  const toast = byId("toast");
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("visible"), 2600);
}

function downloadFile(fileName, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function todayStamp() {
  return new Date().toISOString().slice(0, 10);
}

function collectWorkspace() {
  const fields = {};
  fieldIds.forEach((id) => {
    const element = byId(id);
    if (element) fields[id] = element.value;
  });
  return {
    app: "QA Intelligence Suite",
    savedAt: new Date().toISOString(),
    versionCounter: state.versionCounter,
    fields,
    suites: state.suites,
    risk: state.risk
  };
}

function persistWorkspace() {
  localStorage.setItem("qa-intelligence-suite", JSON.stringify(collectWorkspace()));
}

function restoreWorkspace() {
  const raw = localStorage.getItem("qa-intelligence-suite");
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    Object.entries(saved.fields || {}).forEach(([id, value]) => setValue(id, value));
    state.versionCounter = saved.versionCounter || 1;
    state.suites = saved.suites || [];
    state.risk = saved.risk || state.risk;
  } catch {
    localStorage.removeItem("qa-intelligence-suite");
  }
}

function buildPlan() {
  const projectName = getValue("projectName") || "Untitled QA Engagement";
  const area = getValue("applicationArea") || "the product experience";
  const scope = getValue("scopeSummary") || "Scope details are pending.";
  const platforms = splitList(getValue("platforms"), ["Primary supported platform", "Secondary supported platform"]);
  const testTypes = splitList(getValue("testTypes"), ["Functional", "Regression", "Accessibility", "Data validation"]);
  const constraints = getValue("constraints") || "No constraints documented yet.";
  const criteria = getValue("acceptanceCriteria") || "Acceptance criteria need to be confirmed.";

  state.suites = suitesTemplate.map((suite, index) => ({
    id: `suite-${index + 1}`,
    name: suite.name,
    focus: suite.focus,
    platforms,
    testTypes
  }));

  const suiteText = state.suites
    .map((suite, index) => {
      return [
        `${index + 1}. ${suite.name}`,
        `   Focus: ${suite.focus}`,
        `   Platforms: ${platforms.join(", ")}`,
        `   Test Types: ${testTypes.join(", ")}`,
        "   Entry Criteria: Requirements available, test data identified, test environment accessible.",
        "   Exit Criteria: Critical and high defects resolved or accepted, evidence captured, report exported."
      ].join("\n");
    })
    .join("\n\n");

  const plan = [
    `# Test Plan: ${projectName}`,
    "",
    "## Objective",
    `Validate ${area} against the documented scope, acceptance criteria, and launch expectations.`,
    "",
    "## Scope Summary",
    scope,
    "",
    "## Release Target",
    getValue("releaseTarget") || "Release target not specified.",
    "",
    "## QA Owner",
    getValue("qaOwner") || "QA owner not specified.",
    "",
    "## Acceptance Criteria",
    criteria,
    "",
    "## Constraints",
    constraints,
    "",
    "## Test Suites",
    suiteText,
    "",
    "## Defect Triage Guidance",
    "- Critical: Blocks launch, corrupts data, violates legal/compliance expectations, or prevents the main user journey.",
    "- High: Major requirement failure, unsupported fallback, personalization error, or environment-specific release concern.",
    "- Medium: Partial requirement miss, content inconsistency, or workaround available.",
    "- Low: Cosmetic issue with no customer, compliance, or measurement impact."
  ].join("\n");

  setValue("testPlanOutput", plan);
  renderSuites();
  updateMetrics();
  buildReport();
  persistWorkspace();
  showToast("Test plan and suites generated.");
}

function renderSuites() {
  const list = byId("suiteList");
  list.innerHTML = "";
  if (!state.suites.length) {
    list.innerHTML = '<div class="suite-card"><h5>No suites yet</h5><p>Generate a test plan to build suite coverage.</p></div>';
    return;
  }
  state.suites.forEach((suite) => {
    const card = document.createElement("article");
    card.className = "suite-card";
    card.innerHTML = `<h5>${suite.name}</h5><p>${suite.focus}</p>`;
    list.appendChild(card);
  });
}

function buildScripts() {
  if (!state.suites.length) buildPlan();

  const format = getValue("scriptFormat") || "manual";
  const dataNotes = getValue("testDataNotes") || "Use approved QA data and document any unavailable values.";
  const projectName = getValue("projectName") || "Untitled QA Engagement";

  const manual = state.suites
    .map((suite, index) => {
      return [
        `TC-${String(index + 1).padStart(3, "0")} ${suite.name}`,
        `Objective: ${suite.focus}`,
        `Preconditions: ${dataNotes}`,
        "Steps:",
        "1. Review the latest approved requirement source and confirm expected behavior.",
        "2. Execute the primary happy path for the assigned platform and role.",
        "3. Validate content, data, links, tracking, error handling, and fallback states.",
        "4. Capture evidence for pass/fail decisions and log defects with severity.",
        "Expected Result: Experience matches requirements with no unresolved critical or high defects."
      ].join("\n");
    })
    .join("\n\n");

  const gherkin = state.suites
    .map((suite) => {
      return [
        `Feature: ${suite.name}`,
        `  As a QA analyst`,
        `  I want to validate ${suite.name.toLowerCase()} for ${projectName}`,
        "  So that release risk is visible before launch",
        "",
        "  Scenario: Validate documented behavior",
        "    Given the latest approved requirements are available",
        "    And the required test data and environment are ready",
        "    When I execute the covered workflow",
        "    Then the result should match the documented expectation",
        "    And any gap should be logged with severity, evidence, and owner"
      ].join("\n");
    })
    .join("\n\n");

  const output = format === "manual" ? manual : format === "gherkin" ? gherkin : `${manual}\n\n---\n\n${gherkin}`;
  state.scripts = output;
  setValue("scriptOutput", output);
  updateMetrics();
  buildReport();
  persistWorkspace();
  showToast("Test scripts generated.");
}

function scoreText(text) {
  const highRiskItems = [];
  let score = 0;

  riskSignals.forEach((signal) => {
    const matches = text.match(signal.pattern) || [];
    if (matches.length) {
      score += Math.min(matches.length * signal.weight, signal.weight * 3);
      highRiskItems.push(`${signal.label}: ${matches.length} signal${matches.length === 1 ? "" : "s"} found`);
    }
  });

  const knowledgeGaps = requiredKnowledge
    .filter((item) => !item.pattern.test(text))
    .map((item) => item.label);

  score += knowledgeGaps.length * 7;
  score = Math.min(score, 100);

  return { score, highRiskItems, knowledgeGaps };
}

function analyzeRisk() {
  const text = [
    getValue("scopeSummary"),
    getValue("constraints"),
    getValue("acceptanceCriteria"),
    getValue("documentationInput")
  ].join("\n\n");

  const analysis = scoreText(text);
  const severity = analysis.score >= 70 ? "High" : analysis.score >= 40 ? "Medium" : "Low";
  const highRiskItems = analysis.highRiskItems.length
    ? analysis.highRiskItems
    : ["No explicit high-risk keywords detected. Continue validating assumptions manually."];
  const mediumRiskItems = [
    "Confirm test environment stability and access before execution.",
    "Confirm final approval source and version-controlled requirements.",
    "Confirm defect triage owner and turnaround expectations."
  ];
  const lowRiskSignals = [
    "The tool found enough source material to draft a QA package.",
    "Generated outputs can be edited before export."
  ];

  state.risk = {
    score: analysis.score,
    highRiskItems,
    knowledgeGaps: analysis.knowledgeGaps,
    mediumRiskItems,
    lowRiskSignals
  };

  const gapText = analysis.knowledgeGaps.length
    ? analysis.knowledgeGaps.map((gap) => `- ${gap}`).join("\n")
    : "- No major knowledge gaps detected by the local analyzer.";

  const report = [
    `# Risk Analysis: ${getValue("projectName") || "Untitled QA Engagement"}`,
    "",
    `Overall Risk: ${severity} (${analysis.score}/100)`,
    "",
    "## High-Risk Items",
    highRiskItems.map((item) => `- ${item}`).join("\n"),
    "",
    "## Potential Knowledge Gaps",
    gapText,
    "",
    "## Recommended QA Follow-Up",
    "- Ask PMs to confirm any missing acceptance criteria, supported platforms, data rules, and approval owners.",
    "- Create traceability between each requirement and at least one test case.",
    "- Flag any unresolved dependency or approval issue before entering final regression.",
    "- Re-run this analysis whenever PM documentation changes."
  ].join("\n");

  setValue("riskOutput", report);
  renderRiskSummary();
  updateMetrics();
  buildReport();
  persistWorkspace();
  showToast("Risk analysis complete.");
}

function renderRiskSummary() {
  const container = byId("riskSummary");
  const riskClass = state.risk.score >= 70 ? "risk-high" : state.risk.score >= 40 ? "risk-medium" : "risk-low";
  container.innerHTML = `
    <article class="risk-card ${riskClass}">
      <strong>${state.risk.score}</strong>
      <p>Risk score</p>
    </article>
    <article class="risk-card risk-high">
      <strong>${state.risk.highRiskItems.length}</strong>
      <p>Risk signals</p>
    </article>
    <article class="risk-card risk-medium">
      <strong>${state.risk.knowledgeGaps.length}</strong>
      <p>Knowledge gaps</p>
    </article>
  `;
}

function buildReport() {
  const selected = Array.from(document.querySelectorAll(".report-section:checked")).map((item) => item.value);
  const projectName = getValue("projectName") || "Untitled QA Engagement";
  const sections = [
    `# QA Intelligence Report: ${projectName}`,
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Application / Channel: ${getValue("applicationArea") || "Not specified"}`,
    `Release Target: ${getValue("releaseTarget") || "Not specified"}`,
    `QA Owner: ${getValue("qaOwner") || "Not specified"}`
  ];

  if (selected.includes("plan")) {
    sections.push("", "## Test Plan", getValue("testPlanOutput") || "No test plan generated yet.");
  }

  if (selected.includes("scripts")) {
    sections.push("", "## Test Scripts", getValue("scriptOutput") || "No test scripts generated yet.");
  }

  if (selected.includes("risk")) {
    sections.push("", "## Risk Analysis", getValue("riskOutput") || "No risk analysis generated yet.");
  }

  if (selected.includes("gaps")) {
    const gaps = state.risk.knowledgeGaps.length
      ? state.risk.knowledgeGaps.map((gap) => `- ${gap}`).join("\n")
      : "- No knowledge gaps currently recorded.";
    sections.push("", "## Knowledge Gaps", gaps);
  }

  setValue("reportOutput", sections.join("\n"));
  persistWorkspace();
}

function updateMetrics() {
  byId("suiteCount").textContent = String(state.suites.length);
  byId("scriptCount").textContent = getValue("scriptOutput")
    ? String((getValue("scriptOutput").match(/TC-\d{3}|Feature:/g) || []).length)
    : "0";
  byId("riskScore").textContent = String(state.risk.score);
  renderReadiness();
}

function renderReadiness() {
  const items = [
    { label: "Project profile", ready: Boolean(getValue("projectName") && getValue("scopeSummary")) },
    { label: "Acceptance criteria", ready: Boolean(getValue("acceptanceCriteria")) },
    { label: "Test suites", ready: state.suites.length > 0 },
    { label: "Test scripts", ready: Boolean(getValue("scriptOutput")) },
    { label: "Risk analysis", ready: Boolean(getValue("riskOutput")) },
    { label: "Compiled report", ready: Boolean(getValue("reportOutput")) }
  ];

  byId("readinessList").innerHTML = items
    .map((item) => {
      const status = item.ready ? "Ready" : "Needed";
      const statusClass = item.ready ? "status-ready" : "status-needed";
      return `<div class="readiness-item"><span>${item.label}</span><span class="status-pill ${statusClass}">${status}</span></div>`;
    })
    .join("");
}

function saveStateDownload() {
  const saveStatePath = `save-states/${projectSaveStateFileName}`;
  const link = document.createElement("a");
  link.href = saveStatePath;
  link.download = projectSaveStateFileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast(`Downloaded ${projectSaveStateFileName}`);
}

function clearWorkspace() {
  fieldIds.forEach((id) => setValue(id, ""));
  state.suites = [];
  state.scripts = "";
  state.risk = { score: 0, highRiskItems: [], knowledgeGaps: [], mediumRiskItems: [], lowRiskSignals: [] };
  localStorage.removeItem("qa-intelligence-suite");
  renderSuites();
  renderRiskSummary();
  updateMetrics();
  showToast("Workspace cleared.");
}

function switchView(viewId) {
  document.querySelectorAll(".view").forEach((view) => view.classList.toggle("active", view.id === viewId));
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === viewId));
  const activeButton = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  byId("viewTitle").textContent = activeButton?.textContent.trim() || "Dashboard";
}

function wireEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  fieldIds.forEach((id) => {
    const element = byId(id);
    if (element) {
      element.addEventListener("input", () => {
        updateMetrics();
        if (["testPlanOutput", "scriptOutput", "riskOutput"].includes(id)) buildReport();
        persistWorkspace();
      });
    }
  });

  document.querySelectorAll(".report-section").forEach((item) => item.addEventListener("change", buildReport));
  byId("generatePlanBtn").addEventListener("click", buildPlan);
  byId("generateScriptsBtn").addEventListener("click", buildScripts);
  byId("analyzeRiskBtn").addEventListener("click", analyzeRisk);
  byId("generateAllBtn").addEventListener("click", () => {
    buildPlan();
    buildScripts();
    analyzeRisk();
    switchView("reports");
  });
  byId("clearWorkspaceBtn").addEventListener("click", clearWorkspace);
  byId("saveStateBtn").addEventListener("click", saveStateDownload);
  byId("exportFullReportBtn").addEventListener("click", () => {
    buildReport();
    downloadReport();
  });
  byId("downloadReportBtn").addEventListener("click", downloadReport);
  byId("copyReportBtn").addEventListener("click", async () => {
    buildReport();
    const reportOutput = byId("reportOutput");
    try {
      await navigator.clipboard.writeText(getValue("reportOutput"));
    } catch {
      reportOutput.focus();
      reportOutput.select();
      document.execCommand("copy");
    }
    showToast("Report copied to clipboard.");
  });
  byId("docUpload").addEventListener("change", handleUploads);
}

function downloadReport() {
  buildReport();
  const projectName = (getValue("projectName") || "qa-report").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  downloadFile(`${projectName}-${todayStamp()}-report.md`, getValue("reportOutput"));
  showToast("Report downloaded.");
}

async function handleUploads(event) {
  const files = Array.from(event.target.files || []);
  const chunks = [];
  const textExtensions = /\.(txt|md|csv|json|html|htm)$/i;
  for (const file of files) {
    if (textExtensions.test(file.name)) {
      const text = await file.text();
      chunks.push(`\n\n--- ${file.name} ---\n${text}`);
    } else {
      chunks.push([
        `\n\n--- ${file.name} ---`,
        "[File attached for analysis context.]",
        "This browser-only version cannot extract text from PDF, DOCX, PPTX, or XLSX files directly.",
        "Paste the key requirements, acceptance criteria, or PM notes into the documentation text box for full risk analysis."
      ].join("\n"));
    }
  }
  setValue("documentationInput", `${getValue("documentationInput")}${chunks.join("")}`.trim());
  persistWorkspace();
  showToast(`${files.length} documentation file${files.length === 1 ? "" : "s"} loaded.`);
}

restoreWorkspace();
wireEvents();
renderSuites();
renderRiskSummary();
updateMetrics();
buildReport();
