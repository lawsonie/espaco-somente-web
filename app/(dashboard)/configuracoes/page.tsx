"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Sun,
  Moon,
  Building2,
  IdCard,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react"

// Dados mockados — substituir por persistência futura
const DADOS_PROFISSIONAIS = {
  consultorio: "Espaço Só Mente",
  crp: "06/12345-X",
  validadeCertidao: "2026-12-31",
}

export default function ConfiguracoesPage() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Evita hydration mismatch com next-themes
  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = resolvedTheme === "dark"

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light")
  }

  // Formata data ISO para pt-BR
  const formatarData = (iso: string) => {
    const [ano, mes, dia] = iso.split("-")
    return `${dia}/${mes}/${ano}`
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Configurações
            </h1>
            <p className="text-sm text-muted-foreground">
              Preferências do sistema e dados profissionais
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ── Seção 1: Preferências do Sistema ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Preferências do Sistema
          </h2>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {mounted && isDark ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-primary" />
                )}
                Aparência
              </CardTitle>
              <CardDescription>
                Escolha entre o modo claro e escuro para a interface.
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <Label
                      htmlFor="theme-toggle"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Tema Escuro
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {mounted
                        ? isDark
                          ? "Interface em modo escuro ativada"
                          : "Interface em modo claro ativada"
                        : "Carregando..."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {mounted && (
                    <Badge
                      variant={isDark ? "default" : "outline"}
                      className="text-[10px] h-5 transition-all duration-200"
                    >
                      {isDark ? "Escuro" : "Claro"}
                    </Badge>
                  )}
                  <Switch
                    id="theme-toggle"
                    checked={mounted ? isDark : false}
                    onCheckedChange={handleThemeToggle}
                    disabled={!mounted}
                    aria-label="Alternar tema claro/escuro"
                  />
                  <Moon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── Seção 2: Dados Profissionais ── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Dados Profissionais
          </h2>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                Informações do Consultório
              </CardTitle>
              <CardDescription>
                Dados fixos da operação. Edição via banco de dados em versão
                futura.
              </CardDescription>
            </CardHeader>

            <Separator />

            <CardContent className="pt-5 space-y-5">
              {/* Nome do Consultório */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="nome-consultorio"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Nome do Consultório
                </Label>
                <Input
                  id="nome-consultorio"
                  value={DADOS_PROFISSIONAIS.consultorio}
                  readOnly
                  className="bg-muted/50 text-foreground font-medium cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* CRP */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="crp"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <IdCard className="h-3.5 w-3.5 text-muted-foreground" />
                  Registro Profissional (CRP)
                </Label>
                <Input
                  id="crp"
                  value={DADOS_PROFISSIONAIS.crp}
                  readOnly
                  className="bg-muted/50 text-foreground font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Validade da Certidão */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="validade-certidao"
                  className="text-sm font-medium flex items-center gap-1.5"
                >
                  <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  Validade da Certidão de Regularidade
                </Label>
                <div className="relative">
                  <Input
                    id="validade-certidao"
                    value={formatarData(DADOS_PROFISSIONAIS.validadeCertidao)}
                    readOnly
                    className="bg-muted/50 text-foreground font-mono cursor-default focus-visible:ring-0 focus-visible:ring-offset-0 pr-28"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center">
                    <Badge
                      variant="outline"
                      className="text-[10px] h-5 text-emerald-600 border-emerald-500/40 bg-emerald-500/10"
                    >
                      <ShieldCheck className="h-3 w-3 mr-1" />
                      Regular
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mantenha a certidão do CFP/CRP sempre atualizada para fins
                  de compliance e faturamento de planos.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Rodapé informativo */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          Espaço Só Mente · Painel de Gestão v1.0 · Dados apenas visuais nesta
          versão
        </p>
      </div>
    </div>
  )
}
