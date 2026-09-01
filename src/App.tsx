/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Alert,
  Box,
  Container,
  CssBaseline,
  Snackbar,
  ThemeProvider,
  createTheme,
  alpha,
} from '@mui/material';
import type { ReviewEntry, LeaderPerson } from './types/ReviewEntry';
import { loadEntries, saveEntries, loadLeaders, saveLeaders } from './utils/storage';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import type { EntryFormValues } from './components/EntryForm';
import EntryList from './components/EntryList';
import type { ViewMode } from './components/EntryList';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import LeaderSetup from './components/LeaderSetup';
import EditLeadersDialog from './components/EditLeadersDialog';

const PURPLE = '#7c3aed';
const PINK   = '#db2777';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary:    { main: PURPLE, light: '#a78bfa', dark: '#5b21b6' },
    secondary:  { main: PINK,   light: '#f9a8d4', dark: '#9d174d' },
    error:      { main: '#dc2626' },
    background: { default: '#faf5ff', paper: '#ffffff' },
    text:       { primary: '#1e1b2e', secondary: '#6b7280' },
    divider:    alpha(PURPLE, 0.1),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 800, letterSpacing: '-0.5px' },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle2: { fontWeight: 600, fontSize: '0.78rem', letterSpacing: '0.04em', textTransform: 'uppercase' },
    body1: { lineHeight: 1.7 },
    body2: { lineHeight: 1.6 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.06)',
    '0 2px 8px rgba(124,58,237,0.08)',
    '0 4px 16px rgba(124,58,237,0.10)',
    '0 6px 24px rgba(124,58,237,0.12)',
    '0 8px 32px rgba(124,58,237,0.14)',
    ...Array(19).fill('none'),
  ] as any,
  components: {
    MuiCard: {
      defaultProps: { elevation: 2 },
      styleOverrides: { root: { border: `1px solid ${alpha(PURPLE, 0.1)}`, borderRadius: 16 } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 10, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', padding: '8px 18px' },
      },
      variants: [
        {
          props: { variant: 'contained', color: 'primary' },
          style: {
            background: `linear-gradient(135deg, ${PURPLE} 0%, #a855f7 100%)`,
            '&:hover': { background: `linear-gradient(135deg, #6d28d9 0%, ${PURPLE} 100%)` },
            '&.Mui-disabled': { background: alpha(PURPLE, 0.2), color: alpha(PURPLE, 0.5) },
          },
        },
        {
          props: { variant: 'outlined', color: 'primary' },
          style: {
            borderColor: alpha(PURPLE, 0.4),
            '&:hover': { borderColor: PURPLE, background: alpha(PURPLE, 0.04) },
          },
        },
      ],
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10, background: '#ffffff',
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(PURPLE, 0.5) },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: PURPLE },
          },
        },
      },
    },
    MuiSelect: { styleOverrides: { root: { borderRadius: 10, background: '#ffffff' } } },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          '&.Mui-selected': { background: alpha(PURPLE, 0.1), color: PURPLE, borderColor: alpha(PURPLE, 0.3) },
          '&.Mui-selected:hover': { background: alpha(PURPLE, 0.15) },
        },
      },
    },
    MuiChip:        { styleOverrides: { root: { borderRadius: 8 } } },
    MuiDialog:      { styleOverrides: { paper: { borderRadius: 20 } } },
    MuiDialogTitle: { styleOverrides: { root: { paddingBottom: 8 } } },
  },
});

const VIEW_KEY = 'review-action-tracker-view';

function loadViewMode(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === 'list' || v === 'grid') return v;
    return 'card';
  } catch { return 'card'; }
}

type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

