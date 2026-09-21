// Single place for the values the team must own. Everything else reads from here.

// PLACEHOLDER for the class assignment: ".example" is a reserved domain, so this address can never receive mail.
// To collect real requests, replace it with an inbox the team checks. Leave "" to show only a Copy button.
export const CONTACT_EMAIL = "hello@buckeyetutor.example";

// Share of each session price that Buckeye Tutor keeps. The tutor keeps the rest.
export const TAKE_RATE = 0.2;

// Weeks in an academic term, used only for the tutor earnings estimate.
export const TERM_WEEKS = 15;

// PRECOMMITTED DECISION RULE (mirrors EXPERIMENT.md). Commit this file BEFORE running the test;
// the git timestamp is the receipt that the threshold was written before the data.
export const RULE = {
  plannedDenominator: 20, // testers we intend to expose before judging
  threshold: 0.25, // share of exposed testers who must request a matched tutor
  priceGuardrail: 25, // requesters' mean chosen price ($/hr) must reach this for the economics to work
};
