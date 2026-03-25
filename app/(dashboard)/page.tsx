import Link from "next/link"
import { Users, Calendar, Bell, UserPlus, Link2, Sparkles } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-6 lg:p-8 space-y-8">

      {/* Header de boas-vindas */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">
          Centro de Operações 🏥
        </h1>
        <p className="mt-1 text-muted-foreground">
          Acompanhe o dia a dia da clínica em tempo real.
        </p>
      </div>

      {/* Grid de Métricas Operacionais */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Resumo do Dia
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Card: Sessões Hoje */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
            <div className="rounded-lg bg-primary/10 p-3">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sessões Hoje</p>
              <p className="text-3xl font-bold text-foreground mt-1">8</p>
              <p className="text-xs text-muted-foreground mt-0.5">agendadas</p>
            </div>
          </div>

          {/* Card: Pacientes Ativos */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
            <div className="rounded-lg bg-teal-500/10 p-3">
              <Users className="h-6 w-6 text-teal-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pacientes Ativos</p>
              <p className="text-3xl font-bold text-foreground mt-1">142</p>
              <p className="text-xs text-muted-foreground mt-0.5">ativos</p>
            </div>
          </div>

          {/* Card: Avisos e Pendências */}
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex items-start gap-4">
            <div className="rounded-lg bg-amber-500/10 p-3">
              <Bell className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avisos e Pendências</p>
              <p className="text-3xl font-bold text-foreground mt-1">3</p>
              <p className="text-xs text-muted-foreground mt-0.5">anamneses pendentes</p>
            </div>
          </div>

        </div>
      </section>

      {/* Ações Rápidas */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Ações Rápidas
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {/* Ação: Novo Paciente */}
          <Link
            href="/pacientes"
            className="group rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-primary hover:shadow-md transition-all duration-200"
          >
            <div className="rounded-full bg-primary/10 p-4 group-hover:bg-primary/20 transition-colors">
              <UserPlus className="h-7 w-7 text-primary" />
            </div>
            <span className="font-semibold text-foreground">Novo Paciente</span>
            <span className="text-xs text-muted-foreground">Cadastre um novo paciente na clínica</span>
          </Link>

          {/* Ação: Central de Links e Forms */}
          <Link
            href="/links"
            className="group rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-sky-500 hover:shadow-md transition-all duration-200"
          >
            <div className="rounded-full bg-sky-500/10 p-4 group-hover:bg-sky-500/20 transition-colors">
              <Link2 className="h-7 w-7 text-sky-500" />
            </div>
            <span className="font-semibold text-foreground">Central de Links e Forms</span>
            <span className="text-xs text-muted-foreground">Acesse formulários e links rápidos</span>
          </Link>

          {/* Ação: Assistente IA */}
          <Link
            href="/ia"
            className="group rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center gap-3 text-center hover:border-violet-500 hover:shadow-md transition-all duration-200"
          >
            <div className="rounded-full bg-violet-500/10 p-4 group-hover:bg-violet-500/20 transition-colors">
              <Sparkles className="h-7 w-7 text-violet-500" />
            </div>
            <span className="font-semibold text-foreground">Assistente IA</span>
            <span className="text-xs text-muted-foreground text-violet-400/80">Inteligência para apoiar sua clínica</span>
          </Link>

        </div>
      </section>

    </div>
  )
}
