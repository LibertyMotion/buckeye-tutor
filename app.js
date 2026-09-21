import { CONTACT_EMAIL, RULE, TAKE_RATE, TERM_WEEKS } from "./config.js";
import { SUBJECT_SUGGESTIONS, TIERS, URGENCY, buildPlan, mailtoHref, money, studentRequest, tutorEarnings, tutorInterest } from "./planner.js";
import { $, copyText, h, icon } from "./dom.js";
import { RUNS_KEY, TUTOR_KEY, newId, readJSON, writeJSON } from "./storage.js";

// ---- Numbers that come from config.js, so the page can never disagree with the rule ---------
const minRequests = Math.ceil(RULE.threshold * RULE.plannedDenominator);
for (const el of document.querySelectorAll("[data-rule-min]")) el.textContent = `${minRequests} (${Math.round(RULE.threshold * 100)}%)`;
for (const el of document.querySelectorAll("[data-rule-n]")) el.textContent = String(RULE.plannedDenominator);
for (const el of document.querySelectorAll("[data-rule-price]")) el.textContent = money(RULE.priceGuardrail);
for (const el of document.querySelectorAll("[data-take-rate]")) el.textContent = `${Math.round(TAKE_RATE * 100)}%`;
for (const el of document.querySelectorAll("[data-take-keep]")) el.textContent = `${Math.round((1 - TAKE_RATE) * 100)}%`;

// ---- Student planner --------------------------------------------------------------------------
const form = $("#planner-form");
const result = $("#result");
const subjectInput = $("#subject");
const subjectError = $("#subject-error");
const confError = $("#conf-error");
const emptyState = result.innerHTML;

const OTHER_LANE = { course: "test", test: "course" };

function fillLaneOptions() {
  const lane = form.elements.lane.value;
  $("#subject-options").replaceChildren(...SUBJECT_SUGGESTIONS[lane].map((s) => h("option", { value: s })));
  $("#subject-label").textContent = lane === "course" ? "Which course?" : "Which test or skill?";
  $("#when").replaceChildren(...URGENCY[lane].map((u) => h("option", { value: u.days, text: u.label })));
  if (SUBJECT_SUGGESTIONS[OTHER_LANE[lane]].includes(subjectInput.value)) subjectInput.value = "";
}

function showError(el, input, message) {
  el.textContent = message;
  el.hidden = false;
  input?.setAttribute("aria-invalid", "true");
}
function clearErrors() {
  for (const el of [subjectError, confError]) { el.hidden = true; el.textContent = ""; }
  subjectInput.removeAttribute("aria-invalid");
}

function saveRun(run) {
  const runs = readJSON(RUNS_KEY, []);
  const index = runs.findIndex((r) => r.id === run.id);
  if (index >= 0) runs[index] = run;
  else runs.push(run);
  writeJSON(RUNS_KEY, runs.slice(-200));
}

for (const radio of form.elements.lane) radio.addEventListener("change", fillLaneOptions);
fillLaneOptions();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  clearErrors();
  const lane = form.elements.lane.value;
  const subject = subjectInput.value.trim().replace(/\s+/g, " ");
  const confidence = Number(form.elements.confidence.value);
  const daysUntil = Number($("#when").value);

  let firstInvalid = null;
  if (subject.length < 2) {
    showError(subjectError, subjectInput, lane === "course" ? "Enter your course, for example MATH 1152." : "Enter your test or skill, for example LSAT.");
    firstInvalid = subjectInput;
  }
  if (!confidence) {
    showError(confError, null, "Pick a number from 1 (lost) to 5 (solid).");
    firstInvalid ??= form.elements.confidence[0];
  }
  if (firstInvalid) return firstInvalid.focus();

  const plan = buildPlan({ lane, daysUntil, confidence });
  const run = { id: newId(), at: new Date().toISOString(), lane, subject, daysUntil, confidence, outcome: null, tier: null, price: null };
  saveRun(run);
  renderPlan(run, plan);
});

const VERDICTS = {
  "free-first": { good: true, text: "You're in good shape. Try the free options below and take a timed practice test first. A tutor is optional, and one session can pressure-test your prep." },
  "book-now": { good: false, text: "Time is tight. The earliest sessions matter most, so request a match now rather than next week." },
  tutor: { good: false, text: "Based on your timeline and confidence, this is the pace we'd suggest." },
};

const FREE_OPTIONS = {
  course: {
    items: [
      "Your instructor's or TA's office hours. Free, and they write the exam.",
      "Ohio State's Younkin Success Center, for tutoring and study coaching.",
      "The Math and Statistics Learning Center, if your course is math or stats.",
      "The Dennis Learning Center, for study-skills coaching.",
    ],
    note: "Check each service's current hours and eligibility. We are not affiliated with them.",
  },
  test: {
    items: [
      "The test maker's free diagnostic or sample exam. Most publish one. Take it timed before you pay anyone.",
      "Official practice questions from the test maker.",
      "Free video lessons and question banks. Good for content review, weaker for personal feedback.",
    ],
    note: "A tutor helps most once you have a diagnostic to react to.",
  },
};

