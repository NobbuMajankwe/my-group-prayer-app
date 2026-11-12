import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Autocomplete, Avatar, Box, Button, Card, CardContent,
  Chip, FormControl, IconButton, InputLabel, MenuItem, Select,
  TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography, alpha,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import SaveIcon          from '@mui/icons-material/Save';
import CancelIcon        from '@mui/icons-material/Close';
import ChatIcon          from '@mui/icons-material/ChatBubbleOutlined';
import PrayerIcon        from '@mui/icons-material/VolunteerActivism';
import StarOutlinedIcon  from '@mui/icons-material/StarOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import MicIcon           from '@mui/icons-material/Mic';
import MicOffIcon        from '@mui/icons-material/MicOff';
import type { LeaderPerson, Member, ReviewEntry, RevieweeRole } from '../types/ReviewEntry';
import AiActionSuggest from './AiActionSuggest';
import { useVoiceInput } from '../hooks/useVoiceInput';

export interface EntryFormValues {
  leaderName:     string;
  revieweeName:   string;
  revieweeRole:   RevieweeRole;
  prayerRequest:  string;
  plannedAction:  string;
  memberId?:      string;
  chatInitiated:  boolean;
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

type NameOption = { label: string; memberId: string; core: string | undefined };

const EMPTY: EntryFormValues = {
  leaderName: '', revieweeName: '', revieweeRole: 'member',
  prayerRequest: '', plannedAction: '', memberId: undefined, chatInitiated: false,
};

const MEMBER_BG  = 'rgba(124,58,237,0.08)';
const MEMBER_COL = '#5b21b6';

export default function EntryForm({
  leaders, members, currentLeader, onSubmit, editingEntry, onCancelEdit, saving,
}: EntryFormProps) {
  const {
    register, handleSubmit, reset, control, setValue, watch,
    formState: { errors },
  } = useForm<EntryFormValues>({ defaultValues: EMPTY });

  // eslint-disable-next-line react-hooks/incompatible-library
  const chatInitiated     = watch('chatInitiated');
  const revieweeRole      = watch('revieweeRole');
  const selectedLeaderName = currentLeader.name;
  const isLeader           = currentLeader.role === 'leader';

  const nameOptions = useMemo((): NameOption[] => {
    if (isLeader && revieweeRole === 'core') {
      return leaders
        .filter((l) => l.role === 'core')
        .map((l) => ({ label: l.displayName || l.name, memberId: l.name, core: undefined }));
    }
    const assignedMembers = isLeader
      ? members.filter((m) => m.assignedLeader === selectedLeaderName)
      : members.filter((m) => m.assignedCore === selectedLeaderName);
    return assignedMembers.map((m) => ({ label: m.name, memberId: m.id, core: m.assignedCore }));
  }, [selectedLeaderName, isLeader, revieweeRole, members, leaders]);

  useEffect(() => {
    setValue('leaderName', currentLeader.name);
    if (!isLeader) setValue('revieweeRole', 'member');
  }, [currentLeader.name, isLeader, setValue]);

  useEffect(() => {
    if (!editingEntry) { setValue('revieweeName', ''); setValue('memberId', undefined); }
  }, [revieweeRole, editingEntry, setValue]);

  useEffect(() => {
    if (editingEntry) {
      reset({
        leaderName:    editingEntry.leaderName,
        revieweeName:  editingEntry.revieweeName,
        revieweeRole:  editingEntry.revieweeRole,
        prayerRequest: editingEntry.prayerRequest,
        plannedAction: editingEntry.plannedAction,
        memberId:      editingEntry.memberId,
        chatInitiated: editingEntry.chatInitiated ?? false,
      });
    } else {
      reset({ ...EMPTY, leaderName: currentLeader.name });
    }
  }, [editingEntry, reset, currentLeader.name]);

  const handleFormSubmit = (values: EntryFormValues) => {
    onSubmit(values);
    if (!editingEntry) reset({ ...EMPTY, leaderName: currentLeader.name });
  };

  const isEditing = Boolean(editingEntry);
  const isChatOnly = chatInitiated && !watch('prayerRequest').trim();

  const prayerVoice = useVoiceInput({
    onResult: (t) => setValue('prayerRequest', t, { shouldValidate: true }),
  });
  const actionVoice = useVoiceInput({
    onResult: (t) => setValue('plannedAction', t, { shouldValidate: true }),
  });



  return (
    <Card
      sx={{
        mb: 4, position: 'relative', overflow: 'visible',
        '&::before': {
          content: '""', position: 'absolute',
          top: 0, left: 12, right: 12, height: 3,
          borderRadius: '0 0 3px 3px',
          background: isEditing
            ? 'linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)'
            : chatInitiated
              ? 'linear-gradient(90deg, #0ea5e9 0%, #7c3aed 100%)'
              : 'linear-gradient(90deg, #7c3aed 0%, #db2777 100%)',
          transition: 'background 0.3s ease',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, sm: 3.5 }, pt: { xs: 3, sm: 3.5 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box sx={{
            width: 36, height: 36, borderRadius: 2.5, flexShrink: 0,
            background: isEditing
              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
              : chatInitiated
                ? 'linear-gradient(135deg, #0ea5e9, #7c3aed)'
                : 'linear-gradient(135deg, #7c3aed, #db2777)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(124,58,237,0.35)',
            transition: 'all 0.3s ease',
          }}>
            {isEditing ? <SaveIcon sx={{ fontSize: 18, color: '#fff' }} />
              : chatInitiated ? <ChatIcon sx={{ fontSize: 18, color: '#fff' }} />
              : <AddIcon sx={{ fontSize: 18, color: '#fff' }} />}
          </Box>
          <Box>
            <Typography variant="h6" sx={{ color: isEditing ? '#92400e' : 'primary.main', lineHeight: 1.2 }}>
              {isEditing ? 'Edit entry' : 'New prayer request'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {isEditing ? 'Make your changes below' : 'Log a prayer request or record that you initiated a chat'}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>

          {/* Reviewer + Role row */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: isLeader ? '1fr 1fr' : '1fr' }, gap: 2 }}>
            {/* Reviewer — read-only */}
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
                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', lineHeight: 1.2 }}>Logged by</Typography>
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
              <Controller name="revieweeRole" control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel id="reviewee-role-label">Logging for a…</InputLabel>
                    <Select {...field} labelId="reviewee-role-label" label="Logging for a…">
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="core">Core / Intern</MenuItem>
                    </Select>
                  </FormControl>
                )}
              />
            )}
          </Box>

