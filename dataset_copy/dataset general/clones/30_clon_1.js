/*******************************************************************************
 * dropstore-ng v1.0.7 | (c) 2013 Jason Kulatunga, Inc. | http://analogj.mit-license.org/
 *
 * This file contains core services and factories for the dropstore-ng module.
 * It provides wrappers for Dropbox API interactions, datastore management,
 * and record handling within an AngularJS context.
 *
 ******************************************************************************/

'use strict'; // Enforce strict mode for cleaner code and fewer errors.

/**
 * @namespace Services
 * All core AngularJS services and factories for dropstore-ng.
 */

/*
 * Global Development Mode Flag
 * Set to `true` for verbose logging during development.
 * Note: This `DEVMODE` variable might be overridden or supplemented by the `logger` provider configuration.
 */
var DEVMODE = true; // when true, all Dropbox Datastore operations are logged to the JavaScript console
                    // some critical errors and warnings are always logged, even if this is false,
                    // as determined by the logger service.

/*
 * Angular module definition for `recordWrapper`.
 * This module provides a factory to simplify interaction with Dropbox Datastore records.
 */
angular.module( "recordWrapper", [] )
  .factory( 'recordWrapper', [ function ( ) {
    /*
     * Returns a function that creates a wrapper around a Dropbox Datastore record.
     * This wrapper provides convenient getter/setter properties for record fields.
     * @param {Dropbox.Datastore.Record} record - The Dropbox Datastore record object.
     * @param {string} fieldId - The identifier for the field to be wrapped.
     * @returns {object} An object with `mdl` getter and setter properties.
     */
    return function ( record, fieldId ) {

      var _record = record; // Internal reference to the Dropbox record.

      return {
        // Getter for `mdl` property. Logs read access and returns the field value.
        get mdl ( ) {
          console.log( 'Reading from mdl for field: ' + fieldId, _record );
          return _record.get( fieldId );
        },
        // Setter for `mdl` property. Logs write access and sets the field value.
        // If `val` is undefined or null, it defaults to an empty string.
        set mdl ( val ) {
          console.log( 'Writing to mdl for field: ' + fieldId, _record );
          _record.set( fieldId, val || '' );
        }
      };


    };
  } ] );


/**
 * Main module for dropstore-ng, encompassing Dropbox client and datastore management.
 * Depends on `safeApply`, `dropstoreDatastoreManager`, and `logger` services.
 */
