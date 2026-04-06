"use client"

import { useState } from "react"
import FormularioPaciente from "@/components/pacientes/FormularioPaciente"
import ListaPacientes from "@/components/pacientes/ListaPacientes"

export default function PaginaGestaoPacientes() {
    const [refreshKey, setRefreshKey] = useState(0)

    function handlePacienteSalvo() {
        setRefreshKey((k) => k + 1)
    }

    return (
        <main className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                    Gestão de Pacientes
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Cadastre novos pacientes e gerencie o histórico da clínica "Espaço Só Mente".
                </p>
            </div>

            <div className="flex flex-col gap-10 max-w-5xl">
                {/* Área de Cadastro */}
                <section>
                    <FormularioPaciente onPacienteSalvo={handlePacienteSalvo} />
                </section>

                {/* Tabela de Gestão com Busca, Edição e Exclusão */}
                <section>
                    <ListaPacientes refreshKey={refreshKey} />
                </section>
            </div>
        </main>
    )
}
