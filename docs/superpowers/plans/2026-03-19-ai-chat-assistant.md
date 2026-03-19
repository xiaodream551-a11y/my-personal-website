# AI 学术助手（GLM-5）实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在学术展示页右下角添加一个浮动 AI 聊天助手，接入智谱 GLM-5 模型，让访客（导师/面试老师）可以通过对话了解肖峻铭的背景、技能和研究兴趣。

**Architecture:** Next.js API Route (`/api/chat`) 作为后端代理转发请求到智谱 API，隐藏 API Key；前端 ChatAssistant 组件通过 `fetch` + `ReadableStream` 消费 SSE 流式响应；System Prompt 预置完整个人资料，限定回答范围。

**Tech Stack:** Next.js 16 App Router API Route, 智谱 GLM-5 API (OpenAI-compatible), Tailwind CSS v4, React 19 hooks

---

## 文件结构

| 操作 | 路径 | 职责 |
|------|------|------|
| 创建 | `.env.local` | 存放 `ZHIPU_API_KEY` |
| 创建 | `.env.example` | API Key 占位模板 |
| 创建 | `src/lib/chat-config.ts` | System Prompt + 常量（每日限制、模型名等） |
| 创建 | `src/app/api/chat/route.ts` | API Route：转发请求到智谱、流式返回、输入校验 |
| 创建 | `src/components/ChatAssistant.tsx` | 浮动气泡 + 聊天窗口 UI（`"use client"`） |
| 修改 | `src/app/page.tsx` | 引入 ChatAssistant 组件（保持 Server Component） |

---

### Task 1: 环境变量配置

**Files:**
- Create: `.env.local`
- Create: `.env.example`

- [ ] **Step 1: 创建 `.env.example` 模板**

```bash
# 智谱 API Key — 从 https://open.bigmodel.cn 获取
ZHIPU_API_KEY=your_api_key_here
```

- [ ] **Step 2: 创建 `.env.local`（真实 Key）**

```bash
ZHIPU_API_KEY=<用户填入真实 Key>
```

- [ ] **Step 3: 确认 `.gitignore` 已忽略 `.env*`**

Run: `grep '.env' .gitignore`
Expected: 包含 `.env*` 的行（已确认存在）

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "chore: add .env.example for Zhipu API key"
```

---

### Task 2: 聊天配置（System Prompt + 常量）

**Files:**
- Create: `src/lib/chat-config.ts`（需先 `mkdir -p src/lib`，该目录尚不存在）

- [ ] **Step 1: 创建目录和文件**

```bash
mkdir -p src/lib
```

```ts
// src/lib/chat-config.ts

export const CHAT_CONFIG = {
  model: "glm-5",
  maxTokens: 512,
  temperature: 0.7,
  /** 每个访客每天最多对话轮次（仅客户端 localStorage 计数，非服务端强制） */
  dailyLimit: 20,
} as const;

export const SYSTEM_PROMPT = `你是肖峻铭的 AI 学术助手，部署在他的个人学术主页上。你的任务是基于以下资料，礼貌、准确地回答访客（通常是研究生导师或面试老师）的提问。

## 基本信息
- 姓名：肖峻铭
- 学校：南京工业大学
- 专业：智能建造
- 学历：本科在读
- 兴趣方向：人工智能与建筑/土木工程的交叉领域

## 技能
- 编程：Python、Unity3D
- 专业：BIM 建模（持中国图学会 BIM 一级 & 二级建筑设计证书）、深度学习、数据分析、计算机视觉
- 语言：英语（多项竞赛获奖）

## 获奖与荣誉
- 全国大学生智能建造竞赛 一等奖（2025，土木组）
- 第十七届"高教杯"全国大学生先进成图技术与产品信息建模创新大赛 三等奖（建筑类）
- 江苏省第四届大学生先进成图技术与产品信息建模创新大赛 三等奖（建筑类）
- LSCAT 江苏省笔译大赛 二等奖（2024，汉译英本科组）
- 全国大学生英语作文大赛 省级三等奖（2024）
- "外教社·词达人杯"全国大学生英语词汇能力大赛 校赛二等奖（2024）

## 项目经历
- 基于 Unity3D 的数字城隧交互平台 V1.0（已获计算机软件著作权，2025）

## 回答规则
1. 只基于以上资料回答，不编造任何信息
2. 如果被问到资料中没有的内容，礼貌说明"这方面的信息暂未收录，建议直接联系肖峻铭本人"
3. 保持专业、谦逊的语气，适合学术场景
4. 用中文回答，除非访客用英文提问
5. 回答简洁，通常 2-4 句话即可，不要过度展开`;
```

- [ ] **Step 2: 确认 TypeScript 无报错**

Run: `npx tsc --noEmit`（全项目检查，确保路径别名正确解析）
Expected: 无错误输出

- [ ] **Step 3: Commit**

```bash
git add src/lib/chat-config.ts
git commit -m "feat: add chat config with system prompt and constants"
```

---

### Task 3: API Route（流式代理 + 输入校验）

**Files:**
- Create: `src/app/api/chat/route.ts`

- [ ] **Step 1: 创建 API Route**

```ts
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
    // 只记录日志，不向客户端暴露上游错误细节
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
```

- [ ] **Step 2: 用 curl 测试 API Route（需先启动 dev server）**

Run:
```bash
npm run dev &
sleep 3
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"你好，请介绍一下肖峻铭"}]}'
```

Expected: 收到 SSE 流式文本，内容是关于肖峻铭的介绍。

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: add /api/chat streaming proxy to Zhipu GLM-5"
```

