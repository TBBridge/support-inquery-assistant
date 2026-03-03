import { sql } from '@vercel/postgres';

export { sql };

export type Document = {
  id: string;
  source_type: 'pdf' | 'gitbook' | 'web' | 'markdown' | 'qa_correction';
  source_url: string | null;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Inquiry = {
  id: string;
  query: string;
  generated_response: string;
  final_response: string | null;
  was_corrected: boolean;
  retrieved_doc_ids: string[];
  correction_doc_id: string | null;
  user_id: string | null;
  language: string;
  created_at: string;
};
