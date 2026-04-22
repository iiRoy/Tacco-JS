const externalSocketIO = require('socket.io');
const OriginalConnection = require('socket.io/lib/socket.io/client.js');
const { EventEmitter } = require('events');

// --- Internal State Management (using WeakMaps for client/listener specific data) ---
const procedureRegistrations = new WeakMap(); // Maps ConnectionEndpoint instances to a Map<string, Function[]>
const outstandingTransactions = new WeakMap(); // Maps ConnectionEndpoint instances to a Map<string, {completion, failure, finalization, timerHandle}>
const transactionCounters = new WeakMap(); // Maps ConnectionEndpoint instances to a number
const connectionWrappers = new WeakMap(); // Maps OriginalConnection instances to ConnectionEndpoint instances
const managerWrappers = new WeakMap(); // Maps io.Listener instances to RemoteCommManager instances

// --- Utility Functions ---

// Replicates the simple shallow merge likely intended by the original's undefined 'merge' function
function unifySettings(base, overrides) {
    if (overrides) {
        for (const key in overrides) {
            if (Object.prototype.hasOwnProperty.call(overrides, key)) {
                base[key] = overrides[key];
            }
        }
    }
    return base;
}

// Generates a unique identifier for a transaction per client
function acquireUniqueTransactionId(endpointInstance) {
    let currentCount = transactionCounters.get(endpointInstance) || 0;
    transactionCounters.set(endpointInstance, currentCount + 1);
    return endpointInstance.sessionIdentifier + '$' + currentCount;
}

// Executes a chain of registered procedure functions (replaces runRegistersCallbackRPC)
async function processProcedureChain(actionName, payloadData, callingEndpoint, procedureFunctions, responseDispatcher) {
    let chainResultAccumulator = {};
    let responseAlreadyDispatched = false;

    const performStep = async (stepIndex) => {
        if (responseAlreadyDispatched) return;

        if (stepIndex >= procedureFunctions.length) {
            return undefined; // Chain exhausted
        }

        const currentFunction = procedureFunctions[stepIndex];

        return new Promise(async (resolve, reject) => {
            const advanceChain = (intermediateResult) => {
                if (intermediateResult !== undefined) {
                    chainResultAccumulator = intermediateResult;
                }
                resolve(performStep(stepIndex + 1));
            };

            const sendSuccessResponse = (resultPayload) => {
                if (!responseAlreadyDispatched) {
                    responseAlreadyDispatched = true;
                    responseDispatcher.dispatchSuccess(resultPayload);
                    resolve(resultPayload);
                }
            };

            const sendErrorResponse = (errorPayload) => {
                if (!responseAlreadyDispatched) {
                    responseAlreadyDispatched = true;
                    responseDispatcher.dispatchError(errorPayload);
                    reject(errorPayload);
                }
            };

            try {
                const directReturn = await currentFunction(
                    payloadData,
                    callingEndpoint,
                    advanceChain,
                    { success: sendSuccessResponse, error: sendErrorResponse } // Replicating the 'result' object
                );

                if (directReturn !== undefined && !responseAlreadyDispatched) {
                    responseAlreadyDispatched = true;
                    responseDispatcher.dispatchSuccess(directReturn);
                    resolve(directReturn);
                } else if (!responseAlreadyDispatched) {
                    resolve(undefined); // Function completed, but didn't explicitly respond or call next
                }
            } catch (e) {
                if (!responseAlreadyDispatched) {
                    responseAlreadyDispatched = true;
                    responseDispatcher.dispatchError(e);
                    reject(e);
                }
            }
        });
    };

    return performStep(0);
}

// --- New Class for Client-side Functionality (replaces Client.prototype extensions) ---
class ConnectionEndpoint extends OriginalConnection {
    constructor(originalInstance) {
        super();
        Object.assign(this, originalInstance); // Copy properties from the original Client instance
        connectionWrappers.set(originalInstance, this);

        // Initialize state for this specific connection
        procedureRegistrations.set(this, new Map());
        outstandingTransactions.set(this, new Map());
        transactionCounters.set(this, 0);

        this.sessionIdentifier = originalInstance.sessionId; // Alias for clarity
        this.managerReference = null; // Will be set by RemoteCommManager on creation
    }

