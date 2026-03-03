import { InquiryHistory } from '@/components/admin/InquiryHistory';

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">問い合わせ履歴</h1>
      <InquiryHistory />
    </div>
  );
}
