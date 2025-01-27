import { z } from 'zod';

const createMessageZodSchema = z.object({
  body: z.object({
    to: z
      .string({ invalid_type_error: 'to should be type objectID or string' })
      .optional(),
    group: z
      .string({ invalid_type_error: 'group should be type objectID or string' })
      .optional(),
    replyTo: z
      .string({
        invalid_type_error: 'replyTo should be type objectID or string',
      })
      .optional(),
    message: z.string({
      required_error: 'message is required',
      invalid_type_error: 'message should be type string',
    }),
  }),
});

const updateMessageZodSchema = z.object({
  body: z.object({
    from: z
      .string({ invalid_type_error: 'from should be type string' })
      .optional(),
    to: z.string({ invalid_type_error: 'to should be type string' }).optional(),
    group: z
      .string({ invalid_type_error: 'group should be type string' })
      .optional(),
    replyTo: z
      .string({ invalid_type_error: 'replyTo should be type string' })
      .optional(),
    message: z
      .string({ invalid_type_error: 'message should be type string' })
      .optional(),
  }),
});

export const MessageValidation = {
  createMessageZodSchema,
  updateMessageZodSchema,
};
