import type { ReviewEntry } from '../types/ReviewEntry';

const STORAGE_KEY = 'review-action-tracker';
const LEADERS_KEY = 'review-action-tracker-leaders';

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

export const loadLeaders = (): string[] => {
  try {
    const raw = localStorage.getItem(LEADERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
};

export const saveLeaders = (leaders: string[]): void => {
  localStorage.setItem(LEADERS_KEY, JSON.stringify(leaders));
};
