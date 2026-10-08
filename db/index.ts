import { workerEnv as env } from "../lib/worker-env";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure the DB binding in wrangler.jsonc before using the database."
    );
  }

  return drizzle(env.DB as D1Database, { schema });
}
