/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators, and expressions
 * remain completely unchanged.
 *
 * The only modifications are to whitespace (indentation, spacing, blank lines)
 * and comments, making the result visually different but logically identical.
 */

( function ( ) {
    // Declare global variables for this IIFE scope.
    var callbacks,
        cbref,
        counter,
        getOptions,
        root;

    // Establish the global context, typically 'window' in browsers or 'global' in Node.js.
    root = this;

    // Initialize an object to store callback functions.
    callbacks = { };

    // Initialize a counter for generating unique callback references.
    counter = 0;

    /*
     * Generates a unique callback reference string and stores the provided hash
     * object in the global callbacks registry.
     * @param {object} hash - An object containing success and/or error callbacks.
     * @returns {string} The unique callback reference string.
     */
    cbref = function ( hash ) {
        var f; // Declare a variable to hold the generated reference string.

        // Increment the counter and prepend "cb" to create a unique reference.
        f = "cb" + ( counter += 1 );

        // Store the provided hash object under the generated reference.
        callbacks[ f ] = hash;

        // Return the unique reference string.
        return f;
    };


    /*
     * Processes options, extracting success and error callbacks if provided,
     * and assigns a unique callback reference to the options object.
     * @param {object} opts - The options object to modify.
     * @param {function} success - The success callback function.
     * @param {function} error - The error callback function.
     * @returns {object} The modified options object.
     */
    getOptions = function ( opts, success, error ) {
        var cb,        // Object to hold success and error callbacks.
            has_cbs;   // Flag to indicate if any callbacks were provided.

        cb = { };
        has_cbs = false;

        // Check if a success callback function is provided.
        if ( typeof success === "function" ) {
            has_cbs = true;
            cb.success = success;
        }

        // Check if an error callback function is provided.
        if ( typeof error === "function" ) {
            has_cbs = true;
            cb.error = error;
        }

        // If any callbacks were found, assign a unique reference to opts.callback.
        if ( has_cbs ) {
            opts.callback = cbref( cb );
        }

        // Return the options object, potentially with a callback reference.
        return opts;
    };


    // Define the PGSQLitePlugin class, attaching it to the global root object.
    root.PGSQLitePlugin = ( function ( ) {

        // Static property to keep track of open database paths.
        PGSQLitePlugin.prototype.openDBs = { };

        /*
         * Constructor for the PGSQLitePlugin.
         * @param {string} dbPath - The path to the database file.
         * @param {function} [openSuccess] - Optional callback for successful database opening.
         * @param {function} [openError] - Optional callback for database opening errors.
         */
        function PGSQLitePlugin ( dbPath, openSuccess, openError ) {
            // Assign instance properties.
            this.dbPath = dbPath;
            this.openSuccess = openSuccess;
            this.openError = openError;

            // Ensure a database path is provided.
            if ( !dbPath ) {
                throw new Error( "Cannot create a PGSQLitePlugin instance without a dbPath" );
            }

            // Provide default success callback if none is given.
            this.openSuccess || ( this.openSuccess = function ( ) {
                console.log( "DB opened: " + dbPath );
            } );

            // Provide default error callback if none is given.
            this.openError || ( this.openError = function ( e ) {
                console.log( e.message );
            } );

            // Attempt to open the database.
            this.open( this.openSuccess, this.openError );
        }


        /*
         * Static method to handle callbacks from native code.
         * Locates and executes the appropriate callback (success or error).
         * @param {string} ref - The callback reference string.
         * @param {string} type - The type of callback to execute ("success" or "error").
         * @param {object} obj - The data object to pass to the callback.
         */
        PGSQLitePlugin.handleCallback = function ( ref, type, obj ) {
            var _ref; // Temporary reference to the stored callback object.

            // Check if the callback reference exists in the callbacks registry.
            if ( ( _ref = callbacks[ ref ] ) != null ) {
                // If the specific callback type is a function, execute it.
                if ( typeof _ref[ type ] === "function" ) {
                    _ref[ type ]( obj );
                }
            }

            // Nullify and delete the callback to free up memory after use.
            callbacks[ ref ] = null;
            delete callbacks[ ref ];
        };


        /*
         * Executes a single SQL query.
         * @param {string|string[]} sql - The SQL query string or an array of queries.
         * @param {function} [success] - Optional success callback.
         * @param {function} [error] - Optional error callback.
         */
        PGSQLitePlugin.prototype.executeSql = function ( sql, success, error ) {
            var opts; // Options object for the native call.

            // Ensure an SQL query is provided.
            if ( !sql ) {
                throw new Error( "Cannot executeSql without a query" );
            }

            // Prepare options, wrapping 'sql' in an array if it's not already.
            opts = getOptions( {
                query: [ ].concat( sql || [ ] ),
                path: this.dbPath
            }, success, error );

            // Execute the native Cordova plugin method.
            Cordova.exec( "PGSQLitePlugin.backgroundExecuteSql", opts );
        };


        /*
         * Initiates a database transaction.
         * @param {function} fn - A function that receives a transaction object to queue SQL commands.
         * @param {function} [success] - Optional success callback for the transaction completion.
         * @param {function} [error] - Optional error callback for transaction failure.
         * @returns {PGSQLitePluginTransaction} The transaction object.
         */
        PGSQLitePlugin.prototype.transaction = function ( fn, success, error ) {
            var t; // The new transaction object.

            // Create a new transaction instance.
            t = new root.PGSQLitePluginTransaction( this.dbPath );

            // Execute the provided function with the transaction object.
            fn( t );

            // Complete the transaction, potentially with callbacks.
            return t.complete( success, error );
        };


        /*
         * Opens the database. This method is called by the constructor.
         * @param {function} [success] - Optional success callback.
         * @param {function} [error] - Optional error callback.
         */
        PGSQLitePlugin.prototype.open = function ( success, error ) {
            var opts; // Options object for the native call.

            // Check if the database path is not already marked as open.
            if ( !( this.dbPath in this.openDBs ) ) {
                // Mark the database path as open.
                this.openDBs[ this.dbPath ] = true;

                // Prepare options for opening the database.
                opts = getOptions( {
                    path: this.dbPath
                }, success, error );

                // Execute the native Cordova plugin method to open the database.
                Cordova.exec( "PGSQLitePlugin.open", opts );
            }
        };


        /*
         * Closes the database.
         * @param {function} [success] - Optional success callback.
         * @param {function} [error] - Optional error callback.
         */
        PGSQLitePlugin.prototype.close = function ( success, error ) {
            var opts; // Options object for the native call.

            // Check if the database path is currently marked as open.
            if ( this.dbPath in this.openDBs ) {
                // Remove the database path from the list of open databases.
                delete this.openDBs[ this.dbPath ];

                // Prepare options for closing the database.
                opts = getOptions( {
                    path: this.dbPath
                }, success, error );

                // Execute the native Cordova plugin method to close the database.
                Cordova.exec( "PGSQLitePlugin.close", opts );
            }
        };

        // Return the constructor function for the PGSQLitePlugin class.
        return PGSQLitePlugin;

    } ) ( );


    // Define the PGSQLitePluginTransaction class, attaching it to the global root object.
    root.PGSQLitePluginTransaction = ( function ( ) {

        /*
         * Constructor for PGSQLitePluginTransaction.
         * @param {string} dbPath - The path to the database associated with this transaction.
         */
        function PGSQLitePluginTransaction ( dbPath ) {
            this.dbPath = dbPath;      // Store the database path.
            this.executes = [ ];       // Initialize an array to queue SQL commands.
        }


        /*
         * Queues an SQL query to be executed as part of this transaction.
         * @param {string|string[]} sql - The SQL query string or an array of queries.
         * @param {function} [success] - Optional success callback for this specific query.
         * @param {function} [error] - Optional error callback for this specific query.
         */
        PGSQLitePluginTransaction.prototype.executeSql = function ( sql, success, error ) {
            // Add the prepared options for the SQL query to the executes queue.
            this.executes.push( getOptions( {
                query: [ ].concat( sql || [ ] ), // Ensure query is an array.
                path: this.dbPath
            }, success, error ) );
        };


        /*
         * Completes the transaction by executing all queued SQL commands
         * within a BEGIN/COMMIT block.
         * @param {function} [success] - Optional success callback for the entire transaction.
         * @param {function} [error] - Optional error callback for transaction failure.
         */
        PGSQLitePluginTransaction.prototype.complete = function ( success, error ) {
            var begin_opts,    // Options for the BEGIN statement.
                commit_opts,   // Options for the COMMIT statement.
                executes,      // Consolidated list of all commands.
                opts;          // Final options object for the batch execution.

            // Prevent completing the same transaction multiple times.
            if ( this.__completed ) {
                throw new Error( "Transaction already run" );
            }
            this.__completed = true; // Mark transaction as completed.

            // Prepare options for the 'BEGIN' SQL statement.
            begin_opts = getOptions( {
                query: [ "BEGIN;" ],
                path: this.dbPath
            } );

            // Prepare options for the 'COMMIT' SQL statement, including transaction-level callbacks.
            commit_opts = getOptions( {
                query: [ "COMMIT;" ],
                path: this.dbPath
            }, success, error );

            // Combine BEGIN, all queued executes, and COMMIT into a single array.
            executes = [ begin_opts ].concat( this.executes ).concat( [ commit_opts ] );

            // Create the final options object for the batch execution.
            opts = {
                executes: executes
            };

            // Execute the batch of SQL commands natively.
            Cordova.exec( "PGSQLitePlugin.backgroundExecuteSqlBatch", opts );

            // Clear the executes array after the transaction is sent.
            this.executes = [ ];
        };

        // Return the constructor function for the PGSQLitePluginTransaction class.
        return PGSQLitePluginTransaction;

    } ) ( );

} ).call( this ); // Immediately invoke the function, setting 'this' to the global object.