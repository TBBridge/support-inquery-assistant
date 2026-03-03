import { VoyageAIClient } from 'voyageai';

const client = new VoyageAIClient({ apiKey: process.env.VOYAGEAI_API_KEY! });

const MODEL = 'voyage-3-large';

export async function embedText(text: string): Promise<number[]> {
  const response = await client.embed({
    model: MODEL,
    input: text,
    inputType: 'query',
  });
  const embedding = response.data?.[0]?.embedding;
  if (!embedding) throw new Error('Voyage AI returned no embedding');
  return embedding as number[];
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  // Voyage AI supports batch embedding (up to 128 inputs)
  const batchSize = 128;
  const embeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await client.embed({
      model: MODEL,
      input: batch,
      inputType: 'document',
    });
    embeddings.push(...(response.data?.map((d) => d.embedding as number[]) ?? []));
  }

  return embeddings;
}
