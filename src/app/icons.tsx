import type { CSSProperties } from "react";

type P = { size?: number; style?: CSSProperties };

function Svg({ size = 20, style, children }: P & { children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor"
      strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round"
      style={style} aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ── Format icons ── */

export function IconQuiz(p: P) {
  return (
    <Svg {...p}>
      <rect x="2" y="2" width="9" height="9" rx="2" />
      <rect x="13" y="2" width="9" height="9" rx="2" />
      <rect x="2" y="13" width="9" height="9" rx="2" />
      <rect x="13" y="13" width="9" height="9" rx="2" />
    </Svg>
  );
}

export function IconTrueFalse(p: P) {
  return (
    <Svg {...p}>
      <circle cx="7" cy="12" r="5" />
      <path d="M4.5 12l2 2 3-4" />
      <circle cx="17" cy="12" r="5" />
      <path d="M15 10l4 4M19 10l-4 4" />
    </Svg>
  );
}

export function IconFlashcard(p: P) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M7 10h10M7 14h6" />
    </Svg>
  );
}

export function IconFillBlank(p: P) {
  return (
    <Svg {...p}>
      <line x1="3" y1="9" x2="7" y2="9" />
      <line x1="8.5" y1="9" x2="14.5" y2="9" strokeDasharray="1.5 1.2" />
      <line x1="16" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="3" y1="21" x2="13" y2="21" />
    </Svg>
  );
}

export function IconMatching(p: P) {
  return (
    <Svg {...p}>
      <circle cx="4" cy="8" r="2.5" />
      <circle cx="4" cy="16" r="2.5" />
      <circle cx="20" cy="8" r="2.5" />
      <circle cx="20" cy="16" r="2.5" />
      <line x1="6.5" y1="8" x2="17.5" y2="8" />
      <line x1="6.5" y1="16" x2="17.5" y2="16" strokeOpacity="0.35" />
    </Svg>
  );
}

/* ── Benefit icons ── */

export function IconZap(p: P) {
  return (
    <Svg {...p}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </Svg>
  );
}

export function IconStar(p: P) {
  return (
    <Svg {...p}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Svg>
  );
}

export function IconClock(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </Svg>
  );
}

export function IconBarChart(p: P) {
  return (
    <Svg {...p}>
      <line x1="18" y1="20" x2="18" y2="10" strokeWidth="2" />
      <line x1="12" y1="20" x2="12" y2="4" strokeWidth="2" />
      <line x1="6" y1="20" x2="6" y2="14" strokeWidth="2" />
    </Svg>
  );
}

/* ── Outcome icons ── */

export function IconTrendingUp(p: P) {
  return (
    <Svg {...p}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </Svg>
  );
}

export function IconMoon(p: P) {
  return (
    <Svg {...p}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </Svg>
  );
}

export function IconShield(p: P) {
  return (
    <Svg {...p}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

export function IconUsers(p: P) {
  return (
    <Svg {...p}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </Svg>
  );
}

export function IconDiamond(p: P) {
  return (
    <Svg {...p}>
      <polygon points="12 2 20 12 12 22 4 12" />
      <line x1="4" y1="12" x2="20" y2="12" strokeOpacity="0.4" strokeWidth={1.25} />
    </Svg>
  );
}

export function IconShare(p: P) {
  return (
    <Svg {...p}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </Svg>
  );
}

/* ── Utility icons ── */

export function IconLink(p: P) {
  return (
    <Svg {...p}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </Svg>
  );
}

export function IconEye(p: P) {
  return (
    <Svg {...p}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </Svg>
  );
}

export function IconPencil(p: P) {
  return (
    <Svg {...p}>
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
    </Svg>
  );
}

export function IconSearch(p: P) {
  return (
    <Svg {...p}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function IconUser(p: P) {
  return (
    <Svg {...p}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

export function IconCheckCircle(p: P) {
  return (
    <Svg {...p}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </Svg>
  );
}

export function IconInfo(p: P) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <circle cx="12" cy="16" r="0.5" fill="currentColor" strokeWidth="0" />
    </Svg>
  );
}

export function IconClipboard(p: P) {
  return (
    <Svg {...p}>
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6M9 16h4" />
    </Svg>
  );
}

export function IconHourglass(p: P) {
  return (
    <Svg {...p}>
      <path d="M5 2h14M5 22h14" />
      <path d="M5 2c0 7 7 10 7 10s7-3 7-10" />
      <path d="M5 22c0-7 7-10 7-10s7 3 7 10" />
    </Svg>
  );
}
