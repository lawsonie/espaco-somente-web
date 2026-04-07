'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { PDFDocument } from 'pdf-lib'
import { createClient } from '@/lib/supabase/client'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    FileText,
    ImageIcon,
    Upload,
    X,
    CheckCircle2,
    Loader2,
    FolderOpen,
    FilePlus2,
} from 'lucide-react'

// ─── Tipos ───────────────────────────────────────────────────────────────────

type Categoria = 'Comprovantes Recorrentes' | 'Extratos' | 'Compras Eventuais'

type StatusUpload = 'idle' | 'processando' | 'enviando' | 'sucesso' | 'erro'

interface ArquivoSelecionado {
    file: File
    id: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Gera um ID único simples */
function gerarId(): string {
    return Math.random().toString(36).slice(2, 9)
}

/** Formata bytes para exibição amigável */
function formatarBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Resolve o nome do mês em português a partir de um Date */
function nomeMesPortugues(data: Date): string {
    return data.toLocaleDateString('pt-BR', { month: 'long' })
}

/**
 * Gera o caminho final do arquivo para o Storage.
 * Formato: "Categoria/mes_ano_SUFIXO.pdf"
 * Exemplo: "Comprovantes Recorrentes/marco_2026_A3F9X.pdf"
 *
 * A categoria é usada LITERALMENTE (com espaços e maiúsculas) como pasta virtual,
 * garantindo que o arquivo entre na subpasta correta do bucket.
 */
function gerarNomeArquivo(categoria: Categoria): string {
    const agora = new Date()
    const mes = nomeMesPortugues(agora)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // remove acentos
        .toLowerCase()
    const ano = agora.getFullYear()
    const sufixo = Math.random().toString(36).slice(2, 7).toUpperCase()
    // A pasta é a categoria exata; o nome do arquivo usa underlines para legibilidade
    return `${categoria}/${mes}_${ano}_${sufixo}.pdf`
}

// ─── Lógica de mesclagem com pdf-lib ─────────────────────────────────────────

/**
 * Converte um File de imagem (jpg/png) para um ArrayBuffer,
 * depois embute numa página A4 do PDFDocument de destino.
 */
async function embedImagem(
    pdfDoc: PDFDocument,
    file: File
): Promise<void> {
    const bytes = await file.arrayBuffer()
    const isJpg =
        file.type === 'image/jpeg' || file.name.toLowerCase().endsWith('.jpg') || file.name.toLowerCase().endsWith('.jpeg')

    const imagem = isJpg
        ? await pdfDoc.embedJpg(bytes)
        : await pdfDoc.embedPng(bytes)

    // Dimensões A4 em pontos (72 dpi): 595.28 x 841.89
    const larguraA4 = 595.28
    const alturaA4 = 841.89
    const margem = 40

    const areaUtil = { largura: larguraA4 - margem * 2, altura: alturaA4 - margem * 2 }

    // Escala mantendo proporção
    const escalaX = areaUtil.largura / imagem.width
    const escalaY = areaUtil.altura / imagem.height
    const escala = Math.min(escalaX, escalaY, 1) // nunca ampliar

    const imgFinal = { largura: imagem.width * escala, altura: imagem.height * escala }

    // Centraliza
    const x = margem + (areaUtil.largura - imgFinal.largura) / 2
    const y = margem + (areaUtil.altura - imgFinal.altura) / 2

    const pagina = pdfDoc.addPage([larguraA4, alturaA4])
    pagina.drawImage(imagem, {
        x,
        y,
        width: imgFinal.largura,
        height: imgFinal.altura,
    })
}

/**
 * Carrega um PDF e copia todas as suas páginas para o PDFDocument de destino.
 */
async function copiarPaginasPdf(
    pdfDoc: PDFDocument,
    file: File
): Promise<void> {
    const bytes = await file.arrayBuffer()
    const origem = await PDFDocument.load(bytes)
    const indices = origem.getPageIndices()
    const paginas = await pdfDoc.copyPages(origem, indices)
    paginas.forEach((p) => pdfDoc.addPage(p))
}

/**
 * Mescla todos os arquivos numa única instância de PDFDocument
 * e retorna os bytes finais.
 */
async function mesclarArquivos(arquivos: File[]): Promise<Uint8Array> {
    const pdfDoc = await PDFDocument.create()

    for (const arquivo of arquivos) {
        const tipo = arquivo.type.toLowerCase()
        const nome = arquivo.name.toLowerCase()

        const ehImagem =
            tipo === 'image/jpeg' ||
            tipo === 'image/png' ||
            nome.endsWith('.jpg') ||
            nome.endsWith('.jpeg') ||
            nome.endsWith('.png')

        const ehPdf = tipo === 'application/pdf' || nome.endsWith('.pdf')

        if (ehImagem) {
            await embedImagem(pdfDoc, arquivo)
        } else if (ehPdf) {
            await copiarPaginasPdf(pdfDoc, arquivo)
        }
        // Arquivos de tipo desconhecido são ignorados silenciosamente
    }

    return pdfDoc.save()
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function MescladorContabil() {
    const supabase = createClient()
    const [categoria, setCategoria] = useState<Categoria | ''>('')
    const [arquivos, setArquivos] = useState<ArquivoSelecionado[]>([])
    const [status, setStatus] = useState<StatusUpload>('idle')
    const [mensagem, setMensagem] = useState<string>('')
    const [urlFinal, setUrlFinal] = useState<string | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // ── Seleção de arquivos ──────────────────────────────────────────────────

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const novos = Array.from(e.target.files ?? []).map((f) => ({
                file: f,
                id: gerarId(),
            }))
            setArquivos((ant) => [...ant, ...novos])
            // Limpa o input para permitir re-seleção do mesmo arquivo
            if (inputRef.current) inputRef.current.value = ''
        },
        []
    )

