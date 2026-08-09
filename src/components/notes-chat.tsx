"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { friendlyApiError, parseApiResponse } from "@/lib/parse-api-response";
import type { NotesChatMessage, NotesChatResponse } from "@/types/course";

interface NotesChatProps {
  mapId: string;
  focusModuleId?: string | null;
  focusModuleTitle?: string;
}

const STARTERS = [
  "Where in my notes is this explained?",
  "Extract the key formulas / definitions.",
  "Rewrite this topic more clearly.",
  "Elaborate on the parts that feel incomplete.",
];

export function NotesChat({
  mapId,
  focusModuleId,
  focusModuleTitle,
}: NotesChatProps) {
  const [messages, setMessages] = useState<NotesChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const message = text.trim();
    if (!message || loading) return;

    const nextHistory = [...messages, { role: "user" as const, content: message }];
    setMessages(nextHistory);
    setDraft("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mapId,
          message,
          history: nextHistory.slice(0, -1),
          focusModuleId: focusModuleId || undefined,
        }),
      });
      const json = await parseApiResponse<NotesChatResponse>(res);
      if (!res.ok || !json.success || !json.reply) {
        throw new Error(json.error ?? "Could not get a reply.");
      }
      setMessages([...nextHistory, { role: "assistant", content: json.reply }]);
    } catch (err) {
      setError(
        friendlyApiError(err instanceof Error ? err.message : "Chat failed.")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="glass-strong mt-6 flex min-h-[520px] flex-col overflow-hidden rounded-3xl">
      <div className="border-b border-white/50 px-5 py-4">
        <h3 className="text-base font-extrabold">Notes assistant</h3>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">
          Ask it to find something in your notes, extract info, rewrite, or
          elaborate
          {focusModuleTitle ? ` · focused on ${focusModuleTitle}` : ""}.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && !loading && (
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((starter) => (
              <button
                key={starter}
                type="button"
                onClick={() => void send(starter)}
                className="glass-pill rounded-full px-3 py-2 text-left text-xs font-bold text-muted-foreground transition-colors hover:text-foreground"
              >
                {starter}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={`${msg.role}-${i}`}
            className={`max-w-[90%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed ${
              msg.role === "user"
                ? "ml-auto bg-primary/15 text-foreground"
                : "bg-white/50 text-foreground/90"
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <p className="text-xs font-bold text-muted-foreground">Thinking…</p>
        )}
        {error && (
          <p className="text-xs font-semibold text-red-500">{error}</p>
        )}
        <div ref={bottomRef} />
      </div>

      <form
        className="flex gap-2 border-t border-white/50 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void send(draft);
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about your notes…"
          className="glass-soft h-11 flex-1 rounded-2xl px-4 text-sm font-medium outline-none"
        />
        <button
          type="submit"
          disabled={loading || draft.trim().length < 2}
          className="glass-button inline-flex h-11 w-11 items-center justify-center rounded-2xl text-primary-foreground disabled:opacity-50"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
