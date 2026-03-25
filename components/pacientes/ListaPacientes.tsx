"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Trash2, Pencil, Search, Loader2, Users, Eye, Phone, MapPin, CreditCard, Copy, Check, MessageCircle, DollarSign } from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Paciente = {
  id: string
  nome_completo: string
  modalidade_pagamento: string
  dia_vencimento: number
  status: string
  cpf: string | null
  email: string | null
  cep: string | null
  endereco: string | null
  telefone: string | null
}

type StatusPossivel = "Ativo" | "Inativo" | "Alta"

// ─── Tipos Financeiros ────────────────────────────────────────────────────────

type RegistroFinanceiro = {
  id: string
  valor: number
  data_vencimento: string
  status_pagamento: string
  tipo: string
}

const STATUS_OPTIONS: StatusPossivel[] = ["Ativo", "Inativo", "Alta"]

// ─── Helpers de UI ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    Ativo: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Inativo: "bg-amber-100 text-amber-800 border-amber-200",
    Alta: "bg-sky-100 text-sky-800 border-sky-200",
  }
  const cls = variants[status] ?? "bg-gray-100 text-gray-700 border-gray-200"
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  )
}

// ─── Modal de Edição de Dados ─────────────────────────────────────────────────

type ModalEditarProps = {
  paciente: Paciente | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onSalvo: (atualizado: Paciente) => void
}

