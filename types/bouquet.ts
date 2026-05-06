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
  message?: string;
  recipientName?: string;
  senderName?: string;
};

export type HistoryEntry = {
  roses: BouquetRose[];
  message: string;
};
