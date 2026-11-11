/**
 * db.ts — Cloud-first data layer for PrayTogether
 *
 * Every function tries AppSync/DynamoDB first.
 * On failure (network offline, misconfigured endpoint, etc.)
 * it falls back to localStorage so the app keeps working.
 *
 * HOW TO ACTIVATE THE CLOUD:
 *   1. Run `npx ampx sandbox` (dev) OR push to your Amplify branch (prod)
 *   2. The CLI writes amplify_outputs.json with real endpoints
 *   3. That's it — the app detects the config and uses DynamoDB automatically
 */

import { generateClient }  from 'aws-amplify/data';
import { Amplify }         from 'aws-amplify';
import {
  loadEntries,  saveEntries,
  loadLeaders,  saveLeaders,
  loadMembers,  saveMembers,
  loadAuditLog, appendAuditEntry as appendAuditLocal,
} from './storage';
import type { ReviewEntry, LeaderPerson, Member } from '../types/ReviewEntry';
import type { AuditEntry }                        from '../types/AuditLog';

// ── Amplify config ─────────────────────────────────────────────────────────
// We type the client loosely (any) because the full Schema type comes from
// @aws-amplify/backend which lives in the amplify/ directory and is compiled
// separately by the Amplify CLI — not by the main Vite build.

/* eslint-disable @typescript-eslint/no-explicit-any */
type DataClient = {
  models: {
    Leader:      ModelApi;
    Member:      ModelApi;
    ReviewEntry: ModelApi;
    AuditEntry:  ModelApi;
  };
};

interface ModelApi {
  list(options?: any): Promise<{ data: any[] | null; errors?: any[] }>;
  create(input: any): Promise<{ data: any; errors?: any[] }>;
  update(input: any): Promise<{ data: any; errors?: any[] }>;
  delete(input: { id: string }): Promise<{ data: any; errors?: any[] }>;
}

let cloudAvailable = false;
let client: DataClient | null = null;

export function initAmplify() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputs = (window as any).__amplify_outputs;
    const url: string = outputs?.data?.url ?? '';
    if (url && !url.startsWith('REPLACE')) {
      Amplify.configure(outputs);
      client = generateClient() as unknown as DataClient;
      cloudAvailable = true;
      console.info('[PrayTogether] Cloud database active ✅');
    } else {
      console.info('[PrayTogether] Cloud database not configured — using localStorage ✅');
    }
  } catch {
    console.info('[PrayTogether] Amplify init skipped — using localStorage');
  }
}

export function isCloudActive() { return cloudAvailable; }

// ── Leaders ────────────────────────────────────────────────────────────────

export async function dbLoadLeaders(): Promise<LeaderPerson[]> {
  if (!cloudAvailable || !client) return loadLeaders();
  try {
    const { data, errors } = await client.models.Leader.list({});
    if (errors?.length) throw new Error(errors[0].message);
    return (data ?? []).map(mapLeader);
  } catch (e) {
    console.warn('[db] loadLeaders fallback', e);
    return loadLeaders();
  }
}

export async function dbSaveLeaders(leaders: LeaderPerson[]): Promise<void> {
  saveLeaders(leaders); // always keep localStorage in sync
  if (!cloudAvailable || !client) return;
  try {
    const existing = await client.models.Leader.list({});
    // Upsert: for each leader, update if exists, create if not
    for (const l of leaders) {
      const found = existing.data?.find((r) => r.name === l.name);
      if (found) {
        await client.models.Leader.update({
          id:               found.id,
          role:             l.role,
          passwordHash:     l.passwordHash,
          displayName:      l.displayName ?? null,
        });
      } else {
        await client.models.Leader.create({
          name:         l.name,
          role:         l.role,
          passwordHash: l.passwordHash,
          displayName:  l.displayName ?? null,
          reminderEnabled:  true,
        });
      }
    }
    // Delete records that were removed
    for (const r of existing.data ?? []) {
      if (!leaders.some((l) => l.name === r.name)) {
        await client.models.Leader.delete({ id: r.id });
      }
    }
  } catch (e) {
    console.warn('[db] saveLeaders cloud failed, localStorage used', e);
  }
}

export async function dbUpdateLeaderReminder(
  name: string,
  lastReminderSent: string,
): Promise<void> {
  if (!cloudAvailable || !client) return;
  try {
    const { data } = await client.models.Leader.list({});
    const found = data?.find((r) => r.name === name);
    if (found) {
      await client.models.Leader.update({ id: found.id, lastReminderSent });
    }
  } catch (e) {
    console.warn('[db] updateLeaderReminder failed', e);
  }
}

// ── Members ────────────────────────────────────────────────────────────────

