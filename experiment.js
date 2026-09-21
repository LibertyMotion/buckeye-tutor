export function createExperiment({ visitors = 0, actions = 0, threshold = 0.5 } = {}) {
  if (!Number.isInteger(visitors) || visitors < 0) throw new Error("visitors must be a nonnegative integer");
  if (!Number.isInteger(actions) || actions < 0) throw new Error("actions must be a nonnegative integer");
  if (actions > visitors && visitors !== 0) throw new Error("actions cannot exceed visitors");
  if (threshold < 0 || threshold > 1) throw new Error("threshold must be between zero and one");
  return { visitors, actions, threshold };
}

export function conversionRate(experiment) {
  return experiment.visitors === 0 ? 0 : experiment.actions / experiment.visitors;
}

export function evaluateExperiment(experiment) {
  if (experiment.visitors === 0) return "insufficient-data";
  return conversionRate(experiment) >= experiment.threshold ? "threshold-met" : "threshold-missed";
}

export function recordLocalAction(currentCount) {
  if (!Number.isInteger(currentCount) || currentCount < 0) throw new Error("count must be a nonnegative integer");
  return currentCount + 1;
}

// ---- Buckeye Tutor test ledger -------------------------------------------------------------
// One row per tester who was exposed to the page. `outcome` is what they did, not what they said.
//   requested: picked a priced tutor option and asked for a match   free / price / diy / later: declined, and why
//   left: finished the plan and chose nothing                       bounced: opened the page but never finished the plan

export const OUTCOMES = ["requested", "free", "price", "diy", "later", "left", "bounced"];

const median = (nums) => {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export function summarizeLedger(rows) {
  const requested = rows.filter((r) => r.outcome === "requested");
  const prices = requested.map((r) => r.price).filter(Number.isFinite);
  const lanes = { course: { exposed: 0, requested: 0 }, test: { exposed: 0, requested: 0 } };
  for (const row of rows) {
    if (!lanes[row.lane]) continue;
    lanes[row.lane].exposed += 1;
    if (row.outcome === "requested") lanes[row.lane].requested += 1;
  }
  return {
    exposed: rows.length,
    completed: rows.filter((r) => r.outcome !== "bounced").length,
    requested: requested.length,
    byOutcome: Object.fromEntries(OUTCOMES.map((o) => [o, rows.filter((r) => r.outcome === o).length])),
    byLane: lanes,
    meanPrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0,
    medianPrice: median(prices),
  };
}

// Applies the precommitted rule. The order matters: never call a result before the planned denominator.
export function evaluateRule(summary, rule) {
  const experiment = createExperiment({ visitors: summary.exposed, actions: summary.requested, threshold: rule.threshold });
  const primary = evaluateExperiment(experiment);
  const denominatorMet = summary.exposed >= rule.plannedDenominator;
  const guardrail = summary.requested === 0 ? "no-requests" : summary.meanPrice >= rule.priceGuardrail ? "met" : "missed";

  let decision = "keep-testing";
  if (denominatorMet) {
    if (primary === "threshold-met" && guardrail === "met") decision = "proceed";
    else if (primary === "threshold-met") decision = "reprice";
    else decision = "stop-and-pivot";
  }
  return { rate: conversionRate(experiment), primary, guardrail, denominatorMet, decision };
}
