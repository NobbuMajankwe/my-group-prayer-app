/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  Alert, Box, CssBaseline,
  Snackbar, ThemeProvider, createTheme, alpha,
} from '@mui/material';

import type { ReviewEntry, LeaderPerson, Member } from './types/ReviewEntry';
import type { AuditEntry }                        from './types/AuditLog';

import { clearLegacyPin } from './utils/storage';
import {
  dbLoadLeaders,  dbSaveLeaders,
  dbLoadMembers,  dbSaveMembers,
  dbLoadEntries,  dbSaveEntry,    dbDeleteEntry,
  dbAppendAudit,  dbLoadAuditLog,
  initAmplify,
} from './utils/db';

import Header              from './components/Header';
import EntryForm           from './components/EntryForm';
import type { EntryFormValues } from './components/EntryForm';
import EntryList           from './components/EntryList';
import type { ViewMode }   from './components/EntryList';
import FilterBar           from './components/FilterBar';
import type { FilterState } from './components/FilterBar';
import { EMPTY_FILTERS }   from './components/FilterBar';
import DeleteConfirmationDialog from './components/DeleteConfirmationDialog';
import LeaderSetup         from './components/LeaderSetup';
import LeaderLogin         from './components/LeaderLogin';
import EditLeadersDialog   from './components/EditLeadersDialog';
import ProfileDialog       from './components/ProfileDialog';
import AuditLogDrawer      from './components/AuditLogDrawer';
import ReminderBanner      from './components/ReminderBanner';
import { getReminders }    from './components/ReminderBanner';
import NotificationPrompt  from './components/NotificationPrompt';
import MembersDialog       from './components/MembersDialog';
import ReviewStatusDashboard from './components/ReviewStatusDashboard';
import {
  checkAndShowReminder,
  requestNotificationPermission,
  notificationsGranted,
  snoozeReminder,
} from './utils/reminders';

// ── Theme ──────────────────────────────────────────────────────────────────

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
    MuiSelect:      { styleOverrides: { root: { borderRadius: 10, background: '#ffffff' } } },
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

// ── Helpers ────────────────────────────────────────────────────────────────

const VIEW_KEY = 'review-action-tracker-view';

function loadViewMode(): ViewMode {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    if (v === 'list' || v === 'grid') return v;
    return 'card';
  } catch { return 'card'; }
}

function applyFilters(entries: ReviewEntry[], f: FilterState): ReviewEntry[] {
  const q = f.search.toLowerCase().trim();
  return entries.filter((e) => {
    if (q) {
      const name   = (e.revieweeName ?? (e as any).name ?? '').toLowerCase();
      const review = e.review.toLowerCase();
      const action = e.plannedAction.toLowerCase();
      if (!name.includes(q) && !review.includes(q) && !action.includes(q)) return false;
    }
    if (f.reviewer     && e.leaderName   !== f.reviewer)     return false;
    if (f.leaderRole   && e.leaderRole   !== f.leaderRole)   return false;
    if (f.revieweeRole && e.revieweeRole !== f.revieweeRole) return false;
    return true;
  });
}

// ── Auth state ─────────────────────────────────────────────────────────────

type AuthState = 'leader_setup' | 'login' | 'app';
type SnackbarState = { open: boolean; message: string; severity: 'success' | 'error' };

// ── Component ──────────────────────────────────────────────────────────────

