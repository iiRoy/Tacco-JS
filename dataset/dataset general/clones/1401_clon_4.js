const MediaEngine = {
    core: {},
    integrations: {},
    utility: {}
};

MediaEngine.utility.noop = () => {};

MediaEngine.integrations.statusIndicator = null;
MediaEngine.integrations.activityLogger = null;

MediaEngine.core.apiClient = {
    augmentRequest: (params) => {
        // Simulates Playdar.client.addAuthToken
        // Add a dummy token for demonstration
        params.auth_token = "dummyAuth123";
        return params;
    },
    createResourceUrl: (pathSegment, queryParameters) => {
        // Simulates Playdar.client.getBaseUrl
        const baseUrl = "https://example.com/api";
        const queryString = new URLSearchParams(queryParameters).toString();
        return `${baseUrl}${pathSegment}?${queryString}`;
    }
};

MediaEngine.utility.loadExternalScript = (urlAddress) => {
    const scriptElement = document.createElement('script');
    scriptElement.src = urlAddress;
    scriptElement.async = true;
    document.head.appendChild(scriptElement);
    // Basic cleanup; a more robust solution might handle errors/onload better
    scriptElement.onload = () => scriptElement.remove();
    scriptElement.onerror = () => scriptElement.remove();
};

MediaEngine.utility._remoteCallbackRegistry = new Map();
MediaEngine.utility.processRemoteResponse = (callbackKey, responseData) => {
    const registeredHandler = MediaEngine.utility._remoteCallbackRegistry.get(callbackKey);
    if (registeredHandler) {
        registeredHandler.callback.call(registeredHandler.context, responseData);
        MediaEngine.utility._remoteCallbackRegistry.delete(callbackKey); // Clean up after use
    }
};

// Expose the dispatcher globally for JSONP calls
window.MediaEngine_processRemoteResponse = MediaEngine.utility.processRemoteResponse;

class TrackController {
    #assetIdentifier;
    #assetDetails;
    #registeredEventHooks;
    #currentPlaybackState = 0; // 0: inactive/stopped, 1: active/playing
    #currentLoadStatus = 0;    // 0: uninitialized, 1: loading, 2: failed, 3: loaded

    constructor(identifier, details, hooks) {
        this.#assetIdentifier = identifier;
        this.#assetDetails = details;
        this.#registeredEventHooks = hooks;
    }

