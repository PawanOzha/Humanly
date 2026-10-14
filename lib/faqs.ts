import { fmt, TIERS, TRIAL_WORDS } from "@/lib/plans";

/** Shared by the FAQ section and the FAQPage structured data so they never drift. */
export const FAQS: [string, string][] = [
  ["How does the AI score work?", "Each sentence is scored for patterns common in AI writing — stock phrases, uniform rhythm, missing contractions — and the sentence scores roll up into one overall percentage."],
  ["Will it change my meaning?", "The rewrite targets phrasing, rhythm and tone. Review the result and flip to the original at any time to compare."],
  ["Which tones can I use?", "Balanced, Academic and Casual. Switch before you humanize."],
  ["Can I check text without rewriting it?", "Yes. “Check AI score” marks up your draft without changing a word."],
  ["Is there a free plan?", `Yes. Free includes ${fmt(TIERS[0].words)} words every day, no card needed. Paste a draft above to try it now.`],
  ["Is there a free trial of the paid plans?", `Yes. Plus and Pro start with a 7-day free trial that includes ${fmt(TRIAL_WORDS)} words. Cancel before it ends and you won't be charged.`],
  ["Is there an API?", "Yes. Create a personal API key in Settings and call the REST API to humanize or check text. It uses the same word allowance as the app."],
];
