import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL_NODE: z.string(),
  PORT: z.number().default(3000),
});

const _env = envSchema.safeParse(process.env);

if(_env.success === false){
  console.error('Invalid environment variables');
  throw new Error('Invalid environment variables');
}

export const env = _env.data;