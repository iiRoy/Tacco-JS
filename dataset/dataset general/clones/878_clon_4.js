var _CDV_environment = {};

_CDV_environment.nativeBridgeExecutor = window.cordova ? window.cordova.exec : function(s, e, c, a, args) {
    console.warn("Native bridge executor (cordova.exec) not found. Attempted call:", c, a, args);
    if (e) setTimeout(() => e("MOCK_ERROR_NO_EXEC"), 50);
};

_CDV_environment.systemEventChannel = window.cordova ? window.cordova.channel : {
    onCordovaReady: {
        subscribe: function(callbackFunction) {
            if (window.cordova && window.cordova.channel && window.cordova.channel.onCordovaReady) {
                window.cordova.channel.onCordovaReady.subscribe(callbackFunction);
            } else {
                setTimeout(callbackFunction, 0);
            }
        }
    }
};

_CDV_environment.fileUtility = window.cordova ? window.cordova.file : {
    cacheDirectory: 'file:///mock_ios_app_cache/',
    externalCacheDirectory: 'file:///mock_android_ext_cache/'
};

_CDV_environment.resourceDownloader = window.FileTransfer || function() {
    this.download = function(sourceURL, destinationPath, successHandler, errorHandler, trustAll) {
        console.warn("ResourceDownloader (FileTransfer) mock download called:", sourceURL, destinationPath, trustAll);
        setTimeout(() => {
            successHandler({
                toURL: function() { return destinationPath; }
            });
        }, 100);
    };
};

_CDV_environment.documentEventDispatcher = window.cordova ? window.cordova : {
    fireDocumentEvent: function(eventName, eventPayload) {
        console.log("Mock document event fired:", eventName, eventPayload);
    }
};

function _notifySystemEvents(notificationLabel, notificationData) {
    var currentEventChannel = _CDV_environment.systemEventChannel;
    var currentEventDispatcher = _CDV_environment.documentEventDispatcher;
    var eventInformationContainer = {};

    currentEventChannel.onCordovaReady.subscribe(function() {
        var dispatchedEventName = 'content_access.' + notificationLabel;
        var payloadKey = (notificationLabel === 'failure_state') ? 'error_details' : 'return_data';
        eventInformationContainer[payloadKey] = notificationData;
        currentEventDispatcher.fireDocumentEvent(dispatchedEventName, eventInformationContainer);
    });
}

function _operationCompleteHandler(finalResourcePath, userProvidedSuccessCallback) {
    _notifySystemEvents('success_state', finalResourcePath);
    if (typeof userProvidedSuccessCallback === 'function') {
        userProvidedSuccessCallback(finalResourcePath);
    }
    return finalResourcePath;
}

function _operationErrorHandler(userProvidedErrorCallback) {
    var receivedErrorCode = (arguments.length > 1) ? arguments[1] : 0;
    _notifySystemEvents('failure_state', receivedErrorCode);
    if (typeof userProvidedErrorCallback === 'function') {
        userProvidedErrorCallback(receivedErrorCode);
    }
    return receivedErrorCode;
}

function _downloadAndProcessRemoteAsset(assetSourceURL, successAction, errorAction, secureTransferEnabled) {
    var fileTransferInstance = new _CDV_environment.resourceDownloader();
    var iOSCachePath = _CDV_environment.fileUtility.cacheDirectory;
    var AndroidCachePath = _CDV_environment.fileUtility.externalCacheDirectory;
    var destinationBaseDirectory = AndroidCachePath || iOSCachePath;

    var pathSegments = assetSourceURL.split('/');
    var assetFileName = pathSegments[pathSegments.length - 1];
    var finalLocalPath = destinationBaseDirectory + assetFileName;

    var actualSecureTransferFlag = (typeof secureTransferEnabled === 'boolean') ? secureTransferEnabled : false;

    fileTransferInstance.download(
        assetSourceURL,
        finalLocalPath,
        function(downloadResultEntry) {
            var actualFilePath = downloadResultEntry.toURL();
            _CDV_environment.nativeBridgeExecutor(
                function(execSuccess) { _operationCompleteHandler(actualFilePath, successAction); },
                function(execFailure) { _operationErrorHandler(errorAction, execFailure); },
                'ContentViewer',
                'displayFile',
                [actualFilePath]
            );
        },
        function(transferError) {
            _operationErrorHandler(errorAction, transferError.code);
        },
        actualSecureTransferFlag
    );
}

var _documentAccessModule = {};

_documentAccessModule.initiateContentViewing = function(contentIdentifier, successCallback, failureCallback, allowInsecureConnections) {
    if (!contentIdentifier || contentIdentifier.length === 0 || arguments.length < 1) {
        return false;
    }

    var encodedContentIdentifier = window.encodeURI(contentIdentifier);

    if (encodedContentIdentifier.startsWith('http://') || encodedContentIdentifier.startsWith('https://')) {
        _downloadAndProcessRemoteAsset(encodedContentIdentifier, successCallback, failureCallback, allowInsecureConnections);
    } else {
        _CDV_environment.nativeBridgeExecutor(
            function(execSuccess) { _operationCompleteHandler(encodedContentIdentifier, successCallback); },
            function(execFailure) { _operationErrorHandler(failureCallback, execFailure); },
            'ContentViewer',
            'displayFile',
            [encodedContentIdentifier]
        );
    }
};

window.GlobalDocumentViewer = _documentAccessModule;