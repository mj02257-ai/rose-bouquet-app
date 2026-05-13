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
    <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 lg:px-8 border-b border-black/[0.07] bg-white z-20">
      {/* ── Logo area ── */}
      <div className="flex items-center gap-4">
        <button
          className="lg:hidden text-black/35 hover:text-black/75 transition-colors mr-0.5"
          onClick={onOpenLibrary}
          aria-label="장미 선택 열기"
        >
          <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
            <rect width="17" height="1.8" rx="0.9" fill="currentColor"/>
            <rect y="5.6" width="11" height="1.8" rx="0.9" fill="currentColor"/>
            <rect y="11.2" width="17" height="1.8" rx="0.9" fill="currentColor"/>
          </svg>
        </button>

        <div className="flex items-center gap-4">
          {!logoError ? (
            <Image
              src="/assets/brand/andz-logo.png"
              alt="ANDZ"
              width={52}
              height={18}
              className="object-contain block"
              onError={() => setLogoError(true)}
              priority
            />
          ) : (
            <span className="text-[13px] font-semibold tracking-[0.14em] text-[#111110]">
              ANDZ
            </span>
          )}
          <div className="hidden md:block w-px h-4 bg-black/12" />
          <span className="hidden md:block text-[11px] text-black/28 font-light tracking-[0.06em]">
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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-sm border border-black/[0.09] text-black/38 hover:text-black/65 hover:border-black/20 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150"
            >
              ↩ 되돌리기
            </button>
            <button
              onClick={onClearAll}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-sm border border-black/[0.09] text-black/38 hover:text-rose-600/75 hover:border-rose-400/28 transition-all duration-150"
            >
              전체 삭제
            </button>
            <button
              onClick={onPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium tracking-wide rounded-sm border border-black/[0.09] text-black/45 hover:text-black/75 hover:border-black/20 transition-all duration-150"
            >
              미리보기
            </button>
            <button
              onClick={onSend}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold tracking-wide rounded-sm bg-[#111110] text-white hover:bg-black transition-colors duration-150"
            >
              선물하기
            </button>
          </>
        ) : (
          <button
            onClick={onPreview}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-semibold tracking-wide rounded-sm bg-[#111110] text-white hover:bg-black transition-colors duration-150"
          >
            ← 편집으로
          </button>
        )}
      </div>
    </header>
  );
}
