"use client"

import { useState } from "react"
import {
  User,
  Baby,
  FileText,
  ShieldCheck,
  Receipt,
  Download,
  Link2,
  Copy,
  Check,
  MessageCircle,
} from "lucide-react"

// --- Data ---

const anamneseForms = [
  {
    title: "Anamnese Adulto",
    description: "Formulário padrão para pacientes adultos.",
    icon: User,
    url: "https://forms.gle/TZgVocekgtnSgmax9",
    whatsappMessage:
      "Olá! Por favor, preencha o nosso formulário de anamnese adulto acessando este link: https://forms.gle/TZgVocekgtnSgmax9",
  },
  {
    title: "Anamnese Criança/Adolescente",
    description: "Formulário adaptado para o público infantil/juvenil.",
    icon: Baby,
    url: "https://forms.gle/TpP37XHUwmWenrSe7",
    whatsappMessage:
      "Olá! Por favor, preencha o nosso formulário de anamnese infantil acessando este link: https://forms.gle/TpP37XHUwmWenrSe7",
  },
]

const documentTemplates = [
  {
    title: "Contrato Padrão",
    description: "Modelo de contrato de prestação de serviços terapêuticos.",
    icon: FileText,
  },
  {
    title: "Termo de Consentimento",
    description: "Documento de consentimento informado para o paciente.",
    icon: ShieldCheck,
  },
  {
    title: "Recibo Manual",
    description: "Modelo de recibo para pagamentos avulsos.",
    icon: Receipt,
  },
]

// --- Sub-component: Anamnese Card ---

function AnamneseCard({
  title,
  description,
  icon: Icon,
  url,
  whatsappMessage,
}: (typeof anamneseForms)[0]) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const whatsappHref = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappMessage)}`

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mb-1 font-semibold text-card-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-green-500">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copiar Link
            </>
          )}
        </button>

        {/* WhatsApp button */}
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </a>
      </div>
    </div>
  )
}

// --- Page Component ---

export default function LinksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-10 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Link2 className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Central de Recursos
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Envie formulários diretamente para os pacientes via link ou WhatsApp.
          </p>
        </div>
      </div>

      {/* Section 1: Anamnese Forms */}
      <section className="mb-10">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Formulários de Anamnese
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            Despacho Rápido
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {anamneseForms.map((form) => (
            <AnamneseCard key={form.title} {...form} />
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="mb-10 border-t border-border" />

      {/* Section 2: Document Templates */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Download className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">
            Acervo de Modelos
          </h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            Downloads
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {documentTemplates.map((doc) => (
            <a
              key={doc.title}
              href="#"
              download
              className="group relative flex flex-col rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md"
            >
              <Download className="absolute right-4 top-4 h-4 w-4 text-muted-foreground/50 transition-colors group-hover:text-primary" />

              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <doc.icon className="h-5 w-5" />
              </div>

              <h3 className="mb-1 font-semibold text-card-foreground">
                {doc.title}
              </h3>
              <p className="text-sm text-muted-foreground">{doc.description}</p>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  Em breve
                </span>
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
