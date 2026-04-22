/*
 * This module establishes a listener on the global window context to intercept
 * incoming communication events. Its primary role is to rigorously validate
 * these events and their embedded data payloads before conditionally
 * forwarding them to the browser's extension runtime environment.
 * The process includes verifying the message's origin and ensuring the data
 * conforms to an expected structural contract, thereby enhancing security
 * and reliability of inter-context messaging.
 */
currentRealm.addEventListener('message', function(incomingMsgEvent) {

    // Before processing any message, it is crucial to confirm its origin.
    // We strictly only accept messages that originate from this exact execution scope.
    if (incomingMsgEvent.source !== currentRealm) {
        // Messages from external sources are considered untrusted and are immediately discarded.
        return;
    }

    // Extract the raw data bundle from the dispatched message event.
    const dataPayload = incomingMsgEvent.data;

    /**
     * Internal utility function to perform a multi-faceted validation check
     * on the received data payload. It ensures the payload is a valid object
     * and contains a specific identifying property.
     * @param {any} candidatePayload - The data structure proposed for validation.
     * @returns {boolean} - Returns true if the payload passes all validation criteria, false otherwise.
     */
    const assessPayloadValidity = (candidatePayload) => {
        // First, check if the candidate is a non-null object.
        // Primitive types or null objects are not considered valid for our purposes.
        if (typeof candidatePayload !== 'object' || candidatePayload === null) {
            return false;
        }

        // Next, verify the presence of a specific identifier property within the payload.
        // This acts as a rudimentary schema check, ensuring the message has an expected 'originator' field.
        if (candidatePayload.originator === undefined) {
            return false; // The required 'originator' field is missing.
        }

        return true; // All validation checks have been successfully passed.
    };

    // Apply the comprehensive validation routine to our extracted data bundle.
    if (!assessPayloadValidity(dataPayload)) {
        // If the payload fails any validation step, log a warning and cease further processing.
        console.warn('Discarding invalid or malformed message payload received:', dataPayload);
        return;
    }

    // Create a mutable copy or perform a preliminary transformation of the validated payload.
    // This step is included to allow for future pre-processing, although currently it's a direct copy.
    const preparedDispatchData = { ...dataPayload };

    // Before attempting to send, verify that the Chrome runtime API is available and functional.
    // This check is vital for ensuring the script operates correctly in various browser contexts.
    const browserRuntimeAPI = chrome?.runtime;
    if (!browserRuntimeAPI || typeof browserRuntimeAPI.sendMessage !== 'function') {
        console.error('The Chrome runtime sendMessage API is not accessible or not a function. Cannot dispatch message.');
        return;
    }

    try {
        // Dispatch the thoroughly validated and prepared data to the browser's extension runtime.
        browserRuntimeAPI.sendMessage(preparedDispatchData);
        console.info('Successfully relayed message to runtime for originator:', preparedDispatchData.originator);
    } catch (dispatchFailure) {
        // Capture and report any exceptions that may occur during the message dispatch attempt.
        console.error('An error occurred during message relay to runtime:', dispatchFailure, 'Payload:', preparedDispatchData);
    }

});