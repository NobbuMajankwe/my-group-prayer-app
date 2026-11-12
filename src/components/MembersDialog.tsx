import { useState, useEffect } from 'react';
import {
  Alert, Avatar, Box, Button, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControl,
  FormHelperText, IconButton, InputLabel, MenuItem,
  Select, Tab, Tabs, TextField, Tooltip, Typography, alpha,
} from '@mui/material';
import AddIcon            from '@mui/icons-material/Add';
import EditOutlinedIcon   from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon  from '@mui/icons-material/DeleteOutlined';
import CloseIcon          from '@mui/icons-material/Close';
import SaveOutlinedIcon   from '@mui/icons-material/SaveOutlined';
import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';
import StarOutlinedIcon   from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import CsvImportPanel     from './CsvImportPanel';
import type { Member, LeaderPerson } from '../types/ReviewEntry';

// ── Colour helpers ─────────────────────────────────────────────────────────

const CORE_BG    = 'rgba(20,184,166,0.10)';
const CORE_COL   = '#0f766e';
const LEADER_COL = '#92400e';
const MEMBER_BG  = 'rgba(124,58,237,0.08)';
const MEMBER_COL = '#5b21b6';

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase();
}

// ── Empty form state ──────────────────────────────────────────────────────

interface MemberDraft {
  name:           string;
  assignedLeader: string;
  assignedCore:   string;
  notes:          string;
}

const EMPTY_DRAFT: MemberDraft = {
  name: '', assignedLeader: '', assignedCore: '', notes: '',
};

// ── Props ──────────────────────────────────────────────────────────────────

