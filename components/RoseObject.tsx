'use client';

import { useId } from 'react';
import { RoseType } from '@/types/bouquet';

interface RoseObjectProps {
  roseType: RoseType;
  size?: number;
  className?: string;
}

/**
 * Multi-layer vector rose SVG.
 *
 * Drawing order (back → front):
 *   stem → leaf → sepals
 *   → outer-back petals (shadow depth)
 *   → outer petals
 *   → middle petals
 *   → inner petals
 *   → innermost petals
 *   → center bud
 *
 * All petal paths start at the flower center (50, 40) and extend outward.
 * Rotating identical paths around that point places each petal layer evenly.
 * A single radial gradient fixed in SVG-space creates consistent directional
 * lighting across all rotated copies.
 */
export default function RoseObject({ roseType, size = 60, className = '' }: RoseObjectProps) {
  // useId() is stable across SSR/hydration and unique per instance
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const { gradientFrom: gF, gradientTo: gT } = roseType;

  // Gradient IDs
  const PL = `${uid}pl`; // petal — lit (directional)
  const PD = `${uid}pd`; // petal — shadow/back
  const CG = `${uid}cg`; // center bud
  const LG = `${uid}lg`; // leaf

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/*
         * PL — fixed in SVG space so that all rotated petal copies share
         * the same "upper-left light source", producing natural depth.
         */}
        <radialGradient id={PL} cx="35%" cy="22%" r="72%" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={gF} />
          <stop offset="48%"  stopColor={gF} stopOpacity="0.87" />
          <stop offset="100%" stopColor={gT} />
        </radialGradient>

        {/* PD — muted gradient for depth/shadow back petals */}
        <radialGradient id={PD} cx="50%" cy="48%" r="62%">
          <stop offset="0%"   stopColor={gF} stopOpacity="0.48" />
          <stop offset="100%" stopColor={gT} stopOpacity="0.82" />
        </radialGradient>

        {/* CG — richer, darker gradient for the tight center */}
        <radialGradient id={CG} cx="38%" cy="26%" r="70%">
          <stop offset="0%"   stopColor={gF} />
          <stop offset="38%"  stopColor={gT} />
          <stop offset="100%" stopColor={gT} />
        </radialGradient>

        {/* LG — subtle cool-to-warm leaf gradient */}
        <linearGradient id={LG} x1="15%" y1="5%" x2="85%" y2="95%">
          <stop offset="0%"   stopColor="#2d5e3e" />
          <stop offset="100%" stopColor="#1a3d27" />
        </linearGradient>
      </defs>

      {/* ── STEM ── */}
      <path
        d="M 50,65 C 50,74 49,85 48,97"
        stroke="#28503a"
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />

      {/* ── LEAF ── */}
      {/* Body */}
      <path
        d="M 49,84 C 35,79 24,67 27,58 C 30,50 38,51 43,57 C 46,61 48,71 49,84 Z"
        fill={`url(#${LG})`}
        opacity="0.92"
      />
      {/* Midrib */}
      <path
        d="M 49,84 C 35,79 24,67 27,58"
        stroke="#1a3d27"
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
      />
      {/* Side veins */}
      <path d="M 32,62 C 37,68 43,76 49,81" stroke="#1a3d27" strokeWidth="0.35" fill="none" opacity="0.38" />
      <path d="M 29,64 C 35,69 41,75 49,79" stroke="#1a3d27" strokeWidth="0.25" fill="none" opacity="0.22" />

      {/* ── SEPALS — pointed green calyx beneath petals ── */}
      <g fill="#3d7050" opacity="0.84">
        <path d="M 44,63 C 34,55 36,46 40,44 C 40,51 41,57 44,63 Z" />
        <path d="M 50,61 Q 50,51 50,43 Q 51,51 50,61 Z" />
        <path d="M 56,63 C 66,55 64,46 60,44 C 60,51 59,57 56,63 Z" />
        <path d="M 47,64 C 38,57 38,50 41,47 C 41,53 43,59 47,64 Z" opacity="0.55" />
        <path d="M 53,64 C 62,57 62,50 59,47 C 59,53 57,59 53,64 Z" opacity="0.55" />
      </g>

      {/* ── OUTER BACK PETALS ──
           5 petals at 0°/72°/144°/216°/288°.
           Widest petal shape; low opacity gives outer cup silhouette.
           Path: from center (50,40) → curves left → rounded tip → mirror right → back.
      ── */}
      <g opacity="0.46">
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={`obp${a}`}
            d="M 50,40
               C 37,36 21,23 23,10
               C 25,0  36,-3 44,0
               Q 47,-2 50,-2
               Q 53,-2 56,0
               C 64,-3 75,0  77,10
               C 79,23 63,36 50,40 Z"
            fill={`url(#${PD})`}
            transform={`rotate(${a},50,40)`}
          />
        ))}
      </g>

      {/* ── MAIN OUTER PETALS ──
           5 petals at 36°/108°/180°/252°/324° (offset 36° from back layer).
           Slightly narrower; the primary visible outer ring.
      ── */}
      <g opacity="0.76">
        {[36, 108, 180, 252, 324].map((a) => (
          <path
            key={`op${a}`}
            d="M 50,40
               C 38,36 26,25 28,12
               C 30,3  38,-1 45,2
               Q 47.5,-1 50,-1
               Q 52.5,-1 55,2
               C 62,-1 70,3  72,12
               C 74,25 62,36 50,40 Z"
            fill={`url(#${PL})`}
            transform={`rotate(${a},50,40)`}
          />
        ))}
      </g>

      {/* ── MIDDLE PETALS ──
           5 petals at 0°/72°/144°/216°/288°.
           Narrower and shorter than outer — more upright.
      ── */}
      <g opacity="0.84">
        {[0, 72, 144, 216, 288].map((a) => (
          <path
            key={`mp${a}`}
            d="M 50,40
               C 40,37 30,27 32,15
               C 34,6  41,3  47,5
               Q 48.5,2 50,2
               Q 51.5,2 53,5
               C 59,3  66,6  68,15
               C 70,27 60,37 50,40 Z"
            fill={`url(#${PL})`}
            transform={`rotate(${a},50,40)`}
          />
        ))}
      </g>

      {/* ── INNER PETALS ──
           4 petals at 22°/112°/202°/292°.
           Noticeably narrower — beginning to curl inward.
      ── */}
      <g opacity="0.90">
        {[22, 112, 202, 292].map((a) => (
          <path
            key={`ip${a}`}
            d="M 50,40
               C 43,38 36,31 38,21
               C 40,13 45,10 49,12
               Q 49.5,9 50,9
               Q 50.5,9 51,12
               C 55,10 60,13 62,21
               C 64,31 57,38 50,40 Z"
            fill={`url(#${PL})`}
            transform={`rotate(${a},50,40)`}
          />
        ))}
      </g>

      {/* ── INNERMOST PETALS ──
           3 petals at 10°/130°/250°.
           Tight, cupped shape — close to the center bud.
      ── */}
      <g opacity="0.95">
        {[10, 130, 250].map((a) => (
          <path
            key={`iip${a}`}
            d="M 50,40
               C 45,39 39,34 41,26
               C 43,20 47,17 50,17
               C 53,17 57,20 59,26
               C 61,34 55,39 50,40 Z"
            fill={`url(#${CG})`}
            transform={`rotate(${a},50,40)`}
          />
        ))}
      </g>

      {/* ── CENTER BUD ──
           Two ellipses + a spiral path simulate the tightly coiled
           rose center seen in the reference photo.
      ── */}
      {/* Outer bud */}
      <ellipse cx="50" cy="33" rx="10" ry="12" fill={`url(#${CG})`} />
      {/* Inner bud — darker, gives depth */}
      <ellipse cx="50" cy="32" rx="6.5" ry="8.5" fill={gT} opacity="0.92" />
      {/* Spiral detail — mimics curled inner petal edge */}
      <path
        d="M 50,25
           C 53,27 54,31 52,34
           C 50.5,36 49,36 48,35
           C 47,34 47,32 48,30
           C 49,28 52,28 51,26"
        fill="none"
        stroke={gF}
        strokeWidth="1.1"
        strokeLinecap="round"
        opacity="0.42"
      />
      {/* Soft highlight where light catches the center */}
      <ellipse cx="47" cy="28" rx="2.5" ry="3.5" fill={gF} opacity="0.17" />
    </svg>
  );
}
