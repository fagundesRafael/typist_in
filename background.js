// background.js

// Inicializa a chave API com um valor temporário
let API_KEY = ""; // Valor temporário que será substituído pela chave configurada pelo usuário

// Função para carregar a chave API do armazenamento local
async function loadApiKey() {
    try {
        // Tenta obter a chave API do armazenamento local
        const result = await chrome.storage.local.get(['geminiApiKey']);
        if (result.geminiApiKey) {
            console.log("Chave API carregada do armazenamento local");
            API_KEY = result.geminiApiKey;
            return true;
        }
        console.log("Chave API não configurada. Por favor, configure a chave API nas opções da extensão.");
        return false;
    } catch (error) {
        console.error("Erro ao carregar chave API do armazenamento:", error);
        return false;
    }
}

// Inicializa carregando a chave API
loadApiKey();

let oitivaRules = null; // Variável global para armazenar as regras de oitiva

// Carrega as regras de oitiva do arquivo de configuração
async function loadOitivaRules() {
    try {
        const response = await fetch(chrome.runtime.getURL('config/oitiva_rules.json'));
        if (!response.ok) {
            console.error("Erro ao carregar regras de oitiva:", response.status, response.statusText);
            return null;
        }
        
        const rules = await response.json();
        console.log("Regras de oitiva carregadas com sucesso!");
        return rules;
    } catch (error) {
        console.error("Erro ao carregar regras de oitiva:", error);
        return null;
    }
}

// Inicializa as regras de oitiva
loadOitivaRules().then(rules => {
    oitivaRules = rules;
});

