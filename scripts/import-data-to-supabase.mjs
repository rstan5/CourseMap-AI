/**
 * One-time import from .data/ JSON files into Supabase.
 * Usage: node scripts/import-data-to-supabase.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, ".data");

try {
  const envRaw = await readFile(path.join(ROOT, ".env.local"), "utf8");
  for (const line of envRaw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[name]) process.env[name] = value;
  }
} catch {
  /* .env.local optional if vars already exported */
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;

if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

async function importUsers() {
  const usersDir = path.join(DATA, "users");
  let count = 0;
  try {
    const files = await readdir(usersDir);
    for (const file of files) {
      if (!file.endsWith(".json") || file === "by-email") continue;
      const user = JSON.parse(
        await readFile(path.join(usersDir, file), "utf8")
      );
      const { error } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          password_hash: user.passwordHash,
          created_at: user.createdAt,
        },
        { onConflict: "id" }
      );
      if (error) console.warn("user", user.id, error.message);
      else count++;
    }
  } catch {
    console.log("No .data/users to import");
    return;
  }
  console.log(`Imported ${count} users`);
}

async function importAccess() {
  const accessDir = path.join(DATA, "user-access");
  let count = 0;
  try {
    const files = await readdir(accessDir);
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const userId = file.replace(/\.json$/, "");
      const access = JSON.parse(
        await readFile(path.join(accessDir, file), "utf8")
      );
      const { error } = await supabase.from("user_access").upsert(
        {
          user_id: userId,
          free_map_used: access.freeMapUsed ?? false,
          subscription_active: access.subscriptionActive ?? false,
          stripe_customer_id: access.stripeCustomerId ?? null,
          stripe_subscription_id: access.stripeSubscriptionId ?? null,
          current_period_end: access.currentPeriodEnd ?? null,
        },
        { onConflict: "user_id" }
      );
      if (error) console.warn("access", userId, error.message);
      else count++;
    }
  } catch {
    console.log("No .data/user-access to import");
    return;
  }
  console.log(`Imported ${count} user_access rows`);
}

async function importMaps() {
  const mapsDir = path.join(DATA, "course-maps");
  let count = 0;
  try {
    const owners = await readdir(mapsDir);
    for (const ownerId of owners) {
      const ownerPath = path.join(mapsDir, ownerId);
      const files = await readdir(ownerPath);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        const map = JSON.parse(
          await readFile(path.join(ownerPath, file), "utf8")
        );
        const { error } = await supabase.from("course_maps").upsert(
          {
            id: map.id,
            user_id: map.userId,
            course_map_overview: map.course_map_overview,
            concept_map: map.concept_map,
            learning_graph_edges: map.learning_graph_edges ?? [],
            learning_sequence: map.learning_sequence ?? [],
            high_yield_map: map.high_yield_map,
            knowledge_gaps: map.knowledge_gaps ?? [],
            source_text: map.sourceText ?? "",
            created_at: map.createdAt,
            updated_at: map.updatedAt,
          },
          { onConflict: "id" }
        );
        if (error) console.warn("map", map.id, error.message);
        else count++;
      }
    }
  } catch {
    console.log("No .data/course-maps to import");
    return;
  }
  console.log(`Imported ${count} course maps`);
}

console.log("Importing local .data/ → Supabase...\n");
await importUsers();
await importAccess();
await importMaps();
console.log("\nDone.");
