# 問い合わせ支援 AI アシスタント

お客様からの問い合わせに対して、製品マニュアル・ナレッジベース・ノウハウを RAG で参照し、回答案を自動生成する Web アプリです。

## 主な機能

- **RAG による回答自動生成**: PDF・GitBook・Web ページ・Markdown を取り込み、Claude が回答案を生成
- **回答修正 & フィードバックループ**: 修正を保存すると Q&A ペアとして RAG に自動追加し次回以降の精度向上
- **参照ソース表示**: 参照したドキュメントと関連度スコアを表示
- **多言語対応**: 日本語・英語での回答生成
- **MCP サーバー**: Claude Desktop などから stdio / HTTP 経由で呼び出し可能
- **管理画面**: ドキュメント管理・履歴確認（Google OAuth 認証）

## 技術スタック

| 用途 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| Vector DB | Vercel Postgres (pgvector) |
| Embeddings | Voyage AI (voyage-3-large) |
| LLM | Anthropic Claude (claude-sonnet-4-6) |
| 認証 | NextAuth.js v5 (Google OAuth) |
| スタイリング | Tailwind CSS + shadcn/ui |
| MCP | @modelcontextprotocol/sdk |

## セットアップ

### 1. 環境変数の設定

```bash
cp .env.local.example .env.local
# .env.local を編集して各 API キーを設定
```

必要な API キー:
- `ANTHROPIC_API_KEY`: [Anthropic Console](https://console.anthropic.com/)
- `VOYAGEAI_API_KEY`: [Voyage AI Dashboard](https://dash.voyageai.com/)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: [Google Cloud Console](https://console.cloud.google.com/)

### 2. Vercel Postgres のセットアップ

Vercel Dashboard で Postgres データベースを作成後、`scripts/migrate.sql` を Vercel Postgres の Query タブで実行してください。

### 3. ローカル開発

```bash
npm install
npm run dev
```

### 4. Vercel デプロイ

GitHub にプッシュ後、Vercel でプロジェクトをインポートしてください。Vercel Postgres をリンクすると DB の環境変数は自動設定されます。

## MCP サーバーの使用方法

### Claude Desktop から（stdio 経由）

```bash
cd mcp-server
npm install
npm run build
```

`claude_desktop_config.json` に追加:

```json
{
  "mcpServers": {
    "support-inquiry": {
      "command": "node",
      "args": ["/path/to/mcp-server/dist/index.js"],
      "env": {
        "APP_URL": "https://your-app.vercel.app",
        "MCP_API_KEY": "your-mcp-api-key"
      }
    }
  }
}
```

### HTTP 経由（外部サービスから）

```bash
curl -X POST https://your-app.vercel.app/api/mcp \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $MCP_API_KEY" \
  -d '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"generate_response","arguments":{"query":"返品ポリシーを教えてください"}},"id":1}'
```

## MCP ツール一覧

| ツール名 | 説明 |
|---------|------|
| `generate_response` | 問い合わせを受け取り RAG で回答案を生成 |
| `list_documents` | 登録済みドキュメント一覧を取得 |
| `get_inquiry_history` | 過去の問い合わせ履歴を取得 |

## フィードバックループの仕組み

1. 問い合わせ → RAG で関連ドキュメント取得 → Claude で回答案生成
2. オペレーターが回答案を確認・修正して「修正を保存」
3. 修正内容が「Q: 問い合わせ / A: 修正後回答」の形式で pgvector に保存
4. 次回同様の問い合わせ時に修正済み Q&A が優先的に参照される
