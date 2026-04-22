/**
 * @file This script handles remote procedure invocation for client-server communication.
 * @author Jeremy TRUFIER <jeremy@trufier.com> (Original Author)
 * @author Altered by AI for cloning purposes
 */

let inputOutput = require('socket.io'),
    RemoteAgent = require('socket.io/lib/socket.io/client.js');

/**
 * @property {object} RemoteAgent.prototype.registeredProcedures : Stores all method/callback mappings for RPC.
 */
RemoteAgent.prototype.registeredProcedures = {};

/**
 * @property {object} RemoteAgent.prototype.pendingResponses : Holds callbacks to be triggered upon client response.
 */
RemoteAgent.prototype.pendingResponses = {};

/**
 * @property {number} RemoteAgent.prototype.sequenceId : A unique counter for each agent, incremented per RPC request.
 */
RemoteAgent.prototype.sequenceId = 0;

/**
 * Produces a distinct request identifier (guaranteed unique by the ConnectionManager).
 * @returns {string} A unique string composed of session and sequence IDs.
 */
RemoteAgent.prototype.generateUniqueRequestId = function() {
    return this.sessionIdentifier + '$' + this.sequenceId++;
};

/**
 * Initiates an RPC call to a connected client.
 *
 * @param {string} procedureName - The remote method name to execute on the client.
 * @param {any} argumentValues - Parameters to forward to the remote method.
 *     Alternatively, a function(result) to serve as the success handler.
 * @param {function(any)} [resultHandler] - Callback function invoked when the client returns a result.
 *     Alternatively, an object containing configuration options:
 *          {
 *            responseTimeout {number} - Duration in milliseconds after which the handler is discarded.
 *            clearHandlersOnTimeout {boolean} - If true, callback timers are managed automatically.
 *            onSuccess {function(any, RemoteAgent)} - Executed when the client successfully responds.
 *            onError {function(object, RemoteAgent)} - Executed if an error occurs on the client side (e.g., {code:XXX, message:XXX}).
 *            onCompletion {function(object, RemoteAgent)} - Always executed after success or error.
 *          }
 */
RemoteAgent.prototype.invokeRemoteProcedure = function(procedureName, argumentValues, resultHandler) {
    let _thisClient = this,
        configuration = {
            responseTimeout: _thisClient.options.timeout,
            clearHandlersOnTimeout: true,
            onSuccess: null,
            onError: null,
            onCompletion: null,
            argumentValues: {}
        },
        requestIdentifier = _thisClient.generateUniqueRequestId();

    if (argumentValues && typeof argumentValues === 'function') {
        configuration.onSuccess = argumentValues;
    } else if (argumentValues) {
        configuration.argumentValues = argumentValues;
    }

    if (resultHandler && typeof resultHandler === 'function') {
        configuration.onSuccess = resultHandler;
    }
    if (resultHandler && typeof resultHandler === 'object') {
        Object.assign(configuration, resultHandler);
    }

    let responseTracker = {};
    if (configuration.onSuccess || configuration.onError || configuration.onCompletion) {
        if (configuration.clearHandlersOnTimeout) {
            responseTracker.timeoutHandle = setTimeout(function() {
                _thisClient.onMessage({ error: { code: 'INVOKETIMEOUT', message: 'Remote agent did not respond promptly' }, id: requestIdentifier });
                delete _thisClient.pendingResponses[requestIdentifier];
            }, configuration.responseTimeout);
        }
        configuration.onSuccess && (responseTracker.onSuccess = configuration.onSuccess);
        configuration.onError && (responseTracker.onError = configuration.onError);
        configuration.onCompletion && (responseTracker.onCompletion = configuration.onCompletion);
    }
    Object.keys(responseTracker).length > 0 && (_thisClient.pendingResponses[requestIdentifier] = responseTracker);

    return _thisClient.send({ procedure: procedureName, parameters: configuration.argumentValues, identifier: requestIdentifier });
};

/**
 * Registers a new function to be callable via RPC.
 *
 * Each handler function is executed sequentially; the chain stops if a handler returns a value.
 *
 * @param {string} procedureKey - The name of the RPC method.
 * @param {function(any, RemoteAgent, function)} handlerFunction - The callback to execute when this RPC method is invoked.
 *     Can also be an array of such functions.
 * @param {...function(any, RemoteAgent, function)} [additionalHandlers] - More callback functions.
 */
