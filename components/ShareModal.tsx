'use client';

import { useState } from 'react';
import type { BouquetData } from '@/types/bouquet';
import { encodeBouquet } from '@/lib/bouquetEncoding';

interface ShareModalProps {
  bouquetData: BouquetData;
  onClose: () => void;
}

const COLOR_DOT: Record<string, string> = {
  red: '#C0392B', pink: '#E91E63', white: '#EDE6DC', peach: '#FFAB91',
};
const COLOR_NAME: Record<string, string> = {
  red: '레드', pink: '핑크', white: '화이트', peach: '피치',
};

export default function ShareModal({ bouquetData, onClose }: ShareModalProps) {
  const [recipientName, setRecipientName] = useState(bouquetData.recipientName ?? '');
  const [senderName, setSenderName]       = useState(bouquetData.senderName ?? '');
  const [message, setMessage]             = useState(bouquetData.message ?? '');
  const [shareUrl, setShareUrl]           = useState('');
  const [copied, setCopied]               = useState(false);

  const roseColor = bouquetData.roses[0]?.roseTypeId ?? 'red';

  const generateLink = () => {
    const data: BouquetData = { ...bouquetData, recipientName, senderName, message };
    const encoded = encodeBouquet(data);
    setShareUrl(`${window.location.origin}/share?data=${encoded}`);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputCls = `w-full border rounded-sm px-3 py-2.5 text-[13px] text-[#111110] placeholder-black/22
    focus:outline-none focus:border-black/25 transition-colors`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30,28,26,0.32)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-sm shadow-2xl overflow-hidden"
        style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(0,0,0,0.09)' }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── Header ── */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'rgba(0,0,0,0.07)' }}
        >
          <h2 className="text-[13px] font-semibold text-[#111110] tracking-wide">
            선물 링크 만들기
          </h2>
          <button
            onClick={onClose}
            className="text-black/28 hover:text-black/60 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5">

          {/* ── Rose preview card (replaces old RoseObject SVG icons) ── */}
          <div
            className="flex items-center gap-3 px-4 py-3.5 mb-5 rounded-sm"
            style={{ backgroundColor: '#F4F2EE', border: '1px solid rgba(0,0,0,0.06)' }}
          >
            <div
              className="w-9 h-9 rounded-full flex-shrink-0 border border-black/10"
              style={{ backgroundColor: COLOR_DOT[roseColor] ?? '#C0392B' }}
            />
            <div>
              <p className="text-[13px] font-medium text-[#111110]">
                {COLOR_NAME[roseColor] ?? '레드'} 장미 1송이
              </p>
              <p className="text-[11px] text-black/38 mt-0.5">블랙 리본 포장</p>
            </div>
          </div>

          {/* ── Input fields ── */}
          <div className="space-y-3 mb-5">
            <div>
              <label className="text-[10px] text-black/38 tracking-[0.12em] uppercase mb-1.5 block">
                To (받는 사람)
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className={inputCls}
                style={{ backgroundColor: '#F9F8F6', borderColor: 'rgba(0,0,0,0.10)' }}
              />
            </div>
            <div>
              <label className="text-[10px] text-black/38 tracking-[0.12em] uppercase mb-1.5 block">
                From (보내는 사람)
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="이름을 입력해주세요"
                className={inputCls}
                style={{ backgroundColor: '#F9F8F6', borderColor: 'rgba(0,0,0,0.10)' }}
              />
            </div>
            <div>
              <label className="text-[10px] text-black/38 tracking-[0.12em] uppercase mb-1.5 block">
                메시지
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="마음을 전해보세요…"
                rows={3}
                className={`${inputCls} resize-none leading-relaxed`}
                style={{ backgroundColor: '#F9F8F6', borderColor: 'rgba(0,0,0,0.10)' }}
              />
            </div>
          </div>

          {/* ── Share URL or generate button ── */}
          {shareUrl ? (
            <div className="space-y-2">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-sm"
                style={{ backgroundColor: '#F4F2EE', border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <p className="text-[11px] text-black/50 truncate flex-1">{shareUrl}</p>
                <button
                  onClick={copyLink}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-sm text-[11px] font-medium transition-all ${
                    copied
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-[#111110] text-white hover:bg-black'
                  }`}
                >
                  {copied ? '✓ 복사됨' : '링크 복사'}
                </button>
              </div>
              <p className="text-[10px] text-black/28 text-center tracking-wide">
                이 링크로 꽃다발을 전달하세요
              </p>
            </div>
          ) : (
            <button
              onClick={generateLink}
              className="w-full py-3 rounded-sm text-[13px] font-semibold transition-all hover:bg-black"
              style={{ backgroundColor: '#111110', color: '#FFFFFF' }}
            >
              공유 링크 생성 ✦
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
