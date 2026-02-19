import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { PartDetails, PartSummary } from '../../../shared/types/partBom';
import { ReactSparkIcon } from '../../../shared/ui/ReactGlyphs';
import { panelSx, subtleCardSx } from './panelStyles';

export type PartsViewMode = 'details' | 'bom' | 'audit' | 'create';

interface PartsSidebarProps {
  activeView: PartsViewMode;
  onChangeView: (nextView: PartsViewMode) => void;
  isSelectorPageOpen: boolean;
  selectedPart: PartSummary | null;
  selectedPartDetails: PartDetails | null;
  partsCount: number;
  onOpenPartSelector: () => void;
  onOpenCreatePage: () => void;
}

interface ViewOption {
  id: PartsViewMode;
  label: string;
  description: string;
  icon: string;
}

const viewOptions: ViewOption[] = [
  {
    id: 'details',
    label: 'Part Details',
    description: 'View specification and relation counts for selected part.',
    icon: 'description',
  },
  {
    id: 'bom',
    label: 'BOM Manager',
    description: 'Create, update, and delete child links per selected part.',
    icon: 'account_tree',
  },
  {
    id: 'audit',
    label: 'Audit Logs',
    description: 'Monitor per-part change history and timestamps.',
    icon: 'history',
  },
];

export function PartsSidebar({
  activeView,
  onChangeView,
  isSelectorPageOpen,
  selectedPart,
  selectedPartDetails,
  partsCount,
  onOpenPartSelector,
  onOpenCreatePage,
}: PartsSidebarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        ...panelSx,
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 1.3, md: 1.55 },
      }}
    >
      <Box
        sx={{
          p: 1.1,
          borderRadius: 2,
          border: '1px solid',
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
          background: (theme) =>
            `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
        }}
      >
        <Typography
          variant="overline"
          sx={{ letterSpacing: '0.09em', fontWeight: 700, color: 'text.secondary' }}
        >
          Control Center
        </Typography>
        <Typography variant="h6" sx={{ mt: 0.2, color: 'text.primary' }}>
          Navigation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          Open one page at a time for a cleaner workflow.
        </Typography>
      </Box>
      <Divider sx={{ my: 1.4 }} />
      <Stack spacing={1.2} sx={{ mt: 1.4 }}>
        {viewOptions.map((option) => {
          const isActive = !isSelectorPageOpen && activeView === option.id;

          return (
            <Button
              key={option.id}
              type="button"
              onClick={() => onChangeView(option.id)}
              startIcon={(
                <Icon baseClassName="material-symbols-rounded" sx={{ fontSize: 18 }}>
                  {option.icon}
                </Icon>
              )}
              sx={{
                width: '100%',
                justifyContent: 'flex-start',
                textAlign: 'left',
                borderRadius: 2,
                py: 0.95,
                px: 1.15,
                border: '1px solid',
                borderColor: isActive
                  ? 'primary.main'
                  : 'divider',
                color: 'text.primary',
                backgroundColor: (theme) =>
                  isActive
                    ? alpha(theme.palette.primary.main, 0.12)
                    : theme.palette.background.paper,
                boxShadow: (theme) =>
                  isActive ? `inset 3px 0 0 ${theme.palette.primary.main}` : 'none',
                transition: 'all 120ms ease',
                '&:hover': {
                  backgroundColor: (theme) =>
                    isActive
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.text.primary, 0.04),
                },
              }}
            >
              <Box sx={{ textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {option.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', lineHeight: 1.45 }}
                >
                  {option.description}
                </Typography>
              </Box>
            </Button>
          );
        })}
      </Stack>

      <Divider sx={{ my: 2.4 }} />

      <Typography variant="subtitle2">Quick Actions</Typography>
      <Stack spacing={1.4} sx={{ mt: 1 }}>
        <Button
          type="button"
          variant={isSelectorPageOpen ? 'contained' : 'outlined'}
          onClick={() => {
            onOpenPartSelector();
          }}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            color: isSelectorPageOpen ? 'common.white' : 'text.primary',
            borderColor: isSelectorPageOpen ? 'primary.main' : 'divider',
            backgroundColor: isSelectorPageOpen ? 'primary.main' : 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: (theme) =>
                isSelectorPageOpen
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.1),
              boxShadow: 'none',
            },
          }}
          startIcon={(
            <Icon baseClassName="material-symbols-rounded" sx={{ fontSize: 18 }}>
              search
            </Icon>
          )}
        >
          Search Parts
        </Button>
        <Button
          type="button"
          variant={!isSelectorPageOpen && activeView === 'create' ? 'contained' : 'outlined'}
          onClick={() => {
            onOpenCreatePage();
          }}
          sx={{
            width: '100%',
            justifyContent: 'flex-start',
            color:
              !isSelectorPageOpen && activeView === 'create'
                ? 'common.white'
                : 'text.primary',
            borderColor:
              !isSelectorPageOpen && activeView === 'create'
                ? 'primary.main'
                : 'divider',
            backgroundColor:
              !isSelectorPageOpen && activeView === 'create'
                ? 'primary.main'
                : 'transparent',
            boxShadow: 'none',
            '&:hover': {
              backgroundColor: (theme) =>
                !isSelectorPageOpen && activeView === 'create'
                  ? theme.palette.primary.dark
                  : alpha(theme.palette.primary.main, 0.1),
              boxShadow: 'none',
            },
          }}
          startIcon={<ReactSparkIcon sx={{ fontSize: 18 }} />}
        >
          Create Part
        </Button>
      </Stack>

      <Divider sx={{ my: 2.9 }} />

      <Typography variant="subtitle2">Selection Snapshot</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
        {selectedPart
          ? `${selectedPart.partNumber} - ${selectedPart.name}`
          : 'No part selected yet.'}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mt: 1.1 }}>
        <Box
          sx={{
            ...subtleCardSx,
            flex: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Visible Parts
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {partsCount}
          </Typography>
        </Box>
        <Box
          sx={{
            ...subtleCardSx,
            flex: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Child Links
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {selectedPartDetails?.childCount ?? 0}
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 2.4 }} />
    </Paper>
  );
}
