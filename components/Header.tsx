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
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 lg:px-6 border-b border-black/[0.07] bg-white z-20">
      {/* ── Logo area ── */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden text-black/40 hover:text-black/80 transition-colors mr-1"
          onClick={onOpenLibrary}
          aria-label="장미 선택 열기"
        >
          <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
            <rect width="18" height="2" rx="1" fill="currentColor"/>
            <rect y="6" width="12" height="2" rx="1" fill="currentColor"/>
            <rect y="12" width="18" height="2" rx="1" fill="currentColor"/>
          </svg>
        </button>

        <div className="flex items-baseline gap-3">
          {!logoError ? (
            <Image
              src="/assets/brand/andz-logo.png"
              alt="ANDZ"
              width={58}
              height={20}
              className="object-contain block"
              onError={() => setLogoError(true)}
              priority
            />
          ) : (
            <span className="text-[14px] font-bold tracking-[0.12em] text-[#1A1816]">
              ANDZ
            </span>
          )}
          <span className="hidden md:block text-[11px] text-black/30 font-normal">
            성년의 날 장미 선물
          </span>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex items-center gap-1.5">
        {!isPreviewMode ? (
          <>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded border border-black/[0.09] text-black/40 hover:text-black/70 hover:border-black/20 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-150"
            >
              ↩ 되돌리기
            </button>
            <button
              onClick={onClearAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded border border-black/[0.09] text-black/40 hover:text-rose-600/80 hover:border-rose-400/30 transition-all duration-150"
            >
              전체 삭제
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded border border-black/[0.09] text-black/50 hover:text-black/80 hover:border-black/20 transition-all duration-150"
            >
              미리보기
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold rounded bg-[#1A1816] text-white hover:bg-black transition-colors duration-150 shadow-sm"
            >
              선물하기
            </button>
          </>
        ) : (
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold rounded bg-[#1A1816] text-white hover:bg-black transition-colors duration-150"
          >
            ← 편집으로
          </button>
        )}
      </div>
    </header>
  );
}
