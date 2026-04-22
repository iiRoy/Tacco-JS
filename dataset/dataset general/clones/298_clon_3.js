var socketBridge = require('socket.io'),
    ConnectionEndpoint = require('socket.io/lib/socket.io/client.js');

// Utility function to merge properties from source to target.
// This replaces an undefined 'merge' call in the original.
function combineSettings(targetObject, sourceObject) {
    for (var propKey in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, propKey)) {
            targetObject[propKey] = sourceObject[propKey];
        }
    }
    return targetObject;
}

// Stores all registered RPC methods and their associated handlers for this endpoint.
// This is where the server-side methods callable by clients are defined.
ConnectionEndpoint.prototype.registeredProcedures = {};

// Holds callbacks for RPC requests sent *from* this endpoint to a remote client.
// These callbacks are invoked when a response arrives from the client.
ConnectionEndpoint.prototype.pendingResponses = {};

// A simple counter to generate unique request identifiers for outgoing RPC calls.
// Incremented for each new request to ensure uniqueness within this endpoint's session.
ConnectionEndpoint.prototype.requestCounter = 0;

/**
 * Generates a distinct identifier for a new remote procedure call.
 * This ID is crucial for matching responses to their originating requests.
 * @returns {string} A unique request identifier.
 */
ConnectionEndpoint.prototype.generateRequestId = function() {
    // Ensure session identifier exists before concatenation.
    if (!this.sessionId) {
        // Fallback or error handling if session ID is missing, though it should always be present.
        console.error("Endpoint session ID is undefined, generating a less unique ID.");
        return `anon_${this.requestCounter++}`;
    }
    // Combine session ID with a monotonically increasing counter for strong uniqueness.
    return `${this.sessionId}#${this.requestCounter++}`;
};

/**
 * Initiates a remote procedure call (RPC) to the connected client.
 * This method sends a JSON-RPC request and handles the expected response or potential timeout.
 *
 * @param {string} procedureName - The name of the method to be executed on the remote client.
 * @param {any} [argumentPayload] - Data or parameters to pass to the remote method.
 *                                  Can also be a direct success callback.
 * @param {function|object} [completionHandler] - A callback function to execute upon successful response,
 *                                                or an object containing detailed invocation settings.
 *     Invocation Settings Object Structure:
 *          {
 *            timeoutDuration: number // Maximum time in milliseconds to wait for a response before timing out.
 *            autoClearOnTimeout: boolean // If true, clears pending callbacks on timeout. Defaults to true.
 *            onSuccess: function(result, endpoint) // Invoked when the client returns a successful result.
 *            onError: function(error, endpoint) // Invoked if the client returns an error.
 *            onFinalize: function(responsePacket) // Always invoked after a response (success/error) or timeout.
 *          }
 * @returns {object} The result of sending the RPC message.
 */
ConnectionEndpoint.prototype.invokeRemoteProcedure = function(procedureName, argumentPayload, completionHandler) {
    var thisEndpoint = this; // Alias 'this' for consistent reference within closures.

    // Basic validation for the procedure name.
    if (typeof procedureName !== 'string' || procedureName.trim().length === 0) {
        console.warn('Attempted to invoke a remote procedure with an invalid name:', procedureName);
        return false; // Or throw an error.
    }

    // Establish default invocation settings.
    var invocationSettings = {
        timeoutDuration: thisEndpoint.options.timeout || 5000, // Default to 5 seconds if not specified.
        autoClearOnTimeout: true,
        onSuccess: null,
        onError: null,
        onFinalize: null,
        payload: {} // Placeholder for the actual parameters to be sent.
    };

    // Process provided arguments to configure invocationSettings.
    if (argumentPayload && typeof argumentPayload === 'function') {
        invocationSettings.onSuccess = argumentPayload;
    } else if (argumentPayload) {
        invocationSettings.payload = argumentPayload;
    }

    if (completionHandler && typeof completionHandler === 'function') {
        invocationSettings.onSuccess = completionHandler;
    } else if (completionHandler && typeof completionHandler === 'object') {
        // Merge user-provided settings, overriding defaults.
        combineSettings(invocationSettings, completionHandler);
    }

    var transactionId = thisEndpoint.generateRequestId();
    var responseTracker = {}; // Object to hold callbacks and timeout timer for this specific request.

    // If any response handlers are provided, set up tracking.
    if (invocationSettings.onSuccess || invocationSettings.onError || invocationSettings.onFinalize) {
        if (invocationSettings.autoClearOnTimeout) {
            responseTracker.timeoutHandle = setTimeout(function() {
                // When timeout occurs, simulate an error response.
                var timeoutError = {
                    code: 'REMOTE_CALL_TIMEOUT',
                    message: `Client did not respond within ${invocationSettings.timeoutDuration}ms.`
                };
                // Directly call the message handler as if an error was received.
                thisEndpoint.onMessage({ error: timeoutError, id: transactionId });
                // Clean up the tracking entry immediately after timeout.
                delete thisEndpoint.pendingResponses[transactionId];
            }, invocationSettings.timeoutDuration);
        }

        invocationSettings.onSuccess && (responseTracker.successHandler = invocationSettings.onSuccess);
        invocationSettings.onError && (responseTracker.errorHandler = invocationSettings.onError);
        invocationSettings.onFinalize && (responseTracker.finalizeHandler = invocationSettings.onFinalize);

        // Store the tracker object only if there are actual handlers to call.
        thisEndpoint.pendingResponses[transactionId] = responseTracker;
    }

    // Construct and send the JSON-RPC request packet.
    var requestPacket = {
        method: procedureName,
        params: invocationSettings.payload,
        id: transactionId
    };

    return thisEndpoint.send(requestPacket);
};

