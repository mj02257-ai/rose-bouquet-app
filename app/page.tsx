'use client';

import { useState, useCallback, useEffect } from 'react';
import type { WrapperState } from '@/types/bouquet';
import type { RoseColor } from '@/components/BouquetScene3D';
import Header from '@/components/Header';
import RoseLibrary from '@/components/RoseLibrary';
import BouquetCanvas from '@/components/BouquetCanvas';
import PropertiesPanel from '@/components/PropertiesPanel';
import ShareModal from '@/components/ShareModal';
import ShowcaseView from '@/components/ShowcaseView';

export default function HomePage() {
  const [selectedRoseColor, setSelectedRoseColor] = useState<RoseColor | null>(null);
  const [message, setMessage]                     = useState('');
  const [isPreviewMode, setIsPreviewMode]         = useState(false);
  const [isShowcaseMode, setIsShowcaseMode]       = useState(false);
  const [showShareModal, setShowShareModal]       = useState(false);
  const [wrapperState, setWrapperState]           = useState<WrapperState>('wrapped');
  const [isLibraryOpen, setIsLibraryOpen]         = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen]   = useState(false);

  const handleSelectColor = useCallback((color: RoseColor) => {
    setSelectedRoseColor(color);
  }, []);

  const handleClearAll = useCallback(() => {
    setSelectedRoseColor(null);
    setMessage('');
  }, []);

  const handleComplete = useCallback(() => {
    if (!selectedRoseColor) return;
    setWrapperState('tying');
  }, [selectedRoseColor]);

  const handleTyingComplete = useCallback(() => {
    setWrapperState('ribbonTied');
    setTimeout(() => setIsShowcaseMode(true), 500);
  }, []);

  const handleCloseShowcase = useCallback(() => {
    setIsShowcaseMode(false);
    setWrapperState('wrapped');
  }, []);

  // Persist selection
  useEffect(() => {
    try {
      localStorage.setItem('rosery-simple', JSON.stringify({ selectedRoseColor, message }));
    } catch { /* ignore */ }
  }, [selectedRoseColor, message]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rosery-simple');
      if (saved) {
        const { selectedRoseColor: sc, message: sm } = JSON.parse(saved);
        if (sc) setSelectedRoseColor(sc);
        if (typeof sm === 'string') setMessage(sm);
      }
    } catch { /* ignore */ }
  }, []);

  const isTying = wrapperState === 'tying';

  return (
    <div className="flex flex-col bg-white h-screen lg:overflow-hidden">

      {isShowcaseMode && (
        <ShowcaseView
          selectedRoseColor={selectedRoseColor}
          wrapperState={wrapperState}
          message={message}
          onTyingComplete={handleTyingComplete}
          onClose={handleCloseShowcase}
          onSend={() => { handleCloseShowcase(); setShowShareModal(true); }}
        />
      )}

      {!isPreviewMode && !isShowcaseMode && (
        <Header
          onClearAll={handleClearAll}
          onPreview={() => setIsPreviewMode(true)}
          onSend={() => setShowShareModal(true)}
          isPreviewMode={false}
          onOpenLibrary={() => setIsLibraryOpen(true)}
        />
      )}

      {isPreviewMode && (
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setIsPreviewMode(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#111110] text-white text-[11px] font-semibold hover:bg-black transition-colors shadow-xl"
          >
            ← 편집으로
          </button>
        </div>
      )}

      {!isShowcaseMode && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden min-h-0">

          {/* Left sidebar — rose color selection */}
          {!isPreviewMode && (
            <RoseLibrary
              selectedColor={selectedRoseColor}
              onSelectColor={handleSelectColor}
              isOpen={isLibraryOpen}
              onClose={() => setIsLibraryOpen(false)}
            />
          )}

          {/* Center column */}
          <div className="flex flex-col flex-1 min-h-0 lg:overflow-hidden">

            {/* 3D Canvas */}
            <main
              className="relative overflow-hidden h-[62vh] flex-shrink-0 lg:h-auto lg:flex-1"
              style={{ backgroundColor: '#F4F2EE' }}
            >
              <BouquetCanvas
                selectedRoseColor={selectedRoseColor}
                wrapperState={wrapperState}
                onTyingComplete={handleTyingComplete}
              />

              {isTying && (
                <div className="absolute inset-0 pointer-events-auto z-20 flex items-end justify-center pb-6">
                  <p className="text-[10px] text-black/30 tracking-widest select-none">리본을 묶는 중…</p>
                </div>
              )}

              {!selectedRoseColor && !isPreviewMode && !isTying && (
                <div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ paddingBottom: '10%' }}
                >
                  <p className="text-[13px] text-black/45 font-light tracking-wide px-6 text-center select-none">
                    어른이 된 오늘, 한 송이의 마음을 전해보세요.
                  </p>
                </div>
              )}
            </main>

            {/* Mobile bottom section */}
            {!isPreviewMode && (
              <div className="lg:hidden flex-shrink-0 bg-white border-t border-black/[0.07] px-4 pt-4 pb-6 space-y-4">

                {/* Color buttons */}
                <div>
                  <p className="text-[10px] text-black/35 tracking-widest uppercase font-medium mb-2.5">장미 선택</p>
                  <div className="flex gap-2">
                    {(['red', 'pink', 'white', 'peach'] as RoseColor[]).map((color) => {
                      const colorMap: Record<RoseColor, string> = {
                        red: '#C0392B', pink: '#E91E63', white: '#F0E8E0', peach: '#FFAB91',
                      };
                      const nameMap: Record<RoseColor, string> = {
                        red: '레드', pink: '핑크', white: '화이트', peach: '피치',
                      };
                      return (
                        <button
                          key={color}
                          onClick={() => handleSelectColor(color)}
                          className={`flex-1 flex flex-col items-center gap-1.5 px-2 py-3 rounded-sm border transition-all
                            ${selectedRoseColor === color
                              ? 'border-black/30 bg-black/[0.05]'
                              : 'border-black/[0.09] hover:border-black/20 hover:bg-black/[0.03]'
                            }`}
                        >
                          <div
                            className="w-5 h-5 rounded-full border border-black/10"
                            style={{ backgroundColor: colorMap[color] }}
                          />
                          <span className="text-[10px] text-black/45 font-medium">{nameMap[color]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <p className="text-[10px] text-black/35 tracking-widest uppercase font-medium mb-2">메시지 카드</p>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="직접 메시지를 입력해보세요…"
                    rows={2}
                    className="w-full bg-black/[0.03] border border-black/[0.08] rounded-sm px-3 py-2.5 text-[12px] text-black/65 placeholder-black/22 focus:outline-none focus:border-black/18 resize-none transition-colors leading-relaxed"
                  />
                </div>

                {/* Complete button */}
                <button
                  onClick={handleComplete}
                  disabled={!selectedRoseColor || isTying}
                  className={`w-full py-3.5 text-[13px] font-semibold rounded-sm transition-all duration-200 ${
                    selectedRoseColor && !isTying
                      ? 'bg-[#111110] text-white hover:bg-black active:bg-black/80'
                      : 'bg-black/[0.05] text-black/22 cursor-not-allowed border border-black/[0.07]'
                  }`}
                >
                  {selectedRoseColor ? '꽃다발 완성하기 →' : '장미를 선택해주세요'}
                </button>
              </div>
            )}
          </div>

          {/* Right panel */}
          {!isPreviewMode && (
            <PropertiesPanel
              hasRose={selectedRoseColor !== null}
              message={message}
              onMessageChange={setMessage}
              onComplete={handleComplete}
              isOpen={isPropertiesOpen}
              onClose={() => setIsPropertiesOpen(false)}
            />
          )}
        </div>
      )}

      {showShareModal && (
        <ShareModal
          bouquetData={{
            roses: selectedRoseColor ? [{
              id: 'rose-1', roseTypeId: selectedRoseColor,
              x: 50, y: 50, scale: 1, rotation: 0, zIndex: 1,
              x3d: 0, y3d: -0.72, z3d: 0,
            }] : [],
            wrapperId: 'wrapper_ribbon_tied_base',
            message,
          }}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
