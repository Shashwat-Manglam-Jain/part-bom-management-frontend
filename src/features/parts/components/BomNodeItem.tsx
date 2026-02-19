import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Collapse from '@mui/material/Collapse';
import Icon from '@mui/material/Icon';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import type { UiBomNode } from '../types';

interface BomNodeItemProps {
  nodeId: string;
  level: number;
  nodes: Record<string, UiBomNode>;
  expandedNodeIds: Set<string>;
  onToggle: (nodeId: string) => void;
  onRetry: (nodeId: string) => void;
}

export function BomNodeItem({
  nodeId,
  level,
  nodes,
  expandedNodeIds,
  onToggle,
  onRetry,
}: BomNodeItemProps) {
  const node = nodes[nodeId];
  if (!node) {
    return null;
  }

  const isExpanded = expandedNodeIds.has(nodeId);

  return (
    <Box component="li" sx={{ listStyle: 'none', mb: 0.6 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ pl: level * 2 }}>
        {node.hasChildren ? (
          <Button
            size="small"
            variant="outlined"
            onClick={() => onToggle(nodeId)}
            aria-label={isExpanded ? 'Collapse BOM node' : 'Expand BOM node'}
            sx={{
              minWidth: 30,
              width: 30,
              height: 30,
              p: 0,
              borderRadius: 1.5,
            }}
          >
            <Icon
              baseClassName="material-symbols-rounded"
              sx={{ fontSize: 18, lineHeight: 1 }}
            >
              {isExpanded ? 'expand_more' : 'chevron_right'}
            </Icon>
          </Button>
        ) : (
          <Box
            sx={{
              minWidth: 30,
              width: 30,
              height: 30,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.secondary',
              backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
            }}
          >
            <Icon
              baseClassName="material-symbols-rounded"
              sx={{ fontSize: 16, color: 'text.secondary', lineHeight: 1 }}
            >
              inventory_2
            </Icon>
          </Box>
        )}

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 0, sm: 1 }}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            p: 0.75,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.2),
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {node.part.partNumber}
          </Typography>
          <Typography variant="body2" noWrap>
            {node.part.name}
          </Typography>
        </Stack>

        {node.quantityFromParent !== undefined ? (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`Qty ${node.quantityFromParent}`}
            sx={{ fontWeight: 700 }}
          />
        ) : null}
      </Stack>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 0.5, pt: 0.75 }}>
          {node.loadingChildren ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                Loading child nodes...
              </Typography>
            </Stack>
          ) : null}

          {!node.loadingChildren && node.childrenError ? (
            <Alert
              severity="error"
              sx={{ mt: 0.5 }}
              action={
                <Button color="inherit" size="small" onClick={() => onRetry(nodeId)}>
                  Retry
                </Button>
              }
            >
              {node.childrenError}
            </Alert>
          ) : null}

          {!node.loadingChildren && !node.childrenError && node.childIds.length > 0 ? (
            <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0, mt: 0.5 }}>
              {node.childIds.map((childId) => (
                <BomNodeItem
                  key={childId}
                  nodeId={childId}
                  level={level + 1}
                  nodes={nodes}
                  expandedNodeIds={expandedNodeIds}
                  onToggle={onToggle}
                  onRetry={onRetry}
                />
              ))}
            </Box>
          ) : null}

          {!node.loadingChildren &&
          !node.childrenError &&
          node.hasChildren &&
          node.childIds.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No children returned for this node.
            </Typography>
          ) : null}
        </Box>
      </Collapse>
    </Box>
  );
}