/**
 * Registers one or more functions to act as handlers for a specific remote procedure call.
 * When the client invokes this procedure, these handlers will be executed in sequence.
 *
 * @param {string} procedureKey - The unique name of the remote procedure to register.
 * @param {...(function|Array<function>)} procedureHandlers - One or more functions or arrays of functions.
 *                                                            Each function takes (data, client, next, resultAccumulator).
 * @returns {ConnectionEndpoint} The current ConnectionEndpoint instance for chaining.
 */
ConnectionEndpoint.prototype.registerProcedureHandler = function(procedureKey, ...procedureHandlers) {
    if (typeof procedureKey !== 'string' || procedureKey.trim().length === 0) {
        console.error('Cannot register a procedure with an invalid key:', procedureKey);
        return this;
    }

    var collectedHandlers = [];

    // Iterate through all provided handler arguments.
    procedureHandlers.forEach(function(argItem) {
        if (Array.isArray(argItem)) {
            // If it's an array, filter for functions and add them.
            argItem.filter(item => typeof item === 'function').forEach(func => collectedHandlers.push(func));
        } else if (typeof argItem === 'function') {
            // If it's a single function, add it.
            collectedHandlers.push(argItem);
        }
    });

    // Only register if there are actual valid handlers.
    if (collectedHandlers.length > 0) {
        this.registeredProcedures[procedureKey] = collectedHandlers;
    } else {
        console.warn(`No valid handlers provided for procedure key: '${procedureKey}'. Registration skipped.`);
    }
    return this;
};

/**
 * Sends a notification (an RPC call without expecting a response) to all *other* connected clients.
 * The current client (this instance) is explicitly excluded from receiving this notification.
 *
 * @param {string} notificationMethod - The name of the method to notify clients about.
 * @param {any} [notificationPayload] - The data payload to send with the notification.
 * @returns {ConnectionEndpoint} The current ConnectionEndpoint instance for chaining.
 */
ConnectionEndpoint.prototype.sendBroadcastNotification = function(notificationMethod, notificationPayload) {
    // A client must have a session identifier to be excluded from a broadcast.
    if (!this.sessionId) {
        console.warn('Client session ID missing, cannot exclude self from broadcast notification.');
        return this;
    }
    // Delegate to the listener's broadcast function, specifying the current client's ID for exclusion.
    if (this.listener && typeof this.listener.distributeNotification === 'function') {
        this.listener.distributeNotification(notificationMethod, notificationPayload, this.sessionId);
    } else {
        console.error('Listener or distributeNotification method not available for broadcast.');
    }
    return this;
};

/**
 * Recursively executes a chain of registered procedure handler functions.
 * This allows for middleware-like processing of incoming RPC calls.
 *
 * @param {string} procName - The name of the procedure being handled.
 * @param {any} procParams - The parameters received from the client.
 * @param {ConnectionEndpoint} clientEndpoint - The client instance that made the call.
 * @param {Array<function>} handlerSequence - An array of handler functions to execute.
 * @param {object} responseCallbacks - Object containing 'success' and 'error' functions for final response.
 * @returns {any} The result of the last executed handler, or undefined if the chain is empty.
 */