          {/* Participant */}
          <Controller name="revieweeName" control={control}
            rules={{ required: 'Participant name is required.' }}
            render={({ field }) => {
              const showAutocomplete = nameOptions.length > 0 || !isLeader;
              if (showAutocomplete) {
                const currentOption = nameOptions.find((o) => o.label === field.value) ?? null;
                return (
                  <Autocomplete<NameOption, false, false, true>
                    options={nameOptions}
                    getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                    value={currentOption}
                    onChange={(_, newVal) => {
                      if (!newVal) { field.onChange(''); setValue('memberId', undefined); }
                      else if (typeof newVal === 'string') { field.onChange(newVal); setValue('memberId', undefined); }
                      else { field.onChange(newVal.label); setValue('memberId', newVal.memberId); }
                    }}
                    freeSolo
                    onInputChange={(_, val, reason) => {
                      if (reason === 'input') { field.onChange(val); setValue('memberId', undefined); }
                    }}
                    renderOption={(props, option) => (
                      <Box component="li" {...props} key={option.memberId}
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: MEMBER_BG, color: MEMBER_COL, fontSize: '0.7rem', fontWeight: 700 }}>
                          {option.label.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.label}</Typography>
                          {option.core && (
                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>Core: {option.core}</Typography>
                          )}
                        </Box>
                      </Box>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} label="Member" required
                        error={Boolean(errors.revieweeName)}
                        helperText={errors.revieweeName?.message ?? 'Select from your assigned members or type a name'}
                      />
                    )}
                  />
                );
              }
              return (
                <TextField {...field} label="Member name" fullWidth required
                  error={Boolean(errors.revieweeName)}
                  helperText={errors.revieweeName?.message ?? 'The person this request is for'}
                />
              );
            }}
          />

          {/* Chat initiated toggle */}
          <Controller name="chatInitiated" control={control}
            render={({ field }) => (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', mb: 1 }}>
                  Did you initiate a chat?
                </Typography>
                <ToggleButtonGroup
                  exclusive size="small"
                  value={field.value ? 'yes' : 'no'}
                  onChange={(_, v) => { if (v) field.onChange(v === 'yes'); }}
                  sx={{ '& .MuiToggleButton-root': { textTransform: 'none', fontWeight: 600, px: 2 } }}
                >
                  <ToggleButton value="yes" sx={{ gap: 0.75,
                    '&.Mui-selected': { bgcolor: 'rgba(14,165,233,0.1)', color: '#0369a1', borderColor: 'rgba(14,165,233,0.3)' },
                  }}>
                    <ChatIcon sx={{ fontSize: 15 }} /> Yes, I reached out
                  </ToggleButton>
                  <ToggleButton value="no" sx={{ gap: 0.75 }}>
                    <PrayerIcon sx={{ fontSize: 15 }} /> They shared with me
                  </ToggleButton>
                </ToggleButtonGroup>
                {chatInitiated && (
                  <Typography variant="caption" sx={{ color: '#0369a1', display: 'block', mt: 0.75 }}>
                    You can save now to record the chat, then edit later to add the prayer request once they share it.
                  </Typography>
                )}
              </Box>
            )}
          />

          {/* Prayer request + Planned action — hidden when chat-only save */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Prayer request"
                fullWidth multiline rows={4}
                required={!chatInitiated}
                error={Boolean(errors.prayerRequest)}
                helperText={errors.prayerRequest?.message ?? (chatInitiated ? 'Optional — add once they share it' : 'What did they share?')}
                {...register('prayerRequest', { required: chatInitiated ? false : 'Prayer request is required.' })}
                slotProps={{ input: { sx: { pr: 5 } } }}
              />
              {prayerVoice.state !== 'unsupported' && (
                <Tooltip title={prayerVoice.state === 'listening' ? 'Stop recording' : 'Dictate prayer request'}>
                  <IconButton
                    size="small"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() =>
                      prayerVoice.state === 'listening'
                        ? prayerVoice.stop()
                        : prayerVoice.start(watch('prayerRequest'))
                    }
                    sx={{
                      position: 'absolute', top: 10, right: 8,
                      color: prayerVoice.state === 'listening' ? 'error.main' : 'text.disabled',
                      bgcolor: prayerVoice.state === 'listening' ? alpha('#dc2626', 0.08) : 'transparent',
                      animation: prayerVoice.state === 'listening' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.4 },
                      },
                      '&:hover': { color: 'primary.main', bgcolor: alpha('#7c3aed', 0.07) },
                    }}
                  >
                    {prayerVoice.state === 'listening'
                      ? <MicOffIcon sx={{ fontSize: 17 }} />
                      : <MicIcon sx={{ fontSize: 17 }} />}
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ position: 'relative' }}>
                <TextField
                  label="Planned action / follow-up"
                  fullWidth multiline rows={4}
                  required={!chatInitiated}
                  error={Boolean(errors.plannedAction)}
                  helperText={errors.plannedAction?.message ?? (chatInitiated ? 'Optional — add once you know the follow-up' : "What's the follow-up?")}
                  {...register('plannedAction', { required: chatInitiated ? false : 'Planned action is required.' })}
                  slotProps={{ input: { sx: { pr: 5 } } }}
                />
                {actionVoice.state !== 'unsupported' && (
                  <Tooltip title={actionVoice.state === 'listening' ? 'Stop recording' : 'Dictate planned action'}>
                    <IconButton
                      size="small"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() =>
                        actionVoice.state === 'listening'
                          ? actionVoice.stop()
                          : actionVoice.start(watch('plannedAction'))
                      }
                      sx={{
                        position: 'absolute', top: 10, right: 8,
                        color: actionVoice.state === 'listening' ? 'error.main' : 'text.disabled',
                        bgcolor: actionVoice.state === 'listening' ? alpha('#dc2626', 0.08) : 'transparent',
                        animation: actionVoice.state === 'listening' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                        '@keyframes pulse': {
                          '0%, 100%': { opacity: 1 },
                          '50%': { opacity: 0.4 },
                        },
                        '&:hover': { color: 'primary.main', bgcolor: alpha('#7c3aed', 0.07) },
                      }}
                    >
                      {actionVoice.state === 'listening'
                        ? <MicOffIcon sx={{ fontSize: 17 }} />
                        : <MicIcon sx={{ fontSize: 17 }} />}
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <AiActionSuggest
                prayerRequest={watch('prayerRequest')}
                onAccept={(s) => setValue('plannedAction', s, { shouldValidate: true })}
              />
            </Box>
          </Box>

          {/* Status indicator when chat-only */}
          {isChatOnly && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1, borderRadius: 2,
              bgcolor: 'rgba(14,165,233,0.06)', border: '1px solid rgba(14,165,233,0.2)' }}>
              <ChatIcon sx={{ fontSize: 15, color: '#0369a1' }} />
              <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 600 }}>
                This will be saved as "chat initiated — awaiting prayer request"
              </Typography>
            </Box>
          )}

          {/* Submit / cancel */}
          <Box sx={{ display: 'flex', gap: 1.5, pt: 0.5, flexWrap: 'wrap' }}>
            <Button type="submit" variant="contained" color="primary"
              startIcon={isEditing ? <SaveIcon /> : isChatOnly ? <ChatIcon /> : <AddIcon />}
              disabled={saving} sx={{ minWidth: 140 }}>
              {saving ? 'Saving…' : isEditing ? 'Save changes' : isChatOnly ? 'Log chat' : 'Log prayer request'}
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
