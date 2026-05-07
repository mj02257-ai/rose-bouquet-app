import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ANDZ — 성년의 날 장미 꽃다발',
  description: '어른이 된 오늘, 한 송이의 마음을 전해보세요. ANDZ 성년의 날 장미 선물.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className={`${inter.variable} font-sans bg-[#0A0A0A] text-[#F0EDE8] antialiased`}>
        {children}
      </body>
    </html>
  );
}
