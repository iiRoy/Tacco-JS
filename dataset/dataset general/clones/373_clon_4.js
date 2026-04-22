const provideFileManagementService = (eventHub, configuration) => {

    return (incomingRequest, outgoingResponse, proceedToNext) => {
        outgoingResponse.setHeader('Access-Control-Allow-Origin', configuration.crossOriginPolicy.permittedOrigin);
        outgoingResponse.setHeader('Access-Control-Allow-Methods', configuration.crossOriginPolicy.allowedOperations);

        const ResourceFactory = require('./uploadhandler');
        const assetManagerInstance = new (ResourceFactory(configuration))(
            incomingRequest,
            outgoingResponse,
            (operationOutcome, redirectionTarget) => {
                if (redirectionTarget) {
                    const payloadContainer = { dataElements: operationOutcome };
                    const finalRedirectionPath = redirectionTarget.replace(/%s/, encodeURIComponent(JSON.stringify(payloadContainer)));
                    outgoingResponse.redirect(finalRedirectionPath);
                } else {
                    const acceptedContentType = (incomingRequest.headers.accept || '').includes('application/json')
                        ? 'application/json'
                        : 'text/plain';
                    outgoingResponse.setHeader('Content-Type', acceptedContentType);
                    outgoingResponse.json(200, operationOutcome);
                }
            }
        );

        const bridgeEvents = (sourceEmitter, targetEmitter, requestReference, responseReference) => {
            const eventMappings = new Map([
                ['begin', 'begin'],
                ['end', 'end'],
                ['abort', 'abort'],
                ['error', 'abort'],
                ['delete', 'delete']
            ]);

            eventMappings.forEach((targetEventName, sourceEventName) => {
                sourceEmitter.on(sourceEventName, (eventData) => {
                    targetEmitter.emit(targetEventName, eventData, requestReference, responseReference);
                });
            });
        };
        bridgeEvents(assetManagerInstance, eventHub, incomingRequest, outgoingResponse);

        const methodActions = {
            'OPTIONS': () => outgoingResponse.end(),
            'HEAD': () => assetManagerInstance.get(),
            'GET': () => assetManagerInstance.get(),
            'POST': () => assetManagerInstance.post(),
            'DELETE': () => assetManagerInstance.destroy(),
        };

        const executeAction = methodActions[incomingRequest.method];
        if (executeAction) {
            executeAction();
        } else {
            outgoingResponse.send(405);
        }
    };
};

module.exports = provideFileManagementService;