import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import SaveIcon   from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import StarOutlinedIcon   from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import type { LeaderPerson, Member, ReviewEntry, RevieweeRole } from '../types/ReviewEntry';

// ── Types ──────────────────────────────────────────────────────────────────

export interface EntryFormValues {
  leaderName:   string;
  revieweeName: string;
  revieweeRole: RevieweeRole;
  review:       string;
  plannedAction: string;
  memberId?:    string;
}

interface EntryFormProps {
  leaders:        LeaderPerson[];
  members:        Member[];
  currentLeader:  LeaderPerson;
  onSubmit:       (values: EntryFormValues) => void;
  editingEntry?:  ReviewEntry | null;
  onCancelEdit?:  () => void;
  saving?:        boolean;
}

const EMPTY: EntryFormValues = {
  leaderName: '', revieweeName: '', revieweeRole: 'member',
  review: '', plannedAction: '', memberId: undefined,
};

const MEMBER_BG  = 'rgba(124,58,237,0.08)';
const MEMBER_COL = '#5b21b6';

// ── Component ──────────────────────────────────────────────────────────────

export default function EntryForm({
  leaders, members, currentLeader, onSubmit, editingEntry, onCancelEdit, saving,
}: EntryFormProps) {
  const {
    register, handleSubmit, reset, control, setValue,
    formState: { errors },
  } = useForm<EntryFormValues>({ defaultValues: EMPTY });

  const selectedLeaderName = currentLeader.name;
  const isLeader           = currentLeader.role === 'leader';

  // Members visible to the selected reviewer:
  //   • Leader → all members assigned to that leader
  //   • Core   → all members where assignedCore === reviewer name
  const reviewerMembers = useMemo(() => {
    if (!selectedLeaderName) return [];
    if (isLeader) {
      return members.filter((m) => m.assignedLeader === selectedLeaderName);
    }
    return members.filter((m) => m.assignedCore === selectedLeaderName);
  }, [selectedLeaderName, isLeader, members]);

  // Lock leaderName to current leader always
  useEffect(() => {
    setValue('leaderName', currentLeader.name);
    if (!isLeader) setValue('revieweeRole', 'member');
  }, [currentLeader.name, isLeader, setValue]);

  // Populate form when editing
  useEffect(() => {
    if (editingEntry) {
      reset({
        leaderName:    editingEntry.leaderName,
        revieweeName:  editingEntry.revieweeName,
        revieweeRole:  editingEntry.revieweeRole,
        review:        editingEntry.review,
        plannedAction: editingEntry.plannedAction,
        memberId:      editingEntry.memberId,
      });
    } else {
      reset(EMPTY);
    }
  }, [editingEntry, reset]);

  const handleFormSubmit = (values: EntryFormValues) => {
    onSubmit(values);
    if (!editingEntry) reset({ ...EMPTY, leaderName: currentLeader.name });
  };

  const isEditing = Boolean(editingEntry);

  // Typed option shape for Autocomplete
  type MemberOption = { label: string; memberId: string; core: string | undefined };

  const memberOptions: MemberOption[] = reviewerMembers.map((m) => ({
    label:    m.name,
    memberId: m.id,
    core:     m.assignedCore,
  }));

  return (
    <Card
      sx={{
        mb: 4,
        position: 'relative',
        overflow: 'visible',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0, left: 12, right: 12, height: 3,
          borderRadius: '0 0 3px 3px',
          background: isEditing
            ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
            : 'linear-gradient(90deg, #7c3aed 0%, #db2777 100%)',
          transition: 'background 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, pt: { xs: 3, sm: 3.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 36, height: 36, borderRadius: 2.5, flexShrink: 0,
              background: isEditing
                ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                : 'linear-gradient(135deg, #7c3aed, #db2777)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isEditing
                ? '0 2px 10px rgba(245,158,11,0.35)'
                : '0 2px 10px rgba(124,58,237,0.35)',
              transition: 'all 0.3s ease',
            }}
          >
            {isEditing
              ? <SaveIcon sx={{ fontSize: 18, color: '#fff' }} />
              : <AddIcon  sx={{ fontSize: 18, color: '#fff' }} />}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: isEditing ? '#92400e' : 'primary.main', lineHeight: 1.2 }}>
              {isEditing ? 'Edit entry' : 'New entry'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {isEditing ? 'Make your changes below' : 'Fill in the details to add a review'}
            </Typography>
          </Box>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
        >
          {/* ── Reviewer + Role row ───────────────────────────────── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: isLeader ? '1fr 1fr' : '1fr' }, gap: 2 }}>
            {/* Reviewer — read-only, always the signed-in user */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1,
              px: 1.5, py: 1.25, borderRadius: 2.5,
              border: '1px solid', borderColor: alpha('#7c3aed', 0.15),
              bgcolor: alpha('#7c3aed', 0.03),
            }}>
              {currentLeader.role === 'leader'
                ? <StarOutlinedIcon   sx={{ fontSize: 15, color: '#eab308', flexShrink: 0 }} />
                : <GroupsOutlinedIcon sx={{ fontSize: 15, color: '#14b8a6', flexShrink: 0 }} />}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1.2 }}>Reviewer</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                  {currentLeader.displayName || currentLeader.name}
                </Typography>
              </Box>
              <Chip
                label={currentLeader.role === 'leader' ? 'Leader' : 'Core'}
                size="small"
                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700,
                  bgcolor: currentLeader.role === 'leader' ? 'rgba(234,179,8,0.10)' : 'rgba(20,184,166,0.10)',
                  color:   currentLeader.role === 'leader' ? '#92400e' : '#0f766e' }}
              />
            </Box>

            {/* Reviewee role (leaders only) */}
            {isLeader && (
              <Controller
                name="revieweeRole"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="reviewee-role-label">Reviewing a…</InputLabel>
                    <Select {...field} labelId="reviewee-role-label" label="Reviewing a…">
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="core">Core / Intern</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            )}
          </Box>

          {/* ── Participant — dropdown from roster OR free-text ── */}
          <Controller
            name="revieweeName"
            control={control}
            rules={{ required: 'Participant name is required.' }}
            render={({ field }) => {
              // When there are assigned members, show a dropdown Autocomplete
              if (memberOptions.length > 0) {
                const currentOption =
                  memberOptions.find((o) => o.label === field.value) ?? null;

                return (
                  <Autocomplete<MemberOption, false, false, true>
                    options={memberOptions}
                    getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                    value={currentOption}
                    onChange={(_, newVal) => {
                      if (!newVal) {
                        field.onChange('');
                        setValue('memberId', undefined);
                      } else if (typeof newVal === 'string') {
                        field.onChange(newVal);
                        setValue('memberId', undefined);
                      } else {
                        field.onChange(newVal.label);
                        setValue('memberId', newVal.memberId);
                      }
                    }}
                    freeSolo
                    onInputChange={(_, val, reason) => {
                      if (reason === 'input') {
                        field.onChange(val);
                        setValue('memberId', undefined);
                      }
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.memberId}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: MEMBER_BG,
                          color: MEMBER_COL, fontSize: '0.7rem', fontWeight: 700 }}>
                          {option.label.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.label}
                          </Typography>
                          {option.core && (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                              Core: {option.core}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Participant"
                        required
                        error={Boolean(errors.revieweeName)}
                        helperText={
                          errors.revieweeName?.message ??
                          'Select from your assigned members or type a name'
                        }
                      />
                    )}
                  />
                );
              }

              // Fallback: plain text input (no assigned members yet)
              return (
                <TextField
                  {...field}
                  label="Participant name"
                  fullWidth
                  required
                  error={Boolean(errors.revieweeName)}
                  helperText={
                    errors.revieweeName?.message ??
                    (selectedLeaderName
                      ? 'No members assigned to this reviewer yet — type a name'
                      : 'The person being reviewed')
                  }
                />
              );
            }}
          />

          {/* ── Review + Planned action — side by side on md+ ─── */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="Review"
              fullWidth required multiline rows={4}
              error={Boolean(errors.review)}
              helperText={errors.review?.message ?? 'How did they do?'}
              {...register('review', { required: 'Review is required.' })}
            />
            <TextField
              label="Planned action"
              fullWidth required multiline rows={4}
              error={Boolean(errors.plannedAction)}
              helperText={errors.plannedAction?.message ?? 'What\'s the follow-up?'}
              {...register('plannedAction', { required: 'Planned action is required.' })}
            />
          </Box>

          {/* ── Submit / cancel ───────────────────────────────── */}
          <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5, flexWrap: 'wrap' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
              disabled={saving}
              sx={{ minWidth: 140 }}
            >
              {saving ? 'Saving…' : isEditing ? 'Save changes' : 'Add entry'}
            </Button>
            {isEditing && (
              <Button type="button" variant="outlined" color="inherit"
                startIcon={<CancelIcon />} onClick={onCancelEdit}
                sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}>
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
