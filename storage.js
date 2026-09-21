// localStorage wrappers. Storage can be blocked (private windows, embedded browsers), so
// every read and write is guarded and the app still works without it.

export const RUNS_KEY = "bt-runs-v1";
export const LEDGER_KEY = "bt-ledger-v1";
export const TUTOR_KEY = "bt-tutor-interest-v1";
export const EMAILS_KEY = "bt-emails-received-v1";

export function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
