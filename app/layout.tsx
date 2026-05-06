import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Rosery — Create a rose bouquet and send your feeling',
  description: 'Build beautiful rose bouquets and share them with the people you care about.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#080808] text-[#F5F0E8] antialiased`}>
        {children}
      </body>
    </html>
  );
}
