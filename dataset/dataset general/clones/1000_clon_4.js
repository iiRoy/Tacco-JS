const serviceHost = window.applicationConfig.apiGateway;
const displayLimit = window.applicationConfig.maxDisplayItems;

// --- Core Utility: Network Operation Management (replaces Pollymer.Request) ---
class NetworkOperation {
    constructor(options) {
        this.maximumAttempts = options.maximumAttempts || 1;
        this.failingCodeRanges = this.parseCodeRanges(options.failingCodes);
        this.currentAttempt = 0;
        this.signalController = new AbortController();
        this.eventObservers = {
            failure: [],
            completion: []
        };
    }

    parseCodeRanges(codesString) {
        if (!codesString) return [];
        const ranges = [];
        codesString.split(',').forEach(part => {
            const trimmed = part.trim();
            if (trimmed.includes('-')) {
                const [start, end] = trimmed.split('-').map(Number);
                ranges.push({ start, end });
            } else {
                const code = Number(trimmed);
                ranges.push({ start: code, end: code });
            }
        });
        return ranges;
    }

    isErrorRetryable(statusCode) {
        if (!statusCode) return false;
        return this.failingCodeRanges.some(range => statusCode >= range.start && statusCode <= range.end);
    }

    triggerEvent(eventName, ...args) {
        this.eventObservers[eventName].forEach(callback => callback(...args));
    }

    attachObserver(eventName, callback) {
        if (this.eventObservers[eventName]) {
            this.eventObservers[eventName].push(callback);
        }
    }

    detachObserver(eventName, callback) {
        if (this.eventObservers[eventName]) {
            this.eventObservers[eventName] = this.eventObservers[eventName].filter(cb => cb !== callback);
        }
    }

    async execute(verb, endpoint, payload = null) {
        this.currentAttempt++;
        try {
            const requestOptions = {
                method: verb,
                signal: this.signalController.signal,
                headers: {
                    'Content-Type': 'application/json'
                }
            };
            if (payload) {
                requestOptions.body = JSON.stringify(payload);
            }

            const response = await fetch(endpoint, requestOptions);
            const responseText = await response.text();

            let parsedContent = responseText;
            try {
                parsedContent = JSON.parse(responseText);
            } catch (e) { /* Not JSON, keep as text */ }

            if (response.ok) {
                this.triggerEvent('completion', response.status, parsedContent, response.headers);
                return { code: response.status, result: parsedContent, headers: response.headers };
            } else if (this.isErrorRetryable(response.status) && (this.maximumAttempts === -1 || this.currentAttempt < this.maximumAttempts)) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.currentAttempt) * 100));
                return this.execute(verb, endpoint, payload);
            } else {
                this.triggerEvent('failure', { status: response.status, message: parsedContent });
                throw { code: response.status, result: parsedContent, headers: response.headers };
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                this.triggerEvent('failure', { status: -2, message: 'Request terminated' });
                throw { code: -2, result: 'Request terminated' };
            } else if (this.maximumAttempts === -1 || this.currentAttempt < this.maximumAttempts) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.currentAttempt) * 100));
                return this.execute(verb, endpoint, payload);
            } else {
                this.triggerEvent('failure', { status: -1, message: error.message || 'Network issue' });
                throw { code: -1, result: error.message || 'Network issue' };
            }
        }
    }

    halt() {
        this.signalController.abort();
    }
}

// --- Custom Promise Deferred (replaces $q.defer) ---
const createDeferredPromise = function() {
    let resolveFn, rejectFn;
    const promiseInstance = new Promise((resolve, reject) => {
        resolveFn = resolve;
        rejectFn = reject;
    });
    return {
        resolve: resolveFn,
        reject: rejectFn,
        promise: promiseInstance
    };
};
const globalPromiseCreator = { createDeferred: createDeferredPromise };

// --- Global UI Updater (replaces $rootScope.$apply) ---
const globalUpdater = function() {
    // In a plain JS context, this would trigger a re-render cycle for reactive components.
    // For this Type IV clone, it's a no-op as DOM updates are explicit within components.
};

