/**
 * db.ts — DynamoDB-only data layer for PrayTogether
 *
 * All reads pull directly from AppSync/DynamoDB.
 * All writes go directly to AppSync/DynamoDB.
 * No localStorage cache — the cloud is the single source of truth.
 *
 * Amplify.configure() must be called before initAmplify() runs.
 * That is done in main.tsx using amplify_outputs.json.
 */

import { generateClient } from 'aws-amplify/data';
import { Amplify }        from 'aws-amplify';
import type { ReviewEntry, LeaderPerson, Member } from '../types/ReviewEntry';
import type { AuditEntry }                        from '../types/AuditLog';
import { v4 as uuidv4 }                           from 'uuid';

/* eslint-disable @typescript-eslint/no-explicit-any */

// ── Client type ────────────────────────────────────────────────────────────

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

let client: DataClient | null = null;

export function initAmplify() {
  // Amplify.configure() was already called in main.tsx.
  // Here we just check whether a real AppSync endpoint landed in the config,
  // and if so, create the data client.
  try {
    const config: any = (Amplify as any).getConfig?.() ?? {};
    const url: string =
      config?.API?.GraphQL?.endpoint ??
      config?.data?.url ??
      '';
    if (url && !url.startsWith('REPLACE')) {
      client = generateClient() as unknown as DataClient;
      console.info('[PrayTogether] Cloud database active ✅');
    } else {
      console.warn('[PrayTogether] ⚠️  Cloud not configured — amplify_outputs.json still has placeholder values.');
    }
  } catch (e) {
    console.error('[PrayTogether] Amplify init failed', e);
  }
}

export function isCloudActive() { return client !== null; }

// ── Helper: assert client is ready ────────────────────────────────────────

function getClient(): DataClient {
  if (!client) throw new Error('Amplify client not initialised. Check amplify_outputs.json.');
  return client;
}

// ── Leaders ────────────────────────────────────────────────────────────────

export async function dbLoadLeaders(): Promise<LeaderPerson[]> {
  const { data, errors } = await getClient().models.Leader.list({});
  if (errors?.length) throw new Error(errors[0].message);
  return (data ?? []).map(mapLeader);
}

export async function dbSaveLeaders(leaders: LeaderPerson[]): Promise<void> {
  const c = getClient();
  const { data: existing } = await c.models.Leader.list({});

  // Upsert each leader
  for (const l of leaders) {
    const found = existing?.find((r: any) => r.name === l.name);
    if (found) {
      await c.models.Leader.update({
        id:              found.id,
        role:            l.role,
        passwordHash:    l.passwordHash,
        displayName:     l.displayName ?? null,
      });
    } else {
      await c.models.Leader.create({
        name:            l.name,
        role:            l.role,
        passwordHash:    l.passwordHash,
        displayName:     l.displayName ?? null,
        reminderEnabled: true,
      });
    }
  }

  // Delete leaders that were removed
  for (const r of existing ?? []) {
    if (!leaders.some((l) => l.name === r.name)) {
      await c.models.Leader.delete({ id: r.id });
    }
  }
}

export async function dbUpdateLeaderReminder(
  name: string,
  lastReminderSent: string,
): Promise<void> {
  const c = getClient();
  const { data } = await c.models.Leader.list({});
  const found = data?.find((r: any) => r.name === name);
  if (found) {
    await c.models.Leader.update({ id: found.id, lastReminderSent });
  }
}

// ── Members ────────────────────────────────────────────────────────────────

export async function dbLoadMembers(): Promise<Member[]> {
  const { data, errors } = await getClient().models.Member.list({});
  if (errors?.length) throw new Error(errors[0].message);
  return (data ?? []).map(mapMember);
}

