import { initialInterventions } from './interventions.fixture';
import type {
  Intervention,
  InterventionPriority,
  InterventionSort,
  InterventionStatus,
  PriorityFilter,
  StatusFilter,
} from './intervention.types';

export type QueueState = {
  interventions: Intervention[];
  query: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  sortBy: InterventionSort;
  monitoredOnly: boolean;
  selectedId: string | null;
};

export type QueueAction =
  | { type: 'queryChanged'; query: string }
  | { type: 'statusFilterChanged'; status: StatusFilter }
  | { type: 'priorityFilterChanged'; priority: PriorityFilter }
  | { type: 'filtersReset' }
  | { type: 'sortChanged'; sortBy: InterventionSort }
  | { type: 'monitoredFilterChanged'; checked: boolean }
  | { type: 'interventionSelected'; interventionId: string }
  | { type: 'selectionCleared' }
  | { type: 'statusAdvanced'; interventionId: string }
  | { type: 'monitoringToggled'; interventionId: string };

export function createInitialQueueState(
  interventions: Intervention[] = initialInterventions,
): QueueState {
  return {
    interventions: interventions.map((intervention) => ({ ...intervention })),
    query: '',
    statusFilter: 'all',
    priorityFilter: 'all',
    sortBy: 'priority',
    monitoredOnly: false,
    selectedId: null,
  };
}

function nextStatus(status: InterventionStatus): InterventionStatus {
  if (status === 'open') return 'inProgress';
  if (status === 'inProgress') return 'completed';
  return 'completed';
}

export function interventionQueueReducer(
  state: QueueState,
  action: QueueAction,
): QueueState {
  switch (action.type) {
    case 'queryChanged':
      return { ...state, query: action.query };
    case 'statusFilterChanged':
      return { ...state, statusFilter: action.status };
    case 'priorityFilterChanged':
      return { ...state, priorityFilter: action.priority };
    case 'filtersReset':
      return {
        ...state,
        query: '',
        statusFilter: 'all',
        priorityFilter: 'all',
        monitoredOnly: false,
      };
    case 'sortChanged':
      return { ...state, sortBy: action.sortBy };
    case 'monitoredFilterChanged':
      return { ...state, monitoredOnly: action.checked };
    case 'interventionSelected':
      return state.interventions.some(
        (intervention) => intervention.id === action.interventionId,
      )
        ? { ...state, selectedId: action.interventionId }
        : state;
    case 'selectionCleared':
      return { ...state, selectedId: null };
    case 'statusAdvanced': {
      const current = state.interventions.find(
        (intervention) => intervention.id === action.interventionId,
      );
      if (!current || current.status === 'completed') return state;

      return {
        ...state,
        // Solo l'intervento aggiornato riceve un nuovo riferimento.
        interventions: state.interventions.map((intervention) =>
          intervention.id === action.interventionId
            ? { ...intervention, status: nextStatus(intervention.status) }
            : intervention,
        ),
      };
    }
    case 'monitoringToggled':
      return state.interventions.some(
        (intervention) => intervention.id === action.interventionId,
      )
        ? {
          ...state,
          interventions: state.interventions.map((intervention) =>
            intervention.id === action.interventionId
              ? { ...intervention, monitored: !intervention.monitored }
              : intervention,
          ),
        }
        : state;
    default: {
      const exhaustive: never = action;
      return exhaustive;
    }
  }
}

export type { InterventionPriority, InterventionSort, InterventionStatus };
