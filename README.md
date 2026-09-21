# Buckeye Tutor

A concierge MVP for the BUSFIN 4215 venture project. Ohio State students enter a class or a test (LSAT, MCAT,
GRE...) and an exam date, get a phased tutor plan with real prices and free campus options, then either
**request a hand-matched tutor** or tell us why not. Built to test one consequential hypothesis, not to look finished.

- Landing page and planner: `index.html`
- Team test console (rule, ledger, evidence export, unit economics): `team.html`
- **No backend, no accounts, no personal data.** Everything a tester enters stays in their browser.

## Run and test

```bash
npm test          # 27 unit tests: planner, economics, decision rule
npm run serve     # http://localhost:8000
```

## Before you share the link

1. **Set `CONTACT_EMAIL` in `config.js`** to a real inbox the team checks. Until then, "Request this match" only
   offers *Copy request*, and the team console shows a red flag.
2. **Confirm the rule in `config.js` and `EXPERIMENT.md`, then commit both before the first tester.**
   The commit timestamp is your precommitment receipt.
3. Deploy (below), open the live URL in a private window and on a second device.
4. Only ship the "we reply within 48 hours" promise if you will keep it.

## Deploy (GitHub Pages)

Create your repo from the course template, copy these files over it, then push to `main`. In **Settings -> Pages**
choose **GitHub Actions** if needed. The included workflow runs `npm test` and deploys. If tests fail, nothing deploys.

## Run the test and collect evidence

1. Read testers the disclosure and follow the observer script in `EXPERIMENT.md`.
2. Log **every exposed tester, including bounces**, in `team.html`. If testers used your device, click *Import runs*.
3. Count real emails in the inbox and enter that number in the console.
4. Copy **Evidence export** into `EVIDENCE.md`. Write the "what this does and does not support" line yourselves.
5. Fill `REVISION_RECEIPT.md` from what actually happened, and finish the **[TEAM]** cells in `BUILD_LOG.md`.

## Files

| File | Role |
|---|---|
| `planner.js` | Plan rule of thumb, price tiers, request/tutor email drafts (pure, tested) |
| `experiment.js` | Starter's threshold logic + ledger summary and `evaluateRule` |
| `economics.js` | Unit economics (pure, tested) |
| `config.js` | Contact email, take rate, **the precommitted rule** |
| `app.js` / `team.js` | Landing-page and console behavior |
| `EXPERIMENT.md` `EVIDENCE.md` `ECONOMICS.md` `BUILD_LOG.md` `REVISION_RECEIPT.md` | The submission package |

## Honest limits

No tutors are recruited, no payment exists, and matching is a person reading an email. The MVP measures whether
students *ask* for a priced match. It does not show that they will pay, rebook, or improve their grades.
Buckeye Tutor is an independent student project, not affiliated with The Ohio State University.
