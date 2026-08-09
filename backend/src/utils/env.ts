import { config } from 'dotenv';
import { z } from 'zod';
import type { EnvConfig } from '../types/index';

config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
});

export const env: EnvConfig = envSchema.parse(process.env);
