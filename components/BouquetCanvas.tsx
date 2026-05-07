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

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

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
      const roseX = (rose.x / 100) * rect.width + rect.left;
      const roseY = (rose.y / 100) * rect.height + rect.top;
      dragOffset.current = { x: e.clientX - roseX, y: e.clientY - roseY };
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
      const roseX = (rose.x / 100) * rect.width + rect.left;
      const roseY = (rose.y / 100) * rect.height + rect.top;
      dragOffset.current = { x: touch.clientX - roseX, y: touch.clientY - roseY };
    },
    [onSelect]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((e.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
      const y = ((e.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
      onMove(draggingId, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!draggingId || !canvasRef.current) return;
      const touch = e.touches[0];
      const rect = canvasRef.current.getBoundingClientRect();
      const x = ((touch.clientX - dragOffset.current.x - rect.left) / rect.width) * 100;
      const y = ((touch.clientY - dragOffset.current.y - rect.top) / rect.height) * 100;
      onMove(draggingId, Math.max(0, Math.min(100, x)), Math.max(0, Math.min(100, y)));
    };

    const handleMouseUp = () => setDraggingId(null);
    const handleTouchEnd = () => setDraggingId(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [draggingId, onMove]);

  const sortedRoses = [...roses].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      ref={canvasRef}
      className={`relative w-full h-full overflow-hidden select-none ${
        isDragOver ? 'bg-black/[0.03]' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect(null)}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.09) 1px, transparent 1px)`,
          backgroundSize: '28px 28px',
        }}
      />

      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-black/20 rounded-lg pointer-events-none z-10" />
      )}

      {/* Bouquet wrapper — open (flat) in edit mode */}
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
          className="absolute left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none"
          style={{ top: '22%' }}
        >
          <p className="text-[13px] text-black/25 text-center font-medium px-6">
            어른이 된 오늘, 한 송이의 마음을 전해보세요.
          </p>
          <p className="text-[11px] text-black/15 text-center">
            왼쪽에서 장미를 선택하거나 드래그해 추가하세요
          </p>
        </div>
      )}

      {/*
       * Each rose uses a single div positioned absolutely with full CSS transform
       * including translate(-50%,-50%). This ensures the click target matches the
       * visual center exactly — no inner div offset mismatch.
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
                ? `drop-shadow(0 0 14px ${roseType.color}88) drop-shadow(0 6px 18px rgba(0,0,0,0.25))`
                : isSelected
                ? `drop-shadow(0 0 10px ${roseType.color}66) drop-shadow(0 2px 8px rgba(0,0,0,0.18))`
                : 'drop-shadow(0 3px 8px rgba(0,0,0,0.18))',
              transition: isDragging ? 'none' : 'filter 0.2s ease',
              animation: 'roseEnter 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both',
            }}
            onMouseDown={(e) => !isPreviewMode && handleRoseMouseDown(e, rose)}
            onTouchStart={(e) => !isPreviewMode && handleRoseTouchStart(e, rose)}
          >
            {isSelected && !isPreviewMode && (
              <div
                className="absolute inset-0 rounded-full border-2 border-black/30 pointer-events-none"
                style={{ margin: '-4px' }}
              />
            )}
            <RoseObject roseType={roseType} size={60} />
          </div>
        );
      })}
    </div>
  );
}
