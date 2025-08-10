const languageOptions = {
    'cpp': ['C++', 'C++14', 'C++17', 'C++ (gcc)', 'C++ (g++)'],
    'java': ['Java', 'Java 8', 'JAVA'],
    'python': ['Python', 'Python 3', 'PYPY', 'PYPY3'],
    'c': ['C', 'C (gcc)'],
    'javascript': ['JavaScript', 'Node.js']
};

let isEditorReady = false;
let pageCheckInterval;
let hasPasted = false;

function checkIfEditorReady() {
    pageCheckInterval = setInterval(() => {
        const codeEditor = getEditorElement();
        const mainContainer = document.querySelector('.container');
        const aceEditorReady = document.querySelector('#submit-ide-v2') && (window.ace || document.querySelector('.ace_text-input'));
        if ((codeEditor || aceEditorReady) && mainContainer) {
            isEditorReady = true;
            clearInterval(pageCheckInterval);
            console.log('CodeChef Template Paster: Page ready');
            if (!hasPasted) {
                tryAutoPaste();
            }
        }
    }, 1000);
}

function tryAutoPaste() {
    chrome.storage.sync.get(['autoMode', 'template'], (result) => {
        if (result.autoMode && result.template && result.template.code) {
            setTimeout(() => {
                if (!hasPasted) {
                    performAutoPaste(result.template.code, result.template.language);
                }
            }, 2000);
        }
    });
}

function performAutoPaste(code, language) {
    try {
        hasPasted = true;
        const pasteResult = pasteTemplate(code, language);
        showPasteStatus('Template Auto-Pasted!', 'success');
        console.log('Auto-pasted template:', pasteResult);
    } catch (error) {
        console.error('Auto-paste failed:', error);
        showPasteStatus('Auto-paste failed', 'error');
        hasPasted = false;
    }
}

checkIfEditorReady();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'pasteTemplate') {
        if (!isEditorReady) {
            sendResponse({ success: false, error: 'Page not ready. Please wait a moment and try again.' });
            return true;
        }
        try {
            const result = pasteTemplate(request.code, request.language);
            sendResponse(result);
        } catch (error) {
            console.error('Error pasting template:', error);
            sendResponse({ success: false, error: error.message });
        }
    }
    return true;
});

function getEditorElement() {
    const selectors = [
        '#submit-ide-v2 .ace_text-input',
        '#submit-ide-v2',
        '.monaco-editor textarea',
        '.monaco-editor .inputarea',
        '.CodeMirror textarea',
        '.CodeMirror-scroll .CodeMirror-sizer textarea',
        '.ace_editor textarea',
        '.ace_text-input',
        '.ace_editor',
        'textarea[name="code"]',
        'textarea#code',
        'textarea.code-editor',
        'textarea[placeholder*="code"]',
        'textarea[placeholder*="Code"]',
        'div[data-mode] textarea',
        '.code-area textarea'
    ];
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && isElementVisible(element)) {
            return element;
        }
    }
    return null;
}

function isElementVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && style.visibility !== 'hidden' && element.offsetWidth > 0 && element.offsetHeight > 0;
}

function setLanguageSelector(targetLanguage) {
    const selectors = [
        'select[name="language"]',
        'select#language',
        '.language-selector select',
        'select[data-language]',
        '.form-control[name="language"]'
    ];
    for (const selector of selectors) {
        const languageDropdown = document.querySelector(selector);
        if (languageDropdown) {
            const options = Array.from(languageDropdown.options);
            const possibleNames = languageOptions[targetLanguage] || [targetLanguage];
            for (const langName of possibleNames) {
                const foundOption = options.find(option =>
                    option.text.toLowerCase().includes(langName.toLowerCase()) ||
                    option.value.toLowerCase().includes(langName.toLowerCase())
                );
                if (foundOption) {
                    languageDropdown.value = foundOption.value;
                    languageDropdown.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                }
            }
        }
    }
    return false;
}

function pasteTemplate(code, language) {
    let editor = getEditorElement();
    if (!editor) {
        throw new Error('Could not find code editor. Make sure you are on a CodeChef problem page.');
    }
    const languageSet = setLanguageSelector(language);
    let aceEditorInstance = null;
    if (editor.id === 'submit-ide-v2' || editor.classList.contains('ace_editor')) {
        if (window.ace && window.ace.edit) {
            aceEditorInstance = window.ace.edit(editor.id || editor);
        }
    }
    try {
        if (aceEditorInstance) {
            aceEditorInstance.setValue(code, -1);
            aceEditorInstance.clearSelection();
            aceEditorInstance.focus();
        } else {
            if (editor.classList.contains('ace_editor')) {
                const textarea = editor.querySelector('.ace_text-input');
                if (textarea) {
                    editor = textarea;
                }
            }
            editor.value = code;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            editor.focus();
            editor.select();
            if (document.execCommand) {
                document.execCommand('selectAll');
                document.execCommand('delete');
                document.execCommand('insertText', false, code);
            }
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: code
            });
            editor.dispatchEvent(inputEvent);
            editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            if (editor.closest('.monaco-editor')) {
                const monaco = editor.closest('.monaco-editor');
                const inst = monaco.querySelector('.monaco-editor');
                if (inst && window.monaco) {
                    setTimeout(() => {
                        const model = window.monaco.editor.getModels()[0];
                        if (model) {
                            model.setValue(code);
                        }
                    }, 100);
                }
            }
            if (editor.closest('.CodeMirror')) {
                const cm = editor.closest('.CodeMirror');
                if (cm && cm.CodeMirror) {
                    cm.CodeMirror.setValue(code);
                }
            }
            setTimeout(() => {
                if (editor.value !== code) {
                    editor.value = code;
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, 200);
        }
        return {
            success: true,
            message: languageSet ?
                `Template pasted and language set to ${language}` :
                `Template pasted (please verify language is set to ${language})`
        };
    } catch (error) {
        throw new Error(`Failed to paste code: ${error.message}`);
    }
}

function showPasteStatus(message, type = 'info') {
    const existingIndicator = document.getElementById('codechef-template-indicator');
    if (existingIndicator) existingIndicator.remove();
    const indicator = document.createElement('div');
    indicator.id = 'codechef-template-indicator';
    const colorMap = {
        success: '#48bb78',
        error: '#f56565',
        info: '#4299e1'
    };
    indicator.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${colorMap[type] || colorMap.info};
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: bold;
        z-index: 10000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    indicator.textContent = message;
    document.body.appendChild(indicator);
    setTimeout(() => {
        indicator.style.opacity = '1';
    }, 100);
    setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 300);
    }, 3000);
}

function showReadyIndicator() {
    showPasteStatus('Template Paster Ready', 'info');
}

setTimeout(() => {
    if (isEditorReady) {
        showReadyIndicator();
    }
}, 2000);

window.addEventListener('beforeunload', () => {
    if (pageCheckInterval) {
        clearInterval(pageCheckInterval);
    }
});
