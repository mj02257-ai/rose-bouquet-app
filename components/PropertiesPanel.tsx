'use client';

import { BouquetRose, RoseType } from '@/types/bouquet';

interface PropertiesPanelProps {
  selectedRose: BouquetRose | null;
  roseType: RoseType | null;
  totalRoses: number;
  message: string;
  onMessageChange: (msg: string) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  onComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

// TODO: 2단계에서 "선물 메시지 카드" 형태로 전체 개편 예정
// TODO: 받는 사람 / 보내는 사람 / 추천 문구 / 완성 버튼 추가 예정

const SUGGESTED_MESSAGES = [
  '어른이 된 오늘을 진심으로 축하해.',
  '오늘의 한 송이가 오래 기억되길 바라.',
  '새로운 시작을 진심으로 응원할게.',
  '성년이 된 너를 오래전부터 기다렸어.',
];

export default function PropertiesPanel({
  selectedRose,
  roseType,
  totalRoses,
  message,
  onMessageChange,
  onScaleChange,
  onRotationChange,
  onBringForward,
  onSendBackward,
  onDelete,
  onComplete,
  isOpen,
  onClose,
}: PropertiesPanelProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:relative z-40 lg:z-auto
          w-[268px] h-full lg:h-auto
          bg-[#0F0F0F] border-l border-white/[0.07]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          top-0 right-0 lg:top-auto lg:right-auto
        `}
      >
        {/* ── Panel top ── */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-white/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-white/30 font-medium">
            {totalRoses > 0 ? `${totalRoses}송이 선택됨` : '꽃을 추가해보세요'}
          </span>
          <button
            className="lg:hidden text-white/30 hover:text-white/70 transition-colors"
            onClick={onClose}
            aria-label="닫기"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">

          {/* ── Rose edit controls (선택된 장미가 있을 때만) ── */}
          {selectedRose && roseType && (
            <div className="px-4 py-4 border-b border-white/[0.06] space-y-4">
              {/* Selected rose indicator */}
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: roseType.color }}
                />
                <p className="text-[12px] text-cream font-medium">{roseType.name}</p>
              </div>

              {/* Size */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[11px] text-white/35">크기</label>
                  <span className="text-[11px] text-white/30">
                    {Math.round(selectedRose.scale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.3}
                  max={2}
                  step={0.05}
                  value={selectedRose.scale}
                  onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Rotation */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[11px] text-white/35">방향</label>
                  <span className="text-[11px] text-white/30">
                    {Math.round(selectedRose.rotation)}°
                  </span>
                </div>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={selectedRose.rotation}
                  onChange={(e) => onRotationChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Layer controls */}
              <div className="flex gap-2">
                <button
                  onClick={onBringForward}
                  className="flex-1 py-1.5 text-[11px] font-medium rounded-sm border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
                >
                  앞으로
                </button>
                <button
                  onClick={onSendBackward}
                  className="flex-1 py-1.5 text-[11px] font-medium rounded-sm border border-white/[0.08] text-white/40 hover:text-white/70 hover:border-white/20 transition-all"
                >
                  뒤로
                </button>
              </div>

              {/* Delete */}
              <button
                onClick={onDelete}
                className="w-full py-1.5 text-[11px] font-medium rounded-sm border border-rose-500/20 text-rose-400/60 hover:text-rose-400 hover:border-rose-400/40 hover:bg-rose-500/[0.05] transition-all"
              >
                이 장미 제거
              </button>
            </div>
          )}

          {/* ── Message card ── */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-[11px] text-white/30 font-medium">메시지 카드</p>

            {/* Suggested messages */}
            <div className="space-y-1">
              {SUGGESTED_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => onMessageChange(msg)}
                  className="w-full text-left px-3 py-2 rounded-sm text-[11px] text-white/35 hover:text-white/60 hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] transition-all leading-snug"
                >
                  {msg}
                </button>
              ))}
            </div>

            {/* Message textarea */}
            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="직접 메시지를 입력해보세요…"
              rows={4}
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-sm px-3 py-2.5 text-[12px] text-white/60 placeholder-white/20 focus:outline-none focus:border-white/20 resize-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* ── Complete button — pinned at panel bottom ── */}
        <div className="px-4 py-3 border-t border-white/[0.06] flex-shrink-0">
          <button
            onClick={onComplete}
            disabled={totalRoses === 0}
            className={`
              w-full py-2.5 text-[12px] font-semibold rounded-sm transition-all duration-200
              ${totalRoses > 0
                ? 'bg-[#F0EDE8] text-[#0A0A0A] hover:bg-white cursor-pointer'
                : 'bg-white/[0.05] text-white/20 cursor-not-allowed border border-white/[0.06]'
              }
            `}
          >
            {totalRoses > 0 ? `꽃다발 완성하기 →` : '장미를 추가해보세요'}
          </button>
        </div>
      </aside>
    </>
  );
}
