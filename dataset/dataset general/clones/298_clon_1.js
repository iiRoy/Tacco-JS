/**
 *  This file contains an implementation related to JSON-RPC functionality
 *  for Socket.IO, enhancing client-server communication.
 *
 *  @author Jeremy TRUFIER <jeremy@trufier.com>
 *  @version 1.0.0
 *  @license MIT
 */


var io = require('socket.io'),
    Client = require('socket.io/lib/socket.io/client.js');


/**
 *  @var Client.registersRPC : This object serves as a central repository
 *                            for storing all the method/callback functions
 *                            that are registered for JSON-RPC calls.
 *                            It maps method names to their corresponding handlers.
 */
Client.prototype.registersRPC = { };


/**
 *  @var Client.callbacksRPC : This object holds all the temporary callback functions
 *                            that are awaiting a response from a client.
 *                            These callbacks are fired once a JSON-RPC return
 *                            message is received from the client.
 */
Client.prototype.callbacksRPC = { };


/**
 *  @var Client.uid : A simple, monotonic counter used to generate unique
 *                   identifiers for each JSON-RPC request originating from this client instance.
 *                   It's incremented by one for every new request.
 */
Client.prototype.uid = 0;


/**
 *  Generates a unique identifier for a JSON-RPC request.
 *  This ID is guaranteed to be unique within the context of a Listener session.
 *
 *  @returns {string} A unique string identifier for the current JSON-RPC request.
 */
Client.prototype.uniqId = function () {

    return this.sessionId + '$' + this.uid++;

};


/**
 *  Initiates an JSON-RPC call to the connected client.
 *  This method allows the server to invoke a function on the client side.
 *
 *  @param {string} method The name of the method to be called on the client.
 *  @param {mixed} params Values or parameters to pass to the called method on the client.
 *                        This can also be a function if it's meant to be the success callback.
 *  @param {function(result)|object} callback A function to be executed when the client responds with the method's result,
 *                                            OR an object containing various settings for the call.
 *                                            Settings object can include:
 *                                            {
 *                                              timeout: int // Duration in milliseconds after which the callback is considered lost.
 *                                              cleanCallbacksOnTimeout: bool // If true, clears the callback on timeout. Default is true.
 *                                              success: function(result, client) // Called on successful response from client.
 *                                              error: function(error, client) // Called if an error occurs on the client side (e.g., {code:XXX, message:XXX}).
 *                                              finaly: function(data) // Always called after success or error, with the raw response data.
 *                                            }
 *  @returns {object} The result of the `send` operation, typically indicating the message was queued.
 */
Client.prototype.callRPC = function (method, params, callback) {

    var $ = this,
        options = {
            timeout: $.options.timeout,
            cleanCallbacksOnTimeout: true,
            success: null,
            error: null,
            finaly: null,
            params: { }
        },
        id = $.uniqId(); // Generate a unique ID for this RPC call.


    // Process the `params` argument
    if (params && typeof params == 'function') {
        options.success = params;
    } else if (params) {
        options.params = params;
    }


    // Process the `callback` argument
    if (callback && typeof callback == 'function') {
        options.success = callback;
    } else if (callback && typeof callback == 'object') {
        // Merge provided options with defaults
        // Assuming a `merge` utility function exists in the scope or context.
        merge(options, callback);
    }


    var r = { }; // Object to store callback references for this specific RPC ID.

    // If any success, error, or finaly callbacks are provided, set up tracking.
    if (options.success || options.error || options.finaly) {

        // Set up timeout if cleanCallbacksOnTimeout is enabled
        if (options.cleanCallbacksOnTimeout) {
            r.timerOut = setTimeout(function () {
                // If timeout occurs, simulate an error response and clean up.
                $.onMessage({ error: { code: 'CALLRPCTIMEOUT', message: 'Server has not respond in time' }, id: id });
                delete $.callbacksRPC[id];
            }, options.timeout);
        }

        // Assign callbacks if they exist
        options.success && (r.success = options.success);
        options.error && (r.error = options.error);
        options.finaly && (r.finaly = options.finaly);
    }

    // Only store `r` if it's not an empty object (i.e., if callbacks were registered)
    r != { } && ($.callbacksRPC[id] = r);


    // Send the JSON-RPC request to the client.
    return $.send({ method: method, params: options.params, id: id });

};


/**
 *  Registers one or more functions to be executed when a specific JSON-RPC method
 *  is invoked by a client. This allows the server to respond to client-initiated RPC calls.
 *
 *  The registered functions are executed sequentially. `next()` can be called
 *  within a function to proceed to the next registered callback.
 *
 *  @param {string} method The name of the JSON-RPC method to register.
 *  @param {function(data, client, next)|Array<function(data, client, next)>} callback
 *                        A single callback function, or an array of functions,
 *                        to execute when the JSON-RPC method is called.
 *                        Each function receives `data`, `client`, and a `next` function.
 *  @param {...function(data, client, next)} [additionalCallbacks] Additional callback functions can be provided as separate arguments.
 *  @returns {Client} Returns the client instance for method chaining.
 */
