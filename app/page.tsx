import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { StatsCard } from "@/components/dashboard/stats-card"
import { Users, AlertTriangle, FolderArchive } from "lucide-react"
import { supabase } from "@/lib/supabase"

export default async function Dashboard() {
  // Fetch server-side: conta pacientes com status = 'Ativo'
  const { count: pacientesAtivos } = await supabase
    .from("pacientes")
    .select("*", { count: "exact", head: true })
    .eq("status", "Ativo")

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar />

        {/* Page content */}
        <main className="p-6 lg:p-8">
          {/* Welcome section */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground text-balance">
              Olá, Psicóloga
            </h1>
            <p className="mt-1 text-muted-foreground">
              Bem-vinda ao seu painel de gestão. Aqui está um resumo do seu dia.
            </p>
          </div>


          {/* Stats cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatsCard
              title="Pacientes Ativos"
              value={pacientesAtivos ?? 0}
              icon={Users}
              description="Pacientes com status ativo"
            />
            <StatsCard
              title="Pendências Vetor/Hogrefe"
              value={3}
              icon={AlertTriangle}
              description="Testes travados online"
              variant="warning"
            />
            <StatsCard
              title="Gavetas Contábeis"
              value={12}
              icon={FolderArchive}
              description="Arquivos guardados neste mês"
            />
          </div>

          {/* Placeholder area */}
          <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
            <p className="text-muted-foreground">
              Área reservada para futuros módulos e visualizações
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
