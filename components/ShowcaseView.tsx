'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { BouquetData, WrapperStyle } from '@/types/bouquet';
import { ROSES } from '@/lib/roseData';
import RoseObject from './RoseObject';
import BouquetWrapper from './BouquetWrapper';

interface ShowcaseViewProps {
  bouquetData: BouquetData;
  wrapper: WrapperStyle;
  onClose: () => void;
  onSend: () => void;
}

/**
 * Full-screen showcase with CSS perspective rotateY for 360° viewing.
 * Mouse drag / touch swipe controls rotation; auto-rotate on entry.
 * Momentum: released drag coasts with exponential decay.
 */
export default function ShowcaseView({ bouquetData, wrapper, onClose, onSend }: ShowcaseViewProps) {
  const [rotY, setRotY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);

  // Mutable refs so drag callbacks stay stable (no deps)
  const isDraggingRef = useRef(false);
  const lastXRef     = useRef(0);
  const velocityRef  = useRef(0);
  const rafRef       = useRef<number | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  // ── Auto-rotation ──────────────────────────────────────────────
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      setRotY((prev) => prev + dt * 0.032);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [autoRotate, isDragging]);

  // ── Drag handlers (stable refs, empty deps) ───────────────────
  const startDrag = useCallback((x: number) => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    isDraggingRef.current = true;
    setIsDragging(true);
    setAutoRotate(false);
    lastXRef.current = x;
    velocityRef.current = 0;
  }, []);

  const moveDrag = useCallback((x: number) => {
    if (!isDraggingRef.current) return;
    const delta = x - lastXRef.current;
    velocityRef.current = delta;
    setRotY((prev) => prev + delta * 0.44);
    lastXRef.current = x;
  }, []);

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    // Momentum coast
    let mom = velocityRef.current * 0.44;
    const decay = () => {
      mom *= 0.91;
      if (Math.abs(mom) < 0.08) return;
      setRotY((prev) => prev + mom);
      requestAnimationFrame(decay);
    };
    if (Math.abs(mom) > 0.3) requestAnimationFrame(decay);
  }, []);

  // ── Touch: passive:false to prevent scroll ────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      moveDrag(e.touches[0].clientX);
    };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [moveDrag]);

  const sortedRoses = [...bouquetData.roses].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="fixed inset-0 bg-[#060606] z-50 flex flex-col">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
        <div>
          <p className="text-[11px] text-white/25">완성된 꽃다발</p>
          <p className="text-[12px] text-white/65 font-medium mt-0.5">
            {bouquetData.roses.length}송이 · {wrapper.nameKo} 포장
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Auto-rotate toggle */}
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
          <button
            onClick={onSend}
            className="px-4 py-1.5 text-[11px] font-semibold rounded-sm bg-[#F0EDE8] text-[#0A0A0A] hover:bg-white transition-colors"
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

      {/* ── 360° Canvas ── */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center select-none overflow-hidden relative"
        style={{ cursor: isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        onMouseDown={(e) => startDrag(e.clientX)}
        onMouseMove={(e) => moveDrag(e.clientX)}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={(e) => startDrag(e.touches[0].clientX)}
        onTouchEnd={endDrag}
      >
        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '380px',
            height: '380px',
            background: `radial-gradient(circle, ${wrapper.paperColor}16 0%, transparent 68%)`,
            filter: 'blur(70px)',
          }}
        />

        {/* Perspective stage */}
        <div style={{ perspective: '1000px', perspectiveOrigin: '50% 42%' }}>
          <div
            style={{
              transform: `rotateY(${rotY}deg)`,
              transition: isDragging ? 'none' : 'transform 0.04s linear',
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Bouquet: roses on top, wrapper at bottom */}
            <div
              className="relative"
              style={{
                width:  'clamp(210px, 38vw, 290px)',
                height: 'clamp(330px, 58vw, 450px)',
              }}
            >
              {/* Roses */}
              {sortedRoses.map((rose) => {
                const rt = ROSES.find((r) => r.id === rose.roseTypeId);
                if (!rt) return null;
                return (
                  <div
                    key={rose.id}
                    className="absolute pointer-events-none"
                    style={{
                      left:      `${rose.x}%`,
                      top:       `${rose.y * 0.66}%`,
                      transform: `translate(-50%, -50%) scale(${rose.scale * 1.15}) rotate(${rose.rotation}deg)`,
                      zIndex:    rose.zIndex,
                      filter:    'drop-shadow(0 4px 14px rgba(0,0,0,0.45))',
                    }}
                  >
                    <RoseObject roseType={rt} size={70} />
                  </div>
                );
              })}

              {/* Wrapper */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
                <BouquetWrapper wrapper={wrapper} width={218} height={238} />
              </div>
            </div>
          </div>
        </div>

        {/* Hint */}
        <p className="absolute bottom-6 text-[10px] text-white/14 select-none pointer-events-none tracking-wider">
          ← 드래그해서 돌려보세요 →
        </p>
      </div>

      {/* ── Message footer ── */}
      {bouquetData.message && (
        <div className="flex-shrink-0 px-6 py-3.5 border-t border-white/[0.06] text-center">
          <p className="text-[12px] text-white/35 italic leading-relaxed">
            &ldquo;{bouquetData.message}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
