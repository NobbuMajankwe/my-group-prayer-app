import { useState, useEffect } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, IconButton,
  InputAdornment, TextField, ToggleButton, ToggleButtonGroup,
  Typography, alpha,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import CloseIcon         from '@mui/icons-material/Close';
import StarOutlinedIcon  from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WarningAmberIcon  from '@mui/icons-material/WarningAmberRounded';
import { hashPin }       from '../utils/crypto';
import type { LeaderPerson, LeaderRole } from '../types/ReviewEntry';

const MAX_LEADERS = 10;

const ROLE_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

interface Draft {
  name:     string;
  role:     LeaderRole;
  password: string;
  confirm:  string;
}

const EMPTY_DRAFT: Draft = { name: '', role: 'core', password: '', confirm: '' };

interface Props {
  open:           boolean;
  currentLeaders: LeaderPerson[];
  onSave:         (leaders: LeaderPerson[]) => void;
  onClose:        () => void;
}

export default function EditLeadersDialog({ open, currentLeaders, onSave, onClose }: Props) {
  const [leaders,    setLeaders]    = useState<LeaderPerson[]>(currentLeaders);
  const [draft,      setDraft]      = useState<Draft>(EMPTY_DRAFT);
  const [draftError, setDraftError] = useState('');
  const [adding,     setAdding]     = useState(false);

  useEffect(() => {
    if (open) {
      setLeaders(currentLeaders);
      setDraft(EMPTY_DRAFT);
      setDraftError('');
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const setD = (p: Partial<Draft>) => { setDraft((d) => ({ ...d, ...p })); setDraftError(''); };

  const handleAdd = async () => {
    const name = draft.name.trim();
    if (!name)                         { setDraftError('Please enter a name.'); return; }
    if (leaders.some((l) => l.name.toLowerCase() === name.toLowerCase()))
                                       { setDraftError('Name already exists.'); return; }
    if (leaders.length >= MAX_LEADERS) { setDraftError(`Max ${MAX_LEADERS} people.`); return; }
    if (draft.password.length < 4)     { setDraftError('Password must be at least 4 characters.'); return; }
    if (draft.password !== draft.confirm) { setDraftError('Passwords do not match.'); return; }

    setAdding(true);
    try {
      const hash = await hashPin(draft.password);
      setLeaders((p) => [...p, { name, role: draft.role, passwordHash: hash }]);
      setDraft(EMPTY_DRAFT);
    } finally {
      setAdding(false);
    }
  };

  const handleRoleToggle = (name: string, newRole: LeaderRole) =>
    setLeaders((p) => p.map((l) => l.name === name ? { ...l, role: newRole } : l));

  const handleRemove = (name: string) =>
    setLeaders((p) => p.filter((l) => l.name !== name));

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Manage leaders</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400, mt: 0.25 }}>
          Add new people or change roles. Passwords for existing members can be changed in their profile.
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5 }}>
        {/* Add new person */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
          <ToggleButtonGroup value={draft.role} exclusive size="small" fullWidth
            onChange={(_, v) => { if (v) setD({ role: v as LeaderRole }); }}
            sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}>
            <ToggleButton value="leader" sx={{ gap: 0.75 }}>
              <StarOutlinedIcon sx={{ fontSize: 15 }} /> Leader
            </ToggleButton>
            <ToggleButton value="core" sx={{ gap: 0.75 }}>
              <GroupsOutlinedIcon sx={{ fontSize: 15 }} /> Core / Intern
            </ToggleButton>
          </ToggleButtonGroup>

          <TextField size="small" label="Name" fullWidth value={draft.name}
            onChange={(e) => setD({ name: e.target.value })}
            disabled={adding || leaders.length >= MAX_LEADERS}
            placeholder="New person's name" />
          <TextField size="small" label="Password" type="password" fullWidth
            value={draft.password} onChange={(e) => setD({ password: e.target.value })}
            disabled={adding || leaders.length >= MAX_LEADERS}
            helperText="Min 4 characters" />
          <TextField size="small" label="Confirm password" type="password" fullWidth
            value={draft.confirm} onChange={(e) => setD({ confirm: e.target.value })}
            disabled={adding || leaders.length >= MAX_LEADERS}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleAdd}
                      disabled={adding || leaders.length >= MAX_LEADERS || !draft.name.trim() || !draft.password}
                      edge="end" color="primary" aria-label="Add person">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }} />
        </Box>

        {draftError && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{draftError}</Alert>}

        <Divider sx={{ mb: 2 }} />

        {/* Existing people */}
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled',
          textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>
          Current team · {leaders.length} / {MAX_LEADERS}
        </Typography>

        {leaders.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
            {leaders.map((person) => {
              const c = ROLE_COLOURS[person.role];
              const hasPassword = Boolean(person.passwordHash);
              return (
                <Box key={person.name} sx={{ display: 'flex', alignItems: 'center', gap: 1,
                  px: 1.5, py: 0.875, borderRadius: 2.5,
                  bgcolor: alpha('#7c3aed', 0.03),
                  border: '1px solid', borderColor: alpha('#7c3aed', 0.1) }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, color: 'text.primary' }}>
                    {person.displayName || person.name}
                  </Typography>

                  {!hasPassword && (
                    <WarningAmberIcon sx={{ fontSize: 15, color: '#eab308' }} titleAccess="No password set" />
                  )}

                  {/* Inline role toggle */}
                  <ToggleButtonGroup value={person.role} exclusive size="small"
                    onChange={(_, v) => { if (v) handleRoleToggle(person.name, v as LeaderRole); }}
                    sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600,
                      fontSize: '0.7rem', py: 0.25, px: 0.875, lineHeight: 1.4,
                      border: `1px solid ${alpha('#7c3aed', 0.15)}` } }}>
                    <ToggleButton value="leader">Leader</ToggleButton>
                    <ToggleButton value="core">Core</ToggleButton>
                  </ToggleButtonGroup>

                  <Chip label={person.role === 'leader' ? 'Leader' : 'Core'} size="small"
                    sx={{ bgcolor: c.bg, color: c.color, fontWeight: 700,
                      border: `1px solid ${c.border}`, display: { xs: 'none', sm: 'flex' },
                      height: 20, fontSize: '0.65rem' }} />

                  <IconButton size="small" onClick={() => handleRemove(person.name)}
                    sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}>
                    <CloseIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.disabled', textAlign: 'center', py: 2 }}>
            No people added yet.
          </Typography>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}
          sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button variant="contained" color="primary"
          onClick={() => onSave(leaders)} disabled={leaders.length === 0}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
