'use client';

import { useState } from 'react';
import { RoseType } from '@/types/bouquet';
import { ROSES, CATEGORIES, CategoryFilter } from '@/lib/roseData';
import RoseCard from './RoseCard';
import WrapperSelector from './WrapperSelector';

interface RoseLibraryProps {
  onAddRose: (rose: RoseType) => void;
  onDragStart: (e: React.DragEvent, rose: RoseType) => void;
  isOpen: boolean;
  onClose: () => void;
  wrapperId: string;
  onWrapperChange: (id: string) => void;
}

export default function RoseLibrary({ onAddRose, onDragStart, isOpen, onClose, wrapperId, onWrapperChange }: RoseLibraryProps) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<CategoryFilter>('All');

  const filtered = ROSES.filter((r) => {
    const matchCat = category === 'All' || r.category === category;
    const matchSearch =
      search === '' ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.meaningKo.includes(search) ||
      r.meaningEn.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

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
        {/* ── Panel top: search + mobile close ── */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-black/[0.06]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-black/35 font-medium">색을 골라보세요</p>
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

          {/* Search */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/25"
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
            >
              <circle cx="5.5" cy="5.5" r="4.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M9.5 9.5l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="장미 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/[0.04] border border-black/[0.09] rounded-sm pl-8 pr-3 py-2 text-[12px] text-black/70 placeholder-black/22 focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>
        </div>

        {/* ── Category filter ── */}
        <div className="px-4 py-2.5 flex-shrink-0 border-b border-black/[0.06]">
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`
                  px-2.5 py-1 text-[11px] font-medium rounded-sm transition-all duration-150
                  ${category === cat
                    ? 'bg-black/[0.08] text-black/75 border border-black/20'
                    : 'text-black/38 border border-transparent hover:text-black/60 hover:border-black/10'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* ── Rose list ── */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 min-h-0">
          {filtered.length === 0 ? (
            <p className="text-[11px] text-black/22 text-center py-10">검색 결과 없음</p>
          ) : (
            filtered.map((rose) => (
              <RoseCard
                key={rose.id}
                rose={rose}
                onAdd={onAddRose}
                onDragStart={onDragStart}
              />
            ))
          )}
        </div>

        <WrapperSelector selectedId={wrapperId} onChange={onWrapperChange} />
      </aside>
    </>
  );
}
