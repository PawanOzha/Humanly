// Copies plan facts from the Humanora app (single source of truth) into lib/plans.generated.json.
// Runs before every build when the app checkout is present (HUMANORA_APP_DIR or ../humanizer); otherwise the committed JSON is used as is.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const app = resolve(process.env.HUMANORA_APP_DIR || "../humanizer");
const out = resolve("lib/plans.generated.json");
const plans = `${app}/app/lib/billing/plans.ts`, limits = `${app}/app/lib/api/limits.ts`, paddle = `${app}/app/lib/server/billing/paddle.ts`;
if (!existsSync(plans)) { console.log(`[sync-plans] ${plans} not found; keeping committed ${out}`); process.exit(0); }
const { TIERS } = await import(plans);
const { RATE_PER_MIN, CONCURRENCY } = await import(limits);
const m = /: (\d[\d_]*);\s*};?\s*$/m.exec(readFileSync(paddle, "utf8").split("\n").find((l) => l.includes("export const trialWords")) ?? "");
if (!m) throw new Error("[sync-plans] couldn't read the trial word default from paddle.ts");
const data = {
  source: "humanizer/app/lib/billing/plans.ts",
  trialWords: Number(m[1].replaceAll("_", "")),
  tiers: TIERS.map(({ id, name, tagline, words, period, usd, features, highlight, badge, trialDays }) => ({ id, name, tagline, words, period, usd, features, highlight: !!highlight, badge: badge ?? null, trialDays: trialDays ?? null })),
  api: { ratePerMin: RATE_PER_MIN, concurrency: CONCURRENCY },
};
const next = JSON.stringify(data, null, 2) + "\n";
if (!existsSync(out) || readFileSync(out, "utf8") !== next) { writeFileSync(out, next); console.log("[sync-plans] updated", out); } else console.log("[sync-plans] up to date");
