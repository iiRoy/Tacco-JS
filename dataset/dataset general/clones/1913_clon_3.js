"use strict";

/**
 * Global namespace for collaborative editing utilities.
 * @namespace harmony
 */
var harmony = harmony || {};

/**
 * Manages an Operational Transformation (OT) session for real-time collaboration.
 * Initializes the OT engine and handles client connections and message routing.
 *
 * @param {object} networkGateway - An object conforming to a network interface (e.g., WebSocketServer-like).
 * @param {object} [configuration={}] - Optional configuration settings for the session manager.
 * @constructor
 */
harmony.collaboration.SessionManager = function(networkGateway, configuration = {}) {
    // Input validation: Ensure a network gateway is provided.
    if (!networkGateway || typeof networkGateway.onClientConnect !== 'function') {
        throw new TypeError("Invalid networkGateway provided. Must implement 'onClientConnect' and 'distributePayload'.");
    }

    /**
     * The network interface responsible for handling client connections and broadcasting messages.
     * @private
     * @type {object}
     */
    this._networkGateway = networkGateway;

    /**
     * Pointer to the native OT server instance within the WebAssembly module.
     * @private
     * @type {number}
     */
    this._otEnginePointer = 0;

    /**
     * Pointer to the native OT document instance within the WebAssembly module.
     * @private
     * @type {number}
     */
    this._otDocumentPointer = 0;

    /**
     * Counter for assigning unique client identifiers.
     * @private
     * @type {number}
     */
    this._nextClientIdentifier = configuration.startClientId || 1000;

    /**
     * Flag to indicate if the session manager has been successfully initialized.
     * @private
     * @type {boolean}
     */
    this._isInitialized = false;

    // Helper function for converting WASM string pointers to JavaScript strings.
    const _decodeWasmString = (ptr) => {
        if (ptr === 0) {
            console.warn("WASM string pointer is null (0).");
            return "";
        }
        // Assuming `Runtime` is available globally in a WASM environment.
        return Runtime.UTF8ToString(ptr);
    };

    /**
     * Callback function registered with the native OT engine to dispatch messages to all connected clients.
     * This function is exposed to the WASM module.
     * @private
     * @param {number} payloadPtr - A pointer to the serialized string payload in WASM memory.
     */
    const outgoingMessageCallback = Runtime.addFunction((payloadPtr) => {
        try {
            const messagePayload = _decodeWasmString(payloadPtr);
            if (messagePayload) {
                this._networkGateway.distributePayload(messagePayload);
            } else {
                console.warn("[SESSION_MANAGER] Attempted to distribute an empty or invalid payload.");
            }
        } catch (error) {
            console.error("[SESSION_MANAGER] Error dispatching message from WASM:", error);
        }
    });

    // Initialize the native OT engine and document.
    try {
        this._otEnginePointer = wasmBridge.initializeOperationEngine(outgoingMessageCallback, null);
        this._otDocumentPointer = wasmBridge.createDocumentState();

        if (this._otEnginePointer === 0 || this._otDocumentPointer === 0) {
            throw new Error("Failed to initialize native OT engine or document.");
        }

        wasmBridge.attachDocumentToEngine(this._otEnginePointer, this._otDocumentPointer);

        // Apply initial document capacity if specified in configuration
        const initialCapacity = configuration.defaultDocumentCapacity || 1024 * 1024; // 1MB default
        this.setDocumentCapacity(initialCapacity);

        this._isInitialized = true;
        console.info("[SESSION_MANAGER] OT Session Manager initialized successfully.");
    } catch (err) {
        console.error("[SESSION_MANAGER] Fatal error during initialization:", err.message);
        // Clean up any partially allocated resources
        if (this._otEnginePointer) wasmBridge.disposeEngine(this._otEnginePointer);
        if (this._otDocumentPointer) wasmBridge.disposeDocument(this._otDocumentPointer);
        throw err; // Re-throw to indicate a critical failure.
    }

    /**
     * Handles incoming client connections from the network gateway.
     * @param {object} clientConnection - An object representing the new client connection.
     */
    this._networkGateway.onClientConnect = (clientConnection) => {
        if (!this._isInitialized) {
            console.warn("[SESSION_MANAGER] Ignoring new client connection; manager is not initialized.");
            clientConnection.close(); // Immediately close connection for uninitialized manager.
            return;
        }

        // Assign a unique identifier to the new client.
        const currentClientId = this._nextClientIdentifier++;
        clientConnection.sessionId = currentClientId; // Store ID on the connection object.

        console.log(`[SESSION_MANAGER] New client connected. Assigned ID: ${currentClientId}`);

        /**
         * Handles messages received from this specific client connection.
         * @param {string} receivedPayload - The message string received from the client.
         */
        clientConnection.onReceive = (receivedPayload) => {
            if (!receivedPayload || typeof receivedPayload !== 'string') {
                console.warn(`[SESSION_MANAGER] Client ${clientConnection.sessionId} sent an invalid or empty message.`);
                return;
            }
            try {
                // Pass the client's operation to the native OT engine for processing.
                wasmBridge.processClientOperation(this._otEnginePointer, receivedPayload);
            } catch (processErr) {
                console.error(`[SESSION_MANAGER] Error processing client ${clientConnection.sessionId} message: ${processErr.message}`);
                // Optionally send an error message back to the client.
            }
        };

        // Prepare an acknowledgment message for the new client.
        const initialClientInfo = {
            connectionIdentifier: currentClientId,
            startupTimestamp: Date.now()
        };

        // Attempt to retrieve the current state or the last composed operation of the document.
        const documentHandle = wasmBridge.getDocumentPointer(this._otEnginePointer);
        if (documentHandle !== 0) {
            const composedOperationHandle = wasmBridge.getComposedOperation(documentHandle);
            if (composedOperationHandle !== 0) {
                const latestOperationJSON = _decodeWasmString(wasmBridge.serializeOperation(composedOperationHandle));
                if (latestOperationJSON) {
                    initialClientInfo.latestDocOperation = JSON.parse(latestOperationJSON);
                }
                // Important: Release the WASM-allocated operation structure if necessary.
                // Assuming `serializeOperation` might internally copy or `getComposedOperation` might return a transient ptr.
                // If `composedOperationHandle` needs explicit freeing, add `wasmBridge.freeOperation(composedOperationHandle);` here.
            }
        } else {
            console.warn("[SESSION_MANAGER] Could not retrieve document handle for new client acknowledgment.");
        }

        // Send the acknowledgment and initial document state to the client.
        clientConnection.transmit(JSON.stringify(initialClientInfo));
        console.info(`[SESSION_MANAGER] Acknowledged client ${currentClientId} with initial session info.`);
    };
};

