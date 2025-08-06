"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAutoScroll } from "./hooks/useAutoScroll";
import { useSocketAudio } from "./hooks/useSocketAudio";
import { ChatMessage } from "./components/ChatMessage";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function hasResponseId(data: unknown): data is { responseId: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "responseId" in data &&
    typeof data.responseId === "string"
  );
}

export default function Home() {
  const [input, setInput] = useState("");
  const prevRespId = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${API_BASE}/api/chat`,
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          message: messages[messages.length - 1],
          previousResponseId: prevRespId.current,
        },
      }),
    }),
    onData: (part) => {
      if (hasResponseId(part.data)) {
        prevRespId.current = part.data.responseId;
      }
    },
  });

  const loading = status === "submitted" || status === "streaming";
  useAutoScroll(containerRef, endRef, [messages, status]);
  useSocketAudio(audioRef);

  const starters = useMemo(() => [
    { label: "🤖 Play a chapter about RAG", text: "Play a chapter about RAG" },
    { label: "👥 Play a chapter about building great teams", text: "Play a chapter about building great teams" },
    { label: "🎯 Play a chapter about agents", text: "Play a chapter about agents" },
    { label: "📚 What audiobooks are available?", text: "What audiobooks are available?" },
  ], []);

  const quick = useCallback((text: string) => {
    sendMessage({ role: "user", parts: [{ type: "text", text }] });
  }, [sendMessage]);

  const onSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = input.trim();
    if (!q) return;
    quick(q);
    setInput("");
  }, [input, quick]);

  return (
    <main className="flex flex-col h-screen p-4 gap-4">
      {/* messages */}
      <section ref={containerRef} className="flex-1 overflow-y-auto space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Try asking:</h2>
            <div className="grid gap-2">
              {starters.map((s) => (
                <button key={s.text} onClick={() => quick(s.text)} className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded">
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <ChatMessage key={m.id ?? i} message={m} isLast={i === messages.length - 1} loading={loading} />
        ))}

        {error && <p className="text-red-500">{error.message}</p>}
        <div ref={endRef} />
      </section>

      {/* audio */}
      <section className="bg-gray-50 p-4 rounded">
        <audio ref={audioRef} controls className="w-full" preload="none" />
        <p className="text-sm text-gray-600 mt-2">🎵 Audio player — controlled by chat</p>
      </section>

      {/* input */}
      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything"
          className="flex-1 border p-2 rounded"
          disabled={loading}
        />
        <button type="submit" className="bg-black text-white px-4 py-2 rounded disabled:opacity-50" disabled={loading}>
          Send
        </button>
      </form>
    </main>
  );
}