Client.prototype.listenRPC = function (method, callback) {

    var callbacks = []; // Array to accumulate all valid callback functions.

    // Iterate through all arguments passed to listenRPC, starting from the second one.
    for (var j = 1; j < arguments.length; j++) {

        // If the argument is an array, iterate through its elements.
        if (Array.isArray(arguments[j])) {
            for (var i = 0; i < arguments[j].length; i++) {
                // Add only functions from the array to the callbacks list.
                typeof arguments[j][i] === 'function' && callbacks.push(arguments[j][i]);
            }
        }
        // If the argument itself is a function, add it to the callbacks list.
        else if (typeof arguments[j] === 'function') {
            callbacks.push(arguments[j]);
        }
    }

    // If any valid callbacks were found, register them for the specified method.
    if (callbacks.length > 0) {
        this.registersRPC[method] = callbacks;
    }

    return this; // Enable method chaining.

};


/**
 *  Sends a JSON-RPC notification (a simple call without expecting a response)
 *  to ALL OTHER connected clients, excluding the current client instance.
 *
 *  @param {string} method The method name to notify.
 *  @param {mixed} params Parameters to pass with the notification.
 *  @returns {Client} Returns the client instance for method chaining.
 */
Client.prototype.broadcastNotifyRPC = function (method, params) {

    // Ensure the client has a session ID before attempting to broadcast.
    if (!('sessionId' in this)) {
        return this;
    }

    // Delegate the actual broadcasting to the listener.
    this.listener.broadcastNotifyRPC(method, params, this.sessionId);

    return this; // Enable method chaining.

};


/**
 *  Recursively runs a series of registered callback functions for a JSON-RPC method.
 *  This allows for middleware-like processing of RPC calls.
 *
 *  @param {string} method The name of the JSON-RPC method.
 *  @param {mixed} params The parameters received with the RPC call.
 *  @param {Client} client The client instance that made the RPC call.
 *  @param {Array<function>} callbacks An array of callback functions to execute.
 *  @param {object} result An object containing `success` and `error` functions for sending a response.
 *  @returns {mixed} The return value of the last executed callback function.
 */
io.Listener.prototype.runRegistersCallbackRPC = function (method, params, client, callbacks, result) {

    var ret = null; // Variable to store the return value of the callback.
    var $$ = this;  // Cache 'this' (the Listener instance) for use in nested functions.

    // Check if there are any callbacks left to run.
    if (callbacks.length > 0) {

        var c = callbacks.shift(); // Get and remove the first callback from the array.

        // Execute the callback, passing parameters, client, a 'next' function, and the result handlers.
        ret = c(params || null, client, function () {
            // The 'next' function recursively calls runRegistersCallbackRPC with the remaining callbacks.
            return $$.runRegistersCallbackRPC(method, params, client, callbacks, result);
        }, result);
    }

    return ret; // Return the result of the last executed callback.

};


/**
 *  Handles incoming JSON-RPC calls from a client.
 *  This method processes the request, executes registered callbacks, and sends a response.
 *
 *  @param {object} data The incoming JSON-RPC request data.
 *  @param {Client} client The client instance that sent the request.
 *  @private
 */
io.Listener.prototype._onClientReturnRPC = function (data, client) {

    var res,
        id = data.id || null, // Extract the request ID.
        $$ = this;          // Cache 'this' (the Listener instance).

    $$.isSend = false; // Flag to track if a response has been sent.

    // Define a helper `send` function to format and dispatch the RPC response.
    $$.send = function (res) {

        // Format the response based on whether it's a success or an error.
        if (res.rpcReturnSuccess) {
            res = { result: res.rpcReturnSuccess, id: id };
        } else if (res.rpcReturnError) {
            res = { error: { code: res.rpcReturnError.code, message: res.rpcReturnError.message }, id: id };
        }

        // If an ID exists, send the formatted response back to the client.
        data.id && client.send(res);

        $$.isSend = true; // Mark that a response has been sent.
    };


    try {
        // Attempt to run the registered callbacks for the requested method.
        res = {
            rpcReturnSuccess:
                this.runRegistersCallbackRPC(
                    data.method,
                    data.params || null,
                    client,
                    client.registersRPC[data.method].slice(0), // Pass a copy of the callbacks array.
                    {
                        // Success callback for the RPC method.
                        success: function (result) {
                            $$.send({ rpcReturnSuccess: result });
                        },
                        // Error callback for the RPC method.
                        error: function (e) {
                            $$.send({ rpcReturnError: e });
                        }
                    }
                )
        };
    } catch (e) {
        // If an error occurs during callback execution, capture it.
        res = { rpcReturnError: e };
    }


    // If no response was explicitly sent by the callbacks, send the captured result/error.
    !$$.isSend && $$.send(res);


    // Emit events for monitoring and further processing.
    client.emit('RPCCall', data);
    this.emit('clientRPCCall', data, client);

    return; // Function completes.
};


