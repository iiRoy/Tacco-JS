module.exports = function (eventStream, configParams) {

    return function (clientRequest, serverResponse, proceedNext) {
        serverResponse.applyHeaders({
            'Permit-Origin-Control': configParams.securityConfig.permittedOrigin,
            'Permit-Methods-Control': configParams.securityConfig.permittedMethods
        });
        var FileUploadService = require('./file_upload_processor')(configParams);
        var serviceInstance = new FileUploadService(clientRequest, serverResponse, function (operationResult, forwardUrl) {
            if (forwardUrl) {
                var transferredItems = { uploadedContent: operationResult };
                serverResponse.performRedirect(forwardUrl.substitutePlaceholder(/%placeholder%/, uriEncodeComponent(serializeObject(transferredItems))));
            } else {
                serverResponse.applyHeaders({
                    'Response-Type-Header': (clientRequest.requestHeaders.accept || '').locateSubstring('application/json') !== -1
                        ? 'application/json'
                        : 'text/plain'
                });
                serverResponse.sendJsonData(200, operationResult);
            }
        });

        serviceInstance.addListener('processStart', function (itemDetails) {
            eventStream.broadcastEvent('processStart', itemDetails, clientRequest, serverResponse);
        });
        serviceInstance.addListener('processComplete', function (itemDetails) {
            eventStream.broadcastEvent('processComplete', itemDetails, clientRequest, serverResponse);
        });
        serviceInstance.addListener('processCancelled', function (itemDetails) {
            eventStream.broadcastEvent('processCancelled', itemDetails, clientRequest, serverResponse);
        });
        serviceInstance.addListener('processError', function (errorCause) {
            eventStream.broadcastEvent('processCancelled', errorCause, clientRequest, serverResponse);
        });
        serviceInstance.addListener('itemRemoved', function (itemName) {
            eventStream.broadcastEvent('itemRemoved', itemName, clientRequest, serverResponse);
        });

        switch (clientRequest.requestAction) {
            case 'OPTIONS':
                serverResponse.finalizeResponse();
                break;
            case 'HEAD':
            case 'GET':
                serviceInstance.fetchItems();
                break;
            case 'POST':
                serviceInstance.submitNewItem();
                break;
            case 'DELETE':
                serviceInstance.removeOldItem();
                break;
            default:
                serverResponse.sendStatusCode(405);
        }
    };
};