import { BouquetData } from '@/types/bouquet';

export function encodeBouquet(data: BouquetData): string {
  try {
    const json = JSON.stringify(data);
    return btoa(encodeURIComponent(json));
  } catch {
    return '';
  }
}

export function decodeBouquet(encoded: string): BouquetData | null {
  try {
    const json = decodeURIComponent(atob(encoded));
    const data = JSON.parse(json) as BouquetData;
    if (!Array.isArray(data.roses)) return null;
    if (!data.wrapperId) data.wrapperId = 'pink'; // backward-compat
    return data;
  } catch {
    return null;
  }
}
