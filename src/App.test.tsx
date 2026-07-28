import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
async function renderApp() {
  await renderApp();
  await screen.findByRole("table", { name: "Coda interventi tecnici" });
}
describe("Coda interventi scalabile: smoke test dello starter", () => {
  it("mostra i 24 interventi iniziali", async () => {
    await renderApp();

    expect(
      screen.getByRole("heading", { name: "Coda interventi scalabile" }),
    ).toBeInTheDocument();
    expect(screen.getByText("24 interventi visibili")).toBeInTheDocument();
    expect(
      screen.getByText("Ripristino gruppo di continuità"),
    ).toBeInTheDocument();
  });

  it("mantiene disponibile la ricerca per titolo", async () => {
    const user = userEvent.setup();
    await renderApp();

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

  it("seleziona, aggiorna e chiude il dettaglio", async () => {
    const user = userEvent.setup();
    render(<App />);

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
