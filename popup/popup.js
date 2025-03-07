// popup/popup.js

// Função para exibir mensagens de status
function updateStatus(message, type = 'info', isLoading = false) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = type; // Adiciona classes para diferentes tipos de mensagens (ex: info, error)
    
    if (isLoading) {
        statusDiv.classList.add('loading');
    } else {
        statusDiv.classList.remove('loading');
    }
    
    console.log(`Status atualizado: ${message} (${type})`);
}

// Função para gerar as perguntas em uma nova janela
function displayQuestionsInNewWindow(questions, ocorrencia, personName, type) {
    try {
        const newWindow = window.open('', '_blank', 'width=800,height=600');
        if (!newWindow) {
            updateStatus('Erro ao abrir nova janela. Verifique se os pop-ups estão permitidos.', 'error');
            return;
        }
        
        // Função para copiar o conteúdo para a área de transferência
        const copyScript = `
            function copyToClipboard() {
                const contentDiv = document.getElementById('content-to-copy');
                const range = document.createRange();
                range.selectNode(contentDiv);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand('copy');
                window.getSelection().removeAllRanges();
                
                const copyBtn = document.getElementById('copyBtn');
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copiado!';
                copyBtn.classList.add('copied');
                
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('copied');
                }, 2000);
            }
        `;
        
        newWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Oitiva - ${personName}</title>
                <meta charset="UTF-8">
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 0;
                        padding: 20px;
                        background-color: #f5f5f5;
                        color: #333;
                    }
                    .container {
                        max-width: 800px;
                        margin: 0 auto;
                        background-color: white;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { 
                        color: #2c3e50; 
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 10px;
                        margin-top: 0;
                    }
                    h2 { 
                        color: #2c3e50; 
                        margin-top: 20px;
                        border-left: 4px solid #3498db;
                        padding-left: 10px;
                    }
                    .info { 
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                        border-left: 4px solid #3498db;
                    }
                    .info p {
                        margin: 5px 0;
                    }
                    ol { 
                        margin-left: 20px; 
                        padding-left: 20px;
                    }
                    li { 
                        margin-bottom: 10px; 
                        line-height: 1.5;
                    }
                    .context {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 5px;
                        margin-bottom: 20px;
                        border-left: 4px solid #e74c3c;
                        font-style: italic;
                    }
                    .btn {
                        background-color: #3498db;
                        color: white;
                        border: none;
                        padding: 10px 15px;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                        margin-top: 20px;
                        transition: background-color 0.3s;
                    }
                    .btn:hover {
                        background-color: #2980b9;
                    }
                    .btn.copied {
                        background-color: #27ae60;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        font-size: 12px;
                        color: #7f8c8d;
                    }
                </style>
                <script>
                    ${copyScript}
                </script>
            </head>
            <body>
                <div class="container">
                    <h1>Oitiva - Termo de ${type}</h1>
                    <div class="info">
                        <p><strong>Pessoa:</strong> ${personName}</p>
                        <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                        <p><strong>Tipo:</strong> ${type}</p>
                    </div>
                    
                    <h2>Contexto da Ocorrência</h2>
                    <div class="context">
                        <p>${ocorrencia}</p>
                    </div>
                    
                    <div id="content-to-copy">
                        <h2>Perguntas</h2>
                        <ol>
        `);
        
        if (questions && questions.length > 0) {
            questions.forEach((question) => {
                newWindow.document.write(`<li>${question}</li>`);
            });
        } else {
            newWindow.document.write(`<p>Nenhuma pergunta foi gerada. Verifique os parâmetros e tente novamente.</p>`);
        }
        
        newWindow.document.write(`
                        </ol>
                    </div>
                    
                    <button id="copyBtn" class="btn" onclick="copyToClipboard()">Copiar Perguntas</button>
                    
                    <div class="footer">
                        <p>Gerado por Oitiva Assistente - ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
        
        newWindow.document.close();
    } catch (error) {
        console.error("Erro ao exibir perguntas:", error);
        updateStatus('Erro ao exibir perguntas: ' + error.message, 'error');
    }
}

