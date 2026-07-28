import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useEffect, type RefObject } from "react";
import type { Intervention } from "../intervention.types";
import { priorityLabels, statusLabels } from "../intervention.types";

type InterventionDetailProps = {
  intervention: Intervention | null;
  onClose: () => void;
  onAdvance: (interventionId: string) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${value}T12:00:00Z`));
}

export function InterventionDetail({
  intervention,
  onClose,
  onAdvance,
  headingRef,
}: InterventionDetailProps) {
  const interventionId = intervention?.id;

  useEffect(() => {
    if (interventionId) headingRef.current?.focus();
  }, [headingRef, interventionId]);
  if (!intervention) {
    return (
      <Paper
        id="intervention-detail"
        component="aside"
        aria-labelledby="intervention-detail-title"
        variant="outlined"
        sx={{ p: 3 }}
      >
        <BuildOutlinedIcon color="primary" aria-hidden="true" />
        <Typography
          id="intervention-detail-title"
          component="h2"
          variant="h2"
          sx={{ mt: 1.5 }}
        >
          Dettaglio intervento
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Seleziona una riga per consultare i dati e aggiornare lo stato.
        </Typography>
      </Paper>
    );
  }

  const actionLabel =
    intervention.status === "open" ? "Prendi in carico" : "Completa intervento";

  return (
    <Paper
      id="intervention-detail"
      component="aside"
      aria-labelledby="intervention-detail-title"
      variant="outlined"
      sx={{ overflow: "hidden" }}
    >
      <Stack
        direction="row"
        spacing={2}
        sx={{
          p: 2.5,
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="body2" color="text.secondary">
            {intervention.id}
          </Typography>
          <Typography
            id="intervention-detail-title"
            ref={headingRef}
            component="h2"
            variant="h2"
            tabIndex={-1}
            sx={{ mt: 0.5 }}
          >
            {intervention.title}
          </Typography>
        </Box>
        <IconButton aria-label="Chiudi dettaglio" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Stack>
      <Divider />
      <Stack spacing={2} sx={{ p: 2.5 }}>
        <div>
          <Typography variant="body2" color="text.secondary">
            Sede
          </Typography>
          <Typography>{intervention.site}</Typography>
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Team assegnato
          </Typography>
          <Typography>{intervention.team}</Typography>
        </div>
        <div>
          <Typography variant="body2" color="text.secondary">
            Scadenza
          </Typography>
          <Typography>{formatDate(intervention.dueAt)}</Typography>
        </div>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          <Chip
            label={priorityLabels[intervention.priority]}
            variant="outlined"
          />
          <Box component="span" aria-live="polite" aria-atomic="true">
            <Chip
              label={statusLabels[intervention.status]}
              variant="outlined"
            />
          </Box>
          {intervention.monitored ? (
            <Chip label="Monitorato" color="primary" />
          ) : null}
        </Stack>
        {intervention.status === "completed" ? (
          <Typography role="status" color="text.secondary">
            Il team ha completato questo intervento.
          </Typography>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={() => onAdvance(intervention.id)}
          >
            {actionLabel}
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
