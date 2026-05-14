'use client';

const SUGGESTED_MESSAGES = [
  '어른이 된 오늘을 진심으로 축하해.',
  '오늘의 한 송이가 오래 기억되길 바라.',
  '새로운 시작을 진심으로 응원할게.',
];

interface PropertiesPanelProps {
  hasRose: boolean;
  message: string;
  onMessageChange: (msg: string) => void;
  onComplete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertiesPanel({
  hasRose, message, onMessageChange, onComplete, isOpen, onClose,
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
        <div className="px-4 pt-4 pb-3 flex-shrink-0 border-b border-black/[0.06]">
          <span className="text-[11px] text-black/35 font-medium">
            {hasRose ? '장미가 선택되었습니다' : '장미 색상을 선택해주세요'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto">
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

        <div className="px-4 py-3 border-t border-black/[0.06] flex-shrink-0">
          <button
            onClick={onComplete}
            disabled={!hasRose}
            className={`
              w-full py-2.5 text-[12px] font-semibold rounded-sm transition-all duration-200
              ${hasRose
                ? 'bg-[#1A1816] text-white hover:bg-black cursor-pointer'
                : 'bg-black/[0.05] text-black/22 cursor-not-allowed border border-black/[0.07]'
              }
            `}
          >
            {hasRose ? '꽃다발 완성하기 →' : '장미를 선택해주세요'}
          </button>
        </div>
      </aside>
    </>
  );
}
