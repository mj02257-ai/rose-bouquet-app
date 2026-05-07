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

export default function ShowcaseView({ bouquetData, wrapper, onClose, onSend }: ShowcaseViewProps) {
  const [rotY, setRotY]       = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [entered, setEntered] = useState(false);

  const isDraggingRef = useRef(false);
  const lastXRef      = useRef(0);
  const velocityRef   = useRef(0);
  const rafRef        = useRef<number | undefined>(undefined);
  const containerRef  = useRef<HTMLDivElement>(null);

  // Entry animation trigger
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 40);
    return () => clearTimeout(t);
  }, []);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      setRotY((prev) => prev + dt * 0.028);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [autoRotate, isDragging]);

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
    setRotY((prev) => prev + delta * 0.5);
    lastXRef.current = x;
  }, []);

  const endDrag = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    let mom = velocityRef.current * 0.5;
    const decay = () => {
      mom *= 0.9;
      if (Math.abs(mom) < 0.06) return;
      setRotY((prev) => prev + mom);
      requestAnimationFrame(decay);
    };
    if (Math.abs(mom) > 0.25) requestAnimationFrame(decay);
  }, []);

  // passive:false touch move to block scroll
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onTouchMove = (e: TouchEvent) => { e.preventDefault(); moveDrag(e.touches[0].clientX); };
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
  }, [moveDrag]);

  const sortedRoses = [...bouquetData.roses].sort((a, b) => a.zIndex - b.zIndex);

  // Depth parallax: compute per-rose lateral + scale shift from rotation angle
  const rotRad = (rotY * Math.PI) / 180;
  const sinRot = Math.sin(rotRad);
  const zIndices = sortedRoses.map((r) => r.zIndex);
  const zMin = zIndices.length ? Math.min(...zIndices) : 0;
  const zMax = zIndices.length ? Math.max(...zIndices) : 1;
  const zRange = Math.max(1, zMax - zMin);

  return (
    <div
      className="fixed inset-0 bg-[#050505] z-50 flex flex-col"
      style={{
        animation: entered ? 'showcaseIn 0.55s cubic-bezier(0.16,1,0.3,1) both' : undefined,
      }}
    >
      {/* ── Header ────────────────────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 h-14 border-b border-white/[0.06]">
        <div>
          <p className="text-[10px] text-white/22 tracking-[0.08em] uppercase font-light">완성된 꽃다발</p>
          <p className="text-[12px] text-white/58 font-medium mt-0.5 tracking-wide">
            {bouquetData.roses.length}송이 · {wrapper.nameKo} 포장
          </p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* ── 360° Canvas ───────────────────────────────────── */}
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
          className="absolute pointer-events-none"
          style={{
            width: '500px', height: '500px',
            background: `radial-gradient(circle, ${wrapper.paperColor}18 0%, transparent 66%)`,
            filter: 'blur(80px)',
            transform: `translateX(${sinRot * 30}px)`,
            transition: 'transform 0.1s linear',
          }}
        />

        {/* ── Perspective stage (stronger = more 3D depth) ── */}
        <div style={{ perspective: '680px', perspectiveOrigin: '50% 44%' }}>
          {/*
           * rotateY drives the spin.
           * rotateX(-6deg) tilts the bouquet slightly toward viewer — more natural.
           */}
          <div
            style={{
              transform: `rotateY(${rotY}deg) rotateX(-6deg)`,
              transition: isDragging ? 'none' : 'transform 0.04s linear',
              transformStyle: 'preserve-3d',
            }}
          >
            <div
              className="relative"
              style={{
                width:  'clamp(220px, 40vw, 300px)',
                height: 'clamp(340px, 62vw, 460px)',
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Roses — each gets its own translateZ for true 3D depth */}
              {sortedRoses.map((rose) => {
                const rt = ROSES.find((r) => r.id === rose.roseTypeId);
                if (!rt) return null;

                // 0 = back, 1 = front
                const depthNorm = (rose.zIndex - zMin) / zRange;

                // Lateral parallax as bouquet turns (front roses shift more)
                const px = sinRot * depthNorm * 18;

                // Scale: front roses slightly larger when facing forward
                const scaleBoost = 1 + depthNorm * 0.14 * (1 - Math.abs(sinRot) * 0.5);

                // Z depth: spread roses from -40px (back) to +40px (front)
                const translateZ = (depthNorm - 0.5) * 80;

                // Shadow deepens for back roses
                const shadowBlur  = 10 + depthNorm * 12;
                const shadowAlpha = 0.35 + depthNorm * 0.25;

                return (
                  <div
                    key={rose.id}
                    className="absolute pointer-events-none"
                    style={{
                      left:      `${rose.x}%`,
                      top:       `${rose.y * 0.66}%`,
                      transform: `translate(calc(-50% + ${px}px), -50%) translateZ(${translateZ}px) scale(${rose.scale * 1.14 * scaleBoost}) rotate(${rose.rotation}deg)`,
                      zIndex:    rose.zIndex,
                      filter:    `drop-shadow(0 ${4 + depthNorm * 8}px ${shadowBlur}px rgba(0,0,0,${shadowAlpha}))`,
                      transition: isDragging ? 'none' : 'transform 0.04s linear',
                    }}
                  >
                    <RoseObject roseType={rt} size={70} />
                  </div>
                );
              })}

              {/* Wrapper at base — pushed slightly back in Z */}
              <div
                className="absolute bottom-0 left-1/2 pointer-events-none"
                style={{
                  transform: `translateX(-50%) translateZ(-30px)`,
                  transformStyle: 'preserve-3d',
                }}
              >
                <BouquetWrapper wrapper={wrapper} width={222} height={242} isOpen={false} />
              </div>
            </div>
          </div>
        </div>

        {/* Ground reflection — pseudo shadow */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '14%',
            width: 'clamp(140px, 26vw, 200px)',
            height: '28px',
            background: `radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 72%)`,
            filter: 'blur(8px)',
            transform: `scaleX(${0.7 + Math.abs(sinRot) * 0.3})`,
            transition: 'transform 0.06s linear',
          }}
        />

        {/* Drag hint */}
        <p className="absolute bottom-5 text-[10px] text-white/14 select-none pointer-events-none tracking-widest">
          ← 드래그해서 돌려보세요 →
        </p>
      </div>

      {/* ── Message footer ──────────────────────────────── */}
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
