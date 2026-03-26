'use client';
import React, { useState } from 'react';
import { FileText, Download, User, CheckCircle } from 'lucide-react';

export default function ContratosPage() {
    const [pacienteSelecionado, setPacienteSelecionado] = useState('');

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="text-teal-600" size={32} />
                    Emissão de Contratos
                </h1>
                <p className="text-slate-500 mt-2">Selecione um paciente para preencher automaticamente o contrato.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex items-end gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                        <User size={16} /> Vincular Paciente
                    </label>
                    <select
                        className="w-full border border-slate-300 rounded-lg p-3 bg-slate-50"
                        value={pacienteSelecionado}
                        onChange={(e) => setPacienteSelecionado(e.target.value)}
                    >
                        <option value="">Selecione um paciente...</option>
                        <option value="1">João da Silva (CPF: 111.222.333-44)</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-200 p-8 rounded-xl flex justify-center overflow-x-auto">
                <div className="bg-white w-[210mm] min-h-[297mm] shadow-md p-12 text-slate-800 text-justify font-serif text-sm">
                    <h2 className="text-center font-bold text-xl mb-8 uppercase">Contrato de Prestação de Serviços</h2>
                    <p className="mb-4">Pelo presente instrumento particular, de um lado <strong>ESPAÇO SÓ MENTE</strong>...</p>

                    <div className="bg-teal-50/50 p-6 rounded-lg border border-teal-100 mb-6 mt-6">
                        <p className="mb-2"><strong>PACIENTE:</strong> {pacienteSelecionado ? "João da Silva" : "_______________________"}</p>
                        <p><strong>CPF:</strong> {pacienteSelecionado ? "111.222.333-44" : "_______________________"}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}