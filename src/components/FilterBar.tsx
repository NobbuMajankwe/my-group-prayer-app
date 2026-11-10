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
import SearchIcon from '@mui/icons-material/SearchOutlined';
import FilterListIcon from '@mui/icons-material/FilterListOutlined';
import CloseIcon from '@mui/icons-material/Close';
import type { LeaderPerson, LeaderRole, RevieweeRole } from '../types/ReviewEntry';

export interface FilterState {
  search:       string;
  reviewer:     string;   // '' = all
  leaderRole:   LeaderRole | '';
  revieweeRole: RevieweeRole | '';
}

export const EMPTY_FILTERS: FilterState = {
  search: '', reviewer: '', leaderRole: '', revieweeRole: '',
};

export function isFilterActive(f: FilterState): boolean {
  return !!(f.search || f.reviewer || f.leaderRole || f.revieweeRole);
}

interface FilterBarProps {
  filters: FilterState;
  leaders: LeaderPerson[];
  totalCount: number;
  filteredCount: number;
  onChange: (filters: FilterState) => void;
}

export default function FilterBar({
  filters, leaders, totalCount, filteredCount, onChange,
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
          gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr 1fr' },
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
              <MenuItem key={l.name} value={l.name}>{l.name}</MenuItem>
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
