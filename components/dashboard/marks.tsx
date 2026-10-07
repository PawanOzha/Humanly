export type MarkName =
  | "overview"
  | "detect"
  | "humanize"
  | "pdf"
  | "documents"
  | "plans"
  | "plus"
  | "arrow"
  | "trash"
  | "copy"
  | "upload"
  | "menu"
  | "close"
  | "home"
  | "lock"
  | "check"
  | "search"
  | "chevron";

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function Mark({ name, size = 16 }: { name: MarkName; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      {name === "overview" && (
        <>
          <rect x="4" y="4" width="7" height="7" rx="1.8" {...stroke} />
          <rect x="13" y="4" width="7" height="7" rx="1.8" {...stroke} />
          <rect x="4" y="13" width="7" height="7" rx="1.8" {...stroke} />
          <rect x="13" y="13" width="7" height="7" rx="1.8" {...stroke} />
        </>
      )}
      {name === "detect" && (
        <>
          <circle cx="11" cy="11" r="6.5" {...stroke} />
          <path d="M20 20l-4.2-4.2M8.4 11.2l1.8 1.8 3.4-3.6" {...stroke} />
        </>
      )}
      {name === "humanize" && (
        <>
          <path d="M14.2 5.2l4.6 4.6L9.2 19.4H4.6v-4.6z" {...stroke} />
          <path d="M12.4 7l4.6 4.6" {...stroke} />
        </>
      )}
      {name === "pdf" && (
        <>
          <path d="M7 3.5h7.2L18.5 8v12.5H7z" {...stroke} />
          <path d="M14.2 3.5V8H18.5M10 13h6M10 16.5h6" {...stroke} />
        </>
      )}
      {name === "documents" && (
        <>
          <path d="M8 4.5h8.5a1.5 1.5 0 011.5 1.5v12a1.5 1.5 0 01-1.5 1.5H8A1.5 1.5 0 016.5 18V6A1.5 1.5 0 018 4.5z" {...stroke} />
          <path d="M9.5 9h5M9.5 12.5h5M9.5 16h3" {...stroke} />
        </>
      )}
      {name === "plans" && (
        <>
          <rect x="4" y="6" width="16" height="12.5" rx="2.4" {...stroke} />
          <path d="M4 10.5h16M8 15h3" {...stroke} />
        </>
      )}
      {name === "plus" && <path d="M12 5v14M5 12h14" {...stroke} />}
      {name === "arrow" && <path d="M5 12h14M13 6l6 6-6 6" {...stroke} />}
      {name === "trash" && (
        <>
          <path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7" {...stroke} />
          <path d="M10.5 11v5M13.5 11v5" {...stroke} />
        </>
      )}
      {name === "copy" && (
        <>
          <rect x="8.5" y="8.5" width="11" height="11" rx="2.2" {...stroke} />
          <path d="M15.5 8.5V6.7a2.2 2.2 0 00-2.2-2.2H6.7a2.2 2.2 0 00-2.2 2.2v6.6a2.2 2.2 0 002.2 2.2h1.8" {...stroke} />
        </>
      )}
      {name === "upload" && (
        <>
          <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5" {...stroke} />
          <path d="M5 15.5v2A1.5 1.5 0 006.5 19h11a1.5 1.5 0 001.5-1.5v-2" {...stroke} />
        </>
      )}
      {name === "menu" && <path d="M5 8h14M5 16h14" {...stroke} />}
      {name === "close" && <path d="M6 6l12 12M18 6L6 18" {...stroke} />}
      {name === "home" && <path d="M5 11l7-6 7 6v8a1 1 0 01-1 1h-4v-5h-4v5H6a1 1 0 01-1-1z" {...stroke} />}
      {name === "lock" && (
        <>
          <rect x="6" y="11" width="12" height="8.5" rx="2.2" {...stroke} />
          <path d="M8.5 11V8.5a3.5 3.5 0 017 0V11" {...stroke} />
        </>
      )}
      {name === "check" && <path d="M5.5 12.5l4.2 4L18.5 7.5" {...stroke} />}
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="6" {...stroke} />
          <path d="M20 20l-4.4-4.4" {...stroke} />
        </>
      )}
      {name === "chevron" && <path d="M9 6l6 6-6 6" {...stroke} />}
    </svg>
  );
}
