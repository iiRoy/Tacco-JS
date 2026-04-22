/*
 * Problem Handling Utility Library
 *
 * This module provides advanced capabilities for creating, managing, and serializing
 * error objects within a JavaScript environment. It aims to streamline error handling
 * by offering structured error instances with metadata and chaining support.
 *
 * License: Permissive Open-Source License (e.g., MIT or BSD-3-Clause equivalent)
 */

// Import necessary external definitions for system-level error codes.
const systemErrorLookup = require('errno');

// Define a comprehensive map of standard HTTP status codes to their descriptive phrases.
// This object is frozen to prevent accidental modifications during runtime.
const httpResponsePhrases = Object.freeze({
    "400": "Bad Request: The server cannot process the request due to a client error.",
    "401": "Unauthorized Access: Authentication is required or has failed.",
    "402": "Payment Required: Reserved for future use (or specific payment scenarios).",
    "403": "Forbidden Resource: The client does not have access rights to the content.",
    "404": "Resource Not Found: The requested resource could not be found on the server.",
    "405": "Method Not Allowed: The HTTP method used is not supported for the requested resource.",
    "406": "Not Acceptable: The server cannot produce a response matching the list of acceptable values defined in the request's proactive negotiation.",
    "407": "Proxy Authentication Needed: The client must first authenticate itself with the proxy.",
    "408": "Request Timed Out: The server timed out waiting for the request.",
    "409": "Conflict Detected: The request could not be completed due to a conflict with the current state of the target resource.",
    "410": "Resource Gone: The requested resource is no longer available at the server and no forwarding address is known.",
    "411": "Length Required: The server refuses to accept the request without a defined Content-Length.",
    "412": "Precondition Failed: One or more conditions given in the request header fields evaluated to false when tested on the server.",
    "413": "Payload Too Large: The request entity is larger than limits defined by server.",
    "414": "URI Too Long: The URI provided was too long for the server to process.",
    "415": "Unsupported Media Type: The request entity has a media type which the server or resource does not support.",
    "416": "Range Not Satisfiable: The client has asked for a portion of the file, but the server cannot supply that portion.",
    "417": "Expectation Failed: The expectation given in the Expect request-header field could not be met by at least one of the inbound servers.",
    "418": "I'm a Teapot: This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol (HTCPCP/1.0).",
    "422": "Unprocessable Entity: The server understands the content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions.",
    "423": "Locked Resource: The resource that is being accessed is locked.",
    "424": "Failed Dependency: The request failed because it depended on another request that failed.",
    "425": "Too Early: Indicates that the server is unwilling to risk processing a request that might be replayed.",
    "426": "Upgrade Required: The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.",
    "428": "Precondition Required: The origin server requires the request to be conditional.",
    "429": "Too Many Requests: The user has sent too many requests in a given amount of time.",
    "431": "Request Header Fields Too Large: The server is unwilling to process the request because its header fields are too large.",
    "500": "Internal Server Error: A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.",
    "501": "Not Implemented: The server does not support the functionality required to fulfill the request.",
    "502": "Bad Gateway: The server, while acting as a gateway or proxy, received an invalid response from an upstream server.",
    "503": "Service Unavailable: The server is currently unable to handle the request due to a temporary overload or scheduled maintenance.",
    "504": "Gateway Timeout: The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.",
    "505": "HTTP Version Not Supported: The server does not support the HTTP protocol version used in the request.",
    "506": "Variant Also Negotiates: Transparent content negotiation for the request results in a circular reference.",
    "507": "Insufficient Storage: The server is unable to store the representation needed to complete the request.",
    "508": "Loop Detected: The server detected an infinite loop while processing the request (sent in WebDAV).",
    "510": "Not Extended: Further extensions to the request are required for the server to fulfill it.",
    "511": "Network Authentication Required: The client needs to authenticate to gain network access."
});

// A constant for the default error status code when none is explicitly provided.
const DEFAULT_FALLBACK_STATUS = 500;

