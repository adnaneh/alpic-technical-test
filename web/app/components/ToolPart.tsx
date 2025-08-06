"use client";

import { getToolName, type ToolUIPart } from "ai";

const TOOL_LABELS: Record<string, string> = {
  list_books: "📚 List Books",
  list_chapters: "📖 Chapter Listing",
  get_chapter_audio: "🎧 Audio Retrieval",
  play: "▶️ Audio Playback",
  pause: "⏸️ Pause",
  resume: "▶️ Resume",
};

const TOOL_STATE: Record<string, { icon: string; label: string; color: string }> = {
  "input-streaming": { icon: "⏳", label: "Preparing…", color: "text-yellow-600" },
  "input-available": { icon: "🔄", label: "Executing…", color: "text-blue-600" },
  "output-available": { icon: "✅", label: "Complete", color: "text-green-600" },
  "output-error": { icon: "⚠️", label: "Error", color: "text-red-600" },
};

const toolLabel = (t: string) => TOOL_LABELS[t] ?? `🔧 ${t}`;
const toolState = (s?: string) => TOOL_STATE[s ?? ""] ?? { icon: "❓", label: s ?? "?", color: "text-gray-600" };

export function ToolPart({ part }: { part: ToolUIPart }) {
  const name = String(getToolName(part));
  const s = toolState(part.state);

  const Section = ({ children, tone }: { children: React.ReactNode; tone: "in" | "ok" | "err" }) => (
    <pre
      className={{
        in: "text-xs bg-gray-50 p-2 rounded mb-2 overflow-auto max-h-32",
        ok: "text-xs bg-green-50 p-2 rounded overflow-auto max-h-64",
        err: "text-xs bg-red-50 p-2 rounded overflow-auto max-h-64",
      }[tone]}
    >
      {children}
    </pre>
  );

  const renderOutput = () => {
    const o = (part).output;
    return typeof o === "string" ? o : JSON.stringify(o, null, 2);
  };

  return (
    <div className="p-3 rounded-lg border bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="flex items-center gap-2 font-medium text-gray-700">
          {s.icon} {toolLabel(name)}
        </span>
        <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
      </div>

      {"input" in part && part.input !== undefined && (
        <Section tone="in">{JSON.stringify(part.input, null, 2)}</Section>
      )}

      {part.state === "output-available" && <Section tone="ok">{renderOutput()}</Section>}
      {part.state === "output-error" && <Section tone="err">{part.errorText}</Section>}
    </div>
  );
}
