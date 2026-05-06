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
      className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 cursor-pointer transition-all duration-200 group"
      onClick={() => onAdd(rose)}
      draggable
      onDragStart={(e) => onDragStart(e, rose)}
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-black/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
        <RoseObject roseType={rose} size={44} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-medium text-cream truncate">{rose.name}</p>
        </div>
        <p className="text-xs text-gray-400 truncate">{rose.meaningKo}</p>
        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] border border-white/10 text-gray-400">
          {rose.category}
        </span>
      </div>
    </div>
  );
}
