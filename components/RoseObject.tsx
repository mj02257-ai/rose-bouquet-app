'use client';

import { useId } from 'react';
import { RoseType } from '@/types/bouquet';

interface RoseObjectProps {
  roseType: RoseType;
  size?: number;
  className?: string;
}

function adj(hex: string, delta: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + delta))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

function blend(hex: string, toward: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v + (toward - v) * 0.82))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/*
 * Rose viewed from ~35° above and slightly front-right.
 * 16 unique petal paths rendered back→front (painter's algorithm).
 * Light source: upper-right (78, 8) in userSpaceOnUse.
 * Flower center: CX=50, CY=30. Stem: y=50→y=125.
 */

// ── BACK PETALS (3) — upper area, perspective-foreshortened ─────────────
// Tips reach y=2–8, compressed by viewing angle. Mostly in shadow.

const P_B1 = // upper-left
  'M 50,30 C 44,26 32,18 24,12 C 20,8 22,4 28,5 C 32,5 38,10 42,18 C 46,24 49,28 50,30 Z';

const P_B2 = // upper-center, straight up
  'M 50,30 C 46,24 42,14 42,6 C 42,2 46,1 50,2 C 54,1 58,2 58,6 C 58,14 54,24 50,30 Z';

const P_B3 = // upper-right — closest to light source, slightly more lit
  'M 50,30 C 56,26 68,18 76,12 C 80,8 78,4 72,5 C 68,5 62,10 58,18 C 54,24 51,28 50,30 Z';

// ── MID PETALS (2) — sides, horizontal spread ───────────────────────────
// Wide petals going left and right. Left is in shadow, right is lit.

const P_M1 = // left — shadow side
  'M 50,32 C 42,30 26,26 16,22 C 8,18 6,12 12,10 C 18,8 28,14 38,22 C 44,26 48,30 50,32 Z';

const P_M2 = // right — lit side (facing the upper-right light source)
  'M 50,32 C 58,30 74,26 84,22 C 92,18 94,12 88,10 C 82,8 72,14 62,22 C 56,26 52,30 50,32 Z';

// ── FRONT PETALS (3) — lower area, most prominent, facing viewer ─────────

const P_F1 = // lower-left, drops down and left
  'M 50,32 C 44,36 34,42 24,48 C 16,52 12,56 14,60 C 16,64 22,64 28,60 C 34,56 42,48 48,38 C 49,35 50,33 50,32 Z';

const P_F2 = // lower-center, largest petal, the "show" petal
  'M 50,32 C 46,38 42,46 42,52 C 42,57 45,60 50,60 C 55,60 58,57 58,52 C 58,46 54,38 50,32 Z';

const P_F3 = // lower-right, lit
  'M 50,32 C 56,36 66,42 76,48 C 84,52 88,56 86,60 C 84,64 78,64 72,60 C 66,56 58,48 52,38 C 51,35 50,33 50,32 Z';

// ── INNER PETALS (4) — smaller, cupped, partially in shadow ─────────────

const P_I1 = // inner-left
  'M 50,30 C 44,28 38,24 34,20 C 30,16 30,12 34,12 C 38,12 42,16 46,22 C 48,26 49,28 50,30 Z';

const P_I2 = // inner-right, slight light catch
  'M 50,30 C 56,28 62,24 66,20 C 70,16 70,12 66,12 C 62,12 58,16 54,22 C 52,26 51,28 50,30 Z';

const P_I3 = // inner-upper (behind everything except center)
  'M 50,30 C 48,26 46,20 46,14 C 46,10 48,8 50,8 Q 52,8 54,14 C 54,20 52,26 50,30 Z';

const P_I4 = // inner-lower, faces viewer, small
  'M 50,32 C 47,36 44,42 44,46 Q 50,49 56,46 C 56,42 53,36 50,32 Z';

// ── CENTER PETALS (3) — tight spiral curls ───────────────────────────────

