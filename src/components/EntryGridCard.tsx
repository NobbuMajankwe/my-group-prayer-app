import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import type { ReviewEntry, LeaderRole, RevieweeRole } from '../types/ReviewEntry';

const PURPLE = '#7c3aed';
const PINK   = '#db2777';

const LEADER_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

const REVIEWEE_COLOURS: Record<RevieweeRole, { bg: string; border: string; color: string }> = {
  member: { bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.2)', color: '#5b21b6' },
  core:   { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', color: '#0f766e' },
};

const PREVIEW_CHARS = 120;

function clamp(text: string, max: number) {
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

interface EntryGridCardProps {
  entry: ReviewEntry;
  onEdit: (entry: ReviewEntry) => void;
  onDelete: (entry: ReviewEntry) => void;
}

export default function EntryGridCard({ entry, onEdit, onDelete }: EntryGridCardProps) {
  const [expanded, setExpanded] = useState(false);

  const dateLabel = new Date(entry.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  const reviewLong  = entry.review.length > PREVIEW_CHARS;
  const actionLong  = entry.plannedAction.length > PREVIEW_CHARS;
  const canExpand   = reviewLong || actionLong;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'box-shadow 0.15s ease, transform 0.15s ease',
        '&:hover': { boxShadow: 4, transform: 'translateY(-2px)' },
        // Top accent bar
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 12,
          right: 12,
          height: 3,
          borderRadius: '0 0 3px 3px',
          background: `linear-gradient(90deg, ${PURPLE} 0%, ${PINK} 100%)`,
        },
      }}
    >
      <CardContent
        sx={{
          pt: 2.5,
          px: 2.5,
          pb: 1.5,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          '&:last-child': { pb: 1.5 },
        }}
      >
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mb: 0.4 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {entry.revieweeName ?? (entry as any).name}
              </Typography>
              <Chip
                label={entry.revieweeRole === 'core' ? 'Core' : 'Member'}
                size="small"
                sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700, bgcolor: REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'].bg, color: REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'].color, border: `1px solid ${REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'].border}` }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
              {entry.leaderRole === 'leader'
                ? <StarOutlinedIcon sx={{ fontSize: 11, color: '#eab308' }} />
                : <GroupsOutlinedIcon sx={{ fontSize: 11, color: '#14b8a6' }} />}
              <Typography variant="caption" sx={{ px: 0.75, py: 0.1, borderRadius: 1.5, bgcolor: LEADER_COLOURS[entry.leaderRole ?? 'core'].bg, color: LEADER_COLOURS[entry.leaderRole ?? 'core'].color, fontWeight: 700, border: `1px solid ${LEADER_COLOURS[entry.leaderRole ?? 'core'].border}` }}>
                {entry.leaderName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {dateLabel}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', flexShrink: 0, gap: 0.25, mt: -0.5 }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => onEdit(entry)}
                sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha(PURPLE, 0.07) } }}
              >
                <EditOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={() => onDelete(entry)}
                sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#dc2626', 0.06) } }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Divider sx={{ borderColor: alpha(PURPLE, 0.07) }} />

        {/* Review */}
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}
          >
            Review
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {expanded ? entry.review : clamp(entry.review, PREVIEW_CHARS)}
          </Typography>
        </Box>

        {/* Planned action — always shown, collapsed if long */}
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: alpha(PURPLE, 0.03),
            border: '1px solid',
            borderColor: alpha(PURPLE, 0.08),
          }}
        >
          <Typography
            variant="caption"
            sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}
          >
            Planned Action
          </Typography>

          {/* Always show preview */}
          <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
            {expanded ? entry.plannedAction : clamp(entry.plannedAction, PREVIEW_CHARS)}
          </Typography>
        </Box>

        {/* Expand / collapse toggle */}
        {canExpand && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 'auto', pt: 0.5 }}>
            <Tooltip title={expanded ? 'Show less' : 'Show full text'}>
              <IconButton
                size="small"
                onClick={() => setExpanded((v) => !v)}
                sx={{
                  color: 'primary.light',
                  fontSize: '0.7rem',
                  gap: 0.25,
                  borderRadius: 2,
                  px: 1,
                  '&:hover': { bgcolor: alpha(PURPLE, 0.06), color: 'primary.main' },
                }}
              >
                {expanded ? <UnfoldLessIcon sx={{ fontSize: 16 }} /> : <UnfoldMoreIcon sx={{ fontSize: 16 }} />}
                <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1 }}>
                  {expanded ? 'Less' : 'More'}
                </Typography>
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