---

### Task 4: ChatAssistant 组件

**Files:**
- Create: `src/components/ChatAssistant.tsx`

- [ ] **Step 1: 创建聊天组件**

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { CHAT_CONFIG } from "@/lib/chat-config";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "chat_usage";

function getTodayUsage(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    const today = new Date().toDateString();
    return data.date === today ? data.count : 0;
  } catch {
    return 0;
  }
}

function incrementUsage() {
  const today = new Date().toDateString();
  const current = getTodayUsage();
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ date: today, count: current + 1 })
  );
}

export default function ChatAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // 关闭窗口时取消进行中的请求
  useEffect(() => {
    if (!open && abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, [open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    if (getTodayUsage() >= CHAT_CONFIG.dailyLimit) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "今日对话次数已达上限，请明天再来。如需联系肖峻铭，请通过页面底部的联系方式。",
        },
      ]);
      return;
    }

    const userMsg: Message = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
        signal: controller.signal,
      });

      if (!res.ok) throw new Error("请求失败");

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("无法读取响应流");

      // 添加空的 assistant 消息，后续逐步填充
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                updated[updated.length - 1] = {
                  ...last,
                  content: last.content + delta,
                };
                return updated;
              });
            }
          } catch {
            // 忽略 SSE 解析错误
          }
        }
      }

      incrementUsage();
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setMessages((prev) => {
        const cleaned = [...prev];
        if (
          cleaned.length > 0 &&
          cleaned[cleaned.length - 1].role === "assistant" &&
          cleaned[cleaned.length - 1].content === ""
        ) {
          cleaned.pop();
        }
        return [
          ...cleaned,
          { role: "assistant", content: "抱歉，回复出现了问题，请稍后再试。" },
        ];
      });
    } finally {
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <>
      {/* 浮动气泡按钮 */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 bg-accent hover:bg-accent-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center hover:-translate-y-0.5"
        aria-label={open ? "关闭 AI 助手" : "打开 AI 助手"}
      >
        {open ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        )}
      </button>

      {/* 聊天窗口 */}
      {open && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[360px] max-h-[520px] bg-white rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 bg-accent text-white">
            <h3 className="font-display font-semibold text-sm">
              AI 学术助手
            </h3>
            <p className="text-xs text-white/70 mt-0.5">
              基于 GLM 大模型，可回答关于肖峻铭的学术背景
            </p>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[340px]"
          >
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted py-8">
                <p>你好！我是肖峻铭的 AI 助手。</p>
                <p className="mt-1">
                  你可以问我关于他的学术背景、技能和获奖经历。
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-white rounded-br-md"
                      : "bg-slate-100 text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.content ||
                    (loading && i === messages.length - 1 ? (
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 bg-muted/50 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-muted/50 rounded-full animate-bounce [animation-delay:0.15s]" />
                        <span className="w-1.5 h-1.5 bg-muted/50 rounded-full animate-bounce [animation-delay:0.3s]" />
                      </span>
                    ) : null)}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入你的问题..."
                className="flex-1 px-3.5 py-2 text-sm border border-border rounded-xl focus:outline-none focus:border-accent transition-colors"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-3.5 py-2 bg-accent hover:bg-accent-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors"
              >
                发送
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: 启动 dev server，手动验证**

验证项：
1. 右下角出现青色圆形气泡按钮
2. 点击气泡展开聊天窗口，显示欢迎语
3. 输入问题后流式显示回答
4. 点击气泡可关闭窗口
5. 在 Chrome DevTools 设备模拟（375px 宽）下聊天窗口不溢出

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAssistant.tsx
git commit -m "feat: add ChatAssistant floating chat component"
```

---

### Task 5: 集成到页面

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: 在 page.tsx 中引入 ChatAssistant**

在 import 区域添加：
```ts
import ChatAssistant from "@/components/ChatAssistant";
```

在 `</main>` 之后、`<Footer />` 之前添加：
```tsx
<ChatAssistant />
```

> **注意：** `page.tsx` 是 Server Component（没有 `"use client"`），在其中导入 `"use client"` 组件是 Next.js App Router 的标准模式——ChatAssistant 会自动成为客户端边界。不要给 `page.tsx` 添加 `"use client"`。

- [ ] **Step 2: 构建验证**

Run: `npm run build`
Expected: 无错误

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: integrate ChatAssistant into homepage"
```

---

### Task 6: 最终验证与部署

- [ ] **Step 1: `npm run build` 无错误**

- [ ] **Step 2: `npm run dev` 手动测试**

验证清单：
1. 气泡位置正确（右下角），不遮挡其他内容
2. 聊天窗口在桌面端和移动端（375px）均正常显示
3. 流式输出逐字显示
4. 问"你是谁"→ 回答基于 System Prompt
5. 问资料外的问题 → 礼貌拒绝
6. 连续对话 20 轮后提示达到上限
7. 导航锚点跳转不受影响
8. 在流式回答中途关闭窗口 → 无报错（AbortController 取消）

- [ ] **Step 3: 推送 GitHub，Vercel 自动部署**

```bash
git push origin main
```

**注意：** 需要在 Vercel 项目设置中添加环境变量 `ZHIPU_API_KEY`，否则部署后 API 会返回 502。
