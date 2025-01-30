import { zfd } from 'zod-form-data';
import { z } from 'zod';
        
const createJobZodSchema = zfd.formData({
  image: zfd.file().optional(),
      companyName: zfd.text(),
      role: zfd.text(),
      description: zfd.text(),
      address: zfd.text(),
      level: zfd.text(),
      jobType: zfd.text(),
      salary: zfd.text(),
      questions: zfd.repeatable(z.array(zfd.text()))
});

const updateJobZodSchema = zfd.formData({
  image: zfd.file().optional(),
      companyName: zfd.text().optional(),
      role: zfd.text().optional(),
      description: zfd.text().optional(),
      address: zfd.text().optional(),
      level: zfd.text().optional(),
      jobType: zfd.text().optional(),
      salary: zfd.text().optional(),
      questions: zfd.repeatable(z.array(zfd.text())).optional()
});

export const JobValidation = {
  createJobZodSchema,
  updateJobZodSchema
};
