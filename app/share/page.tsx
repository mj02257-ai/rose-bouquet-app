'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { decodeBouquet } from '@/lib/bouquetEncoding';
import type { RoseColor } from '@/components/BouquetScene3D';

// SSR off — three.js / WebGL cannot run on the server
const BouquetScene3D = dynamic(() => import('@/components/BouquetScene3D'), { ssr: false });

const IVORY = '#F4F2EE';
const DEFAULT_COLOR: RoseColor = 'red';
const DEFAULT_MESSAGE = '어른이 된 오늘을 진심으로 축하해.';

const COLOR_NAME: Record<RoseColor, string> = {
  red: '레드', pink: '핑크', white: '화이트', peach: '피치',
};

function ShareView() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get('data');
  const data    = encoded ? decodeBouquet(encoded) : null;

  // Extract rose color from first rose in the array (single-rose UX)
  const roseColor: RoseColor =
    (data?.roses?.[0]?.roseTypeId as RoseColor | undefined) ?? DEFAULT_COLOR;
  const message       = data?.message       || DEFAULT_MESSAGE;
  const recipientName = data?.recipientName || '';
  const senderName    = data?.senderName    || '';

  return (
    <div
      className="min-h-screen flex flex-col items-center"
      style={{ backgroundColor: IVORY }}
    >

      {/* ── Header ── */}
      <div className="w-full max-w-md px-6 pt-10 pb-2 text-center">
        <p className="text-[10px] text-black/28 tracking-[0.18em] uppercase mb-2 font-light">
          성년의 날 · 장미꽃 선물
        </p>
        {recipientName ? (
          <>
            <p className="text-[11px] text-black/30 tracking-widest uppercase mb-1">For</p>
            <h1 className="text-2xl font-light text-[#111110] tracking-wide">{recipientName}</h1>
          </>
        ) : (
          <h1 className="text-xl font-light text-[#111110]/60 tracking-wide">
            당신을 위한 한 송이
          </h1>
        )}
      </div>

      {/* ── 3D Bouquet Canvas ── */}
      {/* wrapperState='wrapped' keeps canvas background ivory (#F4F2EE).
          'ribbonTied' would switch it to dark — we avoid that on the share page.
          The wrapper_ribbon_tied_base.glb is always pre-tied so it looks complete. */}
      <div
        className="w-full max-w-md flex-shrink-0"
        style={{
          height: 'min(62vh, 520px)',
          minHeight: '340px',
          backgroundColor: IVORY,
        }}
      >
        <BouquetScene3D
          selectedRoseColor={roseColor}
          wrapperState="wrapped"
          autoRotate={true}
        />
      </div>

      {/* ── Rose label ── */}
      <p className="text-[10px] text-black/28 tracking-widest uppercase mt-1 mb-3 font-light">
        {COLOR_NAME[roseColor]} 장미 · 블랙 리본 포장
      </p>

      {/* ── Message card ── */}
      <div className="w-full max-w-md px-6 mb-3">
        <div
          className="px-5 py-5 text-center"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.07)',
          }}
        >
          <p className="text-[13px] text-black/55 italic leading-relaxed font-light">
            &ldquo;{message}&rdquo;
          </p>
          {senderName && (
            <p className="mt-3 text-[11px] text-black/30 tracking-wide">
              — {senderName}
            </p>
          )}
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="w-full max-w-md px-6 pb-12 flex flex-col items-center gap-3">
        <Link
          href="/"
          className="w-full py-3.5 text-center rounded-sm text-[13px] font-semibold transition-colors hover:bg-black"
          style={{ backgroundColor: '#111110', color: '#FFFFFF' }}
        >
          나도 꽃다발 만들기 →
        </Link>
        <p className="text-[10px] text-black/20 tracking-wider font-light">
          ANDZ · 성년의 날
        </p>
      </div>

    </div>
  );
}

// Fallback shown while useSearchParams resolves
function LoadingFallback() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: IVORY }}
    >
      <p className="text-[13px] text-black/30 font-light">꽃다발을 불러오는 중…</p>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ShareView />
    </Suspense>
  );
}
