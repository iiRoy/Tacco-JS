// cloud-storage-interface v2.1.3 | (c) 2024 Alpha Solutions, Corp. | https://alpha-solutions.org/license
//
'use strict';

// Core Application Services
const TRACE_ACTIVE = !false;
// When set to true, all operations related to the cloud storage are logged to the browser's console.
// Important system errors and warnings are always recorded, irrespective of this setting.

angular.module("datumLinkerModule", [ ] )
  .factory('entryAdapter', [
    function() {
      return function (currentItem, propIdentifier) {
        let m_linkedItem = currentItem;
        return {
          // Getter for the model value: logs access and retrieves from the linked item.
          get modelValue() {
            systemLogger.info('Accessing model value for property: ' + propIdentifier, m_linkedItem);
            return m_linkedItem.get(propIdentifier);
          },
          // Setter for the model value: logs update and sets the value on the linked item.
          set modelValue(inputValue) {
            systemLogger.info('Updating model value for property: ' + propIdentifier, m_linkedItem);
            m_linkedItem.set(propIdentifier, inputValue || "");
          }
        };
      };
    }
  ])


angular.module("cloudVaultClient", [ ])
  .factory('cloudVaultSvc', function(appRootScope, promiseService, digestCycleUtil, dataHiveAdmin, eventTracer) {

    // Adapted from: https://gist.github.com/anotherdev/6543210
    eventTracer.trace('Initializing cloudVaultSvc component');

    // Section for configuration settings
    ///////////////////////////////////////////////////////////////////////

    // Polyfill for String.prototype.trim for older browser environments.
    if (!String.prototype.trim) {
      String.prototype.trim = function() {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
      };
    }

    // Internal helper functions
    ///////////////////////////////////////////////////////////////////////
    /**
     * Creates a callback function suitable for authentication-related asynchronous operations.
     * It resolves or rejects a promise based on the operation's outcome.
     * @param {object} promiseHandle - The deferred object to resolve/reject.
     * @param {string} operationLabel - A descriptive label for the current operation.
     * @returns {Function} A callback function for async results.
     */
    function authenticationPromiseHandler(promiseHandle, operationLabel) {
      return function(issue, outcome) {
        digestCycleUtil(appRootScope, function() {
          if (issue) {
            eventTracer.trace('CloudVault operation "' + operationLabel + '" encountered an error', issue);
            promiseHandle.reject(issue);
          } else {
            eventTracer.trace('CloudVault operation "' + operationLabel + '" completed successfully', outcome);
            promiseHandle.resolve(dataHiveAdmin(outcome));
          }
        });
      };
    }

    /**
     * Generates a basic callback function for general asynchronous operations.
     * It resolves or rejects a promise with the raw result.
     * @param {object} promiseHandle - The deferred object to resolve/reject.
     * @param {string} operationLabel - A descriptive label for the current operation.
     * @returns {Function} A callback function for async results.
     */
    function simpleResultCb(promiseHandle, operationLabel) {
      return function(issue, outcome) {
        digestCycleUtil(appRootScope, function() {
          if (issue) {
            eventTracer.trace('CloudVault operation "' + operationLabel + '" encountered an error', issue);
            promiseHandle.reject(issue);
          } else {
            eventTracer.trace('CloudVault operation "' + operationLabel + '" completed successfully', outcome);
            promiseHandle.resolve(outcome);
          }
        });
      };
    }

    // Publicly exposed methods for the CloudVault Service
    ///////////////////////////////////////////////////////////////////////
    // This object contains all external functionalities and should be used with care for custom calls.
    const cloudVaultService = {};

    /**
     * Initializes the Dropbox API client for a user or application.
     * It's recommended to use a single client instance for all interactions.
     * Directly maps to the Dropbox.Client constructor.
     * @param {object} clientConfiguration - Configuration options for the client.
     * @returns {object} The initialized cloudVaultService instance.
     */
    cloudVaultService.configureClient = function(clientConfiguration) {
      cloudVaultService.clientInstance = new Dropbox.Client(clientConfiguration);
      return cloudVaultService;
    };

    /**
     * Initiates the authentication flow for the current application user with the Dropbox API.
     * This typically redirects the user to an authorization page.
     * If permission is granted, the app is authorized; otherwise, an error is returned.
     * To trigger manually, attach this method to a UI element's click event.
     * @param {object} authOptions - Authentication-specific configuration.
     * @returns {Promise} A promise that resolves upon successful authentication.
     */
    cloudVaultService.initiateAuth = function(authOptions) {
      let promiseHandle = promiseService.defer();

      cloudVaultService.clientInstance.authenticate(authOptions, authenticationPromiseHandler(promiseHandle, 'initiateAuth'));
      return promiseHandle.promise;
    };

    /**
     * Retrieves the manager for cloud storage datastores.
     * @returns {object} An instance of the data hive administrator.
     */
    cloudVaultService.obtainDataManager = function() {
      return dataHiveAdmin(cloudVaultService.clientInstance);
    };

    /**
     * Revokes and clears the user's Dropbox OAuth 2 access token.
     * This method is crucial for user privacy when a user explicitly logs out.
     * @param {object} signOutOptions - Options for the sign-out process.
     * @returns {Promise} A promise that resolves when the session is terminated.
     */
    cloudVaultService.terminateSession = function(signOutOptions) {
      let promiseHandle = promiseService.defer();
      cloudVaultService.clientInstance.signOut(signOutOptions, simpleResultCb(promiseHandle, 'terminateSession'));
      return promiseHandle.promise;
    };

    /**
     * Fetches detailed information about the currently logged-in user.
     * @param {object} infoOptions - Options for retrieving account details.
     * @returns {Promise} A promise resolving with the user's account information.
     */
    cloudVaultService.queryAccountDetails = function(infoOptions) {
      let promiseHandle = promiseService.defer();
      cloudVaultService.clientInstance.getAccountInfo(infoOptions, simpleResultCb(promiseHandle, 'queryAccountDetails'));
      return promiseHandle.promise;
    };

    // Proxied Methods from the underlying client
    ///////////////////////////////////////////////////////////////////////
    let executionContext = cloudVaultService.clientInstance;

    cloudVaultService.cloudAccountID = function() {
      return cloudVaultService.clientInstance.dropboxUid.apply(executionContext, arguments);
    };
    cloudVaultService.accessCredentials = function() {
      return cloudVaultService.clientInstance.credentials.apply(executionContext, arguments);
    };
    cloudVaultService.hasValidSession = function() {
      return cloudVaultService.clientInstance.isAuthenticated.apply(executionContext, arguments);
    };
    cloudVaultService.retrieveUserDetails = function() {
      return cloudVaultService.clientInstance.getUserInfo.apply(executionContext, arguments);
    };

    return cloudVaultService;
  })
  .factory('dataHiveAdmin', function(appRootScope, promiseService, digestCycleUtil, cloudDataStore, eventTracer) {

    return function(clientRef) {
      eventTracer.trace('Instantiating dataHiveAdmin for client');

      // Internal utility functions for promise handling
      ///////////////////////////////////////////////////////////////////////
      /**
       * Creates a specialized callback for manager-level datastore operations.
       * It resolves with a new `cloudDataStore` instance upon success.
       * @param {object} promiseHandle - The deferred object to resolve/reject.
       * @param {string} operationLabel - A label for the current admin task.
       * @returns {Function} A callback function for async results.
       */
      function adminTaskHandler(promiseHandle, operationLabel) {
        return function(issue, outcome) {
          digestCycleUtil(appRootScope, function() {
            if (issue) {
              eventTracer.trace('CloudVault admin operation "' + operationLabel + '" encountered an error', issue);
              promiseHandle.reject(issue);
            } else {
              eventTracer.trace('CloudVault admin operation "' + operationLabel + '" completed successfully', outcome);
              promiseHandle.resolve(cloudDataStore(dataHiveManagerService, outcome));
            }
          });
        };
      }

      /**
       * Generates a simple callback function for general manager operations.
       * It resolves or rejects a promise with the raw result.
       * @param {object} promiseHandle - The deferred object to resolve/reject.
       * @param {string} operationLabel - A label for the current admin task.
       * @returns {Function} A callback function for async results.
       */
      function simpleResultCb(promiseHandle, operationLabel) {
        return function(issue, outcome) {
          digestCycleUtil(appRootScope, function() {
            if (issue) {
              eventTracer.trace('CloudVault admin operation "' + operationLabel + '" encountered an error', issue);
              promiseHandle.reject(issue);
            } else {
              eventTracer.trace('CloudVault admin operation "' + operationLabel + '" completed successfully', outcome);
              promiseHandle.resolve(outcome);
            }
          });
        };
      }

      // Public methods for managing Datastores
      ///////////////////////////////////////////////////////////////////////
      // This service provides functionality to interact with the underlying datastore manager.
      const dataHiveManagerService = {};
      dataHiveManagerService.clientReference = clientRef;
      dataHiveManagerService.linkedDataManager = dataHiveManagerService.clientReference.getDatastoreManager();

      /**
       * Asynchronously opens the application's default datastore for the active user.
       * Returns a promise yielding the corresponding Datastore object or an error.
       * @returns {Promise<object>} Promise resolving to a Dropbox.Datastore instance.
       */
      dataHiveManagerService.accessDefaultStorage = function() {
        let promiseHandle = promiseService.defer();
        dataHiveManagerService.linkedDataManager.openDefaultDatastore(adminTaskHandler(promiseHandle, 'accessDefaultStorage'));
        return promiseHandle.promise;
      };

      /**
       * Asynchronously opens a specific datastore identified by its ID.
       * Returns a promise yielding the corresponding Datastore object or an error.
       * @param {string} storageKey - The unique identifier of the datastore.
       * @returns {Promise<object>} Promise resolving to a Dropbox.Datastore instance.
       */
      dataHiveManagerService.accessNamedStorage = function(storageKey) {
        let promiseHandle = promiseService.defer();
        dataHiveManagerService.linkedDataManager.openDatastore(storageKey, adminTaskHandler(promiseHandle, 'accessNamedStorage'));
        return promiseHandle.promise;
      };

      /**
       * Asynchronously creates a brand new datastore.
       * Returns a promise yielding the newly created Datastore object or an error.
       * Note: The original documentation might be incomplete regarding parameters.
       * @returns {Promise<object>} Promise resolving to a new Dropbox.Datastore instance.
       */
      dataHiveManagerService.provisionNewDataStore = function() {
        let promiseHandle = promiseService.defer();
        dataHiveManagerService.linkedDataManager.createDatastore(adminTaskHandler(promiseHandle, 'provisionNewDataStore'));
        return promiseHandle.promise;
      };

      /**
       * Asynchronously removes the datastore associated with the given ID.
       * Deleting a non-existent datastore is not considered an error condition.
       * @param {string} storageKey - The unique identifier of the datastore to delete.
       * @returns {Promise<null>} Promise resolving when the datastore is deleted.
       */
      dataHiveManagerService.removeDataStore = function(storageKey) {
        let promiseHandle = promiseService.defer();
        dataHiveManagerService.linkedDataManager.deleteDatastore(storageKey, simpleResultCb(promiseHandle, 'removeDataStore'));
        return promiseHandle.promise;
      };

      /**
       * Asynchronously retrieves a listing of all datastore IDs accessible to the current user and application.
       * A brief delay might occur before newly created or recently deleted datastores appear/disappear from this list.
       * @returns {Promise<Array<string>>} Promise resolving to an array of datastore identifiers.
       */
      dataHiveManagerService.enumerateStorageKeys = function() {
        let promiseHandle = promiseService.defer();
        dataHiveManagerService.linkedDataManager.listDatastoreIds(simpleResultCb(promiseHandle, 'enumerateStorageKeys'));
        return promiseHandle.promise;
      };

      /**
       * Shuts down the DatastoreManager instance.
       * All Dropbox.Datastore instances obtained through this manager will become invalid after this call.
       * @returns {void}
       */
      dataHiveManagerService.deactivate = function() {
        return dataHiveManagerService.linkedDataManager.close();
      };

      // Public Publisher-Subscriber methods for datastore events
      ///////////////////////////////////////////////////////////////////////
      /**
       * Helper function to wrap a user-provided callback for Angular's digest cycle.
       * @param {Function} userCallback - The function to be executed when the list changes.
       * @returns {Function} A wrapped callback for internal use.
       */
      let storageListUpdateHandler = function(userCallback) {
        return function(changeArray) {
          digestCycleUtil(appRootScope, function() {
            userCallback(changeArray);
          });
        };
      };

      /**
       * Registers a listener for changes to the list of available datastores.
       * @param {Function} userCallback - The function to call when the list of datastores changes.
       * @returns {Function} The internal listener function that was registered.
       */
      dataHiveManagerService.onStorageListUpdate = function(userCallback) {
        let internalListenerFn = storageListUpdateHandler(userCallback);
        dataHiveManagerService.linkedDataManager.datastoreListChanged.addListener(internalListenerFn);
        return internalListenerFn;
      };

      /**
       * Unregisters a previously registered listener for datastore list changes.
       * @param {Function} internalListenerFn - The function returned by `onStorageListUpdate`.
       */
      dataHiveManagerService.offStorageListUpdate = function(internalListenerFn) {
        dataHiveManagerService.linkedDataManager.datastoreListChanged.removeListener(internalListenerFn);
      };

      return dataHiveManagerService;
    };
  })
  .factory('cloudDataStore', function(appRootScope, promiseService, digestCycleUtil, eventTracer) {

    return function(storageManagerInstance, storageInstance) {
      eventTracer.trace('Instantiating cloudDataStore');

      // Internal helper functions for promise handling
      ///////////////////////////////////////////////////////////////////////
      /**
       * Resolves a promise immediately with a given value, ensuring it runs within Angular's digest cycle.
       * @param {object} promiseHandle - The deferred object to resolve.
       * @param {*} outcomeData - The value to resolve the promise with.
       * @param {string} operationLabel - A label for the operation.
       */
      function quickCompletionHandler(promiseHandle, outcomeData, operationLabel) {
        digestCycleUtil(appRootScope, function() {
          eventTracer.trace('CloudVault operation "' + operationLabel + '" completed successfully instantly', outcomeData);
          promiseHandle.resolve(outcomeData);
        });
      }

      /**
       * Creates a standard callback function for asynchronous datastore operations.
       * It resolves or rejects a promise based on the operation's outcome.
       * @param {object} promiseHandle - The deferred object to resolve/reject.
       * @param {string} operationLabel - A label for the current operation.
       * @returns {Function} A callback function for async results.
       */
      function simpleResultCb(promiseHandle, operationLabel) {
        return function(issue, outcome) {
          digestCycleUtil(appRootScope, function() {
            if (issue) {
              eventTracer.trace('CloudVault operation "' + operationLabel + '" encountered an error', issue);
              promiseHandle.reject(issue);
            } else {
              eventTracer.trace('CloudVault operation "' + operationLabel + '" completed successfully', outcome);
              promiseHandle.resolve(outcome);
            }
          });
        };
      }

      // Public interface for the Cloud Data Store Service
      ///////////////////////////////////////////////////////////////////////
      // This service provides direct interaction with a specific datastore.
      const storageAccessSvc = {};
      storageAccessSvc.currentStorageRef = storageInstance;
      storageAccessSvc.dataStoreHandler = storageManagerInstance;

      // Proxied methods from the underlying Datastore object
      ///////////////////////////////////////////////////////////////////////
      let currentContext = storageAccessSvc.currentStorageRef;

      storageAccessSvc.fetchTable = function() {
        return storageAccessSvc.currentStorageRef.getTable.apply(currentContext, arguments);
      };
      storageAccessSvc.enumerateTableKeys = function() {
        return storageAccessSvc.currentStorageRef.listTableIds.apply(currentContext, arguments);
      };
      storageAccessSvc.deactivate = function() {
        return storageAccessSvc.currentStorageRef.close.apply(currentContext, arguments);
      };
      storageAccessSvc.obtainIdentifier = function() {
        return storageAccessSvc.currentStorageRef.getId.apply(currentContext, arguments);
      };
      storageAccessSvc.querySynchronizationStatus = function() {
        return storageAccessSvc.currentStorageRef.getSyncStatus.apply(currentContext, arguments);
      };

      // Public Publisher-Subscriber methods for datastore events
      ///////////////////////////////////////////////////////////////////////
      /**
       * Helper function to wrap a user-provided callback for Angular's digest cycle.
       * @param {Function} userCallback - The function to be executed when an event occurs.
       * @returns {Function} A wrapped callback for internal use.
       */
      let dataStoreEventCb = function(userCallback) {
        return function(changeArray) {
          digestCycleUtil(appRootScope, function() {
            userCallback(changeArray);
          });
        };
      };

      /**
       * Subscribes to changes in records within this datastore.
       * Optionally filters changes to a specific table.
       * @param {Function} userCallback - Function to call with modified records.
       * @param {string} [dataSetID] - Optional ID of the table to watch.
       * @returns {Function} The internal listener function that was registered.
       */
      storageAccessSvc.onEntriesModified = function(userCallback, dataSetID) {
        let internalListenerFn = function() {};
        if (dataSetID) {
          internalListenerFn = dataStoreEventCb(function(updateEvent) {
            let modifiedEntries = updateEvent.affectedRecordsForTable(dataSetID);
            userCallback(modifiedEntries);
          });
        } else {
          internalListenerFn = dataStoreEventCb(userCallback);
        }

        storageAccessSvc.currentStorageRef.recordsChanged.addListener(internalListenerFn);
        return internalListenerFn;
      };

      /**
       * Subscribes to changes in the synchronization status of this datastore.
       * @param {Function} userCallback - Function to call with the new sync status.
       * @returns {Function} The internal listener function that was registered.
       */
      storageAccessSvc.onSyncStateChange = function(userCallback) {
        let internalListenerFn = dataStoreEventCb(userCallback);
        storageAccessSvc.currentStorageRef.syncStatusChanged.addListener(internalListenerFn);
        return internalListenerFn;
      };

      /**
       * Unsubscribes a previously registered listener for synchronization status changes.
       * @param {Function} internalListenerFn - The function returned by `onSyncStateChange`.
       */
      storageAccessSvc.offSyncStateChange = function(internalListenerFn) {
        storageAccessSvc.currentStorageRef.syncStatusChanged.removeListener(internalListenerFn);
      };

      return storageAccessSvc;
    };
  })
  .factory('digestCycleUtil', [
    function() {
      return function(targetScope, operationFn) {
        let lifecyclePhase = targetScope.$root.$$phase;
        if (lifecyclePhase === '$apply' || lifecyclePhase === '$digest') {
          if (operationFn) {
            targetScope.$eval(operationFn);
          }
        } else {
          if (operationFn) {
            targetScope.$apply(operationFn);
          } else {
            targetScope.$apply();
          }
        }
      };
    }
  ])
  .provider('eventTracer', function() {
    this.TRACE_ACTIVE = false;

    this.setTraceStatus = function(activeStatus) {
      this.TRACE_ACTIVE = activeStatus;
    };

    this.$get = [
      '$window',
      function(globalWindow) {
        let currentTraceStatus = this.TRACE_ACTIVE;
        let systemLogger = {};
        systemLogger.trace = function() {
          currentTraceStatus && globalWindow.console.log.apply(globalWindow.console, arguments);
        };
        systemLogger.info = function() { // Renamed from 'log' to 'info' for variety
          currentTraceStatus && globalWindow.console.log.apply(globalWindow.console, arguments);
        };
        systemLogger.always = function() {
          globalWindow.console.log.apply(globalWindow.console, arguments);
        };
        return systemLogger;
      }
    ];
  })
  .config(function(eventTracerProvider) {
    eventTracerProvider.setTraceStatus(true);
  });