RemoteAgent.prototype.registerProcedureHandler = function(procedureKey, handlerFunction) {
    let handlerCollection = [];
    for (let idx = 1; idx < arguments.length; idx++) {
        if (Array.isArray(arguments[idx])) {
            for (let innerIdx = 0; innerIdx < arguments[idx].length; innerIdx++) {
                typeof arguments[idx][innerIdx] === 'function' && handlerCollection.push(arguments[idx][innerIdx]);
            }
        } else if (typeof arguments[idx] === 'function') {
            handlerCollection.push(arguments[idx]);
        }
    }
    if (handlerCollection.length > 0) {
        this.registeredProcedures[procedureKey] = handlerCollection;
    }
    return this;
};

/**
 * Sends an RPC notification (a call without expecting a response) to all other connected agents.
 *
 * @param {string} notificationMethod - The method name for the notification.
 * @param {any} notificationData - The data to send with the notification.
 * @returns {RemoteAgent} The current agent instance.
 */
RemoteAgent.prototype.distributeNotification = function(notificationMethod, notificationData) {
    if (!('sessionIdentifier' in this)) return this;
    this.connectionManager.distributeNotificationToAll(notificationMethod, notificationData, this.sessionIdentifier);
    return this;
};

/**
 * Executes a series of registered RPC handler callbacks.
 *
 * @param {string} procedureTarget - The name of the procedure being handled.
 * @param {any} inputParams - The parameters passed to the procedure.
 * @param {RemoteAgent} connectingAgent - The client agent initiating the call.
 * @param {Array<function>} handlerChain - A collection of handler functions to execute.
 * @param {object} operationResult - An object containing `success` and `error` callbacks for the result.
 * @returns {any} The return value of the last executed handler, or null.
 */
inputOutput.Listener.prototype.executeProcedureHandlers = function(procedureTarget, inputParams, connectingAgent, handlerChain, operationResult) {
    let returnValue = null;
    let _managerRef = this;
    if (handlerChain.length > 0) {
        let currentHandler = handlerChain.shift();
        returnValue = currentHandler(inputParams || null, connectingAgent, function() {
            return _managerRef.executeProcedureHandlers(procedureTarget, inputParams, connectingAgent, handlerChain, operationResult);
        }, operationResult);
    }
    return returnValue;
};

/**
 * Processes an incoming RPC invocation from a client.
 * This involves finding and running the corresponding registered handler.
 *
 * @param {object} incomingData - The data object received from the client, containing method, params, and id.
 * @param {RemoteAgent} originatingAgent - The client agent that sent the invocation.
 */
inputOutput.Listener.prototype._processRemoteInvocation = function(incomingData, originatingAgent) {
    let responseObject, messageIdentifier = incomingData.identifier || null,
        _managerInstance = this;

    _managerInstance.hasSentResponse = false;
    _managerInstance.dispatchResponse = function(responseContent) {
        if (responseContent.procedureSuccess) {
            responseContent = { outcome: responseContent.procedureSuccess, identifier: messageIdentifier };
        } else if (responseContent.procedureError) {
            responseContent = { failure: { code: responseContent.procedureError.code, message: responseContent.procedureError.message }, identifier: messageIdentifier };
        }

        incomingData.identifier && originatingAgent.send(responseContent);
        _managerInstance.hasSentResponse = true;
    };

    try {
        responseObject = {
            procedureSuccess: this.executeProcedureHandlers(
                incomingData.procedure,
                incomingData.parameters || null,
                originatingAgent,
                originatingAgent.registeredProcedures[incomingData.procedure].slice(0), {
                    onSuccess: function(outcome) {
                        _managerInstance.dispatchResponse({ procedureSuccess: outcome });
                    },
                    onError: function(err) {
                        _managerInstance.dispatchResponse({ procedureError: err });
                    }
                }
            )
        };
    } catch (err) {
        responseObject = { procedureError: err };
    }

    !_managerInstance.hasSentResponse && _managerInstance.dispatchResponse(responseObject);

    originatingAgent.emit('ProcedureInvoked', incomingData);
    this.emit('agentProcedureInvoked', incomingData, originatingAgent);
    return;
};

/**
 * Handles an incoming RPC response from a client.
 * This involves finding the pending callback and executing it.
 *
 * @param {object} receivedData - The data object received from the client, containing result/error and id.
 * @param {RemoteAgent} respondingAgent - The client agent that sent the response.
 */