    // Corresponds to Client.prototype.callRPC
    initiateRemoteProcedureCall(actionName, payload, responseHandlers) {
        const currentEndpoint = this;
        const callConfiguration = {
            timeoutDuration: currentEndpoint.options.timeout,
            clearCallbacksOnTimeout: true,
            onCompletion: null,
            onFailure: null,
            onFinalization: null,
            callPayload: {}
        };

        // Divergent argument parsing
        if (typeof payload === 'function') {
            callConfiguration.onCompletion = payload;
        } else if (payload) {
            callConfiguration.callPayload = payload;
        }

        if (typeof responseHandlers === 'function') {
            callConfiguration.onCompletion = responseHandlers;
        } else if (typeof responseHandlers === 'object' && responseHandlers !== null) {
            unifySettings(callConfiguration, responseHandlers);
        }

        const transactionIdentifier = acquireUniqueTransactionId(currentEndpoint);

        const outgoingPayload = {
            action: actionName,
            data: callConfiguration.callPayload,
            transactionId: transactionIdentifier
        };

        if (callConfiguration.onCompletion || callConfiguration.onFailure || callConfiguration.onFinalization) {
            const transactionRecord = {};
            if (callConfiguration.onCompletion) transactionRecord.onCompletion = callConfiguration.onCompletion;
            if (callConfiguration.onFailure) transactionRecord.onFailure = callConfiguration.onFailure;
            if (callConfiguration.onFinalization) transactionRecord.onFinalization = callConfiguration.onFinalization;

            if (callConfiguration.clearCallbacksOnTimeout) {
                transactionRecord.timerHandle = setTimeout(() => {
                    const pending = outstandingTransactions.get(currentEndpoint);
                    if (pending && pending.has(transactionIdentifier)) {
                        const handlers = pending.get(transactionIdentifier);
                        const timeoutError = { code: 'CALL_TIMEOUT', message: 'Remote procedure call timed out' };
                        if (typeof handlers.onFailure === 'function') {
                            handlers.onFailure(timeoutError, currentEndpoint);
                        }
                        if (typeof handlers.onFinalization === 'function') {
                            handlers.onFinalization({ error: timeoutError, transactionId: transactionIdentifier });
                        }
                        pending.delete(transactionIdentifier);
                    }
                }, callConfiguration.timeoutDuration);
            }
            outstandingTransactions.get(currentEndpoint).set(transactionIdentifier, transactionRecord);
        }

        currentEndpoint.send(outgoingPayload); // Use the original client's send method
        return currentEndpoint;
    }

    // Corresponds to Client.prototype.listenRPC
    registerRemoteProcedure(procedureName, ...handlerFunctions) {
        const methodRegistry = procedureRegistrations.get(this);
        const collectedHandlers = [];

        for (const arg of handlerFunctions) {
            if (Array.isArray(arg)) {
                for (const fn of arg) {
                    if (typeof fn === 'function') {
                        collectedHandlers.push(fn);
                    }
                }
            } else if (typeof arg === 'function') {
                collectedHandlers.push(arg);
            }
        }

        if (collectedHandlers.length > 0) {
            methodRegistry.set(procedureName, collectedHandlers);
        }
        return this;
    }

    // Corresponds to Client.prototype.broadcastNotifyRPC
    distributeNotification(action, payload) {
        if (!this.managerReference) {
            return this; // Cannot broadcast if no listener manager is associated
        }
        this.managerReference.distributeNotification(action, payload, this.sessionIdentifier);
        return this;
    }
}

// --- New Class for Listener-side Functionality (replaces io.Listener.prototype extensions) ---
class RemoteCommManager extends EventEmitter {
    constructor(originalListenerInstance) {
        super();
        this.originalListener = originalListenerInstance;
        this.managedClients = originalListenerInstance.clients; // Reference to original clients object
        managerWrappers.set(originalListenerInstance, this);
    }

