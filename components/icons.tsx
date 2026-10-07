const sv = { fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const Ico = {
  arrow: <svg width="14" height="14" viewBox="0 0 16 16" {...sv} strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4" /></svg>,
  check: <svg width="14" height="14" viewBox="0 0 16 16" {...sv} strokeWidth="2"><path d="M3 8.5l3.2 3L13 4.5" /></svg>,
  paste: <svg width="14" height="14" viewBox="0 0 16 16" {...sv} strokeWidth="1.5"><rect x="3" y="3" width="10" height="11" rx="2" /><path d="M6 3V2.5A.5.5 0 016.5 2h3a.5.5 0 01.5.5V3" /></svg>,
  pen: <svg width="16" height="16" viewBox="0 0 16 16" {...sv} strokeWidth="1.5"><path d="M10.5 2.5l3 3L6 13H3v-3z" /></svg>,
  mail: <svg width="16" height="16" viewBox="0 0 16 16" {...sv} strokeWidth="1.5"><rect x="2" y="3.5" width="12" height="9" rx="2" /><path d="M2.5 5l5.5 4 5.5-4" /></svg>,
  doc: <svg width="16" height="16" viewBox="0 0 16 16" {...sv} strokeWidth="1.5"><path d="M4 2h5l3 3v9H4z" /><path d="M6 8h4M6 11h4" /></svg>,
} as const;
