/**
 * reminders.ts
 *
 * Manages weekly action-plan reminders for each leader.
 *
 * Flow:
 *  1. On login, call checkAndShowReminder(leader, entries)
 *  2. That checks if 7+ days have passed since last reminder
 *  3. If browser notifications are supported, it requests permission
 *     and fires a styled notification via the service worker
 *  4. If notifications are denied/unsupported, it falls back to
 *     the in-app banner (ReminderBanner component)
 *  5. Snooze stores the next-reminder date in localStorage + DB
 */

import { saveSnoozeForLeader, getSnoozeUntil } from './storage';
import type { ReviewEntry } from '../types/ReviewEntry';

const SW_PATH     = '/sw.js';
const SNOOZE_DAYS = 7;

// ── Service worker registration ────────────────────────────────────────────

let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(): Promise<void> {
  if (!('serviceWorker' in navigator)) return;
  try {
    swRegistration = await navigator.serviceWorker.register(SW_PATH, { scope: '/' });
    console.info('[reminders] Service worker registered ✅');

    // Listen for snooze messages from the SW
    navigator.serviceWorker.addEventListener('message', (e) => {
      if (e.data?.type === 'SNOOZE_REMINDER' && e.data.leaderName) {
        const until = new Date(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000);
        saveSnoozeForLeader(e.data.leaderName, until);
      }
    });
  } catch (e) {
    console.warn('[reminders] SW registration failed', e);
  }
}

// ── Permission ─────────────────────────────────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return Notification.requestPermission();
}

export function notificationsGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted';
}

// ── Core reminder logic ────────────────────────────────────────────────────

export interface ReminderItem {
  entry:   ReviewEntry;
  daysOld: number;
}

/** Returns entries the leader reviewed that are ≥ SNOOZE_DAYS old */
export function getOverdueItems(
  entries:    ReviewEntry[],
  leaderName: string,
): ReminderItem[] {
  const now    = Date.now();
  const cutoff = SNOOZE_DAYS * 24 * 60 * 60 * 1000;
  return entries
    .filter((e) => e.leaderName === leaderName && now - new Date(e.createdAt).getTime() >= cutoff)
    .map((e) => ({
      entry:   e,
      daysOld: Math.floor((now - new Date(e.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
    }))
    .sort((a, b) => b.daysOld - a.daysOld);
}

/** True if the reminder should be shown right now for this leader */
export function reminderIsDue(leaderName: string): boolean {
  const until = getSnoozeUntil(leaderName);
  if (!until) return true;
  return new Date() > until;
}

/** Snooze the reminder for SNOOZE_DAYS */
export function snoozeReminder(leaderName: string): Date {
  const until = new Date(Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000);
  saveSnoozeForLeader(leaderName, until);
  return until;
}

// ── Push notification ──────────────────────────────────────────────────────

export async function sendPushReminder(
  leaderName: string,
  items:       ReminderItem[],
): Promise<boolean> {
  if (!notificationsGranted() || !swRegistration) return false;

  const count = items.length;
  const first = items[0]?.entry.revieweeName ?? '';

  const payload = {
    title:      `🙏 Weekly Action Plan Reminder`,
    body:       count === 1
      ? `Follow up on your action plan for ${first}.`
      : `You have ${count} action plans to follow up on this week.`,
    items:      items.slice(0, 5).map((i) => ({
      name:   i.entry.revieweeName,
      action: i.entry.plannedAction.slice(0, 80),
    })),
    leaderName,
  };

  try {
    const sw = await navigator.serviceWorker.ready;
    sw.showNotification(payload.title, {
      body:   payload.body,
      icon:   '/favicon_io/android-chrome-192x192.png',
      badge:  '/favicon_io/favicon-32x32.png',
      tag:    'praytogether-reminder',
      data:   { leaderName },
      vibrate: [200, 100, 200],
    } as NotificationOptions);
    return true;
  } catch (e) {
    console.warn('[reminders] Push notification failed', e);
    return false;
  }
}

/**
 * Main entry point called on login.
 * Returns whether to show the in-app banner fallback.
 */
export async function checkAndShowReminder(
  leaderName: string,
  entries:    ReviewEntry[],
): Promise<{ showBanner: boolean; items: ReminderItem[] }> {
  const items = getOverdueItems(entries, leaderName);
  if (items.length === 0 || !reminderIsDue(leaderName)) {
    return { showBanner: false, items: [] };
  }

  // Try push notification first
  if (notificationsGranted()) {
    const sent = await sendPushReminder(leaderName, items);
    if (sent) return { showBanner: false, items }; // push sent, no need for banner
  }

  // Fallback: in-app banner
  return { showBanner: true, items };
}