    // Corresponds to io.Listener.prototype._onClientReturnRPC
    async handleIncomingProcedureCall(receivedData, originalClient) {
        let responseDispatched = false;
        const wrappedEndpoint = connectionWrappers.get(originalClient);
        const methodHandlers = procedureRegistrations.get(wrappedEndpoint).get(receivedData.action);

        if (!methodHandlers) {
            if (receivedData.transactionId) {
                originalClient.send({
                    error: { code: 'PROCEDURE_NOT_FOUND', message: `No registered handler for '${receivedData.action}'` },
                    transactionId: receivedData.transactionId
                });
            }
            return;
        }

        const responseDispatcher = {
            dispatchSuccess: (resultPayload) => {
                if (!responseDispatched && receivedData.transactionId) {
                    originalClient.send({ result: resultPayload, transactionId: receivedData.transactionId });
                    responseDispatched = true;
                }
            },
            dispatchError: (errorPayload) => {
                if (!responseDispatched && receivedData.transactionId) {
                    originalClient.send({ error: { code: errorPayload.code, message: errorPayload.message }, transactionId: receivedData.transactionId });
                    responseDispatched = true;
                }
            }
        };

        try {
            const finalChainResult = await processProcedureChain(
                receivedData.action,
                receivedData.data,
                wrappedEndpoint,
                methodHandlers.slice(0), // Pass a copy of handlers
                responseDispatcher
            );

            if (!responseDispatched && receivedData.transactionId) {
                // If the chain completed and no explicit response was sent, but a transaction ID exists,
                // send a null result, replicating original behavior for no explicit return.
                responseDispatcher.dispatchSuccess(finalChainResult === undefined ? null : finalChainResult);
            }
        } catch (e) {
            if (!responseDispatched && receivedData.transactionId) {
                responseDispatcher.dispatchError(e);
            }
        }

        wrappedEndpoint.emit('ProcedureCallReceived', receivedData);
        this.emit('endpointProcedureCalled', receivedData, wrappedEndpoint);
    }

    // Corresponds to io.Listener.prototype._onClientCallRPC
    handleIncomingProcedureResponse(receivedData, originalClient) {
        const wrappedEndpoint = connectionWrappers.get(originalClient);
        const transactionId = receivedData.transactionId;
        const pending = outstandingTransactions.get(wrappedEndpoint);

        if (transactionId && pending && pending.has(transactionId)) {
            const handlers = pending.get(transactionId);

            clearTimeout(handlers.timerHandle);

            if (receivedData.result !== undefined && typeof handlers.onCompletion === 'function') {
                handlers.onCompletion(receivedData.result, wrappedEndpoint);
            } else if (receivedData.error !== undefined && typeof handlers.onFailure === 'function') {
                handlers.onFailure(receivedData.error, wrappedEndpoint);
            }

            if (typeof handlers.onFinalization === 'function') {
                handlers.onFinalization(receivedData);
            }

            pending.delete(transactionId);
        }

        wrappedEndpoint.emit('ProcedureResponseReceived', receivedData);
        this.emit('endpointProcedureResponse', receivedData, wrappedEndpoint);
    }

    // Corresponds to io.Listener.prototype._onClientMessage (the dispatcher override)
    processClientCommunication(receivedData, originalClient) {
        let wrappedEndpoint = connectionWrappers.get(originalClient);
        if (!wrappedEndpoint) {
            wrappedEndpoint = new ConnectionEndpoint(originalClient);
            wrappedEndpoint.managerReference = this; // Associate with this manager
        }

        // Dispatch based on message structure, replacing `if/else if`
        if (typeof receivedData === 'object' && receivedData !== null) {
            if (receivedData.action && procedureRegistrations.get(wrappedEndpoint).has(receivedData.action)) {
                return this.handleIncomingProcedureCall(receivedData, originalClient);
            }
            if (receivedData.result !== undefined || receivedData.error !== undefined) {
                return this.handleIncomingProcedureResponse(receivedData, originalClient);
            }
        }

        // Fallback to original `clientMessage` event
        this.originalListener.emit('clientMessage', receivedData, originalClient);
    }

    // Corresponds to io.Listener.prototype.broadcastCallRPC
    distributeProcedureCall(actionName, payloadData, responseCompletionHandler, excludedClientIdentifiers) {
        const clientKeys = Object.keys(this.managedClients);
        const excludedSet = Array.isArray(excludedClientIdentifiers) ? new Set(excludedClientIdentifiers.map(String)) :
                            (typeof excludedClientIdentifiers === 'string' || typeof excludedClientIdentifiers === 'number' ? new Set([String(excludedClientIdentifiers)]) : null);

        for (const key of clientKeys) {
            const currentOriginalClient = this.managedClients[key];
            if (!currentOriginalClient) continue;

            let shouldExclude = false;
            if (excludedSet && excludedSet.has(String(key))) {
                shouldExclude = true;
            }

            if (!shouldExclude) {
                let wrappedEndpoint = connectionWrappers.get(currentOriginalClient);
                if (!wrappedEndpoint) {
                    wrappedEndpoint = new ConnectionEndpoint(currentOriginalClient);
                    wrappedEndpoint.managerReference = this;
                }

                const singleClientResponseHandler = (clientResult) => {
                    if (typeof responseCompletionHandler === 'function') {
                        responseCompletionHandler(clientResult, wrappedEndpoint);
                    }
                };
                wrappedEndpoint.initiateRemoteProcedureCall(actionName, payloadData, singleClientResponseHandler);
            }
        }
        return this;
    }

