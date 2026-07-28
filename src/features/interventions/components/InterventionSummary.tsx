import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { QueueSummary } from "../intervention.types";

const metrics: Array<{ key: keyof QueueSummary; label: string }> = [
  { key: "total", label: "Totali" },
  { key: "open", label: "Aperti" },
  { key: "inProgress", label: "In lavorazione" },
  { key: "completed", label: "Completati" },
  { key: "critical", label: "Critici" },
];

export function InterventionSummary({ summary }: { summary: QueueSummary }) {
  return (
    <Paper
      component="section"
      aria-label="Riepilogo interventi"
      variant="outlined"
    >
      <Typography component="h2" variant="h2" sx={{ px: 2.5, pt: 2.5 }}>
        Riepilogo
      </Typography>
      <Paper
        elevation={0}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
          p: 2.5,
          gap: 2,
        }}
      >
        {metrics.map((metric) => (
          <div key={metric.key}>
            <Typography component="p" variant="h2" color="primary.main">
              {summary[metric.key]}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {metric.label}
            </Typography>
          </div>
        ))}
      </Paper>
    </Paper>
  );
}
