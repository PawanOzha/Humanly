/** Where the Humanora app lives. Every account and product CTA on the landing goes there. */
export const APP = "https://app.humanora.app";
export const LINKS = {
  signup: `${APP}/signup`,
  login: `${APP}/login`,
  pricingSignup: `${APP}/signup?next=${encodeURIComponent("/pricing")}`,
  docs: `${APP}/docs`,
  apiKeys: `${APP}/settings/api`,
  plans: `${APP}/pricing`,
} as const;
