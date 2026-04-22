const configurationManifest = {
    displayName: "ViewSelectedItems",
    internalIdentifier: "view-selected-items-action",
    triggerContexts: ["selection"]
};

const eventRegistrar = (eventTarget, callbackFunction) =>
    eventTarget.addListener(callbackFunction);

const generateMenuItem = (config) =>
    window.chrome.contextMenus.create({
        title: config.displayName,
        id: config.internalIdentifier,
        contexts: config.triggerContexts
    });

const processMenuClick = (rawClickData) => {
    const { menuItemId: currentActionId, selectionText: capturedText } = rawClickData;

    const actionDispatcher = (actionId, content) => {
        const dispatchMap = {
            [configurationManifest.internalIdentifier]: () => window.openList(content),
        };
        return dispatchMap[actionId] ? dispatchMap[actionId]() : undefined;
    };

    if (currentActionId && capturedText) {
        actionDispatcher(currentActionId, capturedText);
    }
};

eventRegistrar(window.chrome.runtime.onInstalled, (installationRecord) => {
    generateMenuItem(configurationManifest);

    eventRegistrar(window.chrome.contextMenus.onClicked, (clickPayload, currentWindowTab) => {
        processMenuClick(clickPayload);
    });
});