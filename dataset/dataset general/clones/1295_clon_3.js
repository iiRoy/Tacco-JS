/**
 * @file This module provides a robust set of utilities for generating
 *       standardized API responses and integrating them into an Express.js-like
 *       middleware chain. It promotes consistency across success and error
 *       responses throughout an application.
 * @author A. Developer
 * @version 2.1.0
 */

// Primary container object for all web service related functionalities.
const webServiceTools = {};

/**
 * Defines standard operation types for API responses.
 * These types are used to categorize the action that was performed
 * when crafting a success message.
 * @readonly
 * @enum {string}
 */
webServiceTools.OPERATION_TYPES = Object.freeze({
    FETCH_DATA: "data_retrieval_executed",
    RECORD_CREATION: "new_record_generated",
    RECORD_UPDATE: "existing_record_modified",
    RECORD_DELETION: "record_permanently_removed",
    AUTH_ATTEMPT: "authentication_process_initiated", // Added new operation type
    CONFIG_CHANGE: "configuration_state_adjusted"
});

/**
 * Constructs a standardized success response object for API calls.
 * This function ensures that all successful API replies follow a consistent structure.
 *
 * @param {string} currentOperation - A string describing the type of operation performed (e.g., from OPERATION_TYPES).
 * @param {string} resourceIdentifier - The name or unique identifier of the resource involved in the operation.
 * @param {object | array | string | number | null} responsePayload - The actual data to be returned as part of the success response.
 * @returns {object} A well-formatted success response object, including status, operation, resource, data, and a timestamp.
 */
webServiceTools.createSuccessReply = (currentOperation, resourceIdentifier, responsePayload) => {
    // Intermediate variable for status string, enhancing readability.
    const operationStatus = "SUCCESSFUL";

    // Input validation: Ensure the operation type is a non-empty string.
    // If invalid, a default 'unspecified_operation' is used.
    const validatedOperation = typeof currentOperation === 'string' && currentOperation.trim() !== ''
        ? currentOperation
        : 'unspecified_operation';

    // Data guard: If the payload is null or undefined, an empty object is used to prevent errors.
    const effectivePayload = (responsePayload === null || responsePayload === undefined)
        ? {}
        : responsePayload;

    const replyObject = {
        requestStatus: operationStatus,
        operationPerformed: validatedOperation,
        targetResource: resourceIdentifier,
        returnedData: effectivePayload,
        timestamp: new Date().toISOString() // Added a new fragment: a precise timestamp.
    };
    return replyObject;
};

/**
 * Constructs a standardized error response object for API calls.
 * This function centralizes error message formatting, ensuring consistency across failures.
 *
 * @param {string} failureReason - A descriptive message explaining why the operation failed.
 * @param {number} httpStatusCode - The HTTP status code associated with the error (e.g., 400, 404, 500).
 * @returns {object} A well-formatted error response object, including status, error code, message, and a unique incident ID.
 */
webServiceTools.createErrorReply = (failureReason, httpStatusCode) => {
    // Intermediate variable for status string.
    const errorStatus = "FAILED";

    // Input validation: Ensure the failure reason is a non-empty string.
    // Provides a generic message if the reason is missing or invalid.
    const effectiveReason = typeof failureReason === 'string' && failureReason.trim() !== ''
        ? failureReason
        : 'An unexpected server issue prevented this action.';

    // Guard clause: Validates the provided HTTP status code.
    // Defaults to 500 Internal Server Error if the code is invalid or missing.
    const effectiveStatusCode = (typeof httpStatusCode === 'number' && httpStatusCode >= 100 && httpStatusCode < 600)
        ? httpStatusCode
        : 500;

    const errorObject = {
        requestStatus: errorStatus,
        errorCode: effectiveStatusCode,
        errorMessage: effectiveReason,
        incidentId: Math.random().toString(36).substring(2, 10).toUpperCase(), // Added new fragment: a simple unique incident identifier.
        occurredAt: new Date().toISOString() // Added new fragment: timestamp of the error.
    };
    return errorObject;
};

/**
 * Factory function to create an Express-style middleware that enhances the
 * `responseContext` object with helper methods for sending standardized API replies.
 * This function wraps the actual middleware to allow for configuration or setup if needed.
 *
 * @returns {function(object, object, function): void} An Express-compatible middleware function.
 */
const setupResponseMiddleware = () => {
    /**
     * The actual middleware function that intercepts requests to inject response helpers.
     * @param {object} requestContext - The Express request object (`req`).
     * @param {object} responseContext - The Express response object (`res`).
     * @param {function} nextStep - The Express `next` function to pass control to the next middleware.
     */
    return (requestContext, responseContext, nextStep) => {
        // A helper reference to the utility object for internal calls.
        const apiUtilityRef = webServiceTools;

        // Optional: Add a log statement for debugging or tracking middleware execution.
        // console.log(`[API Response Middleware] Processing request for: ${requestContext.method} ${requestContext.originalUrl}`);

        /**
         * Sends a success response using the standardized format.
         * This method is attached to the `responseContext` object for easy access in route handlers.
         *
         * @param {string} opType - The type of operation performed.
         * @param {string} resourceName - The identifier of the resource.
         * @param {object | array} payloadData - The data payload to include in the response.
         */
        responseContext.sendOkResult = (opType, resourceName, payloadData) => {
            // Validate payloadData to ensure it's an object or array before sending.
            if (typeof payloadData !== 'object' && !Array.isArray(payloadData) && payloadData !== null) {
                console.warn(`[API Response] Payload for success response is not an object/array. Type: ${typeof payloadData}`);
                // Optionally, convert to string or wrap in an object.
                payloadData = { value: payloadData };
            }

            const finalResponse = apiUtilityRef.createSuccessReply(opType, resourceName, payloadData);
            // Rewritten to use `.status().json()` which is more semantically correct for API responses
            // compared to generic `.send()`.
            responseContext.status(200).json(finalResponse);
        };

        /**
         * Sends an error response using the standardized format.
         * This method is attached to the `responseContext` object for consistent error handling.
         *
         * @param {string} reason - The error message.
         * @param {number} code - The HTTP status code for the error.
         */
        responseContext.sendErrorResult = (reason, code) => {
            const errorResponse = apiUtilityRef.createErrorReply(reason, code);
            // Use the status code from the generated error response, which includes validation.
            const actualStatusCode = errorResponse.errorCode;

            responseContext.status(actualStatusCode).json(errorResponse);

            // Added new fragment: Log the error on the server side for monitoring.
            console.error(`[API Error] ${actualStatusCode} - ${reason} (Incident: ${errorResponse.incidentId})`);
        };

        /**
         * Convenience method to send a 404 Not Found error response.
         * This streamlines common "resource not found" scenarios.
         *
         * @param {string} [customMessage] - An optional, custom message to override the default "Not Found" message.
         */
        responseContext.resourceNotFound = (customMessage = "The requested resource could not be located or does not exist.") => {
            // Directly calls the generic error sender with specific 404 parameters.
            responseContext.sendErrorResult(customMessage, 404);
        };

        // Transfer control to the next middleware function in the stack.
        return nextStep();
    };
};

// Assign the middleware factory to the main utility object for external access.
webServiceTools.configureMiddleware = setupResponseMiddleware;

// Export the entire utility object for use in other modules.
module.exports = webServiceTools;