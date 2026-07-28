import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type RefObject,
} from "react";
import {
  createInitialQueueState,
  interventionQueueReducer,
} from "../interventionQueueReducer";
import {
  selectInterventionById,
  selectVisibleInterventions,
  summarizeInterventions,
} from "../intervention.selectors";
import type {
  Intervention,
  InterventionSort,
  PriorityFilter,
  StatusFilter,
} from "../intervention.types";
import { InterventionFilters } from "./InterventionFilters";
import { InterventionSummary } from "./InterventionSummary";

type TableModule = typeof import("./InterventionTable");
type DetailModule = typeof import("./InterventionDetail");

let tableModulePromise: Promise<TableModule> | undefined;
let detailModulePromise: Promise<DetailModule> | undefined;

function usesSlowSectionScenario() {
  return (
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get("scenario") ===
      "slow-sections"
  );
}

async function waitForDemoDelay() {
  if (!usesSlowSectionScenario()) return;
  await new Promise((resolve) => window.setTimeout(resolve, 800));
}

function loadTableModule() {
  // La stessa Promise serve al preload e a React.lazy.
  tableModulePromise ??= Promise.all([
    import("./InterventionTable"),
    waitForDemoDelay(),
  ]).then(([module]) => module);
  return tableModulePromise;
}

function preloadInterventionDetail() {
  // Il path letterale permette a Vite di creare un chunk prevedibile.
  detailModulePromise ??= Promise.all([
    import("./InterventionDetail"),
    waitForDemoDelay(),
  ]).then(([module]) => module);
  return detailModulePromise;
}

const LazyInterventionTable = lazy(() =>
  loadTableModule().then((module) => ({ default: module.InterventionTable })),
);

const LazyInterventionDetail = lazy(() =>
  preloadInterventionDetail().then((module) => ({
    default: module.InterventionDetail,
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
        <Stack spacing={1.5} sx={{ mt: 2 }} aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} variant="rounded" height={60} />
          ))}
        </Stack>
      </Paper>
    </Box>
  );
}

function DetailFallback() {
  return (
    <Paper
      component="aside"
      role="status"
      aria-live="polite"
      aria-busy="true"
      variant="outlined"
      sx={{ p: 3, minHeight: 260 }}
    >
      <Typography>Caricamento dettaglio...</Typography>
      <Stack spacing={1.5} sx={{ mt: 2 }} aria-hidden="true">
        <Skeleton variant="text" width="35%" />
        <Skeleton variant="text" width="80%" height={36} />
        <Skeleton variant="rounded" height={96} />
      </Stack>
    </Paper>
  );
}

type EmptyDetailProps = {
  focusRequested: boolean;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onFocusRequestComplete: () => void;
};

function EmptyDetail({
  focusRequested,
  headingRef,
  onFocusRequestComplete,
}: EmptyDetailProps) {
  useEffect(() => {
    if (!focusRequested) return;
    headingRef.current?.focus();
    onFocusRequestComplete();
  }, [focusRequested, headingRef, onFocusRequestComplete]);

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
        ref={headingRef}
        component="h2"
        variant="h2"
        tabIndex={-1}
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

type InterventionQueuePageProps = {
  initialInterventions: Intervention[];
};

export function InterventionQueuePage({
  initialInterventions,
}: InterventionQueuePageProps) {
  const detailHeadingRef = useRef<HTMLHeadingElement>(null);
  const [focusRequestId, setFocusRequestId] = useState<string | null>(null);
  const [emptyDetailFocusRequested, setEmptyDetailFocusRequested] =
    useState(false);
  const [state, dispatch] = useReducer(
    interventionQueueReducer,
    initialInterventions,
    createInitialQueueState,
  );

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

  useEffect(() => {
    if (
      state.selectedId &&
      !visibleInterventions.some(
        (intervention) => intervention.id === state.selectedId,
      )
    ) {
      const filters = document.getElementById("intervention-filters");
      if (!filters?.contains(document.activeElement)) {
        setEmptyDetailFocusRequested(true);
      }
      dispatch({ type: "selectionCleared" });
    }
  }, [state.selectedId, visibleInterventions]);

  const handleSelect = useCallback((interventionId: string) => {
    setFocusRequestId(null);
    setEmptyDetailFocusRequested(false);
    dispatch({ type: "interventionSelected", interventionId });
  }, []);

  const handleCloseDetail = useCallback(() => {
    if (state.selectedId) setFocusRequestId(state.selectedId);
    setEmptyDetailFocusRequested(false);
    dispatch({ type: "selectionCleared" });
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

  const handleFocusRequestComplete = useCallback(() => {
    setFocusRequestId(null);
  }, []);

  const handleEmptyDetailFocusComplete = useCallback(() => {
    setEmptyDetailFocusRequested(false);
  }, []);

  const hasActiveFilters =
    state.query !== "" ||
    state.statusFilter !== "all" ||
    state.priorityFilter !== "all" ||
    state.monitoredOnly;

  const viewKey = [
    state.query.trim().toLocaleLowerCase("it-IT"),
    state.statusFilter,
    state.priorityFilter,
    state.monitoredOnly ? "monitored" : "all",
    state.sortBy,
  ].join("|");

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
                viewKey={viewKey}
                focusRequestId={focusRequestId}
                onFocusRequestComplete={handleFocusRequestComplete}
                onPrepareDetail={preloadInterventionDetail}
                onSelect={handleSelect}
                onAdvance={handleAdvance}
                onToggleMonitoring={handleToggleMonitoring}
                onResetFilters={handleReset}
              />
            </Suspense>

            {selectedIntervention ? (
              <Suspense fallback={<DetailFallback />}>
                <LazyInterventionDetail
                  intervention={selectedIntervention}
                  onClose={handleCloseDetail}
                  onAdvance={handleAdvance}
                  headingRef={detailHeadingRef}
                />
              </Suspense>
            ) : (
              <EmptyDetail
                focusRequested={emptyDetailFocusRequested}
                headingRef={detailHeadingRef}
                onFocusRequestComplete={handleEmptyDetailFocusComplete}
              />
            )}
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
