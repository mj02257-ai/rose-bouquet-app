import { RoseType, WrapperStyle } from '@/types/bouquet';

export const ROSES: RoseType[] = [
  {
    id: 'red',
    name: 'Red Rose',
    color: '#C0392B',
    gradientFrom: '#E74C3C',
    gradientTo: '#922B21',
    category: '사랑',
    meaningEn: 'Passionate love, romance, deep affection',
    meaningKo: '열정적인 사랑, 로맨스, 깊은 애정',
    image: '/assets/roses/red.png',
  },
  {
    id: 'pink',
    name: 'Pink Rose',
    color: '#E91E8C',
    gradientFrom: '#F48FB1',
    gradientTo: '#C2185B',
    category: '진심',
    meaningEn: 'Admiration, sweetness, gentle affection',
    meaningKo: '감탄, 다정함, 부드러운 애정',
    image: '/assets/roses/pink.png',
  },
  {
    id: 'white',
    name: 'White Rose',
    color: '#ECF0F1',
    gradientFrom: '#FFFFFF',
    gradientTo: '#BDC3C7',
    category: '시작',
    meaningEn: 'Purity, sincerity, new beginning',
    meaningKo: '순수함, 진심, 새로운 시작',
    image: '/assets/roses/white.png',
  },
  {
    id: 'peach',
    name: 'Peach Rose',
    color: '#E8A87C',
    gradientFrom: '#FDEBD0',
    gradientTo: '#CA6F1E',
    category: '감사',
    meaningEn: 'Gratitude, sincerity, appreciation',
    meaningKo: '감사, 진심, 고마움',
    image: '/assets/roses/peach.png',
  },
];

export const CATEGORIES = ['전체', '사랑', '진심', '시작', '감사'] as const;
export type CategoryFilter = typeof CATEGORIES[number];

export const WRAPPERS: WrapperStyle[] = [
  { id: 'pink',     name: 'Pink',     nameKo: '핑크',   paperColor: '#F2C4CE', paperDark: '#C8809A', ribbonColor: '#C0607C' },
  { id: 'black',    name: 'Black',    nameKo: '블랙',   paperColor: '#2E2E2E', paperDark: '#1A1A1A', ribbonColor: '#808080' },
  { id: 'white',    name: 'White',    nameKo: '화이트', paperColor: '#F0EDE8', paperDark: '#C8C4BE', ribbonColor: '#A8A4A0' },
  { id: 'beige',    name: 'Beige',    nameKo: '베이지', paperColor: '#E8DEC8', paperDark: '#C0A878', ribbonColor: '#A08858' },
  { id: 'burgundy', name: 'Burgundy', nameKo: '버건디', paperColor: '#6B1F2E', paperDark: '#3E1018', ribbonColor: '#9B3048' },
];

export const DEFAULT_WRAPPER_ID = 'pink';
