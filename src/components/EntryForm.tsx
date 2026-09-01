import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
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
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import type { LeaderPerson, ReviewEntry, RevieweeRole } from '../types/ReviewEntry';

export interface EntryFormValues {
  leaderName: string;
  revieweeName: string;
  revieweeRole: RevieweeRole;
  review: string;
  plannedAction: string;
}

interface EntryFormProps {
  leaders: LeaderPerson[];
  onSubmit: (values: EntryFormValues) => void;
  editingEntry?: ReviewEntry | null;
  onCancelEdit?: () => void;
}

const EMPTY: EntryFormValues = {
  leaderName: '',
  revieweeName: '',
  revieweeRole: 'member',
  review: '',
  plannedAction: '',
};

export default function EntryForm({ leaders, onSubmit, editingEntry, onCancelEdit }: EntryFormProps) {
  const { register, handleSubmit, reset, watch, control, setValue, formState: { errors } } =
    useForm<EntryFormValues>({ defaultValues: EMPTY });

  const selectedLeaderName = watch('leaderName');
  const selectedLeader     = leaders.find((l) => l.name === selectedLeaderName);
  const isLeader           = selectedLeader?.role === 'leader';

  // When the reviewer changes to core/intern, force revieweeRole back to 'member'
  useEffect(() => {
    if (!isLeader) setValue('revieweeRole', 'member');
  }, [isLeader, setValue]);

  useEffect(() => {
    if (editingEntry) {
      reset({
        leaderName:   editingEntry.leaderName,
        revieweeName: editingEntry.revieweeName,
        revieweeRole: editingEntry.revieweeRole,
        review:       editingEntry.review,
        plannedAction: editingEntry.plannedAction,
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
          {/* ── Reviewer ─────────────────────────────────── */}
          <Controller
            name="leaderName"
            control={control}
            rules={{ required: 'Please select a reviewer.' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.leaderName)}>
                <InputLabel id="leader-label">Reviewer</InputLabel>
                <Select {...field} labelId="leader-label" label="Reviewer">
                  {leaders.map((l) => (
                    <MenuItem key={l.name} value={l.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            bgcolor: l.role === 'leader' ? '#eab308' : '#14b8a6',
                            flexShrink: 0,
                          }}
                        />
                        {l.name}
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

          {/* ── Reviewee role (only visible for Leaders) ─── */}
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

          {/* ── Participant name ──────────────────────────── */}
          <TextField
            label="Participant name"
            fullWidth
            required
            error={Boolean(errors.revieweeName)}
            helperText={errors.revieweeName?.message ?? 'The person being reviewed'}
            {...register('revieweeName', { required: 'Name is required.' })}
          />

          {/* ── Review ───────────────────────────────────── */}
          <TextField
            label="Review"
            fullWidth
            required
            multiline
            rows={4}
            error={Boolean(errors.review)}
            helperText={errors.review?.message}
            {...register('review', { required: 'Review is required.' })}
          />

          {/* ── Planned action ───────────────────────────── */}
          <TextField
            label="Planned action"
            fullWidth
            required
            multiline
            rows={4}
            error={Boolean(errors.plannedAction)}
            helperText={errors.plannedAction?.message}
            {...register('plannedAction', { required: 'Planned action is required.' })}
          />

          {/* ── Actions ──────────────────────────────────── */}
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
