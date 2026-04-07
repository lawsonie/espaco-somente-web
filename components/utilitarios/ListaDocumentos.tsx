'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    FileText,
    Download,
    ExternalLink,
    Loader2,
    FolderOpen,
    AlertCircle,
    RefreshCw,
    Trash2,
} from 'lucide-react'

// ─── Tipos ────────────────────────────────────────────────────────────────────

/**
 * As pastas (prefixos) no bucket correspondem às categorias do MescladorContabil.
 * Tabs exibidas → pasta buscada no Storage.
 */
type Aba = 'Recorrentes' | 'Extratos' | 'Eventuais'

/** Mapa de aba → pasta (prefixo) no bucket documentos_contabeis */
const PASTA_POR_ABA: Record<Aba, string> = {
    Recorrentes: 'Comprovantes Recorrentes',
    Extratos: 'Extratos',
    Eventuais: 'Compras Eventuais',
}

/** Ícone / emoji exibido em cada aba */
const EMOJI_POR_ABA: Record<Aba, string> = {
    Recorrentes: '🔄',
    Extratos: '📄',
    Eventuais: '🛍️',
}

interface ArquivoStorage {
    /** Nome do arquivo dentro da pasta */
    name: string
    /** Caminho completo: pasta/nome */
    path: string
    /** Data de criação retornada pelo Supabase */
    criadoEm: Date | null
    /** Tamanho em bytes (pode ser 0 para pastas – filtramos) */
    tamanho: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Formata uma data para o padrão brasileiro: "18/03/2026 às 14:35" */
function formatarDataBR(data: Date): string {
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

/** Formata bytes para exibição amigável */
function formatarBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Hook: busca arquivos de uma aba ─────────────────────────────────────────

function useArquivos(aba: Aba) {
    const supabase = createClient()
    const [arquivos, setArquivos] = useState<ArquivoStorage[]>([])
    const [carregando, setCarregando] = useState(false)
    const [erro, setErro] = useState<string | null>(null)

    const buscar = useCallback(async () => {
        setCarregando(true)
        setErro(null)

        const pasta = PASTA_POR_ABA[aba]

        const { data, error } = await supabase.storage
            .from('documentos_contabeis')
            .list(pasta, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'created_at', order: 'desc' },
            })

        if (error) {
            setErro(error.message)
            setCarregando(false)
            return
        }

        // Filtra itens que são arquivos reais (tamanho > 0)
        const arquivosReais: ArquivoStorage[] = (data ?? [])
            .filter((item) => ((item.metadata?.size as number) ?? 0) > 0)
            .map((item) => ({
                name: item.name,
                path: `${pasta}/${item.name}`,
                criadoEm: item.created_at ? new Date(item.created_at) : null,
                tamanho: item.metadata?.size ?? 0,
            }))

        setArquivos(arquivosReais)
        setCarregando(false)
    }, [aba])

    useEffect(() => {
        buscar()
    }, [buscar])

    return { arquivos, carregando, erro, recarregar: buscar }
}

// ─── Sub-componente: linha de cada arquivo ────────────────────────────────────

interface LinhaArquivoProps {
    arquivo: ArquivoStorage
    recarregar: () => void
}

