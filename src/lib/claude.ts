import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const MODEL = 'claude-sonnet-4-6';

export type GenerateResponseInput = {
  query: string;
  context: string;
  language?: 'ja' | 'en';
};

export type GenerateResponseOutput = {
  response: string;
  usage: { inputTokens: number; outputTokens: number };
};

const SYSTEM_PROMPT_JA = `あなたはカスタマーサポートの専門家です。
提供されたドキュメントやナレッジベースの情報を参照して、お客様の問い合わせに対して正確で丁寧な回答案を作成してください。

ガイドライン:
- 参照情報に基づいて回答し、推測で情報を補わないこと
- 回答が不確かな場合は「詳細については担当者にご確認ください」と追記すること
- 日本語で丁寧かつ明確に回答すること
- Markdownを使用して見やすく整形すること
- 参照したソースを明示すること`;

const SYSTEM_PROMPT_EN = `You are a customer support specialist.
Using the provided documents and knowledge base information, create accurate and polite response drafts for customer inquiries.

Guidelines:
- Base your response on the reference information; do not fill in gaps with speculation
- If uncertain, add "Please confirm with our team for details"
- Respond clearly and professionally in English
- Use Markdown formatting for readability
- Cite the sources you referenced`;

export async function generateResponse(
  input: GenerateResponseInput
): Promise<GenerateResponseOutput> {
  const { query, context, language = 'ja' } = input;
  const systemPrompt = language === 'ja' ? SYSTEM_PROMPT_JA : SYSTEM_PROMPT_EN;

  const userMessage =
    language === 'ja'
      ? `以下の参照情報を使用して、お客様の問い合わせに回答してください。

## 参照情報
${context}

## お客様の問い合わせ
${query}

上記の参照情報に基づいて、回答案を作成してください。`
      : `Using the reference information below, please respond to the customer inquiry.

## Reference Information
${context}

## Customer Inquiry
${query}

Please create a response draft based on the reference information above.`;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const responseText =
    message.content[0].type === 'text' ? message.content[0].text : '';

  return {
    response: responseText,
    usage: {
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
    },
  };
}
