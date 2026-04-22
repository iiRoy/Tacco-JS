const PersistentDataStoreAdapter = (function(originalStore) {
    if (typeof originalStore === 'undefined') {
        console.warn("Global 'styleStorage' not found. Using a mock PersistentDataStoreAdapter.");
        originalStore = {
            _internalData: {},
            each: function(cb) { for (let k in this._internalData) { if (Object.prototype.hasOwnProperty.call(this._internalData, k)) cb(k, this._internalData[k]); } },
            getItem: function(k) { return this._internalData[k]; },
            removeItem: function(k) { delete this._internalData[k]; },
            setItem: function(k, v) { this._internalData[k] = v; }
        };
    }

    return {
        iterateAll: function(actionCallback) {
            originalStore.each(actionCallback);
        },
        fetchEntry: function(keyIdentifier) {
            return originalStore.getItem(keyIdentifier);
        },
        discardEntry: function(keyIdentifier) {
            originalStore.removeItem(keyIdentifier);
        },
        storeEntry: function(keyIdentifier, valuePayload) {
            originalStore.setItem(keyIdentifier, valuePayload);
        },
        getAllEntries: function() {
            const collection = [];
            originalStore.each((k, v) => collection.push({ identifier: k, payload: v }));
            return collection;
        }
    };
})(typeof styleStorage !== 'undefined' ? styleStorage : undefined);

const AppHostInterface = (function(globalSafari) {
    if (typeof globalSafari === 'undefined') {
        console.warn("Global 'safari' object not found. Using a mock AppHostInterface.");
        globalSafari = {
            extension: {
                removeContentStyleSheets: () => {},
                addContentStyleSheet: (s, d, e) => {},
                baseURI: 'safari-extension://mock-base-uri/',
                settings: { enableContextMenu: true }
            },
            application: {
                activeBrowserWindow: {
                    activeTab: { url: '', openTab: (mode) => ({ url: '' }) },
                    openTab: (mode) => ({ url: '' })
                },
                addEventListener: (e, h, b) => {}
            },
            localStorage: {
                length: 0
            }
        };
    }

    return {
        extensionServices: {
            purgeStyleSheets: function() {
                globalSafari.extension.removeContentStyleSheets();
            },
            applyStyleSheet: function(contentData, includePatterns, excludePatterns) {
                globalSafari.extension.addContentStyleSheet(contentData, includePatterns, excludePatterns);
            },
            baseResourceURI: globalSafari.extension.baseURI,
            configuration: {
                get contextMenuEnabled() {
                    return globalSafari.extension.settings.enableContextMenu;
                }
            }
        },
        appServices: {
            activeUserWindow: globalSafari.application.activeBrowserWindow,
            addAppListener: function(eventType, eventHandler, useCaptureFlag) {
                globalSafari.application.addEventListener(eventType, eventHandler, useCaptureFlag);
            }
        },
        getLocalStorageLength: function() {
            return globalSafari.localStorage.length;
        },
        sendPageMessage: function(pageObjectRef, messageNameStr, messagePayloadData) {
            pageObjectRef.dispatchMessage(messageNameStr, messagePayloadData);
        }
    };
})(typeof safari !== 'undefined' ? safari : undefined);

const normalizeDomainPatterns = (inputPatterns) => {
    const patternProcessor = (currentPattern) => {
        if (currentPattern === '') {
            return null;
        }
        // Check if the pattern contains a protocol://host/ segment
        const containsFullUrlSegment = /(?:https?):\/\/[^/]+\//;

        if (!containsFullUrlSegment.test(currentPattern)) {
            if (currentPattern.endsWith('*')) {
                return currentPattern.slice(0, -1) + '/*';
            } else {
                return currentPattern + '/';
            }
        }
        return currentPattern;
    };

    return inputPatterns
        .map(patternProcessor)
        .filter(pattern => pattern !== null);
};

const reinitiateStyleProvisioning = () => {
    AppHostInterface.extensionServices.purgeStyleSheets();

    const allConfiguredStyles = PersistentDataStoreAdapter.getAllEntries();

    allConfiguredStyles
        .filter(entry => entry.payload.enabled)
        .forEach(entry => {
            const { cssContent, inclusionPatterns, exclusionPatterns } = {
                cssContent: entry.payload.styles,
                inclusionPatterns: entry.payload.domains,
                exclusionPatterns: entry.payload.excludes
            };

            const processedInclusions = normalizeDomainPatterns(inclusionPatterns);
            const processedExclusions = normalizeDomainPatterns(exclusionPatterns);

            processedExclusions.push(AppHostInterface.extensionServices.baseResourceURI + '*');

            AppHostInterface.extensionServices.applyStyleSheet(
                cssContent,
                processedInclusions,
                processedExclusions
            );
        });
};

const commandHandlers = new Map([
    ['manage-user-css', (instruction) => {
        const managementInterfaceURI = AppHostInterface.extensionServices.baseResourceURI + 'manage/manage.html';
        const activeWindow = AppHostInterface.appServices.activeUserWindow;
        const activeTabInstance = activeWindow.activeTab;

        activeTabInstance.url === ""
            ? (activeTabInstance.url = managementInterfaceURI)
            : (activeWindow.openTab('foreground').url = managementInterfaceURI);
    }]
]);

const processCommandEvent = (instruction) => {
    const handler = commandHandlers.get(instruction.command);
    if (handler) {
        handler(instruction);
    }
};

const messageProcessors = new Map([
    ['reloadStyles', (messagePacket) => {
        reinitiateStyleProvisioning();
    }],
    ['getItem', (messagePacket) => {
        const retrievedItem = PersistentDataStoreAdapter.fetchEntry(messagePacket.message);
        AppHostInterface.sendPageMessage(messagePacket.target.page, 'getItem', [messagePacket.message, retrievedItem]);
    }],
    ['removeItem', (messagePacket) => {
        PersistentDataStoreAdapter.discardEntry(messagePacket.message);
    }],
    ['setItem', (messagePacket) => {
        PersistentDataStoreAdapter.storeEntry(messagePacket.message[0], messagePacket.message[1]);
    }],
    ['items', (messagePacket) => {
        const allEntries = PersistentDataStoreAdapter.getAllEntries();
        AppHostInterface.sendPageMessage(messagePacket.target.page, 'items', allEntries);
    }],
    ['shouldConvert', (messagePacket) => {
        if (AppHostInterface.getLocalStorageLength() === 0) {
            AppHostInterface.sendPageMessage(messagePacket.target.page, 'shouldConvert', true);
        }
    }]
]);

const processInterprocessMessage = (messagePacket) => {
    const processor = messageProcessors.get(messagePacket.name);
    if (processor) {
        processor(messagePacket);
    }
};

const validationHandlers = new Map([
    ['ManageUserCssItem', (validationRequest) => {
        validationRequest.target.disabled = !AppHostInterface.extensionServices.configuration.contextMenuEnabled;
    }]
]);

const processValidationEvent = (validationRequest) => {
    const handler = validationHandlers.get(validationRequest.target.identifier);
    if (handler) {
        handler(validationRequest);
    }
};

AppHostInterface.appServices.addAppListener('command', processCommandEvent, false);
AppHostInterface.appServices.addAppListener('message', processInterprocessMessage, false);
AppHostInterface.appServices.addAppListener('validate', processValidationEvent, false);

reinitiateStyleProvisioning();