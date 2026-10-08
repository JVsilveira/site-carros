import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

const config = JSON.parse(readFileSync("wrangler.jsonc", "utf8"));
const database = config.d1_databases?.find(item => item.binding === "DB");
if (!database || !/^[0-9a-f-]{36}$/i.test(database.database_id) ||
    database.database_id === "00000000-0000-4000-8000-000000000000") {
  console.error("Configure o database_id do seu banco D1 em wrangler.jsonc antes de publicar.");
  process.exit(1);
}
for (const [command, args] of [
  ["npm", ["run", "build"]],
  ["npx", ["wrangler", "deploy", "--config", "dist/server/wrangler.json"]],
]) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