socketBridge.Listener.prototype.executeProcedureChain = function(procName, procParams, clientEndpoint, handlerSequence, responseCallbacks) {
    var currentListener = this;
    var chainResult = undefined; // Accumulator for results if handlers return values.

    // If there are handlers left in the sequence, pop the first one and execute it.
    if (handlerSequence && handlerSequence.length > 0) {
        var currentHandler = handlerSequence.shift(); // Get and remove the first handler.

        // Define the 'next' function for middleware-style progression.
        var proceedToNext = function() {
            // Recursively call the next handler in the sequence.
            return currentListener.executeProcedureChain(procName, procParams, clientEndpoint, handlerSequence, responseCallbacks);
        };

        try {
            // Execute the current handler.
            chainResult = currentHandler(procParams || null, clientEndpoint, proceedToNext, responseCallbacks);
        } catch (handlerError) {
            // If a handler throws an error, immediately report it as an RPC error.
            if (responseCallbacks && typeof responseCallbacks.error === 'function') {
                responseCallbacks.error({
                    code: 'HANDLER_EXECUTION_ERROR',
                    message: `Error in handler for ${procName}: ${handlerError.message}`,
                    details: handlerError.stack
                });
            }
            // Prevent further execution of the chain if an error occurred.
            return undefined;
        }
    }
    return chainResult;
};

/**
 * Handles an incoming message that is identified as a remote procedure call from a client.
 * This involves finding and executing the registered handlers for the requested procedure.
 *
 * @param {object} receivedPacket - The JSON-RPC request packet from the client.
 * @param {ConnectionEndpoint} callingEndpoint - The client instance from which the message originated.
 */
socketBridge.Listener.prototype._handleIncomingProcedureCall = function(receivedPacket, callingEndpoint) {
    var listenerRef = this;
    var rpcResponse = null; // Stores the final outcome of the RPC execution.
    var responseAlreadySent = false; // Flag to prevent multiple responses.

    var sendRpcResponse = function(responseContent) {
        if (responseAlreadySent) {
            console.warn('Attempted to send RPC response multiple times for ID:', receivedPacket.id);
            return;
        }

        var formattedResponse = {};
        if (responseContent && responseContent.rpcSuccessData) {
            formattedResponse = { result: responseContent.rpcSuccessData, id: receivedPacket.id };
        } else if (responseContent && responseContent.rpcErrorDetails) {
            // Ensure error object has standard JSON-RPC error structure.
            var err = responseContent.rpcErrorDetails;
            formattedResponse = {
                error: {
                    code: err.code || -32000, // Default server error code.
                    message: err.message || 'An unexpected error occurred.',
                    data: err.data // Optional additional error info.
                },
                id: receivedPacket.id
            };
        } else {
            // If responseContent is not structured as expected, treat as generic error.
            formattedResponse = {
                error: {
                    code: -32000,
                    message: 'Invalid RPC response format from handler.'
                },
                id: receivedPacket.id
            };
        }

        // Only send a response if the original request included an ID (i.e., it's not a notification).
        if (receivedPacket.id) {
            callingEndpoint.send(formattedResponse);
            responseAlreadySent = true;
        }
    };

    // Check if the requested method is actually registered.
    var procedureHandlers = callingEndpoint.registeredProcedures[receivedPacket.method];
    if (!procedureHandlers || procedureHandlers.length === 0) {
        sendRpcResponse({
            rpcErrorDetails: {
                code: -32601, // Method not found.
                message: `Procedure '${receivedPacket.method}' not found on server.`
            }
        });
        return;
    }

    try {
        // Execute the chain of handlers for the requested procedure.
        rpcResponse = {
            rpcSuccessData: listenerRef.executeProcedureChain(
                receivedPacket.method,
                receivedPacket.params || null,
                callingEndpoint,
                // Pass a slice of the array to avoid modifying the original registered handlers.
                procedureHandlers.slice(0),
                {
                    success: function(resultData) {
                        sendRpcResponse({ rpcSuccessData: resultData });
                    },
                    error: function(errDetails) {
                        sendRpcResponse({ rpcErrorDetails: errDetails });
                    }
                }
            )
        };
    } catch (unexpectedError) {
        // Catch any unhandled errors during the execution chain itself.
        rpcResponse = {
            rpcErrorDetails: {
                code: -32000, // Server error.
                message: `Server-side error during RPC execution: ${unexpectedError.message}`,
                data: unexpectedError.stack // Include stack trace for debugging.
            }
        };
    }

    // If no explicit response was sent by a handler using the 'success'/'error' callbacks,
    // then send the accumulated rpcResponse (either success or the caught error).
    if (!responseAlreadySent) {
        sendRpcResponse(rpcResponse);
    }

    // Emit internal events for logging and further processing.
    callingEndpoint.emit('remoteProcedureInvoked', receivedPacket);
    this.emit('clientProcedureInvoked', receivedPacket, callingEndpoint);
};

