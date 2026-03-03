// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse') as (buf: Buffer) => Promise<{ text: string; numpages: number }>;
import { chunkText, type Chunk } from './chunk';

export type PdfDocument = {
  title: string;
  chunks: Chunk[];
  pageCount: number;
};

export async function parsePdf(
  buffer: Buffer,
  filename: string
): Promise<PdfDocument> {
  const data = await pdf(buffer as Buffer);

  const title = extractTitle(data.text, filename);
  const cleanedText = cleanPdfText(data.text);
  const chunks = chunkText(cleanedText);

  return {
    title,
    chunks,
    pageCount: data.numpages,
  };
}

function extractTitle(text: string, filename: string): string {
  // Try to extract title from first non-empty line
  const firstLine = text
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 3 && l.length < 200);

  if (firstLine) return firstLine;

  // Fall back to filename without extension
  return filename.replace(/\.pdf$/i, '');
}

function cleanPdfText(text: string): string {
  return text
    .replace(/\f/g, '\n') // Form feed to newline
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ') // Collapse horizontal whitespace
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .trim();
}
