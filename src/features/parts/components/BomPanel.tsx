import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { ValidationError } from 'yup';
import type { ChildPartUsage, PartSummary } from '../../../shared/types/partBom';
import { getErrorMessage } from '../../../shared/utils/errors';
import type { UiBomNode } from '../types';
import {
  type CreateBomLinkSchemaInput,
  type UpdateBomLinkSchemaInput,
  createBomLinkSchema,
  updateBomLinkSchema,
} from '../validation/bomLinkSchemas';
import { createPartSchema } from '../validation/partSchemas';
import { BomNodeItem } from './BomNodeItem';
import { panelSx, sectionHeaderSx, subtleCardSx } from './panelStyles';

interface BomPanelProps {
  rootId: string | null;
  nodes: Record<string, UiBomNode>;
  expandedNodeIds: Set<string>;
  loading: boolean;
  error: string | null;
  mutationLoading: boolean;
  mutationError: string | null;
  availableParts: PartSummary[];
  managedChildLinks: ChildPartUsage[];
  onToggleNode: (nodeId: string) => void;
  onRetryChildren: (nodeId: string) => void;
  onCreateLink: (childId: string, quantity: number) => Promise<void>;
  onCreatePartForBom: (payload: {
    name: string;
    partNumber?: string;
    description?: string;
  }) => Promise<PartSummary>;
  onUpdateLink: (childId: string, quantity: number) => Promise<void>;
  onDeleteLink: (childId: string) => Promise<void>;
  onClearMutationError: () => void;
}

interface CreateFormErrors {
  childId?: string;
  quantity?: string;
}

interface CreatePartFormErrors {
  name?: string;
  partNumber?: string;
  description?: string;
}

function toErrorMap(error: ValidationError): Record<string, string> {
  const nextErrors: Record<string, string> = {};
  for (const item of error.inner) {
    if (item.path && !nextErrors[item.path]) {
      nextErrors[item.path] = item.message;
    }
  }
  return nextErrors;
}

