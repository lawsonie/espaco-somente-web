# 📄 Spec.md - Mesa de Trabalho (Central de Utilitários)

## 1. Visão Geral e Arquitetura
A rota `app/(dashboard)/utilitarios/page.tsx` atuará como a "Mesa de Trabalho" central da clínica Espaço Só Mente.
**Princípio de Design:** Fricção Zero e FinOps. A tela deve priorizar acessos rápidos (links estáticos e downloads) para evitar o uso desnecessário de processamento dinâmico ou chamadas de IA (LLM) para tarefas triviais.

## 2. Estrutura de Dados (Os 3 Blocos)

### Bloco 1: Cofre de Templates (Arquivos Estáticos)
Disponibilizar botões de download direto para arquivos `.docx` hospedados na pasta `public/templates` ou via link direto.
* **Contrato de Psicoterapia Individual:** Template em `.docx` para preenchimento manual.
* **Contrato de Avaliação Neuropsicológica:** Template em `.docx` para preenchimento manual.
*(Regra de Negócio: Os arquivos não serão preenchidos via código. O sistema apenas fornece o esqueleto oficial).*

### Bloco 2: Central de Atendimento (Formulários)
Botões com a funcionalidade "Copiar Link" (Clipboard) para que a gestora envie rapidamente pelo WhatsApp.
* **Anamnese Adulto:** `https://forms.gle/TZgVocekgtnSgmax9`
* **Anamnese Criança/Adolescente:** `https://forms.gle/TpP37XHUwmWenrSe7`

### Bloco 3: Plataformas Profissionais (Testes)
Atalhos para sistemas externos utilizados no dia a dia da clínica.
* **Vetor Online:** Link de redirecionamento.
* **Hogrefe:** Link de redirecionamento.
*(Contexto para o futuro Agente: O foco do suporte nestas plataformas é o passo a passo de alocação/desalocação de créditos para aplicação de testes).*

## 3. Diretrizes de UI/UX (O Layout)
* **Grid System:** A tela deve ser dividida em *Cards* ou *Sessões* claras e minimalistas, separando visualmente os Templates, Formulários e Plataformas.
* **Ícones:** Utilizar ícones da biblioteca `lucide-react` para rápida identificação (ex: `FileText` para templates, `Link` para formulários, `ExternalLink` para Vetor/Hogrefe).
* **Reserva de Espaço (Placeholder):** Deixar uma coluna lateral (direita) ou um botão de ação flutuante reservado para o futuro componente `<ChatConcierge />`.

## 4. Guardrails do Agente Concierge (Dependência Futura)
Quando o `ChatInterface` for implementado, o *System Prompt* DEVE seguir estas regras:
1.  **Roteamento Estrito:** A IA nunca deve redigir contratos do zero. Se a usuária pedir "Faça um contrato", a IA deve responder: *"Você pode baixar o modelo padrão na sessão 'Cofre de Templates' ao lado e preencher os dados."*
2.  **Suporte Operacional (Vetor/Hogrefe):** A IA deve estar instruída a fornecer tutoriais curtos em *bullet points* sobre como atribuir ou retirar créditos nessas plataformas específicas.
3.  **Limite de Tokens:** O `max_tokens` da resposta não deve exceder respostas curtas (aproximadamente 150-200 tokens).