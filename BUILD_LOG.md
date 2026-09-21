# AI and Build Log

**Candor first.** The code, copy, and first drafts of these documents were produced with an AI coding
assistant (Claude Code, using a UI/UX design-guidance skill) in one working session on 2026-09-20, starting
from the course's `busfin4215-mvp-starter`. The team is responsible for everything below. Cells marked
**[TEAM]** are for you to complete honestly; the AI cannot know what you decided or overruled.

| Time | Specification or prompt | What changed | What we inspected or tested | Human judgment |
|---|---|---|---|---|
| 2026-09-20, session start | Build an MVP landing page for Buckeye Tutor that "provides utility and gauges demand"; assignment brief and rubric pasted in; "a polished page that tests nothing is weak." | AI read the starter repo, its README, `EXPERIMENT.md` and tests. Found the starter requires no backend, no personal data, and manual denominators, so the design was built around those constraints. | Read the starter's files and example page; ran its tests. | **[TEAM]** Chose the idea, name, and the two customer lanes (class tutors, independent specialists). |
| Design pass | UI/UX design-system lookup for an education marketplace; override for a collegiate look. | Scarlet-and-gray block style, Barlow Condensed + Barlow type, light and dark tokens. The tool's default purple "kids" font pairing was rejected as wrong for college students. | Checked contrast pairs, focus rings, reduced-motion, 375px width. | **[TEAM]** Confirm you're comfortable with the visual identity. We use our own mark and Ohio State colors only, no logos, plus a non-affiliation notice. |
| Product build | "Meaningful interaction, not decoration." | `planner.js` + `app.js`: a 60-second tutor-plan generator (class or test, exam date, confidence -> phased session plan and cost at every price tier), free campus options shown first, then **Request this match** or a logged decline reason. | 27 unit tests (`npm test`) incl. that the hero example equals real planner output; drove the full flow in a real browser: validation errors, request, each decline, start over, both lanes, tutor form. | **[TEAM]** The sessions-per-week rule of thumb is AI-invented. Decide whether you believe it or replace it. |
| Test instrument | Starter demands denominators and a precommitted rule. | `experiment.js` extended (kept starter functions): ledger summary and `evaluateRule`, which refuses to call a result before the planned denominator. `team.html`: ledger, result vs. rule, evidence export, economics calculator. | Tests for proceed / reprice / stop-and-pivot / keep-testing / empty ledger; browser-checked import dedupe and export text with **synthetic** rows, then cleared them. | **[TEAM]** Confirm the threshold (25% of 20) and price guardrail ($25/hr) *before* testing, and commit them. |
| Self-review fixes | Own inspection of the rendered pages. | Fixed: confirmation text claimed "your email app opens" when no email is configured; "Threshold: Met" on a 1-of-1 sample now reads "Provisional"; console header inverted in dark mode; `$1045` -> `$1,045`. | Re-ran tests and browser flows after each fix. | Bugs were found by inspection, not by users. See `REVISION_RECEIPT.md`. |
| Documents | Fill the five required documents without inventing evidence. | Drafted `EXPERIMENT.md`, `ECONOMICS.md`; left `EVIDENCE.md` and `REVISION_RECEIPT.md` as honest templates. | Economics figures computed by tested code, not typed by hand. | **[TEAM]** Every economics input is an unvalidated assumption. Change any you disagree with. |

## Things the AI supplied that a human must verify

- Names of Ohio State support services on the page (Younkin Success Center, Math and Statistics Learning
  Center, Dennis Learning Center) and the example course numbers. Confirm they exist and are described correctly.
- Tutor price tiers, the 20% take rate, and every unit-economics input.
- The promise **"we reply within 48 hours."** Only ship it if you will actually do it.
- Whether "Buckeye" plus a non-affiliation notice is acceptable for the name.

## Team ownership

- Team members: **[TEAM: names]**
- Who owned the current product path: **[TEAM]**
- Who owned the test and evidence: **[TEAM]**
- Who owned the economics: **[TEAM]**
- Important limitation the team can explain candidly: The MVP is a *concierge* prototype. No tutors are recruited,
  no payment exists, and "matching" is a person reading an email. It measures whether students *ask* for a priced
  match, not whether they would pay, rebook, or stay on-platform. The tutor plan is a rule of thumb, not
  evidence that tutoring improves grades.
