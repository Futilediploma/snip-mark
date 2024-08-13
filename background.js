chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received in background script:', request);

    if (request.action === 'captureVisibleTab') {
        console.log('Capturing visible tab');

        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
            if (tabs.length === 0) {
                console.error('No active tab found');
                sendResponse({ screenshot: null });
                return;
            }

            chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, function(dataUrl) {
                if (chrome.runtime.lastError) {
                    console.error('Error capturing visible tab:', chrome.runtime.lastError);
                    sendResponse({ screenshot: null });
                } else {
                    console.log('Tab captured successfully');

                    // Create a new tab with the editor page
                    chrome.tabs.create({ url: 'editor.html' }, function(tab) {
                        // Pass the captured image data to the new tab
                        chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                            if (tabId === tab.id && info.status === 'complete') {
                                chrome.tabs.sendMessage(tabId, { action: 'loadImage', dataUrl: dataUrl });
                                chrome.tabs.onUpdated.removeListener(listener);
                            }
                        });
                    });
                }
            });
        });

        // Keeps the message channel open until sendResponse is called
        return true;
    }
});
