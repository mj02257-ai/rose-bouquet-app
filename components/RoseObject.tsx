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
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v + delta))).toString(16).padStart(2, '0');
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

function mix(hex: string, white: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${clamp(r + (255 - r) * white)}${clamp(g + (255 - g) * white)}${clamp(b + (255 - b) * white)}`;
}

// Outer back petal — wide, ruffled tip, sweeps broadly outward
const P_OUT = [
  'M 50,44',
  'C 43,43 32,38 24,30',
  'C 16,22 15,11 22,5',
  'C 26,1 31,0 37,0',
  'C 41,0 45,1 47.5,2.5',
  'Q 50,1.5 52.5,2.5',
  'C 55,1 59,0 63,0',
  'C 69,0 74,1 78,5',
  'C 85,11 84,22 76,30',
  'C 68,38 57,43 50,44 Z',
].join(' ');

// Outer front petal (offset 36°) — slightly shorter, more curved
const P_OUT2 = [
  'M 50,44',
  'C 44,43 34,39 28,32',
  'C 22,25 21,16 26,9',
  'C 29,4 34,2 40,2',
  'C 43,1.5 46.5,2 48.5,3',
  'Q 50,2 51.5,3',
  'C 53.5,2 57,1.5 60,2',
  'C 66,2 71,4 74,9',
  'C 79,16 78,25 72,32',
  'C 66,39 56,43 50,44 Z',
].join(' ');

// Mid petal — cupped, medium height, visible veining via stroke
const P_MID = [
  'M 50,44',
  'C 44,43 36,40 30,34',
  'C 24,28 23,20 27,14',
  'C 30,9 35,7 40,7',
  'C 43,6.5 46.5,7 48.5,8',
  'Q 50,7 51.5,8',
  'C 53.5,7 57,6.5 60,7',
  'C 65,7 70,9 73,14',
  'C 77,20 76,28 70,34',
  'C 64,40 56,43 50,44 Z',
].join(' ');

// Inner petal — narrow, upright, tightly rolled look
const P_INN = [
  'M 50,44',
  'C 46,43 39,41 36,37',
  'C 33,33 32,27 35,22',
  'C 37,18 41,16 45,16',
  'C 47,15.5 48.5,16 49.5,16.5',
  'Q 50,16 50.5,16.5',
  'C 51.5,16 53,15.5 55,16',
  'C 59,16 63,18 65,22',
  'C 68,27 67,33 64,37',
  'C 61,41 54,43 50,44 Z',
].join(' ');

// Innermost — very tight, shows spiral curl on top
const P_DEEP = [
  'M 50,44',
  'C 48,43.5 45,42.5 43.5,41',
  'C 42,39.5 42,37.5 43,36',
  'C 44,34.5 46,33.5 48,33',
  'C 49,32.5 49.5,32.5 50,32.5',
  'C 50.5,32.5 51,32.5 52,33',
  'C 54,33.5 56,34.5 57,36',
  'C 58,37.5 58,39.5 56.5,41',
  'C 55,42.5 52,43.5 50,44 Z',
].join(' ');

// Centre bud — tiny, deeply shaded
const P_BUD = [
  'M 50,44',
  'C 49,43.5 48,43 47.5,41.5',
  'C 47,40 47.5,38 48.5,37.5',
  'C 49,37 49.5,37 50,37',
  'C 50.5,37 51,37 51.5,37.5',
  'C 52.5,38 53,40 52.5,41.5',
  'C 52,43 51,43.5 50,44 Z',
].join(' ');

// Sepal — pointed green leaf at flower base
const P_SEP = [
  'M 50,45',
  'C 49.5,47 48.5,50 48.5,53',
  'C 48.5,55 49.2,57 50,58',
  'C 50.8,57 51.5,55 51.5,53',
  'C 51.5,50 50.5,47 50,45 Z',
].join(' ');

// Leaf shape — positioned via group translate+rotate
const P_LEAF = [
  'M 0,0',
  'C 6,-5 14,-11 20,-17',
  'C 24,-20 26,-21 24,-17',
  'C 22,-14 16,-9 12,-5',
  'C 15,-6 21,-10 22,-6',
  'C 23,-2 19,4 15,6',
  'C 11,8 5,5 2,2',
  'C 1,1 0.5,0.5 0,0 Z',
].join(' ');

export default function RoseObject({ roseType, size = 60, className = '' }: RoseObjectProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const base = roseType.color;

  // 6-level palette: bright highlight → deep shadow
  const specular = mix(base, 0.88);   // near-white specular on wet petals
  const bright   = adj(base, 68);     // lit highlight
  const light    = adj(base, 36);     // lit face
  const mid      = base;              // body colour
  const dark     = adj(base, -42);    // shadow face
  const deep     = adj(base, -80);    // deep shadow / fold
  const deepest  = adj(base, -110);   // darkest crease

  const stemC  = '#3D6E28';
  const stemDk = '#1E3D10';
  const leafC  = '#2C5B18';

  // Gradient IDs
  const GR  = `${uid}gr`;   // outer petals — upper-right directional light
  const GR2 = `${uid}gr2`;  // front outer petals — slightly different angle
  const GM  = `${uid}gm`;   // mid petals
  const GI  = `${uid}gi`;   // inner petals
  const GC  = `${uid}gc`;   // centre bud
  const GS  = `${uid}gs`;   // stem
  const GL  = `${uid}gl`;   // leaf
  const GV  = `${uid}gv`;   // petal vein/crease overlay gradient
  const FD  = `${uid}fd`;   // drop-shadow filter

  const CX = 50, CY = 40;

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
        {/* Drop shadow for entire flower — adds depth and ground lift */}
        <filter id={FD} x="-25%" y="-25%" width="150%" height="160%">
          <feDropShadow dx="1" dy="3" stdDeviation="3.5" floodColor={deepest} floodOpacity="0.42" />
        </filter>

        {/*
         * Upper-right light source (cx=72, cy=8) — mimics sunlight from above-right.
         * gradientUnits="userSpaceOnUse" keeps the angle fixed for all rotated petals.
         */}
        <radialGradient id={GR} gradientUnits="userSpaceOnUse" cx="72" cy="8" r="82">
          <stop offset="0%"   stopColor={specular} stopOpacity="0.9" />
          <stop offset="10%"  stopColor={bright} />
          <stop offset="28%"  stopColor={light} />
          <stop offset="52%"  stopColor={mid} />
          <stop offset="76%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        {/* Front outer petals — lit from slightly more forward angle */}
        <radialGradient id={GR2} gradientUnits="userSpaceOnUse" cx="66" cy="12" r="78">
          <stop offset="0%"   stopColor={bright} />
          <stop offset="22%"  stopColor={light} />
          <stop offset="50%"  stopColor={mid} />
          <stop offset="78%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        {/* Mid petals — light comes more from center-top */}
        <radialGradient id={GM} gradientUnits="userSpaceOnUse" cx="58" cy="16" r="66">
          <stop offset="0%"   stopColor={light} />
          <stop offset="25%"  stopColor={mid} />
          <stop offset="55%"  stopColor={dark} />
          <stop offset="80%"  stopColor={deep} />
          <stop offset="100%" stopColor={deepest} />
        </radialGradient>

        {/* Inner petals — mostly in shadow */}
        <radialGradient id={GI} gradientUnits="userSpaceOnUse" cx="48" cy="28" r="50">
          <stop offset="0%"   stopColor={mid} />
          <stop offset="35%"  stopColor={dark} />
          <stop offset="65%"  stopColor={deep} />
          <stop offset="100%" stopColor={deepest} />
        </radialGradient>

        {/* Centre bud — very dark, nearly black at core */}
        <radialGradient id={GC} gradientUnits="userSpaceOnUse" cx="52" cy="38" r="14">
          <stop offset="0%"   stopColor={dark} />
          <stop offset="45%"  stopColor={deep} />
          <stop offset="100%" stopColor={deepest} stopOpacity="0.97" />
        </radialGradient>

        {/* Stem — cylindrical shading */}
        <linearGradient id={GS} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={stemDk} />
          <stop offset="30%"  stopColor={stemC} />
          <stop offset="62%"  stopColor={adj(stemC, 22)} />
          <stop offset="100%" stopColor={stemDk} />
        </linearGradient>

        {/* Leaf — directional light */}
        <radialGradient id={GL} gradientUnits="userSpaceOnUse" cx="6" cy="-8" r="24">
          <stop offset="0%"   stopColor={adj(leafC, 38)} />
          <stop offset="50%"  stopColor={leafC} />
          <stop offset="100%" stopColor={stemDk} />
        </radialGradient>

        {/* Petal crease overlay — adds fold depth */}
        <linearGradient id={GV} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={deep} stopOpacity="0.14" />
          <stop offset="50%"  stopColor={deep} stopOpacity="0.06" />
          <stop offset="100%" stopColor={deep} stopOpacity="0.18" />
        </linearGradient>
      </defs>

      {/* ── STEM ────────────────────────────────────────────── */}
      <path
        d="M 50,54 C 50.5,66 49.5,78 48.5,90 C 47.5,102 48,114 50,126"
        stroke={`url(#${GS})`}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Stem highlight */}
      <path
        d="M 51,54 C 51.5,66 50.5,78 49.5,90 C 48.5,102 48.8,113 50.5,125"
        stroke={adj(stemC, 28)}
        strokeWidth="0.7"
        fill="none"
        strokeLinecap="round"
        opacity="0.38"
      />

      {/* Thorns */}
      <path d="M 49.5,72 L 42,67 L 49.5,73.5" fill={stemDk} opacity="0.55" />
      <path d="M 49.5,99 L 57,94 L 49.5,100.5" fill={stemDk} opacity="0.55" />

      {/* ── LEAVES ──────────────────────────────────────────── */}
      <g transform="translate(53, 84) rotate(-34)">
        <path d={P_LEAF} fill={`url(#${GL})`} opacity="0.93" />
        <path d="M 0,0 C 8,-6 16,-12 22,-18" stroke={stemDk} strokeWidth="0.52" fill="none" opacity="0.50" />
        <path d="M 5,-3 L 10,-11" stroke={stemDk} strokeWidth="0.36" fill="none" opacity="0.35" />
        <path d="M 12,-9 L 16,-16" stroke={stemDk} strokeWidth="0.36" fill="none" opacity="0.30" />
      </g>
      <g transform="translate(47, 110) rotate(212)">
        <path d={P_LEAF} fill={`url(#${GL})`} opacity="0.85" />
        <path d="M 0,0 C 8,-6 16,-12 22,-18" stroke={stemDk} strokeWidth="0.52" fill="none" opacity="0.45" />
        <path d="M 5,-3 L 10,-11" stroke={stemDk} strokeWidth="0.36" fill="none" opacity="0.30" />
      </g>

      {/* ── All petals wrapped in drop-shadow filter ─────────── */}
      <g filter={`url(#${FD})`}>
        {/* ── OUTER BACK PETALS (5 × 72°) — furthest from viewer */}
        {[0, 72, 144, 216, 288].map((a) => (
          <g key={a} transform={`rotate(${a}, ${CX}, ${CY})`}>
            <path d={P_OUT} fill={`url(#${GR})`} opacity="0.78" />
            {/* Petal crease fold */}
            <path
              d="M 50,44 C 44,38 32,28 22,22"
              stroke={deep}
              strokeWidth="0.6"
              fill="none"
              opacity="0.16"
            />
            {/* Ruffled tip specular */}
            <path
              d="M 50,1.5 Q 55,0 60,1.5"
              stroke={bright}
              strokeWidth="0.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.25"
            />
          </g>
        ))}

        {/* ── OUTER FRONT PETALS (5, offset 36°) ─────────────── */}
        {[36, 108, 180, 252, 324].map((a) => (
          <g key={a} transform={`rotate(${a}, ${CX}, ${CY})`}>
            <path d={P_OUT2} fill={`url(#${GR2})`} opacity="0.86" />
            <path
              d="M 50,44 C 45,39 36,30 28,24"
              stroke={deep}
              strokeWidth="0.55"
              fill="none"
              opacity="0.14"
            />
          </g>
        ))}

        {/* ── MID PETALS (5, offset 18°) ─────────────────────── */}
        {[18, 90, 162, 234, 306].map((a) => (
          <g key={a} transform={`rotate(${a}, ${CX}, ${CY})`}>
            <path d={P_MID} fill={`url(#${GM})`} opacity="0.91" />
            {/* Mid-rib vein line */}
            <path
              d="M 50,44 C 50,38 50.5,28 50,20"
              stroke={deep}
              strokeWidth="0.4"
              fill="none"
              opacity="0.18"
            />
          </g>
        ))}

        {/* ── INNER PETALS (4 × 90°) ─────────────────────────── */}
        {[0, 90, 180, 270].map((a) => (
          <path
            key={a}
            d={P_INN}
            fill={`url(#${GI})`}
            opacity="0.94"
            transform={`rotate(${a}, ${CX}, ${CY})`}
          />
        ))}

        {/* ── INNERMOST PETALS (3 × 120°) ────────────────────── */}
        {[0, 120, 240].map((a) => (
          <path
            key={a}
            d={P_DEEP}
            fill={`url(#${GI})`}
            opacity="0.98"
            transform={`rotate(${a}, ${CX}, ${CY})`}
          />
        ))}

        {/* ── CENTRE BUD ──────────────────────────────────────── */}
        <path d={P_BUD} fill={`url(#${GC})`} />

        {/* Spiral curl — coiled inner petal catching edge light */}
        <path
          d="M 48,42 C 48.8,40 50,38.5 51.5,38 C 50.8,37.4 49.4,37.3 48.8,38"
          stroke={light}
          strokeWidth="0.6"
          fill="none"
          opacity="0.28"
          strokeLinecap="round"
        />
        <path
          d="M 52,42.5 C 51.2,41 50.5,39.5 51,38.5"
          stroke={mid}
          strokeWidth="0.45"
          fill="none"
          opacity="0.22"
          strokeLinecap="round"
        />
      </g>

      {/* ── SEPALS (5 × 72°, around flower base) ────────────── */}
      {[0, 72, 144, 216, 288].map((a) => (
        <path
          key={a}
          d={P_SEP}
          fill="#4C7E3A"
          opacity="0.88"
          transform={`rotate(${a}, ${CX}, 45)`}
        />
      ))}

      {/* ── SPECULAR HIGHLIGHTS — wet-look gloss ────────────── */}
      {/* Primary specular — upper-right petal face */}
      <ellipse
        cx="66" cy="14" rx="6.5" ry="3.2"
        fill={specular}
        opacity="0.22"
        transform="rotate(-38, 66, 14)"
      />
      {/* Secondary specular — offset highlight */}
      <ellipse
        cx="56" cy="9" rx="4" ry="1.8"
        fill={specular}
        opacity="0.17"
        transform="rotate(-24, 56, 9)"
      />
      {/* Tiny tertiary glint */}
      <ellipse
        cx="72" cy="20" rx="2.2" ry="1"
        fill="white"
        opacity="0.13"
        transform="rotate(-15, 72, 20)"
      />
    </svg>
  );
}
