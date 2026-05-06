'use client';

import { BouquetRose, RoseType } from '@/types/bouquet';

interface PropertiesPanelProps {
  selectedRose: BouquetRose | null;
  roseType: RoseType | null;
  totalRoses: number;
  usedColors: string[];
  message: string;
  onMessageChange: (msg: string) => void;
  onScaleChange: (scale: number) => void;
  onRotationChange: (rotation: number) => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertiesPanel({
  selectedRose,
  roseType,
  totalRoses,
  usedColors,
  message,
  onMessageChange,
  onScaleChange,
  onRotationChange,
  onBringForward,
  onSendBackward,
  onDelete,
  isOpen,
  onClose,
}: PropertiesPanelProps) {
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:relative z-40 lg:z-auto
          w-72 h-full lg:h-auto
          bg-[#0D0D0D] border-l border-white/10
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
          top-0 right-0 lg:top-auto lg:right-auto
        `}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <h2 className="text-sm font-semibold text-cream tracking-widest uppercase">Properties</h2>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={onClose}>✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {selectedRose && roseType ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: roseType.color }}
                />
                <p className="text-sm font-medium text-cream">{roseType.name}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Size</label>
                <input
                  type="range"
                  min={0.3}
                  max={2}
                  step={0.05}
                  value={selectedRose.scale}
                  onChange={(e) => onScaleChange(parseFloat(e.target.value))}
                  className="w-full accent-[#F5F0E8]"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>Small</span><span>Large</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Rotation: {Math.round(selectedRose.rotation)}°</label>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={selectedRose.rotation}
                  onChange={(e) => onRotationChange(parseFloat(e.target.value))}
                  className="w-full accent-[#F5F0E8]"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-2 block">Layer</label>
                <div className="flex gap-2">
                  <button
                    onClick={onBringForward}
                    className="flex-1 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  >
                    ↑ Forward
                  </button>
                  <button
                    onClick={onSendBackward}
                    className="flex-1 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all"
                  >
                    ↓ Backward
                  </button>
                </div>
              </div>

              <button
                onClick={onDelete}
                className="w-full py-2 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
              >
                Remove Rose
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-600 text-center py-6">Select a rose to edit properties</p>
          )}

          <div className="pt-4 border-t border-white/10 space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-2">Bouquet</p>
              <p className="text-sm text-cream">{totalRoses} rose{totalRoses !== 1 ? 's' : ''}</p>
              {usedColors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {usedColors.map((color) => (
                    <div
                      key={color}
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-2 block">Message</label>
              <textarea
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                placeholder="Write a short message…"
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-white/30 resize-none"
              />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
