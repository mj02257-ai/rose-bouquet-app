'use client';

import { WrapperStyle } from '@/types/bouquet';

interface BouquetWrapperProps {
  wrapper: WrapperStyle;
  width?: number;
  height?: number;
  isOpen?: boolean;
  isWrapping?: boolean;
}

export default function BouquetWrapper({
  wrapper,
  width = 200,
  height = 220,
  isOpen = false,
  isWrapping = false,
}: BouquetWrapperProps) {
  const { paperColor: c1, paperDark: c2, ribbonColor: rc, id } = wrapper;

  const wrapStyle: React.CSSProperties = isWrapping
    ? { animation: 'wrapClose 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards' }
    : {};

  /* ── OPEN: flat rectangular wrapping paper sheet ────────────────────── */
  if (isOpen) {
    const sw = width;
    const sh = Math.round(height * 0.52);
    return (
      <svg
        width={sw}
        height={sh}
        viewBox="0 0 280 130"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Main paper surface — lit from upper-left */}
          <linearGradient id={`os-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor={c1} stopOpacity="1" />
            <stop offset="40%"  stopColor={c1} />
            <stop offset="72%"  stopColor={c2} stopOpacity="0.55" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.80" />
          </linearGradient>
          {/* Edge vignette */}
          <radialGradient id={`ov-${id}`} cx="50%" cy="50%" r="70%">
            <stop offset="0%"   stopColor={c1} stopOpacity="0" />
            <stop offset="80%"  stopColor={c2} stopOpacity="0.18" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.42" />
          </radialGradient>
          {/* Paper sheen band */}
          <linearGradient id={`oh-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="white" stopOpacity="0.04" />
            <stop offset="30%"  stopColor="white" stopOpacity="0.12" />
            <stop offset="52%"  stopColor="white" stopOpacity="0.20" />
            <stop offset="72%"  stopColor="white" stopOpacity="0.08" />
            <stop offset="100%" stopColor="white" stopOpacity="0.03" />
          </linearGradient>
          {/* Bottom darkening */}
          <linearGradient id={`ob-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={c2} stopOpacity="0" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* Drop shadow beneath the sheet */}
        <ellipse cx="140" cy="130" rx="128" ry="10" fill="black" opacity="0.09" />

        {/* Main paper body */}
        <rect x="4" y="4" width="272" height="116" rx="2" fill={`url(#os-${id})`} />
        <rect x="4" y="4" width="272" height="116" rx="2" fill={`url(#ov-${id})`} />
        <rect x="4" y="4" width="272" height="116" rx="2" fill={`url(#oh-${id})`} />
        <rect x="4" y="60" width="272" height="60" rx="0" fill={`url(#ob-${id})`} opacity="0.6" />

        {/* Texture lines */}
        <path d="M 10,36 L 270,36" stroke={c2} strokeWidth="0.4" opacity="0.09" />
        <path d="M 10,72 L 270,72" stroke={c2} strokeWidth="0.4" opacity="0.07" />
        <path d="M 10,108 L 270,108" stroke={c2} strokeWidth="0.4" opacity="0.09" />

        {/* Center fold crease */}
        <path d="M 140,4 L 140,120" stroke={c2} strokeWidth="0.6" opacity="0.11" />

        {/* Left edge fold */}
        <path d="M 4,4 L 4,120 Q 26,112 34,64 Q 26,20 4,4" fill={c2} opacity="0.07" />
        {/* Right edge fold */}
        <path d="M 276,4 L 276,120 Q 254,112 246,64 Q 254,20 276,4" fill={c2} opacity="0.05" />

        {/* Corner curl */}
        <path d="M 266,4 Q 272,8 274,16 Q 270,8 264,6 Q 258,5 252,8 Q 256,4 266,4 Z" fill={c2} opacity="0.18" />

        {/* Border */}
        <rect x="4" y="4" width="272" height="116" rx="2" fill="none" stroke={c2} strokeWidth="0.8" opacity="0.16" />
      </svg>
    );
  }

  /* ── CLOSED: cone-shaped wrapped bouquet ────────────────────────────── */
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', ...wrapStyle }}
    >
      <defs>
        <linearGradient id={`wp-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c2} />
          <stop offset="18%"  stopColor={c1} />
          <stop offset="48%"  stopColor={c1} />
          <stop offset="76%"  stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <radialGradient id={`ws-${id}`} cx="50%" cy="0%" r="80%">
          <stop offset="0%"   stopColor={c2} stopOpacity="0.38" />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`wr-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={rc} />
          <stop offset="100%" stopColor={c2} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`wh-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="white" stopOpacity="0" />
          <stop offset="34%"  stopColor="white" stopOpacity="0.07" />
          <stop offset="55%"  stopColor="white" stopOpacity="0.13" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Drop shadow */}
      <path d="M 8,70 Q 100,50 192,70 L 130,215 Q 100,228 70,215 Z" fill={c2} opacity="0.40" />

      {/* Main cone */}
      <path d="M 18,76 Q 100,56 182,76 L 124,212 Q 100,224 76,212 Z" fill={`url(#wp-${id})`} />
      <path d="M 18,76 Q 100,56 182,76 L 124,212 Q 100,224 76,212 Z" fill={`url(#wh-${id})`} />
      <path d="M 18,76 Q 100,56 182,76 L 154,134 Q 100,112 46,134 Z" fill={`url(#ws-${id})`} />

      {/* Fold lines */}
      <path d="M 18,76 L 76,212 Q 62,208 56,196 L 20,78 Z" fill={c2} opacity="0.26" />
      <path d="M 182,76 L 124,212 Q 138,208 145,196 L 180,78 Z" fill="white" opacity="0.06" />
      <line x1="100" y1="60" x2="100" y2="220" stroke="white" strokeWidth="0.75" opacity="0.07" />

      {/* Texture folds */}
      <path d="M 18,76 Q 68,70 100,68 Q 132,70 182,76" stroke={c2} strokeWidth="0.6" fill="none" opacity="0.11" />
      <path d="M 32,110 Q 100,98 168,110" stroke={c2} strokeWidth="0.5" fill="none" opacity="0.07" />

      {/* Ribbon band */}
      <path d="M 56,134 Q 100,120 144,134 L 142,152 Q 100,166 58,152 Z" fill={`url(#wr-${id})`} opacity="0.94" />
      <path d="M 56,134 Q 100,120 144,134" stroke="white" strokeWidth="1.4" fill="none" strokeLinecap="round" opacity="0.22" />

      {/* Bow left loop */}
      <path d="M 100,141 C 74,116 52,120 55,135 C 57,148 76,152 100,141 Z" fill={rc} opacity="0.97" />
      <path d="M 100,141 C 74,116 52,120 55,135" stroke="white" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.22" />

      {/* Bow right loop */}
      <path d="M 100,141 C 126,116 148,120 145,135 C 143,148 124,152 100,141 Z" fill={rc} opacity="0.97" />
      <path d="M 100,141 C 126,116 148,120 145,135" stroke="white" strokeWidth="0.9" fill="none" strokeLinecap="round" opacity="0.22" />

      {/* Knot */}
      <ellipse cx="100" cy="141" rx="8.5" ry="6.5" fill={rc} />
      <ellipse cx="99.5" cy="140" rx="3.8" ry="2.8" fill="white" opacity="0.20" />

      {/* Ribbon tails */}
      <path d="M 100,148 C 92,161 86,176 88,192" stroke={rc} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.72" />
      <path d="M 100,148 C 108,161 114,176 112,192" stroke={rc} strokeWidth="3.2" fill="none" strokeLinecap="round" opacity="0.72" />

      {/* Ruffled top edge */}
      <path
        d="M 18,76 Q 36,64 55,76 Q 72,62 90,76 Q 110,62 128,76 Q 147,62 165,76 Q 176,63 182,76"
        fill="none" stroke={c1} strokeWidth="2" strokeLinecap="round" opacity="0.55"
      />
    </svg>
  );
}
