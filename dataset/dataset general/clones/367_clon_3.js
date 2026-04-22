// This module provides a client for interacting with a hypothetical messaging API.
// It supports both synchronous and asynchronous operations.
// Developed by a different team, with distinct naming conventions and structural choices.
function MessagingClient(endpointURL, countryCode, phoneNumber, deviceIdentifier) {
    // Validate the core API endpoint upon client instantiation.
    // This is a Type III addition: a guard clause/validation.
    if (!endpointURL || typeof endpointURL !== 'string' || !endpointURL.startsWith('http')) {
        console.error("MessagingClient: Invalid or malformed API endpoint URL provided.");
        throw new Error("Client initialization failed: Bad API URL.");
    }

    // Assign core configuration parameters to internal properties.
    // Renamed properties extensively (Type II).
    this.deviceSerialID = deviceIdentifier; // Renamed 'imei'
    this.userPhoneNumber = phoneNumber;     // Renamed 'pn'
    this.geographicCode = countryCode;      // Renamed 'cc'
    this.apiTargetURL = endpointURL;        // Renamed 'api'

    /**
     * Executes a blocking (synchronous) request to the API.
     * This method will pause script execution until a response is received or an error occurs.
     *
     * @param {string} operationType - The specific API method or action to invoke. (Renamed 'method')
     * @param {object} operationParameters - The payload data for the operation. (Renamed 'params')
     * @returns {object|null} The parsed JSON response from the server, or null if the request fails or returns no data.
     */
    this.executeSynchronousOperation = function(operationType, operationParameters) {
        // Add an early exit condition for invalid operation types. (Type III addition)
        if (!operationType || typeof operationType !== 'string') {
            console.warn("Synchronous operation aborted: No valid operation type specified.");
            return null;
        }

        // Construct the client identity object for the request.
        // Using object literal syntax and new property names (Type II, Type III structural rewrite).
        const clientIdentityPayload = {
            regionCode: this.geographicCode,      // Renamed from id.cc
            contactNumber: this.userPhoneNumber,  // Renamed from id.pn
            hardwareID: this.deviceSerialID       // Renamed from id.imei
        };

        // Construct the details of the action to be performed.
        const actionSpecification = {
            actionKind: operationType,            // Renamed from action.method
            actionData: operationParameters       // Renamed from action.params
        };

        // Combine identity and action into the final request data structure.
        // Renamed top-level keys ('id' to 'identityInfo', 'action' to 'actionDetails').
        const fullRequestData = {
            identityInfo: clientIdentityPayload,
            actionDetails: actionSpecification
        };

        let serverResponseResult = null; // Initialize response variable (Type II, Type III helper)

        try {
            // Perform the synchronous AJAX call.
            // Changed 'type' to 'method' for variety (both supported by jQuery).
            // Removed the `success` callback from `$.ajax` options as `responseText` is directly used for sync calls,
            // making it a Type III deletion of a non-essential/redundant statement.
            const rawAjaxResponse = $.ajax({
                method: "POST", // Changed from "type"
                url: this.apiTargetURL,
                data: fullRequestData,
                dataType: "json", // Expecting JSON back
                async: false,     // Critical for synchronous execution
                // Added a basic error handler for synchronous calls (Type III addition).
                error: function(xhr, status, error) {
                    console.error("Synchronous AJAX error:", status, error, xhr.responseText);
                }
            }).responseText; // Directly retrieve the raw string response.

            // If a response string is received, attempt to parse it as JSON.
            // This is a Type III update to ensure JSON parsing aligns with `dataType: "json"`.
            if (rawAjaxResponse) {
                serverResponseResult = JSON.parse(rawAjaxResponse);
            }
        } catch (parseError) {
            console.error("Error processing synchronous response or JSON parsing:", parseError);
            // In case of a parsing error, ensure null is returned.
            serverResponseResult = null;
        }

        // Return the processed result. Rewritten from `if(answer)return answer;` for clarity (Type III).
        return serverResponseResult;
    };

    /**
     * Initiates an asynchronous request to the API, allowing the script to continue execution.
     * A provided callback function will be invoked upon completion (success or failure).
     *
     * @param {string} taskID - An identifier for the asynchronous task. (Renamed 'method')
     * @param {object} taskPayload - The data payload for the asynchronous task. (Renamed 'params')
     * @param {function} [onCompletionCallback] - A function to execute when the request finishes.
     *                                          It receives the parsed JSON response on success, or null on failure. (Renamed 'callback')
     */
    this.dispatchAsyncRequest = function(taskID, taskPayload, onCompletionCallback) {
        // Add a check for the task identifier. (Type III addition)
        if (!taskID || typeof taskID !== 'string') {
            console.warn("Async request skipped: Invalid or empty task identifier.");
            return; // Exit early if taskID is invalid.
        }

        // Define a fallback callback if none is provided. (Type III addition: helper/guard)
        const finalResponseHandler = typeof onCompletionCallback === 'function' ? onCompletionCallback : (response) => {
            console.info("Async task completed without specific handler:", response);
        };

        // Prepare the requestor's identity information.
        const requestorContext = {
            deviceHash: this.deviceSerialID,
            contactDetail: this.userPhoneNumber,
            geoTag: this.geographicCode
        };

        // Prepare the operation's specific details.
        const operationSpecifics = {
            taskType: taskID,
            parameters: taskPayload
        };

        // Construct the aggregated data package for the asynchronous request.
        const aggregatedDataPackage = {
            contextInfo: requestorContext,
            operationSpec: operationSpecifics
        };

        // Execute the asynchronous AJAX request using jQuery.
        // Chaining `.done()` and `.fail()` is a structural rewrite from just `.done(callback)` (Type III).
        $.ajax({
            method: "POST", // Changed from "type"
            url: this.apiTargetURL,
            data: aggregatedDataPackage, // Renamed data structure properties
            dataType: "json",
            async: true // Explicitly asynchronous
        })
        .done(function(serverData) {
            // On successful completion, invoke the provided callback with the parsed data.
            finalResponseHandler(serverData);
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
            // On failure, log the error and invoke the callback with null (or an error object).
            // This `.fail()` handler is a Type III addition for robust error handling.
            console.error("Asynchronous API request encountered an error:", textStatus, errorThrown, jqXHR.responseText);
            finalResponseHandler(null); // Indicate failure to the consumer.
        });
    };
}