import { embedText } from './embeddings';
import { similaritySearch } from './vectorstore';
import type { DocumentWithScore } from './vectorstore';

export type RetrievalResult = {
  documents: DocumentWithScore[];
  context: string;
};

const SIMILARITY_THRESHOLD = 0.3;

export async function retrieveRelevantDocs(
  query: string,
  topK = 5
): Promise<RetrievalResult> {
  const queryEmbedding = await embedText(query);

  // Search all document types; Q&A corrections are included and ranked by similarity
  const docs = await similaritySearch(queryEmbedding, topK * 2);

  // Filter by similarity threshold and deduplicate by content similarity
  const filtered = docs.filter((d) => d.similarity >= SIMILARITY_THRESHOLD);

  // Prioritize qa_correction (human-verified answers) over raw documents
  const correctionDocs = filtered.filter((d) => d.source_type === 'qa_correction');
  const regularDocs = filtered.filter((d) => d.source_type !== 'qa_correction');

  // Take corrections first, then fill with regular docs up to topK
  const combined = [...correctionDocs, ...regularDocs].slice(0, topK);

  const context = combined
    .map((doc, i) => {
      const sourceLabel = getSourceLabel(doc.source_type);
      const url = doc.source_url ? ` (${doc.source_url})` : '';
      return `[${i + 1}] ${sourceLabel}${url}\nタイトル: ${doc.title}\n\n${doc.content}`;
    })
    .join('\n\n---\n\n');

  return { documents: combined, context };
}

function getSourceLabel(sourceType: string): string {
  const labels: Record<string, string> = {
    pdf: 'PDF マニュアル',
    gitbook: 'GitBook ドキュメント',
    web: 'Web ページ',
    markdown: 'ノウハウ記事',
    qa_correction: '修正済み Q&A',
  };
  return labels[sourceType] ?? sourceType;
}
