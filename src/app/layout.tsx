import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StoreInitializer from '@/components/StoreInitializer';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Market Scanner — Stock Intelligence Terminal',
  description: 'AI-powered stock market scanner that identifies high-potential breakouts before they happen.',
  keywords: 'stock scanner, AI trading, market analysis, breakout stocks, technical analysis',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full dark`}>
      <body className="h-full bg-gray-950 text-gray-100 overflow-hidden">
        <StoreInitializer />
        <div className="flex h-full">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto bg-gray-950">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
