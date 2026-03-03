'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type Inquiry = {
  id: string;
  query: string;
  generated_response: string;
  final_response: string | null;
  was_corrected: boolean;
  language: string;
  created_at: string;
};

export function InquiryHistory() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inquiries?limit=50');
      const data = await res.json();
      setInquiries(data.inquiries ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast({ title: 'エラー', description: '履歴の取得に失敗しました', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{total} 件の問い合わせ</p>
        <Button variant="ghost" size="sm" onClick={fetchInquiries} className="gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          更新
        </Button>
      </div>

      {inquiries.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-gray-500">
            問い合わせ履歴がありません。
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {inquiries.map((inquiry) => {
            const isExpanded = expandedId === inquiry.id;
            return (
              <Card key={inquiry.id} className={inquiry.was_corrected ? 'border-amber-200' : ''}>
                <CardHeader
                  className="pb-2 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {inquiry.was_corrected && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs shrink-0">
                            修正済み
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs shrink-0">
                          {inquiry.language === 'ja' ? '日本語' : 'English'}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">
                        {inquiry.query}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0 space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        自動生成された回答案
                      </h4>
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 rounded p-3 max-h-48 overflow-y-auto">
                        {inquiry.generated_response}
                      </pre>
                    </div>

                    {inquiry.was_corrected && inquiry.final_response && (
                      <div>
                        <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">
                          修正後の回答
                        </h4>
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-amber-50 rounded p-3 max-h-48 overflow-y-auto border border-amber-200">
                          {inquiry.final_response}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