// --- Persistent Fetcher Factory (replaces Pollymer factory) ---
let operationCounter = 0;
const PersistentFetcherFactory = function(promiseFactory, uiUpdater) {
    let currentOperationId = ++operationCounter;
    console.log(`PersistentFetcher ${currentOperationId} initialized`);

    const networkHandle = new NetworkOperation({ maximumAttempts: -1, failingCodes: '500,502-599' });
    let deferredPromise = promiseFactory.createDeferred();

    const failureHandler = (issue) => {
        console.log(`PersistentFetcher ${currentOperationId} < problem`);
        deferredPromise.reject({ code: -1, result: issue });
        uiUpdater();
    };

    const completionHandler = (status, outcome, meta) => {
        console.log(`PersistentFetcher ${currentOperationId} < concluded (${status})`);
        if (status >= 200 && status < 300) {
            deferredPromise.resolve({ code: status, result: outcome, headers: meta });
        } else {
            deferredPromise.reject({ code: status, result: outcome, headers: meta });
        }
        uiUpdater();
    };

    networkHandle.attachObserver('failure', failureHandler);
    networkHandle.attachObserver('completion', completionHandler);

    deferredPromise.promise.finally(() => {
        networkHandle.detachObserver('failure', failureHandler);
        networkHandle.detachObserver('completion', completionHandler);
    });

    return {
        sendData: function(destination, data) {
            return this.initiate('POST', destination, data);
        },
        getData: function(destination) {
            return this.initiate('GET', destination);
        },
        deleteData: function(destination) {
            return this.initiate('DELETE', destination);
        },
        initiate: function(verb, destination, data = null) {
            console.log(`PersistentFetcher ${currentOperationId} > begin (${verb})`);
            networkHandle.execute(verb, destination, data).catch(e => { /* Handled by observers */ });
            return deferredPromise.promise;
        },
        cancelOperation: function() {
            console.log(`PersistentFetcher ${currentOperationId} < halt`);
            networkHandle.halt();
        }
    };
};

// --- Application Entry Point (replaces angular.module) ---
const AppEntry = (function() {
    const componentRegistry = {};
    const appConfig = {
        serviceHost: window.applicationConfig.apiGateway,
        displayLimit: window.applicationConfig.maxDisplayItems,
    };

    function registerComponent(name, initializer) {
        componentRegistry[name] = initializer;
    }

    function retrieveComponent(name) {
        if (!componentRegistry[name]) {
            throw new Error(`Component ${name} not registered.`);
        }
        return componentRegistry[name];
    }

    function startApplication() {
        console.log("Application startup initiated.");
        
        const mainScreenContainer = document.getElementById('mainScreen');
        if (mainScreenContainer) {
            retrieveComponent('MainScreenProcessor')(mainScreenContainer);
        }

        const streamDisplayContainer = document.getElementById('streamDisplay');
        if (streamDisplayContainer) {
            retrieveComponent('StreamDisplayController')(streamDisplayContainer);
        }
    }

    return {
        registerComponent,
        retrieveComponent,
        startApplication,
        configuration: appConfig
    };
})();

// Registering PersistentFetcher as a "service" in our custom framework
AppEntry.registerComponent('PersistentFetcherService', () => {
    return {
        create: () => PersistentFetcherFactory(globalPromiseCreator, globalUpdater)
    };
});

// --- Main Screen Processor (replaces HomeCtrl) ---
AppEntry.registerComponent('MainScreenProcessor', (containerElement) => {
    const screenState = {
        streamIdentifier: "",
        isProcessing: false,
        hasError: false
    };

    const fetcherProvider = AppEntry.retrieveComponent('PersistentFetcherService')();

    const navigateToStreamView = function(id) {
        window.location.href = `/showcase/${id}`;
    };

    const attemptStreamCreation = function() {
        screenState.isProcessing = true;
        screenState.hasError = false;
        updateScreenUI();

        const creationEndpoint = AppEntry.configuration.serviceHost + "generate/";
        const currentFetcher = fetcherProvider.create();
        const creationPromise = currentFetcher.sendData(creationEndpoint);

        creationPromise.then(function(outcome) {
            screenState.isProcessing = false;
            const resultPayload = outcome.result;
            navigateToStreamView(resultPayload.identifier);
            updateScreenUI();
        }, function(reason) {
            screenState.isProcessing = false;
            screenState.hasError = true;
            console.error("Stream creation failed:", reason);
            updateScreenUI();
        });
    };

    const updateScreenUI = () => {
        const createButton = containerElement.querySelector('.create-action');
        const statusDisplay = containerElement.querySelector('.status-message');

        if (createButton) {
            createButton.disabled = screenState.isProcessing;
            createButton.textContent = screenState.isProcessing ? 'Generating...' : 'Generate New Stream';
        }
        if (statusDisplay) {
            statusDisplay.style.display = screenState.hasError ? 'block' : 'none';
            statusDisplay.textContent = screenState.hasError ? 'An error occurred during stream generation.' : '';
        }
    };

    const createBtn = containerElement.querySelector('.create-action');
    if (createBtn) {
        createBtn.addEventListener('click', attemptStreamCreation);
    }

    updateScreenUI();
});

