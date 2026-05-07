Decisões de Arquitetura (ADR)
ADR-004: Remoção de IA Baseada em SDK de Interface
Data: Maio de 2026

Contexto:
Implementamos inicialmente uma IA Concierge para auxiliar na navegação do sistema. No entanto, a alta frequência de atualizações incompatíveis nas bibliotecas de IA para JavaScript gerou instabilidade no build de produção na Vercel.

Decisão:
Remover a integração direta de SDKs de IA do frontend Next.js.

Consequências e Aprendizados:

Estabilidade em Primeiro Lugar: Sistemas que lidam com dados sensíveis (clínicos) exigem dependências estáveis. Bibliotecas experimentais aumentam a superfície de erro.

Desacoplamento Necessário: IAs funcionais e robustas devem residir em ambientes estáveis (como motores em Python). O frontend deve permanecer leve, consumindo apenas APIs REST simples para evitar que quebras de bibliotecas externas paralisem a interface do usuário.

Viabilidade Econômica: Manter IA em produção não é apenas custo de API, é custo de horas de engenharia para manutenção de dependências.

3. Para o Framework de "Context Stewardship" (Diretrizes de Governança)
Diretriz de Sustentabilidade de Agentes (Governança de IA)

Princípio da Necessidade vs. Luxo: A implementação de IA deve ser tratada como um investimento operacional, não estético. Se a função não paga pelo seu próprio custo de manutenção e gerenciamento de contexto, ela deve ser descontinuada em favor de métodos determinísticos.

Soberania dos Dados Sensíveis: Em contextos de saúde e direito, a estabilidade do sistema é uma obrigação ética. O uso de ferramentas de IA que exigem atualizações constantes de segurança e estrutura deve ser limitado a ambientes isolados (Sandboxes) até que alcancem maturidade de produção.

Fronteira Tecnológica: Reconhecemos que a IA funcional reside onde os dados são processados com rigor (Python/Engenharia de Dados). A interface (Next.js/React) deve atuar como um administrador de contexto limpo, sem se acoplar a SDKs de alta volatilidade que comprometam a disponibilidade do serviço.

Responsabilidade do Empresário: É dever do administrador entender que a IA exige infraestrutura de suporte. Dar um "passo maior que a perna" tecnologicamente sem prever custos de manutenção é um risco à continuidade do negócio.