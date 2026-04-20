import { Sidebar } from "@/components/dashboard/sidebar"
import { Topbar } from "@/components/dashboard/topbar"
import { GlobalConcierge } from "@/components/concierge/global-concierge"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar fixa à esquerda */}
      <Sidebar />

      {/* Área principal: TopBar + conteúdo dinâmico */}
      <div className="flex flex-1 flex-col lg:pl-64 overflow-hidden">
        {/* TopBar sticky no topo */}
        <Topbar />

        {/* Conteúdo da página (children) com scroll independente */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
      <GlobalConcierge />
    </div>
  )
}