/**
 * Processes an incoming message that is a response to a previously sent remote procedure call.
 * This method retrieves the corresponding pending callback and executes it.
 *
 * @param {object} incomingResponse - The JSON-RPC response packet from the client.
 * @param {ConnectionEndpoint} respondingEndpoint - The client instance that sent the response.
 */
socketBridge.Listener.prototype._handleRemoteResponse = function(incomingResponse, respondingEndpoint) {
    var responseId = incomingResponse.id;

    // A response must have a correlation ID and a corresponding entry in pendingResponses.
    if (!responseId || !respondingEndpoint.pendingResponses[responseId]) {
        // This could be an unsolicited response or a response for an already timed-out/processed request.
        console.warn('Received an RPC response for an unknown or stale ID:', responseId, incomingResponse);
        return;
    }

    var trackedResponse = respondingEndpoint.pendingResponses[responseId];

    try {
        // Clear any pending timeout timer associated with this request.
        if (trackedResponse.timeoutHandle) {
            clearTimeout(trackedResponse.timeoutHandle);
        }

        // Execute the appropriate callback (success or error) based on the response content.
        if (incomingResponse.result !== undefined) { // Check for 'result' explicitly as it can be null.
            if (typeof trackedResponse.successHandler === 'function') {
                trackedResponse.successHandler(incomingResponse.result, respondingEndpoint);
            }
        } else if (incomingResponse.error) {
            if (typeof trackedResponse.errorHandler === 'function') {
                trackedResponse.errorHandler(incomingResponse.error, respondingEndpoint);
            }
        } else {
            // Neither result nor error present, potentially malformed response.
            console.warn('Received malformed RPC response:', incomingResponse);
            if (typeof trackedResponse.errorHandler === 'function') {
                trackedResponse.errorHandler({
                    code: -32700,
                    message: 'Malformed RPC response: Missing "result" or "error" property.'
                }, respondingEndpoint);
            }
        }
    } catch (callbackError) {
        console.error(`Error executing RPC response callback for ID ${responseId}:`, callbackError);
        // An error in the user's callback should not prevent finalization.
    } finally {
        // Always execute the finalize handler if it exists.
        if (typeof trackedResponse.finalizeHandler === 'function') {
            trackedResponse.finalizeHandler(incomingResponse);
        }
        // Clean up the pending response entry.
        delete respondingEndpoint.pendingResponses[responseId];
    }

    // Emit internal events for logging and further processing.
    respondingEndpoint.emit('remoteProcedureResponse', incomingResponse);
    this.emit('clientProcedureResponse', incomingResponse, respondingEndpoint);
    return;
};

/**
 * Overrides the default `_onClientMessage` method to intelligently
 * route incoming messages based on whether they are RPC calls or RPC responses.
 *
 * @param {any} messagePayload - The raw message data received from the client.
 * @param {ConnectionEndpoint} clientSource - The client instance that sent the message.
 */
socketBridge.Listener.prototype._processEndpointMessage = function(messagePayload, clientSource) {
    var isObject = typeof messagePayload === 'object' && messagePayload !== null;

    if (isObject) {
        // Check if it's an RPC call (has 'method' and potentially an 'id').
        var isRpcCall = messagePayload.method && clientSource.registeredProcedures[messagePayload.method];
        if (isRpcCall) {
            return this._handleIncomingProcedureCall(messagePayload, clientSource);
        }

        // Check if it's an RPC response (has 'result' or 'error' and an 'id').
        var isRpcResponse = (messagePayload.result !== undefined || messagePayload.error !== undefined) && messagePayload.id;
        if (isRpcResponse) {
            return this._handleRemoteResponse(messagePayload, clientSource);
        }
    }

    // If not an RPC-related message, delegate to the original clientMessage event.
    // This ensures compatibility with existing non-RPC message handling.
    this.emit('clientMessage', messagePayload, clientSource);
};

