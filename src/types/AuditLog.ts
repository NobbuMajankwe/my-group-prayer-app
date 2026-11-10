export type AuditAction =
  | 'login'
  | 'logout'
  | 'pin_set'
  | 'pin_changed'
  | 'password_changed'
  | 'profile_updated'
  | 'entry_added'
  | 'entry_edited'
  | 'entry_deleted'
  | 'leaders_updated'
  | 'reminder_snoozed';

export interface AuditEntry {
  id:          string;
  action:      AuditAction;
  description: string;
  leaderName?: string;   // who performed the action (if known)
  timestamp:   string;   // ISO 8601
}
