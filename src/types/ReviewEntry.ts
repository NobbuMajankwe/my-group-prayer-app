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
  review:       string;
  plannedAction: string;
  createdAt:    string;
  actionCompleted?:   boolean;  // has the planned action been acted on?
  actionCompletedAt?:  string;  // ISO date when action was marked complete
}