/**
 * Generates a comprehensive descriptive string for system-level errors (e.g., from Node.js `fs` module).
 * This helper function enhances readability of low-level operational errors.
 * @param {object | null | undefined} sysErrorObject - The raw system error object, typically containing `errno` and `path`.
 * @returns {string} A formatted description that includes the system error code's meaning and relevant path, if available.
 */
function formatSystemProblemDescription(sysErrorObject) {
    let descriptiveText = 'System Operation Issue: ';
    const systemCodeInfo = sysErrorObject && systemErrorLookup.errno[sysErrorObject.errno];

    // Attempt to find a detailed description based on the system error number.
    if (systemCodeInfo && systemCodeInfo.description) {
        descriptiveText += systemCodeInfo.description;
    } else if (sysErrorObject && sysErrorObject.message) {
        // Fallback to the generic error message if no specific system code description is found.
        descriptiveText += `Generic message: ${sysErrorObject.message}`;
    } else {
        descriptiveText += 'An unspecified low-level system error occurred.';
    }

    // Append the file path or resource identifier if the error is related to one.
    if (sysErrorObject && sysErrorObject.path) {
        descriptiveText += ` (Affected Path: '${sysErrorObject.path}')`;
    }
    return descriptiveText;
}

/**
 * This Immediately Invoked Function Expression (IIFE) extends the global `Error` object
 * with custom factory methods and utility functions, providing a structured approach
 * to error creation and introspection.
 * @param {typeof Error} globalScope - The global Error constructor.
 */
