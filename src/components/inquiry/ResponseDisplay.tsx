'use client';

import { useState } from 'react';
import { Copy, Check, Edit2, Save, X, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import type { InquiryResult } from './InquiryPanel';

const SOURCE_TYPE_LABELS: Record<string, string> = {
  pdf: 'PDF',
  gitbook: 'GitBook',
  web: 'Web',
  markdown: 'ノウハウ',
  qa_correction: '修正済み Q&A',
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  pdf: 'bg-red-100 text-red-700',
  gitbook: 'bg-purple-100 text-purple-700',
  web: 'bg-blue-100 text-blue-700',
  markdown: 'bg-green-100 text-green-700',
  qa_correction: 'bg-amber-100 text-amber-700',
};

type Props = {
  result: InquiryResult | null;
  isLoading: boolean;
};

export function ResponseDisplay({ result, isLoading }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [wasCorrected, setWasCorrected] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function handleCopy() {
    const text = wasCorrected ? editedResponse : result?.response ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEdit() {
    setEditedResponse(result?.response ?? '');
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleSave() {
    if (!result) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/inquiries/${result.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correctedResponse: editedResponse }),
      });

      if (!res.ok) throw new Error('保存に失敗しました');

      setWasCorrected(true);
      setIsEditing(false);
      toast({
        title: '修正を保存しました',
        description: '次回の回答精度向上に活用されます。',
      });
    } catch (error) {
      toast({
        title: 'エラー',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">回答案</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex items-center gap-2 mt-4">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm text-gray-500">Claude が回答を生成しています...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) {
    return (
      <Card className="h-full border-dashed">
        <CardContent className="flex flex-col items-center justify-center h-64 text-center">
          <div className="text-4xl mb-3">💬</div>
          <p className="text-gray-500 text-sm">
            左の入力フォームに問い合わせ内容を入力して
            <br />「回答案を生成」ボタンを押してください。
          </p>
        </CardContent>
      </Card>
    );
  }

  const displayResponse = wasCorrected ? editedResponse : result.response;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">回答案</CardTitle>
            {wasCorrected && (
              <Badge className="bg-amber-100 text-amber-700 text-xs">修正済み</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={handleCopy} title="コピー">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {!isEditing && !wasCorrected && (
              <Button variant="ghost" size="icon" onClick={handleEdit} title="編集">
                <Edit2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedResponse}
              onChange={(e) => setEditedResponse(e.target.value)}
              className="min-h-[300px] text-sm font-mono resize-none"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                {isSaving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Save className="h-3 w-3" />
                )}
                修正を保存
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="gap-2"
              >
                <X className="h-3 w-3" />
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
              {displayResponse}
            </pre>
          </div>
        )}

        {result.sources.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">参照ソース</h3>
              <div className="space-y-2">
                {result.sources.map((source, i) => (
                  <div
                    key={source.id}
                    className="flex items-start gap-2 text-xs text-gray-600 p-2 bg-gray-50 rounded-md"
                  >
                    <span className="font-mono text-gray-400 mt-0.5">[{i + 1}]</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            SOURCE_TYPE_COLORS[source.source_type] ?? 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {SOURCE_TYPE_LABELS[source.source_type] ?? source.source_type}
                        </span>
                        <span className="font-medium truncate">{source.title}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {source.source_url && (
                          <a
                            href={source.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline flex items-center gap-0.5 truncate max-w-[200px]"
                          >
                            {new URL(source.source_url).hostname}
                            <ExternalLink className="h-2.5 w-2.5 shrink-0" />
                          </a>
                        )}
                        <span className="text-gray-400">
                          関連度 {Math.round(source.similarity * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {result.sources.length === 0 && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ 参照できるドキュメントが見つかりませんでした。ドキュメントを追加するとより精度の高い回答が生成されます。
          </p>
        )}
      </CardContent>
    </Card>
  );
}
