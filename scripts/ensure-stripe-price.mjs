import Stripe from "stripe";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envPath = join(root, ".env.local");

function loadEnv() {
  if (!existsSync(envPath)) {
    console.error("Missing .env.local");
    process.exit(1);
  }
  const env = {};
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const i = trimmed.indexOf("=");
    if (i === -1) continue;
    env[trimmed.slice(0, i)] = trimmed.slice(i + 1);
  }
  return env;
}

function upsertEnv(key, value) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  const re = new RegExp(`^${key}=.*$`, "m");
  const line = `${key}=${value}`;
  content = re.test(content)
    ? content.replace(re, line)
    : `${content.trimEnd()}\n${line}\n`;
  writeFileSync(envPath, content);
}

const env = loadEnv();
const secret = env.STRIPE_SECRET_KEY;
if (!secret) {
  console.error("STRIPE_SECRET_KEY missing in .env.local");
  process.exit(1);
}

if (env.STRIPE_PRICE_ID) {
  console.log(`STRIPE_PRICE_ID already set: ${env.STRIPE_PRICE_ID}`);
  process.exit(0);
}

const stripe = new Stripe(secret);
const product = await stripe.products.create({
  name: "CourseMap Pro",
  description: "Unlimited course maps — $5/month",
});
const price = await stripe.prices.create({
  product: product.id,
  unit_amount: 500,
  currency: "usd",
  recurring: { interval: "month" },
});

upsertEnv("STRIPE_PRICE_ID", price.id);
console.log(`Created price ${price.id} and saved to .env.local`);
