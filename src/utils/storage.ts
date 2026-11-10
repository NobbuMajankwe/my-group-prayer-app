import type { ReviewEntry, LeaderPerson, Member } from '../types/ReviewEntry';
import type { AuditEntry }                        from '../types/AuditLog';
import { v4 as uuidv4 }                          from 'uuid';

const STORAGE_KEY   = 'review-action-tracker';
const LEADERS_KEY   = 'review-action-tracker-leaders';
const MEMBERS_KEY   = 'review-action-tracker-members';
const AUDIT_KEY     = 'review-action-tracker-audit';
const SNOOZE_KEY    = 'review-action-tracker-snooze'; // leaderName → ISO date

// ── Entries ────────────────────────────────────────────────────────────────

export const loadEntries = (): ReviewEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ReviewEntry[];
  } catch { return []; }
};

export const saveEntries = (entries: ReviewEntry[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

// ── Leaders ────────────────────────────────────────────────────────────────
// Migration: old installs stored string[] or LeaderPerson without passwordHash.
// We preserve them as-is; passwordHash may be '' for migrated records.

export const loadLeaders = (): LeaderPerson[] => {
  try {
    const raw = localStorage.getItem(LEADERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<LeaderPerson | string>;
    return parsed.map((item) => {
      if (typeof item === 'string') {
        return { name: item, role: 'leader' as const, passwordHash: '' };
      }
      // Ensure passwordHash exists on older records
      return { ...item, passwordHash: item.passwordHash ?? '' };
    });
  } catch { return []; }
};

export const saveLeaders = (leaders: LeaderPerson[]): void => {
  localStorage.setItem(LEADERS_KEY, JSON.stringify(leaders));
};

// ── Members ────────────────────────────────────────────────────────────────

export const loadMembers = (): Member[] => {
  try {
    const raw = localStorage.getItem(MEMBERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Member[];
  } catch { return []; }
};

export const saveMembers = (members: Member[]): void => {
  localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
};

export const createMember = (
  name:           string,
  assignedLeader: string,
  assignedCore?:  string,
  notes?:         string,
): Member => ({
  id:             uuidv4(),
  name:           name.trim(),
  assignedLeader,
  assignedCore:   assignedCore || undefined,
  notes:          notes?.trim() || undefined,
});

// ── Audit log ──────────────────────────────────────────────────────────────

export const loadAuditLog = (): AuditEntry[] => {
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEntry[];
  } catch { return []; }
};

export const appendAuditEntry = (
  action:      AuditEntry['action'],
  description: string,
  leaderName?: string,
): AuditEntry => {
  const entry: AuditEntry = {
    id:          uuidv4(),
    action,
    description,
    leaderName,
    timestamp:   new Date().toISOString(),
  };
  const log     = loadAuditLog();
  const trimmed = [entry, ...log].slice(0, 500);
  localStorage.setItem(AUDIT_KEY, JSON.stringify(trimmed));
  return entry;
};

export const clearAuditLog = (): void => {
  localStorage.removeItem(AUDIT_KEY);
};

// ── Reminder snooze ────────────────────────────────────────────────────────
// Map of leaderName → ISO datetime they last dismissed the reminder.
// We re-show the reminder when now > snoozeUntil.

type SnoozeMap = Record<string, string>;

export const loadSnoozeMap = (): SnoozeMap => {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY);
    return raw ? (JSON.parse(raw) as SnoozeMap) : {};
  } catch { return {}; }
};

export const saveSnoozeForLeader = (leaderName: string, until: Date): void => {
  const map = loadSnoozeMap();
  map[leaderName] = until.toISOString();
  localStorage.setItem(SNOOZE_KEY, JSON.stringify(map));
};

export const getSnoozeUntil = (leaderName: string): Date | null => {
  const map = loadSnoozeMap();
  const raw = map[leaderName];
  return raw ? new Date(raw) : null;
};

// ── Legacy PIN key cleanup ─────────────────────────────────────────────────
// The old single-PIN model stored a key we no longer need.

export const clearLegacyPin = (): void => {
  localStorage.removeItem('review-action-tracker-pin');
};

// ── Legacy shim (PinSetup.tsx backward compat) ─────────────────────────────
// The old single-PIN model is replaced by per-leader passwordHash.
// This shim prevents import errors in any leftover files.
export const savePinHash = (_hash: string): void => {
  // no-op — use LeaderPerson.passwordHash instead
};
