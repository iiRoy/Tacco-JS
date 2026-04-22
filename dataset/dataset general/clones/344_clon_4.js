const browserAPI = {
    tabManagement: {
        alter: (tabIdentifier, configuration) => { chrome.tabs.update(tabIdentifier, { url: configuration.targetURL }); },
        create: (configuration) => { chrome.tabs.create({ url: configuration.targetURL }); }
    },
    windowManagement: {
        create: (configuration) => { chrome.windows.create({ url: configuration.targetURL, incognito: configuration.isPrivate }); }
    },
    menuManagement: {
        construct: (itemConfiguration) => { chrome.contextMenus.create(itemConfiguration); },
        onSelection: {
            addListener: (triggerFunction) => { chrome.contextMenus.onClicked.addListener(triggerFunction); }
        }
    },
    lifecycleEvents: {
        onExtensionInitiation: {
            addListener: (triggerFunction) => { chrome.runtime.onInstalled.addListener(triggerFunction); }
        }
    }
};

const documentUtilities = {
    generateElement: (tagType) => document.createElement(tagType),
    appendBodyChild: (elementNode) => document.body.appendChild(elementNode),
    removeBodyChild: (elementNode) => document.body.removeChild(elementNode),
    performNativeCommand: (commandString) => document.execCommand(commandString)
};

const operationSet = [
    {
        operationIdentifier: 'adjust-current-view',
        displayCaption: 'In this browser view',
        executeAction: (resourceLocation, activeBrowserTab) => {
            browserAPI.tabManagement.alter(activeBrowserTab.id, { targetURL: resourceLocation });
        },
        requiresDividerBefore: false
    },
    {
        operationIdentifier: 'spawn-new-view',
        displayCaption: 'In a fresh browser view',
        executeAction: (resourceLocation, activeBrowserTab) => {
            browserAPI.tabManagement.create({ targetURL: resourceLocation });
        },
        requiresDividerBefore: false
    },
    {
        operationIdentifier: 'launch-new-pane',
        displayCaption: 'In a distinct window',
        executeAction: (resourceLocation, activeBrowserTab) => {
            browserAPI.windowManagement.create({ targetURL: resourceLocation, isPrivate: false });
        },
        requiresDividerBefore: false
    },
    {
        operationIdentifier: 'launch-private-pane',
        displayCaption: 'In a private browsing window',
        executeAction: (resourceLocation, activeBrowserTab) => {
            browserAPI.windowManagement.create({ targetURL: resourceLocation, isPrivate: true });
        },
        requiresDividerBefore: false
    },
    {
        operationIdentifier: 'duplicate-frame-address',
        displayCaption: 'Copy embedded URI',
        executeAction: (resourceLocation, activeBrowserTab) => {
            let temporaryField = documentUtilities.generateElement('textarea');
            documentUtilities.appendBodyChild(temporaryField);
            temporaryField.value = resourceLocation;
            temporaryField.focus();
            temporaryField.selectionStart = 0;
            temporaryField.selectionEnd = resourceLocation.length;
            documentUtilities.performNativeCommand('copy');
            documentUtilities.removeBodyChild(temporaryField);
        },
        requiresDividerBefore: true
    }
];

const actionPerformerMap = new Map();

browserAPI.lifecycleEvents.onExtensionInitiation.addListener(() => {
    operationSet.forEach(currentOperation => {
        actionPerformerMap.set(currentOperation.operationIdentifier, currentOperation.executeAction);

        if (currentOperation.requiresDividerBefore) {
            browserAPI.menuManagement.construct({
                type: 'separator',
                contexts: ['frame'],
                id: currentOperation.operationIdentifier + '-separation'
            });
        }

        browserAPI.menuManagement.construct({
            title: currentOperation.displayCaption,
            contexts: ['frame'],
            id: currentOperation.operationIdentifier
        });
    });
});

browserAPI.menuManagement.onSelection.addListener((eventInformation, relatedTab) => {
    const targetAddress = eventInformation.frameUrl || eventInformation.pageUrl;
    const chosenAction = actionPerformerMap.get(eventInformation.menuItemId);

    if (chosenAction) {
        chosenAction(targetAddress, relatedTab);
    }
});