export function BomPanel({
  rootId,
  nodes,
  expandedNodeIds,
  loading,
  error,
  mutationLoading,
  mutationError,
  availableParts,
  managedChildLinks,
  onToggleNode,
  onRetryChildren,
  onCreateLink,
  onCreatePartForBom,
  onUpdateLink,
  onDeleteLink,
  onClearMutationError,
}: BomPanelProps) {
  const [createChildId, setCreateChildId] = useState('');
  const [createQuantity, setCreateQuantity] = useState('1');
  const [createErrors, setCreateErrors] = useState<CreateFormErrors>({});
  const [localActionError, setLocalActionError] = useState<string | null>(null);
  const [activeAction, setActiveAction] = useState<
    'create' | 'update' | 'delete' | null
  >(null);
  const [isCreatePartDialogOpen, setIsCreatePartDialogOpen] = useState(false);
  const [newPartName, setNewPartName] = useState('');
  const [newPartNumber, setNewPartNumber] = useState('');
  const [newPartDescription, setNewPartDescription] = useState('');
  const [newPartErrors, setNewPartErrors] = useState<CreatePartFormErrors>({});
  const [newPartError, setNewPartError] = useState<string | null>(null);
  const [newPartLoading, setNewPartLoading] = useState(false);

  const [editQuantities, setEditQuantities] = useState<Record<string, string>>({});
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const linkedChildIds = useMemo(
    () => new Set(managedChildLinks.map((childPart) => childPart.id)),
    [managedChildLinks],
  );

  const createOptions = useMemo(
    () =>
      availableParts.filter(
        (part) => part.id !== rootId && !linkedChildIds.has(part.id),
      ),
    [availableParts, linkedChildIds, rootId],
  );

  const actionError = mutationError ?? localActionError;

  const resetNewPartDialog = () => {
    setNewPartName('');
    setNewPartNumber('');
    setNewPartDescription('');
    setNewPartErrors({});
    setNewPartError(null);
  };

  const closeNewPartDialog = () => {
    if (newPartLoading) {
      return;
    }

    setIsCreatePartDialogOpen(false);
    resetNewPartDialog();
  };

  const handleCreateSubmit = async () => {
    try {
      const payload: CreateBomLinkSchemaInput = await createBomLinkSchema.validate(
        {
          childId: createChildId,
          quantity: createQuantity,
        },
        { abortEarly: false, stripUnknown: true },
      );

      onClearMutationError();
      setLocalActionError(null);
      await onCreateLink(payload.childId, payload.quantity);
      setCreateChildId('');
      setCreateQuantity('1');
      setCreateErrors({});
    } catch (validationOrRequestError) {
      if (validationOrRequestError instanceof ValidationError) {
        const nextErrors = toErrorMap(validationOrRequestError);
        setCreateErrors({
          childId: nextErrors.childId,
          quantity: nextErrors.quantity,
        });
        return;
      }

      setLocalActionError(getErrorMessage(validationOrRequestError));
    }
  };

  const handleUpdateLink = async (childId: string) => {
    const existingQuantity = managedChildLinks.find(
      (childPart) => childPart.id === childId,
    )?.quantity;
    const currentQuantity =
      editQuantities[childId] ?? (existingQuantity !== undefined ? String(existingQuantity) : '');

    try {
      const payload: UpdateBomLinkSchemaInput = await updateBomLinkSchema.validate(
        { quantity: currentQuantity },
        { abortEarly: false, stripUnknown: true },
      );

      if (existingQuantity !== undefined && payload.quantity === existingQuantity) {
        setEditErrors((current) => {
          if (!current[childId]) {
            return current;
          }

          const next = { ...current };
          delete next[childId];
          return next;
        });
        return;
      }

      onClearMutationError();
      setLocalActionError(null);
      await onUpdateLink(childId, payload.quantity);
      setEditErrors((current) => {
        if (!current[childId]) {
          return current;
        }

        const next = { ...current };
        delete next[childId];
        return next;
      });
    } catch (validationOrRequestError) {
      if (validationOrRequestError instanceof ValidationError) {
        const nextErrors = toErrorMap(validationOrRequestError);
        setEditErrors((current) => ({
          ...current,
          [childId]: nextErrors.quantity ?? 'Quantity is invalid.',
        }));
        return;
      }

      setLocalActionError(getErrorMessage(validationOrRequestError));
    }
  };

  const handleDeleteLink = async (childId: string) => {
    onClearMutationError();
    setLocalActionError(null);
    try {
      await onDeleteLink(childId);
    } catch (requestError) {
      setLocalActionError(getErrorMessage(requestError));
    }
  };

  const handleCreateNewPart = async () => {
    try {
      const payload = await createPartSchema.validate(
        {
          name: newPartName,
          partNumber: newPartNumber,
          description: newPartDescription,
        },
        { abortEarly: false, stripUnknown: true },
      );

      setNewPartLoading(true);
      setNewPartError(null);

      const createdPart = await onCreatePartForBom({
        name: payload.name,
        partNumber: payload.partNumber || undefined,
        description: payload.description || undefined,
      });

      setCreateChildId(createdPart.id);
      setCreateErrors((current) => ({ ...current, childId: undefined }));
      setIsCreatePartDialogOpen(false);
      resetNewPartDialog();
    } catch (validationOrRequestError) {
      if (validationOrRequestError instanceof ValidationError) {
        const nextErrors = toErrorMap(validationOrRequestError);
        setNewPartErrors({
          name: nextErrors.name,
          partNumber: nextErrors.partNumber,
          description: nextErrors.description,
        });
        return;
      }

      setNewPartError(getErrorMessage(validationOrRequestError));
    } finally {
      setNewPartLoading(false);
    }
  };

  return (
    <Paper elevation={0} sx={panelSx}>
      <Box
        sx={{
          ...sectionHeaderSx,
        }}
      >
        <Typography variant="h6">BOM Studio</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          Manage structure and child links for the selected part.
        </Typography>
      </Box>

      <Typography variant="subtitle2" sx={{ mt: 1.5, fontWeight: 700 }}>
        Structure Explorer
      </Typography>
      <Divider sx={{ my: 1.25 }} />

      {loading ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            Loading BOM tree...
          </Typography>
        </Stack>
      ) : null}
      {error ? <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert> : null}

      {!loading && !error && rootId ? (
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            m: 0,
            p: 1.25,
            borderRadius: 2,
            border: '1px solid',
            borderColor: (theme) => alpha(theme.palette.primary.main, 0.18),
            backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.24),
          }}
        >
          <BomNodeItem
            nodeId={rootId}
            level={0}
            nodes={nodes}
            expandedNodeIds={expandedNodeIds}
            onToggle={onToggleNode}
            onRetry={onRetryChildren}
          />
        </Box>
      ) : null}

      <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 700 }}>
        Link Manager
      </Typography>
      <Divider sx={{ my: 1.25 }} />

      {actionError ? <Alert severity="error" sx={{ mb: 1.25 }}>{actionError}</Alert> : null}

      {!rootId ? (
        <Typography variant="body2" color="text.secondary">
          Select a part to manage BOM links.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <Box
            sx={{
              ...subtleCardSx,
              p: 1.25,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                Choose Action
              </Typography>
              {activeAction ? (
                <Button
                  type="button"
                  size="small"
                  variant="text"
                  onClick={() => {
                    setActiveAction(null);
                    onClearMutationError();
                    setLocalActionError(null);
                  }}
                  disabled={mutationLoading}
                >
                  Close
                </Button>
              ) : null}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.3, display: 'block' }}>
              Open one action panel at a time.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1 }}>
              <Button
                type="button"
                variant={activeAction === 'create' ? 'contained' : 'outlined'}
                onClick={() => {
                  onClearMutationError();
                  setLocalActionError(null);
                  setActiveAction((current) => (current === 'create' ? null : 'create'));
                }}
                disabled={mutationLoading}
              >
                Create
              </Button>
              <Button
                type="button"
                variant={activeAction === 'update' ? 'contained' : 'outlined'}
                onClick={() => {
                  onClearMutationError();
                  setLocalActionError(null);
                  setActiveAction((current) => (current === 'update' ? null : 'update'));
                }}
                disabled={mutationLoading}
              >
                Update
              </Button>
              <Button
                type="button"
                color="error"
                variant={activeAction === 'delete' ? 'contained' : 'outlined'}
                onClick={() => {
                  onClearMutationError();
                  setLocalActionError(null);
                  setActiveAction((current) => (current === 'delete' ? null : 'delete'));
                }}
                disabled={mutationLoading}
              >
                Delete
              </Button>
            </Stack>
          </Box>

          {!activeAction ? (
            <Typography variant="body2" color="text.secondary">
              Click Create, Update, or Delete to show the corresponding options.
            </Typography>
          ) : null}

          {activeAction === 'create' ? (
            <Box
              sx={{
                ...subtleCardSx,
                p: 1.25,
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.28),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Create Link
                </Typography>
                <Button
                  type="button"
                  size="small"
                  variant="text"
                  onClick={() => {
                    setActiveAction(null);
                    onClearMutationError();
                    setLocalActionError(null);
                  }}
                  disabled={mutationLoading}
                >
                  Close
                </Button>
              </Stack>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                sx={{ mt: 1, flexWrap: { sm: 'wrap' } }}
              >
                <TextField
                  select
                  size="small"
                  label="Child part"
                  value={createChildId}
                  onChange={(event) => {
                    setCreateChildId(event.target.value);
                    setLocalActionError(null);
                    setCreateErrors((current) => ({ ...current, childId: undefined }));
                  }}
                  error={Boolean(createErrors.childId)}
                  helperText={
                    createErrors.childId ??
                    (createOptions.length > 0
                      ? 'Select a part to add as a child, or create a new one.'
                      : 'No available parts to link.')
                  }
                  disabled={mutationLoading}
                  sx={{
                    width: '100%',
                    flex: { sm: '1 1 300px' },
                    minWidth: { sm: 240 },
                  }}
                >
                  {createOptions.map((part) => (
                    <MenuItem key={part.id} value={part.id}>
                      {part.partNumber} - {part.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  size="small"
                  type="number"
                  label="Quantity"
                  value={createQuantity}
                  onChange={(event) => {
                    setCreateQuantity(event.target.value);
                    setLocalActionError(null);
                    setCreateErrors((current) => ({ ...current, quantity: undefined }));
                  }}
                  error={Boolean(createErrors.quantity)}
                  helperText={createErrors.quantity ?? 'Positive integer'}
                  inputProps={{ min: 1, step: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
                  disabled={mutationLoading}
                  sx={{
                    width: { xs: '100%', sm: 130 },
                    flexShrink: 0,
                  }}
                />
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  onClick={() => {
                    void handleCreateSubmit();
                  }}
                  disabled={mutationLoading || createOptions.length === 0}
                  sx={{
                    minHeight: 32,
                    alignSelf: { xs: 'stretch', sm: 'flex-start' },
                    minWidth: 92,
                    flexShrink: 0,
                  }}
                >
                  {mutationLoading ? 'Saving...' : 'Add'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setIsCreatePartDialogOpen(true);
                    setNewPartError(null);
                    setNewPartErrors({});
                  }}
                  disabled={mutationLoading}
                  sx={{
                    minHeight: 32,
                    alignSelf: { xs: 'stretch', sm: 'flex-start' },
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  Create New Part
                </Button>
              </Stack>
            </Box>
          ) : null}

          {activeAction === 'update' ? (
            <Box
              sx={{
                ...subtleCardSx,
                p: 1.25,
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.28),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Update Existing Links
                </Typography>
                <Button
                  type="button"
                  size="small"
                  variant="text"
                  onClick={() => {
                    setActiveAction(null);
                    onClearMutationError();
                    setLocalActionError(null);
                  }}
                  disabled={mutationLoading}
                >
                  Close
                </Button>
              </Stack>
              {managedChildLinks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This part currently has no child links.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {managedChildLinks.map((childPart) => (
                    <Box
                      key={childPart.id}
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                      }}
                    >
                      <Stack spacing={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {childPart.partNumber} - {childPart.name}
                        </Typography>
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={1}
                          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                        >
                          <TextField
                            size="small"
                            type="number"
                            label="Quantity"
                            value={editQuantities[childPart.id] ?? String(childPart.quantity)}
                            onChange={(event) => {
                              const nextQuantity = event.target.value;
                              setLocalActionError(null);
                              setEditQuantities((current) => ({
                                ...current,
                                [childPart.id]: nextQuantity,
                              }));

                              setEditErrors((current) => {
                                if (!current[childPart.id]) {
                                  return current;
                                }

                                const next = { ...current };
                                delete next[childPart.id];
                                return next;
                              });
                            }}
                            error={Boolean(editErrors[childPart.id])}
                            helperText={editErrors[childPart.id]}
                            inputProps={{ min: 1, step: 1, inputMode: 'numeric', pattern: '[0-9]*' }}
                            disabled={mutationLoading}
                            sx={{ width: { xs: '100%', sm: 130 }, flexShrink: 0 }}
                          />
                          <Button
                            type="button"
                            variant="outlined"
                            size="small"
                            onClick={() => {
                              void handleUpdateLink(childPart.id);
                            }}
                            disabled={mutationLoading}
                            sx={{
                              minHeight: 32,
                              alignSelf: { xs: 'stretch', sm: 'flex-start' },
                              minWidth: 90,
                              flexShrink: 0,
                            }}
                          >
                            Update
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          ) : null}

          {activeAction === 'delete' ? (
            <Box
              sx={{
                ...subtleCardSx,
                p: 1.25,
                borderColor: (theme) => alpha(theme.palette.error.main, 0.3),
                backgroundColor: (theme) => alpha(theme.palette.error.light, 0.24),
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Delete Existing Links
                </Typography>
                <Button
                  type="button"
                  size="small"
                  variant="text"
                  color="error"
                  onClick={() => {
                    setActiveAction(null);
                    onClearMutationError();
                    setLocalActionError(null);
                  }}
                  disabled={mutationLoading}
                >
                  Close
                </Button>
              </Stack>
              {managedChildLinks.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  This part currently has no child links.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {managedChildLinks.map((childPart) => (
                    <Box
                      key={childPart.id}
                      sx={{
                        p: 1,
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.9),
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        justifyContent="space-between"
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {childPart.partNumber} - {childPart.name}
                        </Typography>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            void handleDeleteLink(childPart.id);
                          }}
                          disabled={mutationLoading}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          ) : null}
        </Stack>
      )}

      <Dialog
        open={isCreatePartDialogOpen}
        onClose={closeNewPartDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Child Part</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.1}>
            {newPartError ? <Alert severity="error">{newPartError}</Alert> : null}
            <TextField
              size="small"
              label="Part Name"
              value={newPartName}
              onChange={(event) => {
                setNewPartName(event.target.value);
                setNewPartError(null);
                setNewPartErrors((current) => ({ ...current, name: undefined }));
              }}
              error={Boolean(newPartErrors.name)}
              helperText={newPartErrors.name}
              disabled={newPartLoading}
              autoFocus
            />
            <TextField
              size="small"
              label="Part Number (Optional)"
              value={newPartNumber}
              onChange={(event) => {
                setNewPartNumber(event.target.value);
                setNewPartError(null);
                setNewPartErrors((current) => ({ ...current, partNumber: undefined }));
              }}
              error={Boolean(newPartErrors.partNumber)}
              helperText={newPartErrors.partNumber ?? 'Example: PRT-001200'}
              disabled={newPartLoading}
            />
            <TextField
              size="small"
              multiline
              minRows={3}
              label="Description (Optional)"
              value={newPartDescription}
              onChange={(event) => {
                setNewPartDescription(event.target.value);
                setNewPartError(null);
                setNewPartErrors((current) => ({ ...current, description: undefined }));
              }}
              error={Boolean(newPartErrors.description)}
              helperText={newPartErrors.description}
              disabled={newPartLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            type="button"
            onClick={closeNewPartDialog}
            disabled={newPartLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={() => {
              void handleCreateNewPart();
            }}
            disabled={newPartLoading}
          >
            {newPartLoading ? 'Creating...' : 'Create & Select'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}
