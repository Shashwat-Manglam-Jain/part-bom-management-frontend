import type { FormEvent } from 'react';
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ValidationError } from 'yup';
import { getErrorMessage } from '../../../shared/utils/errors';
import { createPartSchema } from '../validation/partSchemas';
import { panelSx, sectionHeaderSx, subtleCardSx } from './panelStyles';

interface CreatePartPanelProps {
  loading: boolean;
  error: string | null;
  onCreatePart: (payload: {
    name: string;
    partNumber?: string;
    description?: string;
  }) => Promise<void>;
  onClearError: () => void;
  onOpenSearch: () => void;
  onOpenDetails: () => void;
}

interface CreatePartErrors {
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

export function CreatePartPanel({
  loading,
  error,
  onCreatePart,
  onClearError,
  onOpenSearch,
  onOpenDetails,
}: CreatePartPanelProps) {
  const [name, setName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [description, setDescription] = useState('');
  const [fieldErrors, setFieldErrors] = useState<CreatePartErrors>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);

  const actionError = error ?? localError;

  const clearActionErrors = () => {
    onClearError();
    setLocalError(null);
  };

  const resetForm = () => {
    setName('');
    setPartNumber('');
    setDescription('');
    setFieldErrors({});
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const payload = await createPartSchema.validate(
        { name, partNumber, description },
        { abortEarly: false, stripUnknown: true },
      );

      clearActionErrors();
      await onCreatePart({
        name: payload.name,
        partNumber: payload.partNumber || undefined,
        description: payload.description || undefined,
      });

      resetForm();
      setCreated(true);
    } catch (validationOrRequestError) {
      if (validationOrRequestError instanceof ValidationError) {
        const nextErrors = toErrorMap(validationOrRequestError);
        setFieldErrors({
          name: nextErrors.name,
          partNumber: nextErrors.partNumber,
          description: nextErrors.description,
        });
        return;
      }

      setLocalError(getErrorMessage(validationOrRequestError));
    }
  };

  return (
    <Paper elevation={0} sx={panelSx}>
      <Box
        sx={{
          ...sectionHeaderSx,
        }}
      >
        <Typography variant="h6">Create New Part</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3 }}>
          Use this page to add a part before linking it in BOM manager.
        </Typography>
      </Box>

      <Divider sx={{ my: 1.25 }} />

      {actionError ? <Alert severity="error" sx={{ mb: 1.25 }}>{actionError}</Alert> : null}
      {created ? (
        <Alert
          severity="success"
          sx={{ mb: 1.25 }}
          action={(
            <Button
              type="button"
              color="inherit"
              size="small"
              onClick={onOpenDetails}
            >
              Open Details
            </Button>
          )}
        >
          Part created successfully.
        </Alert>
      ) : null}

      <Box
        component="form"
        onSubmit={(event) => {
          void handleSubmit(event);
        }}
        sx={subtleCardSx}
      >
        <Stack spacing={1}>
          <TextField
            size="small"
            label="Part Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setCreated(false);
              clearActionErrors();
              setFieldErrors((current) => ({ ...current, name: undefined }));
            }}
            error={Boolean(fieldErrors.name)}
            helperText={fieldErrors.name}
            disabled={loading}
          />
          <TextField
            size="small"
            label="Part Number (Optional)"
            value={partNumber}
            onChange={(event) => {
              setPartNumber(event.target.value);
              setCreated(false);
              clearActionErrors();
              setFieldErrors((current) => ({ ...current, partNumber: undefined }));
            }}
            error={Boolean(fieldErrors.partNumber)}
            helperText={fieldErrors.partNumber ?? 'Example: PRT-000500'}
            disabled={loading}
          />
          <TextField
            size="small"
            multiline
            minRows={3}
            label="Description (Optional)"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setCreated(false);
              clearActionErrors();
              setFieldErrors((current) => ({ ...current, description: undefined }));
            }}
            error={Boolean(fieldErrors.description)}
            helperText={fieldErrors.description}
            disabled={loading}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? <CircularProgress color="inherit" size={14} /> : undefined
              }
            >
              {loading ? 'Creating...' : 'Create Part'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              disabled={loading}
              onClick={() => {
                resetForm();
                setCreated(false);
                clearActionErrors();
              }}
            >
              Reset Form
            </Button>
            <Button
              type="button"
              variant="text"
              disabled={loading}
              onClick={onOpenSearch}
            >
              Open Search
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Paper>
  );
}
