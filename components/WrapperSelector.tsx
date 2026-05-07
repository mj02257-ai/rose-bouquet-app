'use client';

import { WRAPPERS } from '@/lib/roseData';

interface WrapperSelectorProps {
  selectedId: string;
  onChange: (id: string) => void;
}

export default function WrapperSelector({ selectedId, onChange }: WrapperSelectorProps) {
  return (
    <div className="px-4 py-3 border-t border-white/[0.06]">
      <p className="text-[11px] text-white/25 font-medium mb-3">포장지 선택</p>
      <div className="flex gap-1.5 justify-between">
        {WRAPPERS.map((w) => (
          <button
            key={w.id}
            onClick={() => onChange(w.id)}
            title={w.nameKo}
            className="flex flex-col items-center gap-1.5 flex-1 group"
          >
            <div
              className="w-8 h-8 rounded-full transition-all duration-200 group-hover:scale-105"
              style={{
                backgroundColor: w.paperColor,
                border: `1.5px solid ${w.paperDark}`,
                boxShadow: selectedId === w.id
                  ? `0 0 0 2px #0F0F0F, 0 0 0 4px ${w.paperColor}`
                  : 'none',
                transform: selectedId === w.id ? 'scale(1.12)' : undefined,
                opacity: selectedId === w.id ? 1 : 0.52,
              }}
            />
            <span
              className="text-[9px] transition-colors"
              style={{ color: selectedId === w.id ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.2)' }}
            >
              {w.nameKo}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
