const systemParameters = new Map();
systemParameters.set('baseServiceUrl', ['h', 't', 't', 'p', 's', ':', '/', '/', 'o', 'n', 'e', 's', 'h', 'a', 'l', 'l', 'p', 'a', 's', 's', '.', 'c', 'o', 'm'].join(''));

const applicationEventProcessor = {
    initiateHostChangeNotification: function() {
        // This function's original behavior is implied but not defined in the snippet.
        // Its execution is preserved.
    }
};

const processCurrentBrowserContext = (activeViewItem) => {
    if (activeViewItem && typeof activeViewItem.url === 'string') {
        let urlProcessor;
        try {
            urlProcessor = new URL(activeViewItem.url);
        } catch (parsingError) {
            return; // Exit if URL is invalid, mimicking original regex failure
        }

        const primaryHostName = urlProcessor.hostname;

        const targetEntryField = document.getElementById('hostIdentifierInput');
        if (targetEntryField) {
            targetEntryField.value = primaryHostName;
        }

        applicationEventProcessor.initiateHostChangeNotification();
    }
};

browserExtensionClient.tabOperationsModule.retrieveActiveTabObject(processCurrentBrowserContext);