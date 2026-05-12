'use client';

import { useState, useCallback, useEffect } from 'react';
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


export default function HomePage() {
  const [roses, setRoses]             = useState<BouquetRose[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [message, setMessage]         = useState('');
  const [wrapperId, setWrapperId]     = useState(DEFAULT_WRAPPER_ID);
  const [isPreviewMode, setIsPreviewMode]   = useState(false);
  const [isShowcaseMode, setIsShowcaseMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [history, setHistory]         = useState<HistoryEntry[]>([]);
  const [isLibraryOpen, setIsLibraryOpen]       = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

  // State for the 3D canvas in the editing area
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

  const addRose = useCallback(
    (roseType: RoseType, x = 45 + Math.random() * 10, y = 40 + Math.random() * 20) => {
      setRoses((prev) => {
        saveHistory(prev, message);
        const maxZ = prev.length > 0 ? Math.max(...prev.map((r) => r.zIndex)) : 0;
        const newRose: BouquetRose = {
          id: generateId(),
          roseTypeId: roseType.id,
          x,
          y,
          scale: 1,
          rotation: Math.random() * 30 - 15,
          zIndex: maxZ + 1,
        };
        return [...prev, newRose];
      });
    },
    [message, saveHistory]
  );

  const handleDragStart = useCallback((e: React.DragEvent, rose: RoseType) => {
    e.dataTransfer.setData('roseTypeId', rose.id);
  }, []);

  const handleDrop = useCallback(
    (roseTypeId: string, x: number, y: number) => {
      const roseType = ROSES.find((r) => r.id === roseTypeId);
      if (roseType) addRose(roseType, x, y);
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

  const handleBringForward = useCallback(() => {
    if (!selectedId) return;
    setRoses((prev) => {
      const maxZ = Math.max(...prev.map((r) => r.zIndex));
      return prev.map((r) => (r.id === selectedId ? { ...r, zIndex: maxZ + 1 } : r));
    });
  }, [selectedId]);

  const handleSendBackward = useCallback(() => {
    if (!selectedId) return;
    setRoses((prev) => {
      const minZ = Math.min(...prev.map((r) => r.zIndex));
      return prev.map((r) => (r.id === selectedId ? { ...r, zIndex: minZ - 1 } : r));
    });
  }, [selectedId]);

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
  }, [message, saveHistory]);

  // "완성하기" → start tying animation in the 3D editing canvas
  const handleComplete = useCallback(() => {
    if (roses.length === 0) return;
    setEditWrapperState('tying');
  }, [roses.length]);

  // Called by BouquetScene3D when ribbon finishes tying
  const handleTyingComplete = useCallback(() => {
    setEditWrapperState('ribbonTied');
    // Brief pause so user sees the tied result before showcase opens
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

  useEffect(() => {
    try { localStorage.setItem('rosery-bouquet', JSON.stringify({ roses, message, wrapperId })); } catch { /* ignore */ }
  }, [roses, message, wrapperId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('rosery-bouquet');
      if (saved) {
        const { roses: sr, message: sm, wrapperId: sw } = JSON.parse(saved);
        if (Array.isArray(sr)) setRoses(sr);
        if (typeof sm === 'string') setMessage(sm);
        if (typeof sw === 'string') setWrapperId(sw);
      }
    } catch { /* ignore */ }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#080808] overflow-hidden">

      {/* ── 3D Showcase (full-screen dark overlay) ─────────────── */}
      {isShowcaseMode && (
        <ShowcaseView
          bouquetData={bouquetData}
          wrapper={selectedWrapper}
          wrapperState="ribbonTied"
          onTyingComplete={() => {/* already tied when showcase opens */}}
          onClose={handleCloseShowcase}
          onSend={() => { handleCloseShowcase(); setShowShareModal(true); }}
        />
      )}

      {/* ── Header (hidden during preview / showcase) ──────────── */}
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#F0EDE8] text-[#0A0A0A] text-[11px] font-semibold hover:bg-white transition-colors shadow-xl"
          >
            ← 편집으로
          </button>
        </div>
      )}

      {/* ── Main editing layout ─────────────────────────────────── */}
      {!isShowcaseMode && (
        <div className="flex flex-1 overflow-hidden">
          {!isPreviewMode && (
            <RoseLibrary
              onAddRose={(rose) => addRose(rose)}
              onDragStart={handleDragStart}
              isOpen={isLibraryOpen}
              onClose={() => setIsLibraryOpen(false)}
              wrapperId={wrapperId}
              onWrapperChange={setWrapperId}
            />
          )}

          <main className="flex-1 relative overflow-hidden">
            {/* ── 3D editing canvas ── */}
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

            {/* Mobile action bar */}
            {!isPreviewMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden z-20">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-4 py-2 rounded-sm bg-white/[0.08] text-[11px] font-medium text-white/60 border border-white/[0.08] backdrop-blur-md"
                >
                  장미 선택
                </button>
                <button
                  onClick={() => setIsPropertiesOpen(true)}
                  className="px-4 py-2 rounded-sm bg-white/[0.08] text-[11px] font-medium text-white/60 border border-white/[0.08] backdrop-blur-md"
                >
                  메시지
                </button>
                <button
                  onClick={handleComplete}
                  disabled={roses.length === 0 || editWrapperState === 'tying'}
                  className={`px-4 py-2 rounded-sm text-[11px] font-semibold backdrop-blur-md transition-all ${
                    roses.length > 0 && editWrapperState !== 'tying'
                      ? 'bg-[#F0EDE8] text-[#0A0A0A]'
                      : 'bg-white/[0.05] text-white/20 cursor-not-allowed'
                  }`}
                >
                  완성
                </button>
              </div>
            )}
          </main>

          {!isPreviewMode && (
            <PropertiesPanel
              selectedRose={selectedRose}
              roseType={selectedRoseType}
              totalRoses={roses.length}
              message={message}
              onMessageChange={setMessage}
              onScaleChange={handleScaleChange}
              onRotationChange={handleRotationChange}
              onBringForward={handleBringForward}
              onSendBackward={handleSendBackward}
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
