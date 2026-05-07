'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { BouquetRose, RoseType, WrapperStyle } from '@/types/bouquet';
import { ROSES } from '@/lib/roseData';
import RoseObject from './RoseObject';
import BouquetWrapper from './BouquetWrapper';

interface BouquetCanvasProps {
  roses: BouquetRose[];
  selectedId: string | null;
  wrapper: WrapperStyle;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDrop: (roseTypeId: string, x: number, y: number) => void;
  isPreviewMode: boolean;
}

export default function BouquetCanvas({
  roses,
  selectedId,
  wrapper,
  onSelect,
  onMove,
  onDrop,
  isPreviewMode,
}: BouquetCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const getRoseType = (roseTypeId: string): RoseType | undefined =>
    ROSES.find((r) => r.id === roseTypeId);

  const getCanvasRelativePos = useCallback((clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragOver(false), []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const roseTypeId = e.dataTransfer.getData('roseTypeId');
      if (!roseTypeId) return;
      const pos = getCanvasRelativePos(e.clientX, e.clientY);
      onDrop(roseTypeId, pos.x, pos.y);
    },
    [getCanvasRelativePos, onDrop]
  );

  const handleRoseMouseDown = useCallback(
    (e: React.MouseEvent, rose: BouquetRose) => {
      e.stopPropagation();
      onSelect(rose.id);
      setDraggingId(rose.id);
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - ((rose.x / 100) * rect.width + rect.left),
        y: e.clientY - ((rose.y / 100) * rect.height + rect.top),
      };
    },
    [onSelect]
  );

  const handleRoseTouchStart = useCallback(
    (e: React.TouchEvent, rose: BouquetRose) => {
      e.stopPropagation();
      onSelect(rose.id);
      setDraggingId(rose.id);
      if (!canvasRef.current) return;
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      dragOffset.current = {
        x: touch.clientX - ((rose.x / 100) * rect.width + rect.left),
        y: touch.clientY - ((rose.y / 100) * rect.height + rect.top),
      };
    },
    [onSelect]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      onMove(
        draggingId,
        Math.max(0, Math.min(100, ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100)),
        Math.max(0, Math.min(100, ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100))
      );
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      onMove(
        draggingId,
        Math.max(0, Math.min(100, ((touch.clientX - dragOffset.current.x - rect.left) / rect.width) * 100)),
        Math.max(0, Math.min(100, ((touch.clientY - dragOffset.current.y - rect.top) / rect.height) * 100))
      );
    };
    const end = () => setDraggingId(null);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', end);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', end);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', end);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', end);
    };
  }, [draggingId, onMove]);

  const sortedRoses = [...roses].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full overflow-hidden select-none ${isDragOver ? 'brightness-110' : ''}`}
      style={{ backgroundColor: 'var(--color-canvas)' }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect(null)}
    >
      {/* Subtle film-grain texture on dark canvas */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {isDragOver && (
        <div className="absolute inset-0 border border-dashed border-white/20 pointer-events-none z-10" />
      )}

      {/* Bouquet wrapper — open flat sheet in edit mode */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none z-10">
        <BouquetWrapper
          wrapper={wrapper}
          width={isPreviewMode ? 196 : 240}
          height={isPreviewMode ? 216 : 132}
          isOpen={!isPreviewMode}
        />
      </div>

      {/* Empty state */}
      {roses.length === 0 && !isPreviewMode && (
        <div
          className="absolute left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
          style={{ top: '24%' }}
        >
          <p className="text-[13px] text-white/22 text-center font-light tracking-wide px-6">
            어른이 된 오늘, 한 송이의 마음을 전해보세요.
          </p>
          <p className="text-[10px] text-white/12 text-center tracking-widest uppercase">
            Drag or click a rose to begin
          </p>
        </div>
      )}

      {/*
       * Single-div per rose: transform includes translate(-50%,-50%) so the
       * click target center exactly matches the visual center of the rose.
       * This fixes the delete inconsistency bug for all colors.
       */}
      {sortedRoses.map((rose) => {
        const roseType = getRoseType(rose.roseTypeId);
        if (!roseType) return null;
        const isSelected = selectedId === rose.id;
        const isDragging = draggingId === rose.id;

        return (
          <div
            key={rose.id}
            className={`absolute ${isPreviewMode ? '' : 'cursor-grab active:cursor-grabbing'}`}
            style={{
              left: `${rose.x}%`,
              top: `${rose.y}%`,
              zIndex: rose.zIndex,
              transform: `translate(-50%, -50%) scale(${rose.scale}) rotate(${rose.rotation}deg)`,
              filter: isDragging
                ? `drop-shadow(0 0 18px ${roseType.color}80) drop-shadow(0 8px 20px rgba(0,0,0,0.65))`
                : isSelected
                ? `drop-shadow(0 0 12px ${roseType.color}60) drop-shadow(0 4px 12px rgba(0,0,0,0.55))`
                : 'drop-shadow(0 4px 10px rgba(0,0,0,0.55))',
              transition: isDragging ? 'none' : 'filter 0.2s ease',
              animation: 'roseEnter 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
            onMouseDown={(e) => !isPreviewMode && handleRoseMouseDown(e, rose)}
            onTouchStart={(e) => !isPreviewMode && handleRoseTouchStart(e, rose)}
          >
            {isSelected && !isPreviewMode && (
              <div
                className="absolute inset-0 rounded-full border border-white/30 pointer-events-none"
                style={{ margin: '-6px' }}
              />
            )}
            <RoseObject roseType={roseType} size={60} />
          </div>
        );
      })}
    </div>
  );
}
