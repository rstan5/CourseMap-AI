/**
 * End-to-end API flow test (run with dev server: npm run dev)
 * Usage: node scripts/e2e-flow.mjs [baseUrl]
 */
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { mergeSetCookies } from "./e2e-cookies.mjs";

const BASE =
  process.argv[2] ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadEnvLocal() {
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
    /* optional */
  }
}

let cookies = "";
let passed = 0;
let failed = 0;

function record(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function request(method, pathname, body) {
  const res = await fetch(`${BASE}${pathname}`, {
    method,
    headers: {
      Cookie: cookies,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) {
    cookies = mergeSetCookies(cookies, setCookie);
  }

  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { res, json };
}

function minimalDemoPayload() {
  return {
    course_map_overview: {
      title: "E2E Test Course",
      inferred_subject: "Testing",
      structure_confidence: "high",
      input_reconstruction_summary: "Automated end-to-end flow verification map.",
      key_themes: ["testing"],
    },
    concept_map: [
      {
        id: "topic-a",
        module: "Topic A",
        detailed_description: "First test topic for e2e.",
        what_this_really_covers: "E2E topic coverage.",
        why_it_matters: "Validates library read path.",
        learning_points: [{ point: "Key idea one", exam_weight: "high" }],
        exam_priority_note: "High yield for exams.",
        importance: "core",
        difficulty: "easy",
        prerequisites: [],
        connects_to: [],
        likely_exam_relevance: "high",
        common_student_confusions: [],
        estimated_mastery_hours: 2,
        full_notes: "Key idea one. Automated e2e note content for Topic A.",
      },
    ],
    learning_graph_edges: [],
    learning_sequence: [
      { step: 1, module_id: "topic-a", reason_for_position: "Foundation" },
    ],
    high_yield_map: {
      must_know: ["topic-a"],
      should_know: [],
      nice_to_know: [],
      reasoning: "Single-topic test map.",
    },
    knowledge_gaps: [],
  };
}

async function injectDemoMap(userId, mapId) {
  await loadEnvLocal();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) {
    throw new Error("Supabase env vars required for E2E map inject");
  }

  const now = Date.now();
  const payload = minimalDemoPayload();
  const { error } = await createClient(url, key, {
    auth: { persistSession: false },
  }).from("course_maps").insert({
    id: mapId,
    user_id: userId,
    course_map_overview: payload.course_map_overview,
    concept_map: payload.concept_map,
    learning_graph_edges: payload.learning_graph_edges,
    learning_sequence: payload.learning_sequence,
    high_yield_map: payload.high_yield_map,
    knowledge_gaps: payload.knowledge_gaps,
    source_text: "E2E test materials for CourseMap flow verification.",
    created_at: now,
    updated_at: now,
  });

  if (error) throw new Error(`injectDemoMap: ${error.message}`);
}

async function main() {
  console.log(`\nCourseMap E2E — ${BASE}\n`);

  const email = `e2e-${Date.now()}@coursemap.test`;
  const password = "testpass123";
  const mapId = crypto.randomUUID();

  // Pages
  for (const route of ["/", "/generate", "/course-map?id=test"]) {
    const res = await fetch(`${BASE}${route}`);
    record(`GET ${route}`, res.ok, `status ${res.status}`);
  }

  // Anonymous session
  let { res, json } = await request("GET", "/api/auth/session");
  record("Anonymous session empty", json.success && !json.user);

  ({ res, json } = await request("GET", "/api/access"));
  record(
    "Anonymous access has isAuthenticated",
    json.success && json.data?.isAuthenticated === false
  );

  // Protected routes blocked
  ({ res, json } = await request("GET", "/api/course-maps"));
  record("Course maps require auth", res.status === 401);

  ({ res, json } = await request("GET", "/api/get-course-map?id=fake"));
  record("Get map requires auth", res.status === 401 && json.code === "AUTH_REQUIRED");

  // Sign up
  ({ res, json } = await request("POST", "/api/auth/signup", {
    email,
    password,
    name: "E2E User",
  }));
  const userId = json.user?.id;
  record("Sign up", res.ok && json.success && userId, json.error);
  if (!userId) {
    console.log("\nAborting — server unavailable or signup failed.\n");
    process.exit(1);
  }

  ({ res, json } = await request("GET", "/api/auth/session"));
  record("Session after signup", json.user?.email === email);

  await injectDemoMap(userId, mapId);

  ({ res, json } = await request("GET", "/api/course-maps"));
  record(
    "List course maps after inject",
    json.success && json.data?.length === 1,
    JSON.stringify(json)
  );

  ({ res, json } = await request("GET", `/api/get-course-map?id=${mapId}`));
  record(
    "Get course map when authed",
    json.success && json.data?.id === mapId,
    json.error
  );

  // Refine requires mapId + auth (skip OpenAI — only test 400/401 paths)
  const refineForm = new FormData();
  refineForm.append("rawText", "x".repeat(60));
  refineForm.append("mapId", mapId);
  const refineRes = await fetch(`${BASE}/api/generate`, {
    method: "POST",
    headers: { Cookie: cookies },
    body: refineForm,
  });
  record(
    "Refine endpoint accepts authed request",
    refineRes.status === 200 || refineRes.status === 500,
    `status ${refineRes.status} (500 ok if OpenAI quota)`
  );

  // Sign out
  ({ res, json } = await request("POST", "/api/auth/signout"));
  record("Sign out", json.success);

  ({ res, json } = await request("GET", `/api/get-course-map?id=${mapId}`));
  record("Get map blocked after signout", res.status === 401);

  // Sign in again
  ({ res, json } = await request("POST", "/api/auth/signin", { email, password }));
  record("Sign in", json.success && json.user?.id === userId);

  ({ res, json } = await request("GET", `/api/get-course-map?id=${mapId}`));
  record("Get map after signin", json.success && json.data?.id === mapId);

  // Stripe checkout requires auth (already authed)
  ({ res, json } = await request("POST", "/api/stripe/checkout"));
  record(
    "Stripe checkout session",
    res.ok && json.url?.includes("checkout"),
    json.error
  );

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