function injectContentScriptAndExtractData(tabId) {
    updateStatus('Extraindo dados da página...', 'info', true);
    
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
    }, (injectionResults) => {
        if (chrome.runtime.lastError) {
            console.error("Erro ao injetar script:", chrome.runtime.lastError);
            updateStatus('Erro ao injetar script: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        // Now that content.js is injected, send the message
        chrome.tabs.sendMessage(tabId, { action: 'extractData' }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erro ao enviar mensagem:", chrome.runtime.lastError);
                updateStatus('Erro ao comunicar com a página: ' + chrome.runtime.lastError.message, 'error');
                return;
            }
            
            const generateButton = document.getElementById('generateOitiva');
            
            if (response) {
                if (response.found) {
                    document.getElementById("ocorrenciaText").textContent = response.ocorrencia;
                    updateStatus('Ocorrência capturada com sucesso!', 'success');
                    generateButton.disabled = false;
                } else {
                    document.getElementById("ocorrenciaText").textContent = "Ocorrência não encontrada.";
                    updateStatus('Não foi possível encontrar a ocorrência na página.', 'error');
                    generateButton.disabled = true;
                }
            } else {
                document.getElementById("ocorrenciaText").textContent = "Erro ao tentar extrair a ocorrência.";
                updateStatus('Erro ao extrair dados da página.', 'error');
                generateButton.disabled = true;
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    updateStatus('Carregando...', 'info', true);
    
    // Desabilita o botão até que a ocorrência seja carregada
    const generateButton = document.getElementById('generateOitiva');
    generateButton.disabled = true;
    
    // Verifica se a chave API está configurada
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (!result.geminiApiKey) {
            updateStatus('Chave API não configurada. Clique em "Configurações" abaixo para configurar.', 'error');
            generateButton.disabled = true;
            
            // Destaca o link de configurações
            const configLink = document.getElementById('openOptions');
            if (configLink) {
                configLink.style.fontWeight = 'bold';
                configLink.style.color = '#e74c3c';
                configLink.style.fontSize = '14px';
                configLink.textContent = '⚙️ Configurar Chave API';
            }
        } else {
            // Continua com a extração de dados
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                if (tabs && tabs.length > 0) {
                    const tabId = tabs[0].id;
                    injectContentScriptAndExtractData(tabId);
                } else {
                    console.error("Não foi possível encontrar a aba ativa.");
                    updateStatus('Erro ao acessar a aba atual.', 'error');
                    generateButton.disabled = true;
                }
            });
        }
    });
    
    // Adiciona o evento de clique ao link de configurações
    document.getElementById('openOptions').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
    });
});

// Função para processar a resposta da API e extrair perguntas
function processApiResponse(response) {
    // Verifica se há um erro específico
    if (response && response.error) {
        console.error("Erro da API:", response.error);
        
        // Verifica se é o erro de chave API não configurada
        if (response.error.includes("Chave API não configurada")) {
            updateStatus('Chave API não configurada. Clique em "Configurações" abaixo para configurar.', 'error');
            
            // Destaca o link de configurações
            const configLink = document.getElementById('openOptions');
            if (configLink) {
                configLink.style.fontWeight = 'bold';
                configLink.style.color = '#e74c3c';
                configLink.style.fontSize = '14px';
                configLink.textContent = '⚙️ Configurar Chave API';
            }
            
            return [];
        }
    }
    
    // Se já temos um array de perguntas, retornamos ele (limitando ao número solicitado)
    if (response && Array.isArray(response.questions) && response.questions.length > 0) {
        const numQuestions = response.requestedQuestions || 10;
        if (response.questions.length > numQuestions) {
            console.log(`Limitando de ${response.questions.length} para ${numQuestions} perguntas`);
            return response.questions.slice(0, numQuestions);
        }
        return response.questions;
    }
    
    // Se temos uma resposta de texto bruto, tentamos extrair perguntas
    if (response && response.rawText) {
        const text = response.rawText;
        const numQuestions = response.requestedQuestions || 10;
        
        // Tentativa 1: Procurar por linhas numeradas (1. Pergunta)
        const numberedQuestions = text.match(/\d+\.\s+[^.?!]*[.?!]/g);
        if (numberedQuestions && numberedQuestions.length > 0) {
            const questions = numberedQuestions.map(q => q.trim());
            if (questions.length > numQuestions) {
                console.log(`Limitando de ${questions.length} para ${numQuestions} perguntas`);
                return questions.slice(0, numQuestions);
            }
            return questions;
        }
        
        // Tentativa 2: Procurar por linhas que terminam com ponto de interrogação
        const questionLines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.endsWith('?'));
        if (questionLines.length > 0) {
            if (questionLines.length > numQuestions) {
                console.log(`Limitando de ${questionLines.length} para ${numQuestions} perguntas`);
                return questionLines.slice(0, numQuestions);
            }
            return questionLines;
        }
        
        // Tentativa 3: Dividir o texto em frases e pegar as que terminam com interrogação
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const questions = sentences.filter(s => s.trim().endsWith('?'));
        if (questions.length > 0) {
            if (questions.length > numQuestions) {
                console.log(`Limitando de ${questions.length} para ${numQuestions} perguntas`);
                return questions.slice(0, numQuestions);
            }
            return questions.map(q => q.trim());
        }
    }
    
    // Se não conseguimos extrair perguntas, retornamos um array vazio
    return [];
}

