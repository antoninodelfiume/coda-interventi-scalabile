import type { Intervention } from './intervention.types';
import {
  createInitialQueueState,
  interventionQueueReducer,
} from './interventionQueueReducer';

const interventions: Intervention[] = [
  {
    id: 'INT-1',
    title: 'Controllo quadro',
    site: 'Milano',
    team: 'Impianti',
    priority: 'critical',
    status: 'open',
    dueAt: '2026-08-01',
    monitored: false,
  },
  {
    id: 'INT-2',
    title: 'Verifica badge',
    site: 'Torino',
    team: 'Sicurezza',
    priority: 'medium',
    status: 'completed',
    dueAt: '2026-08-02',
    monitored: true,
  },
];

describe('interventionQueueReducer', () => {
  it('aggiorna i filtri e li reimposta senza sostituire gli interventi', () => {
    const state = createInitialQueueState(interventions);
    const filtered = interventionQueueReducer(
      interventionQueueReducer(state, { type: 'queryChanged', query: 'badge' }),
      { type: 'statusFilterChanged', status: 'completed' },
    );
    const reset = interventionQueueReducer(filtered, { type: 'filtersReset' });

    expect(reset.query).toBe('');
    expect(reset.statusFilter).toBe('all');
    expect(reset.interventions).toBe(filtered.interventions);
  });

  it('seleziona soltanto un id presente', () => {
    const state = createInitialQueueState(interventions);
    const selected = interventionQueueReducer(state, {
      type: 'interventionSelected',
      interventionId: 'INT-1',
    });
    const unknown = interventionQueueReducer(selected, {
      type: 'interventionSelected',
      interventionId: 'INT-99',
    });

    expect(selected.selectedId).toBe('INT-1');
    expect(unknown).toBe(selected);
  });

  it('fa avanzare lo stato e conserva il riferimento degli altri record', () => {
    const state = createInitialQueueState(interventions);
    const inProgress = interventionQueueReducer(state, {
      type: 'statusAdvanced',
      interventionId: 'INT-1',
    });
    const completed = interventionQueueReducer(inProgress, {
      type: 'statusAdvanced',
      interventionId: 'INT-1',
    });

    expect(inProgress.interventions[0].status).toBe('inProgress');
    expect(completed.interventions[0].status).toBe('completed');
    expect(inProgress.interventions[1]).toBe(state.interventions[1]);
    expect(state.interventions[0].status).toBe('open');
  });

  it("ignora l'avanzamento di un intervento completato", () => {
    const state = createInitialQueueState(interventions);
    const result = interventionQueueReducer(state, {
      type: 'statusAdvanced',
      interventionId: 'INT-2',
    });

    expect(result).toBe(state);
  });

  it('inverte il monitoraggio senza mutare il record sorgente', () => {
    const state = createInitialQueueState(interventions);
    const result = interventionQueueReducer(state, {
      type: 'monitoringToggled',
      interventionId: 'INT-1',
    });

    expect(result.interventions[0].monitored).toBe(true);
    expect(state.interventions[0].monitored).toBe(false);
  });
});
