'use client';

import { WrapperStyle } from '@/types/bouquet';

interface BouquetWrapperProps {
  wrapper: WrapperStyle;
  width?: number;
  height?: number;
  /**
   * isOpen=true  → flat spread paper shown in the editing canvas
   * isOpen=false → finished cone-shaped wrapped bouquet (default)
   */
  isOpen?: boolean;
  /** Play the closing fold animation (used by the transition overlay) */
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

  /* ── CSS for the fold animation ──────────────────────────── */
  const wrapStyle: React.CSSProperties = isWrapping
    ? { animation: 'wrapClose 1.1s cubic-bezier(0.4, 0, 0.2, 1) forwards' }
    : {};

  /* ── OPEN state — flat spread wrapping paper ──────────────── */
  if (isOpen) {
    return (
      <svg
        width={width}
        height={Math.round(height * 0.55)}
        viewBox="0 0 260 120"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* Paper surface gradient — lit from above */}
          <linearGradient id={`op-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={c1} stopOpacity="0.95" />
            <stop offset="40%"  stopColor={c1} />
            <stop offset="100%" stopColor={c2} stopOpacity="0.85" />
          </linearGradient>
          {/* Side-edge darkening */}
          <linearGradient id={`oe-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c2} stopOpacity="0.55" />
            <stop offset="18%"  stopColor={c1} stopOpacity="0" />
            <stop offset="82%"  stopColor={c1} stopOpacity="0" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.55" />
          </linearGradient>
          {/* Center fold crease gradient */}
          <linearGradient id={`oc-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={c2} stopOpacity="0.22" />
            <stop offset="100%" stopColor={c2} stopOpacity="0.06" />
          </linearGradient>
        </defs>

        {/* Main flat paper body — wide trapezoid */}
        <path
          d="M 10,118 L 52,8 L 208,8 L 250,118 Z"
          fill={`url(#op-${id})`}
        />
        {/* Side-edge overlay for depth */}
        <path
          d="M 10,118 L 52,8 L 208,8 L 250,118 Z"
          fill={`url(#oe-${id})`}
        />

        {/* Left fold crease */}
        <path
          d="M 52,8 L 90,118 Q 50,118 10,118 Z"
          fill={c2}
          opacity="0.20"
        />
        {/* Right fold crease */}
        <path
          d="M 208,8 L 170,118 Q 210,118 250,118 Z"
          fill={c2}
          opacity="0.10"
        />

        {/* Center crease line */}
        <line x1="130" y1="8" x2="130" y2="118"
          stroke={`url(#oc-${id})`} strokeWidth="1.2" />

        {/* Ruffled top edge — open paper curls */}
        <path
          d="M 52,8 Q 70,-4 88,8 Q 106,-2 124,8 Q 142,-4 160,8 Q 178,-2 196,8 Q 210,-3 208,8"
          fill={c1}
          stroke={c2}
          strokeWidth="1.4"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* Left curl */}
        <path
          d="M 52,8 Q 44,2 36,5 Q 30,8 36,12"
          fill={c1}
          stroke={c2}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />
        {/* Right curl */}
        <path
          d="M 208,8 Q 216,2 224,5 Q 230,8 224,12"
          fill={c1}
          stroke={c2}
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.55"
        />

        {/* Subtle paper texture lines */}
        <path d="M 80,20 L 92,118"  stroke={c2} strokeWidth="0.5" opacity="0.12" />
        <path d="M 130,8  L 130,118" stroke={c2} strokeWidth="0.5" opacity="0.10" />
        <path d="M 180,20 L 168,118" stroke={c2} strokeWidth="0.5" opacity="0.12" />
      </svg>
    );
  }

  /* ── CLOSED state — cone-shaped wrapped bouquet ──────────── */
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
          <stop offset="22%"  stopColor={c1} />
          <stop offset="50%"  stopColor={c1} />
          <stop offset="78%"  stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`wr-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={rc} />
          <stop offset="100%" stopColor={c2} stopOpacity="0.8" />
        </linearGradient>
        {/* Top-area inner shadow */}
        <radialGradient id={`ws-${id}`} cx="50%" cy="0%" r="80%">
          <stop offset="0%"   stopColor={c2} stopOpacity="0.35" />
          <stop offset="100%" stopColor={c2} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Drop shadow behind cone */}
      <path
        d="M 6,68 Q 100,48 194,68 L 130,214 Q 100,228 70,214 Z"
        fill={c2}
        opacity="0.42"
      />

      {/* Main paper body */}
      <path
        d="M 17,74 Q 100,54 183,74 L 124,212 Q 100,224 76,212 Z"
        fill={`url(#wp-${id})`}
      />

      {/* Inner-top shadow for depth */}
      <path
        d="M 17,74 Q 100,54 183,74 L 150,130 Q 100,110 50,130 Z"
        fill={`url(#ws-${id})`}
      />

      {/* Left fold crease */}
      <path
        d="M 17,74 L 76,212 Q 62,207 55,196 L 20,76 Z"
        fill={c2}
        opacity="0.28"
      />
      {/* Right fold sheen */}
      <path
        d="M 183,74 L 124,212 Q 138,207 145,196 L 180,76 Z"
        fill="white"
        opacity="0.055"
      />
      {/* Center crease */}
      <line x1="100" y1="58" x2="100" y2="220"
        stroke="white" strokeWidth="0.85" opacity="0.07" />

      {/* ── Ribbon band ── */}
      <path
        d="M 54,132 Q 100,118 146,132 L 144,150 Q 100,164 56,150 Z"
        fill={`url(#wr-${id})`}
        opacity="0.93"
      />
      <path
        d="M 54,132 Q 100,118 146,132"
        stroke="white" strokeWidth="1.6" fill="none"
        strokeLinecap="round" opacity="0.22"
      />

      {/* ── Bow left loop ── */}
      <path
        d="M 100,140 C 74,116 54,120 57,135 C 59,147 76,150 100,140 Z"
        fill={rc} opacity="0.96"
      />
      <path
        d="M 100,140 C 74,116 54,120 57,135"
        stroke="white" strokeWidth="1" fill="none"
        strokeLinecap="round" opacity="0.2"
      />

      {/* ── Bow right loop ── */}
      <path
        d="M 100,140 C 126,116 146,120 143,135 C 141,147 124,150 100,140 Z"
        fill={rc} opacity="0.96"
      />
      <path
        d="M 100,140 C 126,116 146,120 143,135"
        stroke="white" strokeWidth="1" fill="none"
        strokeLinecap="round" opacity="0.2"
      />

      {/* Bow knot */}
      <ellipse cx="100" cy="140" rx="9" ry="7" fill={rc} />
      <ellipse cx="99"  cy="139" rx="4" ry="3" fill="white" opacity="0.2" />

      {/* Ribbon tails */}
      <path d="M 100,147 C 92,160 87,175 89,191"
        stroke={rc} strokeWidth="3.5" fill="none"
        strokeLinecap="round" opacity="0.7" />
      <path d="M 100,147 C 108,160 113,175 111,191"
        stroke={rc} strokeWidth="3.5" fill="none"
        strokeLinecap="round" opacity="0.7" />

      {/* Ruffled top edge */}
      <path
        d="M 17,74 Q 36,63 55,74 Q 72,61 90,74 Q 110,61 128,74 Q 146,61 165,74 Q 176,62 183,74"
        fill="none"
        stroke={c1}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
