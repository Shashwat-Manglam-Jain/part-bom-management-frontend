import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { AuditLog } from '../../../shared/types/partBom';
import { formatDateTime } from '../../../shared/utils/date';
import { panelSx, sectionHeaderSx, subtleCardSx } from './panelStyles';

interface AuditLogsPanelProps {
  logs: AuditLog[];
  loading: boolean;
  error: string | null;
}

function getActionColor(action: AuditLog['action']): 'primary' | 'success' | 'warning' | 'error' {
  switch (action) {
    case 'PART_CREATED':
    case 'BOM_LINK_CREATED':
      return 'success';
    case 'PART_UPDATED':
    case 'BOM_LINK_UPDATED':
      return 'primary';
    case 'BOM_LINK_REMOVED':
      return 'warning';
    default:
      return 'primary';
  }
}

export function AuditLogsPanel({
  logs,
  loading,
  error,
}: AuditLogsPanelProps) {
  return (
    <Paper elevation={0} sx={panelSx}>
      <Stack sx={sectionHeaderSx}>
        <Typography variant="h6">Audit Logs</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          Recent changes for the selected part.
        </Typography>
      </Stack>
      <Divider sx={{ my: 1.25 }} />

      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading audit logs...
          </Typography>
        </Stack>
      ) : null}
      {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}

      {!loading && !error ? (
        <Stack spacing={1}>
          {logs.map((log) => (
            <Paper
              key={log.id}
              variant="outlined"
              sx={{ ...subtleCardSx, p: 1.25 }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Chip
                  size="small"
                  color={getActionColor(log.action)}
                  variant="outlined"
                  label={log.action}
                  sx={{ fontWeight: 700 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(log.timestamp)}
                </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mt: 0.8 }}>
                {log.message}
              </Typography>
            </Paper>
          ))}
        </Stack>
      ) : null}

      {!loading && !error && logs.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No audit logs for this part yet.
        </Typography>
      ) : null}
    </Paper>
  );
}
