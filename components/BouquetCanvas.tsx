'use client';

import dynamic from 'next/dynamic';
import type { RoseColor } from './BouquetScene3D';
import type { WrapperState } from '@/types/bouquet';

const BouquetScene3D = dynamic(() => import('./BouquetScene3D'), { ssr: false });

interface BouquetCanvasProps {
  selectedRoseColor: RoseColor | null;
  wrapperState: WrapperState;
  onTyingComplete: () => void;
}

export default function BouquetCanvas({
  selectedRoseColor, wrapperState, onTyingComplete,
}: BouquetCanvasProps) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: '#F4F2EE' }}>
      <BouquetScene3D
        selectedRoseColor={selectedRoseColor}
        wrapperState={wrapperState}
        onTyingComplete={onTyingComplete}
        forceLightBg={true}
      />
    </div>
  );
}