document.getElementById('generateOitiva').addEventListener('click', () => {
    const personName = document.getElementById('personName').value;
    const selectedType = document.getElementById('typeSelect').value;
    const maxQuestions = parseInt(document.getElementById("maxQuestions").value, 10);
    let ocorrencia = document.getElementById("ocorrenciaText").textContent;

    //verifica se selecionou uma pessoa
    if (!personName) {
        updateStatus('Informe o nome da pessoa.', 'error');
        return;
    }

    if (!maxQuestions || isNaN(maxQuestions) || maxQuestions < 1) {
        updateStatus('Informe um número válido de perguntas (mínimo 1).', 'error');
        return;
    }
    
    if (ocorrencia == "Aguardando ocorrência..." || 
        ocorrencia == "Ocorrência não encontrada." || 
        ocorrencia == "Erro ao tentar extrair a ocorrência." || 
        !ocorrencia) {
        updateStatus('Não foi possível capturar a ocorrência.', 'error');
        return;
    }

    // Limit the length of ocorrencia
    if (ocorrencia.length > 4000) {
        ocorrencia = ocorrencia.substring(0, 4000); // Limit to 4000 characters
        console.log("Ocorrência truncada para 4000 caracteres");
    }

    // Desabilita o botão durante o processamento
    const generateButton = document.getElementById('generateOitiva');
    generateButton.disabled = true;
    
    updateStatus('Gerando perguntas...', 'info', true);

    // Improved prompt for better question generation
    const prompt = `
    Com base no seguinte relato de ocorrência policial, gere ${maxQuestions} perguntas objetivas para um ${selectedType} de ${personName}.
    
    As perguntas devem:
    1. Ser relevantes para os fatos descritos na ocorrência
    2. Seguir uma sequência lógica de investigação
    3. Ser numeradas (1, 2, 3, etc.)
    4. Ser diretas e claras
    5. Focar em esclarecer detalhes importantes do caso
    
    OCORRÊNCIA:
    ${ocorrencia}
    
    PERGUNTAS:`;

    console.log("Prompt gerado:", prompt); // Check the prompt
    console.log("Número máximo de perguntas:", maxQuestions); // Log para debug

    // Envia o prompt e informações adicionais para o background.js
    chrome.runtime.sendMessage({ 
        action: 'generateQuestions', 
        prompt: prompt,
        ocorrencia: ocorrencia,
        personName: personName,
        type: selectedType,
        maxQuestions: maxQuestions
    }, (response) => {
        // Reabilita o botão após o processamento
        generateButton.disabled = false;
        
        if (chrome.runtime.lastError) {
            console.error("Erro ao enviar mensagem para background:", chrome.runtime.lastError);
            updateStatus('Erro ao comunicar com o serviço de IA: ' + chrome.runtime.lastError.message, 'error');
            return;
        }
        
        // Processa a resposta para extrair perguntas
        const questions = processApiResponse(response);
        
        if (questions && questions.length > 0) {
            updateStatus('Perguntas geradas com sucesso!', 'success');
            displayQuestionsInNewWindow(questions, ocorrencia, personName, selectedType);
        } else {
            console.error("Resposta inválida ou vazia:", response);
            
            // Fallback: gerar perguntas de fallback
            const fallbackQuestions = generateFallbackQuestions(ocorrencia, personName, selectedType, maxQuestions);
            
            if (fallbackQuestions.length > 0) {
                updateStatus('Usando perguntas de fallback devido a erro na API.', 'info');
                displayQuestionsInNewWindow(fallbackQuestions, ocorrencia, personName, selectedType);
            } else {
                updateStatus('Erro ao gerar perguntas. Verifique o console para mais detalhes.', 'error');
            }
        }
    });
});