function LinhaArquivo({ arquivo, recarregar }: LinhaArquivoProps) {
    const supabase = createClient()
    const [baixando, setBaixando] = useState(false)
    const [excluindo, setExcluindo] = useState(false)

    // ── Download / Visualizar ────────────────────────────────────────────────
    const handleAcao = async (modo: 'download' | 'visualizar') => {
        setBaixando(true)
        try {
            // Passa { download: true } no modo download para o Supabase injetar
            // 'Content-Disposition: attachment', forçando o navegador a baixar.
            const { data, error } = await supabase.storage
                .from('documentos_contabeis')
                .createSignedUrl(
                    arquivo.path,
                    60,
                    modo === 'download' ? { download: true } : undefined
                )

            if (error || !data?.signedUrl) {
                console.error('Erro ao gerar link:', error?.message)
                alert('Não foi possível gerar o link. Tente novamente.')
                return
            }

            // Em ambos os modos abrimos via window.open;
            // o header Content-Disposition é quem decide download vs. inline.
            window.open(data.signedUrl, '_blank', 'noopener,noreferrer')
        } finally {
            setBaixando(false)
        }
    }

    // ── Excluir ─────────────────────────────────────────────────────────────
    const handleExcluir = async () => {
        const confirmado = window.confirm(
            'Tem certeza que deseja excluir este documento permanentemente?'
        )
        if (!confirmado) return

        setExcluindo(true)
        try {
            const { error } = await supabase.storage
                .from('documentos_contabeis')
                .remove([arquivo.path])

            if (error) {
                console.error('Erro ao excluir:', error.message)
                alert('Não foi possível excluir o arquivo. Tente novamente.')
                return
            }

            recarregar()
        } finally {
            setExcluindo(false)
        }
    }

    const ocupado = baixando || excluindo

    return (
        <li className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:gap-4">
            {/* Ícone + informações */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/10">
                    <FileText className="h-4 w-4 text-rose-500" />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                        {arquivo.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {arquivo.criadoEm
                            ? formatarDataBR(arquivo.criadoEm)
                            : 'Data desconhecida'}
                        {arquivo.tamanho > 0 && (
                            <>
                                {' · '}
                                <Badge
                                    variant="secondary"
                                    className="ml-0.5 px-1.5 py-0 text-[10px] align-middle"
                                >
                                    {formatarBytes(arquivo.tamanho)}
                                </Badge>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Botões de ação */}
            <div className="flex shrink-0 gap-2">
                {/* Visualizar */}
                <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleAcao('visualizar')}
                    disabled={ocupado}
                    aria-label={`Visualizar ${arquivo.name}`}
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Visualizar
                </Button>

                {/* Download */}
                <Button
                    size="sm"
                    className="gap-1.5 text-xs"
                    onClick={() => handleAcao('download')}
                    disabled={ocupado}
                    aria-label={`Baixar ${arquivo.name}`}
                >
                    {baixando ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Download className="h-3.5 w-3.5" />
                    )}
                    Download
                </Button>

                {/* Excluir */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={handleExcluir}
                    disabled={ocupado}
                    aria-label={`Excluir ${arquivo.name}`}
                >
                    {excluindo ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                    )}
                    Excluir
                </Button>
            </div>
        </li>
    )
}

// ─── Sub-componente: conteúdo de uma aba ─────────────────────────────────────

function ConteudoAba({ aba }: { aba: Aba }) {
    const { arquivos, carregando, erro, recarregar } = useArquivos(aba)

    // Estado: carregando
    if (carregando) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm">Buscando arquivos…</p>
            </div>
        )
    }

    // Estado: erro
    if (erro) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <div>
                    <p className="text-sm font-medium text-destructive">Erro ao carregar arquivos</p>
                    <p className="mt-1 text-xs text-muted-foreground">{erro}</p>
                </div>
                <Button variant="outline" size="sm" className="gap-2 mt-1" onClick={recarregar}>
                    <RefreshCw className="h-3.5 w-3.5" />
                    Tentar novamente
                </Button>
            </div>
        )
    }

    // Estado: vazio
    if (arquivos.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                <FolderOpen className="h-10 w-10 opacity-40" />
                <div>
                    <p className="text-sm font-medium">Pasta vazia</p>
                    <p className="mt-1 text-xs opacity-70">
                        Nenhum documento encontrado em{' '}
                        <span className="font-semibold">{PASTA_POR_ABA[aba]}</span>.
                    </p>
                </div>
            </div>
        )
    }

    // Lista de arquivos
    return (
        <div className="space-y-2">
            {/* Cabeçalho da lista */}
            <div className="flex items-center justify-between px-1">
                <p className="text-xs text-muted-foreground">
                    {arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''} encontrado
                    {arquivos.length !== 1 ? 's' : ''}
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                    onClick={recarregar}
                >
                    <RefreshCw className="h-3 w-3" />
                    Atualizar
                </Button>
            </div>

            {/* Itens */}
            <ul className="divide-y divide-border/50 rounded-lg border border-border/50 bg-muted/10">
                {arquivos.map((arq) => (
                    <LinhaArquivo key={arq.path} arquivo={arq} recarregar={recarregar} />
                ))}
            </ul>
        </div>
    )
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function ListaDocumentos() {
    const ABAS: Aba[] = ['Recorrentes', 'Extratos', 'Eventuais']

    return (
        <Card className="w-full shadow-lg border-border/60">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Documentos Enviados</CardTitle>
                        <CardDescription>
                            Visualize e baixe os PDFs mesclados salvos no repositório contábil.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="Recorrentes">
                    {/* Navegação por abas */}
                    <TabsList className="mb-4 w-full">
                        {ABAS.map((aba) => (
                            <TabsTrigger key={aba} value={aba} className="flex-1 gap-1.5">
                                <span>{EMOJI_POR_ABA[aba]}</span>
                                {aba}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Conteúdo de cada aba */}
                    {ABAS.map((aba) => (
                        <TabsContent key={aba} value={aba}>
                            <ConteudoAba aba={aba} />
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    )
}
