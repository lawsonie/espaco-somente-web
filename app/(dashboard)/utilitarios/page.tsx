"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  ClipboardList,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react"


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
    editUrl: "https://docs.google.com/forms/u/3/",
  },
  {
    id: "anamnese-crianca",
    label: "Anamnese Criança / Adolescente",
    description: "Formulário Google para pacientes infantojuvenis.",
    url: "https://forms.gle/TpP37XHUwmWenrSe7",
    editUrl: "https://docs.google.com/forms/u/3/",
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

      {/* Mesa de Trabalho — largura total */}
      <div className="flex flex-col gap-6">

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

          {/* ── Bloco 2: Hub de Formulários (Anamnese) ────────── */}
          <section className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-3 border-b border-border px-6 py-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/20">
                <ClipboardList className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-card-foreground">
                  Hub de Formulários (Anamnese)
                </h2>
                <p className="text-xs text-muted-foreground">
                  Copie o link para o paciente ou acesse as respostas
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
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(f.id, f.url)}
                        title="Copiar link para enviar ao paciente"
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold shadow-sm transition-all active:scale-95 ${
                          isCopied
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        Copiar
                      </button>

                      <a
                        href={f.editUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir painel de respostas no Google Forms"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground active:scale-95"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Respostas
                      </a>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
      </div>
    </main>
  )
}
