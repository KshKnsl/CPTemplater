// Content script for CodeChef Template Paster
// This script runs on CodeChef pages and handles automatic template pasting

// Language mapping for CodeChef
const langMap = {
    'cpp': ['C++', 'C++14', 'C++17', 'C++ (gcc)', 'C++ (g++)'],
    'java': ['Java', 'Java 8', 'JAVA'],
    'python': ['Python', 'Python 3', 'PYPY', 'PYPY3'],
    'c': ['C', 'C (gcc)'],
    'javascript': ['JavaScript', 'Node.js']
};

// Wait for page to be fully loaded
let ready = false;
let interval;
let pasted = false; // Prevent multiple pastes

function waitForReady() {
    interval = setInterval(() => {
        const editor = findEditor();
        const container = document.querySelector('.container');
        
        // Also check if Ace editor is specifically ready
        const aceReady = document.querySelector('#submit-ide-v2') && 
                        (window.ace || document.querySelector('.ace_text-input'));
        
        if ((editor || aceReady) && container) {
            ready = true;
            clearInterval(interval);
            console.log('CodeChef Template Paster: Page ready');
            
            // Auto-paste if enabled and not already pasted
            if (!pasted) {
                checkAutoPaste();
            }
        }
    }, 1000);
}

function checkAutoPaste() {
    chrome.storage.sync.get(['autoMode', 'template'], (result) => {
        if (result.autoMode && result.template && result.template.code) {
            setTimeout(() => {
                if (!pasted) {
                    autoPaste(result.template.code, result.template.language);
                }
            }, 2000); // Wait 2 seconds for editor to fully load
        }
    });
}

function autoPaste(code, language) {
    try {
        pasted = true;
        const result = paste(code, language);
        
        // Show success indicator
        showIndicator('Template Auto-Pasted!', 'success');
        console.log('Auto-pasted template:', result);
    } catch (error) {
        console.error('Auto-paste failed:', error);
        showIndicator('Auto-paste failed', 'error');
        pasted = false; // Allow retry
    }
}

// Start checking when content script loads
waitForReady();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if (req.action === 'pasteTemplate') {
        if (!ready) {
            sendRes({ success: false, error: 'Page not ready. Please wait a moment and try again.' });
            return true;
        }

        try {
            const result = paste(req.code, req.language);
            sendRes(result);
        } catch (error) {
            console.error('Error pasting template:', error);
            sendRes({ success: false, error: error.message });
        }
    }
    return true;
});

function findEditor() {
    // Try multiple selectors for different CodeChef layouts
    const sels = [
        // Specific CodeChef Ace Editor
        '#submit-ide-v2 .ace_text-input',
        '#submit-ide-v2',
        
        // Monaco Editor (new CodeChef)
        '.monaco-editor textarea',
        '.monaco-editor .inputarea',
        
        // CodeMirror Editor
        '.CodeMirror textarea',
        '.CodeMirror-scroll .CodeMirror-sizer textarea',
        
        // Ace Editor (general)
        '.ace_editor textarea',
        '.ace_text-input',
        '.ace_editor',
        
        // Simple textarea
        'textarea[name="code"]',
        'textarea#code',
        'textarea.code-editor',
        
        // Generic selectors
        'textarea[placeholder*="code"]',
        'textarea[placeholder*="Code"]',
        'div[data-mode] textarea',
        '.code-area textarea'
    ];

    for (const sel of sels) {
        const el = document.querySelector(sel);
        if (el && isVisible(el)) {
            return el;
        }
    }

    return null;
}

function isVisible(el) {
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           el.offsetWidth > 0 && 
           el.offsetHeight > 0;
}

function setLang(target) {
    // Try to find and set language selector
    const sels = [
        'select[name="language"]',
        'select#language',
        '.language-selector select',
        'select[data-language]',
        '.form-control[name="language"]'
    ];

    for (const sel of sels) {
        const langSel = document.querySelector(sel);
        if (langSel) {
            const opts = Array.from(langSel.options);
            const possible = langMap[target] || [target];
            
            for (const lang of possible) {
                const opt = opts.find(o => 
                    o.text.toLowerCase().includes(lang.toLowerCase()) ||
                    o.value.toLowerCase().includes(lang.toLowerCase())
                );
                
                if (opt) {
                    langSel.value = opt.value;
                    langSel.dispatchEvent(new Event('change', { bubbles: true }));
                    return true;
                }
            }
        }
    }
    
    return false;
}

