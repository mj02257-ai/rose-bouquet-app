'use client';

import Image from 'next/image';
import { useState } from 'react';

interface HeaderProps {
  onUndo: () => void;
  onClearAll: () => void;
  onPreview: () => void;
  onSend: () => void;
  isPreviewMode: boolean;
  canUndo: boolean;
  onOpenLibrary: () => void;
}

export default function Header({
  onUndo,
  onClearAll,
  onPreview,
  onSend,
  isPreviewMode,
  canUndo,
  onOpenLibrary,
}: HeaderProps) {
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-white/10 bg-[#0A0A0A] z-20">
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-gray-400 hover:text-white mr-1"
          onClick={onOpenLibrary}
          title="Open Rose Library"
        >
          ☰
        </button>
        <div className="flex flex-col justify-center">
          {!logoError ? (
            <Image
              src="/assets/brand/andz-logo.png"
              alt="ANDZ"
              width={72}
              height={28}
              className="object-contain object-left brightness-[0.95]"
              onError={() => setLogoError(true)}
              priority
            />
          ) : (
            <h1 className="text-base font-bold tracking-[0.15em] text-cream uppercase">ANDZ</h1>
          )}
          <p className="text-[10px] text-gray-500 hidden sm:block">Create a rose bouquet and send your feeling.</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {!isPreviewMode ? (
          <>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              ↩ Undo
            </button>
            <button
              onClick={onClearAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-400/30 transition-all"
            >
              Clear all
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border border-white/20 text-gray-300 hover:text-white hover:border-white/40 transition-all"
            >
              Preview
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs bg-[#F5F0E8] text-black font-medium hover:bg-white transition-all shadow-lg shadow-white/10"
            >
              Send to someone ✦
            </button>
          </>
        ) : (
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs bg-[#F5F0E8] text-black font-medium hover:bg-white transition-all"
          >
            ← Edit
          </button>
        )}
      </div>
    </header>
  );
}
