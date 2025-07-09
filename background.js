chrome.runtime.onInstalled.addListener(() => {
    console.log('CodeChef Template Paster installed');
    
    // Set default template (single template only)
    chrome.storage.sync.get(['template'], (res) => {
        if (!res.template) {
            const defaultTemplate = {
                id: 'default',
                language: 'cpp',
                code: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int t;
    cin >> t;
    
    while(t--) {
        // Your code here
        
    }
    
    return 0;
}`,
                createdAt: new Date().toISOString()
            };
            
            chrome.storage.sync.set({ template: defaultTemplate });
        }
    });
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
    // The popup will handle this, but we can add additional logic here if needed
    console.log('Extension icon clicked on tab:', tab.url);
});

// Listen for tab updates to ensure content script is ready
chrome.tabs.onUpdated.addListener((id, info, tab) => {
    if (info.status === 'complete' && tab.url && tab.url.includes('codechef.com')) {
        // Inject content script if not already injected
        chrome.scripting.executeScript({
            target: { tabId: id },
            files: ['content.js']
        }).catch(err => {
            // Script might already be injected, ignore error
            console.log('Content script injection:', err.message);
        });
    }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if (req.action === 'getActiveTab') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            sendRes({ tab: tabs[0] });
        });
        return true;
    }
});
