/**
 * Pre-deploy: clean build + E2E against a running server.
 * Usage:
 *   Terminal 1: npm run dev
 *   Terminal 2: node scripts/predeploy-check.mjs http://localhost:3001
 */
import { spawn } from "child_process";
import { rm } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv[2] ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd: ROOT,
      stdio: "inherit",
      shell: true,
    });
    child.on("exit", (code) =>
      code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))
    );
  });
}

console.log("\n=== Pre-deploy check ===\n");

console.log("1. Clean .next and production build...");
await rm(path.join(ROOT, ".next"), { recursive: true, force: true });
await run("npm", ["run", "build"]);

console.log(`\n2. E2E API tests against ${BASE}...\n`);
for (const script of [
  "scripts/e2e-flow.mjs",
  "scripts/e2e-anonymous.mjs",
  "scripts/e2e-full-flow.mjs",
]) {
  await run("node", [script, BASE]);
}

console.log("\n=== All pre-deploy checks passed ===\n");
