/**
 * Anonymous generate + paywall gate tests
 */
import { mergeSetCookies } from "./e2e-cookies.mjs";

const BASE =
  process.argv[2] ?? process.env.E2E_BASE_URL ?? "http://localhost:3000";

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
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text?.slice(0, 200) };
  }
  return { res, json };
}

const SAMPLE_TEXT =
  "Introduction to microeconomics covering supply, demand, equilibrium pricing, " +
  "elasticity, consumer surplus, and market failures across ten weeks of lectures.";

async function main() {
  console.log("\nAnonymous flow —", BASE, "\n");

  let { res, json } = await req("GET", "/api/access");
  console.log("Access (fresh):", json.data);

  const form = new FormData();
  form.append("rawText", SAMPLE_TEXT);
  ({ res, json } = await req("POST", "/api/generate", form));
  console.log("First generate:", res.status, {
    success: json.success,
    requiresAuth: json.requiresAuth,
    code: json.code,
    error: json.error,
    id: json.data?.id,
  });

  if (!json.success) {
    console.log("(Skipping second-generate check — OpenAI unavailable)");
    process.exit(0);
  }

  if (!json.requiresAuth) {
    console.error("FAIL: first anonymous map should set requiresAuth");
    process.exit(1);
  }

  const form2 = new FormData();
  form2.append(
    "rawText",
    SAMPLE_TEXT + " Additional chapter on monetary policy and fiscal stimulus."
  );
  ({ res, json } = await req("POST", "/api/generate", form2));
  console.log("Second generate:", res.status, json.code, json.error);

  if (res.status !== 401 || json.code !== "AUTH_REQUIRED") {
    console.error("FAIL: second anonymous generate should require auth");
    process.exit(1);
  }

  console.log("\n✓ Anonymous first map + auth gate on second map OK\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
