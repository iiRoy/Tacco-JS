/*
 * Core Cloud Synchronization Module v2.1.0 | (c) 2023 Acme Corp. | Licensed under MIT
 * This module provides an Angular.js interface for Dropbox Datastore API interactions.
 */

'use strict';

/* Application Services */
// Global flag for debug logging, now managed by the appLog service.

angular.module("dataRecordBinder", [])
.factory('dataRecordBinder', [function() {
    /**
     * Creates a reactive wrapper around a Dropbox Datastore record field.
     * This provides a convenient way to bind record fields to UI elements.
     * @param {Dropbox.Datastore.Record} dataObject - The Dropbox Datastore record instance.
     * @param {string} propKey - The key/ID of the field within the record.
     * @returns {object} An object with a getter and setter for the bound value.
     */
    return function (dataObject, propKey){
        const _internalDataObject = dataObject; // Reference to the actual Dropbox record.

        // Private utility for consistent logging within this binder.
        const _logBindingActivity = (action, key, value) => {
            if (typeof console !== 'undefined' && console.log) {
                console.log(`[DataBinder] ${action} for key '${key}' on record:`, _internalDataObject, 'Value:', value);
            }
        };

        return {
            /**
             * Getter for the bound value. Logs read access and retrieves the value from the internal record.
             * @returns {*} The value of the field.
             */
            get boundValue() {
                const retrievedValue = _internalDataObject.get(propKey);
                _logBindingActivity('Reading', propKey, retrievedValue);
                return retrievedValue;
            },
            /**
             * Setter for the bound value. Logs write access and updates the internal record.
             * Ensures the value is always a string, falling back to an empty string if null/undefined.
             * @param {*} newValue - The new value to set for the field.
             */
            set boundValue(newValue) {
                // Ensure value is always treated as a string for consistency, or provide a default.
                const valueToSet = (newValue === null || typeof newValue === 'undefined') ? '' : String(newValue).trim();
                _logBindingActivity('Writing', propKey, valueToSet);
                _internalDataObject.set(propKey, valueToSet);
            },
            /**
             * Provides direct access to the underlying Dropbox Datastore record.
             * Use with caution to avoid bypassing the getter/setter logic.
             * @returns {Dropbox.Datastore.Record} The internal Dropbox record object.
             */
            get rawRecord() {
                return _internalDataObject;
            }
        };
    };
}])


