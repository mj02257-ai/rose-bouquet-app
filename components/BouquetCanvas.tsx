'use client';

import { useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BouquetRose, BouquetData, WrapperStyle, WrapperState } from '@/types/bouquet';
import type { PendingRoseData, EditingRoseData } from './BouquetScene3D';

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
  pendingRose?: PendingRoseData | null;
  onPendingPositionChange?: (x: number, z: number) => void;
  editingRose?: EditingRoseData | null;
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
  pendingRose,
  onPendingPositionChange,
  editingRose,
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

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{ backgroundColor: 'var(--color-canvas)' }}
      onDragOver={!isPreviewMode ? handleDragOver : undefined}
      onDragLeave={!isPreviewMode ? handleDragLeave : undefined}
      onDrop={!isPreviewMode ? handleDrop : undefined}
    >
      <BouquetScene3D
        bouquetData={bouquetData}
        wrapperState={wrapperState}
        autoRotate={false}
        editMode={!isPreviewMode}
        selectedId={selectedId}
        onSelect={!isPreviewMode ? onSelect : undefined}
        onTyingComplete={onTyingComplete}
        pendingRose={pendingRose}
        onPendingPositionChange={onPendingPositionChange}
        editingRose={editingRose}
      />

      {isDragOver && (
        <div className="absolute inset-0 border border-dashed border-black/10 pointer-events-none z-10" />
      )}
    </div>
  );
}
