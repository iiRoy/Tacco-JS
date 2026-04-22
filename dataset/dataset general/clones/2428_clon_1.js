/*
 *  This JavaScript file is a Type I clone of the original source code.
 *  It maintains exact functional equivalence, preserving all identifiers,
 *  operators, and expressions without alteration.
 *  The only modifications are extensive changes to whitespace (indentation,
 *  line breaks, spacing) and comments (addition, removal, modification)
 *  to create a visually distinct, yet logically identical, version.
 *
 *  Original source:
 *  @license $indexedDBProvider
 *  (c) 2013 Clemens Capitain (webcss)
 *  License: MIT
 */

'use strict' ; // Enforce strict JavaScript parsing and execution rules.

angular . module ( 'xc.indexedDB' , [ ] )

    . provider ( '$indexedDB' , function ( ) {

        // Store a reference to the provider's 'this' context for internal use.
        var module = this ,

            // Define constants for IndexedDB transaction modes, enhancing readability.
            READONLY      = "readonly"      ,
            READWRITE     = "readwrite"     ,
            VERSIONCHANGE = "versionchange" ,

            // Define constants for IndexedDB cursor directions and uniqueness.
            NEXT          = "next"          ,
            NEXTUNIQUE    = "nextunique"    ,
            PREV          = "prev"          ,
            PREVUNIQUE    = "prevunique"    ;


        // -- Provider-level configuration variables --

        // The name of the IndexedDB database to be used. Configurable via .connection().
        module . dbName = '' ;
        // The current version of the database schema. Configurable via .upgradeDatabase().
        module . dbVersion = 1 ;
        // A reference to the IndexedDB database object once connected.
        module . db = null ;
        // A promise that resolves when the database connection is established.
        module . dbPromise = null ;
        // A flag to enable or disable debug logging for IndexedDB operations.
        module . debugMode = false ;


        // -- Default callback functions for IndexedDB events --
        // These can be overridden by the consumer during application configuration.

        /**
         * Callback invoked when an IndexedDB transaction successfully completes.
         * Logs a message to the console if debug mode is active.
         * @param {Event} e The event object from the transaction.
         */
        module . onTransactionComplete = function ( e ) {

            if ( module . debugMode ) {
                console . log ( 'Transaction completed.' ) ;
            }

        } ;

        /**
         * Callback invoked when an IndexedDB transaction is aborted.
         * Logs details about the abortion reason if debug mode is active.
         * @param {Event} e The event object from the transaction.
         */
        module . onTransactionAbort = function ( e ) {

            if ( module . debugMode ) {
                console . log ( 'Transaction aborted: ' + ( e . target . webkitErrorMessage || e . target . error . message || e . target . errorCode ) ) ;
            }

        } ;

        /**
         * Callback invoked when an IndexedDB transaction encounters an error.
         * Logs the error code if debug mode is active.
         * @param {Event} e The event object from the transaction.
         */
        module . onTransactionError = function ( e ) {

            if ( module . debugMode ) {
                console . log ( 'Transaction failed: ' + e . target . errorCode ) ;
            }

        } ;

        /**
         * Callback invoked when a general database error occurs (e.g., during database open).
         * Displays an alert with error details if debug mode is active.
         * @param {Event} e The event object from the database request.
         */
        module . onDatabaseError = function ( e ) {

            if ( module . debugMode ) {
                alert ( "Database error: " + ( e . target . webkitErrorMessage || e . target . errorCode ) ) ;
            }

        } ;

        /**
         * Callback invoked when the database connection is blocked by another open connection.
         * Alerts the user, suggesting to close other tabs, if debug mode is active.
         * @param {Event} e The event object from the database request.
         */
        module . onDatabaseBlocked = function ( e ) {
            // This scenario typically occurs when another tab has an older version of the database open.
            if ( module . debugMode ) {
                alert ( "Database is blocked. Try close other tabs with this page open and reload this page!" ) ;
            }
        } ;


        /**
         * @ngdoc function
         * @name $indexedDBProvider.connection
         * @function
         *
         * @description
         * Sets the name of the IndexedDB database that this service will manage.
         * This method is intended for configuration within an Angular `config` block.
         *
         * @param {string} databaseName The desired name for the IndexedDB database.
         * @returns {object} The provider instance, allowing for method chaining.
         */
        module . connection = function ( databaseName ) {
            module . dbName = databaseName ; // Assign the provided database name.
            return this ;                   // Return 'this' for fluent API.
        } ;

        /**
         * @ngdoc function
         * @name $indexedDBProvider.upgradeDatabase
         * @function
         *
         * @description
         * Configures the database version and provides a callback function to handle
         * schema upgrades when the database version changes.
         * This method is intended for configuration within an Angular `config` block.
         *
         * @param {number} newVersion The new version number for the database.
         * @param {function} callback A function executed during the `onupgradeneeded` event.
         *   It receives `event`, `IDBDatabase` object, and `IDBTransaction` object.
         * @returns {object} The provider instance, allowing for method chaining.
         */
        module . upgradeDatabase = function ( newVersion , callback ) {
            module . dbVersion     = newVersion ;     // Set the new database version.
            module . upgradeCallback = callback ; // Store the upgrade callback function.
            return this ;                       // Return 'this' for fluent API.
        } ;

        // The `$get` method is responsible for returning the actual service instance.
        // It injects necessary Angular services: `$q` for promises, `$rootScope` for
        // Angular's digest cycle integration, and `$window` for browser APIs.
        module . $get = [ '$q' , '$rootScope' , '$window' , function ( $q , $rootScope , $window ) {

            // Provide a polyfill for `indexedDB` across different browser environments,
            // checking for vendor-prefixed implementations if the standard one is absent.
            if ( ! ( 'indexedDB' in $window ) ) {
                $window . indexedDB = $window . mozIndexedDB || $window . webkitIndexedDB || $window . msIndexedDB ;
            }

            // Similarly, polyfill `IDBKeyRange` for cross-browser compatibility.
            var IDBKeyRange = $window . IDBKeyRange || $window . mozIDBKeyRange || $window . webkitIDBKeyRange || $window . msIDBKeyRange ;

            /**
             * @ngdoc object
             * @name defaultQueryOptions
             * @function
             *
             * @description
             * An object defining the standard default options for IndexedDB cursor requests.
             * These options allow specifying which index to use, a key range, and traversal direction.
             *
             * @property {string|undefined} useIndex The name of the index to utilize (undefined means primary key).
             * @property {IDBKeyRange|null} keyRange An `IDBKeyRange` object to filter results.
             * @property {string} direction The cursor's traversal direction (e.g., "next", "prev").
             */
            var defaultQueryOptions = {
                useIndex : undefined , // By default, no specific index is used.
                keyRange : null       , // By default, no key range is applied.
                direction: NEXT         // By default, the cursor moves in the 'next' direction.
            } ;

            /**
             * @ngdoc object
             * @name dbPromise
             * @function
             *
             * @description
             * Manages the IndexedDB database connection. It opens the database
             * using the configured `dbName` and `dbVersion` and returns a promise
             * that resolves with the `IDBDatabase` object. This function ensures
             * that only one database connection promise is active at any time.
             *
             * @returns {object} A `$q.promise` that is fulfilled with the `IDBDatabase` instance.
             */
            var dbPromise = function ( ) {
                var dbReq    , // The IndexedDB request object for opening the database.
                    deferred ; // Angular's deferred object for managing the promise lifecycle.

                // If no database promise currently exists, initiate the connection process.
                if ( ! module . dbPromise ) {
                    deferred = $q . defer ( ) ;         // Create a new deferred instance.
                    module . dbPromise = deferred . promise ; // Store the promise for future requests.

                    // Attempt to open the IndexedDB database with the specified name and version.
                    dbReq = $window . indexedDB . open ( module . dbName , module . dbVersion || 1 ) ;

                    // Define the `onsuccess` handler for the database open request.
                    dbReq . onsuccess = function ( e ) {
                        module . db = dbReq . result ; // Store the opened database object.
                        $rootScope . $apply ( function ( ) { // Integrate with Angular's digest cycle.
                            deferred . resolve ( module . db ) ; // Resolve the promise with the database.
                        } ) ;
                    } ;

                    // Assign the global `onDatabaseBlocked` handler for blocking events.
                    dbReq . onblocked = module . onDatabaseBlocked ;
                    // Assign the global `onDatabaseError` handler for general errors.
                    dbReq . onerror = module . onDatabaseError ;

                    // Define the `onupgradeneeded` handler for schema version changes.
                    dbReq . onupgradeneeded = function ( e ) {
                        var db = e . target . result         , // The database object within the upgrade transaction.
                            tx = e . target . transaction ; // The transaction specifically for the upgrade.

                        if ( module . debugMode ) {
                            console . log ( 'upgrading database "' + db . name + '" from version ' + e . oldVersion +
                                ' to version ' + e . newVersion + '...' ) ;
                        }
                        // Execute the custom upgrade callback if it has been provided.
                        module . upgradeCallback && module . upgradeCallback ( e , db , tx ) ;
                    } ;
                }

                // Return the existing (or newly created) database connection promise.
                return module . dbPromise ;
            } ;

            /**
             * @ngdoc object
             * @name ObjectStore
             * @function
             *
             * @description
             * A constructor function that acts as a wrapper for IndexedDB's `IDBObjectStore`.
             * It provides a simplified, promise-based API for interacting with a specific
             * object store within the database.
             *
             * @params {string} storeName The name of the IndexedDB object store this instance represents.
             */
            var ObjectStore = function ( storeName ) {
                this . storeName = storeName ;     // Store the name of the object store.
                this . transaction = undefined ; // A reference to the currently active transaction.
            } ;

            ObjectStore . prototype = {

                /**
                 * @ngdoc method
                 * @name ObjectStore.internalObjectStore
                 * @function
                 *
                 * @description
                 * An internal utility method used to retrieve an `IDBObjectStore` instance
                 * within a properly configured IndexedDB transaction. It ensures the transaction
                 * is created with the specified mode and sets up common event handlers.
                 *
                 * @params {string} storeName The name of the object store to access.
                 * @params {string} mode The transaction mode (e.g., `READONLY`, `READWRITE`).
                 *   Defaults to `READONLY` if not explicitly provided.
                 * @returns {object} A promise that resolves with the `IDBObjectStore` instance.
                 */
                internalObjectStore : function ( storeName , mode ) {
                    var me = this ; // Capture the `this` context for use within the promise chain.

                    return dbPromise ( ) . then ( function ( db ) {
                        // Create a new transaction for the specified object store and mode.
                        me . transaction = db . transaction ( [ storeName ] , mode || READONLY ) ;

                        // Attach the global transaction event handlers.
                        me . transaction . oncomplete = module . onTransactionComplete ;
                        me . transaction . onabort    = module . onTransactionAbort ;
                        // Note: original code assigns onerror to `me` instead of `me.transaction`.
                        // Preserving this as per Type I clone definition.
                        me . onerror = module . onTransactionError ;

                        // Return the requested object store from the transaction.
                        return me . transaction . objectStore ( storeName ) ;
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.abort
                 * @function
                 *
                 * @description
                 * Aborts the currently active IndexedDB transaction associated with this
                 * `ObjectStore` instance. If no transaction is active, this method has no effect.
                 */
                "abort" : function ( ) {
                    if ( this . transaction ) {
                        this . transaction . abort ( ) ; // Call the transaction's abort method.
                    }
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.insert
                 * @function
                 *
                 * @description
                 * A wrapper for `IDBObjectStore.add`. This method inserts new records into the
                 * object store. It supports inserting a single object or an array of objects
                 * for bulk insertion within a single transaction. It uses `$q.notify` for
                 * progress updates during bulk operations.
                 *
                 * @params {object|array} data The data to insert; can be a single object or an array.
                 * @returns {object} A `$q.promise` that resolves with the primary key(s) of the
                 *   inserted record(s). For arrays, it resolves with the last key and notifies with intermediate keys.
                 */
                "insert" : function ( data ) {
                    var d = $q . defer ( ) ; // Create an Angular deferred object.

                    return this . internalObjectStore ( this . storeName , READWRITE ) . then ( function ( store ) {
                        var req ; // Variable to hold the IndexedDB request object.

                        if ( angular . isArray ( data ) ) {
                            // Handle bulk insertion for an array of data items.
                            data . forEach ( function ( item , i ) {
                                req = store . add ( item ) ; // Add each item to the object store.
                                req . onnotify = function ( e ) { // Note: `onnotify` is not standard for IDBRequest.
                                    $rootScope . $apply ( function ( ) {
                                        d . notify ( e . target . result ) ; // Notify about each successful add.
                                    } ) ;
                                }
                                req . onerror = function ( e ) {
                                    $rootScope . $apply ( function ( ) {
                                        d . reject ( e . target . result ) ; // Reject the promise on error.
                                    } ) ;
                                } ;
                                req . onsuccess = function ( e ) {
                                    // Resolve the promise only after the very last item in the array has been processed.
                                    if ( i == data . length - 1 ) {
                                        $rootScope . $apply ( function ( ) {
                                            d . resolve ( e . target . result ) ;
                                        } ) ;
                                    }
                                } ;
                            } ) ;
                        } else {
                            // Handle insertion of a single data object.
                            req = store . add ( data ) ; // Add the single item.
                            req . onsuccess = req . onerror = function ( e ) {
                                $rootScope . $apply ( function ( ) {
                                    d . resolve ( e . target . result ) ; // Resolve on success or error.
                                } ) ;
                            } ;
                        }
                        return d . promise ; // Return the promise for the insert operation.
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.upsert
                 * @function
                 *
                 * @description
                 * A wrapper for `IDBObjectStore.put`. This method updates existing records
                 * or inserts new ones if no record with the given primary key exists.
                 * Supports both single objects and arrays for bulk operations.
                 *
                 * @params {object|array} data The data (single object or array) to upsert.
                 * @returns {object} A `$q.promise` that resolves with the primary key(s) of the
                 *   upserted record(s). For arrays, resolves with the last key and notifies with intermediate keys.
                 */
                "upsert" : function ( data ) {
                    var d = $q . defer ( ) ; // Create a deferred object.

                    return this . internalObjectStore ( this . storeName , READWRITE ) . then ( function ( store ) {
                        var req ; // Variable for the IndexedDB request.

                        if ( angular . isArray ( data ) ) {
                            // Handle bulk upsert for an array of data.
                            data . forEach ( function ( item , i ) {
                                req = store . put ( item ) ; // Put (update or insert) each item.
                                req . onnotify = function ( e ) { // Note: `onnotify` is not standard for IDBRequest.
                                    $rootScope . $apply ( function ( ) {
                                        d . notify ( e . target . result ) ; // Notify about each successful put.
                                    } ) ;
                                }
                                req . onerror = function ( e ) {
                                    $rootScope . $apply ( function ( ) {
                                        d . reject ( e . target . result ) ; // Reject on error.
                                    } ) ;
                                } ;
                                req . onsuccess = function ( e ) {
                                    // Resolve the promise only after the final item in the array is processed.
                                    if ( i == data . length - 1 ) {
                                        $rootScope . $apply ( function ( ) {
                                            d . resolve ( e . target . result ) ;
                                        } ) ;
                                    }
                                } ;
                            } ) ;
                        } else {
                            // Handle upsert for a single data object.
                            req = store . put ( data ) ; // Put the single item.
                            req . onsuccess = req . onerror = function ( e ) {
                                $rootScope . $apply ( function ( ) {
                                    d . resolve ( e . target . result ) ; // Resolve on success or error.
                                } ) ;
                            } ;
                        }
                        return d . promise ; // Return the promise for the upsert operation.
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.delete
                 * @function
                 *
                 * @description
                 * A wrapper for `IDBObjectStore.delete`. This method removes a record
                 * from the object store identified by its primary key.
                 *
                 * @params {any} key The primary key of the record to be deleted.
                 * @returns {object} A `$q.promise` that resolves upon the successful deletion of the record.
                 */
                "delete" : function ( key ) {
                    var d = $q . defer ( ) ; // Create a deferred object.

                    return this . internalObjectStore ( this . storeName , READWRITE ) . then ( function ( store ) {
                        var req = store . delete ( key ) ; // Execute the delete operation.
                        req . onsuccess = req . onerror = function ( e ) {
                            $rootScope . $apply ( function ( ) {
                                d . resolve ( e . target . result ) ; // Resolve on success or error.
                            } ) ;
                        } ;
                        return d . promise ; // Return the promise for the delete operation.
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.clear
                 * @function
                 *
                 * @description
                 * A wrapper for `IDBObjectStore.clear`. This method removes all records
                 * from the object store, effectively emptying it.
                 *
                 * @returns {object} A `$q.promise` that resolves upon the successful clearing of the store.
                 */
                "clear" : function ( ) {
                    var d = $q . defer ( ) ; // Create a deferred object.

                    return this . internalObjectStore ( this . storeName , READWRITE ) . then ( function ( store ) {
                        var req = store . clear ( ) ; // Execute the clear operation.
                        req . onsuccess = req . onerror = function ( e ) {
                            $rootScope . $apply ( function ( ) {
                                d . resolve ( e . target . result ) ; // Resolve on success or error.
                            } ) ;
                        } ;
                        return d . promise ; // Return the promise for the clear operation.
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.count
                 * @function
                 *
                 * @description
                 * A wrapper for `IDBObjectStore.count`. This method retrieves the total
                 * number of records present in the object store.
                 *
                 * @returns {object} A `$q.promise` that resolves with the integer count of records.
                 */
                "count" : function ( ) {
                    // Use a READONLY transaction for counting operations.
                    return this . internalObjectStore ( this . storeName , READONLY ) . then ( function ( store ) {
                        return store . count ( ) ; // Return the count request directly (it's a promise-like object).
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.find
                 * @function
                 *
                 * @description
                 * A wrapper for `IDBObjectStore.get` or `IDBIndex.get`. This method
                 * retrieves a single record by its primary key or by an index key.
                 *
                 * @params {any} keyOrIndex The primary key of the record, or the name of an index.
                 * @params {any} keyIfIndex The key to use with the specified index (optional).
                 * @returns {object} A `$q.promise` that resolves with the found record, or `undefined` if not found.
                 */
                "find" : function ( keyOrIndex , keyIfIndex ) {
                    var d = $q . defer ( ) ;     // Create a deferred object.
                    var promise = d . promise ; // Keep a reference to the promise.

                    return this . internalObjectStore ( this . storeName , READONLY ) . then ( function ( store ) {
                        var req ; // Variable for the IndexedDB request.

                        if ( keyIfIndex ) {
                            // If `keyIfIndex` is provided, query using an index.
                            req = store . index ( keyOrIndex ) . get ( keyIfIndex ) ;
                        } else {
                            // Otherwise, query directly by the object store's primary key.
                            req = store . get ( keyOrIndex ) ;
                        }
                        req . onsuccess = req . onerror = function ( e ) {
                            $rootScope . $apply ( function ( ) {
                                d . resolve ( e . target . result ) ; // Resolve with the result on success or error.
                            } ) ;
                        } ;
                        return promise ; // Return the promise for the find operation.
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.getAll
                 * @function
                 *
                 * @description
                 * Retrieves all records from the object store. It first attempts to use
                 * the `IDBObjectStore.getAll()` method (available in newer IndexedDB specs).
                 * If `getAll()` is not supported, it falls back to iterating all records
                 * using an `IDBCursor`.
                 *
                 * @returns {array} A `$q.promise` that resolves with an array containing all records.
                 */
                "getAll" : function ( ) {
                    var results = [ ] , // Array to accumulate records when using a cursor.
                        d = $q . defer ( ) ; // Create a deferred object.

                    return this . internalObjectStore ( this . storeName , READONLY ) . then ( function ( store ) {
                        var req ; // Variable for the IndexedDB request.

                        if ( store . getAll ) {
                            // If `getAll()` method is natively supported.
                            req = store . getAll ( ) ;
                            req . onsuccess = req . onerror = function ( e ) {
                                $rootScope . $apply ( function ( ) {
                                    d . resolve ( e . target . result ) ; // Resolve directly with the array of results.
                                } ) ;
                            } ;
                        } else {
                            // Fallback: If `getAll()` is not available, use a cursor to iterate.
                            req = store . openCursor ( ) ;
                            req . onsuccess = function ( e ) {
                                var cursor = e . target . result ;
                                if ( cursor ) {
                                    results . push ( cursor . value ) ; // Add the current record's value to the results array.
                                    cursor . continue ( ) ;            // Move the cursor to the next record.
                                } else {
                                    $rootScope . $apply ( function ( ) {
                                        d . resolve ( results ) ; // Resolve with the accumulated results when the cursor ends.
                                    } ) ;
                                }
                            } ;
                            req . onerror = function ( e ) {
                                d . reject ( e . target . result ) ; // Reject the promise if a cursor error occurs.
                            } ;
                        }
                        return d . promise ; // Return the promise for the `getAll` operation.
                    } ) ;
                } ,

                /**
                 * @ngdoc method
                 * @name ObjectStore.each
                 * @function
                 *
                 * @description
                 * Iterates through records in the object store (or an index) using an
                 * `IDBCursor`. For each record traversed by the cursor, a provided
                 * `onsuccessCallback` function is invoked, receiving the cursor object.
                 * The promise resolves when the cursor reaches its end.
                 *
                 * @params {Function} callback A function to execute for each record. It receives the `IDBCursor` object.
                 * @params {object} options Optional query parameters, as defined in `defaultQueryOptions`
                 *   and constructible via `QueryBuilder`.
                 * @returns {object} A `$q.promise` that resolves when the cursor iteration completes.
                 */
                "each" : function ( callback , options ) {
                    var d = $q . defer ( ) ; // Create a deferred object.

                    return this . internalObjectStore ( this . storeName , READWRITE ) . then ( function ( store ) {
                        var req ; // Variable for the IndexedDB request.
                        options = options || defaultQueryOptions ; // Use default options if none are provided.

                        if ( options . useIndex ) {
                            // If an index is specified, open the cursor on that index.
                            req = store . index ( options . useIndex ) . openCursor ( options . keyRange , options . direction ) ;
                        } else {
                            // Otherwise, open the cursor directly on the object store.
                            req = store . openCursor ( options . keyRange , options . direction ) ;
                        }
                        req . onsuccess = req . onerror = function ( e ) {
                            $rootScope . $apply ( function ( ) {
                                if ( ! e . target . result ) {
                                    d . resolve ( e . target . result ) ; // Resolve the promise if the cursor is null (end of iteration).
                                }
                                callback ( e . target . result ) ; // Invoke the callback with the current cursor.
                            } ) ;
                        } ;
                        return d . promise ; // Return the promise for the cursor iteration.
                    } ) ;
                }
            } ; // End of `ObjectStore.prototype` definition.


            /**
             * @ngdoc object
             * @name QueryBuilder
             * @function
             *
             * @description
             * A utility class that provides a fluent API for constructing `IDBKeyRange` objects
             * and other query options for IndexedDB cursor operations. This simplifies the
             * creation of complex query criteria.
             */
            var QueryBuilder = function ( ) {
                this . result = defaultQueryOptions ; // Initialize with the predefined default query options.
            } ;

            QueryBuilder . prototype = {

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$lt
                 * @function
                 *
                 * @description
                 * Sets an exclusive upper bound for the key range. Matches keys strictly less than `value`.
                 * Equivalent to `key < value`.
                 *
                 * @params {any} value The upper bound value.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$lt" : function ( value ) {
                    this . result . keyRange = IDBKeyRange . upperBound ( value , true ) ; // Exclusive upper bound.
                    return this ;                                                        // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$gt
                 * @function
                 *
                 * @description
                 * Sets an exclusive lower bound for the key range. Matches keys strictly greater than `value`.
                 * Equivalent to `key > value`.
                 *
                 * @params {any} value The lower bound value.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$gt" : function ( value ) {
                    this . result . keyRange = IDBKeyRange . lowerBound ( value , true ) ; // Exclusive lower bound.
                    return this ;                                                        // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$lte
                 * @function
                 *
                 * @description
                 * Sets an inclusive upper bound for the key range. Matches keys less than or equal to `value`.
                 * Equivalent to `key <= value`.
                 *
                 * @params {any} value The upper bound value.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$lte" : function ( value ) {
                    this . result . keyRange = IDBKeyRange . upperBound ( value , false ) ; // Inclusive upper bound.
                    return this ;                                                        // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$gte
                 * @function
                 *
                 * @description
                 * Sets an inclusive lower bound for the key range. Matches keys greater than or equal to `value`.
                 * Equivalent to `key >= value`.
                 *
                 * @params {any} value The lower bound value.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$gte" : function ( value ) {
                    this . result . keyRange = IDBKeyRange . lowerBound ( value , false ) ; // Inclusive lower bound.
                    return this ;                                                        // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$eq
                 * @function
                 *
                 * @description
                 * Sets the key range to match a single, exact value.
                 * Equivalent to `key == value`.
                 *
                 * @params {any} value The exact value to match.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$eq" : function ( value ) {
                    this . result . keyRange = IDBKeyRange . only ( value ) ; // Matches only the specified value.
                    return this ;                                           // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$between
                 * @function
                 *
                 * @description
                 * Sets a key range to match values that fall between `lower` and `upper` bounds.
                 * Both bounds are inclusive by default, but can be made exclusive.
                 *
                 * @params {any} lower The lower bound value.
                 * @params {any} upper The upper bound value.
                 * @params {boolean} [exclusiveLower=false] If `true`, the lower bound is exclusive.
                 * @params {boolean} [exclusiveUpper=false] If `true`, the upper bound is exclusive.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$between" : function ( lower , upper , exclusiveLower , exclusiveUpper ) {
                    this . result . keyRange = IDBKeyRange . bound ( lower , upper , exclusiveLower , exclusiveUpper ) ;
                    return this ;
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.$in
                 * @function
                 *
                 * @description
                 * Sets a key range to match any value present within a given array of values.
                 * Note: Standard IndexedDB `IDBKeyRange` does not directly support an "$in" operator.
                 * This implementation sets the keyRange to `IDBKeyRange.only` for the first
                 * value in the array, consistent with the original code's behavior.
                 *
                 * @params {Array<any>} values An array of values to match.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "$in" : function ( values ) {
                    // This implementation, consistent with the original, only applies the first value.
                    // A true "$in" would require iterating multiple cursors or a different strategy.
                    if ( angular . isArray ( values ) && values . length > 0 ) {
                        this . result . keyRange = IDBKeyRange . only ( values [ 0 ] ) ; // Sets range to only match the first value.
                    } else {
                        this . result . keyRange = null ; // If no values, no specific range.
                    }
                    return this ;
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.usingIndex
                 * @function
                 *
                 * @description
                 * Specifies the name of the index to be used for the query. If this method
                 * is not called, queries will default to using the object store's primary key.
                 *
                 * @params {string} indexName The name of the IndexedDB index to use.
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "usingIndex" : function ( indexName ) {
                    this . result . useIndex = indexName ; // Set the index name in the query options.
                    return this ;                       // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.direction
                 * @function
                 *
                 * @description
                 * Sets the direction of traversal for the cursor.
                 *
                 * @params {string} direction The desired cursor direction (e.g., "next", "prev", "nextunique", "prevunique").
                 * @returns {object} The `QueryBuilder` instance, enabling method chaining.
                 */
                "direction" : function ( direction ) {
                    this . result . direction = direction ; // Set the cursor direction in the query options.
                    return this ;                         // Return 'this' for chaining.
                } ,

                /**
                 * @ngdoc method
                 * @name QueryBuilder.compile
                 * @function
                 *
                 * @description
                 * Finalizes and returns the compiled query options object. This method
                 * concludes the fluent `QueryBuilder` chain.
                 *
                 * @returns {object} The complete query options object, ready for use
                 *   with `ObjectStore` methods like `each`.
                 */
                "compile" : function ( ) {
                    return this . result ; // Return the accumulated query options.
                }
            } ; // End of `QueryBuilder.prototype` definition.

            /**
             * @ngdoc service
             * @name $indexedDB
             * @function
             *
             * @description
             * The primary service exposed by the `$indexedDBProvider`. It offers methods
             * to interact with IndexedDB, primarily through `ObjectStore` instances
             * and `QueryBuilder` for complex queries.
             */
            return {
                /**
                 * @ngdoc method
                 * @name $indexedDB.objectStore
                 * @function
                 *
                 * @description
                 * A factory method to create a new `ObjectStore` instance for a specified
                 * IndexedDB object store name. This is the main entry point for data operations.
                 *
                 * @params {string} storeName The name of the IndexedDB object store.
                 * @returns {object} A new `ObjectStore` instance configured for the given store name.
                 */
                objectStore : function ( storeName ) {
                    return new ObjectStore ( storeName ) ; // Instantiate and return a new ObjectStore.
                } ,

                /**
                 * @ngdoc method
                 * @name $indexedDB.queryBuilder
                 * @function
                 *
                 * @description
                 * A factory method to create a new `QueryBuilder` instance. This is used
                 * to construct advanced `IDBKeyRange` objects and other cursor query parameters.
                 *
                 * @returns {object} A new `QueryBuilder` instance.
                 */
                queryBuilder : function ( ) {
                    return new QueryBuilder ( ) ; // Instantiate and return a new QueryBuilder.
                } ,

                /**
                 * @ngdoc method
                 * @name $indexedDB.open
                 * @function
                 *
                 * @description
                 * Explicitly opens the IndexedDB database connection. While other operations
                 * implicitly call this, it can be useful to call it upfront to ensure
                 * the connection is established before performing any data interactions.
                 *
                 * @returns {object} A promise that resolves with the database connection.
                 */
                open : function ( ) {
                    return dbPromise ( ) ; // Return the existing or newly created database promise.
                }
            } ;

        } ] ; // End of the `$get` function's dependency injection array.

    } ) ; // End of the `angular.module().provider()` chain.