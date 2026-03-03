import { DocumentManager } from '@/components/admin/DocumentManager';

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ドキュメント管理</h1>
      <DocumentManager />
    </div>
  );
}
