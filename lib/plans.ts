import data from "./plans.generated.json";

/** Plan facts copied from the Humanora app by scripts/sync-plans.mjs (never edit the JSON by hand). */
export type Tier = (typeof data.tiers)[number];
export const TIERS: Tier[] = data.tiers;
export const TRIAL_WORDS = data.trialWords;
export const API_LIMITS = data.api;
export const fmt = (n: number) => n.toLocaleString("en-US");
