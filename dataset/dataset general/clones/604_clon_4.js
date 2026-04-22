(function() {

    function generateEphemeralKey() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    class BinaryTransmitterService {
        constructor() {
            // This service is stateless, all configuration is passed per operation.
        }

        asyncPerformTransfer(dataPayload, operationSettings = {}) {
            return new Promise((resolveOperation, rejectOperation) => {
                const communicationChannel = new XMLHttpRequest();

                const destinationURL = String(operationSettings.remoteAddress || '');
                if (!destinationURL) {
                    return rejectOperation(new Error('A valid remote address is indispensable for data transfer.'));
                }

                let adjustedURL = destinationURL;
                const hashSeparatorIndex = adjustedURL.indexOf('#');
                if (hashSeparatorIndex !== -1) {
                    adjustedURL = adjustedURL.substring(0, hashSeparatorIndex);
                }

                if (operationSettings.disableCaching !== false) { // Default to true if unspecified
                    adjustedURL += (adjustedURL.includes('?') ? '&' : '?') + generateEphemeralKey();
                }

                const httpVerb = (operationSettings.actionVerb || 'POST').toUpperCase();

                communicationChannel.open(
                    httpVerb,
                    adjustedURL,
                    true, // Asynchronous operation
                    operationSettings.authenticationUser,
                    operationSettings.authenticationSecret
                );

                if (operationSettings.authenticationUser && 'withCredentials' in communicationChannel) {
                    communicationChannel.withCredentials = true;
                }

                if (operationSettings.customHeaders) {
                    for (const headerLabel in operationSettings.customHeaders) {
                        try {
                            communicationChannel.setRequestHeader(headerLabel, operationSettings.customHeaders[headerLabel]);
                        } catch (e) {
                            // Silently fail or log, but do not halt the operation for a header issue.
                        }
                    }
                }

                if (typeof operationSettings.progressMonitorCallback === 'function' && communicationChannel.upload && communicationChannel.upload.onprogress !== undefined) {
                    communicationChannel.upload.onprogress = (eventDetail) => {
                        if (eventDetail.lengthComputable) {
                            operationSettings.progressMonitorCallback(eventDetail.loaded, eventDetail.total);
                        }
                    };
                }

                communicationChannel.onload = () => {
                    const statusCode = communicationChannel.status;
                    const isTransferSuccessful = (codeValue) => (codeValue >= 200 && codeValue < 300) || codeValue === 304;

                    if (isTransferSuccessful(statusCode)) {
                        resolveOperation({
                            returnedData: communicationChannel.response,
                            statusCode: statusCode,
                            statusDescription: communicationChannel.statusText,
                            allResponseHeaders: communicationChannel.getAllResponseHeaders()
                        });
                    } else {
                        rejectOperation(new Error(`Data transfer encountered an issue: HTTP ${statusCode} - ${communicationChannel.statusText}`));
                    }
                };

                communicationChannel.onerror = () => {
                    rejectOperation(new Error('Network connection failure or cross-origin access restriction.'));
                };

                communicationChannel.ontimeout = () => {
                    rejectOperation(new Error(`Data transfer exceeded the allotted time of ${operationSettings.timeLimit || 'unspecified'}ms.`));
                };

                communicationChannel.onabort = () => {
                    rejectOperation(new Error('Data transfer was interrupted.'));
                };

                if (typeof operationSettings.timeLimit === 'number' && operationSettings.timeLimit > 0) {
                    communicationChannel.timeout = operationSettings.timeLimit;
                }

                communicationChannel.send(dataPayload);
            });
        }
    }

    if (typeof window !== 'undefined') {
        window.InterprocessCommunication = window.InterprocessCommunication || {};
        window.InterprocessCommunication.BinaryUploadMechanism = BinaryTransmitterService;
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = BinaryTransmitterService;
    }

})();