interface MembersDialogProps {
  open:           boolean;
  members:        Member[];
  leaders:        LeaderPerson[];
  onSave:         (members: Member[]) => void;
  onClose:        () => void;
  saving?:        boolean;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function MembersDialog({
  open, members, leaders, onSave, onClose, saving,
}: MembersDialogProps) {
  const [list,       setList]       = useState<Member[]>(members);
  const [draft,      setDraft]      = useState<MemberDraft>(EMPTY_DRAFT);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [errors,     setErrors]     = useState<Partial<MemberDraft>>({});
  const [showForm,   setShowForm]   = useState(false);
  const [inputTab,   setInputTab]   = useState(0); // 0 = one by one, 1 = CSV

  // Sync when dialog opens
  useEffect(() => {
    if (open) {
      setList(members);
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
      setErrors({});
      setShowForm(false);
      setInputTab(0);
      setCsvResult(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const leaderOnly = leaders.filter((l) => l.role === 'leader');
  const coreOnly   = leaders.filter((l) => l.role === 'core');

  const setD = (p: Partial<MemberDraft>) => {
    setDraft((d) => ({ ...d, ...p }));
    setErrors((e) => ({ ...e, ...Object.fromEntries(Object.keys(p).map((k) => [k, ''])) }));
  };

  // ── CSV import ─────────────────────────────────────────────────────────
  // Format: Name, Assigned Leader, Assigned Core (optional)
  const [csvResult, setCsvResult] = useState<{ added: number; skipped: { row: string; reason: string }[] } | null>(null);

  const handleCsvImport = (rows: string[][]) => {
    setCsvResult(null);
    const toAdd:   Member[] = [];
    const skipped: { row: string; reason: string }[] = [];

    for (const row of rows) {
      const [name = '', leaderName = '', coreName = ''] = row;
      const trimmedName   = name.trim();
      const trimmedLeader = leaderName.trim();
      const rowLabel      = row.join(', ');

      if (!trimmedName) {
        skipped.push({ row: rowLabel, reason: 'Missing member name' });
        continue;
      }
      if (!trimmedLeader) {
        skipped.push({ row: rowLabel, reason: `Missing leader name for "${trimmedName}"` });
        continue;
      }
      // Skip duplicates
      if (list.some((m) => m.name.toLowerCase() === trimmedName.toLowerCase())) {
        skipped.push({ row: rowLabel, reason: `"${trimmedName}" already exists` });
        continue;
      }
      // Match leader by name OR displayName, case-insensitive, ignore extra spaces
      const matchedLeader = leaders.find(
        (l) =>
          l.role === 'leader' &&
          (
            l.name.toLowerCase().trim()        === trimmedLeader.toLowerCase() ||
            (l.displayName ?? '').toLowerCase().trim() === trimmedLeader.toLowerCase()
          )
      );
      if (!matchedLeader) {
        skipped.push({ row: rowLabel, reason: `Leader "${trimmedLeader}" not found — check spelling matches your team exactly` });
        continue;
      }

      // Core is optional — match by name or displayName
      const matchedCore = coreName.trim()
        ? leaders.find(
            (l) =>
              l.role === 'core' &&
              (
                l.name.toLowerCase().trim()        === coreName.trim().toLowerCase() ||
                (l.displayName ?? '').toLowerCase().trim() === coreName.trim().toLowerCase()
              )
          )
        : undefined;

      if (coreName.trim() && !matchedCore) {
        // Core not found — still add the member but without core assignment
        skipped.push({ row: rowLabel, reason: `Core "${coreName.trim()}" not found — member added without core assignment` });
      }

      toAdd.push({
        id:             crypto.randomUUID(),
        name:           trimmedName,
        assignedLeader: matchedLeader.name,
        assignedCore:   matchedCore?.name,
      });
    }

    if (toAdd.length > 0) {
      setList((p) => [...p, ...toAdd]);
    }
    setCsvResult({ added: toAdd.length, skipped });
  };

  // ── Validate ──────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const e: Partial<MemberDraft> = {};
    if (!draft.name.trim())           e.name           = 'Name is required.';
    if (!draft.assignedLeader)        e.assignedLeader = 'Please assign a leader.';
    // Check duplicate name (ignore self when editing)
    const duplicate = list.some(
      (m) => m.name.toLowerCase() === draft.name.trim().toLowerCase() && m.id !== editingId
    );
    if (duplicate)                    e.name           = 'A member with that name already exists.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Add / save edit ───────────────────────────────────────────────────

  const handleSaveDraft = () => {
    if (!validate()) return;
    if (editingId) {
      setList((p) =>
        p.map((m) =>
          m.id === editingId
            ? {
                ...m,
                name:           draft.name.trim(),
                assignedLeader: draft.assignedLeader,
                assignedCore:   draft.assignedCore || undefined,
                notes:          draft.notes.trim() || undefined,
              }
            : m
        )
      );
    } else {
      const newMember: Member = {
        id:             crypto.randomUUID(),
        name:           draft.name.trim(),
        assignedLeader: draft.assignedLeader,
        assignedCore:   draft.assignedCore || undefined,
        notes:          draft.notes.trim() || undefined,
      };
      setList((p) => [...p, newMember]);
    }
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setShowForm(false);
  };

  // ── Start editing ─────────────────────────────────────────────────────

  const handleEdit = (m: Member) => {
    setDraft({
      name:           m.name,
      assignedLeader: m.assignedLeader,
      assignedCore:   m.assignedCore ?? '',
      notes:          m.notes ?? '',
    });
    setEditingId(m.id);
    setErrors({});
    setShowForm(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────

  const handleDelete = (id: string) => {
    setList((p) => p.filter((m) => m.id !== id));
    if (editingId === id) {
      setDraft(EMPTY_DRAFT);
      setEditingId(null);
      setShowForm(false);
    }
  };

  const handleCancel = () => {
    setDraft(EMPTY_DRAFT);
    setEditingId(null);
    setErrors({});
    setShowForm(false);
  };

  // ── Group members by leader ────────────────────────────────────────────

  const grouped: { leader: string; items: Member[] }[] = leaderOnly
    .map((l) => ({
      leader: l.name,
      items:  list.filter((m) => m.assignedLeader === l.name),
    }))
    .filter((g) => g.items.length > 0);

  const unassigned = list.filter(
    (m) => !leaderOnly.some((l) => l.name === m.assignedLeader)
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth
      slotProps={{ paper: { sx: { borderRadius: 4, maxHeight: '90vh' } } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PersonAddOutlinedIcon sx={{ color: 'primary.main' }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6">Group Members</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 400 }}>
              Add members and assign them to a leader and optionally a core/intern.
            </Typography>
          </Box>
          <Chip
            label={`${list.length} member${list.length !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: alpha('#7c3aed', 0.08), color: 'primary.dark', fontWeight: 700 }}
          />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0.5, pb: 1 }}>

        {/* ── Input tabs ── */}
        <Tabs value={inputTab} onChange={(_, v) => { setInputTab(v); if (showForm && v === 1) handleCancel(); }}
          sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.82rem' } }}>
          <Tab label="Add one by one" />
          <Tab label="Import CSV" />
        </Tabs>

        {/* ── CSV import tab ── */}
        {inputTab === 1 && (
          <Box sx={{ mb: 2.5 }}>
            <CsvImportPanel
              formatHint={`Each line: Member Name, Leader Name, Core Name (optional)\nLeader and Core names must match your team names exactly (case-insensitive).`}
              example={`Fatima, Shereen Hadebe\nZainab, Shereen Hadebe, Chanel\nMaryam, Nqobile Hadebe`}
              onImport={handleCsvImport}
            />

            {/* Import result feedback */}
            {csvResult && (
              <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {csvResult.added > 0 && (
                  <Alert severity="success" sx={{ borderRadius: 2, py: 0.5 }}>
                    {csvResult.added} member{csvResult.added !== 1 ? 's' : ''} added — click <strong>Save members</strong> to confirm.
                  </Alert>
                )}
                {csvResult.skipped.length > 0 && (
                  <Alert severity="warning" sx={{ borderRadius: 2, py: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                      {csvResult.skipped.length} row{csvResult.skipped.length !== 1 ? 's' : ''} skipped:
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2 }}>
                      {csvResult.skipped.map((s, i) => (
                        <Box component="li" key={i}>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {s.reason}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                    <Typography variant="caption" sx={{ display: 'block', mt: 0.75, color: 'text.secondary' }}>
                      Available leaders: {leaders.filter((l) => l.role === 'leader').map((l) => l.name).join(', ') || 'none'}
                    </Typography>
                  </Alert>
                )}
                {csvResult.added === 0 && csvResult.skipped.length === 0 && (
                  <Alert severity="info" sx={{ borderRadius: 2, py: 0.5 }}>
                    No new members to import.
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* ── One-by-one tab: Add / Edit form ── */}
        {inputTab === 0 && (
          <>
            {showForm ? (
          <Box
            sx={{
              p: 2, mb: 2.5, borderRadius: 3,
              bgcolor: alpha('#7c3aed', 0.03),
              border: '1px solid', borderColor: alpha('#7c3aed', 0.15),
            }}
          >
            <Typography variant="subtitle2" sx={{ color: 'primary.main', mb: 2 }}>
              {editingId ? 'Edit member' : 'Add new member'}
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Name */}
              <TextField
                label="Member name"
                size="small"
                fullWidth
                required
                value={draft.name}
                onChange={(e) => setD({ name: e.target.value })}
                error={Boolean(errors.name)}
                helperText={errors.name}
                placeholder="e.g. Fatima"
              />

              {/* Assigned leader */}
              <FormControl size="small" fullWidth required error={Boolean(errors.assignedLeader)}>
                <InputLabel id="assign-leader-label">Assigned leader</InputLabel>
                <Select
                  labelId="assign-leader-label"
                  label="Assigned leader"
                  value={draft.assignedLeader}
                  onChange={(e) => setD({ assignedLeader: e.target.value })}
                >
                  {leaderOnly.map((l) => (
                    <MenuItem key={l.name} value={l.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <StarOutlinedIcon sx={{ fontSize: 14, color: '#eab308' }} />
                        {l.displayName || l.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedLeader && (
                  <FormHelperText>{errors.assignedLeader}</FormHelperText>
                )}
              </FormControl>

              {/* Assigned core (optional) */}
              <FormControl size="small" fullWidth>
                <InputLabel id="assign-core-label">Assigned core / intern (optional)</InputLabel>
                <Select
                  labelId="assign-core-label"
                  label="Assigned core / intern (optional)"
                  value={draft.assignedCore}
                  onChange={(e) => setD({ assignedCore: e.target.value })}
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {coreOnly.map((l) => (
                    <MenuItem key={l.name} value={l.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <GroupsOutlinedIcon sx={{ fontSize: 14, color: '#14b8a6' }} />
                        {l.displayName || l.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  Optionally pair this member with a core/intern for additional support.
                </FormHelperText>
              </FormControl>

              {/* Notes */}
              <TextField
                label="Notes (optional)"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={draft.notes}
                onChange={(e) => setD({ notes: e.target.value })}
                placeholder="Any helpful context about this member…"
              />

              {/* Form actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={editingId ? <SaveOutlinedIcon /> : <AddIcon />}
                  onClick={handleSaveDraft}
                >
                  {editingId ? 'Save changes' : 'Add member'}
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="small"
                  startIcon={<CloseIcon />}
                  onClick={handleCancel}
                  sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          </Box>
          ) : (
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setShowForm(true)}
              sx={{ mb: 2.5, py: 1 }}
            >
              Add new member
            </Button>
          )}
          </>
        )}

        {/* ── Member roster ── */}
        {list.length === 0 ? (
          <Box sx={{
            textAlign: 'center', py: 5, borderRadius: 3,
            border: '1.5px dashed', borderColor: alpha('#7c3aed', 0.18),
            bgcolor: alpha('#7c3aed', 0.02),
          }}>
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              No members yet. Add your first member above.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Grouped by leader */}
            {grouped.map(({ leader, items }) => (
              <Box key={leader}>
                {/* Leader heading */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                  <StarOutlinedIcon sx={{ fontSize: 14, color: '#eab308' }} />
                  <Typography variant="caption" sx={{
                    fontWeight: 700, color: LEADER_COL,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>
                    {leader}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    · {items.length} member{items.length !== 1 ? 's' : ''}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {items.map((m) => <MemberRow key={m.id} member={m} leaders={leaders}
                    onEdit={handleEdit} onDelete={handleDelete} isEditing={editingId === m.id} />)}
                </Box>
              </Box>
            ))}

            {/* Unassigned (leader no longer exists) */}
            {unassigned.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{
                  fontWeight: 700, color: 'text.disabled',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  display: 'block', mb: 1,
                }}>
                  Unassigned
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {unassigned.map((m) => <MemberRow key={m.id} member={m} leaders={leaders}
                    onEdit={handleEdit} onDelete={handleDelete} isEditing={editingId === m.id} />)}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose}
          sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}>
          Cancel
        </Button>
        <Button variant="contained" color="primary" onClick={() => onSave(list)} disabled={saving}>
          {saving ? 'Saving…' : 'Save members'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── MemberRow sub-component ────────────────────────────────────────────────

interface MemberRowProps {
  member:     Member;
  leaders:    LeaderPerson[];
  isEditing:  boolean;
  onEdit:     (m: Member) => void;
  onDelete:   (id: string) => void;
}

function MemberRow({ member, leaders, isEditing, onEdit, onDelete }: MemberRowProps) {
  const corePerson = leaders.find((l) => l.name === member.assignedCore);

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1.25,
      px: 1.5, py: 1, borderRadius: 2.5,
      bgcolor: isEditing ? alpha('#7c3aed', 0.06) : 'background.paper',
      border: '1px solid',
      borderColor: isEditing ? alpha('#7c3aed', 0.25) : alpha('#7c3aed', 0.1),
      transition: 'all 0.1s',
    }}>
      {/* Avatar */}
      <Avatar sx={{ width: 32, height: 32, bgcolor: MEMBER_BG, color: MEMBER_COL, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
        {initials(member.name)}
      </Avatar>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.3 }}>
          {member.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', mt: 0.25 }}>
          {/* Assigned core badge */}
          {corePerson && (
            <Chip
              icon={<GroupsOutlinedIcon sx={{ fontSize: '11px !important', color: `${CORE_COL} !important` }} />}
              label={corePerson.displayName || corePerson.name}
              size="small"
              sx={{ height: 18, fontSize: '0.62rem', fontWeight: 600, bgcolor: CORE_BG, color: CORE_COL, border: `1px solid ${alpha('#14b8a6', 0.25)}` }}
            />
          )}
          {/* Notes preview */}
          {member.notes && (
            <Typography variant="caption" sx={{ color: 'text.disabled', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
              {member.notes}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
        <Tooltip title="Edit member">
          <IconButton size="small" onClick={() => onEdit(member)}
            sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha('#7c3aed', 0.07) } }}>
            <EditOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Remove member">
          <IconButton size="small" onClick={() => onDelete(member.id)}
            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: alpha('#dc2626', 0.06) } }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
