import type { Intervention } from './intervention.types';

/** Dati locali stabili: il laboratorio non dipende da rete o timer. */
export const initialInterventions: Intervention[] = [
  { id: 'INT-1048', title: 'Ripristino gruppo di continuità', site: 'Milano Porta Nuova', team: 'Impianti elettrici', priority: 'critical', status: 'open', dueAt: '2026-08-03', monitored: true },
  { id: 'INT-1049', title: 'Verifica sensori sala server', site: 'Torino Lingotto', team: 'Infrastruttura IT', priority: 'high', status: 'inProgress', dueAt: '2026-08-04', monitored: true },
  { id: 'INT-1050', title: 'Sostituzione serratura ingresso nord', site: 'Bologna Fiera', team: 'Sicurezza', priority: 'medium', status: 'open', dueAt: '2026-08-06', monitored: false },
  { id: 'INT-1051', title: 'Controllo climatizzazione terzo piano', site: 'Bari Murat', team: 'Climatizzazione', priority: 'high', status: 'open', dueAt: '2026-08-05', monitored: false },
  { id: 'INT-1052', title: 'Taratura badge tornello visitatori', site: 'Milano Porta Nuova', team: 'Sicurezza', priority: 'low', status: 'completed', dueAt: '2026-07-28', monitored: false },
  { id: 'INT-1053', title: 'Perdita idrica area ristoro', site: 'Roma Eur', team: 'Impianti idraulici', priority: 'critical', status: 'inProgress', dueAt: '2026-08-02', monitored: true },
  { id: 'INT-1054', title: 'Aggiornamento firmware sale riunioni', site: 'Torino Lingotto', team: 'Supporto audiovisivo', priority: 'medium', status: 'open', dueAt: '2026-08-09', monitored: false },
  { id: 'INT-1055', title: 'Riparazione porta tagliafuoco', site: 'Bologna Fiera', team: 'Manutenzione edile', priority: 'high', status: 'inProgress', dueAt: '2026-08-03', monitored: false },
  { id: 'INT-1056', title: 'Verifica illuminazione di emergenza', site: 'Bari Murat', team: 'Impianti elettrici', priority: 'medium', status: 'completed', dueAt: '2026-07-30', monitored: false },
  { id: 'INT-1057', title: 'Sostituzione access point piano terra', site: 'Roma Eur', team: 'Infrastruttura IT', priority: 'high', status: 'open', dueAt: '2026-08-07', monitored: true },
  { id: 'INT-1058', title: 'Regolazione tende sala formazione', site: 'Milano Porta Nuova', team: 'Manutenzione edile', priority: 'low', status: 'open', dueAt: '2026-08-12', monitored: false },
  { id: 'INT-1059', title: 'Controllo estintori deposito', site: 'Torino Lingotto', team: 'Sicurezza', priority: 'medium', status: 'completed', dueAt: '2026-07-31', monitored: false },
  { id: 'INT-1060', title: 'Rumore anomalo unità esterna', site: 'Bologna Fiera', team: 'Climatizzazione', priority: 'high', status: 'open', dueAt: '2026-08-05', monitored: true },
  { id: 'INT-1061', title: 'Sblocco ascensore merci', site: 'Bari Murat', team: 'Impianti elevatori', priority: 'critical', status: 'completed', dueAt: '2026-07-29', monitored: false },
  { id: 'INT-1062', title: 'Cablaggio postazioni area legale', site: 'Roma Eur', team: 'Infrastruttura IT', priority: 'medium', status: 'inProgress', dueAt: '2026-08-08', monitored: false },
  { id: 'INT-1063', title: 'Ripristino citofono reception', site: 'Milano Porta Nuova', team: 'Impianti elettrici', priority: 'low', status: 'open', dueAt: '2026-08-11', monitored: false },
  { id: 'INT-1064', title: 'Sostituzione pompa circuito secondario', site: 'Torino Lingotto', team: 'Climatizzazione', priority: 'critical', status: 'open', dueAt: '2026-08-03', monitored: true },
  { id: 'INT-1065', title: 'Ripristino segnaletica parcheggio', site: 'Bologna Fiera', team: 'Manutenzione edile', priority: 'low', status: 'completed', dueAt: '2026-07-27', monitored: false },
  { id: 'INT-1066', title: 'Verifica allarme porta archivio', site: 'Bari Murat', team: 'Sicurezza', priority: 'high', status: 'inProgress', dueAt: '2026-08-04', monitored: true },
  { id: 'INT-1067', title: 'Sostituzione microfono sala consiglio', site: 'Roma Eur', team: 'Supporto audiovisivo', priority: 'medium', status: 'open', dueAt: '2026-08-10', monitored: false },
  { id: 'INT-1068', title: 'Controllo quadro elettrico zona ovest', site: 'Milano Porta Nuova', team: 'Impianti elettrici', priority: 'critical', status: 'inProgress', dueAt: '2026-08-02', monitored: true },
  { id: 'INT-1069', title: 'Pulizia filtri unità interne', site: 'Torino Lingotto', team: 'Climatizzazione', priority: 'low', status: 'open', dueAt: '2026-08-14', monitored: false },
  { id: 'INT-1070', title: 'Configurazione monitor reception', site: 'Bologna Fiera', team: 'Supporto audiovisivo', priority: 'medium', status: 'completed', dueAt: '2026-07-30', monitored: false },
  { id: 'INT-1071', title: 'Riparazione perdita lavabo accessibile', site: 'Bari Murat', team: 'Impianti idraulici', priority: 'high', status: 'open', dueAt: '2026-08-06', monitored: false },
];

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function createInterventionDataset(size: number): Intervention[] {
  const safeSize = Math.max(0, Math.floor(size));

  return Array.from({ length: safeSize }, (_, index) => {
    const template = initialInterventions[index % initialInterventions.length];
    const batch = Math.floor(index / initialInterventions.length);

    return {
      ...template,
      id: `INT-${1048 + index}`,
      title:
        batch === 0 ? template.title : `${template.title}, lotto ${batch + 1}`,
      dueAt: addDays(template.dueAt, batch * 2),
      monitored: (index + batch) % 5 === 0,
    };
  });
}