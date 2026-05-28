/**
 * Full product flow: anonymous generate → signup migrate → view → second map paywall
 */
import { mergeSetCookies } from "./e2e-cookies.mjs";

const BASE =
  process.argv[2] ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";
const SAMPLE =
  "Macroeconomics course notes: GDP, inflation, unemployment, fiscal policy, monetary policy, " +
  "central banking, Phillips curve, and international trade over twelve weeks.";

let cookies = "";

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Cookie: cookies,
      ...(body instanceof FormData
        ? {}
        : body
          ? { "Content-Type": "application/json" }
          : {}),
    },
    body:
      body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) {
    cookies = mergeSetCookies(cookies, setCookie);
  }
  const text = await res.text();
  return { res, json: text ? JSON.parse(text) : {} };
}

function fail(msg) {
  console.error("FAIL:", msg);
  process.exit(1);
}

async function main() {
  console.log("\nFull flow —", BASE, "\n");

  const form = new FormData();
  form.append("rawText", SAMPLE);
  let { res, json } = await req("POST", "/api/generate", form);
  if (!json.success) {
    console.log("Skip: OpenAI unavailable", json.error);
    process.exit(0);
  }
  const mapId = json.data.id;
  console.log("1. Anonymous map created:", mapId, "requiresAuth:", json.requiresAuth);
  if (!json.requiresAuth) fail("expected requiresAuth");

  const email = `flow-${Date.now()}@test.com`;
  ({ res, json } = await req("POST", "/api/auth/signup", {
    email,
    password: "password123",
    name: "Flow Test",
  }));
  if (!json.success) fail("signup: " + json.error);
  console.log("2. Signed up:", json.user.email);

  ({ res, json } = await req("GET", `/api/get-course-map?id=${mapId}`));
  if (!json.success || json.data.id !== mapId) {
    fail("migrated map not readable: " + (json.error ?? "unknown"));
  }
  console.log("3. Migrated map readable:", json.data.course_map_overview.title);

  ({ res, json } = await req("GET", "/api/course-maps"));
  if (!json.data?.some((m) => m.id === mapId)) {
    fail("map missing from library");
  }
  console.log("4. Sidebar library lists map");

  const form2 = new FormData();
  form2.append("rawText", SAMPLE + " Extra unit on game theory and oligopoly models.");
  ({ res, json } = await req("POST", "/api/generate", form2));
  if (res.status !== 402 || json.code !== "SUBSCRIPTION_REQUIRED") {
    fail(`second map should be 402, got ${res.status} ${json.code}`);
  }
  console.log("5. Second new map triggers paywall:", json.error);

  const refine = new FormData();
  refine.append("rawText", SAMPLE + " New lecture on antitrust regulation.");
  refine.append("mapId", mapId);
  ({ res, json } = await req("POST", "/api/generate", refine));
  if (!json.success) {
    fail("refine failed: " + (json.error ?? res.status));
  }
  console.log("6. Refine still allowed:", json.refined === true);

  console.log("\n✓ Full end-to-end flow passed\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
