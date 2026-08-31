import { Box, Card, CardContent, Divider, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import type { ReviewEntry } from '../types/ReviewEntry';

interface EntryCardProps {
  entry: ReviewEntry;
  onEdit: (entry: ReviewEntry) => void;
  onDelete: (entry: ReviewEntry) => void;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        display: 'block',
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'text.disabled',
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  );
}

function SectionText({ children }: { children: string }) {
  return (
    <Typography
      variant="body2"
      sx={{
        color: 'text.primary',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        lineHeight: 1.75,
      }}
    >
      {children}
    </Typography>
  );
}

export default function EntryCard({ entry, onEdit, onDelete }: EntryCardProps) {
  const dateLabel = new Date(entry.createdAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <Card
      sx={{
        position: 'relative',
        transition: 'box-shadow 0.15s ease',
        overflow: 'visible',
        '&:hover': { boxShadow: 4 },
        // Left accent bar
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 12,
          bottom: 12,
          width: 3,
          borderRadius: '0 3px 3px 0',
          background: 'linear-gradient(180deg, #7c3aed 0%, #db2777 100%)',
        },
      }}
    >
      <CardContent sx={{ pl: { xs: 3, sm: 3.5 }, pr: { xs: 2, sm: 2.5 }, py: { xs: 2.5, sm: 3 }, '&:last-child': { pb: { xs: 2.5, sm: 3 } } }}>

        {/* Header row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2.5, gap: 1 }}>
          <Box>
            {/* Participant name — most prominent */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.3, mb: 0.5 }}
            >
              {entry.name}
            </Typography>
            {/* Leader + date row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1,
                  py: 0.2,
                  borderRadius: 1.5,
                  bgcolor: alpha('#7c3aed', 0.08),
                  color: 'primary.dark',
                  fontWeight: 700,
                }}
              >
                {entry.leaderName}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {dateLabel}
              </Typography>
            </Box>
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
            <Tooltip title="Edit entry">
              <IconButton
                size="small"
                onClick={() => onEdit(entry)}
                sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#7c3aed', 0.07) } }}
              >
                <EditOutlinedIcon sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete entry">
              <IconButton
                size="small"
                onClick={() => onDelete(entry)}
                sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#dc2626', 0.06) } }}
              >
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
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: alpha('#7c3aed', 0.03),
            border: '1px solid',
            borderColor: alpha('#7c3aed', 0.08),
          }}
        >
          <SectionLabel>Planned Action</SectionLabel>
          <SectionText>{entry.plannedAction}</SectionText>
        </Box>

      </CardContent>
    </Card>
  );
}
