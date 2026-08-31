import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Collapse,
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
import type { ReviewEntry } from '../types/ReviewEntry';

const PURPLE = '#7c3aed';
const PINK   = '#db2777';

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
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {entry.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
              <Typography
                variant="caption"
                sx={{
                  px: 0.875,
                  py: 0.15,
                  borderRadius: 1.5,
                  bgcolor: alpha(PURPLE, 0.08),
                  color: 'primary.dark',
                  fontWeight: 700,
                  lineHeight: 1.6,
                }}
              >
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

          {/* Extra content when expanded */}
          <Collapse in={false}>{/* placeholder — expansion is inline above */}</Collapse>
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
