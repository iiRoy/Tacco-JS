'use strict';

// This module provides a robust wrapper for IndexedDB operations within an AngularJS application.
// It simplifies database interactions, schema management, and data manipulation,
// abstracting away the complexities of the IndexedDB API.
//
// Original Author: Clemens Capitain (webcss)
// License: MIT - Adapted for enhanced functionality and structural variations.

angular.module('az.dataStore', []).provider('$dbAccess', function() {
    // Internal configuration object for the data store service.
    // These values can be customized during the Angular application's configuration phase.
    const serviceConfiguration = this;

    // Transactional operation modes for IndexedDB.
    const MODE_READ_ONLY        = "readonly";
    const MODE_WRITE_ONLY       = "readwrite";
    const MODE_SCHEMA_UPDATE    = "versionchange";

    // Cursor traversal directives.
    const CURSOR_FORWARD        = "next";
    const CURSOR_FORWARD_UNIQUE = "nextunique";
    const CURSOR_BACKWARD       = "prev";
    const CURSOR_BACKWARD_UNIQUE= "prevunique";

    // Default settings for the database connection.
    serviceConfiguration.databaseIdentifier = '';
    serviceConfiguration.schemaVersion = 1;
    serviceConfiguration.activeDbInstance = null;
    serviceConfiguration.connectionPromise = null;
    serviceConfiguration.enableLogging = false; // Controls internal console output.

    // A simple internal logging utility.
    const _log = (message, ...args) => {
        if (serviceConfiguration.enableLogging) {
            console.log(`[DB Access]: ${message}`, ...args);
        }
    };

    // Callback functions for various IndexedDB events.
    // These can be overridden by the consumer.
    serviceConfiguration.onTransactionSuccess = (event) => {
        _log('Transaction completed successfully.');
    };
    serviceConfiguration.onTransactionAborted = (event) => {
        const errorMsg = event.target?.error?.message || event.target?.errorCode || 'Unknown reason';
        _log(`Transaction aborted: ${errorMsg}`);
    };
    serviceConfiguration.onTransactionFailure = (event) => {
        const errorMsg = event.target?.error?.message || event.target?.errorCode || 'Unknown reason';
        _log(`Transaction failed: ${errorMsg}`);
    };
    serviceConfiguration.onDatabaseFailure = (event) => {
        const errorMsg = event.target?.error?.message || event.target?.errorCode || 'Unknown reason';
        alert(`Database error encountered: ${errorMsg}`);
    };
    serviceConfiguration.onDatabaseBlocked = (event) => {
        // This event occurs when a database upgrade is needed but other connections are open.
        alert("Database connection blocked. Please close other application tabs and reload.");
    };

    /**
     * @ngdoc method
     * @name $dbAccessProvider.setDatabase
     * @param {string} nameOfDatabase The name of the IndexedDB database to connect to.
     * @returns {object} The provider instance for chaining.
     * @description Configures the name of the database to be used by the service.
     */
    serviceConfiguration.setDatabase = function(nameOfDatabase) {
        if (typeof nameOfDatabase !== 'string' || nameOfDatabase.trim() === '') {
            console.error("Invalid database name provided.");
            return this;
        }
        serviceConfiguration.databaseIdentifier = nameOfDatabase;
        return this;
    };

    /**
     * @ngdoc method
     * @name $dbAccessProvider.configureSchemaUpdate
     * @param {number} newSchemaVersion The new version number for the database schema.
     * @param {function} schemaUpgradeHandler A callback function for handling schema upgrades.
     * @returns {object} The provider instance for chaining.
     * @description Specifies the database version and a callback for schema migration logic.
     */
    serviceConfiguration.configureSchemaUpdate = function(newSchemaVersion, schemaUpgradeHandler) {
        if (typeof newSchemaVersion !== 'number' || newSchemaVersion <= 0) {
            console.error("Invalid schema version provided. Must be a positive number.");
            return this;
        }
        if (typeof schemaUpgradeHandler !== 'function') {
            console.error("Schema upgrade handler must be a function.");
            return this;
        }
        serviceConfiguration.schemaVersion = newSchemaVersion;
        serviceConfiguration.schemaUpgradeCallback = schemaUpgradeHandler;
        return this;
    };

    // The actual service factory function.
    serviceConfiguration.$get = ['$q', '$rootScope', '$window', function($q, $rootScope, $window) {

        // Ensure IndexedDB API is available, providing vendor prefixes if necessary.
        if (!('indexedDB' in $window)) {
            $window.indexedDB = $window.mozIndexedDB || $window.webkitIndexedDB || $window.msIndexedDB;
        }
        if (!('indexedDB' in $window)) {
             throw new Error("IndexedDB is not supported in this browser.");
        }

        // Key range factory for IndexedDB queries.
        const keyRangeFactory = $window.IDBKeyRange || $window.mozIDBKeyRange || $window.webkitIDBKeyRange || $window.msIDBKeyRange;

        // Default query parameters for cursor operations.
        const baseQueryConfig = {
            indexToUse: undefined,
            filterRange: null,
            traversalDirection: CURSOR_FORWARD
        };

        // Helper to ensure Angular's digest cycle runs after async IndexedDB operations.
        const safeApply = (deferred, fn) => {
            if ($rootScope.$$phase || $rootScope.$root.$$phase) {
                fn();
            } else {
                $rootScope.$apply(fn);
            }
        };

        /**
         * @ngdoc method
         * @name establishDbConnection
         * @returns {Promise} A promise that resolves with the IDBDatabase instance.
         * @description Opens the IndexedDB database and handles upgrade logic.
         */
        const establishDbConnection = () => {
            if (!serviceConfiguration.connectionPromise) {
                if (!serviceConfiguration.databaseIdentifier) {
                    return $q.reject("Database name not configured. Use setDatabase() first.");
                }

                const connectionDeferred = $q.defer();
                serviceConfiguration.connectionPromise = connectionDeferred.promise;

                const dbRequest = $window.indexedDB.open(
                    serviceConfiguration.databaseIdentifier,
                    serviceConfiguration.schemaVersion
                );

                dbRequest.onsuccess = (event) => {
                    serviceConfiguration.activeDbInstance = dbRequest.result;
                    _log(`Database "${serviceConfiguration.databaseIdentifier}" opened successfully.`);
                    safeApply(connectionDeferred, () => connectionDeferred.resolve(serviceConfiguration.activeDbInstance));
                };

                dbRequest.onblocked = serviceConfiguration.onDatabaseBlocked;
                dbRequest.onerror = (event) => {
                    serviceConfiguration.onDatabaseFailure(event);
                    safeApply(connectionDeferred, () => connectionDeferred.reject(event.target.error));
                };

                dbRequest.onupgradeneeded = (event) => {
                    const db = event.target.result;
                    const transaction = event.target.transaction;
                    _log(`Upgrading database "${db.name}" from version ${event.oldVersion} to ${event.newVersion}...`);
                    if (serviceConfiguration.schemaUpgradeCallback) {
                        serviceConfiguration.schemaUpgradeCallback(event, db, transaction);
                    } else {
                        console.warn("No schema upgrade callback defined for version change.");
                    }
                };
            }
            return serviceConfiguration.connectionPromise;
        };

        /**
         * @ngdoc class
         * @name EntityStore
         * @description Represents an object store within the IndexedDB database.
         * Provides methods for interacting with records in that store.
         * @param {string} storeName The name of the object store.
         */
        function EntityStore(storeName) {
            if (typeof storeName !== 'string' || storeName.trim() === '') {
                throw new Error("EntityStore requires a valid store name.");
            }
            this.collectionName = storeName;
            this.currentTransaction = undefined;
        }

        EntityStore.prototype = {
            /**
             * @ngdoc method
             * @name EntityStore.getCollectionHandle
             * @private
             * @returns {Promise} A promise that resolves with the IDBObjectStore instance.
             * @description Internal method to retrieve an IDBObjectStore for operations.
             */
            getCollectionHandle: function(operationMode = MODE_READ_ONLY) {
                const self = this;
                return establishDbConnection().then((db) => {
                    self.currentTransaction = db.transaction([self.collectionName], operationMode);
                    self.currentTransaction.oncomplete = serviceConfiguration.onTransactionSuccess;
                    self.currentTransaction.onabort = serviceConfiguration.onTransactionAborted;
                    self.currentTransaction.onerror = serviceConfiguration.onTransactionFailure;

                    return self.currentTransaction.objectStore(self.collectionName);
                }).catch(err => {
                    _log("Failed to get object store handle:", err);
                    return $q.reject(err);
                });
            },

            /**
             * @ngdoc method
             * @name EntityStore.cancelOperation
             * @description Aborts the currently active transaction for this store.
             */
            cancelOperation: function() {
                if (this.currentTransaction) {
                    this.currentTransaction.abort();
                    _log(`Transaction for store "${this.collectionName}" manually aborted.`);
                }
            },

            /**
             * @ngdoc method
             * @name EntityStore.addRecord
             * @param {object|Array<object>} records The data to add. Can be a single object or an array.
             * @returns {Promise} A promise that resolves with the primary key(s) of the added record(s).
             * @description Inserts new records into the object store.
             */
            addRecord: function(records) {
                const addDeferred = $q.defer();
                this.getCollectionHandle(MODE_WRITE_ONLY).then((store) => {
                    const dataArray = Array.isArray(records) ? records : [records];
                    let completedCount = 0;
                    const results = [];

                    if (dataArray.length === 0) {
                        safeApply(addDeferred, () => addDeferred.resolve([]));
                        return;
                    }

                    dataArray.forEach((item, index) => {
                        const request = store.add(item);
                        request.onsuccess = (event) => {
                            results.push(event.target.result);
                            completedCount++;
                            if (completedCount === dataArray.length) {
                                safeApply(addDeferred, () => addDeferred.resolve(Array.isArray(records) ? results : results[0]));
                            }
                        };
                        request.onerror = (event) => {
                            _log("Failed to add record:", event.target.error);
                            safeApply(addDeferred, () => addDeferred.reject(event.target.error));
                        };
                    });
                }).catch(err => safeApply(addDeferred, () => addDeferred.reject(err)));
                return addDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.saveRecord
             * @param {object|Array<object>} records The data to save (update or insert).
             * @returns {Promise} A promise that resolves with the primary key(s) of the saved record(s).
             * @description Updates existing records or inserts new ones if they don't exist.
             */
            saveRecord: function(records) {
                const saveDeferred = $q.defer();
                this.getCollectionHandle(MODE_WRITE_ONLY).then((store) => {
                    const dataArray = Array.isArray(records) ? records : [records];
                    let completedCount = 0;
                    const results = [];

                    if (dataArray.length === 0) {
                        safeApply(saveDeferred, () => saveDeferred.resolve([]));
                        return;
                    }

                    dataArray.forEach((item, index) => {
                        const request = store.put(item);
                        request.onsuccess = (event) => {
                            results.push(event.target.result);
                            completedCount++;
                            if (completedCount === dataArray.length) {
                                safeApply(saveDeferred, () => saveDeferred.resolve(Array.isArray(records) ? results : results[0]));
                            }
                        };
                        request.onerror = (event) => {
                            _log("Failed to save record:", event.target.error);
                            safeApply(saveDeferred, () => saveDeferred.reject(event.target.error));
                        };
                    });
                }).catch(err => safeApply(saveDeferred, () => saveDeferred.reject(err)));
                return saveDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.removeRecord
             * @param {any} key The primary key of the record to delete.
             * @returns {Promise} A promise that resolves upon successful deletion.
             * @description Deletes a record identified by its primary key.
             */
            removeRecord: function(key) {
                const deleteDeferred = $q.defer();
                this.getCollectionHandle(MODE_WRITE_ONLY).then((store) => {
                    const request = store.delete(key);
                    request.onsuccess = (event) => {
                        _log(`Record with key "${key}" deleted from "${this.collectionName}".`);
                        safeApply(deleteDeferred, () => deleteDeferred.resolve(event.target.result));
                    };
                    request.onerror = (event) => {
                        _log("Failed to delete record:", event.target.error);
                        safeApply(deleteDeferred, () => deleteDeferred.reject(event.target.error));
                    };
                }).catch(err => safeApply(deleteDeferred, () => deleteDeferred.reject(err)));
                return deleteDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.emptyCollection
             * @returns {Promise} A promise that resolves upon successful clearance.
             * @description Removes all records from the object store.
             */
            emptyCollection: function() {
                const clearDeferred = $q.defer();
                this.getCollectionHandle(MODE_WRITE_ONLY).then((store) => {
                    const request = store.clear();
                    request.onsuccess = (event) => {
                        _log(`Collection "${this.collectionName}" cleared.`);
                        safeApply(clearDeferred, () => clearDeferred.resolve(event.target.result));
                    };
                    request.onerror = (event) => {
                        _log("Failed to clear collection:", event.target.error);
                        safeApply(clearDeferred, () => clearDeferred.reject(event.target.error));
                    };
                }).catch(err => safeApply(clearDeferred, () => clearDeferred.reject(err)));
                return clearDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.getRecordCount
             * @returns {Promise<number>} A promise that resolves with the number of records.
             * @description Retrieves the total count of records in the object store.
             */
            getRecordCount: function() {
                const countDeferred = $q.defer();
                this.getCollectionHandle(MODE_READ_ONLY).then((store) => {
                    const request = store.count();
                    request.onsuccess = (event) => {
                        safeApply(countDeferred, () => countDeferred.resolve(event.target.result));
                    };
                    request.onerror = (event) => {
                        _log("Failed to count records:", event.target.error);
                        safeApply(countDeferred, () => countDeferred.reject(event.target.error));
                    };
                }).catch(err => safeApply(countDeferred, () => countDeferred.reject(err)));
                return countDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.retrieveOne
             * @param {any} primaryKey The primary key of the record to retrieve.
             * @param {string} [indexName] Optional: The name of an index to use for lookup.
             * @returns {Promise<object>} A promise that resolves with the found record, or undefined.
             * @description Fetches a single record by its primary key or by an index key.
             */
            retrieveOne: function(primaryKey, indexName) {
                const findDeferred = $q.defer();
                this.getCollectionHandle(MODE_READ_ONLY).then((store) => {
                    let request;
                    if (indexName) {
                        request = store.index(indexName).get(primaryKey);
                    } else {
                        request = store.get(primaryKey);
                    }
                    request.onsuccess = (event) => {
                        safeApply(findDeferred, () => findDeferred.resolve(event.target.result));
                    };
                    request.onerror = (event) => {
                        _log("Failed to retrieve single record:", event.target.error);
                        safeApply(findDeferred, () => findDeferred.reject(event.target.error));
                    };
                }).catch(err => safeApply(findDeferred, () => findDeferred.reject(err)));
                return findDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.retrieveAll
             * @returns {Promise<Array<object>>} A promise that resolves with an array of all records.
             * @description Retrieves all records from the object store. Uses getAll if available,
             * otherwise falls back to a cursor.
             */
            retrieveAll: function() {
                const allDeferred = $q.defer();
                this.getCollectionHandle(MODE_READ_ONLY).then((store) => {
                    let request;
                    if (store.getAll) {
                        request = store.getAll();
                        request.onsuccess = (event) => {
                            safeApply(allDeferred, () => allDeferred.resolve(event.target.result));
                        };
                        request.onerror = (event) => {
                            _log("Failed to retrieve all records using getAll:", event.target.error);
                            safeApply(allDeferred, () => allDeferred.reject(event.target.error));
                        };
                    } else {
                        // Fallback for browsers without getAll
                        const results = [];
                        request = store.openCursor();
                        request.onsuccess = (event) => {
                            const cursor = event.target.result;
                            if (cursor) {
                                results.push(cursor.value);
                                cursor.continue();
                            } else {
                                safeApply(allDeferred, () => allDeferred.resolve(results));
                            }
                        };
                        request.onerror = (event) => {
                            _log("Failed to retrieve all records using cursor:", event.target.error);
                            safeApply(allDeferred, () => allDeferred.reject(event.target.error));
                        };
                    }
                }).catch(err => safeApply(allDeferred, () => allDeferred.reject(err)));
                return allDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.iterateRecords
             * @param {function(IDBCursor)} recordCallback Callback executed for each record.
             * @param {object} [options] Optional query configuration (see RangeFilterBuilder).
             * @returns {Promise} A promise that resolves when the cursor iteration completes.
             * @description Iterates through records using a cursor, applying a callback to each.
             */
            iterateRecords: function(recordCallback, options = {}) {
                if (typeof recordCallback !== 'function') {
                    return $q.reject("Record callback must be a function for iterateRecords.");
                }

                const iterateDeferred = $q.defer();
                const queryOptions = { ...baseQueryConfig, ...options };

                this.getCollectionHandle(MODE_READ_ONLY).then((store) => {
                    let request;
                    if (queryOptions.indexToUse) {
                        request = store.index(queryOptions.indexToUse).openCursor(
                            queryOptions.filterRange,
                            queryOptions.traversalDirection
                        );
                    } else {
                        request = store.openCursor(
                            queryOptions.filterRange,
                            queryOptions.traversalDirection
                        );
                    }

                    request.onsuccess = (event) => {
                        const cursor = event.target.result;
                        if (cursor) {
                            safeApply(iterateDeferred, () => recordCallback(cursor));
                            cursor.continue();
                        } else {
                            safeApply(iterateDeferred, () => iterateDeferred.resolve());
                        }
                    };
                    request.onerror = (event) => {
                        _log("Error during cursor iteration:", event.target.error);
                        safeApply(iterateDeferred, () => iterateDeferred.reject(event.target.error));
                    };
                }).catch(err => safeApply(iterateDeferred, () => iterateDeferred.reject(err)));
                return iterateDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.closeConnection
             * @returns {Promise} A promise that resolves when the connection is closed.
             * @description Closes the database connection.
             */
            closeConnection: function() {
                const closeDeferred = $q.defer();
                if (serviceConfiguration.activeDbInstance) {
                    serviceConfiguration.activeDbInstance.close();
                    serviceConfiguration.activeDbInstance = null;
                    serviceConfiguration.connectionPromise = null;
                    _log(`Database connection "${serviceConfiguration.databaseIdentifier}" closed.`);
                    safeApply(closeDeferred, () => closeDeferred.resolve());
                } else {
                    safeApply(closeDeferred, () => closeDeferred.resolve("No active database connection to close."));
                }
                return closeDeferred.promise;
            },

            /**
             * @ngdoc method
             * @name EntityStore.deleteDatabase
             * @returns {Promise} A promise that resolves when the database is deleted.
             * @description Deletes the entire IndexedDB database. Use with caution.
             */
            deleteDatabase: function() {
                const deleteDbDeferred = $q.defer();
                if (!serviceConfiguration.databaseIdentifier) {
                    return $q.reject("Cannot delete database: name not configured.");
                }

                this.closeConnection().then(() => {
                    const deleteRequest = $window.indexedDB.deleteDatabase(serviceConfiguration.databaseIdentifier);
                    deleteRequest.onsuccess = () => {
                        _log(`Database "${serviceConfiguration.databaseIdentifier}" successfully deleted.`);
                        safeApply(deleteDbDeferred, () => deleteDbDeferred.resolve());
                    };
                    deleteRequest.onerror = (event) => {
                        _log(`Failed to delete database "${serviceConfiguration.databaseIdentifier}":`, event.target.error);
                        safeApply(deleteDbDeferred, () => deleteDbDeferred.reject(event.target.error));
                    };
                    deleteRequest.onblocked = (event) => {
                        _log(`Database deletion blocked: "${serviceConfiguration.databaseIdentifier}".`, event);
                        safeApply(deleteDbDeferred, () => deleteDbDeferred.reject("Database deletion blocked. Ensure all connections are closed."));
                    };
                }).catch(err => safeApply(deleteDbDeferred, () => deleteDbDeferred.reject(err)));

                return deleteDbDeferred.promise;
            }
        };

        /**
         * @ngdoc class
         * @name RangeFilterBuilder
         * @description Utility for constructing IDBKeyRange objects for cursor queries.
         */
        function RangeFilterBuilder() {
            this._queryConfig = { ...baseQueryConfig };
        }

        RangeFilterBuilder.prototype = {
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.lessThan
             * @param {any} value Upper bound (exclusive).
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            lessThan: function(value) {
                this._queryConfig.filterRange = keyRangeFactory.upperBound(value, true);
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.greaterThan
             * @param {any} value Lower bound (exclusive).
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            greaterThan: function(value) {
                this._queryConfig.filterRange = keyRangeFactory.lowerBound(value, true);
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.lessThanOrEqualTo
             * @param {any} value Upper bound (inclusive).
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            lessThanOrEqualTo: function(value) {
                this._queryConfig.filterRange = keyRangeFactory.upperBound(value);
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.greaterThanOrEqualTo
             * @param {any} value Lower bound (inclusive).
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            greaterThanOrEqualTo: function(value) {
                this._queryConfig.filterRange = keyRangeFactory.lowerBound(value);
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.equalTo
             * @param {any} value Exact match key.
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            equalTo: function(value) {
                this._queryConfig.filterRange = keyRangeFactory.only(value);
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.between
             * @param {any} lower Lower bound.
             * @param {any} upper Upper bound.
             * @param {boolean} [excludeLower=false] Exclude lower bound.
             * @param {boolean} [excludeUpper=false] Exclude upper bound.
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            between: function(lower, upper, excludeLower = false, excludeUpper = false) {
                this._queryConfig.filterRange = keyRangeFactory.bound(lower, upper, excludeLower, excludeUpper);
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.byIndex
             * @param {string} indexName The name of the index to use.
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            byIndex: function(indexName) {
                this._queryConfig.indexToUse = indexName;
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.setDirection
             * @param {string} direction The cursor direction (e.g., 'next', 'prev').
             * @returns {RangeFilterBuilder} This builder for chaining.
             */
            setDirection: function(direction) {
                if ([CURSOR_FORWARD, CURSOR_FORWARD_UNIQUE, CURSOR_BACKWARD, CURSOR_BACKWARD_UNIQUE].includes(direction)) {
                    this._queryConfig.traversalDirection = direction;
                } else {
                    console.warn(`Invalid cursor direction: ${direction}. Using default: ${CURSOR_FORWARD}`);
                }
                return this;
            },
            /**
             * @ngdoc method
             * @name RangeFilterBuilder.build
             * @returns {object} The constructed query configuration object.
             * @description Finalizes and returns the query configuration.
             */
            build: function() {
                return this._queryConfig;
            }
        };

        // The public service object.
        return {
            /**
             * @ngdoc method
             * @name $dbAccess.collection
             * @param {string} storeName The name of the object store.
             * @returns {EntityStore} An instance of EntityStore for the specified collection.
             * @description Factory method to get an EntityStore instance for a specific collection.
             */
            collection: (storeName) => new EntityStore(storeName),
            /**
             * @ngdoc method
             * @name $dbAccess.query
             * @returns {RangeFilterBuilder} A new RangeFilterBuilder instance.
             * @description Factory method to get a new RangeFilterBuilder instance.
             */
            query: () => new RangeFilterBuilder(),
            /**
             * @ngdoc property
             * @name $dbAccess.constants
             * @description Provides access to IndexedDB constants.
             */
            constants: {
                // Transaction Modes
                READ_ONLY_MODE: MODE_READ_ONLY,
                WRITE_ONLY_MODE: MODE_WRITE_ONLY,
                SCHEMA_UPDATE_MODE: MODE_SCHEMA_UPDATE,

                // Cursor Directions
                NEXT_RECORD: CURSOR_FORWARD,
                NEXT_UNIQUE_RECORD: CURSOR_FORWARD_UNIQUE,
                PREVIOUS_RECORD: CURSOR_BACKWARD,
                PREVIOUS_UNIQUE_RECORD: CURSOR_BACKWARD_UNIQUE
            },
            // Expose the raw IDBKeyRange factory if needed for advanced use cases.
            getKeyRangeFactory: () => keyRangeFactory
        };
    }];
});