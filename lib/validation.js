import { z } from 'zod';

// User registration schema
export const userRegistrationSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  location: z.string().optional(),
  time: z.string().optional(),
  date: z.string().optional(),
});

// User login schema
export const userLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Funnel data schema
export const funnelDataSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  contact_name: z.string().min(1, 'Contact name is required'),
  contact_email: z.string().email('Invalid email address'),
  stage: z.string().min(1, 'Stage is required'),
  value: z.number().positive('Value must be positive'),
  probability: z.number().min(0).max(100, 'Probability must be between 0 and 100'),
  expected_revenue: z.number().positive('Expected revenue must be positive'),
  creation_date: z.string().datetime(),
  expected_close_date: z.string().datetime(),
  team_member: z.string().min(1, 'Team member is required'),
  progress_to_won: z.number().min(0).max(100, 'Progress to won must be between 0 and 100'),
  last_interacted_on: z.string().datetime(),
  next_step: z.string().min(1, 'Next step is required'),
});