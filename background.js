chrome.runtime.onInstalled.addListener(() => {
    console.log('CodeChef Template Paster installed');
    chrome.storage.sync.get(['template'], (result) => {
        if (!result.template) {
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

    }
    return 0;
}`,
                createdAt: new Date().toISOString()
            };
            chrome.storage.sync.set({ template: defaultTemplate });
        }
    });
});

chrome.action.onClicked.addListener((tabInfo) => {
    console.log('Extension icon clicked on tab:', tabInfo.url);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
    if (changeInfo.status === 'complete' && tabInfo.url && tabInfo.url.includes('codechef.com')) {
        chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
        }).catch(error => {
            console.log('Content script injection:', error.message);
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getActiveTab') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            sendResponse({ tab: tabs[0] });
        });
        return true;
    }
});
