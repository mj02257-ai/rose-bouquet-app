'use client';

import { useState } from 'react';
import { RoseType } from '@/types/bouquet';
import { ROSES, CATEGORIES, CategoryFilter } from '@/lib/roseData';
import RoseCard from './RoseCard';

interface RoseLibraryProps {
  onAddRose: (rose: RoseType) => void;
  onDragStart: (e: React.DragEvent, rose: RoseType) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function RoseLibrary({ onAddRose, onDragStart, isOpen, onClose }: RoseLibraryProps) {
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
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:relative z-40 lg:z-auto
          w-72 h-full lg:h-auto
          bg-[#0D0D0D] border-r border-white/10
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          top-0 left-0 lg:top-auto lg:left-auto
        `}
      >
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-cream tracking-widest uppercase">Rose Library</h2>
            <button className="lg:hidden text-gray-400 hover:text-white" onClick={onClose}>✕</button>
          </div>
          <input
            type="text"
            placeholder="Search roses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/30"
          />
        </div>

        <div className="p-3 border-b border-white/10 flex-shrink-0">
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all duration-200 ${
                  category === cat
                    ? 'bg-white/20 text-cream border border-white/30'
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10 hover:text-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-600 text-center py-8">No roses found</p>
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
      </aside>
    </>
  );
}