/**
 * Helper function to filter out specific client IDs from a list of all client IDs.
 *
 * @param {Array<string>} allClientIds - Array of all connected client session IDs.
 * @param {string|number|Array<string|number>} [excludeList] - Client ID(s) to exclude.
 * @returns {Array<string>} Filtered array of client IDs.
 */
function getTargetClientIds(allClientIds, excludeList) {
    if (!excludeList) {
        return allClientIds; // No exclusions, return all.
    }

    var excluded = new Set();
    if (Array.isArray(excludeList)) {
        excludeList.forEach(id => excluded.add(String(id)));
    } else {
        excluded.add(String(excludeList));
    }

    return allClientIds.filter(clientId => !excluded.has(clientId));
}

/**
 * Sends a remote procedure call to multiple connected clients, with options for exclusion.
 * This method expects a response from each targeted client.
 *
 * @param {string} procedureName - The method name to invoke on remote clients.
 * @param {any} [argumentPayload] - Parameters for the remote method.
 * @param {function} [perClientCallback] - A callback function to handle each client's response: `function(result, clientEndpoint)`.
 * @param {string|number|Array<string|number>} [excludedEndpoints] - Client ID(s) to *not* send the call to.
 * @returns {socketBridge.Listener} The current Listener instance for chaining.
 */
socketBridge.Listener.prototype.distributeProcedureCall = function(procedureName, argumentPayload, perClientCallback, excludedEndpoints) {
    if (typeof procedureName !== 'string' || procedureName.trim().length === 0) {
        console.error('Invalid procedure name for broadcast call:', procedureName);
        return this;
    }

    var availableClientIds = Object.keys(this.clients);
    var targetClientIds = getTargetClientIds(availableClientIds, excludedEndpoints);

    for (var i = 0; i < targetClientIds.length; i++) {
        var currentClientId = targetClientIds[i];
        var targetEndpoint = this.clients[currentClientId];

        // Ensure the client endpoint is valid before attempting to call.
        if (targetEndpoint && typeof targetEndpoint.invokeRemoteProcedure === 'function') {
            // Capture targetEndpoint in the callback closure to ensure correct context.
            if (typeof perClientCallback === 'function') {
                targetEndpoint.invokeRemoteProcedure(procedureName, argumentPayload, function(resultData) {
                    perClientCallback(resultData, targetEndpoint);
                });
            } else {
                // If no specific callback, just send the call without expecting a tracked response.
                targetEndpoint.invokeRemoteProcedure(procedureName, argumentPayload);
            }
        } else {
            console.warn(`Skipping RPC call for invalid or disconnected client: ${currentClientId}`);
        }
    }
    return this;
};

/**
 * Sends a notification (an RPC call without expecting a response) to multiple connected clients.
 *
 * @param {string} notificationMethod - The method name to notify clients about.
 * @param {any} [notificationPayload] - The data payload for the notification.
 * @param {string|number|Array<string|number>} [excludedEndpoints] - Client ID(s) to *not* send the notification to.
 * @returns {socketBridge.Listener} The current Listener instance for chaining.
 */
socketBridge.Listener.prototype.distributeNotification = function(notificationMethod, notificationPayload, excludedEndpoints) {
    if (typeof notificationMethod !== 'string' || notificationMethod.trim().length === 0) {
        console.error('Invalid notification method for broadcast:', notificationMethod);
        return this;
    }

    var availableClientIds = Object.keys(this.clients);
    var targetClientIds = getTargetClientIds(availableClientIds, excludedEndpoints);

    for (var j = 0; j < targetClientIds.length; j++) {
        var currentClientId = targetClientIds[j];
        var targetEndpoint = this.clients[currentClientId];

        if (targetEndpoint && typeof targetEndpoint.invokeRemoteProcedure === 'function') {
            // For notifications, we don't pass a callback, so invokeRemoteProcedure acts as a notification.
            targetEndpoint.invokeRemoteProcedure(notificationMethod, notificationPayload);
        } else {
            console.warn(`Skipping notification for invalid or disconnected client: ${currentClientId}`);
        }
    }
    return this;
};

module.exports = socketBridge;