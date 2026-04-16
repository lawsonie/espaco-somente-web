"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createClient } from '@/lib/supabase/client'
import { Wallet, TrendingDown, Clock, Plus, CheckCircle2, Loader2, Trash2, RotateCcw, Archive } from "lucide-react"
import MescladorContabil from "@/components/utilitarios/MescladorContabil"
import ListaDocumentos from "@/components/utilitarios/ListaDocumentos"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type RegistroFinanceiro = {
  id: string
  paciente_id: string
  tipo: string
  data_vencimento: string
  valor: number
  status_pagamento: string
  pacientes: {
    nome_completo: string
  } | null
}

type Paciente = {
  id: string
  nome_completo: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
      : "bg-amber-100 text-amber-800 border-amber-200"
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status}
    </span>
  )
}

// ─── Formulário inicial ────────────────────────────────────────────────────────

const formInicial = {
  paciente_id: "",
  valor: "",
  data_vencimento: "",
  tipo: "",
}

// ─── Página (Client Component) ────────────────────────────────────────────────

export default function PaginaFinanceiro() {
  const supabase = createClient()
  const [lista, setLista] = useState<RegistroFinanceiro[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [form, setForm] = useState(formInicial)
  const [salvando, setSalvando] = useState(false)
  const [baixandoId, setBaixandoId] = useState<string | null>(null)
  const [erroForm, setErroForm] = useState("")
  const [deletandoId, setDeletandoId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [desfazendoId, setDesfazendoId] = useState<string | null>(null)

  // ─── Busca registros financeiros ─────────────────────────────────────────────

  const buscarRegistros = useCallback(async () => {
    setCarregando(true)
    const { data } = await supabase
      .from("financeiro")
      .select("*, pacientes(nome_completo)")
      .order("data_vencimento", { ascending: false })
    setLista((data as RegistroFinanceiro[]) ?? [])
    setCarregando(false)
  }, [])

  // ─── Busca pacientes ativos para o select ─────────────────────────────────

  const buscarPacientes = useCallback(async () => {
    const { data } = await supabase
      .from("pacientes")
      .select("id, nome_completo")
      .eq("status", "Ativo")
      .order("nome_completo")
    setPacientes((data as Paciente[]) ?? [])
  }, [])

  useEffect(() => {
    buscarRegistros()
    buscarPacientes()
  }, [buscarRegistros, buscarPacientes])

  // ─── Métricas calculadas ──────────────────────────────────────────────────

  const totalRecebido = lista
    .filter((r) => r.status_pagamento.toLowerCase() === "pago")
    .reduce((acc, r) => acc + r.valor, 0)

  const totalAtrasado = lista
    .filter((r) => r.status_pagamento.toLowerCase() === "atrasado")
    .reduce((acc, r) => acc + r.valor, 0)

  const totalPendente = lista
    .filter((r) => r.status_pagamento.toLowerCase() === "pendente")
    .reduce((acc, r) => acc + r.valor, 0)

  // ─── Criar nova cobrança ──────────────────────────────────────────────────

  async function handleSalvar() {
    setErroForm("")

    if (!form.paciente_id || !form.valor || !form.data_vencimento || !form.tipo) {
      setErroForm("Preencha todos os campos antes de salvar.")
      return
    }

    const valorNumerico = parseFloat(form.valor.replace(",", "."))
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      setErroForm("Informe um valor numérico válido.")
      return
    }

    setSalvando(true)
    const { error } = await supabase.from("financeiro").insert({
      paciente_id: form.paciente_id,
      valor: valorNumerico,
      data_vencimento: form.data_vencimento,
      tipo: form.tipo,
      status_pagamento: "Pendente",
    })

    setSalvando(false)

    if (error) {
      setErroForm("Erro ao salvar. Tente novamente.")
      console.error(error)
      return
    }

    setModalAberto(false)
    setForm(formInicial)
    buscarRegistros()
  }

  // ─── Dar Baixa (marcar como Pago) ────────────────────────────────────────

  async function handleDarBaixa(id: string) {
    setBaixandoId(id)
    const { error } = await supabase
      .from("financeiro")
      .update({ status_pagamento: "Pago" })
      .eq("id", id)

    if (!error) {
      await buscarRegistros()
    } else {
      console.error(error)
    }
    setBaixandoId(null)
  }

  // ─── Desfazer Baixa (reverter para Pendente) ────────────────────────────

  async function handleDesfazerBaixa(id: string) {
    setDesfazendoId(id)
    const { error } = await supabase
      .from("financeiro")
      .update({ status_pagamento: "Pendente" })
      .eq("id", id)

    if (!error) {
      await buscarRegistros()
    } else {
      console.error(error)
    }
    setDesfazendoId(null)
  }

  // ─── Deletar cobrança ─────────────────────────────────────────────────────

  async function handleDeletar(id: string) {
    setDeletandoId(id)
    const { error } = await supabase
      .from("financeiro")
      .delete()
      .eq("id", id)

    if (!error) {
      await buscarRegistros()
    } else {
      console.error(error)
    }
    setDeletandoId(null)
    setConfirmDeleteId(null)
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 lg:p-8">
      {/* Cabeçalho */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Gestão Financeira
          </h1>
          <p className="mt-1 text-muted-foreground">
            Acompanhe cobranças, recebimentos e inadimplência da clínica.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm(formInicial)
            setErroForm("")
            setModalAberto(true)
          }}
          className="shrink-0 bg-[#5FA199] hover:bg-[#4d8a83] text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Cobrança
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">

        {/* Total Recebido */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Recebido
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {carregando ? "—" : formatarMoeda(totalRecebido)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Pagamentos com status &quot;Pago&quot;
            </p>
          </CardContent>
        </Card>

        {/* Inadimplência */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Inadimplência (Atrasados)
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {carregando ? "—" : formatarMoeda(totalAtrasado)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cobranças em atraso
            </p>
          </CardContent>
        </Card>

        {/* A Receber */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber (Pendentes)
            </CardTitle>
            <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {carregando ? "—" : formatarMoeda(totalPendente)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cobranças pendentes de pagamento
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Tabela Principal */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
          <Wallet className="w-5 h-5 text-[#5FA199]" />
          <h2 className="text-base font-bold text-gray-800">
            Lançamentos Financeiros
          </h2>
          <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
            {lista.length}
          </span>
        </div>

        {carregando ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#5FA199] animate-spin" />
          </div>
        ) : lista.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="w-12 h-12 text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">
              Nenhum registro financeiro encontrado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 hover:bg-gray-50">
                  <TableHead className="font-semibold text-gray-600 w-[25%]">
                    Nome do Paciente
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Tipo de Cobrança
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">
                    Data de Vencimento
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">
                    Valor (R$)
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">
                    Status
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-center">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lista.map((reg) => {
                  const statusLower = reg.status_pagamento.toLowerCase()
                  const podeDarBaixa =
                    statusLower === "pendente" || statusLower === "atrasado"
                  return (
                    <TableRow
                      key={reg.id}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-800">
                        {reg.pacientes?.nome_completo ?? (
                          <span className="text-gray-400 italic font-normal">
                            Paciente removido
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-500 text-sm">
                        {reg.tipo}
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500">
                        {formatarData(reg.data_vencimento)}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-gray-800">
                        {formatarMoeda(reg.valor)}
                      </TableCell>
                      <TableCell className="text-center">
                        <BadgeStatusPagamento status={reg.status_pagamento} />
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {podeDarBaixa ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDarBaixa(reg.id)}
                              disabled={baixandoId === reg.id}
                              title="Dar Baixa — marcar como Pago"
                              className="gap-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              {baixandoId === reg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">Dar Baixa</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDesfazerBaixa(reg.id)}
                              disabled={desfazendoId === reg.id}
                              title="Desfazer Baixa — reverter para Pendente"
                              className="gap-1.5 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
                            >
                              {desfazendoId === reg.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">Desfazer</span>
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setConfirmDeleteId(reg.id)}
                            disabled={deletandoId === reg.id}
                            title="Excluir cobrança"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            {deletandoId === reg.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* ─── Modal: Nova Cobrança ─────────────────────────────────────────────── */}
      <Dialog open={modalAberto} onOpenChange={setModalAberto}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-gray-800">
              <Plus className="h-5 w-5 text-[#5FA199]" />
              Nova Cobrança
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">

            {/* Paciente */}
            <div className="grid gap-1.5">
              <Label htmlFor="paciente" className="text-sm font-medium text-gray-700">
                Paciente
              </Label>
              <Select
                value={form.paciente_id}
                onValueChange={(v) => setForm((f) => ({ ...f, paciente_id: v }))}
              >
                <SelectTrigger id="paciente" className="w-full">
                  <SelectValue placeholder="Selecione um paciente ativo" />
                </SelectTrigger>
                <SelectContent>
                  {pacientes.length === 0 ? (
                    <SelectItem value="__nenhum__" disabled>
                      Nenhum paciente ativo encontrado
                    </SelectItem>
                  ) : (
                    pacientes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome_completo}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Valor */}
            <div className="grid gap-1.5">
              <Label htmlFor="valor" className="text-sm font-medium text-gray-700">
                Valor (R$)
              </Label>
              <Input
                id="valor"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 350.00"
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              />
            </div>

            {/* Data de Vencimento */}
            <div className="grid gap-1.5">
              <Label htmlFor="vencimento" className="text-sm font-medium text-gray-700">
                Data de Vencimento
              </Label>
              <Input
                id="vencimento"
                type="date"
                value={form.data_vencimento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, data_vencimento: e.target.value }))
                }
              />
            </div>

            {/* Tipo */}
            <div className="grid gap-1.5">
              <Label htmlFor="tipo" className="text-sm font-medium text-gray-700">
                Tipo de Cobrança
              </Label>
              <Select
                value={form.tipo}
                onValueChange={(v) => setForm((f) => ({ ...f, tipo: v }))}
              >
                <SelectTrigger id="tipo" className="w-full">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pacote Mensal">Pacote Mensal</SelectItem>
                  <SelectItem value="Avulso">Avulso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Erro */}
            {erroForm && (
              <p className="text-sm text-red-500 -mt-1">{erroForm}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="outline" disabled={salvando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={handleSalvar}
              disabled={salvando}
              className="bg-[#5FA199] hover:bg-[#4d8a83] text-white gap-2"
            >
              {salvando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {salvando ? "Salvando…" : "Salvar Cobrança"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── AlertDialog: Confirmar Exclusão ──────────────────────────────────── */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteId(null) }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cobrança?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta cobrança? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletandoId !== null}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDeleteId && handleDeletar(confirmDeleteId)}
              disabled={deletandoId !== null}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletandoId !== null ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : null}
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Seção: Utilitários Contábeis ──────────────────────────────────────── */}
      <div className="mt-10">
        <hr className="border-gray-100 mb-8" />

        {/* Cabeçalho da seção */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5FA199]/10">
            <Archive className="h-5 w-5 text-[#5FA199]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Utilitários Contábeis</h2>
            <p className="text-sm text-muted-foreground">
              Mescle e gerencie documentos enviados ao contador.
            </p>
          </div>
        </div>

        {/* Grid dos dois componentes */}
        <div className="grid gap-6 lg:grid-cols-2">
          <MescladorContabil />
          <ListaDocumentos />
        </div>
      </div>
    </div>
  )
}