const DECLINES = [
  { outcome: "free", label: "Campus help is enough" },
  { outcome: "price", label: "Too expensive" },
  { outcome: "diy", label: "I'll study on my own" },
  { outcome: "later", label: "Not right now" },
];

const DECLINE_REPLIES = {
  free: "Smart. Start with the free options above. If you're still stuck a week before the exam, come back.",
  price: "Thanks for being straight with us. Price is exactly what we're testing, and this helps.",
  diy: "Fair enough. Good luck with the exam.",
  later: "No problem. This page will be here when the exam gets closer.",
};

function renderPlan(run, plan) {
  const verdict = VERDICTS[plan.verdict];
  const free = FREE_OPTIONS[run.lane];
  const tierError = h("p", { class: "error", role: "alert", hidden: true });
  const confirm = h("div", { class: "confirm", tabindex: "-1", hidden: true });

  const tiers = h("fieldset", { class: "tiers" },
    h("legend", { text: "Which tutor option would you book?" }),
    plan.options.map((option) =>
      h("label", { class: "choice" },
        h("input", { type: "radio", name: "tier", value: option.id }),
        h("span", { class: "choice-body" },
          h("span", { class: "tier-body" },
            h("strong", { text: option.label }),
            h("span", { class: "price", text: `${money(option.price)}/hr` }),
            h("small", { text: option.blurb }),
            h("span", { class: "total", text: `About ${money(option.total)}${option.unit.includes("person") ? " per person" : ""} for this plan (${plan.sessions} x ${money(option.price)})` }),
          ),
        ),
      ),
    ),
    tierError,
  );

  const requestButton = h("button", { class: "btn btn-primary btn-block", type: "button" }, "Request this match ", icon("arrow"));
  requestButton.addEventListener("click", () => {
    const picked = tiers.querySelector("input:checked");
    if (!picked) {
      tierError.textContent = "Choose a tutor option first, or tell us why none fit below.";
      tierError.hidden = false;
      return tiers.querySelector("input").focus();
    }
    tierError.hidden = true;
    const tier = plan.options.find((o) => o.id === picked.value);
    finalize(run, plan, "requested", tier, choose, confirm);
  });

  const declineButtons = DECLINES.map(({ outcome, label }) =>
    h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: () => finalize(run, plan, outcome, null, choose, confirm) }, label),
  );

  const choose = h("div", { class: "choose" },
    tiers,
    h("div", { class: "actions" }, requestButton),
    h("div", { class: "decline" }, h("p", { text: "Not for you? Tell us why. It helps." }), h("div", { class: "row" }, declineButtons)),
  );

  const heading = h("h3", { tabindex: "-1", text: `Your plan for ${run.subject}` });
  const view = h("div", { class: "card plan" },
    heading,
    h("p", { class: `verdict${verdict.good ? " good" : ""}`, text: verdict.text }),
    h("dl", { class: "stats" },
      h("div", {}, h("dt", { text: "Sessions" }), h("dd", { text: String(plan.sessions) })),
      h("div", {}, h("dt", { text: "Weeks" }), h("dd", { text: String(plan.weeks) })),
      h("div", {}, h("dt", { text: "Hours" }), h("dd", { text: String(plan.sessions) })),
    ),
    plan.capped ? h("p", { class: "help", text: "Plans are capped at 16 sessions. If you need more, re-plan halfway through." }) : null,
    h("div", {},
      h("h4", { text: "The plan, phase by phase" }),
      h("ol", { class: "phases" }, plan.phases.map((phase) =>
        h("li", {},
          h("div", { class: "phase-head" }, h("span", { text: phase.name }), h("span", { text: `${phase.weeks} week${phase.weeks === 1 ? "" : "s"} · ${phase.sessions} session${phase.sessions === 1 ? "" : "s"}` })),
          h("div", { class: "bar", "aria-hidden": "true" }, h("i", { style: `--w:${Math.round((phase.weeks / plan.weeks) * 100)}%` })),
          h("p", { text: phase.note }),
        ),
      )),
    ),
    h("div", { class: "free" },
      h("h4", { text: "Try these free options first" }),
      h("ul", {}, free.items.map((item) => h("li", { text: item }))),
      h("p", { text: free.note }),
    ),
    choose,
    confirm,
  );

  result.replaceChildren(view);
  heading.focus({ preventScroll: false });
}

