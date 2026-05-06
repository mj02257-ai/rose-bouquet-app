'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { decodeBouquet } from '@/lib/bouquetEncoding';
import { ROSES } from '@/lib/roseData';
import RoseObject from '@/components/RoseObject';

function ShareView() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('data');
  const data = encoded ? decodeBouquet(encoded) : null;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">Bouquet not found or link is invalid.</p>
        <Link href="/" className="px-4 py-2 rounded-full bg-[#F5F0E8] text-black text-sm">
          Create your own
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-8">
      {/* Grid bg */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-lg">
        {data.recipientName && (
          <p className="text-xs text-gray-500 tracking-widest uppercase mb-2 text-center">For</p>
        )}
        {data.recipientName && (
          <h1 className="text-2xl font-light text-cream text-center mb-8">{data.recipientName}</h1>
        )}

        {/* Canvas */}
        <div className="relative w-full h-80 bg-black/20 rounded-2xl border border-white/5 mb-6 overflow-hidden">
          {/* Bouquet base */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-none">
            <svg viewBox="0 0 200 130" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="wrap-grad-share" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3D2B1F" />
                  <stop offset="50%" stopColor="#5C3D2E" />
                  <stop offset="100%" stopColor="#2D1F14" />
                </linearGradient>
              </defs>
              <path d="M 60 130 L 80 40 L 120 40 L 140 130 Z" fill="url(#wrap-grad-share)" />
              <path d="M 60 130 L 80 40 L 100 60 L 80 130 Z" fill="rgba(0,0,0,0.2)" />
              <ellipse cx="100" cy="42" rx="22" ry="8" fill="#8B6355" opacity="0.8"/>
            </svg>
          </div>

          {data.roses.map((rose) => {
            const roseType = ROSES.find((r) => r.id === rose.roseTypeId);
            if (!roseType) return null;
            return (
              <div
                key={rose.id}
                className="absolute"
                style={{
                  left: `${rose.x}%`,
                  top: `${rose.y}%`,
                  transform: `translate(-50%, -50%) scale(${rose.scale}) rotate(${rose.rotation}deg)`,
                  zIndex: rose.zIndex,
                  filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.4))`,
                }}
              >
                <RoseObject roseType={roseType} size={60} />
              </div>
            );
          })}
        </div>

        {data.message && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4 text-center">
            <p className="text-sm text-gray-300 italic leading-relaxed">&ldquo;{data.message}&rdquo;</p>
          </div>
        )}

        {data.senderName && (
          <p className="text-xs text-gray-500 text-center mb-8">— {data.senderName}</p>
        )}

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 rounded-full bg-[#F5F0E8] text-black text-sm font-medium hover:bg-white transition-all"
          >
            Create your own bouquet ✦
          </Link>
          <p className="text-[10px] text-gray-700">Made with Rosery</p>
        </div>
      </div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-gray-600 text-sm">Loading bouquet…</div>
      </div>
    }>
      <ShareView />
    </Suspense>
  );
}
