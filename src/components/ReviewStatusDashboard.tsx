import { useMemo } from 'react';
import {
  Avatar, Box, Button, Chip, Divider, Drawer,
  IconButton, Typography, alpha,
} from '@mui/material';
import CloseIcon              from '@mui/icons-material/Close';
import CheckCircleIcon        from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import StarOutlinedIcon       from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon     from '@mui/icons-material/GroupsOutlined';
import AccessTimeIcon         from '@mui/icons-material/AccessTimeOutlined';
import type { ReviewEntry, Member, LeaderPerson } from '../types/ReviewEntry';

const MEMBER_BG  = 'rgba(124,58,237,0.08)';
const MEMBER_COL = '#5b21b6';

interface ReviewStatusDashboardProps {
  open:           boolean;
  entries:        ReviewEntry[];
  members:        Member[];
  currentLeader:  LeaderPerson;
  onToggleAction: (entry: ReviewEntry) => void;
  onClose:        () => void;
}

interface MemberStatus {
  member:         Member;
  lastReview:     ReviewEntry | null;
  reviewCount:    number;
  actionPending:  number;
  actionDone:     number;
}

export default function ReviewStatusDashboard({
  open, entries, members, currentLeader, onToggleAction, onClose,
}: ReviewStatusDashboardProps) {

  // Find members assigned to this leader/core
  const myMembers = useMemo(() => {
    if (currentLeader.role === 'leader') {
      return members.filter((m) => m.assignedLeader === currentLeader.name);
    }
    // Core/intern sees members assigned to them
    return members.filter((m) => m.assignedCore === currentLeader.name);
  }, [members, currentLeader]);

  // Build status for each member
  const statuses: MemberStatus[] = useMemo(() => {
    return myMembers.map((member) => {
      const memberEntries = entries.filter((e) =>
        (e.memberId === member.id || e.revieweeName.toLowerCase() === member.name.toLowerCase()) &&
        e.leaderName === currentLeader.name
      );
      const sorted = [...memberEntries].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const lastReview = sorted[0] ?? null;
      const actionPending = sorted.filter((e) => !e.actionCompleted).length;
      const actionDone    = sorted.filter((e) =>  e.actionCompleted).length;

      return { member, lastReview, reviewCount: sorted.length, actionPending, actionDone };
    });
  }, [myMembers, entries, currentLeader]);

  // Summary counts
  const totalReviewed    = statuses.filter((s) => s.reviewCount > 0).length;
  const totalNotReviewed  = statuses.length - totalReviewed;
  const totalPending      = statuses.reduce((sum, s) => sum + s.actionPending, 0);
  const totalDone         = statuses.reduce((sum, s) => sum + s.actionDone, 0);

  const displayName = currentLeader.displayName || currentLeader.name;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 520 },
            borderRadius: { sm: '20px 0 0 20px' },
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ px: 2.5, py: 2, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Typography variant="h6" sx={{ flex: 1, color: 'primary.main' }}>
            Review Status
          </Typography>
          <IconButton size="small" onClick={onClose} sx={{ color: 'text.disabled' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Summary chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`${statuses.length} members`}
            size="small"
            sx={{ bgcolor: alpha('#7c3aed', 0.08), color: 'primary.dark', fontWeight: 700, height: 24 }}
          />
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
            label={`${totalReviewed} reviewed`}
            size="small"
            sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#15803d', fontWeight: 700, height: 24, border: '1px solid rgba(34,197,94,0.2)' }}
          />
          {totalNotReviewed > 0 && (
            <Chip
              label={`${totalNotReviewed} not reviewed`}
              size="small"
              sx={{ bgcolor: 'rgba(234,179,8,0.1)', color: '#92400e', fontWeight: 700, height: 24, border: '1px solid rgba(234,179,8,0.2)' }}
            />
          )}
          <Chip
            label={`${totalPending} actions pending`}
            size="small"
            sx={{ bgcolor: 'rgba(220,38,38,0.08)', color: '#b91c1c', fontWeight: 700, height: 24, border: '1px solid rgba(220,38,38,0.15)' }}
          />
          {totalDone > 0 && (
            <Chip
              icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
              label={`${totalDone} actions done`}
              size="small"
              sx={{ bgcolor: 'rgba(34,197,94,0.1)', color: '#15803d', fontWeight: 700, height: 24, border: '1px solid rgba(34,197,94,0.2)' }}
            />
          )}
        </Box>
      </Box>

      {/* Body — member status list */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        {statuses.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8, color: 'text.disabled' }}>
            <Typography variant="body2">
              No members assigned to you yet.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {statuses.map(({ member, lastReview, reviewCount, actionPending, actionDone }) => (
              <Box
                key={member.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: lastReview ? alpha('#7c3aed', 0.1) : 'rgba(234,179,8,0.25)',
                  bgcolor: lastReview ? 'background.paper' : 'rgba(234,179,8,0.03)',
                }}
              >
                {/* Member header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: lastReview ? 1.5 : 0 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: MEMBER_BG, color: MEMBER_COL, fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                    {member.name.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                      {member.name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
                      {/* Review count */}
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                        {reviewCount} review{reviewCount !== 1 ? 's' : ''}
                      </Typography>
                      {/* Last review date */}
                      {lastReview ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                          <AccessTimeIcon sx={{ fontSize: 11, color: 'text.disabled' }} />
                          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                            Last: {new Date(lastReview.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
                          Never reviewed
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Action status badge */}
                  {lastReview && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      {actionPending > 0 && (
                        <Chip label={`${actionPending} pending`} size="small"
                          sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700,
                            bgcolor: 'rgba(220,38,38,0.08)', color: '#b91c1c',
                            border: '1px solid rgba(220,38,38,0.15)' }} />
                      )}
                      {actionDone > 0 && (
                        <Chip label={`${actionDone} done`} size="small"
                          sx={{ height: 20, fontSize: '0.62rem', fontWeight: 700,
                            bgcolor: 'rgba(34,197,94,0.1)', color: '#15803d',
                            border: '1px solid rgba(34,197,94,0.2)' }} />
                      )}
                    </Box>
                  )}
                </Box>

                {/* Last review details */}
                {lastReview && (
                  <>
                    <Divider sx={{ mb: 1.5, borderColor: alpha('#7c3aed', 0.07) }} />

                    {/* Planned action */}
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', display: 'block', mb: 0.5 }}>
                        Planned Action
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {lastReview.plannedAction}
                      </Typography>
                    </Box>

                    {/* Action toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Button
                        size="small"
                        variant={lastReview.actionCompleted ? 'contained' : 'outlined'}
                        color={lastReview.actionCompleted ? 'success' : 'primary'}
                        startIcon={
                          lastReview.actionCompleted
                            ? <CheckCircleIcon sx={{ fontSize: 16 }} />
                            : <RadioButtonUncheckedIcon sx={{ fontSize: 16 }} />
                        }
                        onClick={() => onToggleAction(lastReview)}
                        sx={{
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          ...(lastReview.actionCompleted
                            ? { bgcolor: 'success.main', '&:hover': { bgcolor: '#15803d' } }
                            : { color: '#b91c1c', borderColor: 'rgba(220,38,38,0.3)' })
                        }}
                      >
                        {lastReview.actionCompleted
                          ? `Action completed${lastReview.actionCompletedAt ? ` · ${new Date(lastReview.actionCompletedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}`
                          : 'Mark action as done'}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* Footer — who's viewing */}
      <Box sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {currentLeader.role === 'leader'
            ? <StarOutlinedIcon sx={{ fontSize: 14, color: '#eab308' }} />
            : <GroupsOutlinedIcon sx={{ fontSize: 14, color: '#14b8a6' }} />}
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Showing members assigned to <strong>{displayName}</strong> ({currentLeader.role === 'leader' ? 'Leader' : 'Core / Intern'})
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}
