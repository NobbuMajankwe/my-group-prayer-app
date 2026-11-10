import { useState } from 'react';
import {
  Alert, Avatar, Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, Tab, Tabs,
  TextField, Typography, alpha,
} from '@mui/material';
import PersonOutlinedIcon  from '@mui/icons-material/PersonOutlined';
import LockOutlinedIcon    from '@mui/icons-material/LockOutlined';
import SaveOutlinedIcon    from '@mui/icons-material/SaveOutlined';
import StarOutlinedIcon    from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon  from '@mui/icons-material/GroupsOutlined';
import { hashPin, verifyPin } from '../utils/crypto';
import type { LeaderPerson }  from '../types/ReviewEntry';

const ROLE_COLOURS = {
  leader: { bg: 'rgba(234,179,8,0.10)',  color: '#92400e' },
  core:   { bg: 'rgba(20,184,166,0.10)', color: '#0f766e' },
};

interface ProfileDialogProps {
  open:    boolean;
  leader:  LeaderPerson;
  onSave:  (updated: LeaderPerson) => void;
  onClose: () => void;
}

export default function ProfileDialog({ open, leader, onSave, onClose }: ProfileDialogProps) {
  const [tab,         setTab]         = useState(0);
  const [displayName, setDisplayName] = useState(leader.displayName || leader.name);
  const [nameError,   setNameError]   = useState('');
  const [currentPw,   setCurrentPw]   = useState('');
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [pwError,     setPwError]     = useState('');
  const [pwSuccess,   setPwSuccess]   = useState(false);
  const [loading,     setLoading]     = useState(false);

  const rc       = ROLE_COLOURS[leader.role];
  const initials = (leader.displayName || leader.name).slice(0, 2).toUpperCase();

  // Reset when dialog opens
  const handleEntered = () => {
    setTab(0);
    setDisplayName(leader.displayName || leader.name);
    setNameError('');
    setCurrentPw(''); setNewPw(''); setConfirmPw('');
    setPwError(''); setPwSuccess(false);
  };

  const handleSaveName = () => {
    const trimmed = displayName.trim();
    if (!trimmed) { setNameError('Display name cannot be empty.'); return; }
    setNameError('');
    onSave({ ...leader, displayName: trimmed });
  };

  const handleChangePassword = async () => {
    setPwError(''); setPwSuccess(false);
    if (!currentPw)           { setPwError('Enter your current password.'); return; }
    if (newPw.length < 4)     { setPwError('New password must be at least 4 characters.'); return; }
    if (newPw !== confirmPw)  { setPwError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const ok = await verifyPin(currentPw, leader.passwordHash);
      if (!ok) { setPwError('Current password is incorrect.'); return; }
      const newHash = await hashPin(newPw);
      onSave({ ...leader, passwordHash: newHash });
      setPwSuccess(true);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch {
      setPwError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ transition: { onEntered: handleEntered } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {/* Leader card */}
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.5, borderRadius: 3,
            bgcolor: alpha('#7c3aed', 0.04),
            border: '1px solid', borderColor: alpha('#7c3aed', 0.1),
          }}
        >
          <Avatar sx={{ width: 44, height: 44, bgcolor: rc.bg, color: rc.color, fontWeight: 700, fontSize: '1rem' }}>
            {initials}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {leader.displayName || leader.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {leader.role === 'leader'
                ? <StarOutlinedIcon   sx={{ fontSize: 12, color: '#eab308' }} />
                : <GroupsOutlinedIcon sx={{ fontSize: 12, color: '#14b8a6' }} />}
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {leader.role === 'leader' ? 'Leader' : 'Core / Intern'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5, pb: 1 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab
            icon={<PersonOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Profile"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }}
          />
          <Tab
            icon={<LockOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Password"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 40 }}
          />
        </Tabs>

        {/* ── Profile tab ── */}
        {tab === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Display name"
              fullWidth
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setNameError(''); }}
              error={Boolean(nameError)}
              helperText={nameError || 'How your name appears in the app'}
            />
            <TextField
              label="Username"
              fullWidth
              value={leader.name}
              disabled
              helperText="Username cannot be changed"
            />
            <TextField
              label="Role"
              fullWidth
              value={leader.role === 'leader' ? 'Leader' : 'Core / Intern'}
              disabled
              helperText="Role is managed by the admin"
            />
          </Box>
        )}

        {/* ── Password tab ── */}
        {tab === 1 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {pwError   && <Alert severity="error"   sx={{ borderRadius: 2 }}>{pwError}</Alert>}
            {pwSuccess && <Alert severity="success" sx={{ borderRadius: 2 }}>Password changed successfully.</Alert>}
            <Divider />
            <TextField
              label="Current password"
              type="password"
              fullWidth
              value={currentPw}
              onChange={(e) => { setCurrentPw(e.target.value); setPwError(''); }}
              autoComplete="current-password"
            />
            <TextField
              label="New password"
              type="password"
              fullWidth
              value={newPw}
              onChange={(e) => { setNewPw(e.target.value); setPwError(''); }}
              helperText="Minimum 4 characters"
            />
            <TextField
              label="Confirm new password"
              type="password"
              fullWidth
              value={confirmPw}
              onChange={(e) => { setConfirmPw(e.target.value); setPwError(''); }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}
        >
          {tab === 0 ? 'Close' : 'Cancel'}
        </Button>

        {tab === 0 && (
          <Button variant="contained" color="primary" startIcon={<SaveOutlinedIcon />} onClick={handleSaveName}>
            Save
          </Button>
        )}

        {tab === 1 && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveOutlinedIcon />}
            onClick={handleChangePassword}
            disabled={loading || !currentPw || !newPw || !confirmPw}
          >
            {loading ? 'Saving…' : 'Change password'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
