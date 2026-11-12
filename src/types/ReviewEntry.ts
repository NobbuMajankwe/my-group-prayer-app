export type LeaderRole   = 'leader' | 'core';
export type RevieweeRole = 'member' | 'core';

export interface LeaderPerson {
  id:              string;          // stable UUID
  name:            string;
  role:            LeaderRole;
  passwordHash:    string;
  displayName?:    string;
  assignedLeader?: string;          // for cores: LeaderPerson.id of their leader
}

export interface Member {
  id:              string;
  name:            string;
  assignedLeader:  string;          // LeaderPerson.id with role === 'leader'
  assignedCore?:   string;          // LeaderPerson.id with role === 'core' (optional)
  notes?:          string;
}

export interface ReviewEntry {
  id:           string;
  leaderId?:    string;             // LeaderPerson.id — stable reference
  leaderName:   string;            // denormalised display name at time of entry
  leaderRole:   LeaderRole;
  revieweeName: string;
  revieweeRole: RevieweeRole;
  memberId?:    string;
  prayerRequest:  string;
  plannedAction:  string;
  createdAt:    string;
  chatInitiated?:    boolean;
  chatInitiatedAt?:  string;
  actionCompleted?:   boolean;
  actionCompletedAt?: string;
}