/**
 *  Handles incoming JSON-RPC return messages (responses to previously sent `callRPC` requests)
 *  from a client. It fires the corresponding callbacks and cleans up resources.
 *
 *  @param {object} data The incoming JSON-RPC response data.
 *  @param {Client} client The client instance that sent the response.
 *  @private
 */
io.Listener.prototype._onClientCallRPC = function (data, client) {

    // Check if the response has an ID and if there's a corresponding callback registered.
    if (data.id && client.callbacksRPC[data.id]) {

        // Clear any pending timeout for this RPC call.
        client.callbacksRPC[data.id].timerOut && clearTimeout(this.callbacksRPC[data.id].timerOut);

        // If a result is present and a success callback is registered, execute it.
        data.result && typeof client.callbacksRPC[data.id].success == 'function' && client.callbacksRPC[data.id].success(data.result, client);

        // If an error is present and an error callback is registered, execute it.
        data.error && typeof client.callbacksRPC[data.id].error == 'function' && client.callbacksRPC[data.id].error(data.error, client);

        // If a finaly callback is registered, execute it regardless of success or error.
        typeof this.callbacksRPC[data.id].finaly == 'function' && this.callbacksRPC[data.id].finaly(data);


        // Clean up the stored callback by deleting it.
        delete client.callbacksRPC[data.id];
    }

    // Emit events indicating an RPC return.
    client.emit('RPCReturn', data);
    this.emit('clientRPCReturn', data, client);

    return; // Function completes.
};


/**
 *  Overrides the default `_onClientMessage` method of the Listener
 *  to intercept and handle JSON-RPC specific messages (calls and returns).
 *
 *  @param {object} data The raw message data received from the client.
 *  @param {Client} client The client instance that sent the message.
 */
io.Listener.prototype._onClientMessage = function (data, client) {

    // If the message is an object, has a 'method' property, and a handler is registered for it,
    // then it's an incoming RPC call.
    if (typeof data == 'object' && data.method && client.registersRPC[data.method]) {
        return this._onClientReturnRPC(data, client);
    }

    // If the message is an object and contains either 'result' or 'error',
    // then it's an RPC response to a previous call.
    if (typeof data == 'object' && (data.result || data.error)) {
        return this._onClientCallRPC(data, client);
    }

    // If it's not an RPC message, defer to the original Listener's message handling.
    // This emits the 'clientMessage' event.
    this.emit('clientMessage', data, client);

};


/**
 *  Sends a JSON-RPC call to all connected clients, with the option to exclude
 *  specific clients based on their session ID.
 *
 *  @param {string} method The name of the method to call on clients.
 *  @param {mixed} params Values or parameters to pass to the called method.
 *  @param {function(result)|object} callback A function to execute when a client responds,
 *                                            OR an object containing call settings (like timeout, success, error).
 *  @param {number|string|Array<number|string>} [except] One or more session IDs of clients
 *                                                      to exclude from receiving this RPC call.
 *  @returns {io.Listener} Returns the Listener instance for method chaining.
 */
io.Listener.prototype.broadcastCallRPC = function (method, params, callback, except) {

    var i, k, l; // Loop variables.

    // Iterate through all connected clients.
    for (i = 0, k = Object.keys(this.clients), l = k.length; i < l; i++) {

        // Check if the current client should be excluded from the broadcast.
        // It's excluded if 'except' is provided AND
        // (it's a single ID matching the current client OR it's an array containing the current client's ID).
        if (!except
            || ((typeof except == 'number' || typeof except == 'string') && k[i] != except)
            || (Array.isArray(except) && except.indexOf(k[i]) == -1)) {

            // Call the RPC method on the current client.
            this.clients[k[i]].callRPC(method, params, function (result) {
                // Execute the provided callback with the result and the specific client.
                callback(result, this.clients[k[i]]);
            });
        }
    }

    return this; // Enable method chaining.

};


/**
 *  Sends a JSON-RPC notification (a call without expecting a response)
 *  to all connected clients, with the option to exclude specific clients.
 *
 *  @param {string} method The name of the method to notify.
 *  @param {mixed} params Parameters to pass with the notification.
 *  @param {number|string|Array<number|string>} [except] One or more session IDs of clients
 *                                                      to exclude from receiving this notification.
 *  @returns {io.Listener} Returns the Listener instance for method chaining.
 */
io.Listener.prototype.broadcastNotifyRPC = function (method, params, except) {

    var i, k, l; // Loop variables.

    // Iterate through all connected clients.
    for (i = 0, k = Object.keys(this.clients), l = k.length; i < l; i++) {

        // Check if the current client should be excluded from the broadcast.
        if (!except
            || ((typeof except == 'number' || typeof except == 'string') && k[i] != except)
            || (Array.isArray(except) && except.indexOf(k[i]) == -1)) {

            // Call the RPC method on the current client without a callback (notification).
            this.clients[k[i]].callRPC(method, params);
        }
    }

    return this; // Enable method chaining.

};


// Export the modified 'io' object, which now includes the RPC extensions.
module.exports = io;