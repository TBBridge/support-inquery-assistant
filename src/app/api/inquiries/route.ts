import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { retrieveRelevantDocs } from '@/lib/rag/retrieval';
import { generateResponse } from '@/lib/claude';
import { sql } from '@/lib/db';

const InquirySchema = z.object({
  query: z.string().min(1).max(2000),
  language: z.enum(['ja', 'en']).optional().default('ja'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, language } = InquirySchema.parse(body);

    // RAG: retrieve relevant documents
    const { documents, context } = await retrieveRelevantDocs(query, 5);

    // Generate response with Claude
    const { response } = await generateResponse({ query, context, language });

    // Store inquiry in DB
    // Format array as PostgreSQL literal to avoid Vercel Postgres parameter type issue
    const retrievedIdsLiteral = `{${documents.map((d) => d.id).join(',')}}`;
    const result = await sql`
      INSERT INTO inquiries (query, generated_response, retrieved_doc_ids, language)
      VALUES (
        ${query},
        ${response},
        ${retrievedIdsLiteral}::uuid[],
        ${language}
      )
      RETURNING id
    `;

    const inquiryId = result.rows[0].id as string;

    return NextResponse.json({
      id: inquiryId,
      response,
      sources: documents.map((d) => ({
        id: d.id,
        title: d.title,
        source_type: d.source_type,
        source_url: d.source_url,
        similarity: d.similarity,
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Inquiry error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  try {
    const result = await sql`
      SELECT id, query, generated_response, final_response, was_corrected,
             retrieved_doc_ids, language, created_at
      FROM inquiries
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`SELECT COUNT(*) as total FROM inquiries`;

    return NextResponse.json({
      inquiries: result.rows,
      total: parseInt(countResult.rows[0].total as string),
    });
  } catch (error) {
    console.error('List inquiries error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
