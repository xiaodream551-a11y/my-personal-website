import { CHAT_CONFIG, SYSTEM_PROMPT } from "@/lib/chat-config";

export const runtime = "edge";

const ALLOWED_ROLES = new Set(["user", "assistant"]);

export async function POST(req: Request) {
  const apiKey = process.env.ZHIPU_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key not configured" }, { status: 500 });
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const userMessages = body.messages ?? [];

  // 校验 + 过滤：只允许 user/assistant role，单条消息不超过 500 字
  const recentMessages = userMessages
    .filter(
      (m) =>
        ALLOWED_ROLES.has(m.role) &&
        typeof m.content === "string" &&
        m.content.length <= 500
    )
    .slice(-10);

  const zhipuRes = await fetch(
    "https://open.bigmodel.cn/api/paas/v4/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: CHAT_CONFIG.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...recentMessages,
        ],
        max_tokens: CHAT_CONFIG.maxTokens,
        temperature: CHAT_CONFIG.temperature,
        stream: true,
      }),
    }
  );

  if (!zhipuRes.ok) {
    console.error("Zhipu API error:", zhipuRes.status, await zhipuRes.text());
    return Response.json(
      { error: "AI 服务暂时不可用，请稍后再试" },
      { status: 502 }
    );
  }

  // 透传 SSE 流
  return new Response(zhipuRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
