# Venture Experiment: Buckeye Tutor

> **Precommitment receipt.** The numbers below are duplicated in `config.js` (`RULE`) and drive the
> team console. Commit this file and `config.js` **before the first tester**; the git timestamp is the
> proof that the threshold was written before the data. Do not edit the thresholds after testing begins.

## Causal claim

We believe **Ohio State students with an exam or standardized test coming up in the next few months**
experience **a costly last-minute scramble to find a tutor** (asking in group chats and on Reddit, with no
price or quality information, so they overpay, settle for whoever answers, or go without) because
**free campus help has limited hours and capacity, and private tutors are found only by word of mouth**.
If offered **a personalized, priced tutor plan and a hand-matched tutor on request**, we expect
**at least 25% of exposed students to request a match, choosing options that average at least $25/hr**,
because **it turns an open-ended search into a concrete, priced plan with one next step**.

*Status of the premise:* the pain and its mechanism are **assumptions**, not findings. We have not yet run
problem interviews. This test measures whether the offer pulls behavior, not whether our story about why is true.

## Precommitted decision rule

- **Target segment:** Ohio State students with an exam or test this term (class lane), or a standardized
  exam within roughly four months (test-prep lane). Recruited in the class blind test.
- **Test action:** finish the planner, see priced tutor options, and click **Request this match** (a
  price-aware action, not a passive click). Secondary signal: emails actually received in the team inbox.
- **Planned denominator:** **20** exposed testers. We make no call before 20. If fewer are reached by the
  deadline, we report the actual *n* and the rule outcome is "keep testing."
- **Threshold written before data:** **at least 5 of 20 (25%)** request a match, **and** the mean price of the
  option chosen by requesters is **at least $25/hr** (price guardrail).
- **If the result is below the threshold, we will:** stop building matching software; run five short problem
  interviews using the decline reasons we logged ("too expensive," "campus help is enough," ...); then retest
  one narrower segment with 10 new testers.
- **If the result meets the threshold, we will:** recruit the first 5 tutors for the most-requested courses and
  run a two-week paid pilot at the median chosen price, then measure whether students rebook.
- **If the threshold is met but the price guardrail is missed:** do not build yet. Test the higher-priced
  (test-prep) lane or bundled sessions first, because demand at prices that don't cover costs is not a business.

### Why these numbers

- **25%** is deliberately above "polite curiosity" (a classmate is watching, so clicking is cheap) but low
  enough for a need that is episodic (exam season), not constant.
- **$25/hr** is where the default unit economics reach roughly 3x lifetime contribution to acquisition cost
  (2.98x at $25, see `ECONOMICS.md`). Below it, the business does not work even if demand is real.
- **Limits, stated plainly:** with n = 20, an observed 5/20 has a 95% interval of roughly 11% to 47%. This is a
  directional test that can kill or advance the idea, not statistical proof. Lane-level splits (class vs. test
  prep) are exploratory only because each lane will have too few testers to decide anything.

## Ethics and consent

- **What the participant is told before acting:** *"This is a class prototype for a student startup called
  Buckeye Tutor. We're testing whether students want this. It records whether you ask for a tutor match, but not
  your name or email, and nothing is sent from this page. Nothing is for sale yet, and you can stop any time.
  It's not affiliated with Ohio State."* The page repeats this in its "What happens to your answers" panel and footer.
- **Data collected:** one anonymous row per tester: lane (class or test), what they did (asked for a match, or
  which reason they declined), the price option they picked, and an optional one-line friction note about
  observed behavior. What a tester types into the planner (for example "MATH 1152") stays in their own browser.
- **Data deliberately not collected:** names, emails, student IDs, phone numbers, payment details, IP-level
  analytics, cookies, or trackers. The site has no server or database.
- **Retention/deletion plan:** the ledger lives only in the browser of the team member running the test.
  Use **Clear ledger** in the team console after the course assignment is graded. The evidence export contains
  only aggregate counts and non-identifying notes.
- **Why this test creates no unreasonable deception, pressure, or privacy risk:** "Request this match" only
  *drafts an email the tester chooses whether to send*; no payment is taken and no commitment is made. The page
  says we are still recruiting tutors and shows no invented reviews, tutor counts, or testimonials. The one
  promise we make (a reply within 48 hours, or an honest "we couldn't find a fit") is one the team will keep.
  Testers who decline are thanked and never pressured. The page also states that it is an experiment.

## Observer script (keep it the same for every tester)

1. Read the disclosure above. Do not explain the product further.
2. Hand over the device or URL. Say only: *"You have an exam coming up. Use this however you like."*
3. Do not help, hint, or point. Note where they hesitate.
4. Log one row per person in the team console (`team.html`), **including people who bounce**.
