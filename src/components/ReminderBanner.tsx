import {
  Box, Button, Chip, Collapse, Divider,
  IconButton, Typography,
} from '@mui/material';
import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined';
import CloseIcon   from '@mui/icons-material/Close';
import AlarmIcon   from '@mui/icons-material/AlarmOutlined';
import type { ReviewEntry } from '../types/ReviewEntry';

const REMINDER_DAYS = 7;

export interface ReminderItem {
  entry:   ReviewEntry;
  daysOld: number;
}

function daysLabel(n: number): string {
  if (n < 7) return `${n} day${n === 1 ? '' : 's'} ago`;
  const w = Math.floor(n / 7);
  return `${w} week${w === 1 ? '' : 's'} ago`;
}

/** Returns entries that the given leader reviewed and that are ≥ REMINDER_DAYS old. */
export function getReminders(
  entries:    ReviewEntry[],
  leaderName: string,
): ReminderItem[] {
  const now    = Date.now();
  const cutoff = REMINDER_DAYS * 24 * 60 * 60 * 1000;

  return entries
    .filter((e) => {
      if (e.leaderName !== leaderName) return false;
      return now - new Date(e.createdAt).getTime() >= cutoff;
    })
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
  if (items.length === 0) return null;

  return (
    <Collapse in>
      <Box
        sx={{
          mb: 3, p: 2, borderRadius: 3,
          bgcolor: 'rgba(234,179,8,0.07)',
          border: '1px solid rgba(234,179,8,0.25)',
        }}
      >
        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <NotificationsActiveOutlinedIcon sx={{ fontSize: 20, color: '#92400e' }} />
          <Typography variant="subtitle2" sx={{ color: '#92400e', flex: 1, fontWeight: 700 }}>
            Weekly Action Plan Reminders
          </Typography>
          <Chip
            label={items.length}
            size="small"
            sx={{
              height: 20, fontSize: '0.65rem', fontWeight: 700,
              bgcolor: 'rgba(234,179,8,0.18)', color: '#92400e',
              border: '1px solid rgba(234,179,8,0.3)',
            }}
          />
          <IconButton size="small" onClick={onDismiss} sx={{ color: '#92400e', opacity: 0.6, '&:hover': { opacity: 1 } }}>
            <CloseIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        <Typography variant="body2" sx={{ color: '#78350f', mb: 2, lineHeight: 1.6 }}>
          These entries have action plans that are due for a follow-up this week.
        </Typography>

        {/* Entry list */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
          {items.slice(0, 5).map(({ entry, daysOld }) => (
            <Box
              key={entry.id}
              sx={{
                p: 1.25, borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(234,179,8,0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <AlarmIcon sx={{ fontSize: 14, color: '#b45309', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
                  {entry.revieweeName}
                </Typography>
                <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 600 }}>
                  {daysLabel(daysOld)}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary', display: 'block', pl: 2.5,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {entry.plannedAction}
              </Typography>
            </Box>
          ))}
          {items.length > 5 && (
            <Typography variant="caption" sx={{ color: '#92400e', pl: 0.5 }}>
              + {items.length - 5} more…
            </Typography>
          )}
        </Box>

        <Divider sx={{ borderColor: 'rgba(234,179,8,0.2)', mb: 1.5 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={onSnooze}
            sx={{
              borderColor: 'rgba(234,179,8,0.5)', color: '#92400e',
              '&:hover': { bgcolor: 'rgba(234,179,8,0.08)', borderColor: '#eab308' },
            }}
          >
            Remind me next week
          </Button>
          <Button
            size="small"
            onClick={onDismiss}
            sx={{ color: '#b45309', '&:hover': { bgcolor: 'rgba(234,179,8,0.07)' } }}
          >
            Dismiss
          </Button>
        </Box>
      </Box>
    </Collapse>
  );
}