    const removerArquivo = useCallback((id: string) => {
        setArquivos((ant) => ant.filter((a) => a.id !== id))
    }, [])

    const limparTudo = useCallback(() => {
        setArquivos([])
        setCategoria('')
        setStatus('idle')
        setMensagem('')
        setUrlFinal(null)
    }, [])

    // ── Reset automático de intenção ─────────────────────────────────────────
    // Quando o usuário altera a categoria ou adiciona/remove arquivos após um
    // resultado final (sucesso ou erro), interpretamos isso como uma nova
    // intenção de mesclagem e voltamos ao estado 'idle' silenciosamente.
    useEffect(() => {
        if (status === 'sucesso' || status === 'erro') {
            setStatus('idle')
            setMensagem('')
            setUrlFinal(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categoria, arquivos])

    // ── Ícone por tipo ───────────────────────────────────────────────────────

    function IconeArquivo({ tipo }: { tipo: string }) {
        const nomeMin = tipo.toLowerCase()
        if (
            nomeMin.includes('image') ||
            nomeMin.endsWith('.jpg') ||
            nomeMin.endsWith('.png')
        ) {
            return <ImageIcon className="h-4 w-4 text-sky-500 shrink-0" />
        }
        return <FileText className="h-4 w-4 text-rose-400 shrink-0" />
    }

    // ── Submissão ────────────────────────────────────────────────────────────

    const handleSubmit = async () => {
        if (!categoria) {
            setMensagem('⚠️ Selecione uma categoria antes de mesclar.')
            return
        }
        if (arquivos.length === 0) {
            setMensagem('⚠️ Adicione ao menos um arquivo à lista.')
            return
        }

        try {
            // 1. Processamento local com pdf-lib
            setStatus('processando')
            setMensagem('Mesclando documentos localmente…')
            const bytes = await mesclarArquivos(arquivos.map((a) => a.file))

            // 2. Upload para o Supabase Storage
            setStatus('enviando')
            setMensagem('Enviando para o cofre seguro do Supabase…')
            const nomeArquivo = gerarNomeArquivo(categoria as Categoria)
            const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' })

            const { data, error } = await supabase.storage
                .from('documentos_contabeis')
                .upload(nomeArquivo, blob, {
                    contentType: 'application/pdf',
                    upsert: false,
                })

            if (error) throw new Error(error.message)

            // 3. Sucesso — bucket privado: usar URL assinada (5 min)
            const { data: urlData } = await supabase.storage
                .from('documentos_contabeis')
                .createSignedUrl(data.path, 60 * 5)

            setUrlFinal(urlData?.signedUrl ?? null)
            setStatus('sucesso')
            setMensagem(`✅ "${nomeArquivo}" enviado com sucesso!`)
            setArquivos([])
        } catch (err) {
            setStatus('erro')
            setMensagem(
                `❌ Erro: ${err instanceof Error ? err.message : 'Falha desconhecida.'}`
            )
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────

    const ocupado = status === 'processando' || status === 'enviando'

    return (
        <Card className="w-full shadow-lg border-border/60">
            <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FilePlus2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Mesclar Documentos Contábeis</CardTitle>
                        <CardDescription>
                            PDFs e imagens são mesclados <strong>no seu dispositivo</strong> – nenhum arquivo passa por servidores externos.
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">

                {/* ── Categoria ── */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Categoria dos documentos
                    </label>
                    <Select
                        value={categoria}
                        onValueChange={(v) => setCategoria(v as Categoria)}
                        disabled={ocupado}
                    >
                        <SelectTrigger id="select-categoria" className="w-full">
                            <SelectValue placeholder="Selecione uma categoria…" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Comprovantes Recorrentes">
                                🔄 Comprovantes Recorrentes
                            </SelectItem>
                            <SelectItem value="Extratos">
                                📄 Extratos
                            </SelectItem>
                            <SelectItem value="Compras Eventuais">
                                🛍️ Compras Eventuais
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* ── Área de seleção de arquivos ── */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                        Arquivos para mesclar
                    </label>
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        disabled={ocupado}
                        className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border/60 bg-muted/30 py-8 transition hover:border-primary/60 hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Abrir seletor de arquivos"
                    >
                        <FolderOpen className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Clique para selecionar <span className="font-medium text-foreground">PDFs</span> ou <span className="font-medium text-foreground">Imagens</span>
                        </span>
                        <span className="text-xs text-muted-foreground/70">.pdf · .png · .jpg · .jpeg</span>
                    </button>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        aria-hidden="true"
                    />
                </div>

                {/* ── Lista de arquivos selecionados ── */}
                {arquivos.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-foreground">
                                {arquivos.length} arquivo{arquivos.length !== 1 ? 's' : ''} na fila
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setArquivos([])}
                                disabled={ocupado}
                                className="h-7 text-xs text-muted-foreground hover:text-destructive"
                            >
                                Remover todos
                            </Button>
                        </div>
                        <ul className="divide-y divide-border/50 rounded-lg border border-border/50 bg-muted/20">
                            {arquivos.map(({ file, id }, idx) => (
                                <li key={id} className="flex items-center gap-3 px-3 py-2.5">
                                    <span className="text-xs text-muted-foreground/60 w-4 text-right shrink-0">
                                        {idx + 1}
                                    </span>
                                    <IconeArquivo tipo={file.type || file.name} />
                                    <span className="flex-1 truncate text-sm text-foreground">
                                        {file.name}
                                    </span>
                                    <Badge variant="secondary" className="text-xs shrink-0">
                                        {formatarBytes(file.size)}
                                    </Badge>
                                    <button
                                        type="button"
                                        onClick={() => removerArquivo(id)}
                                        disabled={ocupado}
                                        aria-label={`Remover ${file.name}`}
                                        className="rounded p-0.5 text-muted-foreground hover:text-destructive disabled:opacity-40"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ── Mensagem de feedback ── */}
                {mensagem && (
                    <div
                        className={`rounded-lg px-4 py-3 text-sm ${status === 'sucesso'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : status === 'erro'
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted/60 text-muted-foreground'
                            }`}
                    >
                        {mensagem}
                        {status === 'sucesso' && urlFinal && (
                            <a
                                href={urlFinal}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 underline underline-offset-2 font-medium"
                            >
                                Ver arquivo ↗
                            </a>
                        )}
                    </div>
                )}

                {/* ── Botões de ação ── */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleSubmit}
                        disabled={ocupado || arquivos.length === 0 || !categoria}
                        className="flex-1 gap-2"
                        size="lg"
                    >
                        {ocupado ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {status === 'processando' ? 'Mesclando…' : 'Enviando…'}
                            </>
                        ) : status === 'sucesso' ? (
                            <>
                                <CheckCircle2 className="h-4 w-4" />
                                Enviado!
                            </>
                        ) : (
                            <>
                                <Upload className="h-4 w-4" />
                                Mesclar e Enviar para o Contador
                            </>
                        )}
                    </Button>

                    {arquivos.length > 0 && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={limparTudo}
                            disabled={ocupado}
                            className="shrink-0"
                        >
                            Limpar formulário
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