export async function dbSaveMembers(members: Member[]): Promise<void> {
  const c = getClient();
  const { data: existing } = await c.models.Member.list({});

  for (const m of members) {
    const found = existing?.find((r: any) => r.id === m.id);
    if (found) {
      await c.models.Member.update({
        id:             found.id,
        name:           m.name,
        assignedLeader: m.assignedLeader,
        assignedCore:   m.assignedCore ?? null,
        notes:          m.notes ?? null,
      });
    } else {
      await c.models.Member.create({
        name:           m.name,
        assignedLeader: m.assignedLeader,
        assignedCore:   m.assignedCore ?? null,
        notes:          m.notes ?? null,
      });
    }
  }

  for (const r of existing ?? []) {
    if (!members.some((m) => m.id === r.id)) {
      await c.models.Member.delete({ id: r.id });
    }
  }
}

// ── Entries ────────────────────────────────────────────────────────────────

export async function dbLoadEntries(): Promise<ReviewEntry[]> {
  const { data, errors } = await getClient().models.ReviewEntry.list({});
  if (errors?.length) throw new Error(errors[0].message);
  return (data ?? []).map(mapEntry);
}

export async function dbSaveEntry(entry: ReviewEntry): Promise<void> {
  const c = getClient();
  const { data } = await c.models.ReviewEntry.list({});
  const found = data?.find((r: any) => r.id === entry.id);

  const payload = {
    leaderName:        entry.leaderName,
    leaderRole:        entry.leaderRole,
    revieweeName:      entry.revieweeName,
    revieweeRole:      entry.revieweeRole,
    memberId:          entry.memberId ?? null,
    review:            entry.review,
    plannedAction:     entry.plannedAction,
    createdAt:         entry.createdAt,
    actionCompleted:   entry.actionCompleted ?? false,
    actionCompletedAt: entry.actionCompletedAt ?? null,
  };

  if (found) {
    await c.models.ReviewEntry.update({ id: found.id, ...payload });
  } else {
    await c.models.ReviewEntry.create(payload);
  }
}

export async function dbDeleteEntry(id: string): Promise<void> {
  const c = getClient();
  const { data } = await c.models.ReviewEntry.list({});
  const found = data?.find((r: any) => r.id === id);
  if (found) await c.models.ReviewEntry.delete({ id: found.id });
}

// ── Audit log ──────────────────────────────────────────────────────────────

export async function dbAppendAudit(
  action: AuditEntry['action'],
  description: string,
  leaderName?: string,
): Promise<AuditEntry> {
  const entry: AuditEntry = {
    id:          uuidv4(),
    action,
    description,
    leaderName,
    timestamp:   new Date().toISOString(),
  };

  await getClient().models.AuditEntry.create({
    action,
    description,
    leaderName:  leaderName ?? null,
    timestamp:   entry.timestamp,
  });

  return entry;
}

export async function dbLoadAuditLog(): Promise<AuditEntry[]> {
  const { data, errors } = await getClient().models.AuditEntry.list({});
  if (errors?.length) throw new Error(errors[0].message);
  return (data ?? [])
    .map((r: any): AuditEntry => ({
      id:          r.id,
      action:      r.action,
      description: r.description,
      leaderName:  r.leaderName ?? undefined,
      timestamp:   r.timestamp,
    }))
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 500);
}

// ── Mappers ────────────────────────────────────────────────────────────────

function mapLeader(r: any): LeaderPerson {
  return {
    name:         r.name,
    role:         r.role ?? 'core',
    passwordHash: r.passwordHash ?? '',
    displayName:  r.displayName ?? undefined,
  };
}

function mapMember(r: any): Member {
  return {
    id:             r.id,
    name:           r.name,
    assignedLeader: r.assignedLeader,
    assignedCore:   r.assignedCore ?? undefined,
    notes:          r.notes ?? undefined,
  };
}

function mapEntry(r: any): ReviewEntry {
  return {
    id:               r.id,
    leaderName:       r.leaderName,
    leaderRole:       r.leaderRole ?? 'core',
    revieweeName:     r.revieweeName,
    revieweeRole:     r.revieweeRole ?? 'member',
    memberId:         r.memberId ?? undefined,
    review:           r.review,
    plannedAction:    r.plannedAction,
    createdAt:        r.createdAt,
    actionCompleted:  r.actionCompleted ?? false,
    actionCompletedAt: r.actionCompletedAt ?? undefined,
  };
}
