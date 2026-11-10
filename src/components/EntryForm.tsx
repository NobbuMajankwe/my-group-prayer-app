import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
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
  leaders:       LeaderPerson[];
  members:       Member[];
  onSubmit:      (values: EntryFormValues) => void;
  editingEntry?: ReviewEntry | null;
  onCancelEdit?: () => void;
}

const EMPTY: EntryFormValues = {
  leaderName: '', revieweeName: '', revieweeRole: 'member',
  review: '', plannedAction: '', memberId: undefined,
};

const MEMBER_BG  = 'rgba(124,58,237,0.08)';
const MEMBER_COL = '#5b21b6';

// ── Component ──────────────────────────────────────────────────────────────

export default function EntryForm({
  leaders, members, onSubmit, editingEntry, onCancelEdit,
}: EntryFormProps) {
  const {
    register, handleSubmit, reset, watch, control, setValue,
    formState: { errors },
  } = useForm<EntryFormValues>({ defaultValues: EMPTY });

  const selectedLeaderName = watch('leaderName');
  const selectedLeader     = leaders.find((l) => l.name === selectedLeaderName);
  const isLeader           = selectedLeader?.role === 'leader';

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

  // When reviewer changes, reset revieweeRole for non-leaders and clear participant
  useEffect(() => {
    if (!isLeader) setValue('revieweeRole', 'member');
  }, [isLeader, setValue]);

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
    if (!editingEntry) reset(EMPTY);
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
    <Card sx={{ mb: 4 }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography variant="h6" sx={{ mb: 2.5, color: 'primary.main' }}>
          {isEditing ? 'Edit entry' : 'New entry'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* ── Reviewer ──────────────────────────────────────── */}
          <Controller
            name="leaderName"
            control={control}
            rules={{ required: 'Please select a reviewer.' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.leaderName)}>
                <InputLabel id="leader-label">Reviewer</InputLabel>
                <Select {...field} labelId="leader-label" label="Reviewer"
                  onChange={(e) => {
                    field.onChange(e);
                    // Clear participant when reviewer changes
                    setValue('revieweeName', '');
                    setValue('memberId', undefined);
                  }}>
                  {leaders.map((l) => (
                    <MenuItem key={l.name} value={l.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {l.role === 'leader'
                          ? <StarOutlinedIcon   sx={{ fontSize: 14, color: '#eab308' }} />
                          : <GroupsOutlinedIcon sx={{ fontSize: 14, color: '#14b8a6' }} />}
                        {l.displayName || l.name}
                        <Typography variant="caption" sx={{ color: 'text.disabled', ml: 0.5 }}>
                          {l.role === 'leader' ? 'Leader' : 'Core'}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.leaderName?.message ?? 'Who is conducting this review?'}
                </FormHelperText>
              </FormControl>
            )}
          />

          {/* ── Reviewee role (leaders only) ───────────────────── */}
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
                  <FormHelperText>
                    Leaders can review both members and core/interns.
                  </FormHelperText>
                </FormControl>
              )}
            />
          )}

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

          {/* ── Review ────────────────────────────────────────── */}
          <TextField
            label="Review"
            fullWidth required multiline rows={4}
            error={Boolean(errors.review)}
            helperText={errors.review?.message}
            {...register('review', { required: 'Review is required.' })}
          />

          {/* ── Planned action ────────────────────────────────── */}
          <TextField
            label="Planned action"
            fullWidth required multiline rows={4}
            error={Boolean(errors.plannedAction)}
            helperText={errors.plannedAction?.message}
            {...register('plannedAction', { required: 'Planned action is required.' })}
          />

          {/* ── Submit / cancel ───────────────────────────────── */}
          <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
            <Button type="submit" variant="contained" color="primary"
              startIcon={isEditing ? <SaveIcon /> : <AddIcon />}>
              {isEditing ? 'Save changes' : 'Add entry'}
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
