export type LeaderRole   = 'leader' | 'core';
export type RevieweeRole = 'member' | 'core';

export interface LeaderPerson {
  name:          string;
  role:          LeaderRole;
  passwordHash:  string;
  displayName?:  string;
}

export interface Member {
  id:              string;
  name:            string;
  assignedLeader:  string;        // LeaderPerson.name with role === 'leader'
  assignedCore?:   string;        // LeaderPerson.name with role === 'core' (optional)
  notes?:          string;        // optional short note about the member
}

export interface ReviewEntry {
  id:           string;
  leaderName:   string;
  leaderRole:   LeaderRole;
  revieweeName: string;
  revieweeRole: RevieweeRole;
  memberId?:    string;
  prayerRequest:  string;          // the prayer request shared
  plannedAction:  string;          // follow-up action
  createdAt:    string;
  chatInitiated?:    boolean;      // did I initiate the chat to ask for a request?
  chatInitiatedAt?:  string;       // ISO date when chat was initiated
  actionCompleted?:   boolean;
  actionCompletedAt?: string;
}
