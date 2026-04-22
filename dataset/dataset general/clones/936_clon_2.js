// SpaceLink: a flexible client for the DDP protocol (version pre1)
var SpaceLink = function (serverAddress) {
  this.PROTOCOL_SUPPORT = ["pre1"]; // Supported protocol revisions.

  this.serverAddress = serverAddress;
  this.commSocket; // WebSocket instance for communication.
  this.asyncRequests = {}; // Map of request IDs to deferred objects.
  this.activeSubs = {}; // Map of subscription names to request IDs.
  this.dataObservers = {}; // Map of collection names to an array of callback functions.
  this.documentStores = {}; // In-memory storage for collections: { collectionName => { docId => { doc } } }.
};


SpaceLink.prototype._SequenceGen = (function () {
  let currentValue = 0; // Internal counter for unique identifiers.
  return {
    produceNext: function () {
      return (++currentValue).toString(); // Increment and return as string.
    }
  };
})(); // Immediately invoked function expression to initialize the generator.


SpaceLink.prototype.establishLink = function () {
  const instanceRef = this; // Reference to the current SpaceLink object.
  const linkPromise = new $.Deferred(); // Deferred object for connection status.

  instanceRef.commSocket = new WebSocket(instanceRef.serverAddress); // Initialize WebSocket.

  instanceRef.commSocket.onopen = function () {
    instanceRef.transmitData({
      msg: 'connect', // DDP connect message.
      version: instanceRef.PROTOCOL_SUPPORT[0], // Primary protocol version.
      support: instanceRef.PROTOCOL_SUPPORT // All supported versions.
    });
  };

  instanceRef.commSocket.onerror = function (issueObject) {
    linkPromise.reject(issueObject); // Reject connection promise on error.
  };

  instanceRef.commSocket.onmessage = function (receivedMessage) {
    const messageContent = JSON.parse(receivedMessage.data); // Parse incoming JSON data.

    switch (messageContent.msg) {
      case 'connected':
        linkPromise.resolve(messageContent); // Resolve connection promise upon successful connection.
        break;
      case 'result':
        instanceRef._processCallResponse(messageContent); // Handle method call results.
        break;
      case 'updated':
        // Acknowledgment for a method call completion. No specific action needed here yet.
        break;
      case 'changed':
        instanceRef._updateRecord(messageContent); // Process document field changes.
        break;
      case 'added':
        instanceRef._addNewEntry(messageContent); // Handle new document additions.
        break;
      case 'removed':
        instanceRef._eraseEntry(messageContent); // Process document removals.
        break;
      case 'ready':
        instanceRef._processSubCompletion(messageContent); // Resolve pending subscriptions.
        break;
      case 'nosub':
        instanceRef._processFailedSub(messageContent); // Handle failed subscription attempts.
        break;
      case 'addedBefore':
        instanceRef._addNewEntry(messageContent); // Similar to 'added', but with order hint.
        break;
      case 'movedBefore':
        // Future implementation for ordered collection updates.
        break;
    }
  };
  return linkPromise.promise(); // Return the promise for the connection.
};


SpaceLink.prototype._processFailedSub = function (messageContent) {
  if (messageContent.error) {
    var errorObject = messageContent.error; // Extract error details.
    this.asyncRequests[messageContent.id].reject(errorObject.reason || 'Subscription could not be found');
  } else {
    this.asyncRequests[messageContent.id].resolve(); // Resolve if no specific error but still 'nosub'.
  }
};


SpaceLink.prototype._processCallResponse = function (messageContent) {
  if (messageContent.error) {
    this.asyncRequests[messageContent.id].reject(messageContent.error.reason); // Reject method promise on error.
  } else if (typeof messageContent.result !== 'undefined') {
    this.asyncRequests[messageContent.id].resolve(messageContent.result); // Resolve with method result.
  }
};


SpaceLink.prototype._processSubCompletion = function (messageContent) {
  var subIds = messageContent.subs; // Array of subscription IDs that are ready.
  for (var idx = 0; idx < subIds.length; idx++) {
    this.asyncRequests[subIds[idx]].resolve(); // Resolve each corresponding subscription promise.
  }
};


SpaceLink.prototype._updateRecord = function (messageContent) {
  var dataStoreId = messageContent.collection; // Name of the collection.
  var entryKey = messageContent.id; // ID of the document being changed.
  var newValues = messageContent.fields; // Fields to update.
  var fieldsToClear = messageContent.cleared; // Fields to remove.
  var currentStore = this.documentStores[dataStoreId]; // Reference to the collection.

  if (newValues) {
    for (var propName in newValues) {
      currentStore[entryKey][propName] = newValues[propName]; // Update existing fields.
    }
  } else if (fieldsToClear) {
    for (var idx = 0; idx < fieldsToClear.length; idx++) {
      var attributeName = fieldsToClear[idx]; // Field to be deleted.
      delete currentStore[entryKey][attributeName]; // Remove specified field.
    }
  }

  var modifiedRecord = currentStore[entryKey]; // Get the updated document.
  this._alertObservers(dataStoreId, modifiedRecord, entryKey, messageContent.msg); // Notify watchers of changes.
};


