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
import { Trash2, Pencil, Search, Loader2, Users } from "lucide-react"

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Paciente = {
  id: string
  nome_completo: string
  modalidade_pagamento: string
  dia_vencimento: number
  status: string
}

type StatusPossivel = "Ativo" | "Inativo" | "Alta"

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

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ListaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null)

  // IDs dos pacientes com operações pendentes
  const [deletandoId, setDeletandoId] = useState<string | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)

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
          className={`mx-6 mt-4 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
            mensagem.tipo === "sucesso"
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
  )
}