// Função para gerar um prompt melhorado com base nas regras de oitiva
function generateEnhancedPrompt(basePrompt, ocorrencia, personName, type, maxQuestions) {
    if (!oitivaRules) {
        console.log("Regras de oitiva não carregadas, usando prompt básico");
        return basePrompt;
    }
    
    // Garante que maxQuestions seja um número válido
    const numQuestions = parseInt(maxQuestions, 10) || 10;
    console.log("Número de perguntas a serem geradas:", numQuestions);
    
    // Extrai palavras-chave da ocorrência para identificar o tipo de crime
    const ocorrenciaLower = ocorrencia.toLowerCase();
    const crimeTypes = {
        fraude: ocorrenciaLower.includes('fraude') || ocorrenciaLower.includes('estelionato'),
        roubo: ocorrenciaLower.includes('roubo') || ocorrenciaLower.includes('assalto'),
        furto: ocorrenciaLower.includes('furto') || ocorrenciaLower.includes('subtraído'),
        receptacao: ocorrenciaLower.includes('receptação'),
        ameaca: ocorrenciaLower.includes('ameaça') || ocorrenciaLower.includes('ameaçou'),
        lesao: ocorrenciaLower.includes('lesão') || ocorrenciaLower.includes('agressão'),
        trafico: ocorrenciaLower.includes('tráfico') || ocorrenciaLower.includes('droga'),
        embriaguez: ocorrenciaLower.includes('embriaguez') || ocorrenciaLower.includes('álcool'),
        transito: ocorrenciaLower.includes('trânsito') || ocorrenciaLower.includes('acidente'),
        adulteracao: ocorrenciaLower.includes('adulteração') || ocorrenciaLower.includes('clonado'),
        cibernetico: ocorrenciaLower.includes('internet') || ocorrenciaLower.includes('online') || ocorrenciaLower.includes('digital'),
        ambiental: ocorrenciaLower.includes('ambiental') || ocorrenciaLower.includes('desmatamento'),
        violenciaDomestica: ocorrenciaLower.includes('doméstica') || ocorrenciaLower.includes('maria da penha'),
        discriminacao: ocorrenciaLower.includes('discriminação') || ocorrenciaLower.includes('preconceito'),
        sexual: ocorrenciaLower.includes('estupro') || ocorrenciaLower.includes('sexual'),
        corrupcao: ocorrenciaLower.includes('corrupção') || ocorrenciaLower.includes('propina'),
        armas: ocorrenciaLower.includes('arma') || ocorrenciaLower.includes('munição')
    };
    
    // Constrói o prompt melhorado
    let enhancedPrompt = `
Você é um Escrivão de Polícia Civil do Estado de Rondônia, especializado em elaborar perguntas para ${type}.

CONTEXTO DA OCORRÊNCIA:
${ocorrencia}

INSTRUÇÕES:
- Gere EXATAMENTE ${numQuestions} perguntas objetivas para um ${type} de ${personName}.
- As perguntas devem ser numeradas (1, 2, 3, etc.).
- Foque em esclarecer detalhes importantes do caso.
- Siga as diretrizes abaixo conforme o tipo de crime identificado.
- É MUITO IMPORTANTE gerar EXATAMENTE ${numQuestions} perguntas, nem mais nem menos.
`;
    
    // Adiciona parâmetros estáticos
    enhancedPrompt += "\nPARÂMETROS ESTÁTICOS:\n";
    oitivaRules.parametrosEstaticos.regras.forEach(regra => {
        enhancedPrompt += `- ${regra.descricao}\n`;
    });
    
    // Adiciona parâmetros específicos com base no tipo de crime identificado
    enhancedPrompt += "\nPARÂMETROS ESPECÍFICOS PARA ESTE CASO:\n";
    
    if (crimeTypes.fraude) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "A").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.roubo) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "B").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.furto) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "C").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.receptacao) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "D").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.ameaca) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "E").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.lesao) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "F").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.trafico) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "G").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.embriaguez) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "H").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.transito) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "I").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.adulteracao) {
        const regras = oitivaRules.parametrosGerais.categorias.find(c => c.id === "J").regras;
        regras.forEach(regra => enhancedPrompt += `- ${regra}\n`);
    }
    
    if (crimeTypes.cibernetico && oitivaRules.parametrosCrimesCiberneticos) {
        enhancedPrompt += `- ${oitivaRules.parametrosCrimesCiberneticos.regras[0].descricao}\n`;
        oitivaRules.parametrosCrimesCiberneticos.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    if (crimeTypes.ambiental && oitivaRules.parametrosCrimesAmbientais) {
        enhancedPrompt += `- ${oitivaRules.parametrosCrimesAmbientais.regras[0].descricao}\n`;
        oitivaRules.parametrosCrimesAmbientais.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    if (crimeTypes.violenciaDomestica && oitivaRules.parametrosRelacionamentosAbusivos) {
        enhancedPrompt += `- ${oitivaRules.parametrosRelacionamentosAbusivos.regras[0].descricao}\n`;
        oitivaRules.parametrosRelacionamentosAbusivos.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    if (crimeTypes.discriminacao && oitivaRules.parametrosCrimesDiscriminacao) {
        enhancedPrompt += `- ${oitivaRules.parametrosCrimesDiscriminacao.regras[0].descricao}\n`;
        oitivaRules.parametrosCrimesDiscriminacao.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    if (crimeTypes.sexual && oitivaRules.parametrosCrimesEstupro) {
        enhancedPrompt += `- ${oitivaRules.parametrosCrimesEstupro.regras[0].descricao}\n`;
        oitivaRules.parametrosCrimesEstupro.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    if (crimeTypes.corrupcao && oitivaRules.parametrosCorrupcao) {
        enhancedPrompt += `- ${oitivaRules.parametrosCorrupcao.regras[0].descricao}\n`;
        oitivaRules.parametrosCorrupcao.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    if (crimeTypes.armas && oitivaRules.parametrosTraficoArmas) {
        enhancedPrompt += `- ${oitivaRules.parametrosTraficoArmas.regras[0].descricao}\n`;
        oitivaRules.parametrosTraficoArmas.regras[0].perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    }
    
    // Adiciona parâmetros gerais adicionais
    enhancedPrompt += "\nPARÂMETROS GERAIS ADICIONAIS:\n";
    oitivaRules.parametrosGeraisAdicionais.regras.forEach(regra => {
        enhancedPrompt += `- ${regra.descricao}\n`;
        regra.perguntas.forEach(pergunta => {
            enhancedPrompt += `  * Exemplo: "${pergunta}"\n`;
        });
    });
    
    // Adiciona conclusão
    enhancedPrompt += "\nCONCLUSÃO:\n";
    oitivaRules.conclusao.regras.forEach(regra => {
        enhancedPrompt += `- ${regra.descricao}\n`;
    });
    
    enhancedPrompt += "\nGERE APENAS AS PERGUNTAS NUMERADAS, SEM COMENTÁRIOS ADICIONAIS:";
    
    return enhancedPrompt;
}

async function generateQuestionsWithGemini(prompt, ocorrencia, personName, type, maxQuestions) {
    // Garante que maxQuestions seja um número válido
    const numQuestions = parseInt(maxQuestions, 10) || 10;
    
    // Gera um prompt melhorado com base nas regras de oitiva
    const enhancedPrompt = generateEnhancedPrompt(prompt, ocorrencia, personName, type, numQuestions);
    
    // Verifica se a chave API está disponível
    if (!API_KEY) {
        const errorMsg = "Chave API não configurada. Por favor, clique em 'Configurações' e adicione sua chave API do Google Gemini.";
        console.error(errorMsg);
        return { 
            error: errorMsg,
            rawText: "",
            requestedQuestions: numQuestions
        };
    }
    
    // Corrigindo a URL da API para o endpoint correto
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`;
    const headers = {
        "Content-Type": "application/json"
    };
    const body = {
        "contents": [
            {
                "parts": [
                    {
                        "text": enhancedPrompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024
        }
    };

    try {
        console.log("Enviando requisição para a API Gemini com o prompt melhorado");
        
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        console.log("API Response Status:", response.status); // Log the HTTP status code

        if (!response.ok) {
            const errorText = await response.text();
            console.error("HTTP Error:", response.status, response.statusText, errorText);
            
            // Se o modelo gemini-1.0-pro não for encontrado, tente com gemini-pro
            if (response.status === 404 && errorText.includes("models/gemini-1.0-pro is not found")) {
                console.log("Tentando com modelo alternativo: gemini-pro");
                return await tryAlternativeModel(enhancedPrompt, "gemini-pro", numQuestions);
            }
            
            return { error: errorText, rawText: "" };
        }

        const result = await response.json();
        console.log("API Response:", JSON.stringify(result)); // Log the full API response

        // Verificar se a resposta contém o formato esperado
        if (result.candidates && 
            result.candidates.length > 0 && 
            result.candidates[0].content && 
            result.candidates[0].content.parts && 
            result.candidates[0].content.parts.length > 0 && 
            result.candidates[0].content.parts[0].text) {
            
            const rawText = result.candidates[0].content.parts[0].text;
            console.log("Texto bruto da resposta:", rawText);
            
            // Processar o texto para extrair perguntas numeradas ou em lista
            let questions = [];
            
            // Tentar extrair perguntas numeradas (1. Pergunta)
            const numberedQuestions = rawText.match(/\d+\.\s+[^.?!]*[.?!]/g);
            
            if (numberedQuestions && numberedQuestions.length > 0) {
                questions = numberedQuestions.map(q => q.trim());
            } else {
                // Se não encontrar perguntas numeradas, dividir por quebras de linha
                questions = rawText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && (line.endsWith('?') || /^\d+\./.test(line)));
            }
            
            // Limitar o número de perguntas ao valor solicitado
            if (questions.length > numQuestions) {
                console.log(`Limitando de ${questions.length} para ${numQuestions} perguntas`);
                questions = questions.slice(0, numQuestions);
            } else if (questions.length < numQuestions) {
                console.log(`Obtidas apenas ${questions.length} perguntas, mas foram solicitadas ${numQuestions}`);
            }
            
            console.log("Perguntas extraídas:", questions);
            
            // Retorna tanto as perguntas quanto o texto bruto para processamento adicional se necessário
            return { 
                questions: questions,
                rawText: rawText,
                requestedQuestions: numQuestions
            };
        } else {
            console.error("Erro na estrutura da resposta da API Gemini:", result);
            return { 
                questions: [],
                rawText: result.candidates && result.candidates[0] ? JSON.stringify(result.candidates[0]) : "",
                requestedQuestions: numQuestions
            };
        }
    } catch (error) {
        console.error("Erro ao gerar perguntas com Gemini:", error);
        return { error: error.message, rawText: "", requestedQuestions: numQuestions };
    }
}

// Função para tentar modelos alternativos
async function tryAlternativeModel(prompt, modelName, maxQuestions) {
    // Garante que maxQuestions seja um número válido
    const numQuestions = parseInt(maxQuestions, 10) || 10;
    
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;
    const headers = {
        "Content-Type": "application/json"
    };
    const body = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.7,
            "topK": 40,
            "topP": 0.95,
            "maxOutputTokens": 1024
        }
    };

    try {
        console.log(`Tentando modelo alternativo: ${modelName}`);
        
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(body)
        });

        console.log(`Resposta do modelo ${modelName}:`, response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Erro com modelo ${modelName}:`, response.status, errorText);
            return { error: errorText, rawText: "", requestedQuestions: numQuestions };
        }

        const result = await response.json();
        
        if (result.candidates && 
            result.candidates.length > 0 && 
            result.candidates[0].content && 
            result.candidates[0].content.parts && 
            result.candidates[0].content.parts.length > 0 && 
            result.candidates[0].content.parts[0].text) {
            
            const rawText = result.candidates[0].content.parts[0].text;
            console.log(`Texto bruto da resposta do modelo ${modelName}:`, rawText);
            
            // Processar o texto para extrair perguntas
            let questions = [];
            
            // Tentar extrair perguntas numeradas
            const numberedQuestions = rawText.match(/\d+\.\s+[^.?!]*[.?!]/g);
            
            if (numberedQuestions && numberedQuestions.length > 0) {
                questions = numberedQuestions.map(q => q.trim());
            } else {
                // Se não encontrar perguntas numeradas, dividir por quebras de linha
                questions = rawText.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.length > 0 && (line.endsWith('?') || /^\d+\./.test(line)));
            }
            
            // Limitar o número de perguntas ao valor solicitado
            if (questions.length > numQuestions) {
                console.log(`Limitando de ${questions.length} para ${numQuestions} perguntas`);
                questions = questions.slice(0, numQuestions);
            } else if (questions.length < numQuestions) {
                console.log(`Obtidas apenas ${questions.length} perguntas, mas foram solicitadas ${numQuestions}`);
            }
            
            return { 
                questions: questions,
                rawText: rawText,
                requestedQuestions: numQuestions
            };
        } else {
            return { 
                questions: [],
                rawText: result.candidates && result.candidates[0] ? JSON.stringify(result.candidates[0]) : "",
                requestedQuestions: numQuestions
            };
        }
    } catch (error) {
        console.error(`Erro ao usar modelo alternativo ${modelName}:`, error);
        return { error: error.message, rawText: "", requestedQuestions: numQuestions };
    }
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'generateQuestions') {
        console.log("Recebida solicitação para gerar perguntas com prompt:", request.prompt);
        
        // Extrai informações adicionais do request
        const ocorrencia = request.ocorrencia || "";
        const personName = request.personName || "";
        const type = request.type || "";
        const maxQuestions = request.maxQuestions || 10;
        
        generateQuestionsWithGemini(request.prompt, ocorrencia, personName, type, maxQuestions)
            .then(result => {
                console.log("Resultado da geração:", result);
                sendResponse(result);
            })
            .catch(error => {
                console.error("Erro ao processar perguntas:", error);
                sendResponse({ questions: [], error: error.message, rawText: "" });
            });
        
        return true; // Keep the message channel open for the asynchronous response
    } else if (request.action === 'saveApiKey') {
        // Salva a chave API no armazenamento local
        chrome.storage.local.set({ geminiApiKey: request.apiKey }, () => {
            console.log("Chave API salva com sucesso");
            API_KEY = request.apiKey;
            sendResponse({ success: true });
        });
        return true;
    }
});