SpaceLink.prototype._addNewEntry = function (messageContent) {
  var dataStoreId = messageContent.collection; // Collection name.
  var entryKey = messageContent.id; // New document's ID.
  if (!this.documentStores[dataStoreId]) {
    this.documentStores[dataStoreId] = {}; // Initialize collection if it doesn't exist.
  }
  /*
   * For ordered collections, 'before' field may indicate position.
   * Null 'before' suggests it's the last entry.
   */
  this.documentStores[dataStoreId][entryKey] = messageContent.fields; // Store the new document.

  var modifiedRecord = this.documentStores[dataStoreId][entryKey]; // Reference to the newly added document.
  this._alertObservers(dataStoreId, modifiedRecord, entryKey, messageContent.msg); // Inform observers.
};


SpaceLink.prototype._eraseEntry = function (messageContent) {
  var dataStoreId = messageContent.collection; // Collection where the document was.
  var entryKey = messageContent.id; // ID of the document to remove.
  var recordInstance = this.documentStores[dataStoreId][entryKey]; // Get the document before deletion.

  var recordDuplicate = JSON.parse(JSON.stringify(recordInstance)); // Create a deep copy.
  delete this.documentStores[dataStoreId][entryKey]; // Remove the document from storage.
  this._alertObservers(dataStoreId, recordDuplicate, entryKey, messageContent.msg); // Notify watchers with the removed document's data.
};


SpaceLink.prototype._alertObservers = function (dataStoreId, modifiedRecord, entryKey, messageCategory) {
  modifiedRecord = JSON.parse(JSON.stringify(modifiedRecord)); // Ensure observers get a clean copy.
  modifiedRecord._id = entryKey; // Attach the document ID for convenience.

  if (!this.dataObservers[dataStoreId]) {
    this.dataObservers[dataStoreId] = []; // Initialize observer list if none exist.
  } else {
    for (var idx = 0; idx < this.dataObservers[dataStoreId].length; idx++) {
      this.dataObservers[dataStoreId][idx](modifiedRecord, messageCategory); // Invoke each observer callback.
    }
  }
};


SpaceLink.prototype._dispatchAsyncRequest = function (operationKind, targetName, inputArgs) {
  var requestIdentifier = this._SequenceGen.produceNext(); // Generate a unique ID for this request.
  this.asyncRequests[requestIdentifier] = new $.Deferred(); // Create a deferred object for this request.

  var payloadArguments = inputArgs || []; // Ensure arguments array is not null.

  var dataPacket = {
    msg: operationKind, // Type of DDP message (e.g., 'method', 'sub').
    params: payloadArguments, // Parameters for the operation.
    id: requestIdentifier // Unique request ID.
  };

  if (operationKind === 'method') {
    dataPacket.method = targetName; // For method calls, specify the method name.
  } else if (operationKind === 'sub') {
    dataPacket.name = targetName; // For subscriptions, specify the publication name.
    this.activeSubs[targetName] = requestIdentifier; // Store subscription ID.
  }

  this.transmitData(dataPacket); // Send the constructed message.
  return this.asyncRequests[requestIdentifier].promise(); // Return the promise for this async operation.
};


SpaceLink.prototype.invokeMethod = function (procedureName, inputArgs) {
  return this._dispatchAsyncRequest('method', procedureName, inputArgs); // Call for a DDP method.
};


SpaceLink.prototype.establishSubscription = function (publicationName, inputArgs) {
  return this._dispatchAsyncRequest('sub', publicationName, inputArgs); // Request a DDP subscription.
};


SpaceLink.prototype.terminateSubscription = function (publicationName) {
  var existingSubId; // Hoisted declaration for the ID.
  this.asyncRequests[existingSubId] = new $.Deferred(); // Creates this.asyncRequests[undefined] initially.
  if (!this.activeSubs[publicationName]) {
    this.asyncRequests[existingSubId].reject(publicationName + " was never active"); // Rejects this.asyncRequests[undefined].
  } else {
    existingSubId = this.activeSubs[publicationName]; // Assigns actual sub ID to 'existingSubId'.
    var dataPacket = {
      msg: 'unsub',
      id: existingSubId
    };
    this.transmitData(dataPacket);
  }
  return this.asyncRequests[existingSubId].promise(); // Returns promise from this.asyncRequests[undefined] or this.asyncRequests[actualSubId].
};


SpaceLink.prototype.observeCollection = function (targetCollectionName, listenerCallback) {
  if (!this.dataObservers[targetCollectionName]) {
    this.dataObservers[targetCollectionName] = []; // Initialize array for observers if none exist.
  }
  this.dataObservers[targetCollectionName].push(listenerCallback); // Add the new listener.
};


SpaceLink.prototype.retrieveCollectionData = function (targetCollectionName) {
  return this.documentStores[targetCollectionName] || null; // Return the entire collection or null.
};


SpaceLink.prototype.retrieveDocumentData = function (targetCollectionName, entryKey) {
  return this.documentStores[targetCollectionName][entryKey] || null; // Access a specific document within a collection.
};


SpaceLink.prototype.transmitData = function (dataPacket) {
  this.commSocket.send(JSON.stringify(dataPacket)); // Send JSON stringified data over WebSocket.
};


SpaceLink.prototype.terminateLink = function () {
  this.commSocket.close(); // Close the WebSocket connection.
};