(function (globalScope) {
    // Alias the global Error constructor for internal clarity and potential future polyfills.
    const CustomError = globalScope;

    /**
     * Crafts a new, enhanced error instance. This is the primary factory method for creating
     * custom errors with additional context and the ability to chain underlying causes.
     * @param {string} mainMessage - The central, human-readable message for this error. Cannot be empty.
     * @param {object | Array | string | number | boolean | null} [additionalPayload] - Optional metadata, parameters, or context
     *                                                                                 relevant to this error. If it's an object, its
     *                                                                                 properties are merged; otherwise, it's assigned
     *                                                                                 to an `extraData` property.
     * @param {Error | any | null} [underlyingIssue] - An optional previous error or any value that represents
     *                                                 the root cause of the current problem, enabling error chaining.
     * @returns {Error} A newly constructed Error object, augmented with custom properties.
     * @memberof Error
     * @method craftIssue
     * @api public
     */
    CustomError.craftIssue = function (mainMessage, additionalPayload, underlyingIssue) {
        // Input validation for the primary message.
        if (typeof mainMessage !== 'string' || mainMessage.trim().length === 0) {
            console.warn("Error.craftIssue was invoked with an invalid or empty 'mainMessage'. A default message will be used.");
            mainMessage = "An unspecific operational issue occurred.";
        }

        let currentProblem = new CustomError(mainMessage);
        let actualInnerProblem = null;

        // Determine the effective inner error, prioritizing 'underlyingIssue' over 'additionalPayload'.
        if (underlyingIssue instanceof CustomError || (underlyingIssue && typeof underlyingIssue === 'object')) {
            actualInnerProblem = underlyingIssue;
        } else if (additionalPayload instanceof CustomError || (additionalPayload && typeof additionalPayload === 'object')) {
            actualInnerProblem = additionalPayload;
            // If additionalPayload was actually the inner error, clear it so it's not processed as regular payload.
            additionalPayload = {};
        }

        // Attach the inner problem, making it non-enumerable by default to keep JSON serialization clean.
        if (actualInnerProblem) {
            Object.defineProperty(currentProblem, 'innerCause', {
                value: actualInnerProblem,
                writable: false, // Prevent accidental modification of the cause
                configurable: true,
                enumerable: false // Typically, inner errors are serialized separately or on demand.
            });
        }

        // Process the `additionalPayload` to attach context to the error.
        const payloadToApply = additionalPayload === null || additionalPayload === undefined ? {} : additionalPayload;
        if (Array.isArray(payloadToApply) || typeof payloadToApply !== 'object') {
            // If the payload is a primitive type or an array, assign it directly to a dedicated property.
            currentProblem.extraData = payloadToApply;
        } else {
            // If it's a plain object, iterate and merge its properties onto the error instance.
            // This allows for flexible attachment of contextual data.
            for (const propName in payloadToApply) {
                if (Object.prototype.hasOwnProperty.call(payloadToApply, propName) &&
                    // Avoid overwriting standard Error properties or our custom ones.
                    !['message', 'stack', 'name', 'innerCause', 'extraData', 'statusCode', 'detailedDescription'].includes(propName)) {
                    currentProblem[propName] = payloadToApply[propName];
                }
            }
        }

        // Establish a status code for the error, inheriting from the inner cause if present.
        if (!currentProblem.statusCode || typeof currentProblem.statusCode !== 'number') {
            currentProblem.statusCode = (currentProblem.innerCause && typeof currentProblem.innerCause.statusCode === 'number')
                ? currentProblem.innerCause.statusCode
                : DEFAULT_FALLBACK_STATUS;
        }

        // Generate a detailed description if the error has an underlying system cause.
        if (currentProblem.innerCause && currentProblem.innerCause.errno) {
            currentProblem.detailedDescription = formatSystemProblemDescription(currentProblem.innerCause);
        } else if (actualInnerProblem instanceof CustomError && actualInnerProblem.message) {
            currentProblem.detailedDescription = `Originating from: "${actualInnerProblem.message}"`;
        } else {
            currentProblem.detailedDescription = 'No specific detailed description available.';
        }

        return currentProblem;
    };

    /**
     * Creates an error instance tailored for HTTP-related issues, ensuring a proper status code
     * and message based on HTTP conventions. Supports flexible argument parsing.
     * @param {number | string} [httpStatusCode] - The HTTP status code (e.g., 404, 500). Can be omitted,
     *                                             in which case it's assumed to be part of the message.
     * @param {string} [issueMessage] - A custom message for the HTTP error. If omitted, a default
     *                                  message based on the status code will be used.
     * @param {object | Array | null} [contextualData] - Additional data or context relevant to the HTTP error.
     * @param {Error | any | null} [originatingError] - The underlying error that precipitated this HTTP issue.
     * @returns {Error} An HTTP-specific Error object, inheriting from `Error.craftIssue`.
     * @memberof Error
     * @method createHttpIssue
     * @api public
     */
    CustomError.createHttpIssue = function (httpStatusCode, issueMessage, contextualData, originatingError) {
        let finalCode = DEFAULT_FALLBACK_STATUS;
        let finalMessage = 'An HTTP-related problem occurred.';
        let finalData = {};
        let finalInner = null;

        // Robust argument shifting to handle various call signatures.
        const providedArgs = [httpStatusCode, issueMessage, contextualData, originatingError];

        // Scenario 1: (message, data, inner) - code is missing, message is first string.
        if (typeof providedArgs[0] === 'string' && typeof providedArgs[1] !== 'number') {
            finalMessage = providedArgs[0];
            finalData = providedArgs[1];
            finalInner = providedArgs[2];
        }
        // Scenario 2: (code, message, data, inner) or (code, data, inner) - code is a number.
        else if (typeof providedArgs[0] === 'number') {
            finalCode = providedArgs[0];
            if (typeof providedArgs[1] === 'string') { // (code, message, data, inner)
                finalMessage = providedArgs[1];
                finalData = providedArgs[2];
                finalInner = providedArgs[3];
            } else { // (code, data, inner) or (code, inner)
                finalData = providedArgs[1];
                finalInner = providedArgs[2];
            }
        }
        // Scenario 3: (data, inner) or (inner) - no code, no message.
        else {
            finalData = providedArgs[0];
            finalInner = providedArgs[1];
        }

        // Validate and normalize the HTTP status code.
        finalCode = parseInt(finalCode, 10);
        if (isNaN(finalCode) || finalCode < 100 || finalCode >= 600) {
            console.warn(`Invalid or out-of-range HTTP status code (${httpStatusCode}) provided. Defaulting to ${DEFAULT_FALLBACK_STATUS}.`);
            finalCode = DEFAULT_FALLBACK_STATUS;
        }

        // Determine the final message, prioritizing the custom message, then standard HTTP phrases.
        const codeAsString = String(finalCode);
        finalMessage = finalMessage || httpResponsePhrases[codeAsString] || `HTTP Status ${codeAsString} - Unrecognized Code`;

        // Create the base error using the generic factory method.
        const httpProblem = CustomError.craftIssue(finalMessage, finalData, finalInner);
        httpProblem.statusCode = finalCode; // Explicitly set the standardized HTTP status.
        httpProblem.isHttpError = true; // Add a boolean flag for quick type identification.

        return httpProblem;
    };

    /**
     * Recursively transforms an Error instance (and its chained causes) into a serializable
     * plain JavaScript object. This is ideal for logging, debugging, or sending error details
     * over a network, as it includes stack traces and custom properties.
     * @param {Error | object | string | null | undefined} problemInstance - The error object, or any object/string to be serialized.
     * @param {boolean} [includeStack=true] - A flag indicating whether to include the full call stack in the output.
     * @returns {object} A structured object representation of the error, ready for JSON serialization.
     * @memberof Error
     * @method toStructuredObject
     * @api public
     */
    CustomError.toStructuredObject = function (problemInstance, includeStack = true) {
        // Handle edge cases for invalid or non-error inputs.
        if (problemInstance === null || problemInstance === undefined) {
            return {
                type: 'SerializationError',
                message: 'Attempted to serialize a null or undefined error instance.',
                detail: 'No problem instance provided.'
            };
        }
        if (typeof problemInstance === 'string') {
            return {
                type: 'StringErrorWrapper',
                message: problemInstance,
                detail: 'A string was passed where an error object was expected.'
            };
        }
        if (typeof problemInstance !== 'object') {
            return {
                type: 'NonObjectErrorWrapper',
                message: `Cannot serialize non-object type: ${typeof problemInstance}`,
                value: problemInstance,
                detail: 'Only objects or strings can be meaningfully serialized as errors.'
            };
        }

        const serializedOutput = {};
        serializedOutput.serializationTimestamp = new Date().toISOString(); // Added new field for auditability.

        if (problemInstance instanceof CustomError) {
            serializedOutput.message = problemInstance.message;
            if (includeStack && problemInstance.stack) {
                // Format the stack trace for better readability.
                serializedOutput.callStack = problemInstance.stack.split('\n').map(line => line.trim());
            }
            // Include custom properties added by `craftIssue` or `createHttpIssue`.
            if (problemInstance.statusCode) serializedOutput.httpStatusCode = problemInstance.statusCode; // Renamed
            if (problemInstance.detailedDescription && problemInstance.detailedDescription !== 'No specific detailed description available.') {
                serializedOutput.descriptionDetail = problemInstance.detailedDescription; // Renamed
            }
            if (problemInstance.extraData) serializedOutput.additionalPayload = problemInstance.extraData; // Renamed
            if (problemInstance.isHttpError) serializedOutput.errorCategory = 'HTTP_CLIENT_SERVER'; // Renamed and changed value
            if (problemInstance.name && problemInstance.name !== 'Error') serializedOutput.errorName = problemInstance.name; // Renamed

            // Recursively serialize the `innerCause` if it exists, providing a full error chain.
            if (problemInstance.innerCause) {
                serializedOutput.underlyingCause = CustomError.toStructuredObject(problemInstance.innerCause, includeStack); // Renamed
            }
        } else {
            // Handle generic objects that might represent errors but are not instances of CustomError.
            serializedOutput.message = problemInstance.message || 'Generic object identified as potential error.';
            if (problemInstance.stack && includeStack) {
                serializedOutput.callStack = problemInstance.stack.split('\n').map(line => line.trim());
            }
            if (problemInstance.name) serializedOutput.errorName = problemInstance.name;
        }

        // Copy all other enumerable properties from the problemInstance, avoiding duplicates or native properties.
        for (const propKey in problemInstance) {
            if (Object.prototype.hasOwnProperty.call(problemInstance, propKey) &&
                !['message', 'stack', 'name', 'innerCause', 'statusCode', 'detailedDescription', 'extraData', 'isHttpError', 'serializationTimestamp', 'httpStatusCode', 'descriptionDetail', 'additionalPayload', 'errorCategory', 'errorName', 'underlyingCause'].includes(propKey) &&
                !serializedOutput.hasOwnProperty(propKey)) { // Ensure we don't overwrite already set properties.
                const propValue = problemInstance[propKey];
                // If a property is itself an Error, recursively serialize it, unless it's already handled as `underlyingCause`.
                if (propValue instanceof CustomError) {
                    serializedOutput[propKey] = CustomError.toStructuredObject(propValue, includeStack);
                } else if (propValue !== undefined && typeof propValue !== 'function') {
                    // Only copy non-undefined, non-function values.
                    serializedOutput[propKey] = propValue;
                }
            }
        }

        return serializedOutput;
    };

    /**
     * Extracts and concatenates user-friendly, public-facing messages by traversing a chain of errors.
     * It prioritizes messages from errors deemed "public" (e.g., client errors or explicitly marked).
     * This function uses an iterative approach to prevent stack overflow with deep error chains.
     * @param {Error | object | null | undefined} issueObject - The initial error object to begin message extraction from.
     * @param {string} [chainSeparator=' --- '] - The string used to join messages from chained errors.
     * @returns {string} A concatenated string of public-facing messages. If no public messages are found
     *                   for server-side errors, a generic message is returned.
     * @memberof Error
     * @method extractPublicFacingMessage
     * @api public
     */
    CustomError.extractPublicFacingMessage = function (issueObject, chainSeparator = ' --- ') {
        if (!issueObject || typeof issueObject !== 'object') {
            return ''; // Return empty string for invalid inputs.
        }

        const collectedMessages = [];
        let currentLink = issueObject;
        const visitedErrors = new WeakSet(); // To prevent infinite loops in circular error chains.

        // Iterate through the error chain, collecting relevant messages.
        while (currentLink) {
            if (visitedErrors.has(currentLink)) {
                console.warn("Circular reference detected in the error chain, halting public message extraction.");
                break; // Exit to prevent infinite loop.
            }
            visitedErrors.add(currentLink);

            const currentStatusCode = currentLink.statusCode || currentLink.status; // Check both common status properties.
            const isClientSideIssue = currentStatusCode && currentStatusCode < DEFAULT_FALLBACK_STATUS;
            const isExplicitlyPublic = currentLink.isPublic === true; // Check for an explicit public flag.

            // Collect messages from client-side errors or errors explicitly marked as public.
            if ((isClientSideIssue || isExplicitlyPublic) && typeof currentLink.message === 'string' && currentLink.message.trim().length > 0) {
                collectedMessages.push(currentLink.message);
            }

            // Move to the next error in the chain.
            currentLink = currentLink.innerCause || currentLink.inner; // Check both properties for the next link.
        }

        // Provide a generic fallback message if no specific public messages were found, especially for server errors.
        if (collectedMessages.length === 0 && issueObject.statusCode >= DEFAULT_FALLBACK_STATUS) {
            return "An unrecoverable internal server error occurred. Please contact support.";
        }

        return collectedMessages.join(chainSeparator);
    };

})(Error); // Pass the native Error constructor to the IIFE.