import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { InterventionQueuePage } from './features/interventions/components/InterventionQueuePage';
import { appTheme } from './theme';

// TODO 06: permettere ad App di ricevere un dataset opzionale senza cambiare
// il comportamento predefinito dei test che usano i 24 record originali.
export function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <InterventionQueuePage />
    </ThemeProvider>
  );
}
