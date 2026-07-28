import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { memo } from "react";
import type { Intervention } from "../intervention.types";
import { priorityLabels, statusLabels } from "../intervention.types";

type InterventionRowProps = {
  intervention: Intervention;
  selected: boolean;
  rowIndex: number;
  onSelect: (interventionId: string) => void;
  onAdvance: (interventionId: string) => void;
  onToggleMonitoring: (interventionId: string) => void;
  onPrepareDetail: () => Promise<unknown>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

/** memo evita di richiamare la riga quando React riceve le stesse props. */
export const InterventionRow = memo(function InterventionRow({
  intervention,
  selected,
  rowIndex,
  onSelect,
  onAdvance,
  onToggleMonitoring,
  onPrepareDetail,
}: InterventionRowProps) {
  // TODO 05 e 08: il controllo dettaglio dovrà avviare il preload e ricevere
  // un id stabile usato dalla sequenza scroll, mount e focus.
  return (
    <TableRow
      selected={selected}
      hover
      aria-rowindex={rowIndex}
      data-testid="intervention-data-row"
      sx={{ height: 76 }}
    >
      <TableCell>
        <Typography
          component="p"
          noWrap
          title={intervention.title}
          sx={{ fontWeight: 700, maxWidth: 320 }}
        >
          {intervention.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {intervention.id} - {intervention.site}
        </Typography>
      </TableCell>
      <TableCell>{intervention.team}</TableCell>
      <TableCell>
        <Chip
          label={priorityLabels[intervention.priority]}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell aria-live="polite" aria-atomic="true">
        <Chip
          label={statusLabels[intervention.status]}
          size="small"
          variant="outlined"
        />
      </TableCell>
      <TableCell>{formatDate(intervention.dueAt)}</TableCell>
      <TableCell align="right">
        <Stack
          direction="row"
          spacing={0.25}
          sx={{ justifyContent: "flex-end" }}
        >
          <Tooltip
            title={
              intervention.monitored ? "Rimuovi dal monitoraggio" : "Monitora"
            }
          >
            <IconButton
              aria-label={`${intervention.monitored ? "Rimuovi dal monitoraggio" : "Monitora"} ${intervention.id}`}
              color={intervention.monitored ? "primary" : "default"}
              onClick={() => onToggleMonitoring(intervention.id)}
            >
              {intervention.monitored ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Mostra dettaglio">
            <IconButton
              onPointerEnter={() => void onPrepareDetail()}
              onFocus={() => void onPrepareDetail()}
              aria-label={`Mostra dettaglio ${intervention.id}`}
              aria-pressed={selected}
              aria-controls="intervention-detail"
              onClick={() => onSelect(intervention.id)}
            >
              <VisibilityOutlinedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              intervention.status === "completed"
                ? "Intervento completato"
                : "Avanza stato"
            }
          >
            <span>
              <IconButton
                aria-label={`Avanza stato ${intervention.id}`}
                disabled={intervention.status === "completed"}
                onClick={() => onAdvance(intervention.id)}
              >
                <ArrowForwardIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
});
