"use client"

import React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  ClipboardList,
  Brain,
  Briefcase,
  Settings,
  Menu,
  X,
  Wallet,
  LayoutDashboard,
} from "lucide-react"
import { useState } from "react"

interface NavItem {
  id: string
  name: string
  href: string
  icon: React.ElementType
  subtitle?: string
}

const navigation: NavItem[] = [
  { id: "dashboard", name: "Início", href: "/", icon: LayoutDashboard, subtitle: "Visão geral" },
  { id: "pacientes", name: "Gestão de Pacientes", href: "/pacientes", icon: Users, subtitle: "O Cofre offline" },
  { id: "financeiro", name: "Gestão Financeira", href: "/financeiro", icon: Wallet, subtitle: "Cobranças e recebimentos" },
  { id: "testes", name: "Plataforma de Testes", href: "/testes", icon: ClipboardList },
  { id: "ia", name: "IA Assistente", href: "/ia-assistente", icon: Brain, subtitle: "Revisão e ABNT" },
  { id: "utilitarios", name: "Mesa de Trabalho", href: "/utilitarios", icon: Briefcase, subtitle: "Templates, Formulários e Testes" },
  { id: "config", name: "Configurações", href: "/configuracoes", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Mobile menu button */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar transition-transform duration-300 ease-in-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo area */}
        <Link href="/" className="flex flex-col items-center px-6 pt-8 pb-6 group">
          <div className="bg-white p-2 rounded-lg shadow-sm mb-2 inline-block transition-transform duration-200 group-hover:scale-105">
            <img
              src="/logo_ESM.png"
              alt="Logótipo Espaço Só Mente"
              className="h-20 w-auto"
            />
          </div>
          <span className="text-xs font-medium uppercase tracking-wider text-sidebar-foreground/70 group-hover:text-sidebar-foreground transition-colors">
            Espaço Só Mente
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive ? "text-secondary" : "text-sidebar-foreground/70 group-hover:text-secondary"
                  )}
                />
                <div className="flex flex-col">
                  <span>{item.name}</span>
                  {item.subtitle && (
                    <span className="text-[10px] text-sidebar-foreground/50">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-center text-xs text-sidebar-foreground/50">
            © 2026 Espaço Só Mente
          </p>
        </div>
      </aside>
    </>
  )
}
