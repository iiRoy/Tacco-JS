function handleFocusAlteration(currentWindowIdentifier) {
    function processSelectedPanel(retrievedPanel) {
        chrome.tabs.sendMessage(retrievedPanel.id, {}, function(transmissionResult) {
        });
    }
    chrome.tabs.getSelected(null, processSelectedPanel);
}

chrome.windows.onFocusChanged.addListener(handleFocusAlteration);

function createTabUpdateHandler(commChannel, targetPageIdentifier) {
    return function trackPageEvent(pageIdentifier, updateDetails, pageInfo) {
        if (pageIdentifier !== targetPageIdentifier) {
            return;
        }
        commChannel.postMessage('recharge');
    };
}

function manageExtensionConnections(commChannel) {
    commChannel.onMessage.addListener(function (incomingPayload) {
        if (incomingPayload.operationCode === 'enroll') {
            const monitoredPageIdentifier = incomingPayload.monitoredPageIdentifier;
            const pageRefreshMonitor = createTabUpdateHandler(commChannel, monitoredPageIdentifier);

            chrome.tabs.onUpdated.addListener(pageRefreshMonitor);

            commChannel.onDisconnect.addListener(function () {
                chrome.tabs.onUpdated.removeListener(pageRefreshMonitor);
            });
        }
    });
}

chrome.extension.onConnect.addListener(manageExtensionConnections);