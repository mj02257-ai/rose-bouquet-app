export type RoseType = {
  id: string;
  name: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  category: '사랑' | '진심' | '시작' | '감사';
  meaningEn: string;
  meaningKo: string;
  image: string;
};

export type WrapperStyle = {
  id: string;
  name: string;
  nameKo: string;
  paperColor: string;
  paperDark: string;
  ribbonColor: string;
};

export type BouquetRose = {
  id: string;
  roseTypeId: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  zIndex: number;
  // Explicit 3D position when placed via free-placement UX
  x3d?: number;
  y3d?: number;
  z3d?: number;
};

export type EditingRoseData = {
  id: string;
  roseTypeId: string;
  x3d: number;
  y3d: number;
  z3d: number;
  rotation: number;
};

export type BouquetData = {
  roses: BouquetRose[];
  wrapperId: string;
  message?: string;
  recipientName?: string;
  senderName?: string;
};

export type HistoryEntry = {
  roses: BouquetRose[];
  message: string;
};

export type WrapperState = 'idle' | 'wrapped' | 'tying' | 'ribbonTied';
