/**
 * @file asset_management_module.js
 * @author Altered by AI Clone Generator
 *
 * This JavaScript module provides utilities for managing and loading various assets,
 * primarily focused on visual resources, into the Synergy native environment.
 * It interfaces with the underlying native bridge for asset operations.
 */

// Initialize the primary application namespace if it doesn't exist.
var synergy = synergy || {};

/**
 * The Asset Management submodule, responsible for loading and tracking resources.
 * This component handles both local and remote asset acquisition.
 */
synergy.assetLoader = (function() {
    "use strict"; // Enforce stricter parsing and error handling.

    // Internal configuration and state management.
    var _config = {
        NATIVE_BRIDGE_MODULE_IDENTIFIER: "AssetManager",
        DEFAULT_ERROR_HANDLER: function(id, handle, error) {
            console.error("Asset operation failed for ID:", id, "Handle:", handle, "Error:", error || "Unknown error.");
        }
    };

    // A mapping of asset identifiers to their respective completion callbacks.
    // This allows the native layer to signal back when an asset operation is done.
    var _completionHandlers = {};

    // A reverse mapping from native handles (assigned by the C++ layer) to
    // the JavaScript-defined asset identifiers. Useful for tracking remote downloads.
    var _handleToIdentifierMap = {};

    // A queue for managing sequential remote asset download requests.
    // Native operations for remote assets are often handled one at a time.
    var _pendingDownloads = [];

    // Flag to indicate if the remote download queue is currently being processed.
    var _isQueueProcessingActive = false;

    /**
     * Internal helper function to dispatch messages to the native bridge.
     * This centralizes the communication logic.
     * @param {string} action The specific action to be performed by the native module.
     * @param {Array<any>} parameters An array of arguments for the native action.
     * @param {Function|null} responseHandler An optional callback for immediate native response.
     */
    function _sendBridgeCommand(action, parameters, responseHandler) {
        if (!synergy.bridge || typeof synergy.bridge.dispatch === 'undefined') {
            console.error("Synergy bridge is not available. Cannot send command:", action);
            return;
        }
        var commandPayload = [
            _config.NATIVE_BRIDGE_MODULE_IDENTIFIER,
            action
        ].concat(parameters);

        synergy.bridge.dispatch(commandPayload, responseHandler);
    }

    /**
     * Validates if a given value is a function.
     * @param {any} func The value to check.
     * @returns {boolean} True if the value is a function, false otherwise.
     */
    function _isFunction(func) {
        return typeof func === 'function';
    }

    /**
     * Loads a local asset (e.g., an image file bundled with the application)
     * into a native handle for use in the UI system.
     *
     * @param {string} localAssetPath The relative path to the asset file (e.g., "images/my_icon.png").
     * @param {string} assetIdentifier A unique string ID to refer to this asset in JavaScript.
     * @param {Function} onCompletion A callback function invoked when the asset is ready.
     *                                It receives (assetIdentifier, nativeHandle) as arguments.
     */
    function loadLocalAsset(localAssetPath, assetIdentifier, onCompletion) {
        // Basic input validation
        if (!localAssetPath || typeof localAssetPath !== 'string' || localAssetPath.trim() === '') {
            console.warn("Invalid local asset path provided for ID:", assetIdentifier);
            _config.DEFAULT_ERROR_HANDLER(assetIdentifier, null, "Invalid asset path");
            return;
        }
        if (!assetIdentifier || typeof assetIdentifier !== 'string' || assetIdentifier.trim() === '') {
            console.warn("Invalid asset identifier provided for path:", localAssetPath);
            _config.DEFAULT_ERROR_HANDLER(null, null, "Invalid asset identifier");
            return;
        }

        // Store the callback for later invocation by the native layer.
        _completionHandlers[assetIdentifier] = _isFunction(onCompletion) ? onCompletion : _config.DEFAULT_ERROR_HANDLER;

        // Dispatch the request to the native bridge.
        _sendBridgeCommand(
            "loadLocalAsset",
            [localAssetPath, assetIdentifier],
            null // No immediate response handler needed for this operation.
        );
    }

    /**
     * This function is invoked by the native C++ layer when a local asset
     * has finished loading. It retrieves and calls the stored JavaScript callback.
     *
     * @param {string} assetIdentifier The JavaScript ID of the asset.
     * @param {number} nativeHandle The C++ handle/ID for the loaded asset.
     * @param {string|null} [errorInfo=null] Optional error message if loading failed.
     */
    function localAssetLoaded(assetIdentifier, nativeHandle, errorInfo) {
        var handler = _completionHandlers[assetIdentifier];

        // Ensure the handler exists before attempting to call it.
        if (handler && _isFunction(handler)) {
            // Pass all relevant information to the callback.
            // Note: The original code used `apply(null, arguments)`, which passes ALL arguments.
            // We're explicitly passing the expected ones for clarity and control.
            handler(assetIdentifier, nativeHandle, errorInfo);
        } else {
            console.warn("No valid completion handler found for asset ID:", assetIdentifier);
            _config.DEFAULT_ERROR_HANDLER(assetIdentifier, nativeHandle, "No handler found");
        }

        // Clean up the handler after use.
        delete _completionHandlers[assetIdentifier];
    }

    /**
     * Initiates the download of an asset from a remote URL into a native handle.
     * This process is typically asynchronous and queued.
     *
     * @param {string} remoteAssetURL The full URL to the remote asset file.
     * @param {string} assetIdentifier A unique string ID to refer to this asset in JavaScript.
     * @param {Function} onResult A callback function invoked when the download is complete (or fails).
     *                            It receives (assetIdentifier, nativeHandle, errorInfo) as arguments.
     */
    function fetchRemoteAsset(remoteAssetURL, assetIdentifier, onResult) {
        // More robust input validation
        if (!remoteAssetURL || typeof remoteAssetURL !== 'string' || !/^https?:\/\//i.test(remoteAssetURL)) {
            console.warn("Invalid remote asset URL provided for ID:", assetIdentifier);
            _config.DEFAULT_ERROR_HANDLER(assetIdentifier, null, "Invalid URL");
            return;
        }
        if (!assetIdentifier || typeof assetIdentifier !== 'string' || assetIdentifier.trim() === '') {
            console.warn("Invalid asset identifier provided for URL:", remoteAssetURL);
            _config.DEFAULT_ERROR_HANDLER(null, null, "Invalid identifier");
            return;
        }

        // Store the callback for this particular download request.
        _completionHandlers[assetIdentifier] = _isFunction(onResult) ? onResult : _config.DEFAULT_ERROR_HANDLER;

        // Construct the payload for the native bridge.
        var downloadRequestPayload = [
            _config.NATIVE_BRIDGE_MODULE_IDENTIFIER,
            "fetchRemoteAsset",
            remoteAssetURL,
            assetIdentifier
        ];

        // Add the request to the queue.
        _pendingDownloads.push(downloadRequestPayload);

        // If the queue is not currently being processed, start processing the first item.
        if (!_isQueueProcessingActive) {
            _processNextDownloadInQueue();
        }
    }

    /**
     * Internal function to process the next item in the remote download queue.
     * This ensures downloads are handled sequentially if the native system requires it.
     */
    function _processNextDownloadInQueue() {
        if (_pendingDownloads.length > 0) {
            _isQueueProcessingActive = true;
            var currentRequest = _pendingDownloads[0];
            // The actual sending function from `synergy.bridge` is `dispatch`.
            synergy.bridge.dispatch(currentRequest, null); // No immediate JS response expected.
        } else {
            _isQueueProcessingActive = false;
        }
    }

    /**
     * Called by the native layer when a remote asset download has begun.
     * This provides the native handle assigned to the download in progress.
     *
     * @param {string} assetIdentifier The JavaScript ID of the asset being downloaded.
     * @param {number} nativeHandle The C++ handle assigned to the download.
     */
    function remoteDownloadInitiated(assetIdentifier, nativeHandle) {
        // Store the mapping from native handle to JavaScript ID.
        // This is crucial for `remoteDownloadFinished` to find the correct callback.
        _handleToIdentifierMap[nativeHandle] = assetIdentifier;
        // Optionally, a 'progress' callback could be triggered here.
    }

    /**
     * Called by the native layer when a remote asset download has completed (successfully or not).
     * This signals the end of a download operation and triggers the stored callback.
     *
     * @param {number} nativeHandle The C++ handle of the completed download.
     * @param {string|null} [errorReason=null] Optional error message if the download failed.
     */
    function remoteDownloadCompleted(nativeHandle, errorReason) {
        var assetIdentifier = _handleToIdentifierMap[nativeHandle];

        if (assetIdentifier) {
            var handler = _completionHandlers[assetIdentifier];
            if (handler && _isFunction(handler)) {
                // Invoke the callback with the asset ID, native handle, and any error information.
                handler(assetIdentifier, nativeHandle, errorReason);
            } else {
                console.warn("No completion handler for remote asset ID:", assetIdentifier, "Handle:", nativeHandle);
                _config.DEFAULT_ERROR_HANDLER(assetIdentifier, nativeHandle, "No handler for completed remote download");
            }
            // Clean up the stored handler and the handle-to-ID mapping.
            delete _completionHandlers[assetIdentifier];
            delete _handleToIdentifierMap[nativeHandle];
        } else {
            console.warn("Unknown native handle completed remote download:", nativeHandle);
            _config.DEFAULT_ERROR_HANDLER(null, nativeHandle, "Unknown handle completed remote download");
        }

        // Remove the first item from the queue, as it has now finished.
        if (_pendingDownloads.length > 0) {
            _pendingDownloads.shift();
        }

        // Attempt to process the next item in the queue.
        _processNextDownloadInQueue();
    }

    // Public API of the assetLoader submodule.
    return {
        loadLocalAsset: loadLocalAsset,
        fetchRemoteAsset: fetchRemoteAsset,

        // These functions are intended to be called by the native bridge.
        // They are exposed for the native layer to invoke them directly.
        nativeCallbacks: {
            localAssetLoaded: localAssetLoaded,
            remoteDownloadInitiated: remoteDownloadInitiated,
            remoteDownloadCompleted: remoteDownloadCompleted
        }
    };

})();

// Assign the returned object to the global synergy.assetLoader namespace.
synergy.assetLoader = synergy.assetLoader;

// Expose native callbacks directly on the synergy.assetLoader object for convenience
// or if the native bridge expects them at the top level of the submodule.
synergy.assetLoader.localAssetLoaded = synergy.assetLoader.nativeCallbacks.localAssetLoaded;
synergy.assetLoader.remoteDownloadInitiated = synergy.assetLoader.nativeCallbacks.remoteDownloadInitiated;
synergy.assetLoader.remoteDownloadCompleted = synergy.assetLoader.nativeCallbacks.remoteDownloadCompleted;