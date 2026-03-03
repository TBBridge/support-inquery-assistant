import { InquiryPanel } from '@/components/inquiry/InquiryPanel';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">お客様問い合わせ対応</h1>
        <p className="mt-1 text-sm text-gray-600">
          問い合わせ内容を入力すると、製品マニュアルやナレッジベースを参照して回答案を自動生成します。
        </p>
      </div>
      <InquiryPanel />
    </div>
  );
}
