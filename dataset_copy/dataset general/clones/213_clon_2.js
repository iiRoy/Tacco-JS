/*
 * @file syncApp.mediaAssets.js
 * @author Ali Sarrafi (reimagined by AI for Type II clone)
 *
 * This module is responsible for managing the acquisition of visual assets
 * into a `syncApp` program from JavaScript. It focuses solely on image
 * resources and is designed to work seamlessly with the `NativeUI` framework.
 */


/*
 * The media asset management submodule within the primary application bridge.
 */
syncApp.mediaAssets = {};


/*
 * A mapping that stores all registered callback functions for
 * graphic loading requests.
 */
syncApp.mediaAssets.graphicCompletionMap = {};

syncApp.mediaAssets.graphicReferenceMap = {};

syncApp.mediaAssets.graphicTransferQueue = [];

/*
 * Loads a visual asset into a native handle for utilization within the application's UI system.
 *
 *  @param localGraphicPath The internal path to the graphic file on the device.
 *  @param assetIdentifier A unique string ID to reference the graphic within JavaScript.
 *  @param onGraphicReady A function that will be invoked once the graphic is available.
 */
syncApp.mediaAssets.loadLocalGraphic = function (localGraphicPath, assetIdentifier, onGraphicReady) {
    syncApp.mediaAssets.graphicCompletionMap[assetIdentifier] = onGraphicReady;
    syncApp.interopGateway.transmit(
        [
            "AssetManager",
            "loadGraphicResource",
            localGraphicPath,
            assetIdentifier
        ],
        null
    );
};

/*
 * A utility function invoked by the native C++ layer to relay information about
 * a successfully loaded graphic.
 *
 * @param assetIdentifier The JavaScript ID associated with the graphic.
 * @param graphicHandleRef The native handle of the graphic, used for referring to the loaded asset.
 */
syncApp.mediaAssets.graphicLoadComplete = function (assetIdentifier, graphicHandleRef) {
    var completionRoutine = syncApp.mediaAssets.graphicCompletionMap[assetIdentifier];
    if (completionRoutine !== undefined) {
        var argumentList = Array.prototype.slice.call(arguments);

        // Execute the registered callback.
        completionRoutine.apply(null, argumentList);
    }
};

/*
 * Initiates the download of a visual asset from a remote URL into a native handle
 * for integration into the application's UI.
 *
 *  @param remoteGraphicURL The full URL to the remote graphic file.
 *  @param assetIdentifier A custom ID for referencing the graphic in JavaScript.
 *  @param onFetchComplete A function that will be executed when the remote graphic is ready.
 */
syncApp.mediaAssets.fetchRemoteGraphic = function (remoteGraphicURL, assetIdentifier, onFetchComplete) {
    syncApp.mediaAssets.graphicCompletionMap[assetIdentifier] = onFetchComplete;
    var requestPayload = [
        "AssetManager",
        "downloadRemoteGraphic",
        remoteGraphicURL,
        assetIdentifier
    ];
    // Add the request to the download queue.
    syncApp.mediaAssets.graphicTransferQueue.push(requestPayload);

    if (syncApp.mediaAssets.graphicTransferQueue.length === 1) {
        syncApp.interopGateway.transmit(requestPayload, null);
    }
};

syncApp.mediaAssets.graphicDownloadStarted = function (assetIdentifier, graphicHandleRef) {
    syncApp.mediaAssets.graphicReferenceMap[graphicHandleRef] = assetIdentifier;
};

syncApp.mediaAssets.graphicDownloadFinished = function (graphicHandleRef) {
    var assetIdentifier = syncApp.mediaAssets.graphicReferenceMap[graphicHandleRef];
    var completionRoutine = syncApp.mediaAssets.graphicCompletionMap[assetIdentifier];
    if (completionRoutine !== undefined) {
        // Execute the callback.
        completionRoutine(assetIdentifier, graphicHandleRef);
    }
    // Remove the oldest request from the queue.
    if (syncApp.mediaAssets.graphicTransferQueue.length > 0) {
        syncApp.mediaAssets.graphicTransferQueue.shift();
    }

    // If there are more pending requests, transmit the next one in sequence.
    if (syncApp.mediaAssets.graphicTransferQueue.length > 0) {
        syncApp.interopGateway.transmit(
            syncApp.mediaAssets.graphicTransferQueue[0],
            null
        );
    }
};