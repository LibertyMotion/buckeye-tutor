// Unit economics for one tutoring hour, and for one student over their time with us.
// Every input is an assumption to be validated; see ECONOMICS.md for the defaults and their status.

export const PRESETS = [
  { id: "group", label: "Group $12", price: 12, sessionsPerSemester: 4, semesters: 1.2 },
  { id: "peer", label: "Peer $20", price: 20, sessionsPerSemester: 5, semesters: 1.5 },
  { id: "expert", label: "Expert $35", price: 35, sessionsPerSemester: 5, semesters: 1.5 },
  { id: "coach", label: "Coach $60", price: 60, sessionsPerSemester: 8, semesters: 1.2 },
  { id: "specialist", label: "Specialist $95", price: 95, sessionsPerSemester: 8, semesters: 1.2 },
];

export const DEFAULTS = {
  price: 20,
  takeRate: 0.2,
  processingPct: 0.029, // card processing, percent of price (assumes a standard US card processor)
  processingFixed: 0.3, // card processing, fixed fee per transaction
  sessionsPerSemester: 5,
  semesters: 1.5, // expected semesters a student keeps buying
  cac: 10, // cost to acquire one paying student, dollars
  fixedPerMonth: 40, // tools, domain, insurance quote, etc.
};

export function unitEconomics(input) {
  const i = { ...DEFAULTS, ...input };
  const fee = i.price * i.processingPct + i.processingFixed;
  const revenuePerHour = i.price * i.takeRate;
  const contributionPerHour = revenuePerHour - fee;
  const tutorPayPerHour = i.price - revenuePerHour;
  const contributionPerSemester = contributionPerHour * i.sessionsPerSemester;
  const ltv = contributionPerSemester * i.semesters;
  const positive = contributionPerHour > 0;
  return {
    fee,
    revenuePerHour,
    contributionPerHour,
    tutorPayPerHour,
    contributionPerSemester,
    ltv,
    ltvToCac: i.cac > 0 ? ltv / i.cac : Infinity,
    sessionsToPayBackCac: positive ? i.cac / contributionPerHour : Infinity,
    hoursToCoverFixedPerMonth: positive ? i.fixedPerMonth / contributionPerHour : Infinity,
    healthy: positive && ltv / Math.max(i.cac, 0.01) >= 3,
  };
}
