'use client';

import type { RoseColor } from './BouquetScene3D';

const ROSE_OPTIONS: { id: RoseColor; nameKo: string; color: string; meaning: string }[] = [
  { id: 'red',   nameKo: '레드 로즈',   color: '#C0392B', meaning: '사랑' },
  { id: 'pink',  nameKo: '핑크 로즈',   color: '#E91E63', meaning: '진심' },
  { id: 'white', nameKo: '화이트 로즈', color: '#F0E8E0', meaning: '시작' },
  { id: 'peach', nameKo: '피치 로즈',   color: '#FFAB91', meaning: '감사' },
];

interface RoseLibraryProps {
  selectedColor: RoseColor | null;
  onSelectColor: (color: RoseColor) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoseLibrary({ selectedColor, onSelectColor, isOpen, onClose }: RoseLibraryProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-40 lg:z-auto
          w-[268px] h-full lg:h-auto
          bg-white border-r border-black/[0.07]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-0 left-0 lg:top-auto lg:left-auto
        `}
      >
        <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-black/[0.06]">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-black/35 font-medium">장미 색상을 선택해주세요</p>
            <button
              className="lg:hidden text-black/30 hover:text-black/70 transition-colors"
              onClick={onClose}
              aria-label="닫기"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1.5">
          {ROSE_OPTIONS.map((rose) => (
            <button
              key={rose.id}
              onClick={() => { onSelectColor(rose.id); onClose(); }}
              className={`
                w-full flex items-center gap-3 px-3 py-3.5 rounded-sm border transition-all duration-150
                ${selectedColor === rose.id
                  ? 'border-black/25 bg-black/[0.04]'
                  : 'border-transparent hover:border-black/[0.08] hover:bg-black/[0.02]'
                }
              `}
            >
              <div
                className="w-5 h-5 rounded-full flex-shrink-0 border border-black/10"
                style={{ backgroundColor: rose.color }}
              />
              <div className="text-left flex-1">
                <p className="text-[12px] text-black/70 font-medium">{rose.nameKo}</p>
                <p className="text-[10px] text-black/30">{rose.meaning}</p>
              </div>
              {selectedColor === rose.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-black/40 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
