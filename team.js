import { CONTACT_EMAIL, RULE } from "./config.js";
import { DEFAULTS, PRESETS, unitEconomics } from "./economics.js";
import { OUTCOMES, evaluateRule, summarizeLedger } from "./experiment.js";
import { TIERS, money } from "./planner.js";
import { $, copyText, h, icon } from "./dom.js";
import { EMAILS_KEY, LEDGER_KEY, RUNS_KEY, TUTOR_KEY, newId, readJSON, writeJSON } from "./storage.js";

const OUTCOME_LABELS = {
  requested: "Asked for a match (picked a priced option)",
  free: "Declined: campus help is enough",
  price: "Declined: too expensive",
  diy: "Declined: will study on their own",
  later: "Declined: not right now",
  left: "Finished the plan, chose nothing",
  bounced: "Opened the page, did not finish the plan",
};
const SHORT_LABELS = { requested: "Asked for match", free: "Free is enough", price: "Too expensive", diy: "Study alone", later: "Not now", left: "Chose nothing", bounced: "Bounced" };

const DECISIONS = {
  "keep-testing": { good: false, title: "Keep testing", text: (s) => `Only ${s.exposed} of ${RULE.plannedDenominator} planned testers so far. The rule says no call before the full denominator.` },
  proceed: { good: true, title: "Proceed", text: () => "Threshold and price guardrail both met. Recruit the first 5 tutors for the most-requested courses and run a two-week paid pilot at the median chosen price." },
  reprice: { good: false, title: "Demand yes, economics no", text: () => "Enough testers asked, but the options they chose average below the price guardrail. Do not build yet: test the higher-priced lane or bundle sessions first." },
  "stop-and-pivot": { good: false, title: "Stop and pivot", text: () => "Threshold missed. Stop building matching software. Run five problem interviews using the decline reasons, then retest one narrower segment with 10 new testers." },
};

const pct = (n) => `${(n * 100).toFixed(0)}%`;
let rows = readJSON(LEDGER_KEY, []);
const saveRows = () => writeJSON(LEDGER_KEY, rows);

// ---- Static panels -----------------------------------------------------------------------------
const minRequests = Math.ceil(RULE.threshold * RULE.plannedDenominator);
$("#rule-kv").replaceChildren(...[
  ["Segment", "Ohio State undergraduates with an exam or test this term"],
  ["Test action", "Finish the plan, see priced options, and request a matched tutor"],
  ["Denominator", `${RULE.plannedDenominator} exposed testers`],
  ["Threshold", `${minRequests} of ${RULE.plannedDenominator} (${pct(RULE.threshold)}) request a match`],
  ["Price guardrail", `Requesters' mean chosen price at least ${money(RULE.priceGuardrail)}/hr`],
].flatMap(([k, v]) => [h("dt", { text: k }), h("dd", { text: v })]));

const checks = [
  [Boolean(CONTACT_EMAIL), CONTACT_EMAIL ? "Request email is set in config.js" : "Set CONTACT_EMAIL in config.js so requests reach the team"],
  [null, "Commit config.js and EXPERIMENT.md before the first tester"],
  [null, "Open the live URL in a private window and on a second device"],
  [null, "Tell every tester what this is and what is (not) collected"],
];
$("#setup-list").replaceChildren(...checks.map(([ok, text]) =>
  h("li", { class: ok === null ? "" : ok ? "ok" : "bad" }, ok === null ? h("span", { "aria-hidden": "true", text: "□" }) : ok ? icon("check") : icon("x"), h("span", { text })),
));

// ---- Log form ----------------------------------------------------------------------------------
const logForm = $("#log-form");
const laneSel = $("#l-lane");
const outcomeSel = $("#l-outcome");
const priceSel = $("#l-price");
outcomeSel.replaceChildren(...OUTCOMES.map((o) => h("option", { value: o, text: OUTCOME_LABELS[o] })));

function syncPrice() {
  priceSel.replaceChildren(...TIERS[laneSel.value].map((t) => h("option", { value: t.price, text: `${t.label} (${money(t.price)}/hr)` })));
  $("#l-price-field").hidden = outcomeSel.value !== "requested";
}
laneSel.addEventListener("change", syncPrice);
outcomeSel.addEventListener("change", syncPrice);
syncPrice();

logForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const outcome = outcomeSel.value;
  rows.push({
    id: newId(), source: "manual", at: new Date().toISOString(), lane: laneSel.value, outcome,
    price: outcome === "requested" ? Number(priceSel.value) : null,
    note: $("#l-note").value.trim().slice(0, 120),
  });
  saveRows();
  $("#l-note").value = "";
  $("#log-status").textContent = `Added. Ledger now has ${rows.length} tester${rows.length === 1 ? "" : "s"}.`;
  render();
});