angular.module("cloudSyncCore", []).
    factory('cloudSyncClient', function($rootScopeSvc, $promiseSvc, angularSafeUpdate, cloudDataManagerSvc, appLogSvc) {

        // Note: Original polyfills for console and String.trim have been removed as they are largely
        // unnecessary in modern Angular development environments and target browsers.

        appLogSvc.log('Initializing cloudSyncClient service...');

        let _apiClientInstance = null; // Stores the Dropbox API client instance.
        let _isClientReady = false;    // Flag to track client initialization status.

        ///////////////////////////////////////////////////////////////////////
        // Private Utility Handlers for Promises
        ///////////////////////////////////////////////////////////////////////

        /**
         * Generic promise handler for Dropbox API authentication calls.
         * It wraps the Dropbox callback into an Angular promise.
         * @param {object} asyncPromise - The Angular $q.defer() object.
         * @param {string} operationName - A descriptive name for the operation.
         * @returns {function(Error, object)} A callback function for Dropbox API.
         */
        function authPromiseHandler(asyncPromise, operationName){
            return function(errorOutcome, operationResult){
                angularSafeUpdate($rootScopeSvc, function() {
                    if (errorOutcome) {
                        appLogSvc.error(`Cloud client operation "${operationName}" encountered an error:`, errorOutcome);
                        asyncPromise.reject(errorOutcome);
                    } else {
                        appLogSvc.log(`Cloud client operation "${operationName}" completed successfully:`, operationResult);
                        // Upon successful authentication, we initialize the Datastore Manager.
                        asyncPromise.resolve(cloudDataManagerSvc(operationResult));
                        _isClientReady = true; // Mark client as ready after auth.
                    }
                });
            };
        }

        /**
         * Generic promise handler for standard Dropbox API calls (non-authentication).
         * @param {object} asyncPromise - The Angular $q.defer() object.
         * @param {string} operationName - A descriptive name for the operation.
         * @returns {function(Error, object)} A callback function for Dropbox API.
         */
        function basicPromiseHandler(asyncPromise, operationName){
            return function(errorOutcome, operationResult){
                angularSafeUpdate($rootScopeSvc, function() {
                    if (errorOutcome) {
                        appLogSvc.error(`Cloud client operation "${operationName}" encountered an error:`, errorOutcome);
                        asyncPromise.reject(errorOutcome);
                    } else {
                        appLogSvc.log(`Cloud client operation "${operationName}" completed successfully:`, operationResult);
                        asyncPromise.resolve(operationResult);
                    }
                });
            };
        }

        ///////////////////////////////////////////////////////////////////////
        // Public Interface for Cloud Sync Client
        ///////////////////////////////////////////////////////////////////////

        const cloudServiceFacade = {}; // The public service object.

        /**
         * Initializes the Dropbox Client. This should be called only once.
         * @param {object} configParams - Configuration options for the Dropbox client.
         * @returns {object} The cloudServiceFacade itself for chaining.
         * @throws {Error} If the client is already initialized or configParams are invalid.
         */
        cloudServiceFacade.initializeClient = function(configParams){
            if (_isClientReady && _apiClientInstance) {
                appLogSvc.warn('Cloud client already initialized. Skipping re-initialization.');
                return cloudServiceFacade;
            }
            if (!configParams || typeof configParams !== 'object') {
                const errorMsg = 'Invalid configuration parameters provided for client initialization.';
                appLogSvc.critical(errorMsg);
                throw new Error(errorMsg);
            }

            _apiClientInstance = new Dropbox.Client(configParams);
            appLogSvc.log('Dropbox Client instance created.');
            return cloudServiceFacade;
        };

        /**
         * Authenticates the user with Dropbox. This process might redirect the user.
         * @param {object} [configParams] - Optional configuration for authentication.
         * @returns {Promise<cloudDataManager>} A promise that resolves with the cloudDataManager instance on success.
         */
        cloudServiceFacade.startAuthentication =  function(configParams = {}) {
            if (!_apiClientInstance) {
                const error = new Error('Client not initialized. Call initializeClient() first.');
                appLogSvc.error(error.message);
                return $promiseSvc.reject(error);
            }
            const asyncPromise = $promiseSvc.defer();
            _apiClientInstance.authenticate(configParams, authPromiseHandler(asyncPromise, 'authenticateUser'));
            return asyncPromise.promise;
        };

        /**
         * Retrieves the Cloud Data Manager instance. This requires the client to be authenticated.
         * @returns {cloudDataManager} The manager for interacting with datastores.
         */
        cloudServiceFacade.getCloudDataManager = function(){
            if (!_apiClientInstance || !_isClientReady) {
                appLogSvc.warn('Attempted to get CloudDataManager before client is authenticated.');
                // For a Type III clone, let's return a dummy manager or throw an error.
                // Original returned manager(client) which would fail if client is not ready.
                // Let's ensure a valid client is passed.
                if (!_apiClientInstance) {
                    throw new Error('Dropbox API client is not initialized.');
                }
                if (!_isClientReady) {
                    throw new Error('Dropbox API client is not authenticated.');
                }
            }
            return cloudDataManagerSvc(_apiClientInstance);
        };

        /**
         * Invalidates the user's OAuth token and signs them out.
         * @param {object} [configParams] - Optional configuration for sign out.
         * @returns {Promise<void>} A promise that resolves when sign out is complete.
         */
        cloudServiceFacade.endSession = function(configParams = {}){
            if (!_apiClientInstance) {
                appLogSvc.warn('Attempted to sign out, but client not initialized.');
                return $promiseSvc.resolve(); // Or reject if stricter.
            }
            const asyncPromise = $promiseSvc.defer();
            _apiClientInstance.signOut(configParams, basicPromiseHandler(asyncPromise, 'signOutUser'));
            _isClientReady = false; // Reset client ready status.
            return asyncPromise.promise;
        };

        /**
         * Fetches current user account information.
         * @param {object} [configParams] - Optional configuration.
         * @returns {Promise<object>} A promise resolving with user account details.
         */
        cloudServiceFacade.fetchAccountDetails = function(configParams = {}){
            if (!_apiClientInstance) {
                const error = new Error('Client not initialized. Cannot fetch account details.');
                appLogSvc.error(error.message);
                return $promiseSvc.reject(error);
            }
            const asyncPromise = $promiseSvc.defer();
            _apiClientInstance.getAccountInfo(configParams, basicPromiseHandler(asyncPromise, 'fetchAccountInfo'));
            return asyncPromise.promise;
        };

        /**
         * Checks if the client is currently authenticated.
         * @returns {boolean} True if authenticated, false otherwise.
         */
        cloudServiceFacade.isUserAuthenticated = function(){
            // Directly delegate to the underlying client, if available.
            return _apiClientInstance ? _apiClientInstance.isAuthenticated() : false;
        };

        /**
         * Retrieves the Dropbox User ID.
         * @returns {string|null} The Dropbox user ID or null if not authenticated.
         */
        cloudServiceFacade.getUserDropboxId = function(){
            return _apiClientInstance ? _apiClientInstance.dropboxUid() : null;
        };

        /**
         * Provides access to client credentials.
         * @returns {object|null} The credentials object or null.
         */
        cloudServiceFacade.getClientCredentials = function(){
            return _apiClientInstance ? _apiClientInstance.credentials() : null;
        };

        /**
         * Retrieves general user information.
         * @returns {object|null} User info object or null.
         */
        cloudServiceFacade.retrieveUserInfo = function(){
            return _apiClientInstance ? _apiClientInstance.getUserInfo() : null;
        };

        return cloudServiceFacade;
    })
    .factory('cloudDataManager', function($rootScopeSvc, $promiseSvc, angularSafeUpdate, cloudDataStoreSvc, appLogSvc) {

        return function(apiClientReference){
            if (!apiClientReference) {
                const error = new Error('cloudDataManager requires a valid Dropbox API client reference.');
                appLogSvc.critical(error.message);
                throw error;
            }

            appLogSvc.log('Creating cloudDataManager instance...');

            const _apiClient = apiClientReference; // Reference to the authenticated Dropbox client.
            let _dataStoreMgrInstance = null; // The actual Dropbox.Datastore.DatastoreManager.
            let _isManagerReady = false;

            // Initialize the manager once.
            try {
                _dataStoreMgrInstance = _apiClient.getDatastoreManager();
                _isManagerReady = true;
            } catch (e) {
                appLogSvc.critical('Failed to initialize Dropbox Datastore Manager:', e);
                throw new Error('Failed to get Datastore Manager from API client.');
            }


            ///////////////////////////////////////////////////////////////////////
            // Private Utility Handlers for Promises
            ///////////////////////////////////////////////////////////////////////

            /**
             * Promise handler for DatastoreManager operations that return a Datastore object.
             * @param {object} asyncPromise - The Angular $q.defer() object.
             * @param {string} operationName - A descriptive name for the operation.
             * @returns {function(Error, Dropbox.Datastore)} A callback for Dropbox API.
             */
            function managerPromiseHandler(asyncPromise, operationName){
                return function(errorOutcome, datastoreResult){
                    angularSafeUpdate($rootScopeSvc, function() {
                        if (errorOutcome) {
                            appLogSvc.error(`Datastore Manager operation "${operationName}" failed:`, errorOutcome);
                            asyncPromise.reject(errorOutcome);
                        } else {
                            appLogSvc.log(`Datastore Manager operation "${operationName}" succeeded:`, datastoreResult);
                            // Wrap the Dropbox.Datastore object with our service.
                            asyncPromise.resolve(cloudDataStoreSvc(cloudDatastoreManagerService, datastoreResult));
                        }
                    });
                };
            }

            /**
             * Promise handler for DatastoreManager operations that return basic results (e.g., list of IDs, void).
             * @param {object} asyncPromise - The Angular $q.defer() object.
             * @param {string} operationName - A descriptive name for the operation.
             * @returns {function(Error, *)} A callback for Dropbox API.
             */
            function basicManagerPromiseHandler(asyncPromise, operationName){
                return function(errorOutcome, operationResult){
                    angularSafeUpdate($rootScopeSvc,function() {
                        if (errorOutcome) {
                            appLogSvc.error(`Datastore Manager operation "${operationName}" failed:`, errorOutcome);
                            asyncPromise.reject(errorOutcome);
                        } else {
                            appLogSvc.log(`Datastore Manager operation "${operationName}" succeeded:`, operationResult);
                            asyncPromise.resolve(operationResult);
                        }
                    });
                };
            }

            ///////////////////////////////////////////////////////////////////////
            // Public Interface for Cloud Data Manager
            ///////////////////////////////////////////////////////////////////////

            const cloudDatastoreManagerService = {};
            cloudDatastoreManagerService._apiClient = _apiClient; // Expose client ref (internal use).
            cloudDatastoreManagerService._dataStoreMgrInstance = _dataStoreMgrInstance; // Expose Dropbox DatastoreManager (internal use).

            /**
             * Gets the ID of this manager instance, useful for debugging or tracking.
             * @returns {string} A unique ID for this manager instance.
             */
            cloudDatastoreManagerService.getManagerInstanceId = function() {
                return `DSM_${_apiClient.dropboxUid() || 'unauth'}_${Date.now()}`;
            };

            /**
             * Asynchronously opens the app's default datastore for the current user.
             * @returns {Promise<cloudDataStore>} A promise resolving with the cloudDataStore object.
             */
            cloudDatastoreManagerService.openDefaultDataStore =  function() {
                if (!_isManagerReady) {
                    return $promiseSvc.reject(new Error('Datastore Manager not initialized.'));
                }
                const asyncPromise = $promiseSvc.defer();
                _dataStoreMgrInstance.openDefaultDatastore(managerPromiseHandler(asyncPromise, 'openDefaultDataStore'));
                return asyncPromise.promise;
            };

            /**
             * Asynchronously opens a datastore with a specific ID.
             * @param {string} storeIdentifier - The ID of the datastore to open.
             * @returns {Promise<cloudDataStore>} A promise resolving with the cloudDataStore object.
             */
            cloudDatastoreManagerService.openSpecificDataStore =  function(storeIdentifier) {
                if (!_isManagerReady) {
                    return $promiseSvc.reject(new Error('Datastore Manager not initialized.'));
                }
                if (!storeIdentifier || typeof storeIdentifier !== 'string') {
                    appLogSvc.warn('Invalid datastore identifier provided for openSpecificDataStore.');
                    return $promiseSvc.reject(new Error('A valid string datastore identifier is required.'));
                }
                const asyncPromise = $promiseSvc.defer();
                _dataStoreMgrInstance.openDatastore(storeIdentifier, managerPromiseHandler(asyncPromise, 'openSpecificDataStore'));
                return asyncPromise.promise;
            };

            /**
             * Asynchronously creates a new datastore.
             * @returns {Promise<cloudDataStore>} A promise resolving with the newly created cloudDataStore object.
             */
            cloudDatastoreManagerService.createDataStore =  function() {
                if (!_isManagerReady) {
                    return $promiseSvc.reject(new Error('Datastore Manager not initialized.'));
                }
                const asyncPromise = $promiseSvc.defer();
                _dataStoreMgrInstance.createDatastore(managerPromiseHandler(asyncPromise, 'createDataStore'));
                return asyncPromise.promise;
            };

            /**
             * Asynchronously deletes a datastore with the given ID.
             * Deleting a non-existent datastore is not an error.
             * @param {string} storeIdentifier - The ID of the datastore to delete.
             * @returns {Promise<void>} A promise that resolves when the deletion is complete.
             */
            cloudDatastoreManagerService.deleteDataStore =  function(storeIdentifier) {
                if (!_isManagerReady) {
                    return $promiseSvc.reject(new Error('Datastore Manager not initialized.'));
                }
                if (!storeIdentifier || typeof storeIdentifier !== 'string') {
                    appLogSvc.warn('Invalid datastore identifier provided for deleteDataStore.');
                    return $promiseSvc.reject(new Error('A valid string datastore identifier is required.'));
                }
                const asyncPromise = $promiseSvc.defer();
                _dataStoreMgrInstance.deleteDatastore(storeIdentifier, basicManagerPromiseHandler(asyncPromise, 'deleteDataStore'));
                return asyncPromise.promise;
            };

            /**
             * Asynchronously retrieves a list of IDs for all datastores accessible to the app.
             * @returns {Promise<Array<string>>} A promise resolving with an array of datastore IDs.
             */
            cloudDatastoreManagerService.listAvailableDataStoreIds =  function() {
                if (!_isManagerReady) {
                    return $promiseSvc.reject(new Error('Datastore Manager not initialized.'));
                }
                const asyncPromise = $promiseSvc.defer();
                _dataStoreMgrInstance.listDatastoreIds(basicManagerPromiseHandler(asyncPromise, 'listAvailableDataStoreIds'));
                return asyncPromise.promise;
            };

            /**
             * Shuts down the DatastoreManager. All associated Datastore instances become invalid.
             * @returns {void}
             */
            cloudDatastoreManagerService.shutdownManager =  function() {
                if (!_isManagerReady) {
                    appLogSvc.warn('Attempted to shut down uninitialized Datastore Manager.');
                    return;
                }
                appLogSvc.log('Shutting down Datastore Manager.');
                _dataStoreMgrInstance.close();
                _isManagerReady = false;
            };

            ///////////////////////////////////////////////////////////////////////
            // Public PUBSUB Methods // Listen for Datastore List Changes.
            ///////////////////////////////////////////////////////////////////////

            /**
             * Internal handler for Dropbox datastoreListChanged event, ensuring Angular digest cycle.
             * @param {function} notificationCallback - The user-provided callback.
             * @returns {function(Array)} The wrapped callback for Dropbox event listener.
             */
            const storeListChangeNotifier = function(notificationCallback){
                return function(eventDataArray){
                    angularSafeUpdate($rootScopeSvc, function(){
                        notificationCallback(eventDataArray);
                    });
                };
            };

            /**
             * Subscribes to changes in the list of available datastores.
             * @param {function(Array<string>)} notificationCallback - Function to call when the list changes.
             * @returns {function()} A function to call to unsubscribe from the event.
             */
            cloudDatastoreManagerService.subscribeDataStoreListChanges = function(notificationCallback){
                if (!_isManagerReady) {
                    appLogSvc.warn('Cannot subscribe: Datastore Manager not initialized.');
                    return () => {}; // Return a no-op deregistration.
                }
                const listenerFunction = storeListChangeNotifier(notificationCallback);
                _dataStoreMgrInstance.datastoreListChanged.addListener(listenerFunction);
                appLogSvc.log('Subscribed to datastore list changes.');

                // Return a function to deregister the listener.
                return () => {
                    _dataStoreMgrInstance.datastoreListChanged.removeListener(listenerFunction);
                    appLogSvc.log('Unsubscribed from datastore list changes.');
                };
            };

            return cloudDatastoreManagerService;
        };
    })
    .factory('cloudDataStoreSvc', function($rootScopeSvc, $promiseSvc, angularSafeUpdate, appLogSvc) {

        return function(parentDataManager, dataStoreInstance){
            if (!dataStoreInstance || !parentDataManager) {
                const error = new Error('cloudDataStoreSvc requires valid parent manager and datastore instance.');
                appLogSvc.critical(error.message);
                throw error;
            }

            appLogSvc.log('Creating cloudDataStore instance for ID:', dataStoreInstance.getId());

            ///////////////////////////////////////////////////////////////////////
            // Private Utility Handlers for Promises
            ///////////////////////////////////////////////////////////////////////

            /**
             * Promise resolver for operations that have an immediate, synchronous result.
             * @param {object} asyncPromise - The Angular $q.defer() object.
             * @param {*} value - The immediate value to resolve with.
             * @param {string} operationName - A descriptive name for the operation.
             */
            function immediatePromiseResolver(asyncPromise, value, operationName){
                angularSafeUpdate($rootScopeSvc,function() {
                    appLogSvc.log(`Datastore operation "${operationName}" resolved immediately with:`, value);
                    asyncPromise.resolve(value);
                });
            }

            /**
             * Generic promise handler for Datastore operations.
             * @param {object} asyncPromise - The Angular $q.defer() object.
             * @param {string} operationName - A descriptive name for the operation.
             * @returns {function(Error, *)} A callback for Dropbox API.
             */
            function basicDatastorePromiseHandler(asyncPromise, operationName){
                return function(errorOutcome, operationResult){
                    angularSafeUpdate($rootScopeSvc,function() {
                        if (errorOutcome) {
                            appLogSvc.error(`Datastore operation "${operationName}" failed:`, errorOutcome);
                            asyncPromise.reject(errorOutcome);
                        } else {
                            appLogSvc.log(`Datastore operation "${operationName}" succeeded:`, operationResult);
                            asyncPromise.resolve(operationResult);
                        }
                    });
                };
            }

            ///////////////////////////////////////////////////////////////////////
            // Public Interface for Cloud Data Store
            ///////////////////////////////////////////////////////////////////////

            const cloudDatastoreService = {};
            cloudDatastoreService._dataStoreInstance = dataStoreInstance; // The actual Dropbox.Datastore object.
            cloudDatastoreService._parentDataManager = parentDataManager; // Reference to the managing service.

            /**
             * Retrieves a specific table from the datastore.
             * @param {string} tableIdentifier - The ID of the table.
             * @returns {Dropbox.Datastore.Table} The Dropbox table object.
             * @throws {Error} If the tableIdentifier is invalid.
             */
            cloudDatastoreService.retrieveTable = function(tableIdentifier){
                if (!tableIdentifier || typeof tableIdentifier !== 'string') {
                    const error = new Error('A valid string table identifier is required to retrieve a table.');
                    appLogSvc.error(error.message);
                    throw error;
                }
                const contextRef = cloudDatastoreService._dataStoreInstance;
                return contextRef.getTable(tableIdentifier);
            };

            /**
             * Lists the IDs of all tables within this datastore.
             * @returns {Array<string>} An array of table IDs.
             */
            cloudDatastoreService.listAllTableIds = function(){
                const contextRef = cloudDatastoreService._dataStoreInstance;
                return contextRef.listTableIds();
            };

            /**
             * Closes this datastore instance.
             * @returns {void}
             */
            cloudDatastoreService.closeDataStore = function(){
                appLogSvc.log('Closing datastore:', cloudDatastoreService.getStoreId());
                const contextRef = cloudDatastoreService._dataStoreInstance;
                contextRef.close();
            };

            /**
             * Gets the ID of this datastore.
             * @returns {string} The datastore's ID.
             */
            cloudDatastoreService.getStoreId = function(){
                const contextRef = cloudDatastoreService._dataStoreInstance;
                return contextRef.getId();
            };

            /**
             * Retrieves the current synchronization status of the datastore.
             * @returns {object} An object containing sync status details.
             */
            cloudDatastoreService.getSynchronizationStatus = function(){
                const contextRef = cloudDatastoreService._dataStoreInstance;
                return contextRef.getSyncStatus();
            };

            /**
             * Placeholder for committing pending changes to the datastore.
             * In Dropbox Datastore, changes are usually synced automatically, but
             * this could be extended for manual commit scenarios or local-only changes.
             * @returns {Promise<void>} A promise that resolves when changes are considered committed/synced.
             */
            cloudDatastoreService.commitPendingChanges = function() {
                const asyncPromise = $promiseSvc.defer();
                // Dropbox Datastore usually syncs automatically. This is a conceptual commit.
                appLogSvc.log('Attempting to commit pending changes (note: Dropbox Datastore syncs automatically).');
                immediatePromiseResolver(asyncPromise, null, 'commitPendingChanges');
                return asyncPromise.promise;
            };


            ///////////////////////////////////////////////////////////////////////
            // Public PUBSUB Methods // Listen for Datastore Changes.
            ///////////////////////////////////////////////////////////////////////

            /**
             * Internal handler for Dropbox datastore events, ensuring Angular digest cycle.
             * @param {function} notificationCallback - The user-provided callback.
             * @returns {function(*)} The wrapped callback for Dropbox event listener.
             */
            const datastoreChangeNotifier = function(notificationCallback){
                return function(changeEvent){
                    angularSafeUpdate($rootScopeSvc, function(){
                        notificationCallback(changeEvent);
                    });
                };
            };

            /**
             * Subscribes to changes in records within this datastore.
             * Can optionally filter for changes in a specific table.
             * @param {function(*)} notificationCallback - Function to call when records change.
             * @param {string} [tableIdentifier] - Optional: if provided, callback only for changes in this table.
             * @returns {function()} A function to call to unsubscribe.
             */
            cloudDatastoreService.subscribeRecordChanges = function(notificationCallback, tableIdentifier){
                const listenerFunction = datastoreChangeNotifier(function(changeEvent){
                    if (tableIdentifier) {
                        const changedRecords = changeEvent.affectedRecordsForTable(tableIdentifier);
                        if (changedRecords && changedRecords.length > 0) {
                            notificationCallback(changedRecords);
                        }
                    } else {
                        notificationCallback(changeEvent); // Pass the full event if no table filter.
                    }
                });

                cloudDatastoreService._dataStoreInstance.recordsChanged.addListener(listenerFunction);
                appLogSvc.log(`Subscribed to record changes for datastore ${cloudDatastoreService.getStoreId()}` +
                              (tableIdentifier ? ` (table: ${tableIdentifier})` : ' (all tables)'));

                return () => {
                    cloudDatastoreService._dataStoreInstance.recordsChanged.removeListener(listenerFunction);
                    appLogSvc.log(`Unsubscribed from record changes for datastore ${cloudDatastoreService.getStoreId()}` +
                                  (tableIdentifier ? ` (table: ${tableIdentifier})` : ' (all tables)'));
                };
            };

            /**
             * Subscribes to changes in the synchronization status of this datastore.
             * @param {function(object)} notificationCallback - Function to call when sync status changes.
             * @returns {function()} A function to call to unsubscribe.
             */
            cloudDatastoreService.subscribeSyncStatusChanges = function(notificationCallback){
                const listenerFunction = datastoreChangeNotifier(notificationCallback);
                cloudDatastoreService._dataStoreInstance.syncStatusChanged.addListener(listenerFunction);
                appLogSvc.log(`Subscribed to sync status changes for datastore ${cloudDatastoreService.getStoreId()}`);

                return () => {
                    cloudDatastoreService._dataStoreInstance.syncStatusChanged.removeListener(listenerFunction);
                    appLogSvc.log(`Unsubscribed from sync status changes for datastore ${cloudDatastoreService.getStoreId()}`);
                };
            };

            return cloudDatastoreService;
        };
    })
    .factory('angularSafeUpdate', [function() {
        /**
         * Ensures an Angular scope update happens within a digest cycle.
         * Prevents "$digest already in progress" errors.
         * @param {object} $scopeRef - The Angular scope to apply changes to.
         * @param {function} [updateFn] - Optional function containing the updates.
         * @returns {void}
         */
        return function($scopeRef, updateFn) {
            if (!$scopeRef || typeof $scopeRef.$root === 'undefined') {
                // Log a warning or error if scope is invalid, but don't crash.
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn('angularSafeUpdate received an invalid scope reference.');
                }
                if (updateFn) updateFn(); // Still execute the function if it exists.
                return;
            }

            const angularDigestPhase = $scopeRef.$root.$$phase;
            if (angularDigestPhase === '$apply' || angularDigestPhase === '$digest') {
                // Already in a digest cycle, just execute the function.
                if (updateFn) {
                    try {
                        $scopeRef.$eval(updateFn);
                    } catch (e) {
                        if (typeof console !== 'undefined' && console.error) {
                            console.error('Error during $eval in safeApply:', e);
                        }
                    }
                }
            } else {
                // Not in a digest cycle, so safely apply changes.
                if (updateFn) {
                    $scopeRef.$apply(updateFn);
                } else {
                    $scopeRef.$apply();
                }
            }
        };
    }])
    .provider('appLog', function(){
        let isDevelopmentMode = false;
        let minimumLogLevel = 'info'; // 'debug', 'info', 'warn', 'error', 'critical'
        const logLevels = { debug: 0, info: 1, warn: 2, error: 3, critical: 4 };

        this.setDevelopmentMode = function(mode){
            isDevelopmentMode = !!mode;
        };

        this.setMinimumLogLevel = function(level) {
            if (logLevels[level] !== undefined) {
                minimumLogLevel = level;
            } else {
                if (typeof console !== 'undefined' && console.warn) {
                    console.warn(`Invalid log level '${level}' provided. Defaulting to 'info'.`);
                }
                minimumLogLevel = 'info';
            }
        };

        this.$get = ['$window',function($windowSvc) {
            const consoleLogger = {};
            const consoleRef = $windowSvc.console || {
                log: () => {}, info: () => {}, warn: () => {}, error: () => {}
            }; // Fallback for environments without console.

            const _shouldLog = (level) => {
                return isDevelopmentMode && logLevels[level] >= logLevels[minimumLogLevel];
            };

            const _formatMessage = (level, args) => {
                const timestamp = new Date().toISOString();
                const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
                return [prefix, ...args];
            };

            consoleLogger.debug = function(...args){
                if (_shouldLog('debug')) {
                    consoleRef.log(..._formatMessage('debug', args));
                }
            };

            consoleLogger.log = function(...args){ // Renamed from original 'log' to 'info' conceptually
                if (_shouldLog('info')) {
                    consoleRef.info(..._formatMessage('info', args));
                }
            };

            consoleLogger.warn = function(...args){
                if (_shouldLog('warn')) {
                    consoleRef.warn(..._formatMessage('warn', args));
                }
            };

            consoleLogger.error = function(...args){
                if (_shouldLog('error')) {
                    consoleRef.error(..._formatMessage('error', args));
                }
            };

            consoleLogger.critical = function(...args){ // Always logs, even if not in dev mode.
                consoleRef.error(..._formatMessage('CRITICAL', args));
            };

            return consoleLogger;
        }];
    })
    .config(function(appLogProvider){
        // Configure the logger during the Angular config phase.
        appLogProvider.setDevelopmentMode(true); // Enable detailed logging for development.
        appLogProvider.setMinimumLogLevel('debug'); // Show all debug messages.
    });