/**
 * Prototype methods for the SessionManager.
 */
harmony.collaboration.SessionManager.prototype = {

    /**
     * Sets the maximum allowed size for the managed document.
     * @param {number} sizeLimit - The maximum size in bytes. Must be a positive number.
     * @throws {Error} If the manager is not initialized or the size limit is invalid.
     */
    set documentCapacity(sizeLimit) {
        if (!this._isInitialized || this._otEnginePointer === 0 || this._otDocumentPointer === 0) {
            throw new Error("SessionManager is not initialized; cannot set document capacity.");
        }
        if (typeof sizeLimit !== 'number' || sizeLimit <= 0) {
            throw new Error(`Invalid document capacity specified: ${sizeLimit}. Must be a positive number.`);
        }

        try {
            wasmBridge.setDocumentCapacity(this._otDocumentPointer, sizeLimit);
            console.log(`[SESSION_MANAGER] Document capacity set to ${sizeLimit} bytes.`);
        } catch (err) {
            console.error(`[SESSION_MANAGER] Failed to set document capacity: ${err.message}`);
        }
    },

    /**
     * Retrieves the current maximum allowed size for the managed document.
     * @returns {number} The current maximum document size in bytes, or 0 if not initialized.
     */
    get documentCapacity() {
        if (!this._isInitialized || this._otDocumentPointer === 0) {
            console.warn("[SESSION_MANAGER] Attempted to get document capacity on uninitialized manager.");
            return 0;
        }
        return wasmBridge.getDocumentCapacity(this._otDocumentPointer);
    },

    /**
     * Shuts down the session manager, closing all connections and releasing native resources.
     */
    shutdown: function() {
        if (!this._isInitialized) {
            console.warn("[SESSION_MANAGER] Attempted to shut down an uninitialized manager.");
            return;
        }

        console.info("[SESSION_MANAGER] Initiating shutdown sequence...");

        // Close the network gateway, which should disconnect all clients.
        if (this._networkGateway && typeof this._networkGateway.closeAllConnections === 'function') {
            this._networkGateway.closeAllConnections();
            console.log("[SESSION_MANAGER] Network gateway connections closed.");
        } else {
            console.warn("[SESSION_MANAGER] Network gateway does not support 'closeAllConnections' or is missing.");
        }

        // Dispose of native WASM resources.
        try {
            if (this._otEnginePointer !== 0) {
                wasmBridge.disposeEngine(this._otEnginePointer);
                this._otEnginePointer = 0;
            }
            if (this._otDocumentPointer !== 0) {
                wasmBridge.disposeDocument(this._otDocumentPointer);
                this._otDocumentPointer = 0;
            }
            console.log("[SESSION_MANAGER] Native OT engine and document resources released.");
        } catch (err) {
            console.error("[SESSION_MANAGER] Error during native resource disposal:", err.message);
        }

        this._isInitialized = false;
        console.info("[SESSION_MANAGER] Session Manager has been shut down.");
    }
};