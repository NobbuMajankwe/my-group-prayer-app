import { useState } from 'react';
import {
  Alert, Box, Button, Chip, Divider, IconButton,
  Paper, Step, StepLabel, Stepper, Tab, Tabs,
  TextField, ToggleButton, ToggleButtonGroup, Typography, alpha,
} from '@mui/material';
import AddIcon            from '@mui/icons-material/Add';
import ArrowForwardIcon   from '@mui/icons-material/ArrowForward';
import CloseIcon          from '@mui/icons-material/Close';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import StarOutlinedIcon   from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import { hashPin }        from '../utils/crypto';
import CsvImportPanel     from './CsvImportPanel';
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

const EMPTY_DRAFT: Draft = { name: '', role: 'leader', password: '', confirm: '' };

interface LeaderSetupProps {
  onComplete: (leaders: LeaderPerson[]) => void;
  saving?:    boolean;
}

export default function LeaderSetup({ onComplete, saving }: LeaderSetupProps) {
  const [leaders,    setLeaders]    = useState<LeaderPerson[]>([]);
  const [draft,      setDraft]      = useState<Draft>(EMPTY_DRAFT);
  const [draftError, setDraftError] = useState('');
  const [adding,     setAdding]     = useState(false);
  const [step,       setStep]       = useState(0);
  const [inputTab,   setInputTab]   = useState(0); // 0 = one by one, 1 = CSV

  const setD = (p: Partial<Draft>) => { setDraft((d) => ({ ...d, ...p })); setDraftError(''); };

  const handleAdd = async () => {
    const name = draft.name.trim();
    if (!name)                         { setDraftError('Please enter a name.'); return; }
    if (leaders.some((l) => l.name.toLowerCase() === name.toLowerCase()))
                                       { setDraftError('That name is already added.'); return; }
    if (leaders.length >= MAX_LEADERS) { setDraftError(`Maximum ${MAX_LEADERS} people.`); return; }
    if (draft.password.length < 4)     { setDraftError('Password must be at least 4 characters.'); return; }
    if (draft.password !== draft.confirm) { setDraftError('Passwords do not match.'); return; }

    setAdding(true);
    try {
      const hash = await hashPin(draft.password);
      setLeaders((p) => [...p, { id: crypto.randomUUID(), name, role: draft.role, passwordHash: hash }]);
      setDraft(EMPTY_DRAFT);
    } finally {
      setAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  };

  // ── CSV import ────────────────────────────────────────────────────────
  // Expected format: Name, Role (leader|core), Password
  // e.g.:  Shereen, leader, mypass123
  const handleCsvImport = async (rows: string[][]) => {
    const toAdd: LeaderPerson[] = [];
    for (const row of rows) {
      const [name = '', roleRaw = '', password = ''] = row;
      const trimmedName = name.trim();
      const role: LeaderRole = roleRaw.toLowerCase().includes('leader') ? 'leader' : 'core';
      const pw   = password.trim();
      if (!trimmedName) continue;
      if (leaders.some((l) => l.name.toLowerCase() === trimmedName.toLowerCase())) continue;
      const hash = pw.length >= 4 ? await hashPin(pw) : '';
      toAdd.push({ id: crypto.randomUUID(), name: trimmedName, role, passwordHash: hash });
    }
    if (toAdd.length > 0) {
      setLeaders((p) => [...p, ...toAdd].slice(0, MAX_LEADERS));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', px: 2, bgcolor: '#faf5ff',
        backgroundImage:
          'radial-gradient(ellipse 60% 50% at 10% 10%, #ede9fe 0%, transparent 60%),' +
          'radial-gradient(ellipse 50% 40% at 90% 90%, #fce7f3 0%, transparent 60%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: '100%', maxWidth: 520, p: { xs: 3, sm: 4 },
          borderRadius: 4, border: '1px solid', borderColor: alpha('#7c3aed', 0.12),
        }}
      >
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            component="img"
            src="/favicon_io/android-chrome-192x192.png"
            alt="logo"
            sx={{ width: 48, height: 48, borderRadius: 2.5, boxShadow: '0 2px 8px rgba(124,58,237,0.18)' }}
          />
          <Box>
            <Typography variant="h6" sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', lineHeight: 1.2,
            }}>
              PrayTogether
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Set up your team
            </Typography>
          </Box>
        </Box>

        <Stepper activeStep={step} sx={{ mb: 3 }}>
          <Step><StepLabel>Add people</StepLabel></Step>
          <Step><StepLabel>Confirm &amp; start</StepLabel></Step>
        </Stepper>

        {step === 0 && (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Add each leader or core/intern. Each person sets their own password here — they'll use it to log in.
            </Typography>

            {/* Input mode tabs */}
            <Tabs value={inputTab} onChange={(_, v) => setInputTab(v)}
              sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' } }}>
              <Tab label="One by one" />
              <Tab label="Import CSV" />
            </Tabs>

            {inputTab === 0 && (
              <>
                {/* Role toggle */}
                <ToggleButtonGroup
                  value={draft.role} exclusive size="small" fullWidth
                  onChange={(_, v) => { if (v) setD({ role: v as LeaderRole }); }}
                  sx={{ mb: 1.5, '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600 } }}
                >
                  <ToggleButton value="leader" sx={{ gap: 0.75 }}>
                    <StarOutlinedIcon sx={{ fontSize: 15 }} /> Leader
                  </ToggleButton>
                  <ToggleButton value="core" sx={{ gap: 0.75 }}>
                    <GroupsOutlinedIcon sx={{ fontSize: 15 }} /> Core / Intern
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
                  <TextField
                    size="small" label="Name" fullWidth
                    value={draft.name}
                    onChange={(e) => setD({ name: e.target.value })}
                    onKeyDown={handleKeyDown}
                    disabled={adding}
                    placeholder={draft.role === 'leader' ? 'e.g. Shereen' : 'e.g. Aisha'}
                  />
                  <TextField
                    size="small" label="Password" type="password" fullWidth
                    value={draft.password}
                    onChange={(e) => setD({ password: e.target.value })}
                    onKeyDown={handleKeyDown}
                    disabled={adding}
                    helperText="Minimum 4 characters"
                  />
                  <TextField
                    size="small" label="Confirm password" type="password" fullWidth
                    value={draft.confirm}
                    onChange={(e) => setD({ confirm: e.target.value })}
                    onKeyDown={handleKeyDown}
                    disabled={adding}
                  />
                </Box>

                {draftError && (
                  <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{draftError}</Alert>
                )}

                <Button
                  fullWidth variant="outlined" color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  disabled={adding || leaders.length >= MAX_LEADERS}
                  sx={{ mb: 2 }}
                >
                  {adding ? 'Adding…' : `Add person  (${leaders.length} / ${MAX_LEADERS})`}
                </Button>
              </>
            )}

            {inputTab === 1 && (
              <Box sx={{ mb: 2 }}>
                <CsvImportPanel
                  formatHint="Each line: Name, Role (leader or core), Password  —  passwords shorter than 4 chars will be left blank (set later via Profile)."
                  example={`Shereen, leader, mypassword\nAisha, core, aisha1234\nFatima, leader, fatima99`}
                  onImport={handleCsvImport}
                  disabled={leaders.length >= MAX_LEADERS}
                />
              </Box>
            )}

            {/* Added people chips */}
            {leaders.length > 0 && (
              <Box sx={{
                display: 'flex', flexWrap: 'wrap', gap: 0.75,
                p: 1.5, borderRadius: 3,
                bgcolor: alpha('#7c3aed', 0.03),
                border: '1px dashed', borderColor: alpha('#7c3aed', 0.15),
                mb: 2,
              }}>
                {leaders.map((l) => {
                  const c = ROLE_COLOURS[l.role];
                  return (
                    <Chip
                      key={l.id} size="small"
                      label={`${l.name} · ${l.role === 'leader' ? 'Leader' : 'Core'}`}
                      onDelete={() => setLeaders((p) => p.filter((x) => x.id !== l.id))}
                      deleteIcon={<CloseIcon sx={{ fontSize: '13px !important' }} />}
                      sx={{ bgcolor: c.bg, color: c.color, fontWeight: 600, border: '1px solid', borderColor: c.border }}
                    />
                  );
                })}
              </Box>
            )}

            <Button
              fullWidth variant="contained" color="primary"
              endIcon={<ArrowForwardIcon />}
              disabled={leaders.length === 0}
              onClick={() => setStep(1)}
              sx={{ py: 1.25 }}
            >
              Review &amp; continue
            </Button>
          </>
        )}

        {/* ── Step 1: Confirm ── */}
        {step === 1 && (
          <>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Confirm your team before getting started.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
              {leaders.map((l) => {
                const c = ROLE_COLOURS[l.role];
                return (
                  <Box key={l.id} sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    px: 1.5, py: 1, borderRadius: 2.5,
                    bgcolor: alpha('#7c3aed', 0.03),
                    border: '1px solid', borderColor: alpha('#7c3aed', 0.1),
                  }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: c.color, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>{l.name}</Typography>
                    <Chip
                      label={l.role === 'leader' ? 'Leader' : 'Core'} size="small"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: c.bg, color: c.color, border: `1px solid ${c.border}` }}
                    />
                    <IconButton size="small"
                      onClick={() => setLeaders((p) => p.filter((x) => x.id !== l.id))}
                      sx={{ color: 'text.disabled' }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined" color="inherit"
                startIcon={<EditOutlinedIcon />}
                onClick={() => setStep(0)}
                sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}
              >
                Back
              </Button>
              <Button
                fullWidth variant="contained" color="primary"
                endIcon={<ArrowForwardIcon />}
                onClick={() => onComplete(leaders)}
                disabled={saving}
                sx={{ py: 1.25 }}
              >
                {saving ? 'Saving…' : 'Get started'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
