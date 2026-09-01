export type LeaderRole = 'leader' | 'core';
export type RevieweeRole = 'member' | 'core';

export interface LeaderPerson {
  name: string;
  role: LeaderRole;
}

export interface ReviewEntry {
  id: string;
  leaderName: string;
  leaderRole: LeaderRole;
  revieweeName: string;      // the participant's name
  revieweeRole: RevieweeRole; // member or core
  review: string;
  plannedAction: string;
  createdAt: string;
}
