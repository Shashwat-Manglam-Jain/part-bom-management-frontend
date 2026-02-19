import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { PartSummary } from '../../../shared/types/partBom';
import { panelSx } from './panelStyles';

interface PartDetailsHeaderProps {
  selectedPart: PartSummary | null;
  onOpenPartSelector: () => void;
}

export function PartDetailsHeader({
  selectedPart,
  onOpenPartSelector,
}: PartDetailsHeaderProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...panelSx,
        display: 'flex',
        alignItems: { xs: 'flex-start', sm: 'center' },
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        gap: 1.5,
      }}
    >
      <Box>
        <Typography variant="h6">Part Details</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          {selectedPart
            ? `${selectedPart.partNumber} - ${selectedPart.name}`
            : 'Select a part to view details.'}
        </Typography>
      </Box>
      <Button
        type="button"
        variant="outlined"
        size="small"
        onClick={() => {
          onOpenPartSelector();
        }}
      >
        Search Parts
      </Button>
    </Paper>
  );
}
