import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const base = (size = 16): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

/* ─── Brand & navigation ─── */
export function CowIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M5 11c0-3 1.5-5 3-5.5C9 5 10 4 12 4s3 1 4 1.5C17.5 6 19 8 19 11v3.5c0 1.5-.5 3-1.5 4S15 20 14 20h-4c-1 0-2.2-.5-3-1.5S5 16 5 14.5V11Z" />
      <path d="M8 5.5C8 4 8.5 3 9 2.5" />
      <path d="M16 5.5c0-1.5-.5-2-1-2.5" />
      <circle cx="9.5" cy="11" r="0.6" fill="currentColor" />
      <circle cx="14.5" cy="11" r="0.6" fill="currentColor" />
      <path d="M11 14.5c.5.5 1.5.5 2 0" />
      <ellipse cx="17" cy="13" rx="1.2" ry="1.6" />
    </svg>
  );
}

export function CowHead({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <ellipse cx="12" cy="13" rx="6" ry="5.5" />
      <path d="M7 8.5 5.5 6 7 5l1.5 2" />
      <path d="m17 8.5 1.5-2.5L17 5l-1.5 2" />
      <ellipse cx="9.5" cy="11" rx="0.8" ry="1.2" fill="currentColor" opacity="0.7" />
      <ellipse cx="14.5" cy="11" rx="0.8" ry="1.2" fill="currentColor" opacity="0.7" />
      <path d="M10 16c.6.5 1.4.7 2 .7s1.4-.2 2-.7" />
      <ellipse cx="12" cy="14.5" rx="1.2" ry="0.9" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function MilkDrop({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3c-3 4-5 7-5 10a5 5 0 0 0 10 0c0-3-2-6-5-10Z" />
      <path d="M10.5 13c.3 1.2 1 2 1.5 2.3.5-.3 1.2-1.1 1.5-2.3" />
    </svg>
  );
}

export function HeartIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M20.8 8.6a5 5 0 0 0-7.1 0L12 10.3l-1.7-1.7a5 5 0 1 0-7.1 7.1l1.7 1.7L12 21l7.1-7.1 1.7-1.7a5 5 0 0 0 0-7.1Z" />
    </svg>
  );
}

export function BabyIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M9 9.5h.01M15 9.5h.01" />
      <path d="M10.5 11c.5.4 1 .5 1.5.5s1-.1 1.5-.5" />
      <path d="M5 19c0-2 1-3.5 2.5-4.5" />
      <path d="M19 19c0-2-1-3.5-2.5-4.5" />
      <path d="M7 21h10" />
    </svg>
  );
}

export function Trophy({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M16 5h2.5a2.5 2.5 0 0 1 0 5H17" />
      <path d="M8 5H5.5a2.5 2.5 0 0 0 0 5H7" />
      <path d="M9 14h6l-1 6h-4l-1-6Z" />
      <path d="M8 20h8" />
    </svg>
  );
}

export function Activity({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M3 12h4l3-9 4 18 3-9h4" />
    </svg>
  );
}

export function Drop({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3v18M5 10c0 3.5 3 6 7 6s7-2.5 7-6" />
    </svg>
  );
}

export function Pregnant({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="7" r="3" />
      <path d="M12 10v9" />
      <path d="M9 13c-1.5 1-2 3-1 5M15 13c1.5 1 2 3 1 5" />
    </svg>
  );
}

export function Shield({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3 5 6v6c0 4.5 3 8 7 9 4-1 7-4.5 7-9V6l-7-3Z" />
    </svg>
  );
}

export function Syringe({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="m18 2 4 4" />
      <path d="m17 7-2 2" />
      <path d="m9 15-6 6" />
      <path d="m15 9-6 6" />
      <path d="m12 6 6 6" />
      <path d="m9 9 3 3" />
    </svg>
  );
}

export function CheckSquare({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  );
}

export function Female({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="9" r="5" />
      <path d="M12 14v7M9.5 18h5" />
    </svg>
  );
}

export function Male({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="10" cy="14" r="5" />
      <path d="m15 9 5-5M16 4h4v4" />
    </svg>
  );
}

export function Calf({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <ellipse cx="12" cy="14" rx="5" ry="4" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M10 8.5 9 7l1-.5 1 1M14 8.5l1-1.5-1-.5-1 1" />
      <circle cx="11" cy="9" r="0.4" fill="currentColor" />
      <circle cx="13" cy="9" r="0.4" fill="currentColor" />
      <path d="M7 14v2M17 14v2M9 18v2M15 18v2" />
    </svg>
  );
}

export function Bull({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <ellipse cx="12" cy="15" rx="6" ry="5" />
      <circle cx="12" cy="9" r="3" />
      <path d="M9 7 6 4M15 7l3-3" />
      <path d="M9 6c0-1 .5-1.5 1-1.5M15 6c0-1-.5-1.5-1-1.5" />
      <circle cx="10.5" cy="9" r="0.5" fill="currentColor" />
      <circle cx="13.5" cy="9" r="0.5" fill="currentColor" />
      <path d="M11 11.5c.3.3 1.7.3 2 0" />
      <path d="M10 14v3M14 14v3" />
    </svg>
  );
}

export function Ox({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <ellipse cx="12" cy="14" rx="6.5" ry="4.5" />
      <circle cx="12" cy="9" r="2.5" />
      <path d="M9 7 7 5M15 7l2-2" />
      <circle cx="11" cy="9" r="0.4" fill="currentColor" />
      <circle cx="13" cy="9" r="0.4" fill="currentColor" />
      <path d="M8 16h2M14 16h2" />
    </svg>
  );
}

export function PregnantIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="12" cy="6.5" r="2.8" />
      <path d="M9.5 9v3c-1.5 0-2.5 1-2.5 2.5 0 2 1.5 3 3 3 0 0 0 1.5 0 4M14.5 9v3c1.5 0 2.5 1 2.5 2.5 0 2-1.5 3-3 3 0 0 0 1.5 0 4" />
    </svg>
  );
}

export function SearchIcon({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Filter({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M4 5h16M7 12h10M10 19h4" />
    </svg>
  );
}

export function Sparkle({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="m6 6 2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" />
    </svg>
  );
}

export function HandHeart({ size, ...p }: IconProps) {
  return (
    <svg {...base(size)} {...p}>
      <path d="M11 14h2a2 2 0 1 0 0-4h-3l-3-3" />
      <path d="m5 13 4-4 3 3" />
      <path d="M11 21H6a2 2 0 0 1-2-2v-7l3-3h7l4 4v6a2 2 0 0 1-2 2h-3" />
    </svg>
  );
}

export function Logo({ size, ...p }: IconProps) {
  return (
    <svg {...base(size || 24)} {...p} strokeWidth="1.25">
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="9" cy="11" rx="0.7" ry="1.1" fill="currentColor" />
      <ellipse cx="15" cy="11" rx="0.7" ry="1.1" fill="currentColor" />
      <path d="M8 7c-1-1.5-2-1.5-2.5-1" />
      <path d="M16 7c1-1.5 2-1.5 2.5-1" />
      <path d="M10.5 14.5c.5.5 1 .7 1.5.7s1-.2 1.5-.7" />
      <path d="M9 17c1 .8 2 .8 3 0M12 17c1 .8 2 .8 3 0" />
    </svg>
  );
}
