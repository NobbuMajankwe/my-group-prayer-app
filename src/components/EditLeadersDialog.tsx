/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl, IconButton,
  InputAdornment, InputLabel, MenuItem, Select, Tab, Tabs,
  TextField, ToggleButton, ToggleButtonGroup,
  Typography, alpha,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import CloseIcon         from '@mui/icons-material/Close';
import StarOutlinedIcon  from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WarningAmberIcon  from '@mui/icons-material/WarningAmberRounded';
import { hashPin }       from '../utils/crypto';
import CsvImportPanel    from './CsvImportPanel';
import type { LeaderPerson, LeaderRole } from '../types/ReviewEntry';

const MAX_LEADERS = 10;

const ROLE_COLOURS: Record<LeaderRole, { bg: string; border: string; color: string }> = {
  leader: { bg: 'rgba(234,179,8,0.10)',  border: 'rgba(234,179,8,0.30)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', border: 'rgba(20,184,166,0.30)', color: '#0f766e' },
};

interface Draft {
  name:           string;
  role:           LeaderRole;
  password:       string;
  confirm:        string;
  assignedLeader: string;
}

const EMPTY_DRAFT: Draft = { name: '', role: 'core', password: '', confirm: '', assignedLeader: '' };

interface Props {
  open:           boolean;
  currentLeaders: LeaderPerson[];
  onSave:         (leaders: LeaderPerson[]) => void;
  onClose:        () => void;
  saving?:        boolean;
}

export default function EditLeadersDialog({ open, currentLeaders, onSave, onClose, saving }: Props) {
  const [leaders,    setLeaders]    = useState<LeaderPerson[]>(currentLeaders);
  const [draft,      setDraft]      = useState<Draft>(EMPTY_DRAFT);
  const [draftError, setDraftError] = useState('');
  const [adding,     setAdding]     = useState(false);
  const [inputTab,   setInputTab]   = useState(0); // 0 = one by one, 1 = CSV

  useEffect(() => {
    if (open) {
      setLeaders(currentLeaders);
      setDraft(EMPTY_DRAFT);
      setDraftError('');
      setInputTab(0);
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
    if (draft.role === 'core' && !draft.assignedLeader) { setDraftError('Please assign a leader for this core.'); return; }

    setAdding(true);
    try {
      const hash = await hashPin(draft.password);
      setLeaders((p) => [...p, { name, role: draft.role, passwordHash: hash, assignedLeader: draft.assignedLeader || undefined }]);
      setDraft(EMPTY_DRAFT);
    } finally {
      setAdding(false);
    }
  };

  // CSV import: Name, Role, Password
  const handleCsvImport = async (rows: string[][]) => {
    const toAdd: LeaderPerson[] = [];
    for (const row of rows) {
      const [name = '', roleRaw = '', password = ''] = row;
      const trimmedName = name.trim();
      const role: LeaderRole = roleRaw.toLowerCase().includes('leader') ? 'leader' : 'core';
      const pw = password.trim();
      if (!trimmedName) continue;
      if (leaders.some((l) => l.name.toLowerCase() === trimmedName.toLowerCase())) continue;
      const hash = pw.length >= 4 ? await hashPin(pw) : '';
      toAdd.push({ name: trimmedName, role, passwordHash: hash });
    }
    if (toAdd.length > 0) {
      setLeaders((p) => [...p, ...toAdd].slice(0, MAX_LEADERS));
    }
  };

  const handleRoleToggle = (name: string, newRole: LeaderRole) =>
    setLeaders((p) => p.map((l) => l.name === name
      ? { ...l, role: newRole, assignedLeader: newRole === 'leader' ? undefined : l.assignedLeader }
      : l));

  const handleAssignLeader = (coreName: string, leaderName: string) =>
    setLeaders((p) => p.map((l) => l.name === coreName ? { ...l, assignedLeader: leaderName || undefined } : l));

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
        {/* Add new person — tabs */}
        <Tabs value={inputTab} onChange={(_, v) => setInputTab(v)}
          sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' } }}>
          <Tab label="Add one by one" />
          <Tab label="Import CSV" />
        </Tabs>

        {inputTab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
            <ToggleButtonGroup value={draft.role} exclusive size="small" fullWidth
              onChange={(_, v) => { if (v) setD({ role: v as LeaderRole, assignedLeader: '' }); }}
              sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}>
              <ToggleButton value="leader" sx={{ gap: 0.75 }}>
                <StarOutlinedIcon sx={{ fontSize: 15 }} /> Leader
              </ToggleButton>
              <ToggleButton value="core" sx={{ gap: 0.75 }}>
                <GroupsOutlinedIcon sx={{ fontSize: 15 }} /> Core / Intern
              </ToggleButton>
            </ToggleButtonGroup>

            {draft.role === 'core' && (
              <FormControl size="small" fullWidth required>
                <InputLabel id="new-core-leader-label">Assigned leader</InputLabel>
                <Select
                  labelId="new-core-leader-label"
                  label="Assigned leader"
                  value={draft.assignedLeader}
                  onChange={(e) => setD({ assignedLeader: e.target.value })}
                >
                  {leaders.filter((l) => l.role === 'leader').map((l) => (
                    <MenuItem key={l.name} value={l.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <StarOutlinedIcon sx={{ fontSize: 13, color: '#eab308' }} />
                        {l.displayName || l.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

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

            {draftError && <Alert severity="error" sx={{ borderRadius: 2 }}>{draftError}</Alert>}
          </Box>
        )}

        {inputTab === 1 && (
          <Box sx={{ mb: 2.5 }}>
            <CsvImportPanel
              formatHint="Each line: Name, Role (leader or core), Password  —  passwords shorter than 4 chars will be left blank."
              example={`Shereen, leader, mypassword\nAisha, core, aisha1234`}
              onImport={handleCsvImport}
              disabled={leaders.length >= MAX_LEADERS}
            />
          </Box>
        )}

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

                  {person.role === 'core' && (
                    <Select
                      size="small"
                      displayEmpty
                      value={person.assignedLeader ?? ''}
                      onChange={(e) => handleAssignLeader(person.name, e.target.value)}
                      sx={{ fontSize: '0.72rem', minWidth: 110, height: 28,
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: alpha('#eab308', 0.4) } }}
                    >
                      <MenuItem value=""><em style={{ fontSize: '0.72rem' }}>No leader</em></MenuItem>
                      {leaders.filter((l) => l.role === 'leader').map((l) => (
                        <MenuItem key={l.name} value={l.name} sx={{ fontSize: '0.72rem' }}>
                          {l.displayName || l.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}

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
          onClick={() => onSave(leaders)} disabled={saving || leaders.length === 0}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
