/**
 * Quick production smoke test (no OpenAI generate).
 * Usage: node scripts/e2e-prod-smoke.mjs https://your-domain.com
 */
const BASE = process.argv[2];
if (!BASE) {
  console.error("Usage: node scripts/e2e-prod-smoke.mjs <baseUrl>");
  process.exit(1);
}

let passed = 0;
let failed = 0;

function ok(name, cond, detail = "") {
  if (cond) {
    passed++;
    console.log(`  ✓ ${name}`);
  } else {
    failed++;
    console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

async function main() {
  console.log(`\nProduction smoke — ${BASE}\n`);

  for (const path of ["/", "/generate", "/api/access"]) {
    const res = await fetch(`${BASE}${path}`);
    ok(`GET ${path}`, res.ok, `status ${res.status}`);
  }

  const signup = await fetch(`${BASE}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `smoke-${Date.now()}@example.com`,
      password: "password12345",
      name: "Smoke Test",
    }),
  });
  const signupJson = await signup.json().catch(() => ({}));
  ok(
    "POST /api/auth/signup",
    signup.ok && signupJson.success,
    signupJson.error ?? `status ${signup.status}`
  );

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
