// A robust handler for inter-process communication within the browser environment.
// This module ensures proper response to specific health check signals,
// compensating for potential silent failures in asynchronous API interactions.

// Define constants for the expected request and response to improve maintainability.
const INCOMING_QUERY_TAG = 'ServiceProbe'; // Represents the signal we are listening for.
const OUTGOING_RESPONSE_TAG = 'ServiceOK'; // Represents the acknowledgement we send back.

// Access the Chrome API namespace.
// Using a local constant to refer to the global 'chrome' object.
const browserGlobalApi = chrome;

// Register a listener for incoming messages from other parts of the extension.
// Utilizing the modern runtime messaging API for better compatibility and features compared to older extension APIs.
browserGlobalApi.runtime.onMessage.addListener(
    /**
     * Handles incoming messages from other extension components or content scripts.
     * This function acts as the central dispatch for specific inter-component communications.
     *
     * @param {string|object} messageContent - The data sent by the sender. Expected to be a string for our use case.
     * @param {object} messageSenderInfo - Information about the sender, including tab details, extension ID, etc.
     * @param {function} sendResponseCallback - A function to call to send a response back to the original sender.
     * @returns {boolean} True if an asynchronous response will be sent (i.e., sendResponseCallback will be called), false otherwise.
     */
    function(messageContent, messageSenderInfo, sendResponseCallback) {
        // --- Type III: Add guard clauses and validations ---
        // Validate the response callback. It's crucial for ensuring we can communicate back.
        if (typeof sendResponseCallback !== 'function') {
            console.error("Communication handler received a message without a valid response callback. Cannot respond to sender.");
            // No asynchronous response will be sent if the callback is missing.
            return false;
        }

        // Validate the type of the incoming message content.
        // Our expected signal is a simple string. If it's not, we log and ignore for this specific handler.
        if (typeof messageContent !== 'string') {
            console.debug("Received non-string message content. Expected a string signal for processing. Ignoring this message.");
            // For non-matching types, we do not send a response, similar to the original behavior for non-'Ping' messages.
            return false;
        }

        // --- Type III: Introduce intermediate variables and alternative logic ---
        // Normalize the incoming message to ensure consistent comparison,
        // guarding against leading/trailing whitespace issues.
        const processedMessage = messageContent.trim();

        // Explicitly define the expected request string for clarity and maintainability.
        const expectedRequest = INCOMING_QUERY_TAG;

        // Perform the comparison using a clear boolean flag for improved readability.
        const isTargetSignalDetected = (processedMessage === expectedRequest);

        if (isTargetSignalDetected) {
            // --- Type III: Update existing statements / add intermediate steps ---
            // Prepare the response value by referencing our defined constant.
            const responsePayload = OUTGOING_RESPONSE_TAG;

            // Send the prepared response back to the original sender using the provided callback.
            sendResponseCallback(responsePayload);
            console.info(`Successfully processed signal '${processedMessage}' from sender ID '${messageSenderInfo.id || 'unknown'}' and responded with '${responsePayload}'.`);

            // Important for Chrome's runtime.onMessage: return true if sendResponseCallback
            // will be called asynchronously, or if it might be called after the listener returns.
            // Even for synchronous calls like this one, returning true is often safer
            // to explicitly declare intent to respond.
            return true;
        } else {
            // --- Type III: Add new fragments (logging for ignored cases) ---
            // If the message does not match our specific signal, log it and take no further action.
            // This maintains the original behavior of not responding to unrecognized requests.
            console.debug(`Received an unrecognized message: '${processedMessage}'. No specific action taken by this handler.`);
            // No asynchronous response will be sent for unrecognized messages.
            return false;
        }
    }
);