export default function App() {
  // Init Amplify + clean up legacy PIN on first render
  useEffect(() => {
    initAmplify();
    clearLegacyPin();
  }, []);

  // ── State ─────────────────────────────────────────────────────────────
  const [leaders,  setLeaders]  = useState<LeaderPerson[]>([]);
  const [members,  setMembers]  = useState<Member[]>([]);
  const [entries,  setEntries]  = useState<ReviewEntry[]>([]);
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);

  // ── Auth state ────────────────────────────────────────────────────────
  const [authState,      setAuthState]      = useState<AuthState>('login');

  const [currentLeader,  setCurrentLeader]  = useState<LeaderPerson | null>(null);
  const [showReminder,   setShowReminder]   = useState(false);
  const [showNotifPrompt, setShowNotifPrompt] = useState(false);
  // Load all data from DynamoDB on mount, then determine auth gate
  useEffect(() => {
    Promise.all([
      dbLoadLeaders(),
      dbLoadMembers(),
      dbLoadEntries(),
      dbLoadAuditLog(),
    ]).then(([l, m, e, a]) => {
      setLeaders(l);
      setMembers(m);
      setEntries(e);
      setAuditLog(a);

      const savedName = sessionStorage.getItem('currentLeader');
      const saved = savedName ? l.find((x) => x.name === savedName) : null;
      if (saved) {
        setCurrentLeader(saved);
        setAuthState('app');
      } else {
        setAuthState(l.length === 0 ? 'leader_setup' : 'login');
      }

      setLoading(false);
    }).catch((err) => {
      console.error('[App] Failed to load from DB', err);
      setLoading(false);
    });
  }, []);

  // ── UI state ──────────────────────────────────────────────────────────
  const [editLeadersOpen, setEditLeadersOpen] = useState(false);
  const [membersOpen,     setMembersOpen]     = useState(false);
  const [statusOpen,      setStatusOpen]      = useState(false);
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [profileOpen,     setProfileOpen]     = useState(false);
  const [viewMode,        setViewMode]        = useState<ViewMode>(loadViewMode);
  const [filters,         setFilters]         = useState<FilterState>(EMPTY_FILTERS);
  const [editingEntry,    setEditingEntry]     = useState<ReviewEntry | null>(null);
  const [deleteTarget,    setDeleteTarget]     = useState<ReviewEntry | null>(null);
  const [snackbar,        setSnackbar]         = useState<SnackbarState>({ open: false, message: '', severity: 'success' });

  // ── Derived ───────────────────────────────────────────────────────────
  const filteredEntries = useMemo(
    () => applyFilters(entries, filters),
    [entries, filters]
  );

  // Reminders: entries this leader reviewed that are ≥7 days old
  const reminderItems = useMemo(
    () => currentLeader ? getReminders(entries, currentLeader.name) : [],
    [entries, currentLeader]
  );

  // ── Helpers ───────────────────────────────────────────────────────────
  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') =>
    setSnackbar({ open: true, message, severity });

  const addLog = (
    action:      AuditEntry['action'],
    description: string,
    leaderName?: string,
  ) => {
    dbAppendAudit(action, description, leaderName).then((entry) => {
      setAuditLog((prev) => [entry, ...prev].slice(0, 500));
    });
  };

  // ── Auth handlers ─────────────────────────────────────────────────────

  const handleLeaderSetupComplete = (newLeaders: LeaderPerson[]) => {
    setSaving(true);
    dbSaveLeaders(newLeaders).then(() => {
      setLeaders(newLeaders);
      addLog('leaders_updated', `Team set up with ${newLeaders.length} member(s).`);
      setAuthState('login');
    }).finally(() => setSaving(false));
  };

  const handleLoginSuccess = (leader: LeaderPerson) => {
    sessionStorage.setItem('currentLeader', leader.name);
    setCurrentLeader(leader);
    setAuthState('app');
    addLog('login', `${leader.displayName || leader.name} logged in.`, leader.name);

    // Ask for notification permission if not yet decided
    if ('Notification' in window && Notification.permission === 'default') {
      setShowNotifPrompt(true);
    }

    // Check reminders — will try push notification first, fall back to banner
    checkAndShowReminder(leader.name, entries).then(({ showBanner }) => {
      if (showBanner) setShowReminder(true);
    });
  };

  const handleLogout = () => {
    if (currentLeader) {
      addLog('logout', `${currentLeader.displayName || currentLeader.name} locked the app.`, currentLeader.name);
    }
    sessionStorage.removeItem('currentLeader');
    setCurrentLeader(null);
    setAuthState('login');
    setEditingEntry(null);
    setFilters(EMPTY_FILTERS);
    setShowReminder(false);
    setProfileOpen(false);
  };

  // ── Reminder handlers ─────────────────────────────────────────────────

  const handleSnoozeReminder = () => {
    if (!currentLeader) return;
    const until = snoozeReminder(currentLeader.name);
    addLog('reminder_snoozed',
      `${currentLeader.displayName || currentLeader.name} snoozed action plan reminders until ${until.toLocaleDateString('en-GB')}.`,
      currentLeader.name);
    setShowReminder(false);
    showSnackbar("We'll remind you again next week.");
  };

  const handleDismissReminder = () => setShowReminder(false);

  // ── Notification permission handlers ──────────────────────────────────

  const handleAllowNotifications = async () => {
    await requestNotificationPermission();
    setShowNotifPrompt(false);
    if (notificationsGranted()) {
      showSnackbar('Weekly reminders enabled — you\'ll get a notification every week.');
    }
  };

  const handleDismissNotifPrompt = () => setShowNotifPrompt(false);

  // ── Profile handlers ──────────────────────────────────────────────────

  const handleProfileSave = (updated: LeaderPerson) => {
    const updatedLeaders = leaders.map((l) => l.name === updated.name ? updated : l);
    setSaving(true);
    dbSaveLeaders(updatedLeaders).then(() => {
      setLeaders(updatedLeaders);
      setCurrentLeader(updated);

      const prev = leaders.find((l) => l.name === updated.name);
      if (prev?.passwordHash !== updated.passwordHash) {
        addLog('password_changed', `${updated.displayName || updated.name} changed their password.`, updated.name);
        showSnackbar('Password changed successfully.');
      } else if (prev?.displayName !== updated.displayName) {
        addLog('profile_updated',
          `${updated.name} updated their display name to "${updated.displayName}".`, updated.name);
        showSnackbar('Profile updated.');
      }
    }).finally(() => setSaving(false));
  };

  // ── Leader management ─────────────────────────────────────────────────

  const handleEditLeadersSave = (updated: LeaderPerson[]) => {
    setSaving(true);
    dbSaveLeaders(updated).then(() => {
      setLeaders(updated);
      if (currentLeader) {
        const refreshed = updated.find((l) => l.name === currentLeader.name);
        if (refreshed) setCurrentLeader(refreshed);
      }
      setEditLeadersOpen(false);
      addLog('leaders_updated',
        `Team updated: ${updated.map((l) => `${l.name} (${l.role})`).join(', ')}.`,
        currentLeader?.name);
      showSnackbar('Team updated successfully.');
    }).finally(() => setSaving(false));
  };

  // ── Member management ─────────────────────────────────────────────────

  const handleMembersSave = (updated: Member[]) => {
    setSaving(true);
    dbSaveMembers(updated).then(() => {
      setMembers(updated);
      setMembersOpen(false);
      addLog(
        'leaders_updated',
        `Group members updated: ${updated.length} member${updated.length !== 1 ? 's' : ''} in roster.`,
        currentLeader?.name,
      );
      showSnackbar('Members saved successfully.');
    }).finally(() => setSaving(false));
  };

  // ── Entry handlers ────────────────────────────────────────────────────

  const handleAddEntry = (values: EntryFormValues) => {
    const reviewer = leaders.find((l) => l.name === values.leaderName);
    const entry: ReviewEntry = {
      id:            uuidv4(),
      leaderName:    values.leaderName,
      leaderRole:    reviewer?.role ?? 'core',
      revieweeName:  values.revieweeName.trim(),
      revieweeRole:  values.revieweeRole,
      memberId:      values.memberId,
      review:        values.review.trim(),
      plannedAction: values.plannedAction.trim(),
      createdAt:     new Date().toISOString(),
    };
    setSaving(true);
    dbSaveEntry(entry).then(() => {
      setEntries((prev) => [entry, ...prev]);
      addLog('entry_added',
        `Entry added for "${entry.revieweeName}" by ${entry.leaderName}.`,
        currentLeader?.name);
      showSnackbar('Entry added successfully.');
    }).finally(() => setSaving(false));
  };

  const handleEditEntry = (values: EntryFormValues) => {
    if (!editingEntry) return;
    const reviewer = leaders.find((l) => l.name === values.leaderName);
    const updatedEntry: ReviewEntry = {
      ...editingEntry,
      leaderName:    values.leaderName,
      leaderRole:    reviewer?.role ?? editingEntry.leaderRole,
      revieweeName:  values.revieweeName.trim(),
      revieweeRole:  values.revieweeRole,
      memberId:      values.memberId,
      review:        values.review.trim(),
      plannedAction: values.plannedAction.trim(),
    };
    setSaving(true);
    dbSaveEntry(updatedEntry).then(() => {
      setEntries((prev) => prev.map((e) => e.id === editingEntry.id ? updatedEntry : e));
      setEditingEntry(null);
      addLog('entry_edited',
        `Entry for "${values.revieweeName.trim()}" updated by ${values.leaderName}.`,
        currentLeader?.name);
      showSnackbar('Entry updated successfully.');
    }).finally(() => setSaving(false));
  };

  const handleFormSubmit = (values: EntryFormValues) =>
    editingEntry ? handleEditEntry(values) : handleAddEntry(values);

  const handleToggleAction = (entry: ReviewEntry) => {
    const toggled: ReviewEntry = {
      ...entry,
      actionCompleted:   !entry.actionCompleted,
      actionCompletedAt: !entry.actionCompleted ? new Date().toISOString() : undefined,
    };
    setSaving(true);
    dbSaveEntry(toggled).then(() => {
      setEntries((prev) => prev.map((e) => e.id === entry.id ? toggled : e));
      addLog(
        'entry_edited',
        `Action for "${entry.revieweeName}" marked as ${toggled.actionCompleted ? 'completed' : 'pending'} by ${currentLeader?.name ?? entry.leaderName}.`,
        currentLeader?.name,
      );
      showSnackbar(toggled.actionCompleted ? 'Action marked as completed.' : 'Action marked as pending.');
    }).finally(() => setSaving(false));
  };

  const handleStartEdit = (entry: ReviewEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const name = deleteTarget.revieweeName ?? (deleteTarget as any).name;
    setSaving(true);
    dbDeleteEntry(deleteTarget.id).then(() => {
      setEntries((prev) => prev.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      addLog('entry_deleted', `Entry for "${name}" was deleted.`, currentLeader?.name);
      showSnackbar('Entry deleted.');
    }).finally(() => setSaving(false));
  };

  // ── View helpers ──────────────────────────────────────────────────────

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem(VIEW_KEY, mode); } catch { /* ignore */ }
  };

  const handleClearAuditLog = () => {
    // No cloud delete-all — just clear local state
    setAuditLog([]);
    showSnackbar('Activity log cleared.');
  };

  // ── Auth gates ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>Loading…</Box>
        </Box>
      </ThemeProvider>
    );
  }

  if (authState === 'leader_setup') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LeaderSetup onComplete={handleLeaderSetupComplete} saving={saving} />
      </ThemeProvider>
    );
  }

  if (authState === 'login') {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LeaderLogin leaders={leaders} onSuccess={handleLoginSuccess} />
      </ThemeProvider>
    );
  }

  // ── Main app (authState === 'app') ────────────────────────────────────

  if (!currentLeader) return null; // type narrowing safety

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          backgroundImage:
            'radial-gradient(ellipse 70% 45% at 0% 0%, #ede9fe 0%, transparent 55%),' +
            'radial-gradient(ellipse 55% 45% at 100% 100%, #fce7f3 0%, transparent 55%),' +
            'radial-gradient(ellipse 40% 30% at 50% 50%, rgba(167,139,250,0.06) 0%, transparent 70%)',
          py: { xs: 2.5, sm: 5 },
          px: { xs: 1, sm: 0 },
        }}
      >
        {/* 85% width on desktop, full width on mobile */}
        <Box
          sx={{
            width: { xs: '100%', sm: '90%', md: '85%' },
            maxWidth: viewMode === 'grid' ? 1400 : 1100,
            mx: 'auto',
            px: { xs: 1, sm: 2 },
            transition: 'max-width 0.3s ease',
          }}
        >

          <Header
            entries={entries}
            currentLeader={currentLeader}
            auditCount={auditLog.length}
            memberCount={members.length}
            onEditLeaders={() => setEditLeadersOpen(true)}
            onManageMembers={() => setMembersOpen(true)}
            onShowLog={() => setAuditDrawerOpen(true)}
            onShowStatus={() => setStatusOpen(true)}
            onProfile={() => setProfileOpen(true)}
            onLogout={handleLogout}
          />

          {/* Notification permission prompt */}
          {showNotifPrompt && (
            <NotificationPrompt
              leaderName={currentLeader.displayName || currentLeader.name}
              onAllow={handleAllowNotifications}
              onDismiss={handleDismissNotifPrompt}
            />
          )}

          {/* Weekly action-plan reminder banner */}
          {showReminder && reminderItems.length > 0 && (
            <ReminderBanner
              items={reminderItems}
              onSnooze={handleSnoozeReminder}
              onDismiss={handleDismissReminder}
            />
          )}

          {/* Entry form — stays narrow in grid mode */}
          <Box sx={{ maxWidth: viewMode === 'grid' ? 640 : 'none', mx: viewMode === 'grid' ? 'auto' : 0 }}>
            <EntryForm
              leaders={leaders}
              members={members}
              onSubmit={handleFormSubmit}
              editingEntry={editingEntry}
              onCancelEdit={() => setEditingEntry(null)}
              saving={saving}
            />
          </Box>

          {/* Filters */}
          <FilterBar
            filters={filters}
            leaders={leaders}
            totalCount={entries.length}
            filteredCount={filteredEntries.length}
            onChange={setFilters}
          />

          {/* Entry list */}
          <EntryList
            entries={filteredEntries}
            viewMode={viewMode}
            onViewChange={handleViewChange}
            onEdit={handleStartEdit}
            onDelete={setDeleteTarget}
            onToggleAction={handleToggleAction}
          />

        </Box>
      </Box>

      {/* ── Dialogs & drawers ── */}

      <DeleteConfirmationDialog
        entry={deleteTarget}
        open={Boolean(deleteTarget)}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        saving={saving}
      />

      <EditLeadersDialog
        open={editLeadersOpen}
        currentLeaders={leaders}
        onSave={handleEditLeadersSave}
        onClose={() => setEditLeadersOpen(false)}
        saving={saving}
      />

      <MembersDialog
        open={membersOpen}
        members={members}
        leaders={leaders}
        onSave={handleMembersSave}
        onClose={() => setMembersOpen(false)}
        saving={saving}
      />

      <ReviewStatusDashboard
        open={statusOpen}
        entries={entries}
        members={members}
        currentLeader={currentLeader}
        onToggleAction={handleToggleAction}
        onClose={() => setStatusOpen(false)}
      />

      <ProfileDialog
        open={profileOpen}
        leader={currentLeader}
        onSave={handleProfileSave}
        onClose={() => setProfileOpen(false)}
        saving={saving}
      />

      <AuditLogDrawer
        open={auditDrawerOpen}
        log={auditLog}
        onClose={() => setAuditDrawerOpen(false)}
        onClear={handleClearAuditLog}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%', borderRadius: 3, boxShadow: 4 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