function finalize(run, plan, outcome, tier, choose, confirm) {
  run.outcome = outcome;
  run.tier = tier?.id ?? null;
  run.price = tier?.price ?? null;
  saveRun(run);
  for (const control of choose.querySelectorAll("input, button")) control.disabled = true;

  confirm.replaceChildren();
  confirm.hidden = false;
  if (outcome === "requested") {
    const draft = studentRequest({ lane: run.lane, subject: run.subject, daysUntil: run.daysUntil, confidence: run.confidence, plan, tier });
    renderDraft(confirm, draft, "Your request is drafted", CONTACT_EMAIL
      ? "We reply within 48 hours. Nothing has been sent yet: your email app opens with this draft, and you choose whether to send it."
      : "Nothing has been sent yet. Copy this request and send it to the Buckeye Tutor team. We reply within 48 hours.");
  } else {
    confirm.append(h("h4", { text: "Thanks. That's useful." }), h("p", { text: DECLINE_REPLIES[outcome] }));
  }
  const again = h("button", { class: "btn btn-ghost btn-sm", type: "button" }, "Start over");
  again.addEventListener("click", () => {
    result.innerHTML = emptyState;
    form.reset();
    fillLaneOptions();
    clearErrors();
    subjectInput.focus();
  });
  confirm.append(h("div", { class: "row" }, again));
  confirm.focus();
}

// Shared by the student request and the tutor sign-up: show the draft, offer mail + copy.
function renderDraft(container, draft, title, blurb) {
  const preview = h("pre", { text: draft.body });
  const status = h("p", { class: "status", role: "status" });
  const buttons = [];
  if (CONTACT_EMAIL) {
    buttons.push(h("a", { class: "btn btn-primary btn-sm", href: mailtoHref(CONTACT_EMAIL, draft) }, icon("mail"), "Open email draft"));
  }
  const copy = h("button", { class: `btn ${CONTACT_EMAIL ? "btn-ghost" : "btn-primary"} btn-sm`, type: "button" }, icon("copy"), "Copy request");
  copy.addEventListener("click", () => copyText(`Subject: ${draft.subject}\n\n${draft.body}`, preview, status, "Copied. Paste it into an email or message to the team."));
  buttons.push(copy);
  container.append(h("h4", { text: title }), h("p", { text: blurb }), preview, h("div", { class: "row" }, buttons), status);
}

// ---- Tutor side -------------------------------------------------------------------------------
const tutorForm = $("#tutor-form");
const hours = $("#thours");
const tierSelect = $("#ttier");
const tutorOut = $("#tutor-out");

// Group sessions are priced per student, so tutors list at one-to-one levels.
const tutorTiers = (lane) => TIERS[lane].filter((t) => t.id !== "group");

function fillTutorTiers() {
  const lane = tutorForm.elements.tlane.value;
  tierSelect.replaceChildren(...tutorTiers(lane).map((t) => h("option", { value: t.id, text: `${t.label}: students pay ${money(t.price)}/hr` })));
  updateEarnings();
}

function currentEarnings() {
  const lane = tutorForm.elements.tlane.value;
  const tier = tutorTiers(lane).find((t) => t.id === tierSelect.value) ?? tutorTiers(lane)[0];
  const hoursPerWeek = Number(hours.value);
  return { lane, tier, hoursPerWeek, earnings: tutorEarnings({ price: tier.price, hoursPerWeek, takeRate: TAKE_RATE, termWeeks: TERM_WEEKS }) };
}

function updateEarnings() {
  const { earnings, hoursPerWeek } = currentEarnings();
  $("#thours-out").textContent = String(hoursPerWeek);
  $("#e-hour").textContent = money(earnings.perHour);
  $("#e-week").textContent = money(earnings.perWeek);
  $("#e-term").textContent = money(earnings.perTerm);
}

for (const radio of tutorForm.elements.tlane) radio.addEventListener("change", fillTutorTiers);
tierSelect.addEventListener("change", updateEarnings);
hours.addEventListener("input", updateEarnings);
fillTutorTiers();

tutorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const subjects = $("#tsubjects").value.trim().replace(/\s+/g, " ");
  const error = $("#tsub-error");
  if (subjects.length < 2) {
    error.textContent = "Tell us which class or test you'd tutor.";
    error.hidden = false;
    $("#tsubjects").setAttribute("aria-invalid", "true");
    return $("#tsubjects").focus();
  }
  error.hidden = true;
  $("#tsubjects").removeAttribute("aria-invalid");

  const { lane, tier, hoursPerWeek, earnings } = currentEarnings();
  const interest = readJSON(TUTOR_KEY, []);
  interest.push({ id: newId(), at: new Date().toISOString(), lane, tier: tier.id, hoursPerWeek });
  writeJSON(TUTOR_KEY, interest.slice(-200));

  tutorOut.replaceChildren();
  tutorOut.hidden = false;
  renderDraft(tutorOut, tutorInterest({ subjects, hoursPerWeek, tier, earnings }), "Your email is drafted", CONTACT_EMAIL
    ? "Nothing has been sent yet. Add a line about your background and send it when you're ready."
    : "Nothing has been sent yet. Copy this, add a line about your background, and send it to the Buckeye Tutor team.");
  tutorOut.focus();
});
