import * as yup from 'yup';

const quantityField = yup
  .number()
  .transform((value, originalValue) =>
    originalValue === '' || originalValue === null ? Number.NaN : value,
  )
  .typeError('Quantity must be a number.')
  .integer('Quantity must be a whole number.')
  .min(1, 'Quantity must be at least 1.')
  .required('Quantity is required.');

export const createBomLinkSchema = yup.object({
  childId: yup.string().trim().required('Select a child part.'),
  quantity: quantityField,
});

export const updateBomLinkSchema = yup.object({
  quantity: quantityField,
});

export type CreateBomLinkSchemaInput = yup.InferType<typeof createBomLinkSchema>;
export type UpdateBomLinkSchemaInput = yup.InferType<typeof updateBomLinkSchema>;
