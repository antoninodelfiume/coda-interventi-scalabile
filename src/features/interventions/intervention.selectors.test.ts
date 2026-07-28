import type { Intervention } from './intervention.types';
import {
  selectVisibleInterventions,
  summarizeInterventions,
} from './intervention.selectors';

const interventions: Intervention[] = [
  { id: 'INT-1', title: 'Controllo rete', site: 'Torino', team: 'IT', priority: 'medium', status: 'open', dueAt: '2026-08-03', monitored: false },
  { id: 'INT-2', title: 'Perdita idrica', site: 'Milano', team: 'Impianti', priority: 'critical', status: 'inProgress', dueAt: '2026-08-01', monitored: true },
  { id: 'INT-3', title: 'Verifica badge', site: 'Bari', team: 'Sicurezza', priority: 'high', status: 'completed', dueAt: '2026-08-02', monitored: false },
];

describe('intervention selectors', () => {
  it('cerca per id, sede e team ignorando maiuscole e spazi esterni', () => {
    const input = {
      interventions,
      statusFilter: 'all' as const,
      priorityFilter: 'all' as const,
      monitoredOnly: false,
      sortBy: 'priority' as const,
    };

    expect(
      selectVisibleInterventions({ ...input, query: '  int-2  ' })[0].id,
    ).toBe('INT-2');
    expect(
      selectVisibleInterventions({ ...input, query: '  MILANO  ' })[0].id,
    ).toBe('INT-2');
    expect(
      selectVisibleInterventions({ ...input, query: '  impianti  ' })[0].id,
    ).toBe('INT-2');
  });
  it('combina filtri e monitoraggio', () => {
    const result = selectVisibleInterventions({
      interventions,
      query: '',
      statusFilter: 'inProgress',
      priorityFilter: 'critical',
      monitoredOnly: true,
      sortBy: 'priority',
    });

    expect(result.map((item) => item.id)).toEqual(['INT-2']);
  });

  it('ordina per priorità', () => {
    const sourceOrder = interventions.map((item) => item.id);

    const result = selectVisibleInterventions({
      interventions,
      query: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      monitoredOnly: false,
      sortBy: 'priority',
    });
    expect(result.map((item) => item.id)).toEqual(['INT-2', 'INT-3', 'INT-1']);
    expect(interventions.map((item) => item.id)).toEqual(sourceOrder);

  });

  it('ordina per sede senza mutare la lista sorgente', () => {
    const sourceOrder = interventions.map((item) => item.id);
    const result = selectVisibleInterventions({
      interventions,
      query: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      monitoredOnly: false,
      sortBy: 'site',
    });

    expect(result.map((item) => item.site)).toEqual([
      'Bari',
      'Milano',
      'Torino',
    ]);
    expect(interventions.map((item) => item.id)).toEqual(sourceOrder);
  });

  it('calcola il riepilogo dagli interventi', () => {
    expect(summarizeInterventions(interventions)).toEqual({
      total: 3,
      open: 1,
      inProgress: 1,
      completed: 1,
      critical: 1,
    });
  });
});