    // Corresponds to io.Listener.prototype.broadcastNotifyRPC
    distributeNotification(actionName, payloadData, excludedClientIdentifiers) {
        const clientKeys = Object.keys(this.managedClients);
        const excludedSet = Array.isArray(excludedClientIdentifiers) ? new Set(excludedClientIdentifiers.map(String)) :
                            (typeof excludedClientIdentifiers === 'string' || typeof excludedClientIdentifiers === 'number' ? new Set([String(excludedClientIdentifiers)]) : null);

        for (const key of clientKeys) {
            const currentOriginalClient = this.managedClients[key];
            if (!currentOriginalClient) continue;

            let shouldExclude = false;
            if (excludedSet && excludedSet.has(String(key))) {
                shouldExclude = true;
            }

            if (!shouldExclude) {
                let wrappedEndpoint = connectionWrappers.get(currentOriginalClient);
                if (!wrappedEndpoint) {
                    wrappedEndpoint = new ConnectionEndpoint(currentOriginalClient);
                    wrappedEndpoint.managerReference = this;
                }
                wrappedEndpoint.initiateRemoteProcedureCall(actionName, payloadData); // No response expected
            }
        }
        return this;
    }
}

// --- Module Export: Enhance the original io object ---

// This factory function will take the original `socket.io` module and return an enhanced version.
function createEnhancedSocketIO(originalSocketIO) {
    // Patch the original `_onClientMessage` to use our new dispatcher.
    // This is the only direct prototype modification, acting as an entry point.
    const originalOnClientMessage = originalSocketIO.Listener.prototype._onClientMessage;

    originalSocketIO.Listener.prototype._onClientMessage = function(data, client) {
        // `this` refers to the `io.Listener` instance.
        let manager = managerWrappers.get(this);
        if (!manager) {
            manager = new RemoteCommManager(this);
        }
        return manager.processClientCommunication(data, client);
    };

    // Return an object that provides access to the enhanced functionalities.
    // The user will get this object and call `getEndpointRPC` or `getManagerRPC`
    // to access the new methods.
    const enhancedAPI = {
        // Expose original `io` components directly
        Manager: originalSocketIO.Manager,
        Socket: originalSocketIO.Socket,
        Client: originalSocketIO.Client,
        Listener: originalSocketIO.Listener,
        // The `listen` method needs special handling to ensure new listeners are wrapped
        listen: (...args) => {
            const originalListener = originalSocketIO.listen(...args);
            // Ensure the listener is registered with our system
            let manager = managerWrappers.get(originalListener);
            if (!manager) {
                manager = new RemoteCommManager(originalListener);
            }
            return originalListener; // Return the original listener, now patched
        },

        // New methods for accessing RPC functionality
        getEndpointRPC: (originalClientInstance) => {
            let wrapped = connectionWrappers.get(originalClientInstance);
            if (!wrapped) {
                wrapped = new ConnectionEndpoint(originalClientInstance);
                // Ensure the client wrapper knows its listener context
                if (originalClientInstance.listener) {
                    let manager = managerWrappers.get(originalClientInstance.listener);
                    if (!manager) {
                        manager = new RemoteCommManager(originalClientInstance.listener);
                    }
                    wrapped.managerReference = manager;
                }
            }
            return wrapped;
        },
        getManagerRPC: (originalListenerInstance) => {
            let manager = managerWrappers.get(originalListenerInstance);
            if (!manager) {
                manager = new RemoteCommManager(originalListenerInstance);
            }
            return manager;
        }
    };

    // Copy any other direct properties from originalSocketIO if needed, e.g. `version`, `protocol`
    for (const key in originalSocketIO) {
        if (Object.prototype.hasOwnProperty.call(originalSocketIO, key) && !enhancedAPI[key]) {
            enhancedAPI[key] = originalSocketIO[key];
        }
    }

    return enhancedAPI;
}

// Export the enhanced `socket.io` module
module.exports = createEnhancedSocketIO(externalSocketIO);