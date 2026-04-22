// This module encapsulates the logic for retrieving specific data from a remote endpoint
// and subsequently broadcasting this information to the application's event system.
// It serves as a dedicated data acquisition service within the application architecture.

// Import the 'superagent' library for making HTTP requests.
var webApiClient = require('superagent');

// --- Global Configuration Parameters ---
// The full URL of the external resource from which the content will be fetched.
const DATA_SOURCE_ENDPOINT_URL = 'https://rawgit.com/mridgway/10be75846faa22eb6e22/raw/';

// The value for the 'Accept' HTTP header, indicating the desired format of the server's response.
const EXPECTED_RESPONSE_TYPE_HEADER = 'application/json';

// The symbolic name for the event that will be emitted upon successful data retrieval and processing.
const DATA_SUCCESS_EVENT_NAME = 'APPLICATION_DATA_RETRIEVED';

// The symbolic name for the event that will be emitted if any error occurs during the data fetching process.
const DATA_FAILURE_EVENT_NAME = 'APPLICATION_DATA_FETCH_FAILED';

/**
 * Orchestrates the retrieval of content from a predefined remote URL.
 * Upon successful fetching and parsing, it dispatches the content
 * through a provided event notification mechanism. It also incorporates
 * robust error handling for various failure scenarios.
 *
 * @param {object} applicationEventBus - An object instance responsible for
 *                                     emitting application-wide events. This object
 *                                     is expected to implement an 'emit' method.
 * @param {function} operationCompletionSignal - A callback function that is invoked
 *                                              once the data fetching operation concludes,
 *                                              whether successfully or with an error.
 *                                              It receives an `Error` object as its first
 *                                              argument if the operation failed, otherwise `null`.
 */
module.exports = function (applicationEventBus, operationCompletionSignal) {

    // --- Pre-execution Validation ---
    // Validate the integrity of the applicationEventBus parameter.
    // It must be an object and contain a callable 'emit' method to ensure proper event propagation.
    if (!applicationEventBus || typeof applicationEventBus.emit !== 'function') {
        console.error('ContentFetcher: Critical error: The provided applicationEventBus is invalid or lacks an "emit" method.');

        // If the completion signal is valid, attempt to notify of the initial setup failure.
        if (typeof operationCompletionSignal === 'function') {
            operationCompletionSignal(new Error('Invalid application event bus provided; cannot proceed.'));
        }
        return; // Terminate execution early if the event bus is non-functional.
    }

    // Validate the operationCompletionSignal parameter.
    // It must be a function to ensure that the process can signal its completion.
    if (typeof operationCompletionSignal !== 'function') {
        console.error('ContentFetcher: Warning: No valid operationCompletionSignal function was provided. Completion status will not be reported.');
        // No callback to call, so just log and exit.
        return;
    }

    // --- Initiate Remote Data Request ---
    // Create an instance of the HTTP GET request targeted at our data source.
    const activeHttpRequest = webApiClient.get(DATA_SOURCE_ENDPOINT_URL);

    // Configure the request headers. We are explicitly telling the server
    // that we prefer JSON formatted responses.
    activeHttpRequest.set('Accept', EXPECTED_RESPONSE_TYPE_HEADER);

    // Execute the HTTP request. The callback function will handle both
    // network-level errors and successful server responses.
    activeHttpRequest.end(function (httpRequestError, serverReply) {

        // --- Error Handling for HTTP Request Failures ---
        // Check if there was an error during the network communication or request processing.
        if (httpRequestError) {
            console.error('ContentFetcher: HTTP request failed:', httpRequestError.message);

            // Notify the application's event bus about the failure.
            applicationEventBus.emit(DATA_FAILURE_EVENT_NAME, {
                issueType: 'Network or HTTP Request Error',
                errorDetails: httpRequestError.message,
                httpStatusCode: serverReply ? serverReply.status : undefined // Include status if available
            });

            // Invoke the completion callback, passing the error object.
            return operationCompletionSignal(httpRequestError);
        }

        // --- Server Response Validation ---
        // Verify that a valid server response object was received and that the HTTP status
        // code indicates success (e.g., 2xx range, as indicated by superagent's 'ok' property).
        if (!serverReply || !serverReply.ok) {
            const statusInfo = serverReply ? `HTTP Status: ${serverReply.status} - ${serverReply.text}` : 'No valid server response received.';
            console.error('ContentFetcher: Server did not return a successful response.', statusInfo);

            // Emit an event to indicate an unsuccessful server response.
            applicationEventBus.emit(DATA_FAILURE_EVENT_NAME, {
                issueType: 'Unsuccessful Server Response',
                httpStatusCode: serverReply ? serverReply.status : 'unknown',
                responseExcerpt: serverReply && serverReply.text ? serverReply.text.substring(0, 150) : 'N/A'
            });

            // Signal completion with a descriptive error.
            return operationCompletionSignal(new Error(`Server response indicated an error: ${statusInfo}`));
        }

        let processedContentData;
        try {
            // --- JSON Parsing Attempt ---
            // The core content is expected to be in JSON format. Attempt to parse it.
            processedContentData = JSON.parse(serverReply.text);
        } catch (jsonParsingException) {
            console.error('ContentFetcher: Failed to parse server response body as JSON:', jsonParsingException.message);

            // Dispatch an event to inform the application about the JSON parsing failure.
            applicationEventBus.emit(DATA_FAILURE_EVENT_NAME, {
                issueType: 'JSON Parsing Failure',
                parsingError: jsonParsingException.message,
                rawContentSample: serverReply.text ? serverReply.text.substring(0, 250) : 'Empty response body'
            });

            // Conclude the operation, reporting the parsing error.
            return operationCompletionSignal(new Error('Received malformed JSON data from the server.'));
        }

        // --- Optional Data Structure Validation ---
        // As an additional layer of robustness, we can check the type of the parsed data.
        // For instance, if the API is expected to always return an array of items.
        if (typeof processedContentData !== 'object' || processedContentData === null) {
            console.warn('ContentFetcher: The retrieved and parsed content is not an object (or array) as might be generally expected. Proceeding with caution.');
            // Depending on requirements, this could be treated as an error and trigger a failure event.
            // For now, we'll allow it as the original code didn't validate content structure.
        }


        // --- Successful Data Dispatch ---
        // If all stages (request, response, parsing) were successful,
        // the parsed data is now ready to be dispatched.
        applicationEventBus.emit(DATA_SUCCESS_EVENT_NAME, processedContentData);

        // --- Final Operation Completion ---
        // Signal the successful conclusion of the entire data fetching operation.
        // Pass 'null' as the error argument to indicate success.
        operationCompletionSignal(null);
    });
};