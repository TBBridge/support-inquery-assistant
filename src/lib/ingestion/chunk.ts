// Text chunking utility for RAG document ingestion

export type Chunk = {
  content: string;
  index: number;
  total: number;
};

const DEFAULT_CHUNK_SIZE = 512;  // approximate tokens
const DEFAULT_OVERLAP = 50;      // token overlap between chunks

// Rough token estimate: ~4 chars per token for Japanese/English mix
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP
): Chunk[] {
  if (!text.trim()) return [];

  // Split by paragraphs first (double newlines or headers)
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const chunks: string[] = [];
  let currentChunk = '';
  let currentTokens = 0;

  for (const paragraph of paragraphs) {
    const paraTokens = estimateTokens(paragraph);

    if (paraTokens > chunkSize) {
      // Paragraph is too large; split by sentences
      if (currentChunk) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
        currentTokens = 0;
      }

      const sentences = paragraph.split(/(?<=[。．！？!?.])\s*/);
      for (const sentence of sentences) {
        const sentTokens = estimateTokens(sentence);
        if (currentTokens + sentTokens > chunkSize && currentChunk) {
          chunks.push(currentChunk.trim());
          // Keep overlap from end of previous chunk
          const overlapText = currentChunk.slice(-overlap * 4);
          currentChunk = overlapText + ' ' + sentence;
          currentTokens = estimateTokens(currentChunk);
        } else {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
          currentTokens += sentTokens;
        }
      }
    } else if (currentTokens + paraTokens > chunkSize) {
      chunks.push(currentChunk.trim());
      const overlapText = currentChunk.slice(-overlap * 4);
      currentChunk = overlapText + '\n\n' + paragraph;
      currentTokens = estimateTokens(currentChunk);
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
      currentTokens += paraTokens;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.map((content, index) => ({
    content,
    index,
    total: chunks.length,
  }));
}
