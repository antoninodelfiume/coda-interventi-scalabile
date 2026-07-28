import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  lazy,
  Suspense,
} from "react";
import {
  interventionQueueReducer,
  createInitialQueueState,
} from "../interventionQueueReducer";
import {
  selectInterventionById,
  selectVisibleInterventions,
  summarizeInterventions,
} from "../intervention.selectors";
import type {
  InterventionSort,
  PriorityFilter,
  StatusFilter,
} from "../intervention.types";
import { InterventionDetail } from "./InterventionDetail";
import { InterventionFilters } from "./InterventionFilters";
import { InterventionSummary } from "./InterventionSummary";
import { Paper } from "@mui/material";

const LazyInterventionTable = lazy(() =>
  import("./InterventionTable").then((module) => ({
    default: module.InterventionTable,
  })),
);

function TableFallback() {
  return (
    <Box component="section" aria-labelledby="queue-loading-heading">
      <Typography id="queue-loading-heading" component="h2" variant="h2">
        Coda interventi
      </Typography>
      <Paper
        role="status"
        aria-live="polite"
        aria-busy="true"
        variant="outlined"
        sx={{ mt: 1.5, p: 2.5, minHeight: 560 }}
      >
        <Typography>Caricamento tabella...</Typography>
      </Paper>
    </Box>
  );
}
// TODO 04: caricare InterventionDetail solo alla prima selezione e chiudere il
// dettaglio quando il record selezionato scompare dalla vista filtrata.
// TODO 05: condividere la Promise degli import, precaricare su focus o
// puntatore e supportare ?scenario=slow-sections in sviluppo.
export function InterventionQueuePage() {
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const detailTriggerRef = useRef<HTMLButtonElement | null>(null);
  const previousSelectedIdRef = useRef<string | null>(null);
  const [state, dispatch] = useReducer(
    interventionQueueReducer,
    undefined,
    createInitialQueueState,
  );

  // La lista è derived state: filtri e ordinamento non richiedono un setter.
  const visibleInterventions = useMemo(
    () =>
      selectVisibleInterventions({
        interventions: state.interventions,
        query: state.query,
        statusFilter: state.statusFilter,
        priorityFilter: state.priorityFilter,
        monitoredOnly: state.monitoredOnly,
        sortBy: state.sortBy,
      }),
    [
      state.interventions,
      state.query,
      state.statusFilter,
      state.priorityFilter,
      state.monitoredOnly,
      state.sortBy,
    ],
  );

  const summary = useMemo(
    () => summarizeInterventions(state.interventions),
    [state.interventions],
  );

  const selectedIntervention = selectInterventionById(
    state.interventions,
    state.selectedId,
  );

  const handleSelect = useCallback((interventionId: string) => {
    if (document.activeElement instanceof HTMLButtonElement) {
      detailTriggerRef.current = document.activeElement;
    }
    dispatch({ type: "interventionSelected", interventionId });
  }, []);

  useEffect(() => {
    if (state.selectedId) {
      detailHeadingRef.current?.focus();
    } else if (previousSelectedIdRef.current) {
      detailTriggerRef.current?.focus();
    }

    previousSelectedIdRef.current = state.selectedId;
  }, [state.selectedId]);

  const handleAdvance = useCallback((interventionId: string) => {
    dispatch({ type: "statusAdvanced", interventionId });
  }, []);

  const handleToggleMonitoring = useCallback((interventionId: string) => {
    dispatch({ type: "monitoringToggled", interventionId });
  }, []);

  const handleReset = useCallback(() => {
    dispatch({ type: "filtersReset" });
  }, []);

  const hasActiveFilters =
    state.query !== "" ||
    state.statusFilter !== "all" ||
    state.priorityFilter !== "all" ||
    state.monitoredOnly;

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "background.default", pb: 5 }}>
      <Box
        component="header"
        sx={{ bgcolor: "secondary.main", color: "secondary.contrastText" }}
      >
        <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{ alignItems: "center", mb: 2 }}
          >
            <BuildCircleOutlinedIcon aria-hidden="true" />
            <Typography sx={{ fontWeight: 700 }}>Operations Italia</Typography>
          </Stack>
          <Typography component="h1" variant="h1">
            Coda interventi scalabile
          </Typography>
          <Typography sx={{ mt: 1, color: "#CBD5E1", maxWidth: 680 }}>
            Cerca, assegna e monitora un archivio simulato di interventi.
          </Typography>
        </Container>
      </Box>

      <Container component="main" maxWidth="xl" sx={{ mt: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <InterventionSummary summary={summary} />
          <InterventionFilters
            query={state.query}
            statusFilter={state.statusFilter}
            priorityFilter={state.priorityFilter}
            sortBy={state.sortBy}
            monitoredOnly={state.monitoredOnly}
            hasActiveFilters={hasActiveFilters}
            onQueryChange={(query) => dispatch({ type: "queryChanged", query })}
            onStatusChange={(status: StatusFilter) =>
              dispatch({ type: "statusFilterChanged", status })
            }
            onPriorityChange={(priority: PriorityFilter) =>
              dispatch({ type: "priorityFilterChanged", priority })
            }
            onSortChange={(sortBy: InterventionSort) =>
              dispatch({ type: "sortChanged", sortBy })
            }
            onMonitoredChange={(checked) =>
              dispatch({ type: "monitoredFilterChanged", checked })
            }
            onReset={handleReset}
          />

          <Typography color="text.secondary" aria-live="polite">
            {visibleInterventions.length === 1
              ? "1 intervento visibile"
              : `${visibleInterventions.length} interventi visibili`}
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                lg: "minmax(0, 2fr) minmax(300px, 1fr)",
              },
              gap: 3,
              alignItems: "start",
            }}
          >
            <Suspense fallback={<TableFallback />}>
              <LazyInterventionTable
                interventions={visibleInterventions}
                selectedId={state.selectedId}
                onSelect={handleSelect}
                onAdvance={handleAdvance}
                onToggleMonitoring={handleToggleMonitoring}
                onResetFilters={handleReset}
              />
            </Suspense>
            <InterventionDetail
              intervention={selectedIntervention}
              onClose={() => dispatch({ type: "selectionCleared" })}
              onAdvance={handleAdvance}
              headingRef={detailHeadingRef}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
