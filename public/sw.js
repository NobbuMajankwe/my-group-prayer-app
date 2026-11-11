/**
 * PrayTogether Service Worker
 * Handles background push notifications for weekly action-plan reminders.
 */

const CACHE_NAME = 'praytogether-v1';

// ── Install & activate ─────────────────────────────────────────────────────

self.addEventListener('install',  () => self.skipWaiting());
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// ── Push event ─────────────────────────────────────────────────────────────
// Payload JSON: { title, body, items: [{name, action}], leaderName }

self.addEventListener('push', (event) => {
  let data = { title: '🙏 PrayTogether Reminder', body: 'You have action plans to follow up on!', items: [] };
  try { data = event.data?.json() ?? data; } catch { /* use defaults */ }

  const options = {
    body:    data.body,
    icon:    '/favicon_io/android-chrome-192x192.png',
    badge:   '/favicon_io/favicon-32x32.png',
    tag:     'praytogether-reminder',           // replaces previous notification
    renotify: true,
    data:    { url: '/', leaderName: data.leaderName },
    actions: [
      { action: 'open',  title: '📋 View entries' },
      { action: 'snooze', title: '⏰ Snooze 1 week' },
    ],
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification click ─────────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'snooze') {
    // Post a message to the app to snooze
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((c) => c.postMessage({ type: 'SNOOZE_REMINDER', leaderName: event.notification.data?.leaderName }));
      })
    );
    return;
  }

  // Open / focus the app
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((c) => c.url.includes(self.location.origin));
      if (existing) return existing.focus();
      return self.clients.openWindow('/');
    })
  );
});
