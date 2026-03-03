import matter from 'gray-matter';
import { chunkText, type Chunk } from './chunk';

export type MarkdownDocument = {
  title: string;
  chunks: Chunk[];
  frontmatter: Record<string, unknown>;
};

export function parseMarkdown(
  content: string,
  filename?: string
): MarkdownDocument {
  const { data: frontmatter, content: body } = matter(content);

  // Extract title from frontmatter or first H1
  const title =
    (frontmatter.title as string) ||
    extractH1(body) ||
    (filename ? filename.replace(/\.mdx?$/i, '') : 'Untitled');

  // Clean up markdown for better chunking
  const cleanedBody = cleanMarkdown(body);
  const chunks = chunkText(cleanedBody);

  return { title, chunks, frontmatter };
}

function extractH1(markdown: string): string | null {
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : null;
}

function cleanMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, (match) => {
      // Keep code blocks but label them
      const lang = match.match(/```(\w+)/)?.[1] || 'code';
      const code = match.replace(/```\w*\n?/, '').replace(/```$/, '').trim();
      return `[コードブロック (${lang})]:\n${code}`;
    })
    .replace(/!\[.*?\]\(.*?\)/g, '') // Remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Unfurl links
    .replace(/^#+\s*/gm, '') // Remove heading markers
    .replace(/[*_~`]{1,2}([^*_~`]+)[*_~`]{1,2}/g, '$1') // Remove inline formatting
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
