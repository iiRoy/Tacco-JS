const platformInterface = {
    dispatch: (signal, feedbackHandler) => {
        // This is a placeholder for the external communication bridge.
        // In the original context, this would be mosync.bridge.send.
    }
};

const contentRegistry = (() => {
    const completionHandlers = new Map();
    const resourceHandleMap = new Map();
    const pendingRemoteRequests = [];
    let isRemoteTransferActive = false;

    const forwardCommand = (commandPacket) => {
        platformInterface.dispatch(commandPacket, null);
    };

    const processNextRemoteRequest = () => {
        if (pendingRemoteRequests.length > 0 && !isRemoteTransferActive) {
            isRemoteTransferActive = true;
            const nextRequest = pendingRemoteRequests[0];
            forwardCommand(nextRequest.command);
        }
    };

    return {
        requestLocalAsset: (localPath, assetID, completionCallback) => {
            completionHandlers.set(assetID, completionCallback);
            forwardCommand(["AssetService", "loadLocalResource", localPath, assetID]);
        },

        onLocalAssetLoaded: (assetID, assetHandle) => {
            const handler = completionHandlers.get(assetID);
            if (handler) {
                handler(assetID, assetHandle);
            }
        },

        queueRemoteAssetFetch: (remoteUrl, assetID, completionCallback) => {
            completionHandlers.set(assetID, completionCallback);
            const requestCommand = ["AssetService", "fetchRemoteResource", remoteUrl, assetID];
            pendingRemoteRequests.push({ assetID: assetID, command: requestCommand });
            processNextRemoteRequest();
        },

        onRemoteAssetFetchStarted: (assetID, assetHandle) => {
            resourceHandleMap.set(assetHandle, assetID);
        },

        onRemoteAssetFetchFinished: (assetHandle) => {
            const assetID = resourceHandleMap.get(assetHandle);
            if (assetID) {
                const handler = completionHandlers.get(assetID);
                if (handler) {
                    handler(assetID, assetHandle);
                }
                resourceHandleMap.delete(assetHandle);
            }

            if (pendingRemoteRequests.length > 0) {
                pendingRemoteRequests.shift();
            }
            isRemoteTransferActive = false;
            processNextRemoteRequest();
        }
    };
})();