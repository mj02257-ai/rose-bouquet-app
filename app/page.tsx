'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { BouquetRose, BouquetData, RoseType, HistoryEntry, WrapperState } from '@/types/bouquet';
import { ROSES, WRAPPERS, DEFAULT_WRAPPER_ID } from '@/lib/roseData';
import Header from '@/components/Header';
import RoseLibrary from '@/components/RoseLibrary';
import BouquetCanvas from '@/components/BouquetCanvas';
import PropertiesPanel from '@/components/PropertiesPanel';
import ShareModal from '@/components/ShareModal';
import ShowcaseView from '@/components/ShowcaseView';

let idCounter = 0;
const generateId = () => `rose-${Date.now()}-${++idCounter}`;

const MAX_HISTORY = 30;
const MAX_ROSES   = 9;

export default function HomePage() {
  const [roses, setRoses]             = useState<BouquetRose[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [pendingRoseType, setPendingRoseType] = useState<RoseType | null>(null);
  const [message, setMessage]         = useState('');
  const [wrapperId, setWrapperId]     = useState(DEFAULT_WRAPPER_ID);
  const [isPreviewMode, setIsPreviewMode]   = useState(false);
  const [isShowcaseMode, setIsShowcaseMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);
  const [isLibraryOpen, setIsLibraryOpen]       = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [editWrapperState, setEditWrapperState] = useState<WrapperState>('wrapped');
  const pendingRoseIdRef = useRef<string | null>(null);

  const saveHistory = useCallback(
    (currentRoses: BouquetRose[], currentMessage: string) => {
      setHistory((prev) => [
        ...prev.slice(-MAX_HISTORY + 1),
        { roses: currentRoses, message: currentMessage },
      ]);
    },
    []
  );

  const addRose = useCallback(
    (roseType: RoseType) => {
      const newId = generateId();
      setRoses((prev) => {
        if (prev.length >= MAX_ROSES) return prev;
        saveHistory(prev, message);
        const maxZ = prev.length > 0 ? Math.max(...prev.map((r) => r.zIndex)) : 0;
        const newRose: BouquetRose = {
          id: newId,
          roseTypeId: roseType.id,
          x: 50,
          y: 50,
          scale: 1,
          rotation: Math.random() * 30 - 15,
          zIndex: maxZ + 1,
        };
        pendingRoseIdRef.current = newId;
        return [...prev, newRose];
      });
    },
    [message, saveHistory]
  );

  // Auto-select the newly placed rose after state updates
  useEffect(() => {
    if (!pendingRoseIdRef.current) return;
    const id = pendingRoseIdRef.current;
    pendingRoseIdRef.current = null;
    setSelectedId(id);
    setIsPropertiesOpen(true);
  }, [roses]);

  // Select rose type from library — preview only, not placed yet
  const handleSelectRoseType = useCallback((rose: RoseType) => {
    setPendingRoseType(rose);
    setIsPropertiesOpen(true);
  }, []);

  // Confirm placement — actually inserts the pending rose into the bouquet
  const handleConfirmPlace = useCallback(() => {
    if (!pendingRoseType || roses.length >= MAX_ROSES) return;
    addRose(pendingRoseType);
    setPendingRoseType(null);
  }, [pendingRoseType, roses.length, addRose]);

  const handleDragStart = useCallback((e: React.DragEvent, rose: RoseType) => {
    e.dataTransfer.setData('roseTypeId', rose.id);
  }, []);

  // Drag-and-drop onto canvas is a direct, intentional placement
  const handleDrop = useCallback(
    (roseTypeId: string, _x: number, _y: number) => {
      const roseType = ROSES.find((r) => r.id === roseTypeId);
      if (roseType) addRose(roseType);
    },
    [addRose]
  );

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setRoses((prev) => prev.map((r) => (r.id === id ? { ...r, x, y } : r)));
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setIsPropertiesOpen(true);
  }, []);

  const handleScaleChange = useCallback(
    (scale: number) => {
      if (!selectedId) return;
      setRoses((prev) => prev.map((r) => (r.id === selectedId ? { ...r, scale } : r)));
    },
    [selectedId]
  );

  const handleRotationChange = useCallback(
    (rotation: number) => {
      if (!selectedId) return;
      setRoses((prev) => prev.map((r) => (r.id === selectedId ? { ...r, rotation } : r)));
    },
    [selectedId]
  );

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    setRoses((prev) => { saveHistory(prev, message); return prev.filter((r) => r.id !== selectedId); });
    setSelectedId(null);
  }, [selectedId, message, saveHistory]);

  const handleUndo = useCallback(() => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const last = prev[prev.length - 1];
      setRoses(last.roses);
      setMessage(last.message);
      setSelectedId(null);
      return prev.slice(0, -1);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setRoses((prev) => { saveHistory(prev, message); return []; });
    setSelectedId(null);
    setPendingRoseType(null);
  }, [message, saveHistory]);

  const handleComplete = useCallback(() => {
    if (roses.length === 0) return;
    setEditWrapperState('tying');
  }, [roses.length]);

  const handleTyingComplete = useCallback(() => {
    setEditWrapperState('ribbonTied');
    setTimeout(() => setIsShowcaseMode(true), 500);
  }, []);

  const handleCloseShowcase = useCallback(() => {
    setIsShowcaseMode(false);
    setEditWrapperState('wrapped');
  }, []);

  const selectedRose     = roses.find((r) => r.id === selectedId) || null;
  const selectedRoseType = selectedRose ? ROSES.find((r) => r.id === selectedRose.roseTypeId) || null : null;
  const selectedWrapper  = WRAPPERS.find((w) => w.id === wrapperId) ?? WRAPPERS[0];
  const bouquetData: BouquetData = { roses, wrapperId, message };
  const isTying    = editWrapperState === 'tying';
  const atMaxRoses = roses.length >= MAX_ROSES;

  useEffect(() => {
    try { localStorage.setItem('rosery-bouquet', JSON.stringify({ roses, message, wrapperId })); } catch { /* ignore */ }
  }, [roses, message, wrapperId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rosery-bouquet');
      if (saved) {
        const { roses: sr, message: sm, wrapperId: sw } = JSON.parse(saved);
        if (Array.isArray(sr)) setRoses(sr.slice(0, MAX_ROSES));
        if (typeof sm === 'string') setMessage(sm);
        if (typeof sw === 'string') setWrapperId(sw);
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="flex flex-col bg-white h-screen lg:overflow-hidden">

      {isShowcaseMode && (
        <ShowcaseView
          bouquetData={bouquetData}
          wrapper={selectedWrapper}
          wrapperState="ribbonTied"
          onTyingComplete={() => {}}
          onClose={handleCloseShowcase}
          onSend={() => { handleCloseShowcase(); setShowShareModal(true); }}
        />
      )}

      {!isPreviewMode && !isShowcaseMode && (
        <Header
          onUndo={handleUndo}
          onClearAll={handleClearAll}
          onPreview={() => setIsPreviewMode(true)}
          onSend={() => setShowShareModal(true)}
          isPreviewMode={false}
          canUndo={history.length > 0}
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

          {/* Left sidebar */}
          {!isPreviewMode && (
            <RoseLibrary
              onAddRose={handleSelectRoseType}
              onDragStart={handleDragStart}
              isOpen={isLibraryOpen}
              onClose={() => setIsLibraryOpen(false)}
              wrapperId={wrapperId}
              onWrapperChange={setWrapperId}
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
                roses={roses}
                selectedId={selectedId}
                wrapper={selectedWrapper}
                wrapperState={editWrapperState}
                message={message}
                onSelect={handleSelect}
                onMove={handleMove}
                onDrop={handleDrop}
                onTyingComplete={handleTyingComplete}
                isPreviewMode={isPreviewMode}
              />

              {isTying && (
                <div className="absolute inset-0 pointer-events-auto z-20 flex items-end justify-center pb-6">
                  <p className="text-[10px] text-black/30 tracking-widest select-none">리본을 묶는 중…</p>
                </div>
              )}

              {/* Empty state — single line, no secondary text */}
              {roses.length === 0 && !isPreviewMode && !isTying && (
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

            {/* ── Mobile bottom section (hidden on PC) ── */}
            {!isPreviewMode && (
              <div className="lg:hidden flex-shrink-0 bg-white border-t border-black/[0.07] px-4 pt-4 pb-6 space-y-4">

                {/* Rose type selection */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="text-[10px] text-black/35 tracking-widest uppercase font-medium">장미 선택</p>
                    {atMaxRoses && (
                      <p className="text-[10px] text-black/30">최대 {MAX_ROSES}송이</p>
                    )}
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {ROSES.map((rose) => (
                      <button
                        key={rose.id}
                        onClick={() => handleSelectRoseType(rose)}
                        disabled={atMaxRoses}
                        className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-sm border transition-all
                          ${pendingRoseType?.id === rose.id
                            ? 'border-black/30 bg-black/[0.05]'
                            : atMaxRoses
                              ? 'border-black/[0.05] opacity-40 cursor-not-allowed'
                              : 'border-black/[0.09] hover:border-black/20 hover:bg-black/[0.03] active:bg-black/[0.06]'
                          }`}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-black/10"
                          style={{ backgroundColor: rose.color }}
                        />
                        <span className="text-[10px] text-black/45 font-medium">{rose.category}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* "여기에 두기" — shown when a rose type is pending */}
                {pendingRoseType && !atMaxRoses && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: pendingRoseType.color }}
                      />
                      <span className="text-[11px] text-black/50">{pendingRoseType.name} 선택됨</span>
                    </div>
                    <button
                      onClick={handleConfirmPlace}
                      className="px-4 py-2 rounded-sm bg-[#111110] text-white text-[11px] font-semibold hover:bg-black transition-colors flex-shrink-0"
                    >
                      여기에 두기
                    </button>
                  </div>
                )}

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
                  disabled={roses.length === 0 || isTying}
                  className={`w-full py-3.5 text-[13px] font-semibold rounded-sm transition-all duration-200 ${
                    roses.length > 0 && !isTying
                      ? 'bg-[#111110] text-white hover:bg-black active:bg-black/80'
                      : 'bg-black/[0.05] text-black/22 cursor-not-allowed border border-black/[0.07]'
                  }`}
                >
                  {roses.length > 0 ? `꽃다발 완성하기 →` : '장미를 추가해보세요'}
                </button>
              </div>
            )}
          </div>

          {/* Right panel */}
          {!isPreviewMode && (
            <PropertiesPanel
              selectedRose={selectedRose}
              roseType={selectedRoseType}
              pendingRoseType={pendingRoseType}
              totalRoses={roses.length}
              message={message}
              onMessageChange={setMessage}
              onRotationChange={handleRotationChange}
              onConfirmPlace={handleConfirmPlace}
              onDelete={handleDelete}
              onComplete={handleComplete}
              isOpen={isPropertiesOpen}
              onClose={() => setIsPropertiesOpen(false)}
            />
          )}
        </div>
      )}

      {showShareModal && (
        <ShareModal
          bouquetData={bouquetData}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