const P_C1 = // center-left curl
  'M 50,30 C 47,28 44,24 45,20 C 46,17 48,16 50,18 C 50,21 50,25 50,30 Z';

const P_C2 = // center-right curl, edge catches light
  'M 50,30 C 53,28 56,24 55,20 C 54,17 52,16 50,18 C 50,21 50,25 50,30 Z';

const P_C3 = // center-top, narrow upright
  'M 50,30 C 49,27 48,24 49,21 C 49.5,19 50.5,19 51,21 C 52,24 51,27 50,30 Z';

// ── CENTRE BUD ───────────────────────────────────────────────────────────
const P_BUD = 'M 50,30 C 49.2,29 49,27.5 50,26.5 C 51,27.5 50.8,29 50,30 Z';

// ── SEPAL — narrow pointed green leaf at flower base ─────────────────────
const P_SEP = 'M 50,34 C 49.5,36 49,39 49,42 C 49,44 49.4,46 50,47 C 50.6,46 51,44 51,42 C 51,39 50.5,36 50,34 Z';

// ── LEAF ─────────────────────────────────────────────────────────────────
const P_LEAF = 'M 0,0 C 6,-5 14,-11 20,-17 C 24,-20 26,-21 24,-17 C 22,-14 16,-9 12,-5 C 15,-6 21,-10 22,-6 C 23,-2 19,4 15,6 C 11,8 5,5 2,2 C 1,1 0.5,0.5 0,0 Z';

// ─────────────────────────────────────────────────────────────────────────

