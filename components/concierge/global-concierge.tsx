"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bot, Send, Loader2, X } from "lucide-react"

// ─── Types ─────────────────────────────────────────────────────────────────────
type Message = { id: string; role: "user" | "assistant"; content: string }

const WELCOME_MESSAGE =
  "Olá! Sou o Agente Concierge da clínica. Posso ajudar a localizar documentos, links e a usar as plataformas parceiras."

// ─── Main Component ────────────────────────────────────────────────────────────
export function GlobalConcierge() {
  const router = useRouter()

  const [isOpen, setIsOpen]     = useState(false)
  const [texto, setTexto]       = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    if (isOpen) window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [isOpen])

  // ── Send ──────────────────────────────────────────────────────────────────────
  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim() || isLoading) return

    // 1. Add user message locally
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: texto.trim(),
    }
    const history = [...messages, userMsg]
    setMessages(history)
    setTexto("")
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: data.text },
      ])
    } catch {
      setError("Erro ao conectar com o assistente. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agente Concierge"
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2
          flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden
          transition-all duration-200
          ${isOpen
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
          }`}
        style={{ maxHeight: "80vh" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-5 py-4 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Bot className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-card-foreground leading-tight">Agente Concierge</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Assistente da Clínica</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 mr-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-medium text-emerald-600">Online</span>
          </span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Fechar concierge"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 scroll-smooth min-h-0">
          <AssistantBubble text={WELCOME_MESSAGE} />

          {messages.map((m) => {
            if (m.role === "user") {
              return <UserBubble key={m.id} text={m.content} />
            }

            // assistant — tenta interpretar payload JSON estruturado
            try {
              const obj = JSON.parse(m.content) as {
                mensagem: string
                rota?: string | null
                label?: string | null
                color?: "emerald" | "blue" | "violet" | null
              }

              // Mapeia o campo `color` vindo da IA para classes Tailwind concretas
              const btnClass = {
                blue:    "bg-blue-600 hover:bg-blue-700",
                violet:  "bg-violet-600 hover:bg-violet-700",
                emerald: "bg-emerald-600 hover:bg-emerald-700",
              }[obj.color ?? "emerald"] ?? "bg-emerald-600 hover:bg-emerald-700"

              return (
                <div key={m.id}>
                  <AssistantBubble text={obj.mensagem} />
                  {obj.rota && obj.label && (
                    <div className="ml-8 mt-1.5">
                      <button
                        onClick={() => { setIsOpen(false); router.push(obj.rota!) }}
                        className={`rounded-lg px-4 py-1.5 text-xs font-medium text-white transition-all active:scale-95 ${btnClass}`}
                      >
                        {obj.label}
                      </button>
                    </div>
                  )}
                </div>
              )
            } catch {
              // fallback: texto simples (comportamento anterior)
              return <AssistantBubble key={m.id} text={m.content} />
            }
          })}

          {isLoading && messages.at(-1)?.role !== "assistant" && (
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

        {/* Error */}
        {error && (
          <div className="shrink-0 px-5 py-2 bg-destructive/10 border-t border-destructive/20">
            <p className="text-[11px] text-destructive leading-snug">⚠️ {error}</p>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 border-t border-border px-4 py-3 shrink-0 bg-background/60"
        >
          <input
            id="concierge-input"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Como posso ajudar?"
            disabled={isLoading}
            autoComplete="off"
            className="flex-1 rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 transition"
          />
          <button
            type="submit"
            disabled={isLoading || texto.trim().length === 0}
            aria-label="Enviar mensagem"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* FAB */}
      <button
        id="concierge-fab"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Fechar Agente Concierge" : "Abrir Agente Concierge"}
        title="Agente Concierge"
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg
          transition-all duration-200 hover:scale-105 active:scale-95
          ${isOpen
            ? "bg-muted text-muted-foreground"
            : "bg-primary text-primary-foreground hover:shadow-xl hover:shadow-primary/30"
          }`}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <span className="relative flex h-full w-full items-center justify-center">
            <Bot className="h-6 w-6" />
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-20" />
          </span>
        )}
      </button>
    </>
  )
}

// ─── Bubbles ───────────────────────────────────────────────────────────────────

function AssistantBubble({ text }: { text: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 shrink-0">
        <Bot className="h-3 w-3 text-primary" />
      </div>
      <div className="max-w-[85%] rounded-xl rounded-bl-sm bg-muted px-3 py-2">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}

function UserBubble({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] rounded-xl rounded-br-sm bg-primary px-3 py-2">
        <p className="text-sm text-primary-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  )
}
