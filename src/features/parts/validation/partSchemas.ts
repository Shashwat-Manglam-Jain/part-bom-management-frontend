import * as yup from 'yup';

export const createPartSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required('Part name is required.')
    .max(80, 'Part name must be 80 characters or less.'),
  partNumber: yup
    .string()
    .transform((value) => value?.trim() ?? '')
    .max(40, 'Part number must be 40 characters or less.'),
  description: yup
    .string()
    .transform((value) => value?.trim() ?? '')
    .max(240, 'Description must be 240 characters or less.'),
});

export type CreatePartSchemaInput = yup.InferType<typeof createPartSchema>;
