import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

/**
 * PrayTogether — Data schema
 *
 * Four models map 1-to-1 with the existing localStorage data shapes.
 * Public read is off; all operations require auth.
 * We use API_KEY auth for now (simplest for a team app without Cognito).
 */

// Claude Haiku 4.5 — the Amplify AI Kit maps this to the global inference profile
// ID 'global.anthropic.claude-haiku-4-5-20251001-v1:0' automatically.
const AI_MODEL = 'Claude Haiku 4.5';
const schema = a.schema({
  Leader: a
    .model({
      name:         a.string().required(),
      role:         a.enum(['leader', 'core']),
      passwordHash: a.string().required(),
      displayName:  a.string(),
      assignedLeader: a.string(), // for cores: the leader they report to
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
      leaderId:            a.string(),           // LeaderPerson DynamoDB id
      leaderName:          a.string().required(), // denormalised display name
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

  // ── Amplify AI routes ──────────────────────────────────────────────────

  // Feature 1: one-shot follow-up action suggester (used in EntryForm)
  PrayerAssistant: a
    .generation({
      aiModel: a.ai.model(AI_MODEL),
      systemPrompt:
        'You are a pastoral care assistant for a small group leader. ' +
        'Given a prayer request, suggest one brief, warm, practical follow-up action ' +
        'the leader can take. Reply with 1-2 sentences only — no preamble, no bullet points.',
    })
    .arguments({ prayerRequest: a.string().required() })
    .returns(a.customType({ action: a.string() }))
    .authorization((allow) => [allow.publicApiKey()]),

  // Feature 2: one-shot summary of all prayer requests for a leader (used in ReviewStatusDashboard)
  PrayerSummary: a
    .generation({
      aiModel: a.ai.model(AI_MODEL),
      systemPrompt:
        'You are a pastoral care assistant. Summarise the following prayer requests ' +
        'into a concise pastoral overview (3-5 sentences) suitable for a leader meeting. ' +
        'Highlight any recurring themes or urgent needs without naming individuals.',
    })
    .arguments({ requests: a.string().required() })
    .returns(a.customType({ summary: a.string() }))
    .authorization((allow) => [allow.publicApiKey()]),

  // Feature 3: smart pastoral note suggestion for a member (used in MembersDialog)
  MemberNoteSuggestion: a
    .generation({
      aiModel: a.ai.model(AI_MODEL),
      systemPrompt:
        'You are a pastoral care assistant. Given recent prayer requests for a group member, ' +
        'write a short pastoral note (1-2 sentences) a leader can save about that member. ' +
        'Be warm, practical, and concise.',
    })
    .arguments({ memberName: a.string().required(), recentRequests: a.string().required() })
    .returns(a.customType({ note: a.string() }))
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
