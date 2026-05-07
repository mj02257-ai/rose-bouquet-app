import type { Metadata } from 'next';
import { Space_Grotesk, Noto_Sans_KR } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto-kr',
  display: 'swap',
  weight: ['300', '400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'ANDZ — 성년의 날 장미 꽃다발',
  description: '어른이 된 오늘, 한 송이의 마음을 전해보세요. ANDZ 성년의 날 장미 선물.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${spaceGrotesk.variable} ${notoSansKR.variable} font-sans bg-[#F7F7F5] text-[#111110] antialiased`}>
        {children}
      </body>
    </html>
  );
}
