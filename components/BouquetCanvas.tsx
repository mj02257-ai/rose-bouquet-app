'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { BouquetRose, RoseType } from '@/types/bouquet';
import { ROSES } from '@/lib/roseData';
import RoseObject from './RoseObject';

interface BouquetCanvasProps {
  roses: BouquetRose[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDrop: (roseTypeId: string, x: number, y: number) => void;
  isPreviewMode: boolean;
}

export default function BouquetCanvas({
  roses,
  selectedId,
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

  // Handle external drag-drop from library
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

  // Handle dragging placed roses
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
        isDragOver ? 'bg-white/5' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => onSelect(null)}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Drop zone hint */}
      {isDragOver && (
        <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-lg pointer-events-none z-10" />
      )}

      {/* Bouquet base */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-none">
        <svg viewBox="0 0 200 130" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="wrap-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3D2B1F" />
              <stop offset="50%" stopColor="#5C3D2E" />
              <stop offset="100%" stopColor="#2D1F14" />
            </linearGradient>
          </defs>
          {/* Wrapping paper */}
          <path d="M 60 130 L 80 40 L 120 40 L 140 130 Z" fill="url(#wrap-grad)" />
          <path d="M 60 130 L 80 40 L 100 60 L 80 130 Z" fill="rgba(0,0,0,0.2)" />
          <path d="M 140 130 L 120 40 L 100 60 L 120 130 Z" fill="rgba(255,255,255,0.05)" />
          {/* Ribbon */}
          <ellipse cx="100" cy="42" rx="22" ry="8" fill="#8B6355" opacity="0.8"/>
          <path d="M 78 42 Q 90 30 100 42 Q 110 54 122 42" stroke="#C4956A" strokeWidth="2" fill="none" opacity="0.6"/>
        </svg>
      </div>

      {/* Empty state */}
      {roses.length === 0 && !isPreviewMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <p className="text-[13px] text-white/20 text-center font-medium">
            어른이 된 오늘, 한 송이의 마음을 전해보세요.
          </p>
          <p className="text-[11px] text-white/12 text-center">
            왼쪽에서 장미를 선택하거나 드래그해 꽃다발을 완성하세요
          </p>
        </div>
      )}

      {/* Placed roses */}
      {sortedRoses.map((rose) => {
        const roseType = getRoseType(rose.roseTypeId);
        if (!roseType) return null;
        const isSelected = selectedId === rose.id;
        const isDragging = draggingId === rose.id;

        return (
          <div
            key={rose.id}
            className="absolute cursor-grab active:cursor-grabbing"
            style={{
              left: `${rose.x}%`,
              top: `${rose.y}%`,
              transform: `translate(-50%, -50%) scale(${rose.scale}) rotate(${rose.rotation}deg)`,
              zIndex: rose.zIndex,
              filter: isDragging
                ? `drop-shadow(0 0 12px ${roseType.color}88) drop-shadow(0 4px 16px rgba(0,0,0,0.5))`
                : isSelected
                ? `drop-shadow(0 0 8px ${roseType.color}66)`
                : 'drop-shadow(0 2px 6px rgba(0,0,0,0.4))',
              transition: isDragging ? 'none' : 'filter 0.2s ease',
              animation: 'roseAppear 0.3s ease-out',
            }}
            onMouseDown={(e) => !isPreviewMode && handleRoseMouseDown(e, rose)}
            onTouchStart={(e) => !isPreviewMode && handleRoseTouchStart(e, rose)}
          >
            {isSelected && !isPreviewMode && (
              <div
                className="absolute inset-0 rounded-full border-2 border-white/40 pointer-events-none"
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
