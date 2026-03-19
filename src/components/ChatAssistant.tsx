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
