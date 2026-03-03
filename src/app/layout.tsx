import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { NavBar } from '@/components/layout/NavBar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '問い合わせ支援 AI アシスタント',
  description: '製品マニュアルやナレッジベースを元に、お客様の問い合わせに対する回答案を自動生成',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <NavBar />
        <main className="min-h-[calc(100vh-4rem)] bg-gray-50">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
