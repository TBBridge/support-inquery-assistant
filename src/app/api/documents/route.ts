import { NextRequest, NextResponse } from 'next/server';
import { listDocuments, countDocuments } from '@/lib/rag/vectorstore';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 200);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  try {
    const [documents, total] = await Promise.all([
      listDocuments(limit, offset),
      countDocuments(),
    ]);

    return NextResponse.json({ documents, total });
  } catch (error) {
    console.error('List documents error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
