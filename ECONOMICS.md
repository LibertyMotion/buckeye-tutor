# Venture-Economics Snapshot

Every figure is an **assumption we have not validated**, computed by `economics.js` (unit-tested; the live
calculator is in `team.html`). Card-fee inputs assume a standard US card processor at 2.9% + $0.30 per payment.

- **User:** an Ohio State student preparing for a class exam, or a student/graduate preparing for the LSAT,
  MCAT, GRE, GMAT or similar.
- **Buyer:** the student. For test prep, a parent may also be involved; we have no evidence yet either way.
- **Payer:** the student (or parent) pays per session at booking. Pilot plan: a payment link per booked session,
  tutors paid weekly. **None of this is built**; no money moves on the current site.
- **Price and payment rhythm:** per session, chosen from five tiers, all with a 20% take rate:

  | Tier | Student pays | We keep | Card fees | **Contribution / hr** | Tutor paid / hr |
  |---|---|---|---|---|---|
  | Small group (per student) | $12 | $2.40 | $0.65 | **$1.75** | $9.60 |
  | Peer tutor | $20 | $4.00 | $0.88 | **$3.12** | $16.00 |
  | Experienced tutor | $35 | $7.00 | $1.32 | **$5.68** | $28.00 |
  | Score coach (test prep) | $60 | $12.00 | $2.04 | **$9.96** | $48.00 |
  | Specialist (test prep) | $95 | $19.00 | $3.06 | **$15.95** | $76.00 |

- **Variable cost per unit/customer:** tutor pay (80% of price) plus card fees (about 4% of the price at
  $20 to $35, more at low prices because of the fixed $0.30). **Not in these numbers:** the team's own time hand-matching each
  student, which is real cost during the concierge pilot and does not scale.
- **Contribution per unit/customer:** shown above per hour. Per student over their time with us (assuming
  5 sessions per semester for class tiers, 8 for test prep, and 1.2 to 1.5 semesters retained):

  | Tier | Contribution / semester | Lifetime contribution | Lifetime / $10 acquisition cost | Sessions to repay $10 |
  |---|---|---|---|---|
  | Small group | $7.01 | $8.41 | **0.8x** (loses money) | 5.7 |
  | Peer | $15.60 | $23.40 | **2.3x** (thin) | 3.2 |
  | Experienced | $28.42 | $42.64 | **4.3x** | 1.8 |
  | Coach | $79.68 | $95.62 | **9.6x** | 1.0 |
  | Specialist | $127.56 | $153.07 | **15.3x** | 0.6 |

- **Likely acquisition path and cost:** free, organic campus channels first: class group chats, student
  organizations (pre-law and pre-med groups for test prep), flyers, and word of mouth. **Assumed $10 per paying
  student**, which is a guess: it could be near $0 at first or far higher once organic reach runs out.
- **Retention or repeat-purchase assumption:** class tiers 1.5 semesters (students who like a tutor rebook next
  term); test prep about 1.2 (the exam ends the need). Both are guesses.
- **Most fragile economic assumption:** **students keep booking through us after the first match.** Contribution
  only exists on sessions that stay on the platform, and a tutor and student who like each other can move to a
  text message and a Venmo request. With a $3.12/hr peer contribution there is no room for that leakage: if only
  the first 2 of 5 sessions per semester stay on-platform, peer lifetime contribution falls to $9.36 (0.9x
  acquisition cost). Mitigations to test: scheduling, payment protection, and session tracking that are worth 20%
  by themselves, and a tutor-side reason to stay listed (a steady stream of new students).

## What the numbers say about strategy (a hypothesis, not a finding)

- **The class lane at $12 to $20 is a weak business on these assumptions.** It exists mainly to build a student
  base and supply of tutors.
- **The test-prep lane is where unit economics work**: contribution of $10 to $16 per hour and payback in about
  one session. That argues for testing test-prep demand *first*, even though "Ohio State classes" is the more
  natural pitch. The precommitted price guardrail ($25/hr mean) is designed to force this question.
- **Scale check:** at the peer tier, earning $1,000/month of contribution takes about 320 booked hours a month.
  At the coach tier it takes about 100. Class tutoring alone is a small business, not a venture-scale one.

## Other risks that are not economics

- **Name and trademark:** "Buckeye" and course names are used descriptively, with a non-affiliation notice, but
  we have not checked Ohio State's trademark licensing rules. Confirm before any paid launch.
- **Tutor quality and safety:** the pilot standards (course grade or TA proof; recent qualifying score) are a
  promise on the page, and we are the only ones who can keep it.
- **Reference prices** for tutoring are our estimates, not researched market data.
