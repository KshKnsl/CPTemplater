
document.addEventListener('DOMContentLoaded', function() {
    const languageDropdown = document.getElementById('lang');
    const codeArea = document.getElementById('code');
    const saveButton = document.getElementById('save');
    const clearButton = document.getElementById('clear');
    const autoPasteCheckbox = document.getElementById('automode');
    const statusBox = document.getElementById('status');

    loadUserTemplate();
    loadAutoPasteSetting();

    saveButton.addEventListener('click', saveTemplate);
    clearButton.addEventListener('click', clearTemplate);
    autoPasteCheckbox.addEventListener('change', saveAutoPasteSetting);

    function showStatusMessage(message, type = 'info') {
        statusBox.textContent = message;
        statusBox.className = `status ${type}`;
        setTimeout(() => {
            statusBox.style.display = 'none';
        }, 3000);
    }

    function saveTemplate() {
        const selectedLanguage = languageDropdown.value;
        const templateCode = codeArea.value.trim();
        if (!templateCode) {
            showStatusMessage('Please enter template code', 'error');
            return;
        }
        const template = {
            id: 'default',
            language: selectedLanguage,
            code: templateCode,
            createdAt: new Date().toISOString()
        };
        chrome.storage.sync.set({ template: template }, function() {
            showStatusMessage('Template saved successfully!', 'success');
        });
    }

    function loadUserTemplate() {
        chrome.storage.sync.get(['template'], function(result) {
            if (result.template) {
                languageDropdown.value = result.template.language;
                codeArea.value = result.template.code;
            }
        });
    }

    function clearTemplate() {
        codeArea.value = '';
        showStatusMessage('Template cleared', 'info');
    }

    function saveAutoPasteSetting() {
        chrome.storage.sync.set({ autoMode: autoPasteCheckbox.checked });
    }

    function loadAutoPasteSetting() {
        chrome.storage.sync.get(['autoMode'], function(result) {
            autoPasteCheckbox.checked = result.autoMode || false;
        });
    }

    codeArea.addEventListener('input', function() {
        const selectedLanguage = languageDropdown.value;
        const templateCode = codeArea.value;
        if (templateCode.trim()) {
            const template = {
                id: 'default',
                language: selectedLanguage,
                code: templateCode,
                createdAt: new Date().toISOString()
            };
            chrome.storage.sync.set({ template: template });
        }
    });

    languageDropdown.addEventListener('change', function() {
        const selectedLanguage = languageDropdown.value;
        const templateCode = codeArea.value;
        if (templateCode.trim()) {
            const template = {
                id: 'default',
                language: selectedLanguage,
                code: templateCode,
                createdAt: new Date().toISOString()
            };
            chrome.storage.sync.set({ template: template });
        }
    });
});
