"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function FormularioPaciente() {
    // 1. Estados (memória temporária) para guardar o que o usuário digita
    const [nome, setNome] = useState("")
    const [cpf, setCpf] = useState("")
    const [telefone, setTelefone] = useState("")
    const [email, setEmail] = useState("")
    const [cep, setCep] = useState("")
    const [endereco, setEndereco] = useState("")
    const [modalidade, setModalidade] = useState("Sessão Avulsa")
    const [diaVencimento, setDiaVencimento] = useState("10")

    // Estado para controlar o carregamento e mensagens
    const [loading, setLoading] = useState(false)
    const [mensagem, setMensagem] = useState("")

    // 2. Função que é disparada ao clicar em "Salvar"
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault() // Impede a página de recarregar (padrão do HTML antigo)
        setLoading(true)
        setMensagem("")

        // 3. A mágica da Engenharia Reversa: Inserindo no Supabase!
        // Lembra do insert_paciente() no Python? Aqui fazemos com supabase.from().insert()
        const { error } = await supabase
            .from("pacientes")
            .insert([
                {
                    nome_completo: nome,
                    cpf: cpf,
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
            setMensagem("❌ Erro ao salvar o paciente. Tente novamente.")
        } else {
            setMensagem("✅ Paciente salvo com sucesso no Cofre!")
            // Limpa os campos após salvar
            setNome("")
            setCpf("")
            setTelefone("")
            setEmail("")
            setCep("")
            setEndereco("")
        }

        setLoading(false)
    }

    // 4. O Visual (HTML/Tailwind)
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                            type="text"
                            value={cpf}
                            onChange={(e) => setCpf(e.target.value)}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#5FA199]"
                            placeholder="000.000.000-00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                        <input
                            type="text"
                            value={telefone}
                            onChange={(e) => setTelefone(e.target.value)}
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                        <input
                            type="text"
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
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
                    disabled={loading}
                    className="w-full bg-[#E6B54A] hover:bg-[#d4a33e] text-black font-semibold py-2 px-4 rounded-md transition-colors mt-4 disabled:opacity-50"
                >
                    {loading ? "Salvando..." : "Salvar Paciente"}
                </button>

                {/* Mostra a mensagem de sucesso ou erro */}
                {mensagem && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-md text-center text-sm font-medium">
                        {mensagem}
                    </div>
                )}
            </form>
        </div>
    )
}