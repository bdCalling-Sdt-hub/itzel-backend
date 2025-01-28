import { z } from 'zod';
import { zfd } from 'zod-form-data';
const createMessageZodSchema = zfd.formData({
  to: zfd.text().optional(),
  group: zfd.text().optional(),
  replyTo: zfd.text().optional(),
  message: zfd.text(),
  files: zfd.file().optional(),
});

const updateMessageZodSchema = zfd.formData({
  from: zfd.text().optional(),
  to: zfd.text().optional(),
  group: zfd.text().optional(),
  replyTo: zfd.text().optional(),
  message: zfd.text().optional(),
  files: zfd.file().optional(),
});

export const MessageValidation = {
  createMessageZodSchema,
  updateMessageZodSchema,
};
