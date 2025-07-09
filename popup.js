document.addEventListener('DOMContentLoaded', function() {
    const lang = document.getElementById('lang');
    const code = document.getElementById('code');
    const saveBtn = document.getElementById('save');
    const clearBtn = document.getElementById('clear');
    const autoMode = document.getElementById('automode');
    const status = document.getElementById('status');

    loadTemplate();
    loadSettings();

    // Event listeners
    saveBtn.addEventListener('click', save);
    clearBtn.addEventListener('click', clear);
    autoMode.addEventListener('change', saveSettings);

    function showStatus(msg, type = 'info') {
        status.textContent = msg;
        status.className = `status ${type}`;
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }

    function save() {
        const l = lang.value;
        const c = code.value.trim();

        if (!c) {
            showStatus('Please enter template code', 'error');
            return;
        }

        const template = {
            id: 'default',
            language: l,
            code: c,
            createdAt: new Date().toISOString()
        };

        chrome.storage.sync.set({ template: template }, function() {
            showStatus('Template saved successfully!', 'success');
        });
    }

    function loadTemplate() {
        chrome.storage.sync.get(['template'], function(result) {
            if (result.template) {
                lang.value = result.template.language;
                code.value = result.template.code;
            }
        });
    }

    function clear() {
        code.value = '';
        showStatus('Template cleared', 'info');
    }

    function saveSettings() {
        chrome.storage.sync.set({ autoMode: autoMode.checked });
    }

    function loadSettings() {
        chrome.storage.sync.get(['autoMode'], function(result) {
            autoMode.checked = result.autoMode || false;
        });
    }

    // Auto-save template as user types
    code.addEventListener('input', function() {
        const l = lang.value;
        const c = code.value;
        if (c.trim()) {
            const template = {
                id: 'default',
                language: l,
                code: c,
                createdAt: new Date().toISOString()
            };
            chrome.storage.sync.set({ template: template });
        }
    });

    lang.addEventListener('change', function() {
        const l = lang.value;
        const c = code.value;
        if (c.trim()) {
            const template = {
                id: 'default',
                language: l,
                code: c,
                createdAt: new Date().toISOString()
            };
            chrome.storage.sync.set({ template: template });
        }
    });
});
