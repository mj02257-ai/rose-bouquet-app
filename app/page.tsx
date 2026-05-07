'use client';

import { useState, useCallback, useEffect } from 'react';
import { BouquetRose, BouquetData, RoseType, HistoryEntry } from '@/types/bouquet';
import { ROSES, WRAPPERS, DEFAULT_WRAPPER_ID } from '@/lib/roseData';
import Header from '@/components/Header';
import RoseLibrary from '@/components/RoseLibrary';
import BouquetCanvas from '@/components/BouquetCanvas';
import PropertiesPanel from '@/components/PropertiesPanel';
import ShareModal from '@/components/ShareModal';
import ShowcaseView from '@/components/ShowcaseView';
import BouquetWrapper from '@/components/BouquetWrapper';
import RoseObject from '@/components/RoseObject';

let idCounter = 0;
const generateId = () => `rose-${Date.now()}-${++idCounter}`;

const MAX_HISTORY = 30;

export default function HomePage() {
  const [roses, setRoses] = useState<BouquetRose[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [wrapperId, setWrapperId] = useState(DEFAULT_WRAPPER_ID);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isShowcaseMode, setIsShowcaseMode] = useState(false);
  const [isWrapping,     setIsWrapping]     = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(false);

  // Save state to history before mutations
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
      const rose = prev.find((r) => r.id === selectedId);
      if (!rose) return prev;
      const maxZ = Math.max(...prev.map((r) => r.zIndex));
      return prev.map((r) => (r.id === selectedId ? { ...r, zIndex: maxZ + 1 } : r));
    });
  }, [selectedId]);

  const handleSendBackward = useCallback(() => {
    if (!selectedId) return;
    setRoses((prev) => {
      const rose = prev.find((r) => r.id === selectedId);
      if (!rose) return prev;
      const minZ = Math.min(...prev.map((r) => r.zIndex));
      return prev.map((r) => (r.id === selectedId ? { ...r, zIndex: minZ - 1 } : r));
    });
  }, [selectedId]);

  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    setRoses((prev) => {
      saveHistory(prev, message);
      return prev.filter((r) => r.id !== selectedId);
    });
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
    setRoses((prev) => {
      saveHistory(prev, message);
      return [];
    });
    setSelectedId(null);
  }, [message, saveHistory]);

  // Trigger the wrapping animation, then transition to showcase after 1.4 s
  const handleComplete = useCallback(() => {
    if (roses.length === 0) return;
    setIsWrapping(true);
    setTimeout(() => {
      setIsWrapping(false);
      setIsShowcaseMode(true);
    }, 1400);
  }, [roses.length]);

  const selectedRose = roses.find((r) => r.id === selectedId) || null;
  const selectedRoseType = selectedRose ? ROSES.find((r) => r.id === selectedRose.roseTypeId) || null : null;
  const usedColors = Array.from(new Set(roses.map((r) => r.roseTypeId)))
    .map((id) => ROSES.find((r) => r.id === id)?.color || '')
    .filter(Boolean);
  const selectedWrapper = WRAPPERS.find((w) => w.id === wrapperId) ?? WRAPPERS[0];

  const bouquetData: BouquetData = { roses, wrapperId, message };

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('rosery-bouquet', JSON.stringify({ roses, message, wrapperId }));
    } catch {
      // ignore storage errors
    }
  }, [roses, message, wrapperId]);

  // Restore from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('rosery-bouquet');
      if (saved) {
        const { roses: savedRoses, message: savedMessage, wrapperId: savedWrapperId } = JSON.parse(saved);
        if (Array.isArray(savedRoses)) setRoses(savedRoses);
        if (typeof savedMessage === 'string') setMessage(savedMessage);
        if (typeof savedWrapperId === 'string') setWrapperId(savedWrapperId);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#F7F7F5] overflow-hidden">
      {/* ── Wrapping animation overlay ─────────────────────────── */}
      {isWrapping && (
        <div className="fixed inset-0 z-50 bg-[#0A0A09] flex flex-col items-center justify-center"
             style={{ animation: 'fadeUp 0.25s ease-out' }}>
          <div className="relative" style={{ width: 'clamp(220px,38vw,300px)', height: 'clamp(340px,58vw,460px)' }}>
            {/* Roses */}
            {[...roses].sort((a, b) => a.zIndex - b.zIndex).map((rose) => {
              const rt = ROSES.find((r) => r.id === rose.roseTypeId);
              if (!rt) return null;
              return (
                <div key={rose.id} className="absolute pointer-events-none"
                  style={{
                    left: `${rose.x}%`,
                    top:  `${rose.y * 0.66}%`,
                    transform: `translate(-50%,-50%) scale(${rose.scale * 1.14}) rotate(${rose.rotation}deg)`,
                    zIndex: rose.zIndex,
                    filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.55))',
                    animation: 'fadeUp 0.35s ease-out both',
                  }}>
                  <RoseObject roseType={rt} size={70} />
                </div>
              );
            })}
            {/* Wrapper — plays wrapClose animation */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
              <BouquetWrapper wrapper={selectedWrapper} width={222} height={242} isWrapping />
            </div>
          </div>
          <p className="mt-8 text-[11px] text-white/28 tracking-widest font-light">꽃다발을 포장하는 중…</p>
        </div>
      )}

      {/* ── Showcase mode ───────────────────────────────────────── */}
      {isShowcaseMode && (
        <ShowcaseView
          bouquetData={bouquetData}
          wrapper={selectedWrapper}
          onClose={() => setIsShowcaseMode(false)}
          onSend={() => { setIsShowcaseMode(false); setShowShareModal(true); }}
        />
      )}

      {!isPreviewMode && !isShowcaseMode && !isWrapping && (
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

      {!isShowcaseMode && !isWrapping && (
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
            <BouquetCanvas
              roses={roses}
              selectedId={selectedId}
              wrapper={selectedWrapper}
              onSelect={handleSelect}
              onMove={handleMove}
              onDrop={handleDrop}
              isPreviewMode={isPreviewMode}
            />

            {/* Mobile bottom action bar */}
            {!isPreviewMode && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 lg:hidden z-20">
                <button
                  onClick={() => setIsLibraryOpen(true)}
                  className="px-4 py-2 rounded-sm bg-white/[0.08] text-[11px] font-medium text-white/55 border border-white/[0.10] backdrop-blur-md"
                >
                  장미 선택
                </button>
                <button
                  onClick={() => setIsPropertiesOpen(true)}
                  className="px-4 py-2 rounded-sm bg-white/[0.08] text-[11px] font-medium text-white/55 border border-white/[0.10] backdrop-blur-md"
                >
                  메시지
                </button>
                <button
                  onClick={handleComplete}
                  disabled={roses.length === 0}
                  className={`px-4 py-2 rounded-sm text-[11px] font-semibold backdrop-blur-md transition-all ${
                    roses.length > 0
                      ? 'bg-white text-[#111110]'
                      : 'bg-white/[0.08] text-white/25 cursor-not-allowed'
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
              usedColors={usedColors}
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
