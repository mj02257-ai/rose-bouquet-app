'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import { decodeBouquet } from '@/lib/bouquetEncoding';
import { ROSES, WRAPPERS } from '@/lib/roseData';
import RoseObject from '@/components/RoseObject';
import BouquetWrapper from '@/components/BouquetWrapper';

function ShareView() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('data');
  const data = encoded ? decodeBouquet(encoded) : null;

  const wrapper = WRAPPERS.find((w) => w.id === data?.wrapperId) ?? WRAPPERS[0];

  if (!data) {
    return (
      <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center gap-4">
        <p className="text-white/30 text-sm">꽃다발을 찾을 수 없거나 링크가 유효하지 않습니다.</p>
        <Link href="/" className="px-4 py-2 rounded-sm bg-[#F0EDE8] text-[#0A0A0A] text-sm font-medium hover:bg-white transition-colors">
          나만의 꽃다발 만들기
        </Link>
      </div>
    );
  }

  const sortedRoses = [...data.roses].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
      {/* Grid bg */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {data.recipientName && (
          <p className="text-[10px] text-white/25 tracking-widest uppercase mb-1.5 text-center">For</p>
        )}
        {data.recipientName && (
          <h1 className="text-xl font-light text-cream text-center mb-6">{data.recipientName}</h1>
        )}

        {/* Bouquet canvas */}
        <div className="relative w-full bg-black/20 border border-white/[0.06] mb-5 overflow-hidden"
             style={{ height: '320px' }}>
          {/* Ambient glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 60%, ${wrapper.paperColor}12 0%, transparent 65%)`,
            }}
          />

          {/* Wrapper */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none">
            <BouquetWrapper wrapper={wrapper} width={196} height={216} />
          </div>

          {/* Roses */}
          {sortedRoses.map((rose) => {
            const roseType = ROSES.find((r) => r.id === rose.roseTypeId);
            if (!roseType) return null;
            return (
              <div
                key={rose.id}
                className="absolute pointer-events-none"
                style={{
                  left: `${rose.x}%`,
                  top: `${rose.y}%`,
                  transform: `translate(-50%, -50%) scale(${rose.scale}) rotate(${rose.rotation}deg)`,
                  zIndex: rose.zIndex,
                  filter: `drop-shadow(0 2px 8px rgba(0,0,0,0.5))`,
                }}
              >
                <RoseObject roseType={roseType} size={60} />
              </div>
            );
          })}
        </div>

        {data.message && (
          <div className="border border-white/[0.07] px-4 py-3 mb-4 text-center">
            <p className="text-[12px] text-white/40 italic leading-relaxed">&ldquo;{data.message}&rdquo;</p>
          </div>
        )}

        {data.senderName && (
          <p className="text-[11px] text-white/25 text-center mb-6">— {data.senderName}</p>
        )}

        <div className="flex flex-col items-center gap-3">
          <Link
            href="/"
            className="px-6 py-2.5 bg-[#F0EDE8] text-[#0A0A0A] text-[12px] font-semibold hover:bg-white transition-colors rounded-sm"
          >
            나도 꽃다발 만들기 →
          </Link>
          <p className="text-[10px] text-white/15 tracking-wider">ANDZ · 성년의 날</p>
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
