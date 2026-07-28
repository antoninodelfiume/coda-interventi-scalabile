import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import {
  createInterventionDataset,
  initialInterventions,
} from "./features/interventions/interventions.fixture";

afterEach(() => {
  window.history.replaceState(null, "", "/");
});

async function renderApp(interventions = initialInterventions) {
  render(<App interventions={interventions} />);
  await screen.findByRole("table", { name: "Coda interventi tecnici" });
}

async function chooseOption(label: string, option: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(screen.getByRole("option", { name: option }));
}

describe("Coda interventi scalabile", () => {
  it("genera dataset deterministici con id univoci", () => {
    const firstDataset = createInterventionDataset(48);
    const secondDataset = createInterventionDataset(48);

    expect(firstDataset).toEqual(secondDataset);
    expect(new Set(firstDataset.map((item) => item.id))).toHaveProperty(
      "size",
      48,
    );
  });

  it("mantiene la shell disponibile durante il caricamento della tabella", async () => {
    window.history.replaceState(null, "", "/?scenario=slow-sections");
    render(<App interventions={initialInterventions} />);

    expect(
      screen.getByRole("heading", { name: "Coda interventi scalabile" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Caricamento tabella...",
    );
    expect(
      await screen.findByRole("table", { name: "Coda interventi tecnici" }),
    ).toBeInTheDocument();
  });

  it("mostra la shell e i 24 interventi iniettati dai test", async () => {
    await renderApp();

    expect(
      screen.getByRole("heading", { name: "Coda interventi scalabile" }),
    ).toBeInTheDocument();
    expect(screen.getByText("24 interventi visibili")).toBeInTheDocument();
    expect(
      screen.getByText("Ripristino gruppo di continuità"),
    ).toBeInTheDocument();
  });

  it("mostra un fallback locale mentre carica il primo dettaglio", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/?scenario=slow-sections");
    await renderApp();

    const detailTrigger = screen.getByRole("button", {
      name: "Mostra dettaglio INT-1048",
    });
    await user.click(detailTrigger);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Caricamento dettaglio...",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Ripristino gruppo di continuità",
      }),
    ).toHaveFocus();
  });

  it("cerca per team ignorando maiuscole e spazi esterni", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.type(
      screen.getByRole("textbox", { name: "Cerca interventi" }),
      "  IMPIANTI ELETTRICI  ",
    );
    await chooseOption("Stato", "Aperto");
    await chooseOption("Priorità", "Critica");

    expect(screen.getByText("1 intervento visibile")).toBeInTheDocument();
    expect(
      screen.getByText("Ripristino gruppo di continuità"),
    ).toBeInTheDocument();
  });

  it("ordina gli interventi per sede", async () => {
    await renderApp();
    await chooseOption("Ordina per", "Sede");

    const rows = within(
      screen.getByRole("table", { name: "Coda interventi tecnici" }),
    ).getAllByRole("row");
    expect(rows[1]).toHaveTextContent("Bari Murat");
  });

  it("chiude il dettaglio se la ricerca nasconde il record selezionato", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(
      screen.getByRole("button", { name: "Mostra dettaglio INT-1048" }),
    );
    expect(
      await screen.findByRole("heading", {
        name: "Ripristino gruppo di continuità",
      }),
    ).toHaveFocus();

    const search = screen.getByRole("textbox", { name: "Cerca interventi" });
    await user.type(search, "serratura ingresso nord");

    expect(
      await screen.findByText(
        "Seleziona una riga per consultare i dati e aggiornare lo stato.",
      ),
    ).toBeInTheDocument();
    expect(search).toHaveFocus();
  });

  it("mantiene il focus sull'azione quando aggiorna il record selezionato", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(
      screen.getByRole("button", { name: "Mostra dettaglio INT-1048" }),
    );
    const advanceButton = await screen.findByRole("button", {
      name: "Prendi in carico",
    });
    await user.click(advanceButton);

    expect(
      screen.getByRole("button", { name: "Completa intervento" }),
    ).toHaveFocus();
  });

  it("porta il focus sul pannello vuoto se un aggiornamento nasconde il record", async () => {
    const user = userEvent.setup();
    await renderApp();
    await chooseOption("Stato", "Aperto");

    await user.click(
      screen.getByRole("button", { name: "Mostra dettaglio INT-1048" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Prendi in carico" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Dettaglio intervento" }),
    ).toHaveFocus();
  });

  it("renderizza una finestra limitata per 1.200 record", async () => {
    await renderApp(createInterventionDataset(1_200));

    expect(screen.getByText("1200 interventi visibili")).toBeInTheDocument();
    expect(screen.getAllByTestId("intervention-data-row").length).toBeLessThan(
      20,
    );
  });

  it("torna all'inizio quando un filtro riduce una lista già scorsa", async () => {
    const user = userEvent.setup();
    await renderApp(createInterventionDataset(1_200));
    const container = screen.getByTestId("intervention-scroll-container");

    fireEvent.scroll(container, { target: { scrollTop: 30_000 } });
    expect(
      screen.queryByText("Ripristino gruppo di continuità"),
    ).not.toBeInTheDocument();

    await user.type(
      screen.getByRole("textbox", { name: "Cerca interventi" }),
      "INT-1048",
    );

    expect(
      await screen.findByText("1 intervento visibile"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ripristino gruppo di continuità"),
    ).toBeInTheDocument();
    expect(container).toHaveProperty("scrollTop", 0);
  });

  it("mantiene le azioni collegate al record dopo lo scroll", async () => {
    const user = userEvent.setup();
    await renderApp(createInterventionDataset(1_200));
    const container = screen.getByTestId("intervention-scroll-container");

    fireEvent.scroll(container, { target: { scrollTop: 25 * 76 } });
    const actionButton = screen
      .getAllByRole("button", {
        name: /^(Monitora|Rimuovi dal monitoraggio) INT-\d+$/,
      })
      .at(0);

    expect(actionButton).toBeDefined();
    const actionName = actionButton?.getAttribute("aria-label") ?? "";
    const interventionId = actionName.match(/INT-\d+/)?.at(0);
    expect(interventionId).toBeDefined();

    await user.click(actionButton!);

    expect(
      screen.getByRole("button", {
        name: actionName.startsWith("Monitora")
          ? `Rimuovi dal monitoraggio ${interventionId}`
          : `Monitora ${interventionId}`,
      }),
    ).toBeInTheDocument();
  });

  it("rimonta la riga e ripristina il focus quando chiude il dettaglio", async () => {
    const user = userEvent.setup();
    await renderApp(createInterventionDataset(1_200));
    const detailTrigger = screen.getByRole("button", {
      name: "Mostra dettaglio INT-1048",
    });

    await user.click(detailTrigger);
    await screen.findByRole("heading", {
      name: "Ripristino gruppo di continuità",
    });

    const container = screen.getByTestId("intervention-scroll-container");
    fireEvent.scroll(container, { target: { scrollTop: 20_000 } });
    expect(
      screen.queryByRole("button", { name: "Mostra dettaglio INT-1048" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Chiudi dettaglio" }));

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Mostra dettaglio INT-1048" }),
      ).toHaveFocus(),
    );
  });
});
