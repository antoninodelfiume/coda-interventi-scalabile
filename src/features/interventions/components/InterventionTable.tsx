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
import { useEffect, useMemo, useRef, useState } from "react";
import type { Intervention } from "../intervention.types";
import { InterventionRow } from "./InterventionRow";

const VIEWPORT_HEIGHT = 560;
const ROW_HEIGHT = 76;
const OVERSCAN = 4;

type InterventionTableProps = {
  interventions: Intervention[];
  selectedId: string | null;
  viewKey: string;
  focusRequestId: string | null;
  onFocusRequestComplete: () => void;
  onPrepareDetail: () => Promise<unknown>;
  onSelect: (interventionId: string) => void;
  onAdvance: (interventionId: string) => void;
  onToggleMonitoring: (interventionId: string) => void;
  onResetFilters: () => void;
};

export function InterventionTable({
  interventions,
  selectedId,
  viewKey,
  focusRequestId,
  onFocusRequestComplete,
  onPrepareDetail,
  onSelect,
  onAdvance,
  onToggleMonitoring,
  onResetFilters,
}: InterventionTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const maxScrollTop = Math.max(
    0,
    interventions.length * ROW_HEIGHT - VIEWPORT_HEIGHT,
  );
  const safeScrollTop = Math.min(scrollTop, maxScrollTop);
  const firstVisibleIndex = Math.floor(safeScrollTop / ROW_HEIGHT);
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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) container.scrollTop = 0;
    setScrollTop(0);
  }, [viewKey]);

  useEffect(() => {
    if (scrollTop <= maxScrollTop) return;
    const container = scrollContainerRef.current;
    if (container) container.scrollTop = maxScrollTop;
    setScrollTop(maxScrollTop);
  }, [maxScrollTop, scrollTop]);

  useEffect(() => {
    if (!focusRequestId) return;

    const rowIndex = interventions.findIndex(
      (intervention) => intervention.id === focusRequestId,
    );
    if (rowIndex < 0) {
      onFocusRequestComplete();
      return;
    }

    const nextScrollTop = Math.min(rowIndex * ROW_HEIGHT, maxScrollTop);
    const container = scrollContainerRef.current;

    // Prima scorriamo, poi React rimonta la riga e infine spostiamo il focus.
    if (container) container.scrollTop = nextScrollTop;
    setScrollTop(nextScrollTop);

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document.getElementById(`detail-trigger-${focusRequestId}`)?.focus();
        onFocusRequestComplete();
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [focusRequestId, interventions, maxScrollTop, onFocusRequestComplete]);

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
          sx={{ minWidth: 920 }}
          aria-label="Coda interventi tecnici"
          aria-rowcount={interventions.length + 1}
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
