import axios from 'axios';
import * as cheerio from 'cheerio';
import { chunkText, type Chunk } from './chunk';

export type WebDocument = {
  title: string;
  url: string;
  chunks: Chunk[];
  pages?: string[]; // for multi-page scraping (GitBook)
};

const SCRAPE_TIMEOUT_MS = 15000;

export async function scrapeUrl(url: string): Promise<WebDocument> {
  const html = await fetchHtml(url);
  const { title, text } = extractContent(html);
  const chunks = chunkText(text);

  return { title, url, chunks };
}

export async function scrapeGitBook(rootUrl: string): Promise<WebDocument[]> {
  // Scrape root page and discover linked pages within the same GitBook
  const rootHtml = await fetchHtml(rootUrl);
  const $ = cheerio.load(rootHtml);

  // Extract all internal links from GitBook sidebar navigation
  const baseUrl = new URL(rootUrl);
  const internalUrls = new Set<string>([rootUrl]);

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href) return;
    try {
      const abs = new URL(href, rootUrl);
      if (
        abs.hostname === baseUrl.hostname &&
        abs.pathname.startsWith(baseUrl.pathname.split('/')[1] ? '/' + baseUrl.pathname.split('/')[1] : '/')
      ) {
        internalUrls.add(abs.href.split('#')[0]); // Remove anchors
      }
    } catch {
      // Skip invalid URLs
    }
  });

  // Limit to 50 pages to avoid excessive scraping
  const urlsToScrape = Array.from(internalUrls).slice(0, 50);

  const documents: WebDocument[] = [];
  for (const url of urlsToScrape) {
    try {
      const doc = await scrapeUrl(url);
      if (doc.chunks.length > 0) {
        documents.push(doc);
      }
    } catch (err) {
      console.warn(`Failed to scrape ${url}:`, err);
    }
  }

  return documents;
}

async function fetchHtml(url: string): Promise<string> {
  const response = await axios.get(url, {
    timeout: SCRAPE_TIMEOUT_MS,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SupportBot/1.0; +https://support-assistant.vercel.app)',
      'Accept': 'text/html,application/xhtml+xml',
    },
  });
  return response.data as string;
}

function extractContent(html: string): { title: string; text: string } {
  const $ = cheerio.load(html);

  // Remove noise elements
  $('script, style, nav, header, footer, aside, .sidebar, .navigation, .toc, [role="navigation"]').remove();
  $('noscript, iframe, img').remove();

  // Extract title
  const title =
    $('h1').first().text().trim() ||
    $('title').text().trim() ||
    'Untitled';

  // Extract main content
  const mainSelectors = [
    'main',
    'article',
    '[role="main"]',
    '.content',
    '.main-content',
    '.page-content',
    '.markdown-body',
    '#content',
    'body',
  ];

  let contentEl: cheerio.Cheerio | null = null;
  for (const sel of mainSelectors) {
    const el = $(sel);
    if (el.length > 0) {
      contentEl = el.first();
      break;
    }
  }

  const rawText = contentEl ? contentEl.text() : $('body').text();

  const text = rawText
    .replace(/\t/g, ' ')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return { title, text };
}
