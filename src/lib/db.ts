import postgres from 'postgres';

// Lazy initialization: ビルド時ではなくリクエスト時に接続を作成する
let _pg: ReturnType<typeof postgres> | null = null;

function getClient(): ReturnType<typeof postgres> {
  if (_pg) return _pg;

  const connectionString = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  _pg = postgres(connectionString, {
    ssl: connectionString.includes('localhost') ? false : 'require',
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return _pg;
}

// @vercel/postgres 互換ラッパー: sql`...` テンプレートタグが同じように使えます
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql = (strings: TemplateStringsArray, ...values: any[]) =>
  getClient()(strings, ...values).then((rows) => ({
    rows: rows as Record<string, unknown>[],
  }));

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
