'use client';

import { useId } from 'react';
import { RoseType } from '@/types/bouquet';

interface RoseObjectProps {
  roseType: RoseType;
  size?: number;
  className?: string;
}

// Adjust hex color brightness
function adj(hex: string, delta: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v + delta))).toString(16).padStart(2, '0');
  return `#${clamp(r)}${clamp(g)}${clamp(b)}`;
}

// ── Petal paths — all centered on (50, 40), pointing straight up ──────────────
// Rotating these paths via transform="rotate(angle, 50, 40)" places each petal.
// gradientUnits="userSpaceOnUse" keeps the light direction fixed for all copies.

// Outer petal: broad (~40px wide at midpoint, ~38px tall), slightly ruffled tip
const P_OUT = [
  'M 50,43',
  'C 44,42 34,38 27,31',
  'C 20,24 20,14 26,8',
  'C 29,5 33,4 38,4',
  'C 42,4 46,4.5 48,5',
  'Q 50,4 52,5',
  'C 54,4.5 58,4 62,4',
  'C 67,4 71,5 74,8',
  'C 80,14 80,24 73,31',
  'C 66,38 56,42 50,43 Z',
].join(' ');

// Outer front petal: slightly shorter (offset 36°, sits one layer forward)
const P_OUT2 = [
  'M 50,43',
  'C 45,42 36,39 30,33',
  'C 24,27 23,19 27,13',
  'C 30,8 34,6 39,6',
  'C 42,5.5 46,5.5 48,6',
  'Q 50,5 52,6',
  'C 54,5.5 58,5.5 61,6',
  'C 66,6 70,8 73,13',
  'C 77,19 76,27 70,33',
  'C 64,39 55,42 50,43 Z',
].join(' ');

// Mid petal: cupped, medium height (~24px tall)
const P_MID = [
  'M 50,43',
  'C 45,42 37,39 32,34',
  'C 27,29 27,22 30,17',
  'C 32,13 36,11 40,11',
  'C 43,10.5 46.5,10.5 48.5,11',
  'Q 50,10 51.5,11',
  'C 53.5,10.5 57,10.5 60,11',
  'C 64,11 68,13 70,17',
  'C 73,22 73,29 68,34',
  'C 63,39 55,42 50,43 Z',
].join(' ');

// Inner petal: narrow, upright (~18px tall)
const P_INN = [
  'M 50,43',
  'C 46,42 40,41 37,38',
  'C 34,35 33,30 35,26',
  'C 36,22 39,20 43,20',
  'C 45,19.5 47.5,19.5 49,20',
  'Q 50,19 51,20',
  'C 52.5,19.5 55,19.5 57,20',
  'C 61,20 64,22 65,26',
  'C 67,30 66,35 63,38',
  'C 60,41 54,42 50,43 Z',
].join(' ');

// Innermost petal: very tight, ~11px tall
const P_DEEP = [
  'M 50,43',
  'C 48,42.5 45.5,42 44,41',
  'C 42.5,40 42,38 42.5,36',
  'C 43,34 44.5,33 47,32.5',
  'C 48.5,32 49.5,32 50,32',
  'C 50.5,32 51.5,32 53,32.5',
  'C 55.5,33 57,34 57.5,36',
  'C 58,38 57.5,40 56,41',
  'C 54.5,42 52,42.5 50,43 Z',
].join(' ');

// Center bud: tiny, deeply shadowed (~7px tall)
const P_BUD = [
  'M 50,43',
  'C 49,42.5 48,42 47.5,40.5',
  'C 47,39 47.5,37.5 48.5,37',
  'C 49,36.5 49.5,36.5 50,36.5',
  'C 50.5,36.5 51,36.5 51.5,37',
  'C 52.5,37.5 53,39 52.5,40.5',
  'C 52,42 51,42.5 50,43 Z',
].join(' ');

// Sepal: narrow pointed green leaf at flower base
const P_SEP = [
  'M 50,44',
  'C 49.5,45.5 49,47.5 49,50',
  'C 49,52 49.5,54 50,55',
  'C 50.5,54 51,52 51,50',
  'C 51,47.5 50.5,45.5 50,44 Z',
].join(' ');

