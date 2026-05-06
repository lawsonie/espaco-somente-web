import { CalendarDays } from "lucide-react"

export const metadata = {
  title: "Agenda | Espaço Só Mente",
  description: "Gestão de horários e sessões da clínica.",
}

export default function AgendaPage() {
  return (
    <div className="p-6 lg:p-8 flex flex-col h-[calc(100vh-4rem)] min-h-[600px]">
      <div className="mb-6 flex items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-[#5FA199]" />
            Agenda Inteligente
          </h1>
          <p className="mt-1 text-muted-foreground">
            Visualize e gerencie os horários das sessões diretamente pelo Google Calendar.
          </p>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-border shadow-sm overflow-hidden p-2">
        <iframe
          src="https://calendar.google.com/calendar/embed?src=espacosomente73%40gmail.com&ctz=America%2FSao_Paulo"
          style={{ border: 0, width: "100%", height: "100%", borderRadius: "0.5rem" }}
          frameBorder="0"
          scrolling="yes"
          title="Google Calendar Clínica"
        ></iframe>
      </div>
    </div>
  )
}
