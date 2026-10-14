/**
 * Business facts shown on the trust and legal pages. Every "[TODO: ...]" value must be filled in by the owner
 * before these pages are relied on. Do not guess them.
 */
export const COMPANY = {
  brand: "Humanora",
  legalName: "[TODO: legal entity name, e.g. registered company or sole proprietor]",
  address: "[TODO: registered business address]",
  jurisdiction: "[TODO: governing law / country]",
  supportEmail: "[TODO: support email, e.g. support@humanora.app]",
  privacyEmail: "[TODO: privacy email, e.g. privacy@humanora.app]",
  securityEmail: "[TODO: security email, e.g. security@humanora.app]",
  modelHosting: "[TODO: where the writing model runs, e.g. our own servers in <country> / provider name]",
  dbRegion: "[TODO: country/region where the database is hosted]",
  logRetention: "[TODO: how long server and audit logs are kept, e.g. 30 days]",
  refundWindow: "[TODO: refund window, e.g. 14 days]",
  minAge: "[TODO: minimum age, e.g. 13 or 16]",
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
