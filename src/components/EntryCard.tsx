import { Box, Card, CardContent, Chip, Divider, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import StarOutlinedIcon from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import type { ReviewEntry, LeaderRole, RevieweeRole } from '../types/ReviewEntry';

const LEADER_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

const REVIEWEE_COLOURS: Record<RevieweeRole, { bg: string; border: string; color: string }> = {
  member: { bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.2)', color: '#5b21b6' },
  core:   { bg: 'rgba(20,184,166,0.08)', border: 'rgba(20,184,166,0.25)', color: '#0f766e' },
};

interface EntryCardProps {
  entry: ReviewEntry;
  onEdit: (entry: ReviewEntry) => void;
  onDelete: (entry: ReviewEntry) => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}>
      {children}
    </Typography>
  );
}
function SectionText({ children }: { children: string }) {
  return (
    <Typography variant="body2" sx={{ color: 'text.primary', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.75 }}>
      {children}
    </Typography>
  );
}

export default function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const dateLabel  = new Date(entry.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const lc         = LEADER_COLOURS[entry.leaderRole ?? 'core'];
  const rc         = REVIEWEE_COLOURS[entry.revieweeRole ?? 'member'];

  return (
    <Card
      sx={{
        position: 'relative', overflow: 'visible',
        transition: 'box-shadow 0.15s ease',
        '&:hover': { boxShadow: 4 },
        '&::before': {
          content: '""', position: 'absolute',
          left: 0, top: 12, bottom: 12, width: 3,
          borderRadius: '0 3px 3px 0',
          background: 'linear-gradient(180deg, #7c3aed 0%, #db2777 100%)',
        },
      }}
    >
      <CardContent sx={{ pl: { xs: 3, sm: 3.5 }, pr: { xs: 2, sm: 2.5 }, py: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2, gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            {/* Reviewee name + role */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3 }}>
                {entry.revieweeName ?? (entry as any).name}
              </Typography>
              <Chip
                label={entry.revieweeRole === 'core' ? 'Core / Intern' : 'Member'}
                size="small"
                sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700, bgcolor: rc.bg, color: rc.color, border: `1px solid ${rc.border}` }}
              />
            </Box>
            {/* Reviewer + date */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {entry.leaderRole === 'leader'
                ? <StarOutlinedIcon sx={{ fontSize: 13, color: '#eab308' }} />
                : <GroupsOutlinedIcon sx={{ fontSize: 13, color: '#14b8a6' }} />}
              <Typography variant="caption" sx={{ px: 0.875, py: 0.15, borderRadius: 1.5, bgcolor: lc.bg, color: lc.color, fontWeight: 700, border: `1px solid ${lc.border}` }}>
                {entry.leaderName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>{dateLabel}</Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
            <Tooltip title="Edit entry">
              <IconButton size="small" onClick={() => onEdit(entry)} sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#7c3aed', 0.07) } }}>
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete entry">
              <IconButton size="small" onClick={() => onDelete(entry)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#dc2626', 0.06) } }}>
                <DeleteOutlineIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Review */}
        <Box sx={{ mb: 2 }}>
          <SectionLabel>Review</SectionLabel>
          <SectionText>{entry.review}</SectionText>
        </Box>

        <Divider sx={{ mb: 2, borderColor: alpha('#7c3aed', 0.07) }} />

        {/* Planned action */}
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha('#7c3aed', 0.03), border: '1px solid', borderColor: alpha('#7c3aed', 0.08) }}>
          <SectionLabel>Planned Action</SectionLabel>
          <SectionText>{entry.plannedAction}</SectionText>
        </Box>

      </CardContent>
    </Card>
  );
}
