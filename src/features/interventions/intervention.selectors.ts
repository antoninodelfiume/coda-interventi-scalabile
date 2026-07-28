import type {
  Intervention,
  InterventionSort,
  PriorityFilter,
  QueueSummary,
  StatusFilter,
} from './intervention.types';

const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;

type VisibleInterventionsInput = {
  interventions: Intervention[];
  query: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  monitoredOnly: boolean;
  sortBy: InterventionSort;
};

export function selectVisibleInterventions({
  interventions,
  query,
  statusFilter,
  priorityFilter,
  monitoredOnly,
  sortBy,
}: VisibleInterventionsInput): Intervention[] {
  const normalizedQuery = query.trim().toLocaleLowerCase('it-IT');

  const matchesFilters = (intervention: Intervention) => {
    const searchableText = [
      intervention.id,
      intervention.title,
      intervention.site,
      intervention.team,
    ]
      .join(' ')
      .toLocaleLowerCase('it-IT');

    const matchesQuery = searchableText.includes(normalizedQuery);
    const matchesStatus =
      statusFilter === 'all' || intervention.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'all' || intervention.priority === priorityFilter;
    const matchesMonitoring = !monitoredOnly || intervention.monitored;

    return matchesQuery && matchesStatus && matchesPriority && matchesMonitoring;
  };

  // TODO 02: sort modifica l'array ricevuto e il ramo "site" confronta il
  // team. Correggere il campo e produrre sempre un nuovo array ordinato.
  return interventions.sort((first, second) => {
    if (sortBy === 'priority') {
      return (
        priorityRank[first.priority] - priorityRank[second.priority] ||
        first.dueAt.localeCompare(second.dueAt)
      );
    }
    if (sortBy === 'dueDate') {
      return first.dueAt.localeCompare(second.dueAt);
    }
    return (
      first.team.localeCompare(second.team, 'it-IT') ||
      first.dueAt.localeCompare(second.dueAt)
    );
  }).filter(matchesFilters);
}

export function summarizeInterventions(
  interventions: Intervention[],
): QueueSummary {
  return interventions.reduce<QueueSummary>(
    (summary, intervention) => {
      summary.total += 1;
      summary[intervention.status] += 1;
      if (intervention.priority === 'critical') summary.critical += 1;
      return summary;
    },
    { total: 0, open: 0, inProgress: 0, completed: 0, critical: 0 },
  );
}

export function selectInterventionById(
  interventions: Intervention[],
  interventionId: string | null,
) {
  if (!interventionId) return null;
  return (
    interventions.find((intervention) => intervention.id === interventionId) ??
    null
  );
}