export default function RoseObject({ roseType, size = 60, className = '' }: RoseObjectProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const base = roseType.color;

  // 7-level palette from base color
  const specular = blend(base, 255);   // near-white wet-petal specular
  const bright   = adj(base,  72);
  const light    = adj(base,  40);
  const mid      = base;
  const dark     = adj(base, -44);
  const deep     = adj(base, -82);
  const deepest  = adj(base, -112);

  const stemC  = '#3D6E28';
  const stemDk = '#1E3D10';
  const leafC  = '#2C5B18';

  // Gradient IDs
  const gBack  = `${uid}bk`;
  const gMidSh = `${uid}ms`;
  const gMidLt = `${uid}ml`;
  const gFront = `${uid}fr`;
  const gInner = `${uid}in`;
  const gCtr   = `${uid}ct`;
  const GS     = `${uid}gs`;
  const GL     = `${uid}gl`;
  const FD     = `${uid}fd`;

  return (
    <svg
      width={size}
      height={Math.round(size * 1.3)}
      viewBox="0 0 100 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ overflow: 'visible' }}
    >
      <defs>
        {/* Drop shadow for the whole flower head */}
        <filter id={FD} x="-30%" y="-30%" width="160%" height="175%">
          <feDropShadow dx="0.5" dy="2.5" stdDeviation="3" floodColor={deepest} floodOpacity="0.40" />
        </filter>

        {/* All petal gradients share light source at (78, 8) userSpaceOnUse */}

        {/* Back petals — mostly in shadow */}
        <radialGradient id={gBack} gradientUnits="userSpaceOnUse" cx="78" cy="8" r="95">
          <stop offset="0%"   stopColor={light} />
          <stop offset="35%"  stopColor={mid} />
          <stop offset="65%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        {/* Mid-left petal — shadow side, away from light */}
        <radialGradient id={gMidSh} gradientUnits="userSpaceOnUse" cx="78" cy="8" r="90">
          <stop offset="0%"   stopColor={mid} />
          <stop offset="35%"  stopColor={dark} />
          <stop offset="70%"  stopColor={deep} />
          <stop offset="100%" stopColor={deepest} />
        </radialGradient>

        {/* Mid-right petal — lit side, facing upper-right light source directly */}
        <radialGradient id={gMidLt} gradientUnits="userSpaceOnUse" cx="78" cy="8" r="80">
          <stop offset="0%"   stopColor={specular} stopOpacity="0.88" />
          <stop offset="10%"  stopColor={bright} />
          <stop offset="32%"  stopColor={light} />
          <stop offset="60%"  stopColor={mid} />
          <stop offset="90%"  stopColor={dark} />
        </radialGradient>

        {/* Front petals — facing viewer, moderate illumination from upper-right */}
        <radialGradient id={gFront} gradientUnits="userSpaceOnUse" cx="78" cy="8" r="88">
          <stop offset="0%"   stopColor={bright} />
          <stop offset="22%"  stopColor={light} />
          <stop offset="52%"  stopColor={mid} />
          <stop offset="82%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        {/* Inner petals — mostly in shadow from outer petals */}
        <radialGradient id={gInner} gradientUnits="userSpaceOnUse" cx="62" cy="16" r="58">
          <stop offset="0%"   stopColor={mid} />
          <stop offset="38%"  stopColor={dark} />
          <stop offset="72%"  stopColor={deep} />
          <stop offset="100%" stopColor={deepest} />
        </radialGradient>

        {/* Center/bud — deep shadow of the spiral interior */}
        <radialGradient id={gCtr} gradientUnits="userSpaceOnUse" cx="52" cy="22" r="28">
          <stop offset="0%"   stopColor={dark} />
          <stop offset="55%"  stopColor={deep} />
          <stop offset="100%" stopColor={deepest} stopOpacity="0.96" />
        </radialGradient>

        {/* Stem */}
        <linearGradient id={GS} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={stemDk} />
          <stop offset="30%"  stopColor={stemC} />
          <stop offset="62%"  stopColor={adj(stemC, 22)} />
          <stop offset="100%" stopColor={stemDk} />
        </linearGradient>

        {/* Leaf */}
        <radialGradient id={GL} gradientUnits="userSpaceOnUse" cx="6" cy="-8" r="24">
          <stop offset="0%"   stopColor={adj(leafC, 36)} />
          <stop offset="52%"  stopColor={leafC} />
          <stop offset="100%" stopColor={stemDk} />
        </radialGradient>
      </defs>

      {/* ── STEM ──────────────────────────────────────────────── */}
      <path
        d="M 50,50 C 50,62 49,74 48,86 C 47,98 48,110 50,124"
        stroke={`url(#${GS})`}
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />
      {/* Stem highlight */}
      <path
        d="M 51,50 C 51.5,62 50.5,74 49.5,86 C 48.5,98 49,109 50.5,122"
        stroke={adj(stemC, 26)}
        strokeWidth="0.6"
        fill="none"
        strokeLinecap="round"
        opacity="0.36"
      />

      {/* Thorns */}
      <path d="M 49.5,70 L 42,65 L 49.5,71.5" fill={stemDk} opacity="0.55" />
      <path d="M 49,97 L 57,92 L 49,98.5" fill={stemDk} opacity="0.55" />

      {/* ── LEAVES ────────────────────────────────────────────── */}
      <g transform="translate(52, 82) rotate(-34)">
        <path d={P_LEAF} fill={`url(#${GL})`} opacity="0.92" />
        <path d="M 0,0 C 8,-6 16,-12 22,-18" stroke={stemDk} strokeWidth="0.5" fill="none" opacity="0.48" />
        <path d="M 5,-3 L 10,-11" stroke={stemDk} strokeWidth="0.35" fill="none" opacity="0.32" />
      </g>
      <g transform="translate(47, 108) rotate(212)">
        <path d={P_LEAF} fill={`url(#${GL})`} opacity="0.85" />
        <path d="M 0,0 C 8,-6 16,-12 22,-18" stroke={stemDk} strokeWidth="0.5" fill="none" opacity="0.42" />
      </g>

      {/* ── FLOWER — all petals wrapped in drop-shadow filter ──── */}
      <g filter={`url(#${FD})`}>

        {/* ── Layer 1: Back petals (rendered first, behind everything) */}
        <path d={P_B1} fill={`url(#${gBack})`}  opacity="0.74" />
        <path d={P_B2} fill={`url(#${gBack})`}  opacity="0.76" />
        <path d={P_B3} fill={`url(#${gMidLt})`} opacity="0.79" />

        {/* ── Layer 2: Mid petals (side-facing) */}
        <path d={P_M1} fill={`url(#${gMidSh})`} opacity="0.82" />
        <path d={P_M2} fill={`url(#${gMidLt})`} opacity="0.86" />

        {/* ── Layer 3: Front petals (most prominent, face the viewer) */}
        <path d={P_F1} fill={`url(#${gFront})`} opacity="0.88" />
        <path d={P_F2} fill={`url(#${gFront})`} opacity="0.92" />
        <path d={P_F3} fill={`url(#${gFront})`} opacity="0.90" />

        {/* Inter-petal shadow creases */}
        <path d="M 50,30 C 44,36 34,44 22,52" stroke={deepest} strokeWidth="0.55" fill="none" opacity="0.16" />
        <path d="M 50,30 C 56,36 66,44 78,52" stroke={deepest} strokeWidth="0.55" fill="none" opacity="0.16" />
        <path d="M 50,30 C 50,38 50,48 50,58"  stroke={deepest} strokeWidth="0.45" fill="none" opacity="0.12" />

        {/* ── Layer 4: Inner petals */}
        <path d={P_I3} fill={`url(#${gBack})`}  opacity="0.86" />
        <path d={P_I1} fill={`url(#${gInner})`} opacity="0.90" />
        <path d={P_I2} fill={`url(#${gInner})`} opacity="0.88" />
        <path d={P_I4} fill={`url(#${gInner})`} opacity="0.84" />

        {/* Inner shadow lines — petal folds */}
        <path d="M 50,30 C 44,26 36,20 34,14" stroke={deepest} strokeWidth="0.45" fill="none" opacity="0.18" />
        <path d="M 50,30 C 56,26 64,20 66,14" stroke={deepest} strokeWidth="0.45" fill="none" opacity="0.18" />

        {/* ── Layer 5: Center petals (tight spiral) */}
        <path d={P_C1}  fill={`url(#${gInner})`} opacity="0.94" />
        <path d={P_C2}  fill={`url(#${gCtr})`}   opacity="0.94" />
        <path d={P_C3}  fill={`url(#${gCtr})`}   opacity="0.97" />

        {/* ── Bud */}
        <path d={P_BUD} fill={`url(#${gCtr})`}   opacity="1.00" />

        {/* Spiral curl line in center */}
        <path
          d="M 48.5,28 C 49.2,26.5 50.2,25.5 51,25 C 50.5,24.6 49.5,24.6 49,25"
          stroke={light}
          strokeWidth="0.5"
          fill="none"
          opacity="0.24"
          strokeLinecap="round"
        />
      </g>

      {/* ── SEPALS (5 × 72° around flower base at y=34) ────────── */}
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={P_SEP}
          fill="#4C7E3A"
          opacity="0.86"
          transform={`rotate(${a}, 50, 34)`}
        />
      ))}

      {/* ── SPECULAR HIGHLIGHTS — wet-petal gloss ───────────────── */}
      {/* Primary: upper-right petal face (near light source) */}
      <ellipse
        cx="64" cy="13" rx="6" ry="2.8"
        fill={specular}
        opacity="0.20"
        transform="rotate(-40, 64, 13)"
      />
      {/* Secondary: mid-right petal edge */}
      <ellipse
        cx="74" cy="20" rx="3.5" ry="1.6"
        fill={specular}
        opacity="0.15"
        transform="rotate(-22, 74, 20)"
      />
      {/* Tiny glint */}
      <ellipse
        cx="58" cy="8" rx="2" ry="0.9"
        fill="white"
        opacity="0.14"
        transform="rotate(-12, 58, 8)"
      />
    </svg>
  );
}
