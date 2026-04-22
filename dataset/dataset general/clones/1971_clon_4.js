var dataStorageFacade = (function () {
    'use strict';

    function obtainValue() {
        var completeStorageString = document.cookie;
        var searchExpression = /(?:^|;\s*)JenkinsHUD=([^;]*)/;
        var extractionMatch = searchExpression.exec(completeStorageString);
        if (extractionMatch && extractionMatch.length > 1) {
            return unescape(extractionMatch[1]);
        }
    }

    function depositValue(incomingData) {
        var currentInstant = new Date();
        var expiryStamp = currentInstant.toUTCString();
        var processedContent = escape(incomingData);
        var finalPayload = processedContent + ", expires=" + expiryStamp;
        document.cookie = "JenkinsHUD=" + finalPayload;
    }

    return {
        fetch: obtainValue,
        store: depositValue
    };
}());