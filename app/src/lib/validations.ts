import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  description: z.string().max(500).optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const createEventSchema = z.object({
  method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']),
  path: z.string().min(1).max(2048),
  statusCode: z.number().int().min(100).max(599),
  responseTimeMs: z.number().int().min(0),
  requestSize: z.number().int().min(0).optional(),
  responseSize: z.number().int().min(0).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().max(512).optional(),
  timestamp: z.string().datetime().optional(),
});

export const createEventBatchSchema = z.object({
  events: z.array(createEventSchema).min(1).max(1000),
});

export const createAlertSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(200),
  conditionType: z.enum(['response_time_avg', 'error_rate', 'request_count', 'p95_latency']),
  threshold: z.number().positive(),
});

export const updateAlertSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  conditionType: z.enum(['response_time_avg', 'error_rate', 'request_count', 'p95_latency']).optional(),
  threshold: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type CreateAlertInput = z.infer<typeof createAlertSchema>;
export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
