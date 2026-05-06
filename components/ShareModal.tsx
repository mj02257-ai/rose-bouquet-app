'use client';

import { useState } from 'react';
import { BouquetData } from '@/types/bouquet';
import { ROSES } from '@/lib/roseData';
import { encodeBouquet } from '@/lib/bouquetEncoding';
import RoseObject from './RoseObject';

interface ShareModalProps {
  bouquetData: BouquetData;
  onClose: () => void;
}

export default function ShareModal({ bouquetData, onClose }: ShareModalProps) {
  const [recipientName, setRecipientName] = useState(bouquetData.recipientName || '');
  const [senderName, setSenderName] = useState(bouquetData.senderName || '');
  const [message, setMessage] = useState(bouquetData.message || '');
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const generateLink = () => {
    const data: BouquetData = {
      ...bouquetData,
      recipientName,
      senderName,
      message,
    };
    const encoded = encodeBouquet(data);
    const url = `${window.location.origin}/share?data=${encoded}`;
    setShareUrl(url);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement('textarea');
      el.value = shareUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const usedRoseTypes = Array.from(new Set(bouquetData.roses.map((r) => r.roseTypeId)))
    .map((id) => ROSES.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#0D0D0D] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-cream tracking-wide">Send to Someone</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Bouquet preview */}
        <div className="bg-black/40 rounded-xl p-4 mb-6 flex items-center gap-3 border border-white/5">
          <div className="flex -space-x-2">
            {usedRoseTypes.slice(0, 5).map((rt) =>
              rt ? <RoseObject key={rt.id} roseType={rt} size={32} /> : null
            )}
          </div>
          <div>
            <p className="text-sm text-cream">{bouquetData.roses.length} roses</p>
            <p className="text-xs text-gray-500">
              {usedRoseTypes.map((rt) => rt?.name).join(', ')}
            </p>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">To</label>
            <input
              type="text"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Recipient's name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">From</label>
            <input
              type="text"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a short message…"
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none"
            />
          </div>
        </div>

        {shareUrl ? (
          <div className="space-y-3">
            <div className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
              <p className="text-xs text-gray-400 truncate flex-1">{shareUrl}</p>
              <button
                onClick={copyLink}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs transition-all ${
                  copied
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                }`}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-[10px] text-gray-600 text-center">Share this link to send your bouquet</p>
          </div>
        ) : (
          <button
            onClick={generateLink}
            className="w-full py-2.5 rounded-full bg-[#F5F0E8] text-black text-sm font-medium hover:bg-white transition-all"
          >
            Generate Share Link ✦
          </button>
        )}
      </div>
    </div>
  );
}
