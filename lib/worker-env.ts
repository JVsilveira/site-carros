import { env } from "cloudflare:workers";

export const workerEnv = env as unknown as { DB?: D1Database };
