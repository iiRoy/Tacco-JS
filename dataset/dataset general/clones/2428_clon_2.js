/*
 * @license $dataStorageProvider
 * (c) 2023 CodeForge Labs (webdev)
 * License: Apache-2.0
 */

'use strict';

angular.module('forge.dataStorage', []).provider('$dataStorage', function() {
    var configObj   = this;

    // Constants for IndexedDB transaction modes
    var DATA_VIEW       = "view_only";
    var DATA_ALTER      = "read_write_mode";
    var SCHEMA_UPDATE   = "schema_change";

    // Constants for IndexedDB cursor traversal
    var ASCEND          = "forward";
    var ASCEND_UNIQUE   = "forward_unique";
    var DESCEND         = "backward";
    var DESCEND_UNIQUE  = "backward_unique";

    // Predefined configuration variables for the data storage service
    configObj.storageName = '';
    configObj.storageSchemaVer = 1;
    configObj.storageInstance = null;
    configObj.storageReadyPromise = null;
    configObj.verboseLogging = false;

    // Customizable callback functions for storage operations
    configObj.onOperationSuccess = function(evt) {
        if(configObj.verboseLogging) console.log('Data operation completed.');
    };
    configObj.onOperationCancel = function(evt) {
        if(configObj.verboseLogging) console.log('Data operation aborted: '+ (evt.target.webkitErrorMessage || evt.target.error.message || evt.target.errorCode));
    };
    configObj.onOperationFailure = function(evt) {
        if(configObj.verboseLogging) console.log('Data operation failed: ' + evt.target.errorCode);
    };
    configObj.onStorageError = function(evt) {
        if(configObj.verboseLogging) alert("Storage system error: " + (evt.target.webkitErrorMessage || evt.target.errorCode));
    };
    configObj.onStorageLocked = function(evt) {
        // If another browser tab holds an open connection to the database, it must be closed.
        if(configObj.verboseLogging) alert("Data storage is currently locked. Please close other tabs running this application and refresh the page!");
    };

    /**
     * @ngdoc method
     * @name $dataStorageProvider.setStorage
     * @function
     *
     * @description
     * Configures the name of the IndexedDB database to be utilized.
     *
     * @param {string} databaseIdentifier The name of the database.
     * @returns {object} The provider instance for method chaining.
     */
    configObj.setStorage = function(databaseIdentifier) {
        configObj.storageName = databaseIdentifier;
        return this;
    };

    /**
     * @ngdoc method
     * @name $dataStorageProvider.updateSchema
     * @function
     *
     * @description
     * Specifies the new version number for the database schema and provides a callback
     * function to handle schema migration logic during an upgrade.
     *
     * @param {number} newSchemaVersion The target version number for the database.
     * @param {function} schemaUpgradeHandler The callback function executed during schema upgrade.
     * @returns {object} The provider instance for method chaining.
     */
    configObj.updateSchema = function(newSchemaVersion, schemaUpgradeHandler) {
        configObj.storageSchemaVer = newSchemaVersion;
        configObj.schemaUpgradeHandler = schemaUpgradeHandler;
        return this;
    };

    configObj.$get = ['$q', '$rootScope', '$window', function(asyncTaskHandler, appScope, globalWindow) {

        // Polyfill for IndexedDB across different browser implementations
        if(!('indexedDB' in globalWindow)) {
            globalWindow.indexedDB = globalWindow.mozIndexedDB || globalWindow.webkitIndexedDB || globalWindow.msIndexedDB;
        }

        // Polyfill for IDBKeyRange across different browser implementations
        var DataKeyRange = globalWindow.IDBKeyRange || globalWindow.mozIDBKeyRange || globalWindow.webkitIDBKeyRange || globalWindow.msIDBKeyRange;

        /**
         * @ngdoc object
         * @name standardLookupOpts
         * @function
         *
         * @description Optional parameters for cursor-based record retrieval operations:
         * - `useIndex`: Specifies an index to utilize for the query.
         * - `keyRange`: Defines the range of keys to iterate over.
         * - `direction`: Determines the order of traversal (e.g., ascending, descending).
         */
        var standardLookupOpts = {
            useIndex: undefined,
            keyRange: null,
            direction: ASCEND
        };

        /**
         * @ngdoc object
         * @name storageAccessPromise
         * @function
         *
         * @description Initiates the connection to the IndexedDB database, using the
         * name and version configured via `$dataStorageProvider.setStorage` and
         * `$dataStorageProvider.updateSchema`. Returns an Angular promise that
         * resolves once the connection is established.
         * @params
         * @returns {object} promise An Angular `$q.promise` for the database connection.
         */
        var storageAccessPromise = function() {
            var storageRequest, promiseDeferrer;

            if (!configObj.storageReadyPromise) {
                promiseDeferrer = asyncTaskHandler.defer();
                configObj.storageReadyPromise = promiseDeferrer.promise;

                storageRequest = globalWindow.indexedDB.open(configObj.storageName, configObj.storageSchemaVer || 1);
                storageRequest.onsuccess = function(event) {
                    configObj.storageInstance = storageRequest.result;
                    appScope.$apply(function(){
                        promiseDeferrer.resolve(configObj.storageInstance);
                    });
                };
                storageRequest.onblocked = configObj.onStorageLocked;
                storageRequest.onerror = configObj.onStorageError;
                storageRequest.onupgradeneeded = function(event) {
                    var currentStorage = event.target.result, currentOperation = event.target.transaction;
                    if(configObj.verboseLogging) console.log('Upgrading data storage "' + currentStorage.name + '" from version ' + event.oldVersion+
                        ' to version ' + event.newVersion + '...');
                    configObj.schemaUpgradeHandler && configObj.schemaUpgradeHandler(event, currentStorage, currentOperation);
                };
            }

            return configObj.storageReadyPromise;
        };

        /**
         * @ngdoc object
         * @name DataObjectStore
         * @function
         *
         * @description A wrapper class for IndexedDB's IDBObjectStore, providing
         * simplified interaction methods.
         *
         * @params {string} collectionIdentifier The name of the object store (collection).
         */
        var DataObjectStore = function(collectionIdentifier) {
            this.collectionName = collectionIdentifier;
            this.dataOperation = undefined;
        };

        DataObjectStore.prototype = {
            /**
             * @ngdoc method
             * @name DataObjectStore.getInternalCollection
             * @function
             *
             * @description Internal method to retrieve an IDBObjectStore instance
             * with the specified transaction mode.
             *
             * @params {string} collectionIdentifier The name of the object store.
             * @params {string} mode The transaction mode (e.g., 'view_only', 'read_write_mode').
             * @returns {object} An Angular promise resolving to the IDBObjectStore.
             */
            getInternalCollection: function(collectionIdentifier, mode) {
                var currentScope = this;
                return storageAccessPromise().then(function(currentStorage){
                    currentScope.dataOperation = currentStorage.transaction([collectionIdentifier], mode || DATA_VIEW);
                    currentScope.dataOperation.oncomplete = configObj.onOperationSuccess;
                    currentScope.dataOperation.onabort = configObj.onOperationCancel;
                    currentScope.onerror = configObj.onOperationFailure;

                    return currentScope.dataOperation.objectStore(collectionIdentifier);
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.cancelOperation
             * @function
             *
             * @description Aborts the currently active IndexedDB transaction for this object store.
             */
            "cancelOperation": function() {
                if (this.dataOperation) {
                    this.dataOperation.abort();
                }
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.addRecords
             * @function
             *
             * @description Wrapper for IDBObjectStore.add. Inserts new data into the object store.
             * Accepts either a single object or an array of objects for bulk insertion.
             *
             * @params {object|array} inputData The data to be added.
             * @returns {object} An Angular promise indicating the success or failure of the operation.
             */
            "addRecords": function(inputData){
                var promiseDeferrer = asyncTaskHandler.defer();
                return this.getInternalCollection(this.collectionName, DATA_ALTER).then(function(currentCollection){
                    var req;
                    if (angular.isArray(inputData)) {
                        inputData.forEach(function(itemRecord, index){
                            req = currentCollection.add(itemRecord);
                            req.onnotify = function(event) {
                               appScope.$apply(function(){
                                    promiseDeferrer.notify(event.target.result);
                                });
                            }
                            req.onerror = function(event) {
                                appScope.$apply(function(){
                                    promiseDeferrer.reject(event.target.result);
                                });
                            };
                            req.onsuccess = function(event) {
                                if(index === inputData.length - 1) {
                                    appScope.$apply(function(){
                                        promiseDeferrer.resolve(event.target.result);
                                    });
                                }
                            };
                        });
                    } else {
                        req = currentCollection.add(inputData);
                        req.onsuccess = req.onerror = function(event) {
                            appScope.$apply(function(){
                                promiseDeferrer.resolve(event.target.result);
                            });
                        };
                    }
                    return promiseDeferrer.promise;
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.saveRecords
             * @function
             *
             * @description Wrapper for IDBObjectStore.put. Modifies existing records
             * or inserts new ones if they don't already exist.
             * Accepts a single object or an array of objects for bulk operations.
             *
             * @params {object|array} inputData The data to be saved or updated.
             * @returns {object} An Angular promise indicating the operation's outcome.
             */
            "saveRecords": function(inputData){
                var promiseDeferrer = asyncTaskHandler.defer();
                return this.getInternalCollection(this.collectionName, DATA_ALTER).then(function(currentCollection){
                    var req;
                    if (angular.isArray(inputData)) {
                        inputData.forEach(function(itemRecord, index){
                            req = currentCollection.put(itemRecord);
                            req.onnotify = function(event) {
                               appScope.$apply(function(){
                                    promiseDeferrer.notify(event.target.result);
                                });
                            }
                            req.onerror = function(event) {
                                appScope.$apply(function(){
                                    promiseDeferrer.reject(event.target.result);
                                });
                            };
                            req.onsuccess = function(event) {
                                if(index === inputData.length - 1) {
                                    appScope.$apply(function(){
                                        promiseDeferrer.resolve(event.target.result);
                                    });
                                }
                            };
                        });
                    } else {
                        req = currentCollection.put(inputData);
                        req.onsuccess = req.onerror = function(event) {
                            appScope.$apply(function(){
                                promiseDeferrer.resolve(event.target.result);
                            });
                        };
                    }
                    return promiseDeferrer.promise;
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.removeRecord
             * @function
             *
             * @description Wrapper for IDBObjectStore.delete. Removes a record
             * identified by its primary key.
             *
             * @params {any} recordKey The primary key of the record to delete.
             * @returns {object} An Angular promise for the deletion operation.
             */
            "removeRecord": function(recordKey) {
                var promiseDeferrer = asyncTaskHandler.defer();
                return this.getInternalCollection(this.collectionName, DATA_ALTER).then(function(currentCollection){
                    var req = currentCollection.delete(recordKey);
                    req.onsuccess = req.onerror = function(event) {
                        appScope.$apply(function(){
                            promiseDeferrer.resolve(event.target.result);
                        });
                    };
                    return promiseDeferrer.promise;
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.emptyCollection
             * @function
             *
             * @description Wrapper for IDBObjectStore.clear. Deletes all records
             * within the object store.
             *
             * @returns {object} An Angular promise for the clear operation.
             */
            "emptyCollection": function() {
                var promiseDeferrer = asyncTaskHandler.defer();
                return this.getInternalCollection(this.collectionName, DATA_ALTER).then(function(currentCollection){
                    var req = currentCollection.clear();
                    req.onsuccess = req.onerror = function(event) {
                        appScope.$apply(function(){
                            promiseDeferrer.resolve(event.target.result);
                        });
                    };
                    return promiseDeferrer.promise;
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.countRecords
             * @function
             *
             * @description Wrapper for IDBObjectStore.count. Returns the total
             * number of records in the object store, wrapped in a promise.
             *
             * @returns {object} An Angular promise resolving to the count of records.
             */
            "countRecords": function() {
                return this.getInternalCollection(this.collectionName, DATA_VIEW).then(function(currentCollection){
                    return currentCollection.count();
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.retrieveRecord
             * @function
             *
             * @description Wrapper for IDBObjectStore.get and IDBIndex.get.
             * Retrieves a single record using its primary key or an index key.
             *
             * @params {any} keyOrIndexId The primary key or the name of an index.
             * @params {any} keyForIndex (Optional) The key value to search within the specified index.
             * @returns {any} The retrieved record, wrapped in an Angular promise.
             */
            "retrieveRecord": function(keyOrIndexId, keyForIndex){
                var promiseDeferrer = asyncTaskHandler.defer();
                var resultingPromise = promiseDeferrer.promise;
                return this.getInternalCollection(this.collectionName, DATA_VIEW).then(function(currentCollection){
                    var req;

                    if(keyForIndex) {
                        req = currentCollection.index(keyOrIndexId).get(keyForIndex);
                    } else {
                        req = currentCollection.get(keyOrIndexId);
                    }
                    req.onsuccess = req.onerror = function(event) {
                        appScope.$apply(function(){
                            promiseDeferrer.resolve(event.target.result);
                        });
                    };
                    return resultingPromise;
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.fetchAllRecords
             * @function
             *
             * @description Wrapper for IDBObjectStore.getAll (if available) or a cursor-based
             * shim. Retrieves all records from the object store.
             *
             * @returns {array} An array of all records, wrapped in an Angular promise.
             */
            "fetchAllRecords": function() {
                var collectedResults = [], promiseDeferrer = asyncTaskHandler.defer();
                return this.getInternalCollection(this.collectionName, DATA_VIEW).then(function(currentCollection){
                    var req;
                    if (currentCollection.getAll) {
                        req = currentCollection.getAll();
                        req.onsuccess = req.onerror = function(event) {
                            appScope.$apply(function(){
                                promiseDeferrer.resolve(event.target.result);
                            });
                        };
                    } else {
                        req = currentCollection.openCursor();
                        req.onsuccess = function(event) {
                            var recordCursor = event.target.result;
                            if(recordCursor){
                                collectedResults.push(recordCursor.value);
                                recordCursor.continue();
                            } else {
                                appScope.$apply(function(){
                                    promiseDeferrer.resolve(collectedResults);
                                });
                            }
                        };
                        req.onerror = function(event) {
                            promiseDeferrer.reject(event.target.result);
                        };
                    }
                    return promiseDeferrer.promise;
                });
            },

            /**
             * @ngdoc method
             * @name DataObjectStore.iterateRecords
             * @function
             *
             * @description Wrapper for IDBObjectStore.openCursor or IDBIndex.openCursor.
             * Returns a promise that resolves when the cursor iteration completes.
             * A provided callback function is invoked for each record encountered by the cursor.
             * See: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#Using_a_cursor
             *
             * @params {Function} processCallback The function to execute for each cursor item.
             * @params {object} cursorOptions Optional query parameters; refer to `standardLookupOpts`
             * and `SearchQueryBuilder` for available configurations.
             * @returns {object} An Angular promise resolving upon cursor completion.
             */
            "iterateRecords": function(processCallback, cursorOptions){
                var promiseDeferrer = asyncTaskHandler.defer();
                return this.getInternalCollection(this.collectionName, DATA_ALTER).then(function(currentCollection){
                   var req;
                   cursorOptions = cursorOptions || standardLookupOpts;
                   if(cursorOptions.useIndex) {
                        req = currentCollection.index(cursorOptions.useIndex).openCursor(cursorOptions.keyRange, cursorOptions.direction);
                    } else {
                        req = currentCollection.openCursor(cursorOptions.keyRange, cursorOptions.direction);
                    }
                    req.onsuccess = req.onerror = function(event) {
                        appScope.$apply(function(){
                            if(!event.target.result){
                                promiseDeferrer.resolve(event.target.result);
                            }
                            processCallback(event.target.result);
                        });
                    };
                    return promiseDeferrer.promise;
                });
            }
        };

        /**
         * @ngdoc object
         * @name SearchQueryBuilder
         * @function
         *
         * @description A utility class designed to facilitate the creation of
         * IDBKeyRange objects for IndexedDB cursor queries.
         */
        var SearchQueryBuilder = function() {
            this.queryParameters = standardLookupOpts;
        };

        SearchQueryBuilder.prototype = {
            /**
             * @ngdoc method
             * @name SearchQueryBuilder.lessThan
             * @function
             *
             * @description Sets an exclusive upper bound for the key range (e.g., key < value).
             *
             * @params {any} boundaryValue The upper boundary value.
             * @returns {object} The QueryBuilder instance for method chaining.
             */
            "lessThan": function(boundaryValue) {
                this.queryParameters.keyRange = DataKeyRange.upperBound(boundaryValue, true);
                return this;
            },

            /**
             * @ngdoc method
             * @name SearchQueryBuilder.greaterThan
             * @function
             *
             * @description Sets an exclusive lower bound for the key range (e.g., key > value).
             *
             * @params {any} boundaryValue The lower boundary value.
             * @returns {object} The QueryBuilder instance for method chaining.
             */
            "greaterThan": function(boundaryValue) {
                this.queryParameters.keyRange = DataKeyRange.lowerBound(boundaryValue, true);
                return this;
            },

            /**
             * @ngdoc method
             * @name SearchQueryBuilder.lessThanOrEqual
             * @function
             *
             * @description Sets an inclusive upper bound for the key range (e.g., key <= value).
             *
             * @params {any} boundaryValue The upper boundary value.
             * @returns {object} The QueryBuilder instance for method chaining.
             */
        };
    }];
});