// Função para gerar perguntas de fallback quando a API falha
function generateFallbackQuestions(ocorrencia, personName, type, maxQuestions) {
    // Garante que maxQuestions seja um número válido
    const numQuestions = parseInt(maxQuestions, 10) || 10;
    console.log("Gerando perguntas de fallback, quantidade:", numQuestions);
    
    const baseQuestions = {
        "Declarações": [
            `1. Qual é o seu nome completo e qual sua relação com os fatos descritos?`,
            `2. Você poderia descrever em detalhes o que aconteceu no dia do incidente?`,
            `3. Em que data e horário aproximado ocorreu o incidente?`,
            `4. Você estava presente no local quando o fato ocorreu?`,
            `5. Você conseguiu identificar algum suspeito ou testemunha?`,
            `6. Houve alguma ameaça ou violência durante o incidente?`,
            `7. Quais objetos ou valores foram subtraídos ou danificados?`,
            `8. Você notou algo suspeito antes ou depois do ocorrido?`,
            `9. Você tem alguma suspeita sobre quem poderia ter cometido o crime?`,
            `10. Há alguma informação adicional que você considere relevante para a investigação?`,
            `11. Você deseja representar criminalmente contra o(s) autor(es) do fato?`,
            `12. Você deseja solicitar medidas protetivas de urgência?`,
            `13. Você já registrou outras ocorrências relacionadas a este mesmo fato ou autor?`,
            `14. Você possui alguma prova ou evidência que possa auxiliar na investigação?`,
            `15. Você tem conhecimento de outras vítimas do mesmo crime ou autor?`
        ],
        "Depoimento": [
            `1. Qual é o seu nome completo e qual sua relação com os fatos descritos?`,
            `2. Você poderia descrever detalhadamente o que presenciou no dia do incidente?`,
            `3. Em que data e horário aproximado você testemunhou o ocorrido?`,
            `4. Onde você estava no momento do fato e como chegou ao local?`,
            `5. Você conseguiu identificar as pessoas envolvidas no incidente?`,
            `6. Você observou alguma ação suspeita antes ou depois do ocorrido?`,
            `7. Houve alguma conversa ou discussão entre as partes envolvidas?`,
            `8. Você notou a presença de armas ou outros objetos relevantes?`,
            `9. Você já havia presenciado situações semelhantes envolvendo as mesmas pessoas?`,
            `10. Há alguma informação adicional que você considere relevante para a investigação?`,
            `11. Você conhecia alguma das partes envolvidas antes do ocorrido?`,
            `12. Você conversou com alguém sobre o que presenciou após o ocorrido?`,
            `13. Você notou algo incomum no comportamento das pessoas envolvidas?`,
            `14. Você possui alguma gravação, foto ou outro registro do ocorrido?`,
            `15. Você tem conhecimento de outras testemunhas que presenciaram o fato?`
        ],
        "Interrogatório": [
            `1. Qual é o seu nome completo e onde você estava no dia e hora do incidente?`,
            `2. Você poderia descrever suas atividades no dia do ocorrido?`,
            `3. Qual é a sua relação com a vítima ou com o local do crime?`,
            `4. Você esteve presente no local do crime no momento do incidente?`,
            `5. Você conhece as outras pessoas envolvidas no caso?`,
            `6. Você possui algum álibi que possa ser verificado?`,
            `7. Por que você acha que está sendo investigado em relação a este caso?`,
            `8. Você possui antecedentes criminais ou já esteve envolvido em situações semelhantes?`,
            `9. Você tem conhecimento de quem poderia ter cometido o crime?`,
            `10. Há alguma informação adicional que você gostaria de fornecer?`,
            `11. Você pode explicar como seu nome foi associado a este caso?`,
            `12. Você possui alguma prova que possa comprovar sua inocência?`,
            `13. Você teve algum desentendimento recente com a vítima ou outras pessoas envolvidas?`,
            `14. Você possui algum motivo que justificaria a prática do crime em questão?`,
            `15. Você deseja acrescentar algo mais à sua declaração?`
        ]
    };
    
    // Seleciona as perguntas do tipo apropriado
    const questions = baseQuestions[type] || baseQuestions["Declarações"];
    
    // Limita ao número máximo de perguntas solicitado
    return questions.slice(0, Math.min(numQuestions, questions.length));
}