export async function dbLoadMembers(): Promise<Member[]> {
  if (!cloudAvailable || !client) return loadMembers();
  try {
    const { data, errors } = await client.models.Member.list({});
    if (errors?.length) throw new Error(errors[0].message);
    return (data ?? []).map(mapMember);
  } catch (e) {
    console.warn('[db] loadMembers fallback', e);
    return loadMembers();
  }
}

export async function dbSaveMembers(members: Member[]): Promise<void> {
  saveMembers(members);
  if (!cloudAvailable || !client) return;
  try {
    const existing = await client.models.Member.list({});
    for (const m of members) {
      const found = existing.data?.find((r) => r.id === m.id);
      if (found) {
        await client.models.Member.update({
          id:             found.id,
          name:           m.name,
          assignedLeader: m.assignedLeader,
          assignedCore:   m.assignedCore ?? null,
          notes:          m.notes ?? null,
        });
      } else {
        await client.models.Member.create({
          name:           m.name,
          assignedLeader: m.assignedLeader,
          assignedCore:   m.assignedCore ?? null,
          notes:          m.notes ?? null,
        });
      }
    }
    for (const r of existing.data ?? []) {
      if (!members.some((m) => m.id === r.id)) {
        await client.models.Member.delete({ id: r.id });
      }
    }
  } catch (e) {
    console.warn('[db] saveMembers cloud failed', e);
  }
}

// ── Entries ────────────────────────────────────────────────────────────────

export async function dbLoadEntries(): Promise<ReviewEntry[]> {
  if (!cloudAvailable || !client) return loadEntries();
  try {
    const { data, errors } = await client.models.ReviewEntry.list({});
    if (errors?.length) throw new Error(errors[0].message);
    return (data ?? []).map(mapEntry);
  } catch (e) {
    console.warn('[db] loadEntries fallback', e);
    return loadEntries();
  }
}

export async function dbSaveEntry(entry: ReviewEntry): Promise<void> {
  // For entries we store locally immediately, then sync to cloud
  const all = loadEntries();
  const idx = all.findIndex((e) => e.id === entry.id);
  if (idx >= 0) all[idx] = entry; else all.unshift(entry);
  saveEntries(all);

  if (!cloudAvailable || !client) return;
  try {
    const { data } = await client.models.ReviewEntry.list({});
    const found = data?.find((r) => r.id === entry.id);
    const payload = {
      leaderName:    entry.leaderName,
      leaderRole:    entry.leaderRole,
      revieweeName:  entry.revieweeName,
      revieweeRole:  entry.revieweeRole,
      memberId:      entry.memberId ?? null,
      review:        entry.review,
      plannedAction: entry.plannedAction,
      createdAt:     entry.createdAt,
    };
    if (found) {
      await client.models.ReviewEntry.update({ id: found.id, ...payload });
    } else {
      await client.models.ReviewEntry.create(payload);
    }
  } catch (e) {
    console.warn('[db] saveEntry cloud failed', e);
  }
}

export async function dbDeleteEntry(id: string): Promise<void> {
  const all = loadEntries().filter((e) => e.id !== id);
  saveEntries(all);

  if (!cloudAvailable || !client) return;
  try {
    const { data } = await client.models.ReviewEntry.list({});
    const found = data?.find((r) => r.id === id);
    if (found) await client.models.ReviewEntry.delete({ id: found.id });
  } catch (e) {
    console.warn('[db] deleteEntry cloud failed', e);
  }
}

// ── Audit log ──────────────────────────────────────────────────────────────

export async function dbAppendAudit(
  action: AuditEntry['action'],
  description: string,
  leaderName?: string,
): Promise<AuditEntry> {
  const entry = appendAuditLocal(action, description, leaderName);
  if (!cloudAvailable || !client) return entry;
  try {
    await client.models.AuditEntry.create({
      action,
      description,
      leaderName:  leaderName ?? null,
      timestamp:   entry.timestamp,
    });
  } catch (e) {
    console.warn('[db] appendAudit cloud failed', e);
  }
  return entry;
}

// ── Mappers ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLeader(r: any): LeaderPerson {
  return {
    name:         r.name,
    role:         r.role ?? 'core',
    passwordHash: r.passwordHash ?? '',
    displayName:  r.displayName ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapMember(r: any): Member {
  return {
    id:             r.id,
    name:           r.name,
    assignedLeader: r.assignedLeader,
    assignedCore:   r.assignedCore ?? undefined,
    notes:          r.notes ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapEntry(r: any): ReviewEntry {
  return {
    id:            r.id,
    leaderName:    r.leaderName,
    leaderRole:    r.leaderRole ?? 'core',
    revieweeName:  r.revieweeName,
    revieweeRole:  r.revieweeRole ?? 'member',
    memberId:      r.memberId ?? undefined,
    review:        r.review,
    plannedAction: r.plannedAction,
    createdAt:     r.createdAt,
  };
}

// Re-export helpers that haven't changed
export { loadAuditLog, loadEntries, saveEntries };
