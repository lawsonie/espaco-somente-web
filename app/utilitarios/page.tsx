import MescladorContabil from "@/components/utilitarios/MescladorContabil"
import ListaDocumentos from "@/components/utilitarios/ListaDocumentos"

export default function PaginaUtilitarios() {
    return (
        <main className="p-6 lg:p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground">
                    Utilitários Contábeis
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Mescle comprovantes e gerencie os documentos enviados para o contador de forma segura.
                </p>
            </div>

            <div className="flex flex-col gap-8 max-w-4xl">
                <MescladorContabil />
                <ListaDocumentos />
            </div>
        </main>
    )
}