$("#import-btn").addEventListener("click", () => {
  const seen = new Set(rows.map((r) => r.deviceRunId).filter(Boolean));
  const fresh = readJSON(RUNS_KEY, []).filter((run) => !seen.has(run.id));
  for (const run of fresh) {
    rows.push({ id: newId(), source: "device", deviceRunId: run.id, at: run.at, lane: run.lane, outcome: run.outcome ?? "left", price: run.outcome === "requested" ? run.price : null, note: "" });
  }
  saveRows();
  $("#import-status").textContent = fresh.length ? `Imported ${fresh.length} run${fresh.length === 1 ? "" : "s"} from this device.` : "Nothing new to import.";
  render();
});

const emailsInput = $("#emails");
emailsInput.value = String(readJSON(EMAILS_KEY, 0));
emailsInput.addEventListener("input", () => {
  const n = Math.max(0, Math.floor(Number(emailsInput.value) || 0));
  writeJSON(EMAILS_KEY, n);
  render();
});
$("#tutor-count").textContent = `Tutor sign-ups drafted on this device: ${readJSON(TUTOR_KEY, []).length}`;

$("#clear-btn").addEventListener("click", () => {
  if (rows.length === 0) return;
  if (!confirm(`Delete all ${rows.length} ledger rows? This cannot be undone.`)) return;
  rows = [];
  saveRows();
  render();
});

// ---- Rendering ---------------------------------------------------------------------------------
function exportText(summary, verdict) {
  const emails = readJSON(EMAILS_KEY, 0);
  const notes = rows.filter((r) => r.note).map((r, i) => `  ${i + 1}. ${r.note}`);
  const declines = ["free", "price", "diy", "later"].map((o) => `${SHORT_LABELS[o]} ${summary.byOutcome[o]}`).join(", ");
  return [
    "- Date and setting: [add date, place, and how testers were recruited]",
    "- Target segment: Ohio State undergraduates with an exam or test this term",
    `- Number invited/exposed: ${summary.exposed}`,
    `- Number who reached the test action (finished the plan): ${summary.completed}`,
    `- Number who completed the action (asked for a match): ${summary.requested}`,
    `- Observed behavior: bounced ${summary.byOutcome.bounced}, chose nothing ${summary.byOutcome.left}, declined (${declines})`,
    `- By lane: class ${summary.byLane.course.requested}/${summary.byLane.course.exposed} requested, test/specialty ${summary.byLane.test.requested}/${summary.byLane.test.exposed} requested`,
    `- Mean chosen price among requesters: ${summary.requested ? money(Number(summary.meanPrice.toFixed(2))) : "n/a"}/hr (median ${summary.requested ? money(summary.medianPrice) : "n/a"}); guardrail ${money(RULE.priceGuardrail)}: ${verdict.guardrail}`,
    `- Emails actually received in the inbox: ${emails}`,
    `- Result compared with the precommitted threshold: ${summary.requested}/${summary.exposed} = ${pct(verdict.rate)} vs ${pct(RULE.threshold)} (needed ${minRequests} of ${RULE.plannedDenominator}); rule outcome: ${verdict.decision}`,
    "- Friction observed (no names):",
    ...(notes.length ? notes : ["  (none logged)"]),
    "- What the evidence does and does not support: [write this yourselves]",
  ].join("\n");
}

// Before the planned denominator is reached, a result is provisional and must not read as a verdict.
function thresholdLabel(verdict) {
  if (verdict.primary === "insufficient-data") return "Insufficient data";
  const met = verdict.primary === "threshold-met";
  if (!verdict.denominatorMet) return met ? "Provisional: on pace" : "Provisional: behind pace";
  return met ? "Met" : "Missed";
}

