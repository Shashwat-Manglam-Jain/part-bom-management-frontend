import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

interface DetailStatProps {
  label: string;
  value: string | number;
}

export function DetailStat({ label, value }: DetailStatProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1,
        borderRadius: 2,
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.14),
        backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.2),
      }}
    >
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.4, fontWeight: 600 }}>
        {value}
      </Typography>
    </Paper>
  );
}