// Leaf shape at origin — positioned via group translate+rotate
const P_LEAF = [
  'M 0,0',
  'C 5,-4 12,-9 18,-14',
  'C 22,-17 24,-18 22,-15',
  'C 20,-12 15,-8 11,-4',
  'C 14,-5 19,-8 20,-5',
  'C 21,-2 18,3 14,5',
  'C 10,7 5,5 2,2',
  'C 1,1 0.5,0.5 0,0 Z',
].join(' ');

// ─────────────────────────────────────────────────────────────────────────────

export default function RoseObject({ roseType, size = 60, className = '' }: RoseObjectProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const base = roseType.color;

  // 5-level palette derived from base hex
  const bright = adj(base,  72);  // specular / highlight
  const light  = adj(base,  38);  // lit face
  const mid    = base;            // body colour
  const dark   = adj(base, -45);  // shadow face
  const deep   = adj(base, -82);  // deep shadow / centre

  const stemC  = '#3A6826';
  const stemDk = '#1D3C12';
  const leafC  = '#2B5618';

  // Unique gradient / filter IDs
  const GR = `${uid}gr`; // outer petals radial — directional light
  const GM = `${uid}gm`; // mid petals
  const GI = `${uid}gi`; // inner petals
  const GC = `${uid}gc`; // centre bud
  const GS = `${uid}gs`; // stem
  const GL = `${uid}gl`; // leaf

  const CX = 50, CY = 40; // flower centre in viewBox

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
        {/* Fixed in SVG space — upper-left light source shared by all rotated petals */}
        <radialGradient id={GR} gradientUnits="userSpaceOnUse" cx="28" cy="14" r="76">
          <stop offset="0%"   stopColor={bright} />
          <stop offset="16%"  stopColor={light} />
          <stop offset="42%"  stopColor={mid} />
          <stop offset="70%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        <radialGradient id={GM} gradientUnits="userSpaceOnUse" cx="34" cy="20" r="62">
          <stop offset="0%"   stopColor={light} />
          <stop offset="28%"  stopColor={mid} />
          <stop offset="60%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        <radialGradient id={GI} gradientUnits="userSpaceOnUse" cx="42" cy="30" r="46">
          <stop offset="0%"   stopColor={mid} />
          <stop offset="44%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        <radialGradient id={GC} gradientUnits="userSpaceOnUse" cx="50" cy="40" r="16">
          <stop offset="0%"   stopColor={deep} stopOpacity="0.96" />
          <stop offset="60%"  stopColor={dark} />
          <stop offset="100%" stopColor={deep} />
        </radialGradient>

        <linearGradient id={GS} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={stemDk} />
          <stop offset="32%"  stopColor={stemC} />
          <stop offset="64%"  stopColor={adj(stemC, 24)} />
          <stop offset="100%" stopColor={stemDk} />
        </linearGradient>

        <radialGradient id={GL} gradientUnits="userSpaceOnUse" cx="7" cy="-7" r="22">
          <stop offset="0%"   stopColor={adj(leafC, 34)} />
          <stop offset="55%"  stopColor={leafC} />
          <stop offset="100%" stopColor={stemDk} />
        </radialGradient>
      </defs>

      {/* ── STEM ─────────────────────────────────────────── */}
      <path
        d="M 50,52 C 50,64 49,77 48,89 C 47,101 48,113 50,125"
        stroke={`url(#${GS})`}
        strokeWidth="2.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* Thorns */}
      <path d="M 49,70 L 43,66 L 49.5,71.5" fill={stemDk} opacity="0.58" />
      <path d="M 49.5,97 L 56,93 L 49.5,98.5" fill={stemDk} opacity="0.58" />

      {/* ── LEAVES ─────────────────────────────────────────────── */}
      <g transform="translate(52, 83) rotate(-32)">
        <path d={P_LEAF} fill={`url(#${GL})`} opacity="0.92" />
        {/* midrib */}
        <path d="M 0,0 C 7,-5 14,-10 21,-15" stroke={stemDk} strokeWidth="0.55" fill="none" opacity="0.55" />
        {/* side veins */}
        <path d="M 5,-3 L 9,-10" stroke={stemDk} strokeWidth="0.38" fill="none" opacity="0.38" />
        <path d="M 11,-8 L 15,-14" stroke={stemDk} strokeWidth="0.38" fill="none" opacity="0.38" />
      </g>

      <g transform="translate(48, 108) rotate(214)">
        <path d={P_LEAF} fill={`url(#${GL})`} opacity="0.85" />
        <path d="M 0,0 C 7,-5 14,-10 21,-15" stroke={stemDk} strokeWidth="0.55" fill="none" opacity="0.5" />
        <path d="M 5,-3 L 9,-10" stroke={stemDk} strokeWidth="0.38" fill="none" opacity="0.35" />
      </g>

      {/* ── OUTER BACK PETALS (5 × 72°) ────────────────── */}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={P_OUT}
          fill={`url(#${GR})`}
          opacity="0.76"
          transform={`rotate(${a}, ${CX}, ${CY})`}
        />
      ))}

      {/* Edge shadow lines between back petals — add depth */}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a}
          d="M 50,43 C 40,40 28,34 22,26"
          stroke={deep}
          strokeWidth="0.65"
          fill="none"
          opacity="0.18"
          transform={`rotate(${a}, ${CX}, ${CY})`}
        />
      ))}

      {/* ── OUTER FRONT PETALS (5, offset 36°) ─────────── */}
      {[36, 108, 180, 252, 324].map((a) => (
        <path key={a} d={P_OUT2}
          fill={`url(#${GR})`}
          opacity="0.84"
          transform={`rotate(${a}, ${CX}, ${CY})`}
        />
      ))}

      {/* ── MID PETALS (5, offset 18°) ──────────────────── */}
      {[18, 90, 162, 234, 306].map((a) => (
        <path key={a} d={P_MID}
          fill={`url(#${GM})`}
          opacity="0.90"
          transform={`rotate(${a}, ${CX}, ${CY})`}
        />
      ))}

      {/* ── INNER PETALS (4 × 90°) ──────────────────────── */}
      {[0, 90, 180, 270].map((a) => (
        <path key={a} d={P_INN}
          fill={`url(#${GI})`}
          opacity="0.93"
          transform={`rotate(${a}, ${CX}, ${CY})`}
        />
      ))}

      {/* ── INNERMOST PETALS (3 × 120°) ─────────────────── */}
      {[0, 120, 240].map((a) => (
        <path key={a} d={P_DEEP}
          fill={`url(#${GI})`}
          opacity="0.97"
          transform={`rotate(${a}, ${CX}, ${CY})`}
        />
      ))}

      {/* ── CENTRE BUD ───────────────────────────────────── */}
      <path d={P_BUD} fill={`url(#${GC})`} />

      {/* Spiral curl in centre — mimics coiled inner petal */}
      <path
        d="M 48.5,41.5 C 49.3,39.6 50.3,38.1 51.3,37.5 C 50.8,37.1 49.7,37.1 49.2,37.6"
        stroke={mid}
        strokeWidth="0.55"
        fill="none"
        opacity="0.32"
        strokeLinecap="round"
      />

      {/* ── SEPALS (5 × 72°, rotated around flower base) ── */}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a} d={P_SEP}
          fill="#4B7C3A"
          opacity="0.86"
          transform={`rotate(${a}, ${CX}, 44)`}
        />
      ))}
      {[0, 72, 144, 216, 288].map((a) => (
        <path key={a}
          d="M 50,44 L 50,55"
          stroke={stemDk}
          strokeWidth="0.42"
          opacity="0.38"
          transform={`rotate(${a}, ${CX}, 44)`}
        />
      ))}

      {/* ── SPECULAR HIGHLIGHTS ──────────────────────────── */}
      <ellipse cx="34" cy="20" rx="5.2" ry="2.8"
        fill={bright} opacity="0.18" transform="rotate(-28, 34, 20)" />
      <ellipse cx="40" cy="14" rx="3.2" ry="1.6"
        fill={bright} opacity="0.14" transform="rotate(-18, 40, 14)" />
    </svg>
  );
}
