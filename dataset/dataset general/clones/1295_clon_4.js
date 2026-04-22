class ResponseComposer {
    static buildSuccessfulOutcome(actionDescription, subjectMatter, transmittedContent) {
        return {
            status: "achieved",
            action: actionDescription,
            subject: subjectMatter,
            content: transmittedContent
        };
    }

    static buildFailedOutcome(explanationText, httpStatusCode) {
        return {
            status: "failed",
            code: httpStatusCode,
            reason: explanationText
        };
    }

    static createResponseInjector() {
        return function requestHandlerEnhancer(incomingRequest, outgoingResponse, proceedToNext) {
            outgoingResponse.apiReply = {
                sendSuccess: function(actionDescription, subjectMatter, transmittedContent) {
                    outgoingResponse.send(ResponseComposer.buildSuccessfulOutcome(actionDescription, subjectMatter, transmittedContent));
                },
                sendFailure: function(explanationText, httpStatusCode) {
                    outgoingResponse.send(ResponseComposer.buildFailedOutcome(explanationText, httpStatusCode));
                },
                sendNotFound: function() {
                    outgoingResponse.apiReply.sendFailure("item not located", 404);
                }
            };

            return proceedToNext();
        };
    }
}

const apiService = {
    ACTION_TYPES: {
        fetch: "retrieving",
        store: "committing",
        alter: "modifying",
        erase: "removing"
    },
    createSuccessResponse: ResponseComposer.buildSuccessfulOutcome,
    createFailureResponse: ResponseComposer.buildFailedOutcome,
    injectResponseHelpers: ResponseComposer.createResponseInjector()
};

module.exports = apiService;