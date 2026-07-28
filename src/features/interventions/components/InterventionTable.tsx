import SearchOffIcon from "@mui/icons-material/SearchOff";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import type { Intervention } from "../intervention.types";
import { InterventionRow } from "./InterventionRow";

type InterventionTableProps = {
  interventions: Intervention[];
  selectedId: string | null;
  onSelect: (interventionId: string) => void;
  onAdvance: (interventionId: string) => void;
  onToggleMonitoring: (interventionId: string) => void;
  onResetFilters: () => void;
  onPrepareDetail: () => Promise<unknown>;
};

export function InterventionTable({
  interventions,
  selectedId,
  onPrepareDetail,
  onSelect,
  onAdvance,
  onToggleMonitoring,
  onResetFilters,
}: InterventionTableProps) {
  // TODO 07: con 1.200 record questa map monta 1.200 righe. Implementare una
  // finestra da 560 px, righe da 76 px, overscan 4 e spacer semantici.
  // TODO 08: dopo il windowing gestire reset e clamp dello scroll, id delle
  // azioni e ripristino del focus su righe non più montate.
  if (interventions.length === 0) {
    return (
      <Paper
        role="status"
        variant="outlined"
        sx={{ p: 5, textAlign: "center" }}
      >
        <SearchOffIcon
          color="primary"
          sx={{ fontSize: 40 }}
          aria-hidden="true"
        />
        <Typography component="h2" variant="h2" sx={{ mt: 2 }}>
          Nessun intervento trovato
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Modifica la ricerca oppure reimposta i filtri.
        </Typography>
        <Button onClick={onResetFilters} sx={{ mt: 2 }}>
          Reimposta filtri
        </Button>
      </Paper>
    );
  }

  return (
    <Box component="section" aria-labelledby="queue-heading">
      <Typography
        id="queue-heading"
        component="h2"
        variant="h2"
        sx={{ mb: 1.5 }}
      >
        Coda interventi
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table sx={{ minWidth: 920 }} aria-label="Coda interventi tecnici">
          <TableHead>
            <TableRow>
              <TableCell>Intervento</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Priorità</TableCell>
              <TableCell>Stato</TableCell>
              <TableCell>Scadenza</TableCell>
              <TableCell align="right">Azioni</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {interventions.map((intervention) => (
              <InterventionRow
                key={intervention.id}
                intervention={intervention}
                selected={intervention.id === selectedId}
                onPrepareDetail={onPrepareDetail}
                onSelect={onSelect}
                onAdvance={onAdvance}
                onToggleMonitoring={onToggleMonitoring}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
