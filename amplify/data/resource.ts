import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * PrayTogether — Data schema
 *
 * Four models map 1-to-1 with the existing localStorage data shapes.
 * Public read is off; all operations require auth.
 * We use API_KEY auth for now (simplest for a team app without Cognito).
 */
const schema = a.schema({
  Leader: a
    .model({
      name:         a.string().required(),
      role:         a.enum(['leader', 'core']),
      passwordHash: a.string().required(),
      displayName:  a.string(),
      // reminder preferences
      reminderEnabled:  a.boolean().default(true),
      lastReminderSent: a.string(), // ISO date
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Member: a
    .model({
      name:           a.string().required(),
      assignedLeader: a.string().required(),
      assignedCore:   a.string(),
      notes:          a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  ReviewEntry: a
    .model({
      leaderName:          a.string().required(),
      leaderRole:          a.enum(['leader', 'core']),
      revieweeName:        a.string().required(),
      revieweeRole:        a.enum(['member', 'core']),
      memberId:            a.string(),
      prayerRequest:       a.string(),
      plannedAction:       a.string(),
      createdAt:           a.string().required(),
      chatInitiated:       a.boolean().default(false),
      chatInitiatedAt:     a.string(),
      actionCompleted:     a.boolean().default(false),
      actionCompletedAt:   a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  AuditEntry: a
    .model({
      action:      a.string().required(),
      description: a.string().required(),
      leaderName:  a.string(),
      timestamp:   a.string().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: { expiresInDays: 365 },
  },
});
