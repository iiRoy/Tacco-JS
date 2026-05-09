class DataRefresher {
    #dataEndpoint;
    #minimumPollingInterval;
    #maximumPollingInterval;
    #intervalBoostFactor;
    #maximumRetrievalAttempts;
    #onMaxRetrievalsCallback;
    #unchangedResponseLimit;
    #onUnchangedLimitReachedCallback;
    #storageIdentifier;
    #initialRunImmediately;
    #outputLevel;
    #requestOptions;
    #dataPayloadGenerator;
    #onDataUpdatedCallback;
    #onErrorOccurredCallback;
    #onOperationCompletedCallback;

    #currentPollingTimerId = null;
    #currentPollingInterval;
    #lastKnownPayload = null;
    #previousRawContent = null;
    #retrievalCounter = 0;
    #unchangedContentCount = 0;
    #isPollingHalted = false;

    static #storagePrefix = 'dr_persist_';

    constructor(endpoint, options = {}) {
        const defaults = {
            requestMethod: 'GET',
            requestCache: 'no-cache',
            requestHeaders: {},
            requestBody: null,
            minimumPollingInterval: 1000,
            maximumPollingInterval: 64000,
            intervalBoostFactor: 2,
            maximumRetrievalAttempts: 0,
            onMaxRetrievalsCallback: null,
            unchangedResponseLimit: 0,
            onUnchangedLimitReachedCallback: null,
            persistenceKey: false,
            initialRunImmediately: false,
            outputLevel: 0,
            dataGenerator: null,
            onDataUpdated: null,
            onErrorOccurred: null,
            onOperationCompleted: null
        };

        const mergedOptions = { ...defaults, ...options };

        this.#dataEndpoint = endpoint;
        this.#minimumPollingInterval = mergedOptions.minimumPollingInterval;
        this.#maximumPollingInterval = mergedOptions.maximumPollingInterval;
        this.#intervalBoostFactor = mergedOptions.intervalBoostFactor;
        this.#maximumRetrievalAttempts = mergedOptions.maximumRetrievalAttempts;
        this.#onMaxRetrievalsCallback = mergedOptions.onMaxRetrievalsCallback;
        this.#unchangedResponseLimit = mergedOptions.unchangedResponseLimit;
        this.#onUnchangedLimitReachedCallback = mergedOptions.onUnchangedLimitReachedCallback;
        this.#storageIdentifier = mergedOptions.persistenceKey;
        this.#initialRunImmediately = mergedOptions.initialRunImmediately;
        this.#outputLevel = mergedOptions.outputLevel;
        this.#dataPayloadGenerator = mergedOptions.dataGenerator;
        this.#onDataUpdatedCallback = mergedOptions.onDataUpdated;
        this.#onErrorOccurredCallback = mergedOptions.onErrorOccurred;
        this.#onOperationCompletedCallback = mergedOptions.onOperationCompleted;

        this.#requestOptions = {
            method: mergedOptions.requestMethod,
            cache: mergedOptions.requestCache,
            headers: mergedOptions.requestHeaders
        };
        if (mergedOptions.requestBody !== null) {
             this.#requestOptions.body = typeof mergedOptions.requestBody === 'function' ? mergedOptions.requestBody() : mergedOptions.requestBody;
        }

        this.#currentPollingInterval = this.#minimumPollingInterval;
        if (this.#storageIdentifier && typeof localStorage !== 'undefined') {
            const storedInterval = this.#getPersistedValue('interval');
            const storedContent = this.#getPersistedValue('content');
            if (storedInterval) {
                this.#currentPollingInterval = parseInt(storedInterval, 10);
                this.#displayLog('Retrieved interval from storage: ' + this.#currentPollingInterval, 2);
            }
            if (storedContent) {
                this.#previousRawContent = storedContent;
                this.#displayLog('Retrieved previous content from storage.', 2);
            }
        }

        if (this.#initialRunImmediately) {
            this.#displayLog('Initiating immediate data retrieval.', 1);
            this.#initiateDataFetch(true);
        } else {
            this.#displayLog('Scheduling initial data retrieval for ' + this.#currentPollingInterval + 'ms.', 1);
            this.#scheduleNextRetrieval(this.#currentPollingInterval);
        }
    }

    #displayLog(message, level = 1) {
        if (this.#outputLevel >= level) {
            try {
                console.log(`[DataRefresher] ${message}`);
            } catch (err) { /* ignore */ }
        }
    }

    #getPersistedValue(key) {
        if (this.#storageIdentifier && typeof localStorage !== 'undefined') {
            return localStorage.getItem(DataRefresher.#storagePrefix + this.#storageIdentifier + '_' + key);
        }
        return null;
    }

    #setPersistedValue(key, value) {
        if (this.#storageIdentifier && typeof localStorage !== 'undefined') {
            localStorage.setItem(DataRefresher.#storagePrefix + this.#storageIdentifier + '_' + key, value);
        }
    }

    #clearPersistedValue(key) {
        if (this.#storageIdentifier && typeof localStorage !== 'undefined') {
            localStorage.removeItem(DataRefresher.#storagePrefix + this.#storageIdentifier + '_' + key);
        }
    }

    #scheduleNextRetrieval(interval) {
        if (this.#currentPollingTimerId !== null) {
            clearTimeout(this.#currentPollingTimerId);
        }
        this.#currentPollingInterval = interval;
        this.#displayLog('Rescheduling polling for ' + this.#currentPollingInterval + 'ms.', 2);
        this.#setPersistedValue('interval', this.#currentPollingInterval.toString());
        this.#currentPollingTimerId = setTimeout(() => this.#initiateDataFetch(), this.#currentPollingInterval);
    }

    #adaptInterval() {
        if (this.#intervalBoostFactor > 1) {
            const oldInterval = this.#currentPollingInterval;
            this.#currentPollingInterval *= this.#intervalBoostFactor;
            if (this.#currentPollingInterval > this.#maximumPollingInterval) {
                this.#currentPollingInterval = this.#maximumPollingInterval;
            }
            this.#displayLog(`Adjusting polling interval from ${oldInterval} to ${this.#currentPollingInterval}ms.`, 2);
        }
        this.#scheduleNextRetrieval(this.#currentPollingInterval);
    }

    async #processFetchedContent(payload, status) {
        let rawContent;
        if (typeof payload === 'object' && payload !== null) {
            rawContent = JSON.stringify(payload);
        } else {
            rawContent = String(payload).trim();
        }

        this.#displayLog(`Content received (status: ${status}).`, 2);

        if (this.#previousRawContent === rawContent) {
            if (this.#unchangedResponseLimit > 0) {
                this.#unchangedContentCount++;
                if (this.#unchangedContentCount === this.#unchangedResponseLimit) {
                    this.haltPolling();
                    if (this.#onUnchangedLimitReachedCallback) {
                        this.#onUnchangedLimitReachedCallback(this.#unchangedContentCount);
                    }
                    this.#displayLog(`Polling halted due to ${this.#unchangedContentCount} unchanged responses.`, 1);
                    return;
                }
            }
            this.#adaptInterval();
        } else {
            this.#unchangedContentCount = 0;
            this.#scheduleNextRetrieval(this.#minimumPollingInterval);
            this.#previousRawContent = rawContent;
            this.#setPersistedValue('content', rawContent);
            this.#lastKnownPayload = payload;

            if (this.#onDataUpdatedCallback) {
                this.#onDataUpdatedCallback(payload, status, this.getControlHandle());
            }
        }
        if (this.#onOperationCompletedCallback) {
            this.#onOperationCompletedCallback(status, this.getControlHandle());
        }
    }

    #handleFetchFailure(errorMessage, errorObject) {
        this.#displayLog(`Retrieval failed: ${errorMessage}`, 2);
        this.#previousRawContent = null;
        this.#clearPersistedValue('content');
        this.#scheduleNextRetrieval(this.#minimumPollingInterval);

        if (this.#onErrorOccurredCallback) {
            this.#onErrorOccurredCallback(errorMessage, errorObject, this.getControlHandle());
        }
        if (this.#onOperationCompletedCallback) {
            this.#onOperationCompletedCallback('error', this.getControlHandle());
        }
    }

    async #initiateDataFetch(force = false) {
        if (this.#isPollingHalted) {
            this.#displayLog('Retrieval attempt skipped: polling is halted.', 1);
            return;
        }

        let shouldProceed = false;
        if (force || this.#maximumRetrievalAttempts === 0) {
            shouldProceed = true;
        } else if (this.#maximumRetrievalAttempts > 0 && this.#retrievalCounter < this.#maximumRetrievalAttempts) {
            shouldProceed = true;
            this.#retrievalCounter++;
        }

        if (!shouldProceed) {
            this.#displayLog(`Retrieval attempt skipped: max calls (${this.#maximumRetrievalAttempts}) reached.`, 1);
            if (this.#onMaxRetrievalsCallback) {
                this.#onMaxRetrievalsCallback();
            }
            return;
        }

        this.#displayLog(`Initiating data retrieval (call #${this.#retrievalCounter}).`, 2);

        let currentRequestOptions = {
            ...this.#requestOptions,
            headers: { ...this.#requestOptions.headers }
        };
        let finalEndpoint = this.#dataEndpoint;

        let dynamicData = null;
        if (typeof this.#dataPayloadGenerator === 'function') {
            dynamicData = this.#dataPayloadGenerator();
        }

        if (currentRequestOptions.method.toUpperCase() === 'GET' && dynamicData) {
            const params = new URLSearchParams(dynamicData).toString();
            finalEndpoint += (finalEndpoint.includes('?') ? '&' : '?') + params;
        } else if (currentRequestOptions.method.toUpperCase() !== 'GET' && dynamicData) {
            currentRequestOptions.body = JSON.stringify(dynamicData);
            currentRequestOptions.headers['Content-Type'] = 'application/json';
        } else if (this.#requestOptions.body !== null) {
            currentRequestOptions.body = typeof this.#requestOptions.body === 'function' ? this.#requestOptions.body() : this.#requestOptions.body;
        }

        try {
            const response = await fetch(finalEndpoint, currentRequestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
            }

            let responsePayload;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responsePayload = await response.json();
            } else {
                responsePayload = await response.text();
            }
            await this.#processFetchedContent(responsePayload, 'success');
        } catch (error) {
            await this.#handleFetchFailure(error.message, error);
        }

        if (!this.#isPollingHalted) {
            this.#scheduleNextRetrieval(this.#currentPollingInterval);
        }
    }

    getControlHandle() {
        return {
            adjustPollingRate: this.adjustPollingRate.bind(this),
            resetAndStart: this.resetAndStart.bind(this),
            triggerImmediateFetch: this.triggerImmediateFetch.bind(this),
            haltPolling: this.haltPolling.bind(this)
        };
    }

    adjustPollingRate(factor) {
        if (factor > 0 && factor !== 1) {
            this.#displayLog('Boosting polling interval by a factor of ' + factor, 1);
            this.#currentPollingInterval *= factor;
            if (this.#currentPollingInterval > this.#maximumPollingInterval) {
                this.#currentPollingInterval = this.#maximumPollingInterval;
            }
        } else {
            this.#displayLog('Cannot adjust polling interval by a factor of ' + factor, 1);
        }
        this.#scheduleNextRetrieval(this.#currentPollingInterval);
    }

    resetAndStart(newInterval = this.#minimumPollingInterval) {
        this.#displayLog('Resetting and restarting polling.', 1);
        this.#isPollingHalted = false;
        this.#retrievalCounter = 0;
        this.#unchangedContentCount = 0;
        this.#currentPollingInterval = newInterval;
        this.#scheduleNextRetrieval(this.#currentPollingInterval);
    }

    triggerImmediateFetch() {
        this.#displayLog('Explicitly triggering data retrieval.', 1);
        this.#initiateDataFetch(true);
    }

    haltPolling() {
        this.#displayLog('Halting polling operations.', 1);
        this.#isPollingHalted = true;
        if (this.#currentPollingTimerId !== null) {
            clearTimeout(this.#currentPollingTimerId);
            this.#currentPollingTimerId = null;
        }
        this.#clearPersistedValue('interval');
        this.#clearPersistedValue('content');
    }
}