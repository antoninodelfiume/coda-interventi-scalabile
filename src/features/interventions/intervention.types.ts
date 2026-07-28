export type InterventionStatus = 'open' | 'inProgress' | 'completed';

export type InterventionPriority = 'critical' | 'high' | 'medium' | 'low';

export type InterventionSort = 'priority' | 'dueDate' | 'site';

export type Intervention = {
  id: string;
  title: string;
  site: string;
  team: string;
  priority: InterventionPriority;
  status: InterventionStatus;
  dueAt: string;
  monitored: boolean;
};

export type StatusFilter = InterventionStatus | 'all';
export type PriorityFilter = InterventionPriority | 'all';

export type QueueSummary = {
  total: number;
  open: number;
  inProgress: number;
  completed: number;
  critical: number;
};

export const statusLabels: Record<InterventionStatus, string> = {
  open: 'Aperto',
  inProgress: 'In lavorazione',
  completed: 'Completato',
};

export const priorityLabels: Record<InterventionPriority, string> = {
  critical: 'Critica',
  high: 'Alta',
  medium: 'Media',
  low: 'Bassa',
};

export const sortLabels: Record<InterventionSort, string> = {
  priority: 'Priorità',
  dueDate: 'Scadenza',
  site: 'Sede',
};
