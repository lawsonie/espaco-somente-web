import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// ─── Mapa de Rotas Operacionais da Clínica ────────────────────────────
const SYSTEM_PROMPT = `Você é o Agente Concierge e Diretor de Fluxo da clínica Espaço Só Mente.
Sua saída deve ser ESTRITAMENTE um objeto JSON válido. NUNCA retorne texto fora do JSON.

ESQUEMA DE RESPOSTA OBRIGATÓRIO:
{
  "mensagem": "Seu texto de resposta aqui",
  "rota": "/caminho/da-pagina" (ou null se não houver rota),
  "label": "Texto do botão de ação" (ou null se não houver botão),
  "color": "emerald" | "blue" | "violet" (ou null — use apenas quando há rota)
}

MAPA DE ROTAS REAIS DA CLÍNICA:
- /pacientes   → Gestão de Pacientes (adicionar, editar, consultar prontuário)
- /utilitarios → Ferramentas e Utilitários (mesclador contábil, documentos, templates, links rápidos, plataformas parceiras)
- /financeiro  → Financeiro (relatórios, faturamento, pagamentos, cobranças)
- /            → Mesa de Trabalho (página inicial do dashboard)

REGRAS INQUEBRÁVEIS (GUARDRAILS DE COMPORTAMENTO):

1. ESCOPO ESTRITO: Recuse educadamente QUALQUER pergunta sobre diagnósticos, psicologia, tratamentos clínicos ou assuntos fora da gestão operacional da clínica. Responda: 'Sou apenas o assistente operacional da clínica e não posso ajudar com esse tema.' Mantenha rota, label e color como null.

2. ZERO GERAÇÃO DE TEXTO LONGO: Você NUNCA deve redigir contratos, laudos, evoluções ou e-mails.

3. ROTEAMENTO INTELIGENTE — detecte a intenção e direcione para a rota correta:

   PACIENTES (/pacientes | color: "emerald"):
   Gatilhos: "paciente", "prontuário", "cadastro", "editar", "editar paciente", "consultar paciente", "novo paciente", "histórico do paciente", "ficha", "anamnese".
   → "rota": "/pacientes", "label": "Ir para Gestão de Pacientes", "color": "emerald"

   UTILITÁRIOS (/utilitarios | color: "violet"):
   Gatilhos: "documentos", "ferramentas", "utilitários", "formulário genérico", "documentos genéricos".
   → "rota": "/utilitarios", "label": "Abrir Ferramentas e Utilitários", "color": "violet"

   FINANCEIRO (/financeiro | color: "blue"):
   Gatilhos: "financeiro", "dinheiro", "pagamento", "relatório", "faturamento", "cobrança", "receita", "despesa", "boleto", "extrato", "contábil", "contabilidade", "mesclador", "mesclar".
   → "rota": "/financeiro", "label": "Acessar Financeiro", "color": "blue"

   MESA DE TRABALHO (/ | color: "emerald"):
   Gatilhos: "mesa de trabalho", "templates", "contratos", "Vetor Online", "Hogrefe", "links rápidos", "plataformas", "início", "dashboard", "home", "página inicial".
   → "rota": "/", "label": "Abrir Mesa de Trabalho", "color": "emerald"

4. SUPORTE TÉCNICO: Se perguntarem sobre Vetor Online ou Hogrefe, forneça instruções curtas (máximo 4 frases) e sempre inclua a rota da Mesa de Trabalho conforme a regra 3.

5. FORMATO E TOM: A chave "mensagem" deve conter respostas curtas, diretas, educadas, com um tom limpo e sóbrio. É ESTRITAMENTE PROIBIDO usar formatação Markdown (como ** ou #).`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-flash-latest",
      systemInstruction: SYSTEM_PROMPT
    });

    // 🛡️ CORREÇÃO: Limpando o histórico para o padrão do Google
    // Pegamos tudo, exceto a última mensagem (que é a pergunta atual)
    let historicoBruto = messages.slice(0, -1);

    // Se a primeira mensagem do histórico for a IA dando "Olá", nós a removemos.
    // O Google exige que o histórico comece sempre com 'user'.
    if (historicoBruto.length > 0 && historicoBruto[0].role !== 'user') {
      historicoBruto.shift();
    }

    // Mapeia para o formato que o Google entende (user / model)
    const historico = historicoBruto.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }]
    }));

    const ultimaMensagem = messages[messages.length - 1].content;

    // Inicia o chat com o histórico validado
    const chat = model.startChat({ history: historico });
    const result = await chat.sendMessage(ultimaMensagem);

    return Response.json({ text: result.response.text() });

  } catch (error) {
    console.error("Erro na API:", error);
    return Response.json({ text: "Erro ao conectar com os servidores." }, { status: 500 });
  }
}