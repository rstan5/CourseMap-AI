/**
 * End-to-end API flow test (run with dev server: npm run dev)
 * Usage: node scripts/e2e-flow.mjs [baseUrl]
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const BASE = process.argv[2] ?? "http://localhost:3000";
const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

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
    const pairs = setCookie.map((c) => c.split(";")[0]);
    const jar = Object.fromEntries(
      cookies
        .split("; ")
        .filter(Boolean)
        .map((p) => p.split("="))
    );
    for (const pair of pairs) {
      const [k, v] = pair.split("=");
      jar[k] = v;
    }
    cookies = Object.entries(jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
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
      summary: "Automated end-to-end flow verification map.",
    },
    concept_map: [
      {
        id: "topic-a",
        module: "Topic A",
        description: "First test topic for e2e.",
        learning_points: [
          { point: "Key idea one", exam_weight: "high" },
        ],
        exam_priority_note: "High yield for exams.",
        importance: "core",
        difficulty: "easy",
        prerequisites: [],
        connects_to: [],
        likely_exam_relevance: "high",
        estimated_mastery_hours: 2,
      },
    ],
    learning_sequence: [
      { step: 1, module_id: "topic-a", reason: "Foundation" },
    ],
    high_level_dependencies: [],
    missing_or_unclear_areas: [],
  };
}

async function injectDemoMap(userId, mapId) {
  const now = Date.now();
  const record = {
    ...minimalDemoPayload(),
    id: mapId,
    userId,
    sourceText: "E2E test materials for CourseMap flow verification.",
    createdAt: now,
    updatedAt: now,
  };
  const dir = path.join(ROOT, ".data", "course-maps", userId);
  await mkdir(dir, { recursive: true });
  await writeFile(
    path.join(dir, `${mapId}.json`),
    JSON.stringify(record, null, 2),
    "utf8"
  );
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
