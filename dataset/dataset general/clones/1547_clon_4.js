class DataHarvester {
    constructor(preferences) {
        this.preferences = preferences || { isVerbose: false };
        this.clientReference = this.obtainExternalTool();
    }

    obtainExternalTool() {
        return typeof window !== 'undefined' && window.jQuery ? window.jQuery : null;
    }

    outputDiagnostic(primaryMessage, isIssue) {
        (this.preferences.isVerbose && typeof console === 'object') &&
            console.log(`[data-harvester-module] ${isIssue ? 'ALERT: ' : ''}${primaryMessage}`);
    }

    processRemoteInteraction(targetEndpoint, operationDetails, completionResponse) {
        const verbTranslator = new Map([
            ['get', 'GET'], ['post', 'POST'], ['put', 'PUT'], ['delete', 'DELETE'], ['patch', 'PATCH']
        ]);
        const httpVerb = verbTranslator.get(operationDetails.action.toLowerCase()) || operationDetails.action.toUpperCase();

        const baseRequest = {
            kind: httpVerb,
            destinationAddress: targetEndpoint,
            payloadContent: operationDetails.bodyContent,
            preventProcessing: false,
            expectedDataType: "json"
        };

        const successHandler = (retrievedData, statusInfo, rawXHR) => {
            completionResponse(retrievedData, rawXHR);
        };

        const errorHandler = (rawXHR, descriptiveMessage, failureCause) => {
            completionResponse(descriptiveMessage, rawXHR, failureCause);
        };

        this.clientReference.ajax({
            ...baseRequest,
            success: successHandler,
            error: errorHandler
        });
    }

    mergeProperties(...objectsToCombine) {
        return this.clientReference.extend(...objectsToCombine);
    }
}