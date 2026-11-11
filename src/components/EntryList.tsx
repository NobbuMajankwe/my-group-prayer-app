import { Box, Card, IconButton, Tooltip, Typography, alpha } from '@mui/material';
import NoteAltOutlinedIcon from '@mui/icons-material/NoteAltOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import EntryCard from './EntryCard';
import EntryGridCard from './EntryGridCard';
import EntryListRow from './EntryListRow';
import type { ReviewEntry } from '../types/ReviewEntry';

export type ViewMode = 'card' | 'list' | 'grid';

interface EntryListProps {
  entries: ReviewEntry[];
  viewMode: ViewMode;
  onViewChange: (mode: ViewMode) => void;
  onEdit: (entry: ReviewEntry) => void;
  onDelete: (entry: ReviewEntry) => void;
  onToggleAction: (entry: ReviewEntry) => void;
}

const VIEWS: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
  { mode: 'card', icon: <ViewAgendaOutlinedIcon sx={{ fontSize: 18 }} />,  label: 'Card view'  },
  { mode: 'list', icon: <TableRowsOutlinedIcon  sx={{ fontSize: 18 }} />,  label: 'List view'  },
  { mode: 'grid', icon: <GridViewOutlinedIcon   sx={{ fontSize: 18 }} />,  label: 'Grid view'  },
];

export default function EntryList({ entries, viewMode, onViewChange, onEdit, onDelete, onToggleAction }: EntryListProps) {
  return (
    <Box>
      {/* Section heading */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
        <Typography variant="h6" sx={{ color: 'text.primary', flex: 1 }}>
          Entries
        </Typography>

        {entries.length > 0 && (
          <Typography
            variant="caption"
            sx={{
              px: 1.25,
              py: 0.25,
              borderRadius: 2,
              bgcolor: alpha('#7c3aed', 0.08),
              color: 'primary.dark',
              fontWeight: 700,
              mr: 0.5,
            }}
          >
            {entries.length}
          </Typography>
        )}

        {/* View toggle pill */}
        <Box
          sx={{
            display: 'flex',
            borderRadius: 2,
            border: '1px solid',
            borderColor: alpha('#7c3aed', 0.15),
            overflow: 'hidden',
          }}
        >
          {VIEWS.map(({ mode, icon, label }, i) => (
            <Box key={mode} sx={{ display: 'flex' }}>
              {i > 0 && <Box sx={{ width: '1px', bgcolor: alpha('#7c3aed', 0.15) }} />}
              <Tooltip title={label}>
                <IconButton
                  size="small"
                  onClick={() => onViewChange(mode)}
                  sx={{
                    borderRadius: 0,
                    px: 1,
                    color: viewMode === mode ? 'primary.main' : 'text.disabled',
                    bgcolor: viewMode === mode ? alpha('#7c3aed', 0.08) : 'transparent',
                    '&:hover': { bgcolor: alpha('#7c3aed', 0.06) },
                  }}
                >
                  {icon}
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Empty state */}
      {entries.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            borderRadius: 4,
            border: '1.5px dashed',
            borderColor: alpha('#7c3aed', 0.18),
            bgcolor: alpha('#7c3aed', 0.02),
          }}
        >
          <NoteAltOutlinedIcon sx={{ fontSize: 40, color: alpha('#7c3aed', 0.25), mb: 1.5 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}>
            No entries yet
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.disabled' }}>
            Fill in the form above to add your first entry.
          </Typography>
        </Box>

      ) : viewMode === 'card' ? (
        /* ── Single-column card view ─────────────────────── */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} onToggleAction={onToggleAction} />
          ))}
        </Box>

      ) : viewMode === 'grid' ? (
        /* ── 3-column grid view ──────────────────────────── */
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 2,
            alignItems: 'start',
          }}
        >
          {entries.map((entry) => (
            <EntryGridCard key={entry.id} entry={entry} onEdit={onEdit} onDelete={onDelete} onToggleAction={onToggleAction} />
          ))}
        </Box>

      ) : (
        /* ── Compact list view ───────────────────────────── */
        <Card sx={{ overflow: 'hidden' }}>
          {/* Column headers */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 1,
              bgcolor: alpha('#7c3aed', 0.04),
              borderBottom: '1px solid',
              borderColor: alpha('#7c3aed', 0.1),
            }}
          >
            <Typography variant="caption" sx={{ minWidth: 24, fontWeight: 700, color: 'text.disabled' }}>#</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', flex: '0 0 200px' }}>NAME</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}>REVIEWER</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', flex: 1, display: { xs: 'none', md: 'block' } }}>REVIEW</Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', display: { xs: 'none', sm: 'block' } }}>DATE</Typography>
          </Box>

          {entries.map((entry, i) => (
            <EntryListRow
              key={entry.id}
              entry={entry}
              index={i}
              isLast={i === entries.length - 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleAction={onToggleAction}
            />
          ))}
        </Card>
      )}
    </Box>
  );
}
