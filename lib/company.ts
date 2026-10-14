/**
 * Business facts shown on the trust and legal pages. Every "[TODO: ...]" value must be filled in by the owner
 * before these pages are relied on. Do not guess them.
 */
export const COMPANY = {
  brand: "Humanora",
  legalName: "Humanora",
  address: "Kathmandu, Nepal 44600",
  jurisdiction: "Nepal",
  supportEmail: "support@humanora.app",
  privacyEmail: "support@humanora.app",
  securityEmail: "support@humanora.app",
  modelHosting: "GPU servers that Humanora operates through a GPU cloud hosting provider",
  dbRegion: "a PostgreSQL database on servers operated by Humanora",
  logRetention: "kept while your account is active. For free accounts with no sign-in or use for 30 days, documents, rewrite history, session records and API usage logs are deleted automatically. Paid accounts keep their data while the subscription is active",
  refundWindow: "24 hours",
  minAge: "16",
  updated: "October 14, 2026",
} as const;

export const LEGAL_PAGES = [
  ["About", "/about"],
  ["Contact", "/contact"],
  ["Security", "/security"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ["Cookies", "/cookies"],
  ["Refunds", "/refund"],
] as const;
