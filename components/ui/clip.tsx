import type { CSSProperties } from "react";

export const Clip = ({ style, rotate = 0 }: { style?: CSSProperties; rotate?: number }) => (
  <svg width="26" height="64" viewBox="0 0 26 64" fill="none" stroke="#9aa0a6" strokeWidth="2.4" strokeLinecap="round"
    style={{ position: "absolute", transform: `rotate(${rotate}deg)`, filter: "drop-shadow(0 2px 2px rgba(0,0,0,.2))", zIndex: 3, ...style }}>
    <path d="M18 14v34a6 6 0 01-12 0V12a8 8 0 0116 0v34a3.5 3.5 0 01-7 0V16" />
  </svg>
);