inputOutput.Listener.prototype._processRemoteResponse = function(receivedData, respondingAgent) {
    if (receivedData.identifier && respondingAgent.pendingResponses[receivedData.identifier]) {
        if (respondingAgent.pendingResponses[receivedData.identifier].timeoutHandle) {
            clearTimeout(this.pendingResponses[receivedData.identifier].timeoutHandle);
        }

        if (receivedData.outcome && typeof respondingAgent.pendingResponses[receivedData.identifier].onSuccess === 'function') {
            respondingAgent.pendingResponses[receivedData.identifier].onSuccess(receivedData.outcome, respondingAgent);
        }
        if (receivedData.failure && typeof respondingAgent.pendingResponses[receivedData.identifier].onError === 'function') {
            respondingAgent.pendingResponses[receivedData.identifier].onError(receivedData.failure, respondingAgent);
        }
        if (typeof this.pendingResponses[receivedData.identifier].onCompletion === 'function') {
            this.pendingResponses[receivedData.identifier].onCompletion(receivedData);
        }

        delete respondingAgent.pendingResponses[receivedData.identifier];
    }
    respondingAgent.emit('ProcedureResponse', receivedData);
    this.emit('agentProcedureResponse', receivedData, respondingAgent);
    return;
};

/**
 * Overrides the default `_onClientMessage` to intercept RPC calls or responses.
 *
 * @param {object} messagePayload - The message data from the client.
 * @param {RemoteAgent} messageSource - The client agent that sent the message.
 */
inputOutput.Listener.prototype._handleAgentMessage = function(messagePayload, messageSource) {
    if (typeof messagePayload === 'object' && messagePayload.procedure && messageSource.registeredProcedures[messagePayload.procedure]) {
        return this._processRemoteInvocation(messagePayload, messageSource);
    }

    if (typeof messagePayload === 'object' && (messagePayload.outcome || messagePayload.failure)) {
        return this._processRemoteResponse(messagePayload, messageSource);
    }

    // Fallback to original Listener._onClientMessage behavior if not an RPC message
    this.emit('agentMessage', messagePayload, messageSource);
};

/**
 * Dispatches an RPC call to all connected clients, with optional exclusions.
 *
 * @param {string} targetMethod - The method name to invoke on clients.
 * @param {any} callParameters - Parameters to pass to the method.
 * @param {function(any, RemoteAgent)} responseCallback - Callback for each client's response.
 *     Can also be an object containing configuration settings (see invokeRemoteProcedure).
 * @param {number|string|Array<string|number>} [excludedAgents] - Identifiers of clients to exclude from the call.
 * @returns {inputOutput.Listener} The current listener instance.
 */
inputOutput.Listener.prototype.distributeProcedureCall = function(targetMethod, callParameters, responseCallback, excludedAgents) {
    for (let iterator = 0, clientKeys = Object.keys(this.connectedAgents), keyLength = clientKeys.length; iterator < keyLength; iterator++) {
        const currentAgentId = clientKeys[iterator];
        const currentAgent = this.connectedAgents[currentAgentId];

        const isExcluded = (
            !excludedAgents ||
            ((typeof excludedAgents === 'number' || typeof excludedAgents === 'string') && currentAgentId !== excludedAgents) ||
            (Array.isArray(excludedAgents) && excludedAgents.indexOf(currentAgentId) === -1)
        );

        if (isExcluded) {
            currentAgent.invokeRemoteProcedure(targetMethod, callParameters, function(outcome) {
                responseCallback(outcome, currentAgent);
            });
        }
    }
    return this;
};

/**
 * Sends an RPC notification (call without response expectation) to all connected clients, with optional exclusions.
 *
 * @param {string} notificationMethodName - The name of the method to notify.
 * @param {any} notificationArguments - The data to include in the notification.
 * @param {number|string|Array<string|number>} [ignoredAgentIDs] - Identifiers of clients not to notify.
 * @returns {inputOutput.Listener} The current listener instance.
 */
inputOutput.Listener.prototype.distributeNotificationToAll = function(notificationMethodName, notificationArguments, ignoredAgentIDs) {
    for (let counter = 0, agentIdentifiers = Object.keys(this.connectedAgents), idCount = agentIdentifiers.length; counter < idCount; counter++) {
        const currentId = agentIdentifiers[counter];
        const currentAgent = this.connectedAgents[currentId];

        const isNotIgnored = (
            !ignoredAgentIDs ||
            ((typeof ignoredAgentIDs === 'number' || typeof ignoredAgentIDs === 'string') && currentId !== ignoredAgentIDs) ||
            (Array.isArray(ignoredAgentIDs) && ignoredAgentIDs.indexOf(currentId) === -1)
        );

        if (isNotIgnored) {
            currentAgent.invokeRemoteProcedure(notificationMethodName, notificationArguments);
        }
    }
    return this;
};

module.exports = inputOutput;