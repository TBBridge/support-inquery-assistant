#!/usr/bin/env node
/**
 * 問い合わせ支援 AI アシスタント - MCP スタンドアロンサーバー
 *
 * このサーバーは Next.js アプリの /api/mcp エンドポイントに転送する HTTP クライアントとして動作します。
 * Claude Desktop などの MCP クライアントから stdio 経由で呼び出せます。
 *
 * 使用方法:
 *   APP_URL=https://your-app.vercel.app MCP_API_KEY=your-key node dist/index.js
 *
 * Claude Desktop の設定例 (claude_desktop_config.json):
 * {
 *   "mcpServers": {
 *     "support-inquiry": {
 *       "command": "node",
 *       "args": ["/path/to/mcp-server/dist/index.js"],
 *       "env": {
 *         "APP_URL": "https://your-app.vercel.app",
 *         "MCP_API_KEY": "your-key"
 *       }
 *     }
 *   }
 * }
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const APP_URL = process.env.APP_URL ?? 'http://localhost:3000';
const MCP_API_KEY = process.env.MCP_API_KEY ?? '';

async function callAppApi(method: string, params: unknown): Promise<unknown> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (MCP_API_KEY) {
    headers['Authorization'] = `Bearer ${MCP_API_KEY}`;
  }

  const response = await fetch(`${APP_URL}/api/mcp`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      jsonrpc: '2.0',
      method,
      params,
      id: Date.now(),
    }),
  });

  const data = (await response.json()) as {
    result?: { content?: Array<{ text: string }> };
    error?: { message: string };
  };

  if (data.error) {
    throw new Error(data.error.message);
  }

  // Parse the JSON string from MCP response content
  const text = data.result?.content?.[0]?.text ?? '{}';
  return JSON.parse(text);
}

const server = new Server(
  {
    name: 'support-inquiry-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'generate_response',
      description:
        'お客様の問い合わせに対してRAGを使用して回答案を生成します。製品マニュアル、ナレッジベース、過去の修正済み回答を参照して回答を作成します。',
      inputSchema: {
        type: 'object' as const,
        properties: {
          query: {
            type: 'string',
            description: 'お客様からの問い合わせ内容',
          },
          language: {
            type: 'string',
            enum: ['ja', 'en'],
            description: '回答言語 (ja: 日本語, en: 英語)',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'list_documents',
      description: 'RAGに登録されているドキュメントの一覧を取得します。',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: '取得する最大件数 (デフォルト: 20)',
          },
        },
        required: [],
      },
    },
    {
      name: 'get_inquiry_history',
      description: '過去の問い合わせ履歴を取得します。',
      inputSchema: {
        type: 'object' as const,
        properties: {
          limit: {
            type: 'number',
            description: '取得する最大件数 (デフォルト: 10)',
          },
        },
        required: [],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args = {} } = request.params;

  try {
    const result = await callAppApi('tools/call', {
      name,
      arguments: args,
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text' as const,
          text: `エラー: ${(error as Error).message}`,
        },
      ],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error('Support Inquiry MCP Server started (stdio transport)');
