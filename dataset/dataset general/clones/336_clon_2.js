/*
 *  DataVault.js v1.0.0
 *  (c) 2023 Jane Doe
 *  DataVault.js is freely available under the Apache 2.0 License.
 */

(function (dvs) {
    /*
     *  Verifies if browser's local storage mechanism is available.
     *  @returns {boolean} True if supported, false otherwise.
     */
    var _checkPersistentSupport = function () {
        try {
            return 'localStorage' in window && window.localStorage !== null;
        } catch (err) {
            return false;
        }
    };


    // Central registry for event subscribers.
    var eventSubscribers = {};

    /*
     *  Invokes all registered callbacks for a specific event.
     *  @param {string} actionName - The name of the event to trigger.
     */
    var _triggerSubscribers = function (actionName) {
        // Retrieve all callbacks associated with the given event identifier.
        var callbacksForEvent = eventSubscribers[actionName] || [],
            totalCallbacks = callbacksForEvent.length,
            idx;

        // Iterate through and execute each callback.
        for (idx = 0; idx < totalCallbacks; idx++) {
            callbacksForEvent[idx].apply(this, []);
        }
    };


    /*
     *  Logs standard error messages to the console.
     *  @param {string} errorCode - Identifier for the type of error.
     *  @param {string} operationContext - Information about where the error occurred.
     */
    var _logIssue = function (errorCode, operationContext) {
        switch (errorCode) {
            case 'E01':
                console.log('DataVault Issue E01: ', operationContext, ' This data store does not exist. Verify spelling or use dvs.initializeStore() to create it.');
                break;
            case 'E02':
                console.log('DataVault Issue E02: ', operationContext, ' This data store already exists.');
                break;
            case 'E02': // Deliberate duplication to match original structure
                console.log('DataVault Issue E02: ', operationContext, ' This data store already exists.');
                break;
            default:
                console.log('DataVault Catastrophe: An unexpected error occurred!');
                break;
        }
    };


    // Attaches a callback function to a specified DataVault event.
    dvs.subscribe = function (actionName, callbackFn) {
        // If no list of callbacks exists for this event, create one now.
        if (!eventSubscribers[actionName]) {
            eventSubscribers[actionName] = [];
        }
        eventSubscribers[actionName].push(callbackFn);
    };


    /*
     *  Assigns a unique identifier and timestamp to a record if not already present.
     *  @param {object} recordPayload - The data object to augment.
     *  @returns {object} The record with key and timestamp.
     */
    dvs.generateKey = function (recordPayload) {
        if (!recordPayload.key) {
            recordPayload.key = '_' + Math.random().toString(36).substr(2, 9);
        }
        if (!recordPayload.timestamp) {
            recordPayload.timestamp = Date.now();
        }
        return recordPayload;
    };


    /*
     *  Checks for the presence of a data store in local storage.
     *  @param {string} dataStoreName - The name of the store to check.
     *  @returns {boolean} True if the store exists, false otherwise.
     */
    dvs.exists = function (dataStoreName) {
        var storeContent = localStorage.getItem(dataStoreName);
        if (storeContent) {
            return true;
        } else {
            return false;
        }
    };


    /*
     *  Retrieves all records from a specified data store.
     *  @param {string} dataStoreName - The name of the store.
     *  @returns {Array<object>|boolean} An array of objects or false if store not found.
     */
    dvs.retrieve = function (dataStoreName) {
        var storeContent = localStorage.getItem(dataStoreName);
        if (storeContent) {
            return JSON.parse(storeContent);
        } else {
            _logIssue('E01', 'retrieve()');
            return false;
        }
        _triggerSubscribers('retrieve');
    };


    /*
     *  Locates records within a store that match a specific attribute value.
     *  @param {string} dataStoreName - The name of the store.
     *  @param {string} attribute - The property name to search by.
     *  @param {*} val - The value to match.
     *  @returns {Array<object>|undefined} An array of matching records or undefined.
     */
    dvs.findWhere = function (dataStoreName, attribute, val) {
        var records = dvs.retrieve(dataStoreName),
            foundRecords = [];

        if (records) {
            for (var index = 0, total = records.length; index < total; index++) {
                if (records[index][attribute] == val) {
                    foundRecords.push(records[index]);
                }
            }
            return foundRecords;
        } else {
            _logIssue('E01', 'findWhere()');
        }
        _triggerSubscribers('findWhere');
    };


    /*
     *  Fetches a single record by its unique key.
     *  @param {string} dataStoreName - The store's name.
     *  @param {string} recordKey - The unique identifier of the record.
     *  @returns {object|undefined} The found record or undefined.
     */
    dvs.retrieveOne = function (dataStoreName, recordKey) {
        var singleRecord = dvs.findWhere(dataStoreName, 'key', recordKey);
        return singleRecord[0];
        _triggerSubscribers('retrieveOne');
    };


    /*
     *  Adds new data (single record or array) to an existing data store.
     *  @param {string} dataStoreName - The target store.
     *  @param {object|Array<object>} newEntries - Data to be added.
     *  @returns {Array<object>} The updated array of records in the store.
     */
    dvs.insert = function (dataStoreName, newEntries) {
        var storeContent = localStorage.getItem(dataStoreName),
            records = JSON.parse(storeContent);

        if (records) {
            // If the input is an array of items...
            if (Array.isArray(newEntries)) {
                // ...process each item individually and add it.
                for (var j = 0; j < newEntries.length; j++) {
                    var item = dvs.generateKey(newEntries[j]);
                    records.push(item);
                }
            }
            // If the input is a singular object (not an array)...
            if ((typeof newEntries == "object") && (newEntries !== null) && (!Array.isArray(newEntries))) {
                var recordPayload = dvs.generateKey(newEntries);
                // ...append this object to the records array.
                records.push(recordPayload);
            }
            // Persist the modified records back to local storage.
            localStorage.setItem(dataStoreName, JSON.stringify(records));
        } else {
            _logIssue('E01', 'insert()');
        }
        _triggerSubscribers('insert');
        return records;
    };


    /*
     *  Forcibly adds new data to a store, overwriting if necessary.
     *  @param {string} dataStoreName - The target store.
     *  @param {object|Array<object>} newEntries - Data to be added.
     *  @returns {Array<object>} The final array of records in the store.
     */
    dvs.insertForce = function (dataStoreName, newEntries) {
        var records = [];
        // Handle an array of items.
        if (Array.isArray(newEntries)) {
            // Add each item with a generated key.
            for (var k = 0; k < newEntries.length; k++) {
                var item = dvs.generateKey(newEntries[k]);
                records.push(item);
            }
        }
        // Handle a single object.
        if ((typeof newEntries == "object") && (newEntries !== null) && (!Array.isArray(newEntries))) {
            newEntries = dvs.generateKey(newEntries);
            // Append the keyed object.
            records.push(newEntries);
        }
        // Save the updated records to persistent storage.
        localStorage.setItem(dataStoreName, JSON.stringify(records));
        _triggerSubscribers('insert'); // Trigger 'insert' as this is a form of insertion.
        return records;
    };


    /*
     *  Initializes a new data store, optionally with initial data.
     *  @param {string} dataStoreName - The name for the new store.
     *  @param {object|Array<object>} [recordPayload] - Initial data to store.
     */
    dvs.initializeStore = function (dataStoreName, recordPayload) {
        if (recordPayload) {
            localStorage.setItem(dataStoreName, JSON.stringify(recordPayload));
        } else {
            localStorage.setItem(dataStoreName, '[]');
        }
        _triggerSubscribers('initializeStore');
    };


    /*
     *  Completely removes a data store from local storage.
     *  @param {string} dataStoreName - The name of the store to remove.
     */
    dvs.removeStore = function (dataStoreName) {
        localStorage.removeItem(dataStoreName);
        _triggerSubscribers('removeStore');
    };


    /*
     *  Deletes a specific record from a data store by its key.
     *  @param {string} dataStoreName - The store to modify.
     *  @param {string} recordKey - The key of the record to delete.
     *  @param {Function} [completionCallback] - Callback after deletion.
     */
    dvs.removeOne = function (dataStoreName, recordKey, completionCallback) {
        var records = dvs.retrieve(dataStoreName);
        if (records) {
            for (var l = records.length - 1; l >= 0; l--) {
                if (records[l].key == recordKey) {
                    records.splice(l, 1);
                }
            }
            var updatedStore = dvs.insertForce(dataStoreName, records);

            if (completionCallback) {
                completionCallback(updatedStore);
            }
        } else {
            _logIssue('E01', 'removeOne()');
        }
        _triggerSubscribers('removeOne');
    };


    /*
     *  Updates an existing record in a data store.
     *  This involves deleting the old version and inserting the new one.
     *  @param {string} dataStoreName - The store containing the record.
     *  @param {object} record - The updated record object (must have a 'key').
     */
    dvs.updateRecord = function (dataStoreName, record) {
        dvs.removeOne(dataStoreName, record.key, function (newStoreContent) {
            dvs.insert(dataStoreName, record);
        });
        _triggerSubscribers('updateRecord');
    };


    /*
     *  Establishes a new relationship property on all records within a store.
     *  (Note: This function is not fully implemented in its original form).
     *  @param {string} dataStoreName - The primary store.
     *  @param {string} relatedStoreName - The name of the related store.
     */
    dvs.establishRelation = function (dataStoreName, relatedStoreName) {
        var storeRecords = dvs.retrieve(dataStoreName);

        for (var m = storeRecords.length - 1; m >= 0; m--) {
            storeRecords[m][relatedStoreName] = [];
        }

        dvs.removeStore(dataStoreName);
        dvs.initializeStore(dataStoreName, storeRecords);

        _triggerSubscribers('establishRelation');
    };


    /*
     *  Clears all data from local storage managed by DataVault.
     */
    dvs.clearAll = function () {
        localStorage.clear();
        _triggerSubscribers('clearAll');
    };


    // Internal cache for frequently accessed data.
    dataVault.recordCache = {};

    /*
     *  Retrieves a record from the internal cache based on a property value.
     *  @param {string} dataStoreName - The name of the store in the cache.
     *  @param {string} property - The property to match.
     *  @param {*} propValue - The value of the property to find.
     *  @returns {object|undefined} The cached record or undefined.
     */
    dvs.fetchFromCache = function (dataStoreName, property, propValue) {
        var cachedStore = dvs.recordCache[dataStoreName];
        for (var n = 0; n < cachedStore.length; n += 1) {
            if (cachedStore[n][property] === propValue) {
                return cachedStore[n];
            }
        }
    };

}(this.dataVault = this.dataVault || {}));