export default function App() {
  const [leaders, setLeaders]           = useState<LeaderPerson[]>(loadLeaders);
  const [editLeadersOpen, setEditLeadersOpen] = useState(false);
  const [viewMode, setViewMode]         = useState<ViewMode>(loadViewMode);
  const [entries, setEntries]           = useState<ReviewEntry[]>(loadEntries);
  const [editingEntry, setEditingEntry] = useState<ReviewEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ReviewEntry | null>(null);
  const [snackbar, setSnackbar]         = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_KEY, mode); } catch { /* ignore */ }
  };

  const handleLeaderSetupComplete = (newLeaders: LeaderPerson[]) => {
    saveLeaders(newLeaders);
    setLeaders(newLeaders);
  };

  const handleEditLeadersSave = (updated: LeaderPerson[]) => {
    saveLeaders(updated);
    setLeaders(updated);
    setEditLeadersOpen(false);
    showSnackbar('Leaders updated successfully.');
  };

  const handleAddEntry = (values: EntryFormValues) => {
    const reviewer = leaders.find((l) => l.name === values.leaderName);
    const entry: ReviewEntry = {
      id: uuidv4(),
      leaderName:   values.leaderName,
      leaderRole:   reviewer?.role ?? 'core',
      revieweeName: values.revieweeName.trim(),
      revieweeRole: values.revieweeRole,
      review:       values.review.trim(),
      plannedAction: values.plannedAction.trim(),
      createdAt:    new Date().toISOString(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    showSnackbar('Entry added successfully.');
  };

  const handleEditEntry = (values: EntryFormValues) => {
    if (!editingEntry) return;
    const reviewer = leaders.find((l) => l.name === values.leaderName);
    const updated = entries.map((e) =>
      e.id === editingEntry.id
        ? {
            ...e,
            leaderName:   values.leaderName,
            leaderRole:   reviewer?.role ?? e.leaderRole,
            revieweeName: values.revieweeName.trim(),
            revieweeRole: values.revieweeRole,
            review:       values.review.trim(),
            plannedAction: values.plannedAction.trim(),
          }
        : e
    );
    setEntries(updated);
    saveEntries(updated);
    setEditingEntry(null);
    showSnackbar('Entry updated successfully.');
  };

  const handleFormSubmit = (values: EntryFormValues) =>
    editingEntry ? handleEditEntry(values) : handleAddEntry(values);

  const handleStartEdit = (entry: ReviewEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const updated = entries.filter((e) => e.id !== deleteTarget.id);
    setEntries(updated);
    saveEntries(updated);
    setDeleteTarget(null);
    showSnackbar('Entry deleted.');
  };

  // ── Setup gate ─────────────────────────────────────────────────────────
  if (leaders.length === 0) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LeaderSetup onComplete={handleLeaderSetupComplete} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          backgroundImage:
            'radial-gradient(ellipse 60% 40% at 0% 0%, #ede9fe 0%, transparent 60%),' +
            'radial-gradient(ellipse 50% 40% at 100% 100%, #fce7f3 0%, transparent 60%)',
          py: { xs: 3, sm: 5 },
        }}
      >
        <Container maxWidth={viewMode === 'grid' ? 'lg' : 'sm'} sx={{ transition: 'max-width 0.3s ease' }}>
          <Header entries={entries} onEditLeaders={() => setEditLeadersOpen(true)} />
          <Box sx={{ maxWidth: viewMode === 'grid' ? 600 : 'none', mx: viewMode === 'grid' ? 'auto' : 0 }}>
            <EntryForm
              leaders={leaders}
              onSubmit={handleFormSubmit}
              editingEntry={editingEntry}
              onCancelEdit={() => setEditingEntry(null)}
            />
          </Box>
          <EntryList
            entries={entries}
            viewMode={viewMode}
            onViewChange={handleViewChange}
            onEdit={handleStartEdit}
            onDelete={setDeleteTarget}
          />
        </Container>
      </Box>

      <DeleteConfirmationDialog
        entry={deleteTarget}
        open={Boolean(deleteTarget)}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      <EditLeadersDialog
        open={editLeadersOpen}
        currentLeaders={leaders}
        onSave={handleEditLeadersSave}
        onClose={() => setEditLeadersOpen(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled"
          sx={{ width: '100%', borderRadius: 3, boxShadow: 4 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
