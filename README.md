# Coda interventi scalabile: starter

Lo starter conserva la struttura e le funzioni completate in `progetto3`.
Contiene otto TODO guidati e alcuni difetti funzionali intenzionali. Compila e
supera gli smoke test prima delle modifiche.

## Avvio

```bash
nvm use
npm ci
npm run check
npm run dev
```

Apri poi il [brief del Modulo 3 bis](../../documentazione/brief-modulo-3bis.md).

## Stato iniziale

- La ricerca funziona solo in alcuni casi.
- L'ordinamento per sede produce un risultato errato.
- Tabella e dettaglio fanno parte del bundle iniziale.
- Il dettaglio può restare aperto dopo un filtro.
- La pagina usa 24 record e monta tutte le righe.
- Il ritorno del focus presume che la riga sia ancora nel DOM.

Questi difetti non indicano una build rotta. Sono il materiale del laboratorio.

## Vincoli

- Non spostare o rinominare file.
- Non aggiungere dipendenze.
- Conservare i 24 record originali per i test mirati.
- Scrivere un test di regressione per ogni comportamento corretto.
- Eseguire `npm run check` a ogni checkpoint.

Per osservare i fallback dopo il TODO 05, usa:

```text
http://localhost:5173/?scenario=slow-sections
```
