import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { InterventionQueuePage } from './features/interventions/components/InterventionQueuePage';
import { appTheme } from './theme';

import type { Intervention } from './features/interventions/intervention.types';
import { createInterventionDataset } from './features/interventions/interventions.fixture';

const defaultInterventions = createInterventionDataset(1_200);

type AppProps = {
  interventions?: Intervention[];
};
export function App({ interventions = defaultInterventions }: AppProps) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <InterventionQueuePage initialInterventions={interventions} />
    </ThemeProvider>
  );
}