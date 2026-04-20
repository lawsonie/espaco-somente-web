// Substitua pela sua chave real que está no .env
const apiKey = "[ENCRYPTION_KEY]";

async function listarModelos() {
    console.log("⏳ Consultando os servidores do Google...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            console.error("❌ Erro na Chave:", data.error.message);
            return;
        }

        // Filtra só os modelos da família Gemini e limpa o texto
        const modelosGemini = data.models
            .map(m => m.name.replace('models/', ''))
            .filter(nome => nome.includes('gemini'));

        console.log("\n✅ Modelos Gemini disponíveis para você:");
        console.table(modelosGemini);

    } catch (error) {
        console.error("Erro de conexão:", error);
    }
}

listarModelos();