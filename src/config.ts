// Configuration values used throughout the app

import { config } from "dotenv";

config();

function mustEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const CONFIG = {
  DISCORD_TOKEN: mustEnv("DISCORD_TOKEN"),
  CLIENT_ID: mustEnv("CLIENT_ID"),
} as const;

export type Config = typeof CONFIG;
