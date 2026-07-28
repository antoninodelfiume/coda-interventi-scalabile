import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import {
  initialInterventions,
  createInterventionDataset,
} from "./features/interventions/interventions.fixture";
afterEach(() => {
  window.history.replaceState(null, "", "/");
});
async function renderApp() {
  await render(<App interventions={initialInterventions} />);
  await screen.findByRole("table", { name: "Coda interventi tecnici" });
}
describe("Coda interventi scalabile: smoke test dello starter", () => {
  it("genera dataset deterministici con id univoci", () => {
    const firstDataset = createInterventionDataset(48);
    const secondDataset = createInterventionDataset(48);

    expect(firstDataset).toEqual(secondDataset);
    expect(new Set(firstDataset.map((item) => item.id))).toHaveProperty(
      "size",
      48,
    );
  });
  it("mostra i 24 interventi iniziali", async () => {
    await render(<App interventions={initialInterventions} />);

    expect(
      screen.getByRole("heading", { name: "Coda interventi scalabile" }),
    ).toBeInTheDocument();
    expect(screen.getByText("24 interventi visibili")).toBeInTheDocument();
    expect(
      screen.getByText("Ripristino gruppo di continuità"),
    ).toBeInTheDocument();
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

  it("mostra un fallback locale mentre carica il primo dettaglio", async () => {
    const user = userEvent.setup();
    window.history.replaceState(null, "", "/?scenario=slow-sections");
    await render(<App interventions={initialInterventions} />);
    await user.click(
      screen.getByRole("button", { name: "Mostra dettaglio INT-1048" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Caricamento dettaglio...",
    );
    expect(
      await screen.findByRole("heading", {
        name: "Ripristino gruppo di continuità",
      }),
    ).toHaveFocus();
  });
  it("mantiene disponibile la ricerca per titolo", async () => {
    const user = userEvent.setup();
    await render(<App interventions={initialInterventions} />);

    await user.type(
      screen.getByRole("textbox", { name: "Cerca interventi" }),
      "citofono",
    );

    expect(screen.getByText("1 intervento visibile")).toBeInTheDocument();
    expect(
      screen.getByText("Ripristino citofono reception"),
    ).toBeInTheDocument();
  });
  it("chiude il dettaglio se la ricerca nasconde il record selezionato", async () => {
    const user = userEvent.setup();
    await render(<App interventions={initialInterventions} />);

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

  it("seleziona, aggiorna e chiude il dettaglio", async () => {
    const user = userEvent.setup();
    render(<App interventions={initialInterventions} />);

    const detailTrigger = screen.getByRole("button", {
      name: "Mostra dettaglio INT-1048",
    });
    await user.click(detailTrigger);
    expect(
      screen.getByRole("heading", { name: "Ripristino gruppo di continuità" }),
    ).toHaveFocus();
    await user.click(screen.getByRole("button", { name: "Chiudi dettaglio" }));
    expect(
      screen.getByText(
        "Seleziona una riga per consultare i dati e aggiornare lo stato.",
      ),
    ).toBeInTheDocument();
    expect(detailTrigger).toHaveFocus();
  });
});
