'use client';

import { useState, useCallback, useEffect } from 'react';
import { BouquetRose, BouquetData, RoseType, HistoryEntry, WrapperState, EditingRoseData } from '@/types/bouquet';
import { ROSES, WRAPPERS, DEFAULT_WRAPPER_ID } from '@/lib/roseData';
import Header from '@/components/Header';
import RoseLibrary from '@/components/RoseLibrary';
import BouquetCanvas from '@/components/BouquetCanvas';
import PropertiesPanel from '@/components/PropertiesPanel';
import ShareModal from '@/components/ShareModal';
import ShowcaseView from '@/components/ShowcaseView';
import type { PendingRoseData } from '@/components/BouquetScene3D';

let idCounter = 0;
const generateId = () => `rose-${Date.now()}-${++idCounter}`;

const MAX_HISTORY = 30;
const MAX_ROSES   = 9;

// Y positions in 3D scene
const PENDING_Y  = -0.20;  // above wrapper opening — visible to user
const PLACED_Y   = -0.45;  // inside wrapper — stem hidden, flower shows above

export default function HomePage() {
  const [roses, setRoses]               = useState<BouquetRose[]>([]);
  const [selectedId, setSelectedId]     = useState<string | null>(null);
  const [pendingRose, setPendingRose]   = useState<PendingRoseData | null>(null);
  const [editingRose, setEditingRose]   = useState<EditingRoseData | null>(null);
  const [message, setMessage]           = useState('');
  const [wrapperId, setWrapperId]       = useState(DEFAULT_WRAPPER_ID);
  const [isPreviewMode, setIsPreviewMode]   = useState(false);
  const [isShowcaseMode, setIsShowcaseMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [history, setHistory]           = useState<HistoryEntry[]>([]);
  const [isLibraryOpen, setIsLibraryOpen]       = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);
  const [editWrapperState, setEditWrapperState] = useState<WrapperState>('wrapped');

  const saveHistory = useCallback(
    (currentRoses: BouquetRose[], currentMessage: string) => {
      setHistory((prev) => [
        ...prev.slice(-MAX_HISTORY + 1),
        { roses: currentRoses, message: currentMessage },
      ]);
    },
    []
  );

  // ── Stage 1: select from library → pendingRose spawns above bouquet ──────────
  const handleSelectRoseType = useCallback((rose: RoseType) => {
    setEditingRose(null);        // cancel any in-progress editing
    setSelectedId(null);
    setPendingRose({ roseTypeId: rose.id, x3d: 0, y3d: PENDING_Y, z3d: 0 });
    setIsPropertiesOpen(true);
  }, []);

  // Drag updates x/z only; y stays at PENDING_Y (drag plane level)
  const handlePendingPositionChange = useCallback((x: number, z: number) => {
    setPendingRose((prev) => prev ? { ...prev, x3d: x, z3d: z } : null);
  }, []);

  // Cancel pending before placing
  const handleCancelPending = useCallback(() => {
    setPendingRose(null);
    setIsPropertiesOpen(false);
  }, []);

  // ── Stage 2: "여기에 두기" → pendingRose becomes editingRose ─────────────────
  const handleConfirmPlace = useCallback(() => {
    if (!pendingRose || roses.length >= MAX_ROSES) return;
    setEditingRose({
      id: generateId(),
      roseTypeId: pendingRose.roseTypeId,
      x3d: pendingRose.x3d,
      y3d: PLACED_Y,           // snap down into wrapper
      z3d: pendingRose.z3d,
      rotation: 0,
    });
    setPendingRose(null);
  }, [pendingRose, roses.length]);

  const handleEditingRotationChange = useCallback((rotation: number) => {
    setEditingRose((prev) => prev ? { ...prev, rotation } : null);
  }, []);

  const handleDeleteEditing = useCallback(() => {
    setEditingRose(null);
  }, []);

  // ── Stage 3: "고정하기" → editingRose enters fixedRoses ──────────────────────
  const handleFixRose = useCallback(() => {
    if (!editingRose || roses.length >= MAX_ROSES) return;
    saveHistory(roses, message);
    const maxZ = roses.length > 0 ? Math.max(...roses.map((r) => r.zIndex)) : 0;
    const newRose: BouquetRose = {
      id: editingRose.id,
      roseTypeId: editingRose.roseTypeId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: editingRose.rotation,
      zIndex: maxZ + 1,
      x3d: editingRose.x3d,
      y3d: editingRose.y3d,
      z3d: editingRose.z3d,
    };
    setRoses((prev) => [...prev, newRose]);
    setEditingRose(null);
  }, [editingRose, roses, message, saveHistory]);

  // ── Fixed-rose editing ────────────────────────────────────────────────────────
  const handleDragStart = useCallback((e: React.DragEvent, rose: RoseType) => {
    e.dataTransfer.setData('roseTypeId', rose.id);
  }, []);

  const handleDrop = useCallback(
    (roseTypeId: string, _x: number, _y: number) => {
      const roseType = ROSES.find((r) => r.id === roseTypeId);
      if (roseType) handleSelectRoseType(roseType);
    },
    [handleSelectRoseType]
  );

  const handleMove = useCallback((id: string, x: number, y: number) => {
    setRoses((prev) => prev.map((r) => (r.id === id ? { ...r, x, y } : r)));
  }, []);

  const handleSelect = useCallback((id: string | null) => {
    if (id) {
      setPendingRose(null);
      setEditingRose(null);
    }
    setSelectedId(id);
    if (id) setIsPropertiesOpen(true);
  }, []);

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
      setPendingRose(null);
      setEditingRose(null);
      return prev.slice(0, -1);
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setRoses((prev) => { saveHistory(prev, message); return []; });
    setSelectedId(null);
    setPendingRose(null);
    setEditingRose(null);
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

  // ── Derived values ────────────────────────────────────────────────────────────
  const selectedRose     = roses.find((r) => r.id === selectedId) || null;
  const selectedRoseType = selectedRose ? ROSES.find((r) => r.id === selectedRose.roseTypeId) || null : null;
  const pendingRoseType  = pendingRose  ? ROSES.find((r) => r.id === pendingRose.roseTypeId)  || null : null;
  const editingRoseType  = editingRose  ? ROSES.find((r) => r.id === editingRose.roseTypeId)  || null : null;
  const selectedWrapper  = WRAPPERS.find((w) => w.id === wrapperId) ?? WRAPPERS[0];
  const bouquetData: BouquetData = { roses, wrapperId, message };
  const isTying    = editWrapperState === 'tying';
  const atMaxRoses = roses.length >= MAX_ROSES;

  // ── Persistence ───────────────────────────────────────────────────────────────
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
                pendingRose={pendingRose}
                onPendingPositionChange={handlePendingPositionChange}
                editingRose={editingRose}
              />

              {isTying && (
                <div className="absolute inset-0 pointer-events-auto z-20 flex items-end justify-center pb-6">
                  <p className="text-[10px] text-black/30 tracking-widest select-none">리본을 묶는 중…</p>
                </div>
              )}

              {roses.length === 0 && !pendingRose && !editingRose && !isPreviewMode && !isTying && (
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
                          ${pendingRose?.roseTypeId === rose.id
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

                {/* Stage B — pendingRose controls */}
                {pendingRoseType && !atMaxRoses && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: pendingRoseType.color }}
                      />
                      <span className="text-[11px] text-black/50 truncate">{pendingRoseType.name} — 드래그 후 두기</span>
                    </div>
                    <button
                      onClick={handleConfirmPlace}
                      className="px-4 py-2 rounded-sm bg-[#111110] text-white text-[11px] font-semibold hover:bg-black transition-colors flex-shrink-0"
                    >
                      여기에 두기
                    </button>
                  </div>
                )}

                {/* Stage C — editingRose controls */}
                {editingRose && editingRoseType && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/10 flex-shrink-0"
                        style={{ backgroundColor: editingRoseType.color }}
                      />
                      <span className="text-[11px] text-black/50">{editingRoseType.name} — 방향 조정 후 고정</span>
                    </div>
                    <input
                      type="range" min={-180} max={180} step={1}
                      value={editingRose.rotation}
                      onChange={(e) => handleEditingRotationChange(parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleFixRose}
                        className="flex-1 py-2 rounded-sm bg-[#111110] text-white text-[11px] font-semibold hover:bg-black transition-colors"
                      >
                        고정하기
                      </button>
                      <button
                        onClick={handleDeleteEditing}
                        className="px-4 py-2 rounded-sm border border-rose-400/25 text-rose-500/70 text-[11px] font-medium hover:bg-rose-50 transition-all"
                      >
                        제거
                      </button>
                    </div>
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
              pendingRoseType={pendingRoseType}
              editingRose={editingRose}
              editingRoseType={editingRoseType}
              selectedRose={selectedRose}
              roseType={selectedRoseType}
              totalRoses={roses.length}
              message={message}
              onMessageChange={setMessage}
              onConfirmPlace={handleConfirmPlace}
              onCancelPending={handleCancelPending}
              onFixRose={handleFixRose}
              onEditingRotationChange={handleEditingRotationChange}
              onDeleteEditing={handleDeleteEditing}
              onRotationChange={handleRotationChange}
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