function ModalEditarPaciente({ paciente, open, onOpenChange, onSalvo }: ModalEditarProps) {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState("")
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  // Preenche os campos toda vez que o paciente muda ou o modal abre
  useEffect(() => {
    if (paciente && open) {
      setNome(paciente.nome_completo ?? "")
      setEmail(paciente.email ?? "")
      setTelefone(paciente.telefone ?? "")
      setCep(paciente.cep ?? "")
      setEndereco(paciente.endereco ?? "")
      setErro(null)
    }
  }, [paciente, open])

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!paciente) return
    setSalvando(true)
    setErro(null)

    const { data, error } = await supabase
      .from("pacientes")
      .update({
        nome_completo: nome,
        email: email || null,
        telefone: telefone || null,
        cep: cep || null,
        endereco: endereco || null,
      })
      .eq("id", paciente.id)
      .select()
      .single()

    setSalvando(false)

    if (error) {
      setErro(`Erro ao salvar: ${error.message}`)
    } else if (data) {
      onSalvo(data as Paciente)
      onOpenChange(false)
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5FA199]"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-[#5FA199] flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Editar Dados do Paciente
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSalvar} className="space-y-4 py-2">
          {/* Nome */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-nome" className="text-sm font-medium text-gray-700">
              Nome Completo *
            </Label>
            <input
              id="edit-nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className={inputClass}
              placeholder="Nome do paciente"
            />
          </div>

          {/* E-mail */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-email" className="text-sm font-medium text-gray-700">
              E-mail
            </Label>
            <input
              id="edit-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="paciente@email.com"
            />
          </div>

          {/* Telefone */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="edit-telefone" className="text-sm font-medium text-gray-700">
              WhatsApp / Telefone
            </Label>
            <input
              id="edit-telefone"
              type="text"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className={inputClass}
              placeholder="(00) 90000-0000"
            />
          </div>

          {/* CEP + Endereço */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-cep" className="text-sm font-medium text-gray-700">
                CEP
              </Label>
              <input
                id="edit-cep"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                className={inputClass}
                placeholder="00000-000"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-endereco" className="text-sm font-medium text-gray-700">
                Logradouro
              </Label>
              <input
                id="edit-endereco"
                type="text"
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
                className={inputClass}
                placeholder="Rua, número, bairro"
              />
            </div>
          </div>

          {/* Erro */}
          {erro && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              ❌ {erro}
            </p>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={salvando}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={salvando}
              className="bg-[#5FA199] hover:bg-[#4d8880] text-white"
            >
              {salvando ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "💾 Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Ficha Lateral do Paciente ────────────────────────────────────────────────

// ─── Helpers de formatação financeira ────────────────────────────────────────

function formatarMoeda(valor: number) {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function formatarData(data: string) {
  const [ano, mes, dia] = data.split("-")
  return `${dia}/${mes}/${ano}`
}

function BadgeStatusPagamento({ status }: { status: string }) {
  const s = status.toLowerCase()
  const cls =
    s === "pago"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : s === "atrasado"
      ? "bg-red-100 text-red-800 border-red-200"
      : "bg-amber-100 text-amber-800 border-amber-200" // pendente / outros
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  )
}

// ─── Ficha Lateral do Paciente ────────────────────────────────────────────────

function FichaPaciente({
  paciente,
  open,
  onOpenChange,
  onEditarDados,
}: {
  paciente: Paciente | null
  open: boolean
  onOpenChange: (v: boolean) => void
  onEditarDados: () => void
}) {
  // Controla qual campo acabou de ser copiado ("cpf" | "cep" | null)
  const [copiado, setCopiado] = useState<"cpf" | "cep" | null>(null)

  // Histórico financeiro do paciente
  const [historico, setHistorico] = useState<RegistroFinanceiro[]>([])
  const [loadingHistorico, setLoadingHistorico] = useState(false)

  // Busca registros financeiros toda vez que o Sheet abre com um paciente selecionado
  useEffect(() => {
    if (!open || !paciente) return
    setHistorico([])
    setLoadingHistorico(true)

    supabase
      .from("financeiro")
      .select("id, valor, data_vencimento, status_pagamento, tipo")
      .eq("paciente_id", paciente.id)
      .order("data_vencimento", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setHistorico(data as RegistroFinanceiro[])
        setLoadingHistorico(false)
      })
  }, [open, paciente])

  if (!paciente) return null

  async function copiar(campo: "cpf" | "cep", valor: string | null) {
    if (!valor) return
    await navigator.clipboard.writeText(valor)
    setCopiado(campo)
    setTimeout(() => setCopiado(null), 2000)
  }

  function abrirWhatsApp(telefone: string | null) {
    if (!telefone) return
    let numeroTratado: string
    if (telefone.trimStart().startsWith("+")) {
      // Internacional: remove tudo que não for dígito (inclusive o +)
      numeroTratado = telefone.replace(/\D/g, "")
    } else {
      // Nacional: remove não-dígitos e adiciona DDI do Brasil
      numeroTratado = "55" + telefone.replace(/\D/g, "")
    }
    window.open(`https://wa.me/${numeroTratado}`, "_blank")
  }

  // Item simples (sem botão de cópia)
  const infoItem = (label: string, value: string | null) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
      <span className="text-sm text-gray-800 font-medium">
        {value ?? <span className="text-gray-400 italic font-normal">Não informado</span>}
      </span>
    </div>
  )

  // Item com botão de cópia ao lado do valor
  const infoItemCopiavel = (label: string, value: string | null, campo: "cpf" | "cep") => (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm text-gray-800 font-medium">
          {value ?? <span className="text-gray-400 italic font-normal">Não informado</span>}
        </span>
        {value && (
          <button
            onClick={() => copiar(campo, value)}
            title={`Copiar ${label}`}
            className="inline-flex items-center justify-center h-6 w-6 rounded text-gray-400 hover:text-[#5FA199] hover:bg-[#5FA199]/10 transition-colors"
          >
            {copiado === campo ? (
              <Check className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-0 p-0 overflow-y-auto">

        {/* Cabeçalho colorido */}
        <div className="bg-[#5FA199] px-6 pt-8 pb-6">
          <SheetHeader>
            <SheetTitle className="text-white text-xl font-bold leading-tight">
              {paciente.nome_completo}
            </SheetTitle>
            <SheetDescription className="mt-2 flex items-center gap-0">
              <StatusBadge status={paciente.status} />
            </SheetDescription>
          </SheetHeader>

          {/* Botão Editar Dados */}
          <Button
            onClick={onEditarDados}
            size="sm"
            variant="outline"
            className="mt-4 gap-1.5 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Editar Dados
          </Button>
        </div>

        {/* Corpo da ficha */}
        <div className="flex flex-col gap-6 px-6 py-6">

          {/* Seção: Informações de Contato */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Phone className="w-4 h-4 text-[#5FA199]" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Contato
              </h3>
            </div>
            <div className="flex flex-col gap-4 pl-6 border-l-2 border-[#5FA199]/20">
              {/* Telefone + botão WhatsApp */}
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-400">Telefone</span>
                <span className="text-sm text-gray-800 font-medium">
                  {paciente.telefone ?? <span className="text-gray-400 italic font-normal">Não informado</span>}
                </span>
                {paciente.telefone && (
                  <Button
                    onClick={() => abrirWhatsApp(paciente.telefone)}
                    size="sm"
                    className="mt-1 w-fit gap-1.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-semibold shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chamar no WhatsApp
                  </Button>
                )}
              </div>
              {infoItem("E-mail", paciente.email)}
              {infoItemCopiavel("CPF", paciente.cpf, "cpf")}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* Seção: Endereço */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#5FA199]" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Endereço
              </h3>
            </div>
            <div className="flex flex-col gap-4 pl-6 border-l-2 border-[#5FA199]/20">
              {infoItem("Logradouro", paciente.endereco)}
              {infoItemCopiavel("CEP", paciente.cep, "cep")}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* Seção: Financeiro – dados do cadastro */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-[#5FA199]" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Financeiro
              </h3>
            </div>
            <div className="flex flex-col gap-4 pl-6 border-l-2 border-[#5FA199]/20">
              {infoItem("Modalidade de Pagamento", paciente.modalidade_pagamento)}
              {infoItem("Dia de Vencimento", `Dia ${paciente.dia_vencimento}`)}
            </div>
          </section>

          <div className="border-t border-gray-100" />

          {/* Seção: Histórico Financeiro */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-[#5FA199]" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Histórico Financeiro
              </h3>
            </div>

            {loadingHistorico ? (
              <div className="flex items-center gap-2 pl-6 text-[#5FA199]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Carregando...</span>
              </div>
            ) : historico.length === 0 ? (
              <p className="pl-6 text-sm text-gray-400 italic">
                Nenhum registro financeiro encontrado para este paciente.
              </p>
            ) : (
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      <th className="px-3 py-2 text-left">Tipo</th>
                      <th className="px-3 py-2 text-left">Vencimento</th>
                      <th className="px-3 py-2 text-right">Valor</th>
                      <th className="px-3 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {historico.map((reg) => (
                      <tr key={reg.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-3 py-2.5 text-gray-700 font-medium">{reg.tipo}</td>
                        <td className="px-3 py-2.5 text-gray-500">{formatarData(reg.data_vencimento)}</td>
                        <td className="px-3 py-2.5 text-right font-semibold text-gray-800">
                          {formatarMoeda(reg.valor)}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <BadgeStatusPagamento status={reg.status_pagamento} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)

  // IDs dos pacientes com operações pendentes
  const [deletandoId, setDeletandoId] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

  // Ficha lateral
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null)
  const [fichaAberta, setFichaAberta] = useState(false)

  // Modal de edição de dados
  const [modalEditarAberto, setModalEditarAberto] = useState(false)

  // ── Busca inicial ──────────────────────────────────────────────────────────

  useEffect(() => {
    buscarPacientes()
  }, [])

  async function buscarPacientes() {
    setLoading(true)
    const { data, error } = await supabase
      .from("pacientes")
      .select("*")
      .order("criado_em", { ascending: false })

    if (error) {
      exibirMensagem("erro", "Não foi possível carregar os pacientes.")
    } else if (data) {
      setPacientes(data as Paciente[])
    }
    setLoading(false)
  }

  // ── Helpers de feedback ───────────────────────────────────────────────────

  function exibirMensagem(tipo: "sucesso" | "erro", texto: string) {
    setMensagem({ tipo, texto })
    setTimeout(() => setMensagem(null), 4000)
  }

  // ── Abrir ficha ───────────────────────────────────────────────────────────

  function abrirFicha(paciente: Paciente) {
    setPacienteSelecionado(paciente)
    setFichaAberta(true)
  }

  // ── Salvar edição de dados ─────────────────────────────────────────────────

  function handleDadosSalvos(atualizado: Paciente) {
    // Atualiza a lista da tabela
    setPacientes((prev) =>
      prev.map((p) => (p.id === atualizado.id ? atualizado : p))
    )
    // Atualiza os dados exibidos na ficha lateral
    setPacienteSelecionado(atualizado)
    exibirMensagem("sucesso", `Dados de "${atualizado.nome_completo}" atualizados com sucesso.`)
  }

  // ── Exclusão ──────────────────────────────────────────────────────────────

  async function handleDelete(paciente: Paciente) {
    const confirmado = window.confirm(
      `Tem certeza que deseja remover "${paciente.nome_completo}"?`
    )
    if (!confirmado) return

    setDeletandoId(paciente.id)

    const { error } = await supabase
      .from("pacientes")
      .delete()
      .eq("id", paciente.id)

    if (error) {
      exibirMensagem("erro", `Erro ao remover: ${error.message}`)
    } else {
      setPacientes((prev) => prev.filter((p) => p.id !== paciente.id))
      exibirMensagem("sucesso", `"${paciente.nome_completo}" removido com sucesso.`)
    }

    setDeletandoId(null)
  }

  // ── Edição de Status ──────────────────────────────────────────────────────

  async function handleStatusChange(paciente: Paciente, novoStatus: StatusPossivel) {
    if (novoStatus === paciente.status) return

    setEditandoId(paciente.id)

    const { error } = await supabase
      .from("pacientes")
      .update({ status: novoStatus })
      .eq("id", paciente.id)

    if (error) {
      exibirMensagem("erro", `Erro ao atualizar status: ${error.message}`)
    } else {
      setPacientes((prev) =>
        prev.map((p) => (p.id === paciente.id ? { ...p, status: novoStatus } : p))
      )
      exibirMensagem("sucesso", `Status de "${paciente.nome_completo}" atualizado para ${novoStatus}.`)
    }

    setEditandoId(null)
  }

  // ── Filtragem local por busca ─────────────────────────────────────────────

  const pacientesFiltrados = pacientes.filter((p) =>
    p.nome_completo.toLowerCase().includes(busca.toLowerCase())
  )

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-8 overflow-hidden">

        {/* Cabeçalho do Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#5FA199]" />
            <h2 className="text-xl font-bold text-gray-800">Gestão de Pacientes</h2>
            <Badge variant="secondary" className="ml-1">
              {pacientesFiltrados.length}
            </Badge>
          </div>

          {/* Barra de Busca */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Buscar por nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        {/* Banner de Mensagem */}
        {mensagem && (
          <div
            className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium transition-all ${mensagem.tipo === "sucesso"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
              }`}
          >
            {mensagem.tipo === "sucesso" ? "✅ " : "❌ "}
            {mensagem.texto}
          </div>
        )}

        {/* Corpo da Tabela */}
        <div className="p-6 pt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-[#5FA199]">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm font-medium">Carregando pacientes...</span>
            </div>
          ) : pacientesFiltrados.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {busca ? `Nenhum resultado para "${busca}"` : "Nenhum paciente cadastrado."}
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-600 w-[35%]">Nome</TableHead>
                    <TableHead className="font-semibold text-gray-600">Modalidade</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-center">Vencimento</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-center">Status</TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pacientesFiltrados.map((paciente) => (
                    <TableRow
                      key={paciente.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      {/* Nome */}
                      <TableCell className="font-medium text-gray-800">
                        {paciente.nome_completo}
                      </TableCell>

                      {/* Modalidade */}
                      <TableCell className="text-gray-500 text-sm">
                        {paciente.modalidade_pagamento}
                      </TableCell>

                      {/* Vencimento */}
                      <TableCell className="text-center text-sm text-gray-500">
                        Dia {paciente.dia_vencimento}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <StatusBadge status={paciente.status} />
                      </TableCell>

                      {/* Ações */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">

                          {/* Botão Ver Detalhes */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-[#5FA199] hover:bg-[#5FA199]/10"
                            onClick={() => abrirFicha(paciente)}
                            title="Ver ficha do paciente"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>

                          {/* Botão Editar Status */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-400 hover:text-[#5FA199] hover:bg-[#5FA199]/10"
                                disabled={editandoId === paciente.id || deletandoId === paciente.id}
                                title="Alterar status"
                              >
                                {editandoId === paciente.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Pencil className="w-4 h-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuLabel className="text-xs text-gray-500">
                                Alterar Status
                              </DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuRadioGroup
                                value={paciente.status}
                                onValueChange={(val) =>
                                  handleStatusChange(paciente, val as StatusPossivel)
                                }
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <DropdownMenuRadioItem key={s} value={s}>
                                    {s}
                                  </DropdownMenuRadioItem>
                                ))}
                              </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>

                          {/* Botão Deletar */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(paciente)}
                            disabled={deletandoId === paciente.id || editandoId === paciente.id}
                            title="Remover paciente"
                          >
                            {deletandoId === paciente.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {/* Ficha Lateral */}
      <FichaPaciente
        paciente={pacienteSelecionado}
        open={fichaAberta}
        onOpenChange={setFichaAberta}
        onEditarDados={() => setModalEditarAberto(true)}
      />

      {/* Modal de Edição de Dados */}
      <ModalEditarPaciente
        paciente={pacienteSelecionado}
        open={modalEditarAberto}
        onOpenChange={setModalEditarAberto}
        onSalvo={handleDadosSalvos}
      />
    </>
  )
}