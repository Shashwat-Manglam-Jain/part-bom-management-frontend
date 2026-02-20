import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { PartDetails, PartSummary } from '../../../shared/types/partBom';
import { formatDateTime } from '../../../shared/utils/date';
import { panelSx, sectionHeaderSx, subtleCardSx } from './panelStyles';

interface PartDetailsPanelProps {
  details: PartDetails | null;
  loading: boolean;
  error: string | null;
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={0.5}
      justifyContent="space-between"
      sx={{ py: 0.75 }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: { sm: 'right' } }}>
        {value}
      </Typography>
    </Stack>
  );
}

function toPartLabel(part: PartSummary): string {
  return `${part.partNumber} - ${part.name}`;
}

export function PartDetailsPanel({
  details,
  loading,
  error,
}: PartDetailsPanelProps) {
  return (
    <Paper elevation={0} sx={panelSx}>
      <Box
        sx={{
          ...sectionHeaderSx,
        }}
      >
        <Typography variant="h6" sx={{ pl: 1.1 }}>
          Part Details
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.4, pl: 1.1, pb: 1.1 }}
        >
          {details
            ? toPartLabel(details)
            : 'Select a part from Search to inspect full details.'}
        </Typography>
      </Box>

      <Divider sx={{ my: 1.25 }} />

      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading part details...
          </Typography>
        </Stack>
      ) : null}
      {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}

      {!loading && !error && details ? (
        <Stack spacing={1.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 1.2, md: 2.2 },
              p: { xs: 0.75, md: 1 },
            }}
          >
            <Paper
              variant="outlined"
              sx={subtleCardSx}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Core Details
              </Typography>
              <Divider sx={{ my: 0.8 }} />
              <DetailRow label="Part Number" value={details.partNumber} />
              <Divider />
              <DetailRow label="Part Name" value={details.name} />
              <Divider />
              <DetailRow
                label="Description"
                value={details.description || 'No description'}
              />
            </Paper>

            <Paper
              variant="outlined"
              sx={subtleCardSx}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Lifecycle
              </Typography>
              <Divider sx={{ my: 0.8 }} />
              <DetailRow label="Created" value={formatDateTime(details.createdAt)} />
              <Divider />
              <DetailRow label="Updated" value={formatDateTime(details.updatedAt)} />
            </Paper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: { xs: 1.1, md: 2 },
              p: { xs: 0.75, md: 1 },
            }}
          >
            <Paper
              variant="outlined"
              sx={{ ...subtleCardSx, p: 1, textAlign: 'center' }}
            >
              <Typography variant="caption" color="text.secondary">
                Child Links
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {details.childCount}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ ...subtleCardSx, p: 1, textAlign: 'center' }}
            >
              <Typography variant="caption" color="text.secondary">
                Used In
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {details.parentCount}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ ...subtleCardSx, p: 1, textAlign: 'center' }}
            >
              <Typography variant="caption" color="text.secondary">
                Parent Parts
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {details.parentParts.length}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ ...subtleCardSx, p: 1, textAlign: 'center' }}
            >
              <Typography variant="caption" color="text.secondary">
                Child Parts
              </Typography>
              <Typography variant="h6" sx={{ fontSize: '1.05rem', fontWeight: 700 }}>
                {details.childParts.length}
              </Typography>
            </Paper>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: { xs: 1.2, md: 2.2 },
              p: { xs: 0.75, md: 1 },
            }}
          >
            <Paper variant="outlined" sx={{ ...subtleCardSx, p: 1.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Parent Parts
              </Typography>
              {details.parentParts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  This part is not used as a child in other parts.
                </Typography>
              ) : (
                <Stack spacing={0.75} sx={{ mt: 0.9, maxHeight: 220, overflowY: 'auto', pr: 0.4 }}>
                  {details.parentParts.map((parent) => (
                    <Box
                      key={parent.id}
                      sx={{
                        p: 0.9,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {parent.partNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {parent.name}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Paper>

            <Paper variant="outlined" sx={{ ...subtleCardSx, p: 1.25 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Child Parts
              </Typography>
              {details.childParts.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.8 }}>
                  No child links found for this part.
                </Typography>
              ) : (
                <Stack spacing={0.75} sx={{ mt: 0.9, maxHeight: 220, overflowY: 'auto', pr: 0.4 }}>
                  {details.childParts.map((child) => (
                    <Stack
                      key={child.id}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{
                        p: 0.9,
                        borderRadius: 0.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {child.partNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {child.name}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        color="primary"
                        variant="outlined"
                        label={`Qty ${child.quantity}`}
                        sx={{ fontWeight: 700 }}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}
            </Paper>
          </Box>
        </Stack>
      ) : null}

      {!loading && !error && !details ? (
        <Typography variant="body2" color="text.secondary">
          Select a part from search to view details.
        </Typography>
      ) : null}
    </Paper>
  );
}
