'use client';

import { BouquetRose, RoseType } from '@/types/bouquet';

interface PropertiesPanelProps {
  selectedRose: BouquetRose | null;
  roseType: RoseType | null;
  pendingRoseType: RoseType | null;
  totalRoses: number;
  message: string;
  onMessageChange: (msg: string) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onConfirmPlace: () => void;
  onDelete: () => void;
  onComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_MESSAGES = [
  '어른이 된 오늘을 진심으로 축하해.',
  '오늘의 한 송이가 오래 기억되길 바라.',
  '새로운 시작을 진심으로 응원할게.',
];

export default function PropertiesPanel({
  selectedRose,
  roseType,
  pendingRoseType,
  totalRoses,
  message,
  onMessageChange,
  onScaleChange,
  onRotationChange,
  onConfirmPlace,
  onDelete,
  onComplete,
  isOpen,
  onClose,
}: PropertiesPanelProps) {
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
          bg-white border-l border-black/[0.07]
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          top-0 right-0 lg:top-auto lg:right-auto
        `}
      >
        {/* ── Panel top ── */}
        <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-black/[0.06] flex items-center justify-between">
          <span className="text-[11px] text-black/35 font-medium">
            {totalRoses >= 9 ? `최대 9송이` : totalRoses > 0 ? `${totalRoses}송이 선택됨` : '꽃을 추가해보세요'}
          </span>
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

        <div className="flex-1 overflow-y-auto">

          {/* ── Pending rose — confirm placement ── */}
          {pendingRoseType && (
            <div className="px-4 py-4 border-b border-black/[0.06] space-y-3">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                  style={{ backgroundColor: pendingRoseType.color }}
                />
                <p className="text-[12px] text-black/70 font-medium">{pendingRoseType.name}</p>
                <span className="ml-auto text-[10px] text-black/30">선택됨</span>
              </div>
              <button
                onClick={onConfirmPlace}
                disabled={totalRoses >= 9}
                className={`w-full py-2.5 text-[12px] font-semibold rounded-sm transition-all duration-150
                  ${totalRoses < 9
                    ? 'bg-[#1A1816] text-white hover:bg-black'
                    : 'bg-black/[0.05] text-black/22 cursor-not-allowed border border-black/[0.07]'
                  }`}
              >
                {totalRoses < 9 ? '여기에 두기' : '최대 9송이'}
              </button>
            </div>
          )}

          {/* ── Selected rose edit controls ── */}
          {selectedRose && roseType && (
            <div className="px-4 py-4 border-b border-black/[0.06] space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 border border-black/10"
                  style={{ backgroundColor: roseType.color }}
                />
                <p className="text-[12px] text-black/70 font-medium">{roseType.name}</p>
              </div>

              {/* Size */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[11px] text-black/40">크기</label>
                  <span className="text-[11px] text-black/30">
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
                  <label className="text-[11px] text-black/40">방향</label>
                  <span className="text-[11px] text-black/30">
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

              {/* Delete */}
              <button
                onClick={onDelete}
                className="w-full py-1.5 text-[11px] font-medium rounded-sm border border-rose-400/25 text-rose-500/70 hover:text-rose-600 hover:border-rose-400/50 hover:bg-rose-50 transition-all"
              >
                이 장미 제거
              </button>
            </div>
          )}

          {/* ── Message card ── */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-[11px] text-black/35 font-medium">메시지 카드</p>

            <div className="space-y-1">
              {SUGGESTED_MESSAGES.map((msg) => (
                <button
                  key={msg}
                  onClick={() => onMessageChange(msg)}
                  className="w-full text-left px-3 py-2 rounded-sm text-[11px] text-black/40 hover:text-black/65 hover:bg-black/[0.04] border border-transparent hover:border-black/[0.07] transition-all leading-snug"
                >
                  {msg}
                </button>
              ))}
            </div>

            <textarea
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="직접 메시지를 입력해보세요…"
              rows={4}
              className="w-full bg-black/[0.03] border border-black/[0.09] rounded-sm px-3 py-2.5 text-[12px] text-black/65 placeholder-black/22 focus:outline-none focus:border-black/20 resize-none transition-colors leading-relaxed"
            />
          </div>
        </div>

        {/* ── Complete button ── */}
        <div className="px-4 py-3 border-t border-black/[0.06] flex-shrink-0">
          <button
            onClick={onComplete}
            disabled={totalRoses === 0}
            className={`
              w-full py-2.5 text-[12px] font-semibold rounded-sm transition-all duration-200
              ${totalRoses > 0
                ? 'bg-[#1A1816] text-white hover:bg-black cursor-pointer'
                : 'bg-black/[0.05] text-black/22 cursor-not-allowed border border-black/[0.07]'
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
