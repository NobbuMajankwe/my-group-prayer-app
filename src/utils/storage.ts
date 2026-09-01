import type { ReviewEntry, LeaderPerson } from '../types/ReviewEntry';

const STORAGE_KEY  = 'review-action-tracker';
const LEADERS_KEY  = 'review-action-tracker-leaders';

// ── Entries ────────────────────────────────────────────────────────────────

export const loadEntries = (): ReviewEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewEntry[];
  } catch {
    return [];
  }
};

export const saveEntries = (entries: ReviewEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// ── Leaders ────────────────────────────────────────────────────────────────
// Stored as LeaderPerson[]. Old installs may have stored string[] — migrate
// gracefully by treating bare strings as role: 'leader'.

export const loadLeaders = (): LeaderPerson[] => {
  try {
    const raw = localStorage.getItem(LEADERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<LeaderPerson | string>;
    return parsed.map((item) =>
      typeof item === 'string'
        ? { name: item, role: 'leader' as const }
        : item
    );
  } catch {
    return [];
  }
};

export const saveLeaders = (leaders: LeaderPerson[]): void => {
  localStorage.setItem(LEADERS_KEY, JSON.stringify(leaders));
};
