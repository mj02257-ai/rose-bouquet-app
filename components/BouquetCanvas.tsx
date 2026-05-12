'use client';

import { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BouquetRose, BouquetData, WrapperStyle, WrapperState } from '@/types/bouquet';

// Three.js Canvas must not be server-rendered
const BouquetScene3D = dynamic(() => import('./BouquetScene3D'), { ssr: false });

interface BouquetCanvasProps {
  roses: BouquetRose[];
  selectedId: string | null;
  wrapper: WrapperStyle;
  wrapperState: WrapperState;
  message: string;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDrop: (roseTypeId: string, x: number, y: number) => void;
  onTyingComplete: () => void;
  isPreviewMode: boolean;
}

export default function BouquetCanvas({
  roses,
  selectedId,
  wrapper,
  wrapperState,
  message,
  onSelect,
  onDrop,
  onTyingComplete,
  isPreviewMode,
}: BouquetCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const getRelativePos = useCallback((clientX: number, clientY: number) => {
    if (!containerRef.current) return { x: 50, y: 50 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width)  * 100)),
      y: Math.max(0, Math.min(100, ((clientY - rect.top)  / rect.height) * 100)),
    };
  }, []);

  const handleDragOver  = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragOver(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragOver(false), []);
  const handleDrop      = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const roseTypeId = e.dataTransfer.getData('roseTypeId');
    if (!roseTypeId) return;
    const pos = getRelativePos(e.clientX, e.clientY);
    onDrop(roseTypeId, pos.x, pos.y);
  }, [getRelativePos, onDrop]);

  const bouquetData: BouquetData = { roses, wrapperId: wrapper.id, message };
  const isTying = wrapperState === 'tying';

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-canvas)' }}
      onDragOver={!isPreviewMode ? handleDragOver : undefined}
      onDragLeave={!isPreviewMode ? handleDragLeave : undefined}
      onDrop={!isPreviewMode ? handleDrop : undefined}
    >
      {/* ── 3D scene fills the entire canvas ─────────────────── */}
      <BouquetScene3D
        bouquetData={bouquetData}
        wrapperState={wrapperState}
        autoRotate={false}
        editMode={!isPreviewMode}
        selectedId={selectedId}
        onSelect={!isPreviewMode ? onSelect : undefined}
        onTyingComplete={onTyingComplete}
      />

      {/* Drag-over border indicator */}
      {isDragOver && (
        <div className="absolute inset-0 border border-dashed border-white/20 pointer-events-none z-10" />
      )}

      {/* Block interaction during tying animation */}
      {isTying && (
        <div className="absolute inset-0 pointer-events-auto z-20 flex items-end justify-center pb-6">
          <p className="text-[10px] text-white/22 tracking-widest select-none">리본을 묶는 중…</p>
        </div>
      )}

      {/* Empty state overlay */}
      {roses.length === 0 && !isPreviewMode && !isTying && (
        <div
          className="absolute inset-0 flex flex-col items-center gap-2 pointer-events-none"
          style={{ justifyContent: 'center', paddingBottom: '12%' }}
        >
          <p className="text-[13px] text-white/22 font-light tracking-wide px-6 text-center">
            어른이 된 오늘, 한 송이의 마음을 전해보세요.
          </p>
          <p className="text-[10px] text-white/10 tracking-widest uppercase">
            drag &amp; drop
          </p>
        </div>
      )}
    </div>
  );
}