angular.module( "dropstore-ng", [] )
  .factory( 'dropstoreClient', function ( $rootScope, $q, safeApply, dropstoreDatastoreManager, logger ) {

    // Partially based on: https://gist.github.com/katowulf/5006634 -- Acknowledging external influence.

    logger.log( 'Initializing dropstoreClient service.' );
    ///////////////////////////////////////////////////////////////////////
    // Configuration & Utility Functions
    ///////////////////////////////////////////////////////////////////////

    // create a dummy console object for dummy IE -- Original commented out block.
    // Keeping it commented out as per Type I clone rules (modify comments).
    /*
    if ( typeof ( console ) === 'undefined' ) {
      var f = function ( ) { };
      var console = { log: f, info: f, warn: f, error: f };
    }
    */

    // Add support for 'trim' method to older, less capable browsers if it doesn't exist.
    if ( !String.prototype.trim ) {
      // code for trim implementation
      String.prototype.trim = function ( ) {
        return this.replace( /^\s+|\s+$/g, '' );
      };
    }

    ///////////////////////////////////////////////////////////////////////
    // Private Helper Methods for Deferred Callbacks
    ///////////////////////////////////////////////////////////////////////

    /**
     * Creates a callback function for authentication-related Dropbox API calls.
     * This function will resolve or reject an Angular promise based on the API response.
     * @param {object} deferred - The AngularJS $q.deferred object.
     * @param {string} cmdName - The name of the Dropbox command being executed (for logging).
     * @returns {function(err, res)} A callback function suitable for Dropbox API methods.
     */
    function authDeferredCallback ( deferred, cmdName ) {
      return function ( err, res ) {
        safeApply( $rootScope, function ( ) {
          if ( err ) {
            // An error occurred during the authentication process.
            logger.log( 'dropstore "' + cmdName + '" returned an error:', err );
            deferred.reject( err ); // Reject the promise with the error.
          } else {
            // Authentication successful. Resolve with the datastore manager.
            logger.log( 'dropstore "' + cmdName + '" completed successfully:', res );
            deferred.resolve( dropstoreDatastoreManager( res ) ); // Resolve with the manager.
          }
        } );
      };
    }
    /**
     * Creates a generic callback function for most Dropbox API calls.
     * This function will resolve or reject an Angular promise based on the API response.
     * @param {object} deferred - The AngularJS $q.deferred object.
     * @param {string} cmdName - The name of the Dropbox command being executed (for logging).
     * @returns {function(err, res)} A callback function suitable for Dropbox API methods.
     */
    function basicDeferredCallback ( deferred, cmdName ) {
      return function ( err, res ) {
        safeApply( $rootScope, function ( ) {
          if ( err ) {
            // An error occurred during the API call.
            logger.log( 'dropstore "' + cmdName + '" encountered an error:', err );
            deferred.reject( err ); // Reject the promise with the error.
          } else {
            // API call completed successfully. Resolve with the result.
            logger.log( 'dropstore "' + cmdName + '" executed successfully:', res );
            deferred.resolve( res ); // Resolve the promise with the result.
          }
        } );
      };
    }

    ///////////////////////////////////////////////////////////////////////
    // Public Methods of the dropstoreClient Service
    ///////////////////////////////////////////////////////////////////////
    // This service object exposes various methods to interact with the Dropbox API.
    var dropstoreService = {};

    // The internal Dropbox client instance, initialized by `create` method.
    // This should not be called directly, but is available for custom use cases.
    dropstoreService._client = null;

    /**
     * Initializes the Dropbox API client.
     * Maps directly to the Dropbox.Client constructor.
     * For an optimal user experience, applications should use a single client for all Dropbox interactions.
     * @param {object} options - Configuration options for the Dropbox.Client.
     * @returns {object} The dropstoreService instance for chaining.
     */
    dropstoreService.create = function ( options ) {
      dropstoreService._client = new Dropbox.Client( options );
      return dropstoreService;
    };

    /**
     * Authenticates the app's user with Dropbox's API server.
     * This process typically involves redirecting the user to Dropbox for authorization.
     * Returns a promise that resolves on successful authentication or rejects on denial/error.
     * @param {object} [options] - Options for the authentication process.
     * @returns {Promise} A promise that resolves with `dropstoreDatastoreManager` or rejects with `Dropbox.AuthError`.
     */
    dropstoreService.authenticate = function ( options ) {
      var deferred = $q.defer( ); // Create a new deferred object.

      dropstoreService._client.authenticate( options, authDeferredCallback( deferred, 'authenticate' ) );
      return deferred.promise; // Return the promise.
    };

    /**
     * Retrieves the datastore manager for the authenticated client.
     * @returns {object} An instance of `dropstoreDatastoreManager`.
     */
    dropstoreService.getDatastoreManager = function ( ) {
      return dropstoreDatastoreManager( dropstoreService._client );
    };

    /**
     * Invalidates and forgets the user's Dropbox OAuth 2 access token.
     * This should be called when the user explicitly signs out of the application.
     * @param {object} [options] - Options for the sign out process.
     * @returns {Promise} A promise that resolves on successful sign out or rejects on error.
     */
    dropstoreService.signOut = function ( options ) {
      var deferred = $q.defer( ); // Initialize a deferred object for async operation.
      dropstoreService._client.signOut( options, basicDeferredCallback( deferred, 'signOut' ) );
      return deferred.promise; // Return the promise.
    };

    /**
     * Retrieves information about the currently logged-in user.
     * @param {object} [options] - Options for retrieving account info.
     * @returns {Promise} A promise that resolves with user account information or rejects on error.
     */
    dropstoreService.getAccountInfo = function ( options ) {
      var deferred = $q.defer( ); // Setup a deferred promise.
      dropstoreService._client.getAccountInfo( options, basicDeferredCallback( deferred, 'getAccountInfo' ) );
      return deferred.promise; // Return the promise.
    };

    ///////////////////////////////////////////////////////////////////////
    // Aliased Methods from Dropbox Client
    ///////////////////////////////////////////////////////////////////////
    // These methods simply wrap the underlying Dropbox.Client methods,
    // ensuring the correct context (`this`) is maintained.
    var ctx = dropstoreService._client; // Context for applying client methods.

    /**
     * Gets the Dropbox unique ID for the current user.
     * @returns {string} The Dropbox UID.
     */
    dropstoreService.dropboxUid = function ( ) {
      return dropstoreService._client.dropboxUid.apply( ctx, arguments );
    };

    /**
     * Retrieves the current client credentials.
     * @returns {object} The client's credentials.
     */
    dropstoreService.credentials = function ( ) {
      return dropstoreService._client.credentials.apply( ctx, arguments );
    };

    /**
     * Checks if the client is currently authenticated.
     * @returns {boolean} True if authenticated, false otherwise.
     */
    dropstoreService.isAuthenticated = function ( ) {
      return dropstoreService._client.isAuthenticated.apply( ctx, arguments );
    };

    /**
     * Gets detailed information about the user. (Deprecated, use getAccountInfo instead).
     * @deprecated
     * @returns {object} User information.
     */
    dropstoreService.getUserInfo = function ( ) {
      return dropstoreService._client.getUserInfo.apply( ctx, arguments );
    };

    return dropstoreService; // Return the fully configured dropstoreClient service.
  } )
  /**
   * Factory for managing Dropbox Datastores.
   * This service provides methods to open, create, delete, and list Datastores.
   */
  .factory( 'dropstoreDatastoreManager', function ( $rootScope, $q, safeApply, dropstoreDatastore, logger ) {

    return function ( _client ) {
      logger.log( 'Creating dropstoreDatastoreManager instance.' );
      ///////////////////////////////////////////////////////////////////////
      // Private Methods for Datastore Manager
      ///////////////////////////////////////////////////////////////////////
      /**
       * Callback handler for Datastore Manager operations that return a Datastore object.
       * @param {object} deferred - The AngularJS $q.deferred object.
       * @param {string} cmdName - The name of the command for logging.
       * @returns {function(err, res)} A callback that resolves with `dropstoreDatastore` or rejects with error.
       */
      function managerDeferredCallback ( deferred, cmdName ) {
        return function ( err, res ) {
          safeApply( $rootScope, function ( ) {
            if ( err ) {
              logger.log( 'dropstore datastore manager "' + cmdName + '" returned error:', err );
              deferred.reject( err );
            } else {
              logger.log( 'dropstore datastore manager "' + cmdName + '" returned successfully:', res );
              deferred.resolve( dropstoreDatastore( dropstoreDatastoreManagerService, res ) );
            }
          } );
        };
      }
      /**
       * Generic callback handler for Datastore Manager operations that return a basic result.
       * @param {object} deferred - The AngularJS $q.deferred object.
       * @param {string} cmdName - The name of the command for logging.
       * @returns {function(err, res)} A callback that resolves with `res` or rejects with error.
       */
      function basicDeferredCallback ( deferred, cmdName ) {
        return function ( err, res ) {
          safeApply( $rootScope, function ( ) {
            if ( err ) {
              logger.log( 'dropstore datastore manager "' + cmdName + '" returned error:', err );
              deferred.reject( err );
            } else {
              logger.log( 'dropstore datastore manager "' + cmdName + '" returned successfully:', res );
              deferred.resolve( res );
            }
          } );
        };
      }

      ///////////////////////////////////////////////////////////////////////
      // Public Methods of the dropstoreDatastoreManagerService
      ///////////////////////////////////////////////////////////////////////
      // This service object wraps the Dropbox Datastore Manager.
      var dropstoreDatastoreManagerService = {};
      dropstoreDatastoreManagerService._client = _client; // Store the Dropbox Client.
      dropstoreDatastoreManagerService._datastoreManager = dropstoreDatastoreManagerService._client.getDatastoreManager( ); // Get the actual Dropbox DatastoreManager.

      /**
       * Asynchronously opens your app's default datastore for the current user.
       * Returns a promise that resolves with the corresponding `dropstoreDatastore` object.
       * @returns {Promise<dropstoreDatastore>} A promise for the default datastore.
       */
      dropstoreDatastoreManagerService.openDefaultDatastore = function ( ) {
        var deferred = $q.defer( );
        dropstoreDatastoreManagerService._datastoreManager.openDefaultDatastore( managerDeferredCallback( deferred, 'openDefaultDatastore' ) );
        return deferred.promise;
      };

      /**
       * Asynchronously opens the datastore with the given ID.
       * Returns a promise that resolves with the corresponding `dropstoreDatastore` object.
       * @param {string} datastoreId - The ID of the datastore to open.
       * @returns {Promise<dropstoreDatastore>} A promise for the specified datastore.
       */
      dropstoreDatastoreManagerService.openDatastore = function ( datastoreId ) {
        var deferred = $q.defer( );
        dropstoreDatastoreManagerService._datastoreManager.openDatastore( datastoreId, managerDeferredCallback( deferred, 'openDatastore' ) );
        return deferred.promise;
      };

      /**
       * Asynchronously creates a new datastore.
       * Returns a promise that resolves with the corresponding `dropstoreDatastore` object.
       * TODO: documentation looks incorrect: No parameters. (Original comment preserved)
       * @returns {Promise<dropstoreDatastore>} A promise for the newly created datastore.
       */
      dropstoreDatastoreManagerService.createDatastore = function ( ) {
        var deferred = $q.defer( );
        dropstoreDatastoreManagerService._datastoreManager.createDatastore( managerDeferredCallback( deferred, 'createDatastore' ) );
        return deferred.promise;
      };

      /**
       * Asynchronously deletes the datastore with the given ID.
       * Deleting a nonexistent datastore is not considered an error.
       * @param {string} datastoreId - The ID of the datastore to delete.
       * @returns {Promise<null>} A promise that resolves when the datastore is deleted.
       */
      dropstoreDatastoreManagerService.deleteDatastore = function ( datastoreId ) {
        var deferred = $q.defer( );
        dropstoreDatastoreManagerService._datastoreManager.deleteDatastore( datastoreId, basicDeferredCallback( deferred, 'deleteDatastore' ) );
        return deferred.promise;
      };

      /**
       * Asynchronously retrieves the list of datastores accessible to your app for the current user.
       * @returns {Promise<Array<string>>} A promise that resolves with an array of datastore IDs.
       */
      dropstoreDatastoreManagerService.listDatastoreIds = function ( ) {
        var deferred = $q.defer( );
        dropstoreDatastoreManagerService._datastoreManager.listDatastoreIds( basicDeferredCallback( deferred, 'listDatastoreIds' ) );
        return deferred.promise;
      };

      /**
       * Shuts down the DatastoreManager. All Dropbox.Datastore instances obtained through this manager become invalid.
       * @returns {void}
       */
      dropstoreDatastoreManagerService.close = function ( ) {
        return dropstoreDatastoreManagerService._datastoreManager.close( );
      };

      ///////////////////////////////////////////////////////////////////////
      // Public PUBSUB Methods // Listen for Datastore Manager Changes.
      ///////////////////////////////////////////////////////////////////////

      /**
       * Helper function to wrap a callback for datastore list changes.
       * Ensures the callback is executed within Angular's digest cycle.
       * @param {function} callback - The user-provided callback.
       * @returns {function} A wrapped callback for Dropbox event listeners.
       */
      var datastoreListChangedHandler = function ( callback ) {
        return function ( arr ) {
          safeApply( $rootScope, function ( ) {
            callback( arr );
          } );
        };
      };

      /**
       * Subscribes to changes in the list of available datastores.
       * @param {function(Array<string>)} callback - Function to call when the list changes.
       * @returns {function} The wrapped listener function that can be used for unsubscribing.
       */
      dropstoreDatastoreManagerService.SubscribeDatastoreListChanged = function ( callback ) {
        var fn = datastoreListChangedHandler( callback );
        dropstoreDatastoreManagerService._datastoreManager.datastoreListChanged.addListener( fn );
        return fn;
      };

      /**
       * Unsubscribes a previously registered listener for datastore list changes.
       * @param {function} fn - The listener function returned by `SubscribeDatastoreListChanged`.
       */
      dropstoreDatastoreManagerService.UnsubscribeDatastoreListChanged = function ( fn ) {
        dropstoreDatastoreManagerService._datastoreManager.datastoreListChanged.removeListener( fn );
      };

      return dropstoreDatastoreManagerService; // Return the manager service instance.
    };
  } )
  /**
   * Factory for interacting with a specific Dropbox Datastore.
   * This service provides methods to get tables, list table IDs, and listen for changes within a datastore.
   */
  .factory( 'dropstoreDatastore', function ( $rootScope, $q, safeApply, logger ) {

    return function ( datastoreManager, datastore ) {
      logger.log( 'Creating dropstoreDatastore instance.' );

      ///////////////////////////////////////////////////////////////////////
      // Private Methods for Datastore Operations
      ///////////////////////////////////////////////////////////////////////

      /**
       * Resolves a deferred promise immediately with a given value.
       * Useful for operations that might be synchronous or already completed.
       * @param {object} deferred - The AngularJS $q.deferred object.
       * @param {*} value - The value to resolve the promise with.
       * @param {string} cmdName - The name of the command for logging.
       */
      function immediateDeferredCallback ( deferred, value, cmdName ) {

        safeApply( $rootScope, function ( ) {
          logger.log( 'dropstore "' + cmdName + '" returned successfully (immediate):', value );
          deferred.resolve( value );
        } );
      }
      /**
       * Generic callback handler for Datastore operations that return a basic result.
       * @param {object} deferred - The AngularJS $q.deferred object.
       * @param {string} cmdName - The name of the command for logging.
       * @returns {function(err, res)} A callback that resolves with `res` or rejects with error.
       */
      function basicDeferredCallback ( deferred, cmdName ) {
        return function ( err, res ) {
          safeApply( $rootScope, function ( ) {
            if ( err ) {
              logger.log( 'dropstore "' + cmdName + '" returned error:', err );
              deferred.reject( err );
            } else {
              logger.log( 'dropstore "' + cmdName + '" returned successfully:', res );
              deferred.resolve( res );
            }
          } );
        };
      }

      ///////////////////////////////////////////////////////////////////////
      // Public Methods of the dropstoreDatastoreService
      ///////////////////////////////////////////////////////////////////////
      // This service object wraps a specific Dropbox Datastore instance.
      var dropstoreDatastoreService = {};
      dropstoreDatastoreService._datastore = datastore; // The actual Dropbox Datastore instance.
      dropstoreDatastoreService._datastoreManager = datastoreManager; // Reference to its manager.



      ///////////////////////////////////////////////////////////////////////
      // Aliased Methods from Dropbox Datastore
      ///////////////////////////////////////////////////////////////////////
      // These methods directly expose functionality of the underlying Dropbox.Datastore object.
      var ctx = dropstoreDatastoreService._datastore; // Context for applying datastore methods.

      /**
       * Retrieves a table from the datastore by its ID.
       * @param {string} tableId - The ID of the table to retrieve.
       * @returns {Dropbox.Datastore.Table} The table object.
       */
      dropstoreDatastoreService.getTable = function ( ) {
        return dropstoreDatastoreService._datastore.getTable.apply( ctx, arguments );
      };

      /**
       * Lists the IDs of all tables within this datastore.
       * @returns {Array<string>} An array of table IDs.
       */
      dropstoreDatastoreService.listTableIds = function ( ) {
        return dropstoreDatastoreService._datastore.listTableIds.apply( ctx, arguments );
      };

      /**
       * Closes this datastore instance.
       * @returns {void}
       */
      dropstoreDatastoreService.close = function ( ) {
        return dropstoreDatastoreService._datastore.close.apply( ctx, arguments );
      };

      /**
       * Gets the unique ID of this datastore.
       * @returns {string} The datastore's ID.
       */
      dropstoreDatastoreService.getId = function ( ) {
        return dropstoreDatastoreService._datastore.getId.apply( ctx, arguments );
      };

      /**
       * Gets the current synchronization status of the datastore.
       * @returns {object} The sync status object.
       */
      dropstoreDatastoreService.getSyncStatus = function ( ) {
        return dropstoreDatastoreService._datastore.getSyncStatus.apply( ctx, arguments );
      };

      ///////////////////////////////////////////////////////////////////////
      // Public PUBSUB Methods // Listen for Datastore Changes.
      ///////////////////////////////////////////////////////////////////////

      /**
       * Helper function to wrap a callback for datastore events.
       * Ensures the callback is executed within Angular's digest cycle.
       * @param {function} callback - The user-provided callback.
       * @returns {function} A wrapped callback for Dropbox event listeners.
       */
      var datastoreEventHandler = function ( callback ) {
        return function ( arr ) {
          safeApply( $rootScope, function ( ) {
            callback( arr );
          } );
        };
      };

      /**
       * Subscribes to changes in records within this datastore.
       * Optionally, can filter events to a specific table.
       * @param {function(Dropbox.Datastore.RecordChangeEvent|Array<Dropbox.Datastore.Record>)} callback - The function to call on record changes.
       * @param {string} [tableid] - Optional ID of the table to listen for changes in.
       * @returns {function} The wrapped listener function for unsubscribing.
       */
      dropstoreDatastoreService.SubscribeRecordsChanged = function ( callback, tableid ) {
        var fn = function ( ) { }; // Initialize an empty function.
        if ( tableid ) {
          fn = datastoreEventHandler( function ( event ) {
            // Filter records changed event for the specified table.
            var records = event.affectedRecordsForTable( tableid );
            callback( records );
          } );
        } else {
          // No tableId specified, pass the raw event object.
          fn = datastoreEventHandler( callback );
        }

        dropstoreDatastoreService._datastore.recordsChanged.addListener( fn );
        return fn;
      };

      /**
       * Subscribes to synchronization status changes for this datastore.
       * @param {function(Dropbox.Datastore.SyncStatus)} callback - The function to call on sync status changes.
       * @returns {function} The wrapped listener function for unsubscribing.
       */
      dropstoreDatastoreService.SubscribeSyncStatusChanged = function ( callback ) {
        var fn = datastoreEventHandler( callback ); // Wrap the callback.
        dropstoreDatastoreService._datastore.syncStatusChanged.addListener( fn );
        return fn;
      };

      /**
       * Unsubscribes a previously registered listener for sync status changes.
       * @param {function} fn - The listener function returned by `SubscribeSyncStatusChanged`.
       */
      dropstoreDatastoreService.UnsubscribeSyncStatusChanged = function ( fn ) {
        dropstoreDatastoreService._datastore.syncStatusChanged.removeListener( fn );
      };


      return dropstoreDatastoreService; // Return the datastore service instance.
    };
  } )
  /**
   * Factory for `safeApply` utility function.
   * This ensures that changes made outside of Angular's digest cycle are properly propagated.
   */
  .factory( 'safeApply', [ function ( $rootScope ) {
    return function ( $scope, fn ) {
      var phase = $scope.$root.$$phase; // Get the current phase of the root scope.
      if ( phase === '$apply' || phase === '$digest' ) {
        // If already in a digest cycle, just execute the function.
        if ( fn ) {
          $scope.$eval( fn );
        }
      } else {
        // If not in a digest cycle, start one with $apply.
        if ( fn ) {
          $scope.$apply( fn );
        } else {
          $scope.$apply( );
        }
      }
    };
  } ] )
  /**
   * Provider for a flexible `logger` service.
   * Allows configuration of `DEVMODE` globally before the service is instantiated.
   */
  .provider( 'logger', function ( ) {
    this.DEVMODE = false; // Default development mode setting.

    /**
     * Sets the development mode flag for the logger.
     * @param {boolean} devmode - True to enable verbose logging, false otherwise.
     */
    this.setDEVMODE = function ( devmode ) {
      this.DEVMODE = devmode;
    };

    /**
     * The actual logger service factory function.
     * @param {$window} $window - AngularJS wrapper for the global window object.
     * @returns {object} The logger service instance.
     */
    this.$get = [ '$window', function ( $window ) {
      var DEVMODE = this.DEVMODE; // Capture the configured DEVMODE.
      var logger = {}; // The logger service object.

      /**
       * Logs messages to the console only if `DEVMODE` is enabled.
       * Uses `console.log.apply` to pass all arguments.
       */
      logger.log = function ( ) {
        DEVMODE && $window.console.log.apply( $window.console, arguments );
      };

      /**
       * Always logs messages to the console, regardless of `DEVMODE`.
       * Uses `console.log.apply` to pass all arguments.
       */
      logger.always = function ( ) {
        $window.console.log.apply( $window.console, arguments );
      };
      return logger; // Return the logger service.
    } ];
  } )
  /**
   * Configuration block for the `dropstore-ng` module.
   * Here, we set the `DEVMODE` for the `logger` provider to true.
   */
  .config( function ( loggerProvider ) {
    loggerProvider.setDEVMODE( true ); // Enable development mode for logging.
  } );