import { useState } from 'react';
import {
  Box,
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
import type { ReviewEntry } from '../types/ReviewEntry';

interface EntryListRowProps {
  entry: ReviewEntry;
  index: number;
  isLast: boolean;
  onEdit: (entry: ReviewEntry) => void;
  onDelete: (entry: ReviewEntry) => void;
}

export default function EntryListRow({ entry, index, isLast, onEdit, onDelete }: EntryListRowProps) {
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

        {/* Name */}
        <Typography
          variant="body2"
          sx={{ fontWeight: 600, color: 'text.primary', minWidth: 0, flex: '0 0 160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {entry.name}
        </Typography>

        {/* Leader badge */}
        <Typography
          variant="caption"
          sx={{
            px: 1,
            py: 0.2,
            borderRadius: 1.5,
            bgcolor: alpha('#7c3aed', 0.08),
            color: 'primary.dark',
            fontWeight: 700,
            flexShrink: 0,
            display: { xs: 'none', sm: 'block' },
          }}
        >
          {entry.leaderName}
        </Typography>

        {/* Review preview */}
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
          {entry.review}
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
              Review
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.75 }}>
              {entry.review}
            </Typography>
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
        </Box>
      </Collapse>

      {!isLast && <Divider sx={{ borderColor: alpha('#7c3aed', 0.07) }} />}
    </Box>
  );
}
