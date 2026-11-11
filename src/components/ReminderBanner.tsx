import { useState } from 'react';
import {
  Box, Button, Chip, Divider,
  IconButton, Typography,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AlarmOutlinedIcon       from '@mui/icons-material/AlarmOutlined';
import CloseIcon               from '@mui/icons-material/Close';
import AccessTimeIcon          from '@mui/icons-material/AccessTime';
import type { ReviewEntry }    from '../types/ReviewEntry';

export interface ReminderItem {
  entry:   ReviewEntry;
  daysOld: number;
}

function daysLabel(n: number): string {
  if (n < 7) return `${n} day${n === 1 ? '' : 's'} ago`;
  const w = Math.floor(n / 7);
  return `${w} week${w === 1 ? '' : 's'} ago`;
}

/** Returns entries that the given leader reviewed and that are ≥ 7 days old. */
export function getReminders(entries: ReviewEntry[], leaderName: string): ReminderItem[] {
  const now    = Date.now();
  const cutoff = 7 * 24 * 60 * 60 * 1000;
  return entries
    .filter((e) => e.leaderName === leaderName && now - new Date(e.createdAt).getTime() >= cutoff)
    .map((e) => ({
      entry:   e,
      daysOld: Math.floor((now - new Date(e.createdAt).getTime()) / (24 * 60 * 60 * 1000)),
    }))
    .sort((a, b) => b.daysOld - a.daysOld);
}

interface ReminderBannerProps {
  items:     ReminderItem[];
  onSnooze:  () => void;
  onDismiss: () => void;
}

export default function ReminderBanner({ items, onSnooze, onDismiss }: ReminderBannerProps) {
  const [expanded, setExpanded] = useState(false);
  if (items.length === 0) return null;

  const preview = items.slice(0, expanded ? undefined : 3);

  return (
    <Box
      sx={{
        mb: 3,
        borderRadius: 4,
        overflow: 'hidden',
        border: '1.5px solid rgba(234,179,8,0.3)',
        background: 'linear-gradient(135deg, rgba(255,251,235,0.95) 0%, rgba(255,243,199,0.9) 100%)',
        boxShadow: '0 4px 20px rgba(234,179,8,0.15)',
      }}
    >
      {/* Top accent strip */}
      <Box className="shimmer-strip" sx={{ height: 4, background: 'linear-gradient(90deg, #f59e0b 0%, #ef4444 50%, #f59e0b 100%)', backgroundSize: '200% 100%' }} />

      <Box sx={{ p: 2.5 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
          <Box
            sx={{
              width: 40, height: 40, borderRadius: 3, flexShrink: 0,
              background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
            }}
          >
            <NotificationsActiveIcon sx={{ fontSize: 20, color: '#fff' }} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#78350f' }}>
                Weekly Action Plan Check-In
              </Typography>
              <Chip
                label={`${items.length} pending`}
                size="small"
                sx={{
                  height: 20, fontSize: '0.65rem', fontWeight: 700,
                  bgcolor: 'rgba(234,179,8,0.2)', color: '#92400e',
                  border: '1px solid rgba(234,179,8,0.4)',
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#92400e', mt: 0.25, lineHeight: 1.5 }}>
              These members have action plans waiting for a follow-up 💛
            </Typography>
          </Box>

          <IconButton size="small" onClick={onDismiss}
            sx={{ color: '#b45309', flexShrink: 0, '&:hover': { bgcolor: 'rgba(234,179,8,0.15)' } }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Item list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {preview.map(({ entry, daysOld }) => (
            <Box
              key={entry.id}
              sx={{
                display: 'flex', alignItems: 'flex-start', gap: 1.25,
                p: 1.5, borderRadius: 2.5,
                bgcolor: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(234,179,8,0.2)',
                backdropFilter: 'blur(4px)',
              }}
            >
              <Box
                sx={{
                  width: 32, height: 32, borderRadius: 2, flexShrink: 0,
                  bgcolor: 'rgba(245,158,11,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <AlarmOutlinedIcon sx={{ fontSize: 16, color: '#b45309' }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e1b2e' }}>
                    {entry.revieweeName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <AccessTimeIcon sx={{ fontSize: 11, color: '#b45309' }} />
                    <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
                      {daysLabel(daysOld)}
                    </Typography>
                  </Box>
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: '#6b7280', display: 'block',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}
                >
                  📌 {entry.plannedAction}
                </Typography>
              </Box>
            </Box>
          ))}

          {items.length > 3 && (
            <Button
              size="small"
              onClick={() => setExpanded((v) => !v)}
              sx={{ color: '#b45309', fontSize: '0.75rem', alignSelf: 'flex-start', py: 0.25 }}
            >
              {expanded ? 'Show less' : `+${items.length - 3} more…`}
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(234,179,8,0.25)', mb: 2 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="small"
            onClick={onSnooze}
            sx={{
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#fff', fontWeight: 700,
              boxShadow: '0 2px 8px rgba(245,158,11,0.4)',
              '&:hover': { background: 'linear-gradient(135deg, #d97706, #b45309)' },
            }}
          >
            ⏰ Remind me next week
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={onDismiss}
            sx={{
              borderColor: 'rgba(234,179,8,0.5)', color: '#92400e',
              '&:hover': { bgcolor: 'rgba(234,179,8,0.08)', borderColor: '#eab308' },
            }}
          >
            Dismiss for now
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
