import { z } from 'zod';

export const generatePromptSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  profileId: z.string().optional(),
  language: z.enum(['en', 'da']).optional(),
  tags: z.array(z.string()).optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  stack: z.array(z.string()).optional(),
  hardRules: z.array(z.string()).optional(),
  patterns: z.array(z.string()).optional(),
  defaultFailureConditions: z.array(z.string()).optional(),
  promptLanguage: z.enum(['en', 'da']).optional(),
});

export type GeneratePromptPayload = z.infer<typeof generatePromptSchema>;
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;