    get uniqueId() { return this.#assetIdentifier; }
    get info() { return this.#assetDetails; }
    get loadStatus() { return this.#currentLoadStatus; }
    get playbackStatus() { return this.#currentPlaybackState; }

    // Internal delegation methods for the main service
    togglePlayback() {
        MediaEngine.core.playbackService.requestPauseToggle(this.#assetIdentifier);
    }
    updatePosition(newPosition) {
        MediaEngine.core.playbackService.adjustPosition(this.#assetIdentifier, newPosition);
    }
    endPlayback(isForced) {
        MediaEngine.core.playbackService.terminateStream(this.#assetIdentifier, isForced);
    }

    // Handlers for remote API responses via JSONP
    handlePlaybackInitiationResponse(responsePayload) {
        if (responsePayload && responsePayload.response === 'ok') {
            this.#currentPlaybackState = 1;
            this.#currentLoadStatus = 3;
            MediaEngine.core.playbackService.setCurrentlyActiveStream(this.#assetIdentifier);
            if (MediaEngine.integrations.statusIndicator) {
                MediaEngine.integrations.statusIndicator.handlePlaybackStart(this.#assetDetails);
            }
            this.#registeredEventHooks.onPlay.call(this);
        } else {
            this.#currentLoadStatus = 2; // Failed
        }
        this.#registeredEventHooks.onLoad.call(this);
    }

    handleTerminationResponse() {
        this.#currentPlaybackState = 0;
        this.#currentLoadStatus = 0;
        MediaEngine.core.playbackService.clearCurrentlyActiveStream();
        this.#registeredEventHooks.onStop.call(this);
    }

    handlePauseToggleResponse() {
        this.#currentPlaybackState = this.#currentPlaybackState ? 0 : 1; // Toggle state
        if (this.#currentPlaybackState === 1) {
            this.#registeredEventHooks.onResume.call(this);
        } else {
            this.#registeredEventHooks.onPause.call(this);
        }
    }

    // Analogous to Playdar.nop for unload
    dispose() {
        MediaEngine.utility.noop();
    }
}

class AudioPlaybackService {
    #mediaAssetStore = new Map(); // Stores TrackController instances
    #currentlyActiveStreamId = null;

    static _mediaTypeConfigurationMap = new Map([
        ["audio/mpeg", false],
        ["audio/aac", true],
        ["audio/x-aac", true],
        ["audio/flv", true],
        ["audio/mov", true],
        ["audio/mp4", true],
        ["audio/m4v", true],
        ["audio/f4v", true],
        ["audio/m4a", true],
        ["audio/x-m4a", true],
        ["audio/x-m4b", true],
        ["audio/mp4v", true],
        ["audio/3gp", true],
        ["audio/3g2", true]
    ]);

    static _standardEventDefaults = {
        onLoad: MediaEngine.utility.noop,
        onPlay: MediaEngine.utility.noop,
        onPause: MediaEngine.utility.noop,
        onResume: MediaEngine.utility.noop,
        onStop: MediaEngine.utility.noop,
        onFinish: MediaEngine.utility.noop,
        whileLoading: MediaEngine.utility.noop,
        whilePlaying: MediaEngine.utility.noop
    };

    constructor() {
        // Establish the singleton reference, mimicking Playdar.player = this;
        MediaEngine.core.playbackService = this;
    }

    retrieveSupportedMediaTypes() {
        return Array.from(AudioPlaybackService._mediaTypeConfigurationMap.keys());
    }

    enrollMediaAsset(assetData, customEventHooks = {}) {
        if (this.#mediaAssetStore.has(assetData.sid)) {
            return false;
        }

        // Merge event hooks with a clear precedence: custom > activityLogger > statusIndicator > defaults
        const finalEventHooks = Object.assign(
            {},
            AudioPlaybackService._standardEventDefaults,
            MediaEngine.integrations.statusIndicator ? MediaEngine.integrations.statusIndicator.getStreamCallbacks(assetData) : {},
            MediaEngine.integrations.activityLogger ? MediaEngine.integrations.activityLogger.getStreamCallbacks(assetData) : {},
            customEventHooks
        );

        const newTrackController = new TrackController(assetData.sid, assetData, finalEventHooks);
        this.#mediaAssetStore.set(assetData.sid, newTrackController);
        return newTrackController;
    }

    activateMediaStream(streamIdentifier) {
        const targetController = this.#mediaAssetStore.get(streamIdentifier);
        if (!targetController) return null;

        if (this.#currentlyActiveStreamId !== streamIdentifier) {
            this.haltActiveStream();
        }
        
        targetController.togglePlayback();
        return targetController;
    }

    haltActiveStream(forceTermination = false) {
        if (forceTermination && MediaEngine.integrations.activityLogger) {
            MediaEngine.integrations.activityLogger.logStreamStop();
        }
        if (MediaEngine.integrations.statusIndicator) {
            MediaEngine.integrations.statusIndicator.handleStreamStop();
        }
        const currentController = this.fetchActiveStreamDetails();
        if (currentController) {
            currentController.endPlayback(forceTermination);
        }
    }

    haltSpecificStream(streamIdentifier) {
        if (streamIdentifier && streamIdentifier === this.#currentlyActiveStreamId) {
            this.haltActiveStream();
            return true;
        }
        return false;
    }

    isStreamActive() {
        return this.#currentlyActiveStreamId !== null;
    }

    fetchActiveStreamDetails() {
        if (this.#currentlyActiveStreamId) {
            return this.#mediaAssetStore.get(this.#currentlyActiveStreamId);
        }
        return undefined;
    }

    toggleCurrentPlayback() {
        if (this.isStreamActive()) {
            this.activateMediaStream(this.#currentlyActiveStreamId);
        }
    }

    // API interaction methods
    _constructApiEndpoint(apiMethod, requestParameters = {}) {
        const augmentedParameters = MediaEngine.core.apiClient.augmentRequest({ ...requestParameters });
        augmentedParameters.call_id = Date.now();
        augmentedParameters.method = apiMethod;

        const dynamicCallbackKey = `cb_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
        augmentedParameters.jsonp = `MediaEngine_processRemoteResponse('${dynamicCallbackKey}')`;
        
        // Temporarily register a no-op handler, to be replaced by the specific one later
        MediaEngine.utility._remoteCallbackRegistry.set(dynamicCallbackKey, { callback: MediaEngine.utility.noop, context: null });

        return {
            url: MediaEngine.core.apiClient.createResourceUrl("/player", augmentedParameters),
            callbackKey: dynamicCallbackKey
        };
    }

    initiateStream(streamIdentifier) {
        const targetController = this.#mediaAssetStore.get(streamIdentifier);
        if (!targetController) return;

        const { url, callbackKey } = this._constructApiEndpoint('play', { streamIdentifier: streamIdentifier });
        MediaEngine.utility._remoteCallbackRegistry.set(callbackKey, {
            callback: targetController.handlePlaybackInitiationResponse,
            context: targetController
        });
        MediaEngine.utility.loadExternalScript(url);
    }

    terminateStream(streamIdentifier, isForcedTermination) {
        if (isForcedTermination) {
            const popupWindow = window.open();
            if (popupWindow) {
                const { url } = this._constructApiEndpoint('stop');
                const closeWindowCallbackKey = `close_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                MediaEngine.utility._remoteCallbackRegistry.set(closeWindowCallbackKey, {
                    callback: () => popupWindow.close(),
                    context: null
                });
                // Replace the generic callback with the window-closing specific one
                const stopUrlWithCloseCallback = url.replace(/MediaEngine_processRemoteResponse\('cb_[^']*'\)/, `MediaEngine_processRemoteResponse('${closeWindowCallbackKey}')`);
                
                popupWindow.document.write(`<html><body><script src="${stopUrlWithCloseCallback}"></script></body></html>`);
                popupWindow.document.close();
            }
        } else {
            const targetController = this.#mediaAssetStore.get(streamIdentifier);
            if (!targetController) return;

            const { url, callbackKey } = this._constructApiEndpoint('stop');
            MediaEngine.utility._remoteCallbackRegistry.set(callbackKey, {
                callback: targetController.handleTerminationResponse,
                context: targetController
            });
            MediaEngine.utility.loadExternalScript(url);
        }
    }

    requestPauseToggle(streamIdentifier) {
        const targetController = this.#mediaAssetStore.get(streamIdentifier);
        if (!targetController) return;

        if (targetController.loadStatus === 0) { // If uninitialized, effectively initiate playback
            this.initiateStream(streamIdentifier);
        } else {
            const { url, callbackKey } = this._constructApiEndpoint('pausetoggle');
            MediaEngine.utility._remoteCallbackRegistry.set(callbackKey, {
                callback: targetController.handlePauseToggleResponse,
                context: targetController
            });
            MediaEngine.utility.loadExternalScript(url);
        }
    }

    queryPosition(streamIdentifier) {
        const { url } = this._constructApiEndpoint('pos');
        MediaEngine.utility.loadExternalScript(url);
        // Original doesn't handle callback for getPosition, so we don't either.
    }

    adjustPosition(streamIdentifier, newPosition) {
        // Not implemented in original, keeping it as a no-op or placeholder
        console.warn("Position adjustment functionality is not implemented.");
        MediaEngine.utility.noop();
    }

    queryActiveStreamIdentifier() {
        const { url } = this._constructApiEndpoint('np');
        MediaEngine.utility.loadExternalScript(url);
        // Original doesn't handle callback for getNowPlayingSid, so we don't either.
    }

    // Internal state management
    setCurrentlyActiveStream(identifier) {
        this.#currentlyActiveStreamId = identifier;
    }

    clearCurrentlyActiveStream() {
        this.#currentlyActiveStreamId = null;
    }
}

// Instantiate the service, making it globally accessible through MediaEngine.core.playbackService
new AudioPlaybackService();