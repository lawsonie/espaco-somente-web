"use client"

import { useChat, type Message } from "@ai-sdk/react"
import { useEffect, useRef } from "react"
import { Bot, Send, Loader2 } from "lucide-react"

// ─── Welcome message shown in the UI only (not sent to the AI) ───────────────
const WELCOME_MESSAGE = "Olá! Sou o Assistente Concierge. Posso ajudar você a localizar documentos, links e a usar as plataformas parceiras."

export function ChatConcierge() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat", onError: (err) => console.error("[ChatConcierge]", err),
      streamProtocol: 'text', // <-- ISSO AQUI É O SEGREDO
    });

  // Auto-scroll to the latest message
  const bottomRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <aside className="lg:col-span-1 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden" style={{ height: "min(640px, 80vh)" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3 shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground leading-tight">
            Agente Concierge
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight">
            Assistente da Mesa de Trabalho
          </p>
        </div>
        {/* Live indicator */}
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-600">Online</span>
        </span>
      </div>

      {/* ── Message Area ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scroll-smooth">

        {/* Static welcome bubble */}
        <AssistantBubble text={WELCOME_MESSAGE} />

        {/* Dynamic conversation */}
        {messages.map((m: Message) =>
          m.role === "user" ? (
            <UserBubble key={m.id} text={typeof m.content === "string" ? m.content : ""} />
          ) : (
            <AssistantBubble key={m.id} text={typeof m.content === "string" ? m.content : ""} />
          )
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex items-end gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
              <Bot className="h-3 w-3 text-primary" />
            </div>
            <div className="rounded-xl rounded-bl-sm bg-muted px-3 py-2">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Input Area ─────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-border px-3 py-3 shrink-0 bg-background/50"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Como posso ajudar?"
          disabled={isLoading}
          className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50 disabled:opacity-50 transition"
        />
        <button
          type="submit"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Enviar mensagem"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="shrink-0 px-4 py-2 bg-destructive/10 border-t border-destructive/20">
          <p className="text-[11px] text-destructive leading-snug">
            ⚠️ Erro ao conectar com o assistente. Tente novamente.
          </p>
        </div>
      )}
    </aside>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
        <Bot className="h-3 w-3 text-primary" />
      </div>
      <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-muted px-3 py-2">
        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2">
        <p className="text-xs text-primary-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}