function paste(c, l) {
    let editor = findEditor();
    
    if (!editor) {
        throw new Error('Could not find code editor. Make sure you are on a CodeChef problem page.');
    }

    // Try to set language first
    const langSet = setLang(l);
    
    // For Ace Editor, try to get the actual Ace instance
    let aceEditor = null;
    if (editor.id === 'submit-ide-v2' || editor.classList.contains('ace_editor')) {
        // This is the Ace Editor container, find the actual editor instance
        if (window.ace && window.ace.edit) {
            aceEditor = window.ace.edit(editor.id || editor);
        }
    }
    
    // Clear existing code and set new code
    try {
        if (aceEditor) {
            // Use Ace Editor API
            aceEditor.setValue(c, -1); // -1 moves cursor to start
            aceEditor.clearSelection();
            aceEditor.focus();
        } else {
            // Fallback to textarea methods
            if (editor.classList.contains('ace_editor')) {
                // Find the hidden textarea within ace editor
                const textarea = editor.querySelector('.ace_text-input');
                if (textarea) {
                    editor = textarea;
                }
            }
            
            // Method 1: Direct value assignment
            editor.value = c;
            editor.dispatchEvent(new Event('input', { bubbles: true }));
            editor.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Method 2: Simulate typing for advanced editors
            editor.focus();
            editor.select();
            
            // Try using execCommand for better compatibility
            if (document.execCommand) {
                document.execCommand('selectAll');
                document.execCommand('delete');
                document.execCommand('insertText', false, c);
            }
            
            // Method 3: Trigger keyboard events
            const inputEvent = new InputEvent('input', {
                bubbles: true,
                cancelable: true,
                inputType: 'insertText',
                data: c
            });
            editor.dispatchEvent(inputEvent);
            
            // Additional events for Monaco/CodeMirror/Ace editors
            editor.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
            editor.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
            
            // Special handling for Monaco Editor
            if (editor.closest('.monaco-editor')) {
                const monaco = editor.closest('.monaco-editor');
                const inst = monaco.querySelector('.monaco-editor');
                if (inst && window.monaco) {
                    // If Monaco API is available, use it
                    setTimeout(() => {
                        const model = window.monaco.editor.getModels()[0];
                        if (model) {
                            model.setValue(c);
                        }
                    }, 100);
                }
            }
            
            // Special handling for CodeMirror
            if (editor.closest('.CodeMirror')) {
                const cm = editor.closest('.CodeMirror');
                if (cm && cm.CodeMirror) {
                    cm.CodeMirror.setValue(c);
                }
            }
            
            // Verify the code was set
            setTimeout(() => {
                if (editor.value !== c) {
                    // Fallback: try setting value again
                    editor.value = c;
                    editor.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }, 200);
        }
        
        return {
            success: true,
            message: langSet ? 
                `Template pasted and language set to ${l}` : 
                `Template pasted (please verify language is set to ${l})`
        };
        
    } catch (error) {
        throw new Error(`Failed to paste code: ${error.message}`);
    }
}

// Add visual feedback when extension is active
function showIndicator(msg, type = 'info') {
    const existingInd = document.getElementById('codechef-template-indicator');
    if (existingInd) existingInd.remove();
    
    const ind = document.createElement('div');
    ind.id = 'codechef-template-indicator';
    
    const colors = {
        success: '#48bb78',
        error: '#f56565',
        info: '#4299e1'
    };
    
    ind.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: ${colors[type] || colors.info};
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
    ind.textContent = msg;
    
    document.body.appendChild(ind);
    
    setTimeout(() => {
        ind.style.opacity = '1';
    }, 100);
    
    setTimeout(() => {
        ind.style.opacity = '0';
        setTimeout(() => {
            if (ind.parentNode) {
                ind.parentNode.removeChild(ind);
            }
        }, 300);
    }, 3000);
}

function addIndicator() {
    showIndicator('Template Paster Ready', 'info');
}

// Show indicator when page is ready
setTimeout(() => {
    if (ready) {
        addIndicator();
    }
}, 2000);

// Clean up interval when page unloads
window.addEventListener('beforeunload', () => {
    if (interval) {
        clearInterval(interval);
    }
});
