// Pure planning logic: no DOM, no storage. Everything here is unit-tested.
//
// The plan is a transparent rule of thumb, not a grade guarantee. Sessions per week rise as
// confidence falls, and the plan is split into three phases (or fewer when time is short).

export const TIERS = {
  course: [
    { id: "group", label: "Small-group session", price: 12, unit: "per person, per hour", blurb: "3 to 4 students share one tutor. The lowest-cost way in." },
    { id: "peer", label: "Peer tutor", price: 20, unit: "per hour", blurb: "A student who earned an A or A- in your course." },
    { id: "expert", label: "Experienced tutor", price: 35, unit: "per hour", blurb: "Grad student, former TA, or working professional." },
  ],
  test: [
    { id: "coach", label: "Score coach", price: 60, unit: "per hour", blurb: "Scored well on the exam recently and coaches one-on-one." },
    { id: "specialist", label: "Top-percentile specialist", price: 95, unit: "per hour", blurb: "Independent specialist with a track record on this exam." },
  ],
};

export const URGENCY = {
  course: [
    { days: 5, label: "This week" },
    { days: 14, label: "In 2 to 3 weeks" },
    { days: 30, label: "In about a month" },
    { days: 70, label: "Later this term" },
  ],
  test: [
    { days: 30, label: "Within a month" },
    { days: 75, label: "In 2 to 3 months" },
    { days: 120, label: "4 or more months out" },
  ],
};

export const SUBJECT_SUGGESTIONS = {
  course: [
    "MATH 1150 Precalculus", "MATH 1151 Calculus I", "MATH 1152 Calculus II", "STAT 1450 Statistics",
    "ECON 2001.01 Microeconomics", "ECON 2002.01 Macroeconomics", "ACCTMIS 2200 Financial Accounting",
    "BUSFIN 3220 Business Finance", "CHEM 1210 General Chemistry I", "CHEM 2510 Organic Chemistry I",
    "PHYSICS 1200 Physics", "BIOLOGY 1113 Biology", "CSE 2221 Software I", "PSYCH 1100 Psychology",
  ],
  test: ["LSAT", "MCAT", "GRE", "GMAT", "DAT", "Excel for finance", "Coding interviews", "CPA exam"],
};

const SESSIONS_PER_WEEK = { 1: 2, 2: 1.5, 3: 1, 4: 0.5, 5: 0.25 };
export const MAX_SESSIONS = 16;

const PHASES = {
  course: {
    gaps: { name: "Find the gaps", note: "Bring your last graded work. The tutor finds the two or three topics costing you the most points." },
    build: { name: "Build and practice", note: "Worked problems with feedback, focused on those topics rather than re-reading the whole book." },
    review: { name: "Timed practice and review", note: "Old exams under time pressure, then patch what still breaks." },
    sprint: { name: "Triage sprint", note: "Too little time to cover everything. Rank topics by exam weight and fix the biggest ones first." },
  },
  test: {
    gaps: { name: "Diagnose", note: "Take a timed diagnostic and rank question types by points lost." },
    build: { name: "Build skills", note: "Targeted drills on your weakest question types, with strategy feedback." },
    review: { name: "Full-length practice", note: "Timed full sections or full exams, then review every miss." },
    sprint: { name: "Triage sprint", note: "Short runway. Drill the highest-yield question types and the timing plan." },
  },
};

export function weeksUntil(daysUntil) {
  return Math.max(1, Math.ceil(daysUntil / 7));
}

// Largest-remainder split so phase sessions always add up to the total.
export function allocate(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sum);
  const base = raw.map(Math.floor);
  let left = total - base.reduce((a, b) => a + b, 0);
  const byRemainder = raw.map((r, i) => [r - base[i], i]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of byRemainder) {
    if (left <= 0) break;
    base[i] += 1;
    left -= 1;
  }
  return base;
}

function phaseWeeks(weeks) {
  if (weeks === 1) return [["sprint", 1]];
  if (weeks === 2) return [["gaps", 1], ["review", 1]];
  const gaps = Math.max(1, Math.round(weeks * 0.25));
  const review = Math.max(1, Math.round(weeks * 0.25));
  return [["gaps", gaps], ["build", weeks - gaps - review], ["review", review]];
}

export function buildPlan({ lane, daysUntil, confidence }) {
  if (!TIERS[lane]) throw new Error("lane must be course or test");
  if (!Number.isFinite(daysUntil) || daysUntil < 1) throw new Error("daysUntil must be at least 1");
  if (!Number.isInteger(confidence) || confidence < 1 || confidence > 5) throw new Error("confidence must be an integer from 1 to 5");

  const weeks = weeksUntil(daysUntil);
  const raw = weeks * SESSIONS_PER_WEEK[confidence] * (weeks === 1 ? 1.5 : 1);
  const sessions = Math.min(MAX_SESSIONS, Math.max(1, Math.round(raw)));

  const shape = phaseWeeks(weeks);
  const perPhase = allocate(sessions, shape.map(([, w]) => w));
  const phases = shape.map(([key, w], i) => ({ key, ...PHASES[lane][key], weeks: w, sessions: perPhase[i] }));

  let verdict = "tutor";
  if (confidence === 5) verdict = "free-first";
  else if (weeks === 1 && confidence <= 2) verdict = "book-now";

  return {
    lane,
    weeks,
    sessions,
    capped: raw > MAX_SESSIONS,
    phases,
    verdict,
    options: TIERS[lane].map((tier) => ({ ...tier, total: tier.price * sessions })),
  };
}

export function tutorEarnings({ price, hoursPerWeek, takeRate, termWeeks }) {
  const perHour = price * (1 - takeRate);
  return { perHour, perWeek: perHour * hoursPerWeek, perTerm: perHour * hoursPerWeek * termWeeks };
}

export const money = (n) =>
  `$${n.toLocaleString("en-US", { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;

export function studentRequest({ lane, subject, daysUntil, confidence, plan, tier }) {
  const laneLabel = lane === "course" ? "Ohio State class" : "Test or specialty skill";
  return {
    subject: `Buckeye Tutor request: ${subject}`,
    body: [
      "Hi Buckeye Tutor team,",
      "",
      `I'd like a matched tutor for: ${subject}`,
      `Type: ${laneLabel}`,
      `Exam or deadline in about: ${daysUntil} days`,
      `My confidence right now: ${confidence} out of 5`,
      `Option I picked: ${tier.label} (${money(tier.price)} ${tier.unit})`,
      `Suggested plan: ${plan.sessions} session${plan.sessions === 1 ? "" : "s"} over ${plan.weeks} week${plan.weeks === 1 ? "" : "s"}, about ${money(tier.total)} total`,
      "",
      "Best times to reach me:",
      "",
      "Thanks!",
    ].join("\n"),
  };
}

export function tutorInterest({ subjects, hoursPerWeek, tier, earnings }) {
  return {
    subject: "Buckeye Tutor: I'd like to tutor",
    body: [
      "Hi Buckeye Tutor team,",
      "",
      `I could tutor: ${subjects}`,
      `Hours per week I could offer: ${hoursPerWeek}`,
      `Tier I'd want to be listed in: ${tier.label} (${money(tier.price)} per hour to the student)`,
      `That would pay me about ${money(earnings.perHour)} per hour.`,
      "",
      "A little about my background (course grades, exam scores, experience):",
      "",
      "Thanks!",
    ].join("\n"),
  };
}

export function mailtoHref(email, { subject, body }) {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
