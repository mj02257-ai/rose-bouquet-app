'use client';

import { RoseType } from '@/types/bouquet';
import RoseObject from './RoseObject';

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
      {/* Rose thumbnail */}
      <div
        className="flex-shrink-0 w-11 h-11 rounded-sm flex items-center justify-center transition-transform duration-150 group-hover:scale-105"
        style={{ backgroundColor: `${rose.color}14` }}
      >
        <RoseObject roseType={rose} size={38} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium text-black/70 leading-tight">{rose.name}</p>
        <p className="text-[11px] text-black/38 leading-snug mt-0.5 truncate">{rose.meaningKo}</p>
      </div>

      {/* Add indicator */}
      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-black/30">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </div>
    </div>
  );
}
