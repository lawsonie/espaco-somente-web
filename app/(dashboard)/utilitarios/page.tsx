"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  ClipboardList,
  Copy,
  Check,
  Monitor,
  ExternalLink,
} from "lucide-react"
import { ChatConcierge } from "@/components/dashboard/chat-concierge"

// ─── Data ────────────────────────────────────────────────────────────────────

const templates = [
  {
    id: "contrato-psicoterapia",
    label: "Contrato de Psicoterapia Individual",
    description: "Modelo oficial em .docx para preenchimento manual.",
    href: "/templates/contrato-psicoterapia.docx",
    filename: "contrato-psicoterapia.docx",
  },
  {
    id: "contrato-neuropsicologia",
    label: "Contrato de Avaliação Neuropsicológica",
    description: "Modelo oficial em .docx para preenchimento manual.",
    href: "/templates/contrato-neuropsicologia.docx",
    filename: "contrato-neuropsicologia.docx",
  },
]

const formularios = [
  {
    id: "anamnese-adulto",
    label: "Anamnese Adulto",
    description: "Formulário Google para novos pacientes adultos.",
    url: "https://forms.gle/TZgVocekgtnSgmax9",
  },
  {
    id: "anamnese-crianca",
    label: "Anamnese Criança / Adolescente",
    description: "Formulário Google para pacientes infantojuvenis.",
    url: "https://forms.gle/TpP37XHUwmWenrSe7",
  },
]

const plataformas = [
  {
    id: "vetor",
    label: "Vetor Online",
    description: "Sistema de aplicação e correção de testes psicológicos.",
    href: "https://vol.vetoreditora.com.br/",
  },
  {
    id: "hogrefe",
    label: "Hogrefe",
    description: "Plataforma de testes e instrumentos neuropsicológicos.",
    href: "https://www.hogrefe.com.br/",
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function MesaDeTrabalho() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  function handleCopy(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  return (
    <main className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Mesa de Trabalho</h1>
        <p className="mt-1 text-muted-foreground">
          Acesso rápido a templates, formulários e plataformas profissionais.
        </p>
      </div>

      {/* Two-column grid: main content + Agente Concierge placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">

        {/* ── Main Content (3/4) ─────────────────────────────────────────── */}
        <div className="lg:col-span-3 flex flex-col gap-6">

          {/* ── Bloco 1: Cofre de Templates ──────────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-card-foreground">
                  Cofre de Templates
                </h2>
                <p className="text-xs text-muted-foreground">
                  Arquivos oficiais para download e preenchimento manual
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {templates.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{t.label}</p>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                  <a
                    href={t.href}
                    download={t.filename}
                    className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-95 shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* ── Bloco 2: Central de Atendimento ─────────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/20">
                <ClipboardList className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-card-foreground">
                  Central de Atendimento
                </h2>
                <p className="text-xs text-muted-foreground">
                  Copie o link do formulário e envie pelo WhatsApp
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {formularios.map((f) => {
                const isCopied = copiedId === f.id
                return (
                  <li
                    key={f.id}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{f.label}</p>
                      <p className="text-xs text-muted-foreground">{f.description}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(f.id, f.url)}
                      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 shrink-0 ${
                        isCopied
                          ? "bg-green-500 text-white"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {isCopied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copiar Link
                        </>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>

          {/* ── Bloco 3: Plataformas Profissionais ──────────────────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                <Monitor className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-card-foreground">
                  Plataformas Profissionais
                </h2>
                <p className="text-xs text-muted-foreground">
                  Acesso direto aos sistemas de testes externos
                </p>
              </div>
            </div>

            <ul className="divide-y divide-border">
              {plataformas.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                  <a
                    href={p.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95 shrink-0"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Abrir
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ── Agente Concierge (1/4) ────────────────────────────────────── */}
        <ChatConcierge />

      </div>
    </main>
  )
}
