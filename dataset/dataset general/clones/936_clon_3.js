class DdpClient {
  constructor(serverUri) {
    // Protocol versions supported by this client.
    this.supportedProtocols = Object.freeze(["pre1"]);

    // Connection parameters and state management.
    this.serverEndpoint = serverUri;
    this.websocketConnection = null;
    this.connectionState = DdpClient.ConnectionStatus.DISCONNECTED;

    // Data structures for managing asynchronous operations and local data.
    this.pendingOperations = new Map();         // Maps request ID to { resolve, reject } functions of a Promise.
    this.activeSubscriptions = new Map();     // Maps subscription name to its DDP request ID.
    this.collectionObservers = new Map();     // Maps collection name to an array of callback functions.
    this.localDataStore = new Map();          // Maps collection name to a Map of documents (document ID => document object).

    // Centralized error handling utility.
    this._handleError = (context, errorDetails) => {
      console.error(`DdpClient Error in ${context}:`, errorDetails);
      // Further error handling, e.g., emitting events, updating UI.
    };
  }

  // Enum for connection status (new fragment: added for clearer state management)
  static ConnectionStatus = Object.freeze({
    DISCONNECTED: 'disconnected',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    ERROR: 'error',
    CLOSING: 'closing'
  });

  // Establishes the WebSocket connection and initiates the DDP handshake.
  async establishConnection() {
    if (this.connectionState !== DdpClient.ConnectionStatus.DISCONNECTED) {
      console.warn("Connection is already in progress or established. Current state:", this.connectionState);
      // Return a resolved promise if already connected to prevent redundant attempts.
      return this.connectionState === DdpClient.ConnectionStatus.CONNECTED
        ? Promise.resolve(this)
        : new Promise((resolve, reject) => { /* Wait for current connection attempt */ }); // (Placeholder for more advanced logic)
    }

    this.connectionState = DdpClient.ConnectionStatus.CONNECTING;

    return new Promise((resolve, reject) => {
      try {
        this.websocketConnection = new WebSocket(this.serverEndpoint);

        this.websocketConnection.onopen = () => {
          this._dispatchMessage({
            msg: 'connect',
            version: this.supportedProtocols[0],
            support: this.supportedProtocols
          });
          this.connectionState = DdpClient.ConnectionStatus.CONNECTED;
          resolve(this);
        };

        this.websocketConnection.onerror = (event) => {
          this.connectionState = DdpClient.ConnectionStatus.ERROR;
          this._handleError('WebSocket Connection', event.message || "Unknown WebSocket error.");
          this.disconnect(); // Attempt to clean up
          reject(new Error("WebSocket connection failed."));
        };

        this.websocketConnection.onmessage = (event) => {
          this._processIncomingDdpMessage(event.data);
        };

        this.websocketConnection.onclose = (event) => {
          this.connectionState = DdpClient.ConnectionStatus.DISCONNECTED;
          console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
          // Reject all pending operations as the connection is no longer active.
          this.pendingOperations.forEach(deferred => deferred.reject("Connection closed unexpectedly."));
          this.pendingOperations.clear();
          this.activeSubscriptions.clear();
          // Keep localDataStore and collectionObservers, as they might be re-used on reconnect.
        };

      } catch (err) {
        this.connectionState = DdpClient.ConnectionStatus.ERROR;
        this._handleError('Connection Setup', err);
        reject(err);
      }
    });
  }

  // Internal method to parse raw WebSocket data and dispatch to appropriate handlers.
  _processIncomingDdpMessage(rawData) {
    let messageBody;
    try {
      messageBody = JSON.parse(rawData);
    } catch (e) {
      this._handleError('Message Parsing', `Failed to parse incoming JSON: ${rawData}. Error: ${e.message}`);
      return;
    }

    const { msg: messageType, ...payload } = messageBody;

    switch (messageType) {
      case 'connected':
        // Handled by the Promise in establishConnection, no further action here.
        break;
      case 'result':
        this._completeMethodCall(payload);
        break;
      case 'updated':
        // Acknowledges that server has applied method changes. Often precedes 'result'.
        // No direct client action needed beyond the 'result' handling.
        break;
      case 'changed':
        this._updateCollectionDocument(payload);
        break;
      case 'added':
        this._addCollectionDocument(payload);
        break;
      case 'removed':
        this._removeCollectionDocument(payload);
        break;
      case 'ready':
        this._signalSubscriptionsReady(payload);
        break;
      case 'nosub':
        this._failSubscriptionRequest(payload);
        break;
      case 'addedBefore': // New fragment: specific handling for ordered additions
        this._addCollectionDocument(payload); // Currently same as 'added', but allows for future differentiation.
        break;
      case 'movedBefore': // New fragment: handler for document reordering in ordered collections.
        this._repositionCollectionDocument(payload);
        break;
      default:
        console.warn(`DdpClient: Unrecognized DDP message type received: ${messageType}`, payload);
    }
  }

  // Completes a pending method call by resolving or rejecting its promise.
  _completeMethodCall({ id: requestId, error, result }) {
    const deferred = this.pendingOperations.get(requestId);
    if (!deferred) {
      console.warn(`DdpClient: No pending operation found for method call ID: ${requestId}.`);
      return;
    }
    if (error) {
      deferred.reject(error.reason || error.message || "Unknown method error.");
    } else {
      deferred.resolve(result);
    }
    this.pendingOperations.delete(requestId);
  }

  // Rejects a pending subscription request.
  _failSubscriptionRequest({ id: requestId, error }) {
    const deferred = this.pendingOperations.get(requestId);
    if (!deferred) {
      console.warn(`DdpClient: No pending operation found for subscription ID: ${requestId}.`);
      return;
    }
    deferred.reject(error ? (error.reason || error.message || "Subscription failed.") : "Subscription not found or failed.");
    this.pendingOperations.delete(requestId);

    // Also remove the subscription from active list if it was mistakenly added.
    for (const [subName, subId] of this.activeSubscriptions.entries()) {
      if (subId === requestId) {
        this.activeSubscriptions.delete(subName);
        break;
      }
    }
  }

  // Marks a set of subscriptions as ready, resolving their promises.
  _signalSubscriptionsReady({ subs: readySubscriptionIds = [] }) {
    for (const subId of readySubscriptionIds) {
      const deferred = this.pendingOperations.get(subId);
      if (deferred) {
        deferred.resolve();
        this.pendingOperations.delete(subId);
      } else {
        console.warn(`DdpClient: No pending operation found for ready subscription ID: ${subId}.`);
      }
    }
  }

  // Updates an existing document within a local collection.
  _updateCollectionDocument({ collection: collectionName, id: documentId, fields: updatedFields, cleared: fieldsToClear }) {
    const targetCollection = this.localDataStore.get(collectionName);
    if (!targetCollection) {
      this._handleError('Document Update', `Collection '${collectionName}' not found for document ID '${documentId}'.`);
      return;
    }

    const targetDocument = targetCollection.get(documentId);
    if (!targetDocument) {
      this._handleError('Document Update', `Document ID '${documentId}' not found in collection '${collectionName}'.`);
      return;
    }

    // Apply field updates using Object.assign for shallow merge.
    if (updatedFields) {
      Object.assign(targetDocument, updatedFields);
    }

    // Remove specified fields.
    if (Array.isArray(fieldsToClear)) {
      fieldsToClear.forEach(fieldName => delete targetDocument[fieldName]);
    }

    this._notifyCollectionObservers(collectionName, targetDocument, documentId, 'changed');
  }

  // Adds a new document to a local collection.
  _addCollectionDocument({ collection: collectionName, id: documentId, fields: initialFields, before: beforeDocId = null }) {
    let targetCollection = this.localDataStore.get(collectionName);
    if (!targetCollection) {
      targetCollection = new Map();
      this.localDataStore.set(collectionName, targetCollection);
    }

    // Ensure initialFields is an object, even if empty.
    const newDocument = initialFields || {};
    targetCollection.set(documentId, newDocument);

    // The 'before' field is relevant for ordered collections.
    // For a Map, explicit order isn't maintained, but observers can use this info.
    if (beforeDocId !== null) {
      console.debug(`DdpClient: Document '${documentId}' indicated to be added before '${beforeDocId}' in '${collectionName}'.`);
    }

    this._notifyCollectionObservers(collectionName, newDocument, documentId, 'added');
  }

  // Removes a document from a local collection.
  _removeCollectionDocument({ collection: collectionName, id: documentId }) {
    const targetCollection = this.localDataStore.get(collectionName);
    if (!targetCollection) {
      this._handleError('Document Removal', `Collection '${collectionName}' not found for document ID '${documentId}'.`);
      return;
    }

    const removedDocumentSnapshot = targetCollection.get(documentId);
    if (!removedDocumentSnapshot) {
      this._handleError('Document Removal', `Document ID '${documentId}' not found in collection '${collectionName}'.`);
      return;
    }

    targetCollection.delete(documentId);
    this._notifyCollectionObservers(collectionName, removedDocumentSnapshot, documentId, 'removed');
  }

  // Handles reordering of documents in an ordered collection (new fragment: basic implementation).
  _repositionCollectionDocument({ collection: collectionName, id: documentId, before: beforeDocId }) {
    const targetCollection = this.localDataStore.get(collectionName);
    if (!targetCollection) {
      this._handleError('Document Reorder', `Collection '${collectionName}' not found for document ID '${documentId}'.`);
      return;
    }

    const repositionedDocument = targetCollection.get(documentId);
    if (!repositionedDocument) {
      this._handleError('Document Reorder', `Document ID '${documentId}' not found in collection '${collectionName}'.`);
      return;
    }

    // Note: A Map doesn't inherently support reordering. For true ordered collections,
    // a separate ordered list (e.g., Array) would need to be managed alongside the Map.
    // This implementation primarily notifies observers.
    console.debug(`DdpClient: Document '${documentId}' moved before '${beforeDocId}' in collection '${collectionName}'.`);
    this._notifyCollectionObservers(collectionName, repositionedDocument, documentId, 'moved');
  }

  // Notifies all registered observers for a specific collection about a change.
  _notifyCollectionObservers(collectionName, documentData, documentId, eventType) {
    // Create a deep copy of the document to ensure observers don't accidentally modify internal state.
    // structuredClone is a modern JS API for deep cloning.
    const documentPayload = structuredClone(documentData);
    documentPayload._id = documentId; // Attach the document ID for convenience.

    const observers = this.collectionObservers.get(collectionName);
    if (observers && observers.length > 0) {
      // Iterate over a shallow copy of the observers array to avoid issues if callbacks modify the array.
      [...observers].forEach(callback => {
        try {
          callback(documentPayload, eventType);
        } catch (e) {
          this._handleError('Observer Callback', `Error in observer for collection '${collectionName}': ${e.message}`);
        }
      });
    }
  }

  // Sends a DDP message over the WebSocket connection.
  _dispatchMessage(messagePayload) {
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      try {
        this.websocketConnection.send(JSON.stringify(messagePayload));
      } catch (e) {
        this._handleError('WebSocket Send', `Failed to send message: ${e.message}. Payload: ${JSON.stringify(messagePayload)}`);
      }
    } else {
      console.warn("DdpClient: WebSocket connection is not open. Message not sent:", messagePayload);
      // Depending on context, might want to queue messages or reject associated promises.
    }
  }

  // Generates a unique request identifier (private utility).
  static _generateRequestId = (() => {
    let sequenceCounter = 0;
    return () => (++sequenceCounter).toString();
  })();

  // Helper to send DDP messages that expect an asynchronous response (methods, subscriptions).
  _sendDdpRequest(messageType, operationName, parameters = []) {
    const requestId = DdpClient._generateRequestId();
    let resolveFn, rejectFn;
    const requestPromise = new Promise((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });

    this.pendingOperations.set(requestId, { resolve: resolveFn, reject: rejectFn });

    const messageObject = {
      msg: messageType,
      params: parameters,
      id: requestId
    };

    switch (messageType) {
      case 'method':
        messageObject.method = operationName;
        break;
      case 'sub':
        messageObject.name = operationName;
        this.activeSubscriptions.set(operationName, requestId);
        break;
      case 'unsub':
        // For unsubscribe, 'id' is the original subscription ID, not a new one.
        // The DDP protocol is a bit ambiguous here. We use the original sub ID in the message.
        // The promise for 'unsub' is managed separately later.
        messageObject.id = operationName; // Assuming operationName is the sub ID for 'unsub'
        break;
      default:
        this.pendingOperations.delete(requestId); // Clean up the pending promise
        return Promise.reject(new Error(`Unsupported DDP request type: ${messageType}`));
    }

    this._dispatchMessage(messageObject);
    return requestPromise;
  }

  // Public API: Invokes a remote DDP method.
  invokeMethod(methodIdentifier, methodArguments = []) {
    if (this.connectionState !== DdpClient.ConnectionStatus.CONNECTED) {
      return Promise.reject(new Error("Cannot invoke method: DDP client is not connected."));
    }
    return this._sendDdpRequest('method', methodIdentifier, methodArguments);
  }

  // Public API: Starts a DDP subscription.
  startSubscription(publicationName, subscriptionArguments = []) {
    if (this.connectionState !== DdpClient.ConnectionStatus.CONNECTED) {
      return Promise.reject(new Error("Cannot subscribe: DDP client is not connected."));
    }
    return this._sendDdpRequest('sub', publicationName, subscriptionArguments);
  }

  // Public API: Ends a DDP subscription.
  async endSubscription(publicationName) {
    if (this.connectionState !== DdpClient.ConnectionStatus.CONNECTED) {
      return Promise.reject(new Error("Cannot unsubscribe: DDP client is not connected."));
    }

    const subscriptionRequestId = this.activeSubscriptions.get(publicationName);
    if (!subscriptionRequestId) {
      return Promise.reject(new Error(`Subscription '${publicationName}' is not active.`));
    }

    // For unsubscribe, we generate a new promise to track the unsub request itself.
    // The original subscriptionRequestId promise might have already resolved.
    const unsubscribePromise = this._sendDdpRequest('unsub', subscriptionRequestId);

    this.activeSubscriptions.delete(publicationName); // Optimistically remove from active list.
    return unsubscribePromise;
  }

  // Public API: Registers a callback function to observe changes in a collection.
  onCollectionChange(collectionName, changeCallback) {
    if (typeof changeCallback !== 'function') {
      throw new TypeError("Change observer must be a function.");
    }
    let observers = this.collectionObservers.get(collectionName);
    if (!observers) {
      observers = [];
      this.collectionObservers.set(collectionName, observers);
    }
    observers.push(changeCallback);

    // New fragment: Return an unregister function for convenience.
    return () => {
      const index = observers.indexOf(changeCallback);
      if (index > -1) {
        observers.splice(index, 1);
      }
      if (observers.length === 0) {
        this.collectionObservers.delete(collectionName); // Clean up empty observer arrays.
      }
    };
  }

  // Public API: Retrieves a deep copy of a collection's current state.
  fetchCollectionSnapshot(collectionName) {
    const collectionMap = this.localDataStore.get(collectionName);
    if (!collectionMap) {
      return null;
    }
    // Convert Map to plain object and deep clone for immutability.
    return structuredClone(Object.fromEntries(collectionMap.entries()));
  }

  // Public API: Retrieves a deep copy of a specific document from a collection.
  fetchDocumentEntry(collectionName, documentId) {
    const collectionMap = this.localDataStore.get(collectionName);
    if (!collectionMap) {
      return null;
    }
    const document = collectionMap.get(documentId);
    if (!document) {
      return null;
    }
    // Deep clone the document.
    return structuredClone(document);
  }

  // Public API: Closes the WebSocket connection and cleans up client state.
  disconnect() {
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      this.connectionState = DdpClient.ConnectionStatus.CLOSING;
      this.websocketConnection.close();
      // onclose handler will perform further cleanup.
    } else {
      console.warn("DdpClient: No active WebSocket connection to close.");
      // Manually trigger cleanup if connection was never properly open but state is not DISCONNECTED.
      if (this.connectionState !== DdpClient.ConnectionStatus.DISCONNECTED) {
        this.connectionState = DdpClient.ConnectionStatus.DISCONNECTED;
        this.pendingOperations.forEach(deferred => deferred.reject("Connection explicitly closed."));
        this.pendingOperations.clear();
        this.activeSubscriptions.clear();
      }
    }
  }

  // Public API: Returns the current connection status (new fragment).
  getCurrentConnectionStatus() {
    return this.connectionState;
  }
}