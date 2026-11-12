/* eslint-disable react-refresh/only-export-components */
import {
  Box,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  alpha,
} from '@mui/material';
import SearchIcon    from '@mui/icons-material/SearchOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import CloseIcon     from '@mui/icons-material/Close';
import CalendarIcon  from '@mui/icons-material/CalendarTodayOutlined';
import type { LeaderPerson, LeaderRole, RevieweeRole } from '../types/ReviewEntry';

export interface FilterState {
  search:       string;
  reviewer:     string;
  leaderRole:   LeaderRole | '';
  revieweeRole: RevieweeRole | '';
  week:         string; // ISO week start date (Monday), '' = all
}

export const EMPTY_FILTERS: FilterState = {
  search: '', reviewer: '', leaderRole: '', revieweeRole: '', week: '',
};

export function isFilterActive(f: FilterState): boolean {
  return !!(f.search || f.reviewer || f.leaderRole || f.revieweeRole || f.week);
}

/** Returns the Monday of the ISO week containing `date` as YYYY-MM-DD */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

/** Label for a week: "Mon DD MMM" */
function weekLabel(isoMonday: string): string {
  const d = new Date(isoMonday + 'T00:00:00');
  const sun = new Date(d); sun.setDate(d.getDate() + 6);
  const fmt = (x: Date) => x.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(d)} – ${fmt(sun)}`;
}

interface FilterBarProps {
  filters:       FilterState;
  leaders:       LeaderPerson[];
  totalCount:    number;
  filteredCount: number;
  weekOptions:   string[]; // sorted ISO Monday dates
  onChange:      (filters: FilterState) => void;
}

export default function FilterBar({
  filters, leaders, totalCount, filteredCount, weekOptions, onChange,
}: FilterBarProps) {
  const set = (partial: Partial<FilterState>) => onChange({ ...filters, ...partial });
  const active = isFilterActive(filters);

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <FilterListIcon sx={{ fontSize: 16, color: active ? 'primary.main' : 'text.disabled' }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: active ? 'primary.main' : 'text.disabled', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Filter
        </Typography>
        {active && (
          <>
            <Typography variant="caption" sx={{ color: 'text.disabled', mx: 0.5 }}>·</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {filteredCount} of {totalCount}
            </Typography>
            <Tooltip title="Clear all filters">
              <Chip
                label="Clear"
                size="small"
                icon={<CloseIcon sx={{ fontSize: '12px !important' }} />}
                onClick={() => onChange(EMPTY_FILTERS)}
                sx={{
                  ml: 'auto',
                  height: 22,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: alpha('#7c3aed', 0.07),
                  color: 'primary.dark',
                  border: `1px solid ${alpha('#7c3aed', 0.15)}`,
                  cursor: 'pointer',
                  '& .MuiChip-icon': { color: 'primary.main' },
                }}
              />
            </Tooltip>
          </>
        )}
      </Box>

      {/* Controls */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr 1fr' },
          gap: 1.5,
          p: 2,
          borderRadius: 3,
          bgcolor: active ? alpha('#7c3aed', 0.03) : 'transparent',
          border: '1px solid',
          borderColor: active ? alpha('#7c3aed', 0.12) : alpha('#7c3aed', 0.07),
          transition: 'all 0.15s ease',
        }}
      >
        {/* Search */}
        <TextField
          size="small"
          placeholder="Search by name or review…"
          value={filters.search}
          onChange={(e) => set({ search: e.target.value })}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
                </InputAdornment>
              ),
              endAdornment: filters.search ? (
                <InputAdornment position="end">
                  <CloseIcon
                    sx={{ fontSize: 15, color: 'text.disabled', cursor: 'pointer', '&:hover': { color: 'text.primary' } }}
                    onClick={() => set({ search: '' })}
                  />
                </InputAdornment>
              ) : undefined,
            },
          }}
        />

        {/* Week */}
        <FormControl size="small">
          <InputLabel id="filter-week">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarIcon sx={{ fontSize: 14 }} /> Week
            </Box>
          </InputLabel>
          <Select
            labelId="filter-week"
            label="Week"
            value={filters.week}
            onChange={(e) => set({ week: e.target.value })}
          >
            <MenuItem value=""><em>All time</em></MenuItem>
            {weekOptions.map((w) => (
              <MenuItem key={w} value={w}>{weekLabel(w)}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reviewer */}
        <FormControl size="small">
          <InputLabel id="filter-reviewer">Reviewer</InputLabel>
          <Select
            labelId="filter-reviewer"
            label="Reviewer"
            value={filters.reviewer}
            onChange={(e) => set({ reviewer: e.target.value })}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            {leaders.map((l) => (
              <MenuItem key={l.id} value={l.id}>{l.displayName || l.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Reviewer role */}
        <FormControl size="small">
          <InputLabel id="filter-lrole">Reviewer type</InputLabel>
          <Select
            labelId="filter-lrole"
            label="Reviewer type"
            value={filters.leaderRole}
            onChange={(e) => set({ leaderRole: e.target.value as LeaderRole | '' })}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="leader">Leader</MenuItem>
            <MenuItem value="core">Core / Intern</MenuItem>
          </Select>
        </FormControl>

        {/* Reviewee role */}
        <FormControl size="small">
          <InputLabel id="filter-rrole">Reviewed as</InputLabel>
          <Select
            labelId="filter-rrole"
            label="Reviewed as"
            value={filters.revieweeRole}
            onChange={(e) => set({ revieweeRole: e.target.value as RevieweeRole | '' })}
          >
            <MenuItem value=""><em>All</em></MenuItem>
            <MenuItem value="member">Member</MenuItem>
            <MenuItem value="core">Core / Intern</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}
