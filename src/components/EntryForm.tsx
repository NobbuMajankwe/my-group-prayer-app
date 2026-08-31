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
import type { ReviewEntry } from '../types/ReviewEntry';

export interface EntryFormValues {
  leaderName: string;
  name: string;
  review: string;
  plannedAction: string;
}

interface EntryFormProps {
  leaders: string[];
  onSubmit: (values: EntryFormValues) => void;
  editingEntry?: ReviewEntry | null;
  onCancelEdit?: () => void;
}

const EMPTY: EntryFormValues = { leaderName: '', name: '', review: '', plannedAction: '' };

export default function EntryForm({ leaders, onSubmit, editingEntry, onCancelEdit }: EntryFormProps) {
  const { register, handleSubmit, reset, control, formState: { errors } } =
    useForm<EntryFormValues>({ defaultValues: EMPTY });

  useEffect(() => {
    if (editingEntry) {
      reset({
        leaderName: editingEntry.leaderName,
        name: editingEntry.name,
        review: editingEntry.review,
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

        {/* Form heading */}
        <Typography variant="h6" sx={{ mb: 2.5, color: 'primary.main' }}>
          {isEditing ? 'Edit entry' : 'New entry'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {/* Leader dropdown */}
          <Controller
            name="leaderName"
            control={control}
            rules={{ required: 'Please select a leader.' }}
            render={({ field }) => (
              <FormControl fullWidth error={Boolean(errors.leaderName)}>
                <InputLabel id="leader-label">Leader</InputLabel>
                <Select {...field} labelId="leader-label" label="Leader">
                  {leaders.map((l) => (
                    <MenuItem key={l} value={l}>{l}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>
                  {errors.leaderName?.message ?? 'Who is conducting this review?'}
                </FormHelperText>
              </FormControl>
            )}
          />

          {/* Participant name */}
          <TextField
            label="Participant name"
            fullWidth
            required
            error={Boolean(errors.name)}
            helperText={errors.name?.message ?? 'The person being reviewed'}
            {...register('name', { required: 'Name is required.' })}
          />

          {/* Review */}
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

          {/* Planned action */}
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

          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              startIcon={isEditing ? <SaveIcon /> : <AddIcon />}
            >
              {isEditing ? 'Save changes' : 'Add entry'}
            </Button>

            {isEditing && (
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                startIcon={<CancelIcon />}
                onClick={onCancelEdit}
                sx={{ borderColor: alpha('#6b7280', 0.3), color: 'text.secondary' }}
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
