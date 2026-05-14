'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { RoseColor } from './BouquetScene3D';
import type { WrapperState } from '@/types/bouquet';

const BouquetScene3D = dynamic(() => import('./BouquetScene3D'), { ssr: false });

interface ShowcaseViewProps {
  selectedRoseColor: RoseColor | null;
  wrapperState: WrapperState;
  message?: string;
  onTyingComplete: () => void;
  onClose: () => void;
  onSend: () => void;
}

export default function ShowcaseView({
  selectedRoseColor, wrapperState, message, onTyingComplete, onClose, onSend,
}: ShowcaseViewProps) {
  const [autoRotate, setAutoRotate] = useState(true);
  const [entered, setEntered]       = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  const isDone = wrapperState === 'ribbonTied';

  return (
    <div
      className="fixed inset-0 bg-[#050505] z-50 flex flex-col"
      style={{ animation: entered ? 'showcaseIn 0.55s cubic-bezier(0.16,1,0.3,1) both' : undefined }}
    >
      <div className="flex-shrink-0 flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
        <div>
          <p className="text-[10px] text-white/22 tracking-[0.08em] uppercase font-light">완성된 꽃다발</p>
          <p className="text-[12px] text-white/58 font-medium mt-0.5 tracking-wide">
            한 송이 · 블랙 리본 포장
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDone && (
            <button
              onClick={() => setAutoRotate((v) => !v)}
              className={`hidden sm:flex px-3 py-1.5 text-[11px] rounded-sm border transition-all ${
                autoRotate
                  ? 'border-white/20 text-white/55 bg-white/[0.05]'
                  : 'border-white/[0.07] text-white/25 hover:text-white/45'
              }`}
            >
              {autoRotate ? '↻ 자동 회전 중' : '자동 회전'}
            </button>
          )}
          <button
            onClick={onSend}
            disabled={!isDone}
            className={`px-4 py-1.5 text-[11px] font-semibold rounded-sm transition-colors ${
              isDone
                ? 'bg-[#F0EDE8] text-[#0A0A0A] hover:bg-white'
                : 'bg-white/[0.06] text-white/20 cursor-not-allowed'
            }`}
          >
            선물하기
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] rounded-sm border border-white/[0.08] text-white/38 hover:text-white/65 transition-all"
          >
            편집으로
          </button>
        </div>
      </div>

      <div className="flex-1 relative">
        <BouquetScene3D
          selectedRoseColor={selectedRoseColor}
          wrapperState={wrapperState}
          autoRotate={autoRotate && isDone}
          onTyingComplete={onTyingComplete}
        />

        {wrapperState === 'tying' && (
          <p className="absolute bottom-5 w-full text-center text-[10px] text-white/18 select-none pointer-events-none tracking-widest">
            리본을 묶는 중…
          </p>
        )}
        {isDone && (
          <p className="absolute bottom-5 w-full text-center text-[10px] text-white/14 select-none pointer-events-none tracking-widest">
            ← 드래그해서 돌려보세요 →
          </p>
        )}
      </div>

      {message && (
        <div className="flex-shrink-0 px-6 py-3.5 border-t border-white/[0.06] text-center">
          <p className="text-[12px] text-white/35 italic leading-relaxed">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