function render() {
  const summary = summarizeLedger(rows);
  const verdict = evaluateRule(summary, RULE);
  const decision = DECISIONS[verdict.decision];

  $("#result-card").replaceChildren(
    h("div", { class: "funnel" },
      h("div", {}, h("strong", { text: String(summary.exposed) }), h("span", { text: "Exposed" })),
      h("div", {}, h("strong", { text: String(summary.completed) }), h("span", { text: "Finished plan" })),
      h("div", {}, h("strong", { text: String(summary.requested) }), h("span", { text: "Asked for match" })),
    ),
    h("dl", { class: "kv" },
      h("dt", { text: "Request rate" }), h("dd", { text: summary.exposed ? `${summary.requested} of ${summary.exposed} = ${pct(verdict.rate)} (threshold ${pct(RULE.threshold)})` : "No testers logged yet" }),
      h("dt", { text: "Threshold" }), h("dd", {}, h("span", { class: `badge ${verdict.primary === "threshold-met" ? "good" : verdict.primary === "threshold-missed" ? "bad" : ""}`, text: thresholdLabel(verdict) })),
      h("dt", { text: "Price guardrail" }), h("dd", {}, summary.requested ? `Mean ${money(Number(summary.meanPrice.toFixed(2)))}/hr vs ${money(RULE.priceGuardrail)} needed: ` : "No requests yet ", summary.requested ? h("span", { class: `badge ${verdict.guardrail === "met" ? "good" : "bad"}`, text: verdict.guardrail === "met" ? "Met" : "Missed" }) : null),
      h("dt", { text: "Denominator" }), h("dd", { text: `${summary.exposed} of ${RULE.plannedDenominator} planned` }),
      h("dt", { text: "Emails received" }), h("dd", { text: String(readJSON(EMAILS_KEY, 0)) }),
    ),
    h("div", { class: `decision${decision.good ? " good" : ""}` }, h("strong", { text: `Rule outcome: ${decision.title}. ` }), decision.text(summary)),
  );

  const table = rows.length === 0
    ? h("p", { class: "help", text: "No testers logged yet." })
    : h("table", {},
      h("thead", {}, h("tr", {}, ...["#", "Lane", "Outcome", "Price", "Note", "Source", ""].map((c, i) => h("th", { class: c === "Price" ? "num" : "", scope: "col", text: c })))),
      h("tbody", {}, rows.map((row, i) =>
        h("tr", {},
          h("td", { text: String(i + 1) }),
          h("td", { text: row.lane === "course" ? "Class" : "Test" }),
          h("td", { text: SHORT_LABELS[row.outcome] }),
          h("td", { class: "num", text: row.price ? money(row.price) : "" }),
          h("td", { text: row.note }),
          h("td", { text: row.source }),
          h("td", {}, h("button", { class: "btn btn-ghost btn-sm", type: "button", "aria-label": `Delete row ${i + 1}`, onclick: () => { rows = rows.filter((r) => r.id !== row.id); saveRows(); render(); } }, "Delete")),
        ),
      )),
    );
  $("#ledger").replaceChildren(table);
  $("#export-text").value = exportText(summary, verdict);
}

$("#copy-btn").addEventListener("click", () => copyText($("#export-text").value, $("#export-text"), $("#copy-status"), "Copied. Paste it into EVIDENCE.md."));

// ---- Unit economics ----------------------------------------------------------------------------
const inputs = { price: $("#c-price"), take: $("#c-take"), sess: $("#c-sess"), sem: $("#c-sem"), cac: $("#c-cac"), fixed: $("#c-fixed") };
const presetBox = $("#presets");

function setInputs(v) {
  inputs.price.value = v.price;
  inputs.take.value = Math.round((v.takeRate ?? DEFAULTS.takeRate) * 100);
  inputs.sess.value = v.sessionsPerSemester ?? DEFAULTS.sessionsPerSemester;
  inputs.sem.value = v.semesters ?? DEFAULTS.semesters;
  inputs.cac.value = v.cac ?? DEFAULTS.cac;
  inputs.fixed.value = v.fixedPerMonth ?? DEFAULTS.fixedPerMonth;
}

function renderEconomics() {
  const num = (el, fallback) => (Number.isFinite(el.valueAsNumber) ? el.valueAsNumber : fallback);
  const e = unitEconomics({
    price: num(inputs.price, DEFAULTS.price),
    takeRate: num(inputs.take, DEFAULTS.takeRate * 100) / 100,
    sessionsPerSemester: num(inputs.sess, DEFAULTS.sessionsPerSemester),
    semesters: num(inputs.sem, DEFAULTS.semesters),
    cac: num(inputs.cac, DEFAULTS.cac),
    fixedPerMonth: num(inputs.fixed, DEFAULTS.fixedPerMonth),
  });
  const cell = (label, value) => h("div", {}, h("span", { text: label }), h("strong", { text: value }));
  const fin = (n, f) => (Number.isFinite(n) ? f(n) : "Never");
  $("#econ-out").replaceChildren(
    cell("We keep per hour", money(Number(e.revenuePerHour.toFixed(2)))),
    cell("Card fees per hour", money(Number(e.fee.toFixed(2)))),
    cell("Contribution per hour", money(Number(e.contributionPerHour.toFixed(2)))),
    cell("Tutor is paid per hour", money(Number(e.tutorPayPerHour.toFixed(2)))),
    cell("Contribution per semester", money(Number(e.contributionPerSemester.toFixed(2)))),
    cell("Lifetime contribution", money(Number(e.ltv.toFixed(2)))),
    cell("Lifetime / acquisition cost", fin(e.ltvToCac, (n) => `${n.toFixed(1)}x`)),
    cell("Sessions to repay acquisition", fin(e.sessionsToPayBackCac, (n) => n.toFixed(1))),
    cell("Hours/month to cover fixed", fin(e.hoursToCoverFixedPerMonth, (n) => n.toFixed(1))),
  );
  presetBox.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.price) === num(inputs.price, 0))));
}

presetBox.replaceChildren(...PRESETS.map((p) => h("button", { class: "btn btn-ghost btn-sm", type: "button", "data-price": String(p.price), "aria-pressed": "false", onclick: () => { setInputs(p); renderEconomics(); } }, p.label)));
Object.values(inputs).forEach((el) => el.addEventListener("input", renderEconomics));
setInputs(DEFAULTS);
renderEconomics();
render();
