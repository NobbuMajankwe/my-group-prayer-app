import { useState } from 'react';
import {
  Box,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import type { ReviewEntry, LeaderRole, RevieweeRole } from '../types/ReviewEntry';

const LEADER_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

const REVIEWEE_COLOURS: Record<RevieweeRole, { bg: string; border: string; color: string }> = {
  member: { bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.2)', color: '#5b21b6' },
  core:   { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', color: '#0f766e' },
};

interface EntryListRowProps {
  entry: ReviewEntry;
  index: number;
  isLast: boolean;
  onEdit: (entry: ReviewEntry) => void;
  onDelete: (entry: ReviewEntry) => void;
  onToggleAction: (entry: ReviewEntry) => void;
}

export default function EntryListRow({ entry, index, isLast, onEdit, onDelete, onToggleAction }: EntryListRowProps) {
  const [expanded, setExpanded] = useState(false);

  const dateLabel = new Date(entry.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Box>
      {/* Collapsed row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.5,
          cursor: 'pointer',
          borderRadius: expanded ? '8px 8px 0 0' : 2,
          transition: 'background 0.1s',
          bgcolor: expanded ? alpha('#7c3aed', 0.04) : 'transparent',
          '&:hover': { bgcolor: alpha('#7c3aed', 0.04) },
        }}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Row number */}
        <Typography
          variant="caption"
          sx={{
            minWidth: 24,
            fontWeight: 700,
            color: 'text.disabled',
            flexShrink: 0,
          }}
        >
          {index + 1}
        </Typography>

        {/* Name + reviewee role */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flex: '0 0 auto', maxWidth: { xs: 160, sm: 200 }, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.revieweeName ?? (entry as any).name}
          </Typography>
          <Chip
            label={entry.revieweeRole === 'core' ? 'Core' : 'Member'}
            size="small"
            sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, flexShrink: 0, bgcolor: REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'].bg, color: REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'].color, border: `1px solid ${REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'].border}`, display: { xs: 'none', sm: 'flex' } }}
          />
        </Box>

        {/* Leader badge with role icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0, display2: { xs: 'none', sm: 'flex' } }}>
          {entry.leaderRole === 'leader'
            ? <StarOutlinedIcon sx={{ fontSize: 12, color: '#eab308', display: { xs: 'none', sm: 'block' } }} />
            : <GroupsOutlinedIcon sx={{ fontSize: 12, color: '#14b8a6', display: { xs: 'none', sm: 'block' } }} />}
          <Typography
            variant="caption"
            sx={{ px: 0.875, py: 0.15, borderRadius: 1.5, bgcolor: LEADER_COLOURS[entry.leaderRole ?? 'core'].bg, color: LEADER_COLOURS[entry.leaderRole ?? 'core'].color, fontWeight: 700, border: `1px solid ${LEADER_COLOURS[entry.leaderRole ?? 'core'].border}`, display: { xs: 'none', sm: 'block' } }}
          >
            {entry.leaderName}
          </Typography>
        </Box>

        {/* Prayer request preview */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            minWidth: 0,
            display: { xs: 'none', md: 'block' },
          }}
        >
          {entry.prayerRequest || (entry.chatInitiated ? '— chat initiated, awaiting request' : '')}
        </Typography>

        {/* Date */}
        <Typography
          variant="caption"
          sx={{
            color: 'text.disabled',
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {dateLabel}
        </Typography>

        {/* Right-side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, flexShrink: 0, ml: 'auto' }}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
              sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#7c3aed', 0.07) } }}
            >
              <EditOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => { e.stopPropagation(); onDelete(entry); }}
              sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#dc2626', 0.06) } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <IconButton size="small" sx={{ color: 'text.disabled', ml: 0.5 }}>
            {expanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>

      {/* Expanded detail */}
      <Collapse in={expanded}>
        <Box
          sx={{
            px: 2,
            pb: 2,
            pt: 1,
            borderRadius: '0 0 8px 8px',
            bgcolor: alpha('#7c3aed', 0.04),
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', display: 'block', mb: 0.5 }}>
              Prayer Request
            </Typography>
            {entry.prayerRequest ? (
              <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.75 }}>
                {entry.prayerRequest}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{ color: '#0369a1', fontStyle: 'italic' }}>
                Awaiting prayer request
              </Typography>
            )}
          </Box>
          <Divider sx={{ borderColor: alpha('#7c3aed', 0.08) }} />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', display: 'block', mb: 0.5 }}>
              Planned Action
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.75 }}>
              {entry.plannedAction}
            </Typography>
          </Box>
          {/* Action toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 0.5 }}>
            <Chip
              onClick={() => onToggleAction(entry)}
              icon={entry.actionCompleted
                ? <CheckCircleIcon sx={{ fontSize: '14px !important', color: '#15803d !important' }} />
                : <RadioButtonUncheckedIcon sx={{ fontSize: '14px !important', color: '#b91c1c !important' }} />}
              label={entry.actionCompleted ? 'Action completed' : 'Mark action as done'}
              clickable
              size="small"
              sx={{
                height: 22, fontSize: '0.65rem', fontWeight: 700,
                bgcolor: entry.actionCompleted ? 'rgba(34,197,94,0.1)' : 'transparent',
                color:   entry.actionCompleted ? '#15803d' : '#b91c1c',
                border: `1px solid ${entry.actionCompleted ? 'rgba(34,197,94,0.25)' : 'rgba(220,38,38,0.2)'}`,
                cursor: 'pointer',
                '&:hover': { bgcolor: entry.actionCompleted ? 'rgba(34,197,94,0.15)' : 'rgba(220,38,38,0.06)' },
              }}
            />
            {entry.actionCompleted && entry.actionCompletedAt && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {new Date(entry.actionCompletedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </Typography>
            )}
          </Box>
        </Box>
      </Collapse>

      {!isLast && <Divider sx={{ borderColor: alpha('#7c3aed', 0.07) }} />}
    </Box>
  );
}
