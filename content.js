// content.js

// Function to wait for an element to exist.
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        function checkElement() {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
                return;
            }
            
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime > timeout) {
                reject(new Error(`Timeout esperando pelo elemento: ${selector}`));
                return;
            }
            
            setTimeout(checkElement, 100); // Check every 100ms
        }
        
        checkElement();
    });
}

// Tenta diferentes seletores para encontrar o conteúdo da ocorrência
async function tryMultipleSelectors() {
    // Lista de possíveis seletores para o conteúdo da ocorrência
    const selectors = [
        // Seletor original
        "#ppe-layout--content > div > ui-view > procedimento > div > div.ppe-card > div.ppe-card-content.no-padding > scrollable-tabset > div > div.spacer > div > div > div.tab-pane.ng-scope.active > div > relato-historico > div > div > div > div > p",
        // Seletores alternativos mais genéricos
        "relato-historico p",
        ".tab-pane.active relato-historico p",
        // Seletor para qualquer parágrafo dentro de um elemento com classe que contenha 'relato' ou 'historico'
        "[class*='relato'] p, [class*='historico'] p",
        // Seletor para qualquer elemento que possa conter o texto da ocorrência
        ".ppe-card-content p"
    ];
    
    // Tenta cada seletor até encontrar um que funcione
    for (const selector of selectors) {
        try {
            console.log(`Tentando seletor: ${selector}`);
            const element = await waitForElement(selector, 2000);
            if (element && element.innerText && element.innerText.trim().length > 0) {
                console.log(`Elemento encontrado com seletor: ${selector}`);
                return element;
            }
        } catch (error) {
            console.log(`Seletor falhou: ${selector}`, error.message);
            // Continue para o próximo seletor
        }
    }
    
    // Se chegou aqui, tenta uma abordagem mais genérica - procurar por qualquer parágrafo com texto substancial
    try {
        console.log("Tentando abordagem genérica - procurando por parágrafos com texto substancial");
        const paragraphs = document.querySelectorAll('p');
        for (const p of paragraphs) {
            if (p.innerText && p.innerText.trim().length > 100) { // Assume que um parágrafo com mais de 100 caracteres pode ser a ocorrência
                console.log("Encontrado parágrafo com texto substancial");
                return p;
            }
        }
    } catch (error) {
        console.error("Erro na abordagem genérica:", error);
    }
    
    throw new Error("Não foi possível encontrar o conteúdo da ocorrência");
}

async function extractData() {
    try {
        console.log("Iniciando extração de dados");
        
        // Tenta encontrar o elemento com o conteúdo da ocorrência
        const element = await tryMultipleSelectors();
        
        if (element) {
            const text = element.innerText.trim();
            console.log("Texto extraído:", text.substring(0, 50) + "..."); // Log primeiros 50 caracteres
            
            return {
                ocorrencia: text,
                found: true
            };
        }
    } catch (error) {
        console.error("Erro ao extrair dados:", error);
    }
    
    console.error("Não foi possível encontrar a área de ocorrência.");
    return { ocorrencia: "", found: false };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "extractData") {
        console.log("Recebida solicitação para extrair dados");
        
        extractData()
            .then(data => {
                console.log("Dados extraídos:", data.found ? "Encontrado" : "Não encontrado");
                sendResponse(data);
            })
            .catch(error => {
                console.error("Erro ao extrair dados:", error);
                sendResponse({ ocorrencia: "", found: false, error: error.message });
            });
        
        return true; // It's used because `extractData()` return a Promise.
    }
});