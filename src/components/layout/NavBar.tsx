'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, BookOpen, History, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: '問い合わせ対応', icon: Bot },
  { href: '/admin/documents', label: 'ドキュメント管理', icon: BookOpen },
  { href: '/admin/history', label: '問い合わせ履歴', icon: History },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-blue-600">
            <Bot className="h-6 w-6" />
            <span className="hidden sm:inline">問い合わせ支援 AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'gap-2',
                    pathname === href && 'bg-blue-50 text-blue-600'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin">
            <Button variant="ghost" size="icon" title="管理画面">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
