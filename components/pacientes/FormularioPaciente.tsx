"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { formatCPF, formatPhone, formatCEP } from "@/lib/utils"

type Props = {
    onPacienteSalvo?: () => void
}

export default function FormularioPaciente({ onPacienteSalvo }: Props) {
    const supabase = createClient()
    const [nome, setNome] = useState("")
    const [cpf, setCpf] = useState("")
    const [telefone, setTelefone] = useState("")
    const [email, setEmail] = useState("")
    const [cep, setCep] = useState("")
    const [endereco, setEndereco] = useState("")
    const [modalidade, setModalidade] = useState("Sessão Avulsa")
    const [diaVencimento, setDiaVencimento] = useState("10")

    const [loading, setLoading] = useState(false)
    const [mensagem, setMensagem] = useState("")

    // Validação básica: garante que o utilizador preencheu as máscaras até ao fim
    const isFormValid =
        nome.length > 2 &&
        cpf.length === 14 &&
        telefone.length >= 14 &&
        cep.length === 9;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isFormValid) return; // Segurança extra

        setLoading(true)
        setMensagem("")

        const cpfLimpo = cpf.replace(/\D/g, '')

        const { error } = await supabase
            .from("pacientes")
            .insert([
                {
                    nome_completo: nome,
                    cpf: cpfLimpo,
                    telefone: telefone,
                    email: email,
                    cep: cep,
                    endereco: endereco,
                    modalidade_pagamento: modalidade,
                    dia_vencimento: parseInt(diaVencimento),
                    status: "Ativo"
                }
            ])

        if (error) {
            console.error("Erro ao salvar:", error)
            setMensagem("Erro ao salvar o paciente. Tente novamente.")
        } else {
            setMensagem("Paciente salvo com sucesso no Cofre!")
            setNome("")
            setCpf("")
            setTelefone("")
            setEmail("")
            setCep("")
            setEndereco("")
            setModalidade("Sessão Avulsa")
            setDiaVencimento("10")

            onPacienteSalvo?.()
        }
        setLoading(false)
    }

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-xl">
            <h2 className="text-xl font-bold text-[#5FA199] mb-4">➕ Novo Cadastro</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input
                        type="text"
                        required
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                        placeholder="Nome do paciente"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
                        <input
                            type="text"
                            required
                            value={cpf}
                            onChange={(e) => setCpf(formatCPF(e.target.value))} // <-- Máscara aqui
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
                        <input
                            type="text"
                            required
                            value={telefone}
                            onChange={(e) => setTelefone(formatPhone(e.target.value))} // <-- Máscara aqui
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                            placeholder="(00) 90000-0000"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                        placeholder="paciente@email.com"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP *</label>
                        <input
                            type="text"
                            required
                            value={cep}
                            onChange={(e) => setCep(formatCEP(e.target.value))} // <-- Máscara aqui
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                            placeholder="00000-000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                        <input
                            type="text"
                            value={endereco}
                            onChange={(e) => setEndereco(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                            placeholder="Rua, número, bairro"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                        <select
                            value={modalidade}
                            onChange={(e) => setModalidade(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                        >
                            <option>Sessão Avulsa</option>
                            <option>Pacote Mensal</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento (Dia)</label>
                        <input
                            type="number"
                            min="1" max="31"
                            value={diaVencimento}
                            onChange={(e) => setDiaVencimento(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !isFormValid} // Botão bloqueado se a validação falhar
                    className="w-full bg-[#E6B54A] hover:bg-[#d4a33e] text-black font-semibold py-2 px-4 rounded-md transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? "Salvando..." : "Salvar Paciente"}
                </button>

                {mensagem && (
                    <div className={`mt-4 p-3 rounded-md text-center text-sm font-medium ${mensagem.includes("Erro") ? "bg-red-50 text-red-600" : "bg-teal-50 text-teal-600"}`}>
                        {mensagem}
                    </div>
                )}
            </form>
        </div>
    )
}