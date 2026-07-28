import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import type {
  InterventionSort,
  PriorityFilter,
  StatusFilter,
} from "../intervention.types";
import {
  priorityLabels,
  sortLabels,
  statusLabels,
} from "../intervention.types";

type InterventionFiltersProps = {
  query: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  sortBy: InterventionSort;
  monitoredOnly: boolean;
  hasActiveFilters: boolean;
  onQueryChange: (query: string) => void;
  onStatusChange: (status: StatusFilter) => void;
  onPriorityChange: (priority: PriorityFilter) => void;
  onSortChange: (sortBy: InterventionSort) => void;
  onMonitoredChange: (checked: boolean) => void;
  onReset: () => void;
};

export function InterventionFilters({
  query,
  statusFilter,
  priorityFilter,
  sortBy,
  monitoredOnly,
  hasActiveFilters,
  onQueryChange,
  onStatusChange,
  onPriorityChange,
  onSortChange,
  onMonitoredChange,
  onReset,
}: InterventionFiltersProps) {
  return (
    <Paper
      id="intervention-filters"
      component="section"
      aria-label="Filtri interventi"
      variant="outlined"
      sx={{ p: 2.5 }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "minmax(240px, 2fr) 1fr 1fr",
            lg: "minmax(280px, 2fr) repeat(3, minmax(150px, 1fr))",
          },
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          label="Cerca interventi"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Titolo, sede, team o codice"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon aria-hidden="true" />
                </InputAdornment>
              ),
            },
          }}
        />

        <FormControl>
          <InputLabel id="status-filter-label">Stato</InputLabel>
          <Select
            labelId="status-filter-label"
            label="Stato"
            value={statusFilter}
            onChange={(event) =>
              onStatusChange(event.target.value as StatusFilter)
            }
          >
            <MenuItem value="all">Tutti gli stati</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="priority-filter-label">Priorità</InputLabel>
          <Select
            labelId="priority-filter-label"
            label="Priorità"
            value={priorityFilter}
            onChange={(event) =>
              onPriorityChange(event.target.value as PriorityFilter)
            }
          >
            <MenuItem value="all">Tutte le priorità</MenuItem>
            {Object.entries(priorityLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl>
          <InputLabel id="sort-label">Ordina per</InputLabel>
          <Select
            labelId="sort-label"
            label="Ordina per"
            value={sortBy}
            onChange={(event) =>
              onSortChange(event.target.value as InterventionSort)
            }
          >
            {Object.entries(sortLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: 1.5,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={monitoredOnly}
              onChange={(event) => onMonitoredChange(event.target.checked)}
            />
          }
          label="Solo monitorati"
        />
        <Button
          startIcon={<RestartAltIcon />}
          onClick={onReset}
          disabled={!hasActiveFilters}
        >
          Reimposta filtri
        </Button>
      </Box>
    </Paper>
  );
}
