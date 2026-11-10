import {
  Box, Button, Chip, Divider, Drawer,
  IconButton, Tooltip, Typography, alpha,
} from '@mui/material';
import CloseIcon             from '@mui/icons-material/Close';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import type { AuditEntry, AuditAction } from '../types/AuditLog';

// ── Colour + label per action type ────────────────────────────────────────

const ACTION_META: Record<AuditAction, { label: string; bg: string; color: string; border: string }> = {
  login:            { label: 'Login',            bg: 'rgba(20,184,166,0.1)',  color: '#0f766e', border: 'rgba(20,184,166,0.25)'  },
  logout:           { label: 'Logout',           bg: 'rgba(107,114,128,0.1)', color: '#374151', border: 'rgba(107,114,128,0.25)' },
  pin_set:          { label: 'PIN Set',          bg: 'rgba(124,58,237,0.08)', color: '#5b21b6', border: 'rgba(124,58,237,0.2)'   },
  pin_changed:      { label: 'PIN Changed',      bg: 'rgba(124,58,237,0.08)', color: '#5b21b6', border: 'rgba(124,58,237,0.2)'   },
  password_changed: { label: 'Password Changed', bg: 'rgba(124,58,237,0.08)', color: '#5b21b6', border: 'rgba(124,58,237,0.2)'   },
  profile_updated:  { label: 'Profile Updated',  bg: 'rgba(59,130,246,0.08)', color: '#1d4ed8', border: 'rgba(59,130,246,0.2)'   },
  entry_added:      { label: 'Entry Added',      bg: 'rgba(34,197,94,0.1)',   color: '#15803d', border: 'rgba(34,197,94,0.25)'   },
  entry_edited:     { label: 'Entry Edited',     bg: 'rgba(234,179,8,0.1)',   color: '#92400e', border: 'rgba(234,179,8,0.25)'   },
  entry_deleted:    { label: 'Entry Deleted',    bg: 'rgba(220,38,38,0.08)',  color: '#b91c1c', border: 'rgba(220,38,38,0.2)'    },
  leaders_updated:  { label: 'Leaders Updated',  bg: 'rgba(59,130,246,0.08)', color: '#1d4ed8', border: 'rgba(59,130,246,0.2)'   },
  reminder_snoozed: { label: 'Reminder Snoozed', bg: 'rgba(234,179,8,0.1)',   color: '#92400e', border: 'rgba(234,179,8,0.25)'   },
};

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function groupByDate(entries: AuditEntry[]): { date: string; items: AuditEntry[] }[] {
  const map = new Map<string, AuditEntry[]>();
  for (const entry of entries) {
    const label = new Date(entry.timestamp).toLocaleDateString('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
    if (!map.has(label)) map.set(label, []);
    map.get(label)!.push(entry);
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }));
}

interface AuditLogDrawerProps {
  open:    boolean;
  log:     AuditEntry[];
  onClose: () => void;
  onClear: () => void;
}

export default function AuditLogDrawer({ open, log, onClose, onClear }: AuditLogDrawerProps) {
  const groups = groupByDate(log);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100vw', sm: 420 },
            borderRadius: { sm: '20px 0 0 20px' },
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1,
          borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ flex: 1, color: 'primary.main' }}>
          Activity Log
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', mr: 1 }}>
          {log.length} event{log.length !== 1 ? 's' : ''}
        </Typography>
        {log.length > 0 && (
          <Tooltip title="Clear all logs">
            <IconButton
              size="small"
              onClick={onClear}
              sx={{ color: 'error.main', '&:hover': { bgcolor: alpha('#dc2626', 0.06) } }}
            >
              <DeleteSweepOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.disabled' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.5, py: 2 }}>
        {log.length === 0 ? (
          <Box sx={{ textAlign: 'center', pt: 8, color: 'text.disabled' }}>
            <Typography variant="body2">No activity recorded yet.</Typography>
          </Box>
        ) : (
          groups.map(({ date, items }) => (
            <Box key={date} sx={{ mb: 3 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700, color: 'text.disabled',
                  textTransform: 'uppercase', letterSpacing: '0.07em',
                  display: 'block', mb: 1,
                }}
              >
                {date}
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {items.map((entry) => {
                  const meta = ACTION_META[entry.action] ?? ACTION_META.entry_added;
                  return (
                    <Box
                      key={entry.id}
                      sx={{
                        display: 'flex', alignItems: 'flex-start', gap: 1.25,
                        p: 1.25, borderRadius: 2.5,
                        bgcolor: alpha('#7c3aed', 0.02),
                        border: '1px solid', borderColor: alpha('#7c3aed', 0.07),
                      }}
                    >
                      <Chip
                        label={meta.label}
                        size="small"
                        sx={{
                          height: 20, fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                          bgcolor: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.primary', wordBreak: 'break-word', lineHeight: 1.5 }}
                        >
                          {entry.description}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                          {formatTimestamp(entry.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Divider sx={{ mt: 2, borderColor: alpha('#7c3aed', 0.07) }} />
            </Box>
          ))
        )}
      </Box>

      {/* Footer */}
      {log.length > 0 && (
        <Box
          sx={{ px: 2.5, py: 2, borderTop: '1px solid', borderColor: 'divider', flexShrink: 0 }}
        >
          <Button
            fullWidth
            variant="outlined"
            color="inherit"
            startIcon={<DeleteSweepOutlinedIcon />}
            onClick={onClear}
            sx={{
              borderColor: alpha('#dc2626', 0.3), color: 'error.main',
              '&:hover': { bgcolor: alpha('#dc2626', 0.04), borderColor: 'error.main' },
            }}
          >
            Clear activity log
          </Button>
        </Box>
      )}
    </Drawer>
  );
}
