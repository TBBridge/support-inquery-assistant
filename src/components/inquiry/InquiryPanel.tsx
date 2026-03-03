'use client';

import { useState } from 'react';
import { InquiryForm } from './InquiryForm';
import { ResponseDisplay } from './ResponseDisplay';

export type InquiryResult = {
  id: string;
  response: string;
  sources: Array<{
    id: string;
    title: string;
    source_type: string;
    source_url: string | null;
    similarity: number;
  }>;
};

export function InquiryPanel() {
  const [result, setResult] = useState<InquiryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="lg:col-span-1">
        <InquiryForm
          onResult={(r) => setResult(r)}
          onLoading={setIsLoading}
          isLoading={isLoading}
        />
      </div>
      <div className="lg:col-span-1">
        <ResponseDisplay result={result} isLoading={isLoading} />
      </div>
    </div>
  );
}
