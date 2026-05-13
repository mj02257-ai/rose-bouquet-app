'use client';

import { RoseType } from '@/types/bouquet';

interface RoseCardProps {
  rose: RoseType;
  onAdd: (rose: RoseType) => void;
  onDragStart: (e: React.DragEvent, rose: RoseType) => void;
}

export default function RoseCard({ rose, onAdd, onDragStart }: RoseCardProps) {
  return (
    <div
      className="group flex items-center gap-3 px-2.5 py-2 rounded-sm cursor-pointer transition-all duration-150 hover:bg-black/[0.04]"
      onClick={() => onAdd(rose)}
      draggable
      onDragStart={(e) => onDragStart(e, rose)}
    >
      {/* Color dot */}
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        <div
          className="w-3 h-3 rounded-full border border-black/10"
          style={{ backgroundColor: rose.color }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-[#111110] leading-tight">{rose.name}</p>
        <p className="text-[11px] text-black/40 leading-snug mt-0.5 truncate">{rose.meaningKo}</p>
      </div>

      {/* Add indicator */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-black/25">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
