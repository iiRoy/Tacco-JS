var persistenceManager = function (resourceUri) {
    // Initialize the data persistence manager with a remote endpoint.
    this.initialize(resourceUri);
};

persistenceManager.prototype = {
    /**
     * Sets up the local storage engine and the remote resource endpoint.
     * @param {string} resourceUriParam The base URL for remote operations.
     */
    initialize: function (resourceUriParam) {
        this.storageEngine = new Lawnchair('localDataStore'); // Instantiate local storage.
        this.resourceEndpoint = resourceUriParam; // Store the remote endpoint.
    },

    /**
     * Retrieves an item from local storage by its identifier.
     * @param {string} recordIdentifier The unique key of the record.
     * @param {function} onCompletion Callback function to execute after retrieval.
     */
    retrieve: function (recordIdentifier, onCompletion) {
        this.storageEngine.get(recordIdentifier, onCompletion);
    },

    /**
     * Removes a specific entry from local storage.
     * @param {string} recordIdentifierToRemove The key of the record to remove.
     * @param {function} onOperationComplete Callback after removal.
     */
    clearEntry: function (recordIdentifierToRemove, onOperationComplete) {
        this.storageEngine.remove(recordIdentifierToRemove, onOperationComplete);
    },

    /**
     * Wipes out all data from the local storage.
     * @param {function} completionCallback Callback after nuke operation.
     * @returns {object} The current instance of the persistence manager.
     */
    eraseAll: function (completionCallback) {
        this.storageEngine.nuke(completionCallback);
        return this;
    },

    /**
     * Marks an existing record as 'removed' in local storage, rather than physically deleting it.
     * @param {string} itemKeyToDelete The key of the item to mark for deletion.
     * @param {function} finalCallback Callback after the item is marked.
     */
    markForDeletion: function (itemKeyToDelete, finalCallback) {
        var selfReference = this; // Capture 'this' for use in the callback.
        this.storageEngine.get(itemKeyToDelete, function (retrievedItem) {
            // Save the item with an updated status.
            selfReference.storageEngine.save({'identifier': retrievedItem.identifier, 'content': retrievedItem.content, 'status': "removed"}, finalCallback);
        });
    },

    /**
     * Generates a unique identifier for a data object.
     * @param {object} dataObjectParameter The object containing primary ID and entity type.
     * @returns {string} The generated unique identifier.
     */
    generateIdentifier: function (dataObjectParameter) {
        var primaryIdentifier = dataObjectParameter.primaryId + '.' + dataObjectParameter.entityType;
        return primaryIdentifier;
    },

    /**
     * Stores a new record in the local cache with a 'new' status.
     * @param {object} newObject The data object to create.
     * @param {function} completionHandler Callback after creation.
     */
    generateRecord: function (newObject, completionHandler) {
        this.storageEngine.save({'identifier': this.generateIdentifier(newObject), 'content': newObject, 'status': 'new'}, completionHandler);
    },

    /**
     * Updates an existing record and marks its status as 'changed'.
     * @param {object} modifiedObject The data object to update.
     * @param {function} actionComplete Callback after update.
     */
    modifyRecord: function (modifiedObject, actionComplete) {
        modifiedObject.status = "changed"; // Update the status directly.
        this.storageEngine.save(modifiedObject, actionComplete);
    },

    /**
     * Queries records from local storage based on a given condition.
     * @param {string} searchCriteria The condition string for filtering.
     * @param {function} resultHandler Callback with the query results.
     */
    queryRecords: function (searchCriteria, resultHandler) {
        this.storageEngine.find(searchCriteria, resultHandler);
    },

    /**
     * Retrieves all records marked as 'new'.
     * @param {function} handler Callback with new records.
     */
    getNewRecords: function (handler) {
        this.storageEngine.find('item.status == "new"', handler);
    },

    /**
     * Retrieves all records marked as 'changed'.
     * @param {function} handler Callback with modified records.
     */
    getModifiedRecords: function (handler) {
        this.storageEngine.find('item.status == "changed"', handler);
    },

    /**
     * Retrieves all records marked as 'removed'.
     * @param {function} handler Callback with removed records.
     */
    getRemovedRecords: function (handler) {
        this.storageEngine.find('item.status == "removed"', handler);
    },

    /**
     * Retrieves all records marked as 'synchronized'.
     * @param {function} handler Callback with synchronized records.
     */
    getSynchronizedRecords: function (handler) {
        this.storageEngine.find('item.status == "synchronized"', handler);
    },

    /**
     * Iterates over all records in the local store.
     * @param {function} itemProcessor Callback function for each record.
     */
    iterateRecords: function (itemProcessor) {
        this.storageEngine.each(itemProcessor);
    },

    /**
     * Fetches data from a remote endpoint and synchronizes it with local storage.
     * @param {function} operationCompletion Callback after all remote items are processed.
     */
    fetchRemoteData: function (operationCompletion) {
        var selfReference = this; // Reference to the current object.
        var remoteUri = this.resourceEndpoint + '/fetch/'; // Construct the remote fetch URL.

        // Perform an AJAX GET request to retrieve remote items.
        jQuery.getJSON(remoteUri, function (remoteItems) {
            // Iterate through each item received from the server.
            jQuery(remoteItems).each(function (itemIndex) {
                var currentItem = remoteItems[itemIndex];
                var generatedKey = selfReference.generateIdentifier(currentItem);

                // Check if the item already exists in local storage.
                selfReference.storageEngine.get(generatedKey, function (alreadyPresent) {
                    if (alreadyPresent) {
                        // If it exists, update its content and mark it as synchronized.
                        selfReference.storageEngine.save({'identifier': generatedKey, 'content': currentItem, 'status': 'synchronized'}, operationCompletion);
                    } else {
                        // If it's a new item, create a new record locally.
                        selfReference.generateRecord(currentItem, operationCompletion);
                    }
                });
            });
        });
    },

    /**
     * Sends a delete request for a specific data object to the remote server.
     * @param {object} dataObjectToRemove The object containing the primary ID to delete.
     * @param {function} successHandler Callback upon successful remote deletion.
     */
    sendDeleteRequest: function (dataObjectToRemove, successHandler) {
        var deleteEndpoint = this.resourceEndpoint + '/destroy/'; // Construct the remote delete URL.

        // Perform an AJAX POST request for deletion.
        jQuery.ajax({
            requestType: 'POST',
            requestUrl: deleteEndpoint,
            onSuccess: successHandler,
            postData: {
                "primaryId": dataObjectToRemove.payload.primaryId,
            },
        });
    },

    /**
     * Transmits a data object to the remote server for saving and updates its local status.
     * @param {object} dataObjectToStore The object to save remotely.
     * @param {function} successHandler Callback upon successful remote save.
     */
    sendSaveRequest: function (dataObjectToStore, successHandler) {
        var saveEndpoint = this.resourceEndpoint + '/commit/'; // Construct the remote save URL.

        // Execute an AJAX POST operation to save the data.
        jQuery.ajax({
            requestType: 'POST',
            requestUrl: saveEndpoint,
            onSuccess: successHandler,
            postData: {
                "primaryId": dataObjectToStore.payload.primaryId,
                "content": this.storageEngine.adaptor.serialize(dataObjectToStore.payload.attributes)
            },
        });

        // Mark the object as synchronized locally after sending to the server.
        dataObjectToStore.status = "synchronized";
        this.storageEngine.save(dataObjectToStore);
    }
};