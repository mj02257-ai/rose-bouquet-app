'use client';

import { RoseType } from '@/types/bouquet';

interface RoseObjectProps {
  roseType: RoseType;
  size?: number;
  className?: string;
}

export default function RoseObject({ roseType, size = 60, className = '' }: RoseObjectProps) {
  const { gradientFrom, gradientTo, id } = roseType;
  const gradId = `rose-grad-${id}-${Math.random().toString(36).slice(2)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id={gradId} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </radialGradient>
      </defs>
      {/* Stem */}
      <line x1="50" y1="85" x2="50" y2="100" stroke="#2D6A4F" strokeWidth="3" strokeLinecap="round"/>
      <line x1="50" y1="90" x2="40" y2="80" stroke="#2D6A4F" strokeWidth="2" strokeLinecap="round"/>
      {/* Outer petals */}
      <ellipse cx="50" cy="38" rx="14" ry="22" fill={`url(#${gradId})`} opacity="0.85" transform="rotate(-20,50,50)"/>
      <ellipse cx="50" cy="38" rx="14" ry="22" fill={`url(#${gradId})`} opacity="0.85" transform="rotate(20,50,50)"/>
      <ellipse cx="50" cy="38" rx="14" ry="22" fill={`url(#${gradId})`} opacity="0.85" transform="rotate(60,50,50)"/>
      <ellipse cx="50" cy="38" rx="14" ry="22" fill={`url(#${gradId})`} opacity="0.85" transform="rotate(-60,50,50)"/>
      <ellipse cx="50" cy="38" rx="14" ry="22" fill={`url(#${gradId})`} opacity="0.85" transform="rotate(100,50,50)"/>
      <ellipse cx="50" cy="38" rx="14" ry="22" fill={`url(#${gradId})`} opacity="0.85" transform="rotate(-100,50,50)"/>
      {/* Middle petals */}
      <ellipse cx="50" cy="42" rx="11" ry="17" fill={`url(#${gradId})`} opacity="0.9" transform="rotate(0,50,50)"/>
      <ellipse cx="50" cy="42" rx="11" ry="17" fill={`url(#${gradId})`} opacity="0.9" transform="rotate(45,50,50)"/>
      <ellipse cx="50" cy="42" rx="11" ry="17" fill={`url(#${gradId})`} opacity="0.9" transform="rotate(90,50,50)"/>
      <ellipse cx="50" cy="42" rx="11" ry="17" fill={`url(#${gradId})`} opacity="0.9" transform="rotate(135,50,50)"/>
      {/* Center */}
      <circle cx="50" cy="50" r="10" fill={gradientTo} opacity="0.95"/>
      <circle cx="50" cy="50" r="6" fill={gradientFrom} opacity="0.8"/>
      <circle cx="47" cy="47" r="3" fill="white" opacity="0.2"/>
    </svg>
  );
}
