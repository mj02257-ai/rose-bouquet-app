'use client';

import { WrapperStyle } from '@/types/bouquet';

interface BouquetWrapperProps {
  wrapper: WrapperStyle;
  width?: number;
  height?: number;
}

/**
 * SVG bouquet wrapping paper with ribbon and bow.
 * Cone-shaped body with fold shading and a decorative ruffled top edge.
 */
export default function BouquetWrapper({ wrapper, width = 200, height = 220 }: BouquetWrapperProps) {
  const { paperColor: c1, paperDark: c2, ribbonColor: rc, id } = wrapper;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 220"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Paper gradient — left/right edges darker, center lit */}
        <linearGradient id={`wp-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c2} />
          <stop offset="26%"  stopColor={c1} />
          <stop offset="50%"  stopColor={c1} />
          <stop offset="74%"  stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        {/* Ribbon face gradient */}
        <linearGradient id={`wr-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={rc} />
          <stop offset="100%" stopColor={c2} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* ── SHADOW LAYER (wider, behind) ── */}
      <path
        d="M 6,68 Q 100,48 194,68 L 130,214 Q 100,226 70,214 Z"
        fill={c2}
        opacity="0.48"
      />

      {/* ── MAIN PAPER BODY ── */}
      <path
        d="M 17,74 Q 100,54 183,74 L 124,212 Q 100,224 76,212 Z"
        fill={`url(#wp-${id})`}
      />

      {/* ── LEFT FOLD CREASE ── */}
      <path
        d="M 17,74 L 76,212 Q 63,208 56,197 L 21,76 Z"
        fill={c2}
        opacity="0.3"
      />

      {/* ── RIGHT FOLD (subtle sheen) ── */}
      <path
        d="M 183,74 L 124,212 Q 137,208 144,197 L 179,76 Z"
        fill="white"
        opacity="0.06"
      />

      {/* ── CENTER CREASE ── */}
      <line
        x1="100" y1="58"
        x2="100" y2="220"
        stroke="white"
        strokeWidth="0.9"
        opacity="0.08"
      />

      {/* ── RIBBON BAND ── */}
      <path
        d="M 54,132 Q 100,118 146,132 L 144,150 Q 100,164 56,150 Z"
        fill={`url(#wr-${id})`}
        opacity="0.93"
      />
      {/* Ribbon top sheen */}
      <path
        d="M 54,132 Q 100,118 146,132"
        stroke="white"
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.24"
      />

      {/* ── BOW LEFT LOOP ── */}
      <path
        d="M 100,140 C 74,116 55,120 58,135 C 60,146 76,149 100,140 Z"
        fill={rc}
        opacity="0.95"
      />
      <path
        d="M 100,140 C 74,116 55,120 58,135"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* ── BOW RIGHT LOOP ── */}
      <path
        d="M 100,140 C 126,116 145,120 142,135 C 140,146 124,149 100,140 Z"
        fill={rc}
        opacity="0.95"
      />
      <path
        d="M 100,140 C 126,116 145,120 142,135"
        stroke="white"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        opacity="0.2"
      />

      {/* ── BOW KNOT ── */}
      <ellipse cx="100" cy="140" rx="9" ry="7" fill={rc} />
      <ellipse cx="99"  cy="139" rx="4" ry="3" fill="white" opacity="0.2" />

      {/* ── RIBBON TAILS ── */}
      <path
        d="M 100,146 C 92,159 87,174 89,190"
        stroke={rc}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M 100,146 C 108,159 113,174 111,190"
        stroke={rc}
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* ── RUFFLED TOP EDGE ── */}
      <path
        d="M 17,74 Q 36,63 55,74 Q 72,62 90,74 Q 110,62 128,74 Q 146,62 165,74 Q 176,63 183,74"
        fill="none"
        stroke={c1}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.52"
      />
    </svg>
  );
}