// --- Stream Display Controller (replaces WebhookInboxCtrl) ---
AppEntry.registerComponent('StreamDisplayController', (containerElement) => {
    const streamData = {
        updatePointer: null,
        historyPointer: null,
        newestEntryId: null,
        itemsList: [],
        queuedItems: [],
        liveFeedActive: true,
        isFetching: false,
        pollingActive: false,
        displayProblem: false,
        endpointURL: "",
        displayMode: "fixed"
    };

    const streamIdentity = window.pageData.streamIdentifier;
    const fetcherProvider = AppEntry.retrieveComponent('PersistentFetcherService')();

    const transformDataItem = function(rawItem) {
        rawItem.recordedTime = Date.parse(rawItem.creationTime);
        return rawItem;
    };

    const checkAndParseJson = function(textInput) {
        try {
            const parsed = JSON.parse(textInput);
            return { isJson: true, content: parsed };
        } catch (e) {
            return { isJson: false, content: textInput };
        }
    };

    const processItemBody = function(itemEntry) {
        const parseResult = checkAndParseJson(itemEntry.bodyContent);
        if (parseResult.isJson) {
            itemEntry.bodyContent = parseResult.content;
        }
    };

    const renderStreamItems = () => {
        const itemContainer = containerElement.querySelector('.stream-items-display');
        if (!itemContainer) return;
        itemContainer.innerHTML = '';

        let itemsToRender = [...streamData.itemsList];
        if (!streamData.liveFeedActive) {
            itemsToRender = [...streamData.queuedItems, ...itemsToRender];
        }

        itemsToRender.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = `stream-item ${streamData.displayMode}-transition`;
            itemElement.innerHTML = `
                <div class="item-header">ID: ${item.id} - ${new Date(item.recordedTime).toLocaleString()}</div>
                <pre class="item-body">${JSON.stringify(item.bodyContent, null, 2)}</pre>
            `;
            itemContainer.appendChild(itemElement);
        });
        updateControlPanel();
    };

    const updateControlPanel = () => {
        const liveToggle = containerElement.querySelector('.live-toggle-button');
        if (liveToggle) {
            liveToggle.textContent = streamData.liveFeedActive ? 'Disable Live' : 'Enable Live';
        }
        const fetchStatus = containerElement.querySelector('.fetch-status');
        if (fetchStatus) {
            fetchStatus.textContent = streamData.isFetching ? 'Fetching history...' : (streamData.pollingActive ? 'Polling for updates...' : '');
        }
        const errorDisplay = containerElement.querySelector('.error-message');
        if (errorDisplay) {
            errorDisplay.style.display = streamData.displayProblem ? 'block' : 'none';
        }
        const endpointDisplay = containerElement.querySelector('.endpoint-url-display');
        if (endpointDisplay) {
            endpointDisplay.textContent = streamData.endpointURL;
        }
    };

    const processHistoricalFetch = function(requestUrl) {
        streamData.isFetching = true;
        updateControlPanel();
        const currentFetcher = fetcherProvider.create();
        const requestPromise = currentFetcher.getData(requestUrl);

        requestPromise.finally(function() {
            streamData.isFetching = false;
            updateControlPanel();
        });

        requestPromise.then(function(outcome) {
            const retrievedItems = outcome.result.entries;
            if ("last_position" in outcome.result) {
                streamData.historyPointer = outcome.result.last_position;
            } else {
                streamData.historyPointer = -1;
            }
            for (let i = 0; i < retrievedItems.length; i++) {
                const processedEntry = transformDataItem(retrievedItems[i]);
                streamData.displayMode = "fixed";
                processItemBody(processedEntry);
                streamData.itemsList.push(processedEntry);
            }
            renderStreamItems();
        }, function() {
            streamData.displayProblem = true;
            updateControlPanel();
        });
        return requestPromise;
    };

    const toggleLiveUpdates = function() {
        if (!streamData.liveFeedActive) {
            batchFlushQueuedItems();
        }
        streamData.liveFeedActive = !streamData.liveFeedActive;
        updateControlPanel();
    };

    const flushLiveQueuedItem = function() {
        streamData.displayMode = "active";
        const nextEntry = streamData.queuedItems.shift();
        if (nextEntry) {
            processItemBody(nextEntry);
            streamData.itemsList.unshift(nextEntry);
        }
        renderStreamItems();
    };

    const batchFlushQueuedItems = function() {
        streamData.displayMode = "batch";
        streamData.itemsList = streamData.queuedItems.concat(streamData.itemsList);
        streamData.queuedItems = [];
        renderStreamItems();
    };

    let continuousFetcher = null;
    const initiateContinuousPolling = function(startingId = null) {
        let fetchEndpoint = AppEntry.configuration.serviceHost + "feed/" + streamIdentity + "/events/?ordering=received";

        if (startingId) {
            fetchEndpoint += "&since_id=" + startingId;
        } else if (streamData.updatePointer) {
            fetchEndpoint += "&since_cursor=" + streamData.updatePointer;
        }

        streamData.pollingActive = true;
        updateControlPanel();
        continuousFetcher = continuousFetcher || fetcherProvider.create();
        const pollRequest = continuousFetcher.getData(fetchEndpoint);

        pollRequest.finally(function() {
            streamData.pollingActive = false;
            updateControlPanel();
        });

        pollRequest.then(function(outcome) {
            if (outcome.result === "" || outcome.result === null) {
                return;
            }
            streamData.updatePointer = outcome.result.last_position;
            const newItems = outcome.result.entries;
            for (let i = 0; i < newItems.length; i++) {
                const processedEntry = transformDataItem(newItems[i]);
                streamData.queuedItems.unshift(processedEntry);
            }
        }).finally(function() {
            setTimeout(() => initiateContinuousPolling(), 200);
        });
    };

    const terminateContinuousPolling = function() {
        if (continuousFetcher != null) {
            continuousFetcher.cancelOperation();
            continuousFetcher = null;
        }
    };

    const performInitialDataLoad = function() {
        const initialUrl = AppEntry.configuration.serviceHost + "feed/" + streamIdentity + "/events/?ordering=-received&maximum=" + AppEntry.configuration.displayLimit;

        const fetchPromise = processHistoricalFetch(initialUrl);
        fetchPromise.then(function(outcome) {
            let protocolPrefix = "";
            if (AppEntry.configuration.serviceHost.substring(0, 2) === "//") {
                protocolPrefix = "http:";
            }
            streamData.endpointURL = protocolPrefix + AppEntry.configuration.serviceHost + "feed/" + streamIdentity + "/";
            updateControlPanel();

            const firstItemId = ("result" in outcome && "entries" in outcome.result && outcome.result.entries.length) ? outcome.result.entries[0].id : null;
            initiateContinuousPolling(firstItemId);
        });
    };

    const retrieveMoreHistory = function() {
        const historyUrl = AppEntry.configuration.serviceHost + "feed/" + streamIdentity + "/events/?ordering=-received&maximum=" + AppEntry.configuration.displayLimit + "&since_cursor=" + streamData.historyPointer;
        processHistoricalFetch(historyUrl);
    };

    const getStreamIngestUrl = function() {
        if (streamData.endpointURL.length === 0) {
            return "";
        }
        return streamData.endpointURL + "ingest/";
    };

    const deleteCurrentStream = function(eventObject) {
        const deleteTargetUrl = AppEntry.configuration.serviceHost + "feed/" + streamIdentity + '/';
        if (eventObject && eventObject.defaultPrevented === false) {
           executeStreamDeletion(deleteTargetUrl);
        } else if (!eventObject) { // For interval call
            executeStreamDeletion(deleteTargetUrl);
        }
    };

    const executeStreamDeletion = function(targetUrl) {
        const deleteOp = fetcherProvider.create();
        deleteOp.deleteData(targetUrl).then(function() {
            window.location = '/';
        });
    };

    const thirtyDaysInMs = 1000 * 60 * 60 * 24 * 30;
    setInterval(function() {
        deleteCurrentStream(null); // Pass null to indicate internal call, not UI event
    }, thirtyDaysInMs);

    const copyToClipboard = async function() {
        const urlToCopy = getStreamIngestUrl();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(urlToCopy);
                alert('Ingest URL copied to clipboard!');
            } catch (err) {
                console.error('Failed to copy text: ', err);
                alert('Failed to copy URL. Please copy manually: ' + urlToCopy);
            }
        } else {
            const tempInput = document.createElement('textarea');
            tempInput.value = urlToCopy;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('Ingest URL copied to clipboard (fallback).');
        }
    };

    const liveUpdateProcessor = function() {
        if (streamData.liveFeedActive && streamData.queuedItems.length > 0) {
            flushLiveQueuedItem();
        }
        window.requestAnimationFrame(liveUpdateProcessor);
    };

    const setupEventListeners = () => {
        containerElement.querySelector('.live-toggle-button')?.addEventListener('click', toggleLiveUpdates);
        containerElement.querySelector('.load-history-button')?.addEventListener('click', retrieveMoreHistory);
        containerElement.querySelector('.delete-stream-button')?.addEventListener('click', deleteCurrentStream);
        containerElement.querySelector('.copy-url-button')?.addEventListener('click', copyToClipboard);
    };

    setupEventListeners();
    performInitialDataLoad();
    liveUpdateProcessor();
    updateControlPanel();
});

// --- Global Configuration and Page Data Simulation ---
// These would typically be rendered into the HTML by the server or
// defined in a separate script tag before the main application logic.
window.applicationConfig = {
    apiGateway: "https://api.example.com/v1/",
    maxDisplayItems: 50
};

window.pageData = {
    streamIdentifier: "some-unique-webhook-id-123" // Example ID for the stream display page
};

// --- Application Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    AppEntry.startApplication();
});