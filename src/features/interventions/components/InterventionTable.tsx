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
import { useMemo, useRef, useState } from "react";

const VIEWPORT_HEIGHT = 560;
const ROW_HEIGHT = 76;
const OVERSCAN = 4;

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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const firstVisibleIndex = Math.floor(scrollTop / ROW_HEIGHT);
  const visibleRowCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT);
  const startIndex = Math.max(0, firstVisibleIndex - OVERSCAN);
  const endIndex = Math.min(
    interventions.length,
    firstVisibleIndex + visibleRowCount + OVERSCAN,
  );

  const windowedInterventions = useMemo(
    () => interventions.slice(startIndex, endIndex),
    [endIndex, interventions, startIndex],
  );

  const topSpacerHeight = startIndex * ROW_HEIGHT;
  const bottomSpacerHeight = (interventions.length - endIndex) * ROW_HEIGHT;
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
      <TableContainer
        ref={scrollContainerRef}
        component={Paper}
        variant="outlined"
        onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
        sx={{ height: VIEWPORT_HEIGHT, overflow: "auto" }}
        data-testid="intervention-scroll-container"
      >
        <Table
          stickyHeader
          aria-rowcount={interventions.length + 1}
          sx={{ minWidth: 920 }}
          aria-label="Coda interventi tecnici"
        >
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
            {topSpacerHeight > 0 ? (
              <TableRow aria-hidden="true" data-testid="top-spacer">
                <TableCell
                  colSpan={6}
                  sx={{ height: topSpacerHeight, p: 0, border: 0 }}
                />
              </TableRow>
            ) : null}

            {windowedInterventions.map((intervention, windowIndex) => {
              const absoluteIndex = startIndex + windowIndex;
              return (
                <InterventionRow
                  key={intervention.id}
                  intervention={intervention}
                  rowIndex={absoluteIndex + 2}
                  selected={intervention.id === selectedId}
                  onPrepareDetail={onPrepareDetail}
                  onSelect={onSelect}
                  onAdvance={onAdvance}
                  onToggleMonitoring={onToggleMonitoring}
                />
              );
            })}

            {bottomSpacerHeight > 0 ? (
              <TableRow aria-hidden="true" data-testid="bottom-spacer">
                <TableCell
                  colSpan={6}
                  sx={{ height: bottomSpacerHeight, p: 0, border: 0 }}
                />
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
