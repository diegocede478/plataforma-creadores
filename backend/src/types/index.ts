export interface EnvConfig {
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
}

export type Role = 'CREATOR' | 'FAN';
