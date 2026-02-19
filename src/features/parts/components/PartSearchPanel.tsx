import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Icon from '@mui/material/Icon';
import InputAdornment from '@mui/material/InputAdornment';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { PartSummary } from '../../../shared/types/partBom';
import { panelSx, sectionHeaderSx } from './panelStyles';

interface PartSearchPanelProps {
  mode?: 'sidebar' | 'workspace';
  onBackToWorkspace?: () => void;
  searchInput: string;
  onSearchInputChange: (nextValue: string) => void;
  searchLoading: boolean;
  searchError: string | null;
  parts: PartSummary[];
  selectedPartId: string | null;
  onSelectPart: (partId: string) => void;
}

export function PartSearchPanel({
  mode = 'sidebar',
  onBackToWorkspace,
  searchInput,
  onSearchInputChange,
  searchLoading,
  searchError,
  parts,
  selectedPartId,
  onSelectPart,
}: PartSearchPanelProps) {
  const isBusy = searchLoading;
  const isWorkspaceMode = mode === 'workspace';

  return (
    <Paper elevation={0} sx={{ ...panelSx, overflow: 'hidden' }}>
      {isWorkspaceMode ? (
        <Box
          sx={{
            ...sectionHeaderSx,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="h6">Part Search</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              Select a part to return to your current workspace.
            </Typography>
          </Box>
          {onBackToWorkspace ? (
            <Button
              type="button"
              variant="outlined"
              onClick={onBackToWorkspace}
              disabled={isBusy}
            >
              Back
            </Button>
          ) : null}
        </Box>
      ) : (
        <Box sx={sectionHeaderSx}>
          <Typography variant="h6">Part Search</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Find parts by part number or name.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 2 }}>
        <TextField
          size="small"
          fullWidth
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Try PRT-000011 or Controller"
          aria-label="Search parts"
          helperText="Search updates automatically while you type."
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Icon baseClassName="material-symbols-rounded" sx={{ fontSize: 18 }}>
                    search
                  </Icon>
                </InputAdornment>
              ),
              endAdornment: isBusy ? (
                <InputAdornment position="end">
                  <CircularProgress size={14} />
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </Box>

      {searchError ? <Alert severity="error" sx={{ mt: 1.5 }}>{searchError}</Alert> : null}

      <List
        sx={{
          mt: 1.5,
          maxHeight: isWorkspaceMode
            ? { xs: 340, sm: 420, lg: 520 }
            : { xs: 260, sm: 320, lg: 360 },
          overflow: 'auto',
          py: 0,
          pr: 0.5,
        }}
      >
        {parts.map((part) => (
          <ListItem key={part.id} disablePadding sx={{ mb: 0.7 }}>
            <ListItemButton
              selected={selectedPartId === part.id}
              onClick={() => onSelectPart(part.id)}
              sx={{
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: selectedPartId === part.id ? 'primary.main' : 'divider',
                backgroundColor: (theme) =>
                  selectedPartId === part.id
                    ? alpha(theme.palette.primary.main, 0.14)
                    : alpha(theme.palette.background.paper, 0.86),
                '&:hover': {
                  backgroundColor: (theme) =>
                    selectedPartId === part.id
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.text.primary, 0.05),
                },
              }}
            >
              <ListItemText
                primary={part.name}
                secondary={part.partNumber}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {!searchLoading && parts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No parts matched your search.
        </Typography>
      ) : null}
    </Paper>
  );
}
