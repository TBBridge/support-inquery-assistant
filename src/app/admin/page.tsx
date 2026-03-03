import Link from 'next/link';
import { BookOpen, History, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">管理ダッシュボード</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              ドキュメント管理
            </CardTitle>
            <CardDescription>
              製品マニュアル（PDF）、GitBook、Web ページ、Markdown ファイルを取り込んで RAG のナレッジベースを構築します。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/documents">
              <Button className="gap-2">
                ドキュメントを管理
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5 text-green-500" />
              問い合わせ履歴
            </CardTitle>
            <CardDescription>
              過去の問い合わせと回答案の履歴を確認します。修正が入った回答はハイライト表示されます。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/history">
              <Button variant="outline" className="gap-2">
                履歴を確認
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
