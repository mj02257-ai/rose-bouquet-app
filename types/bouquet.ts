export type RoseType = {
  id: string;
  name: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  category: 'Love' | 'Friendship' | 'Gratitude' | 'Apology' | 'Memory';
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
