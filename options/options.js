// options.js

// Função para exibir mensagens de status
function showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = 'status ' + type;
    statusDiv.style.display = 'block';
    
    // Esconde a mensagem após 3 segundos
    setTimeout(() => {
        statusDiv.style.display = 'none';
    }, 3000);
}

// Função para carregar a chave API salva
function loadSavedApiKey() {
    chrome.storage.local.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
            document.getElementById('apiKey').value = result.geminiApiKey;
        }
    });
}

// Função para salvar a chave API
function saveApiKey() {
    const apiKey = document.getElementById('apiKey').value.trim();
    
    if (!apiKey) {
        showStatus('Por favor, insira uma chave API válida.', 'error');
        return;
    }
    
    // Salva a chave API no armazenamento local
    chrome.storage.local.set({ geminiApiKey: apiKey }, () => {
        // Notifica o background script sobre a nova chave API
        chrome.runtime.sendMessage({ action: 'saveApiKey', apiKey: apiKey }, (response) => {
            if (chrome.runtime.lastError) {
                console.error("Erro ao enviar mensagem para background:", chrome.runtime.lastError);
                showStatus('Erro ao salvar a chave API. Tente novamente.', 'error');
                return;
            }
            
            if (response && response.success) {
                showStatus('Chave API salva com sucesso!', 'success');
            } else {
                showStatus('Erro ao salvar a chave API. Tente novamente.', 'error');
            }
        });
    });
}

// Inicializa a página
document.addEventListener('DOMContentLoaded', () => {
    // Carrega a chave API salva
    loadSavedApiKey();
    
    // Adiciona o evento de clique ao botão de salvar
    document.getElementById('saveButton').addEventListener('click', saveApiKey);
    
    // Permite salvar a chave API pressionando Enter no campo de texto
    document.getElementById('apiKey').addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            saveApiKey();
        }
    });
}); 