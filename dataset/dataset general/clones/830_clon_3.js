(function() {
  // Encapsulating closure for the entire module to prevent global pollution.
  // This module facilitates interaction with a SQLite database via Cordova.

  let globalContext; // Reference to the global scope (window or equivalent)
  let activeListeners; // Stores callback functions for asynchronous operations
  let requestCount; // Counter for generating unique callback IDs
  let storeCallbackReference; // Function to register callbacks
  let buildInvocationOptions; // Function to prepare options for Cordova calls

  // Initialize global scope reference.
  globalContext = this;

  // Initialize the storage for pending callbacks.
  activeListeners = {};

  // Initialize the request counter.
  requestCount = 0;

  /**
   * Generates a unique key for a callback set and stores it.
   * This ensures that asynchronous results can be routed back to the correct handlers.
   * @param {object} callbackSet - An object containing success and/or error callback functions.
   * @returns {string} The unique key generated for this callback set.
   */
  storeCallbackReference = function(callbackSet) {
    // Increment the counter and create a unique identifier.
    const uniqueKey = `cbid_${++requestCount}`;
    // Store the provided callback object under this unique key.
    activeListeners[uniqueKey] = callbackSet;
    // Return the key for later retrieval.
    return uniqueKey;
  };

  /**
   * Prepares the options object for a Cordova plugin execution,
   * incorporating success and error callbacks if provided.
   * @param {object} baseOptions - The initial options object for the Cordova call.
   * @param {function} onSuccess - Callback function to execute on successful operation.
   * @param {function} onError - Callback function to execute if an error occurs.
   * @returns {object} The augmented options object, ready for Cordova.exec.
   */
  buildInvocationOptions = function(baseOptions, onSuccess, onError) {
    const callbackContainer = {}; // Temporary container for the callbacks
    let hasDefinedCallbacks = false; // Flag to check if any callbacks were provided

    // Check if a success callback is provided and is a function.
    if (onSuccess instanceof Function) {
      hasDefinedCallbacks = true;
      callbackContainer.success = onSuccess;
    }

    // Check if an error callback is provided and is a function.
    if (onError instanceof Function) {
      hasDefinedCallbacks = true;
      callbackContainer.error = onError;
    }

    // If any callbacks were defined, register them and add their key to the options.
    if (hasDefinedCallbacks) {
      baseOptions.callback = storeCallbackReference(callbackContainer);
    } else {
      // Optional: Log a warning if no callbacks are supplied for an async operation.
      // console.warn("No specific success or error callbacks provided for this operation.");
    }

    return baseOptions;
  };

  /**
   * Main class for managing SQLite database connections and operations.
   * Exposed globally as `globalContext.SqliteDBManager`.
   */
  globalContext.SqliteDBManager = (function() {

    // A static-like property to keep track of currently open database connections.
    // Using a Map for better key management, though an object works too.
    const activeConnections = new Map();

    /**
     * Constructor for the SqliteDBManager.
     * Initializes a connection to a specified database path.
     * @param {string} databasePath - The file path to the SQLite database.
     * @param {function} onConnectionOpen - Callback for successful database opening.
     * @param {function} onConnectionError - Callback for errors during database opening.
     */
    function SqliteDBManager(databasePath, onConnectionOpen, onConnectionError) {
      // Input validation for the database path.
      if (typeof databasePath !== 'string' || databasePath.trim() === '') {
        throw new Error("SqliteDBManager instance requires a valid 'databasePath' string.");
      }

      this.databasePath = databasePath;
      this.onConnectionOpen = onConnectionOpen;
      this.onConnectionError = onConnectionError;

      // Ensure default callbacks are set if not provided.
      if (!this.onConnectionOpen) {
        this.onConnectionOpen = () => {
          console.info(`[DBManager] Database connection established for: ${this.databasePath}`);
        };
      }
      if (!this.onConnectionError) {
        this.onConnectionError = (err) => {
          console.error(`[DBManager] Error opening database ${this.databasePath}:`, err.message);
        };
      }

      // Automatically attempt to open the database upon instantiation.
      this.openDatabase(this.onConnectionOpen, this.onConnectionError);
    }

    /**
     * Static method to handle callbacks coming back from the native plugin.
     * This method is typically called by the native side of the Cordova plugin.
     * @param {string} callbackRef - The unique key identifying the stored callback set.
     * @param {string} callbackType - 'success' or 'error', indicating which callback to invoke.
     * @param {object} responseData - The data object passed back from the native plugin.
     */
    SqliteDBManager.handleNativeResponse = function(callbackRef, callbackType, responseData) {
      // Retrieve the stored callbacks using the reference key.
      const storedCallbacks = activeListeners[callbackRef];

      if (!storedCallbacks) {
        console.warn(`[DBManager] No active callback found for reference: ${callbackRef}. Response ignored.`);
        return;
      }

      // Execute the appropriate callback if it's a function.
      if (typeof storedCallbacks[callbackType] === "function") {
        try {
          storedCallbacks[callbackType](responseData);
        } catch (e) {
          console.error(`[DBManager] Error executing ${callbackType} callback for ${callbackRef}:`, e);
        }
      } else {
        console.warn(`[DBManager] Callback type '${callbackType}' not found or not a function for ref: ${callbackRef}.`);
      }

      // Clean up the stored callback to prevent memory leaks and ensure one-time use.
      delete activeListeners[callbackRef];
    };

    /**
     * Executes a single SQL statement.
     * @param {string|Array<string>} sqlQuery - The SQL statement(s) to execute.
     * @param {function} onQuerySuccess - Callback for successful query execution.
     * @param {function} onQueryError - Callback for errors during query execution.
     */
    SqliteDBManager.prototype.executeStatement = function(sqlQuery, onQuerySuccess, onQueryError) {
      if (!sqlQuery || (Array.isArray(sqlQuery) && sqlQuery.length === 0)) {
        throw new Error("Cannot executeStatement without a valid SQL query.");
      }

      // Ensure Cordova object exists before attempting to execute.
      if (!globalContext.Cordova || !globalContext.Cordova.exec) {
        console.error("[DBManager] Cordova.exec is not available. Is the plugin correctly installed and ready?");
        if (onQueryError instanceof Function) onQueryError(new Error("Cordova environment not ready."));
        return;
      }

      // Prepare options for the native plugin call.
      const executionOptions = buildInvocationOptions({
        statement: Array.isArray(sqlQuery) ? sqlQuery : [sqlQuery], // Ensure statement is an array
        dbPath: this.databasePath
      }, onQuerySuccess, onQueryError);

      // Execute the native Cordova plugin method.
      globalContext.Cordova.exec("SqliteDBManager.runSingleStatement", executionOptions);
    };

    /**
     * Initiates a new database transaction.
     * @param {function} transactionLogic - A function that takes a DBTransactionHandler instance
     *                                      and performs SQL operations within the transaction.
     * @param {function} onTransactionComplete - Callback for successful transaction commit.
     * @param {function} onTransactionFailed - Callback for transaction rollback/failure.
     * @returns {globalContext.DBTransactionHandler} The transaction handler instance.
     */
    SqliteDBManager.prototype.startTransaction = function(transactionLogic, onTransactionComplete, onTransactionFailed) {
      if (!(transactionLogic instanceof Function)) {
        throw new Error("Transaction logic must be a function.");
      }

      // Create a new transaction handler instance.
      const transactionInstance = new globalContext.DBTransactionHandler(this.databasePath);

      // Execute the user-defined transaction logic.
      transactionLogic(transactionInstance);

      // Complete the transaction, passing user callbacks.
      transactionInstance.finalizeTransaction(onTransactionComplete, onTransactionFailed);

      return transactionInstance;
    };

    /**
     * Opens the database connection.
     * @param {function} onOpenSuccess - Callback for successful connection.
     * @param {function} onOpenError - Callback for connection errors.
     */
    SqliteDBManager.prototype.openDatabase = function(onOpenSuccess, onOpenError) {
      // Only open if not already in the list of active connections.
      if (!activeConnections.has(this.databasePath)) {
        activeConnections.set(this.databasePath, true); // Mark as opening/open

        console.log(`[DBManager] Attempting to open database: ${this.databasePath}`);

        // Prepare options for the native plugin call.
        const connectionOptions = buildInvocationOptions({
          dbPath: this.databasePath
        }, onOpenSuccess, onOpenError);

        // Execute the native Cordova plugin method to open the database.
        globalContext.Cordova.exec("SqliteDBManager.initiateConnection", connectionOptions);
      } else {
        console.info(`[DBManager] Database '${this.databasePath}' is already open or in the process of opening.`);
        // If already open, immediately call success callback if provided.
        if (onOpenSuccess instanceof Function) {
          onOpenSuccess();
        }
      }
    };

    /**
     * Closes the database connection.
     * @param {function} onCloseSuccess - Callback for successful disconnection.
     * @param {function} onCloseError - Callback for disconnection errors.
     */
    SqliteDBManager.prototype.closeDatabase = function(onCloseSuccess, onCloseError) {
      // Only attempt to close if it's currently marked as an active connection.
      if (activeConnections.has(this.databasePath)) {
        activeConnections.delete(this.databasePath); // Remove from active connections list

        console.log(`[DBManager] Attempting to close database: ${this.databasePath}`);

        // Prepare options for the native plugin call.
        const disconnectionOptions = buildInvocationOptions({
          dbPath: this.databasePath
        }, onCloseSuccess, onCloseError);

        // Execute the native Cordova plugin method to close the database.
        globalContext.Cordova.exec("SqliteDBManager.terminateConnection", disconnectionOptions);
      } else {
        console.warn(`[DBManager] Database '${this.databasePath}' is not currently marked as open.`);
        // If not open, immediately call success callback if provided.
        if (onCloseSuccess instanceof Function) {
          onCloseSuccess();
        }
      }
    };

    return SqliteDBManager;

  })();

  /**
   * Class for handling database transactions, allowing multiple SQL statements
   * to be executed as an atomic unit.
   * Exposed globally as `globalContext.DBTransactionHandler`.
   */
  globalContext.DBTransactionHandler = (function() {

    /**
     * Constructor for the DBTransactionHandler.
     * @param {string} databaseIdentifier - The path to the database for this transaction.
     */
    function DBTransactionHandler(databaseIdentifier) {
      this.databaseIdentifier = databaseIdentifier;
      this.pendingStatements = []; // Array to hold SQL operations within the transaction.
      this.transactionFinished = false; // Flag to prevent multiple completions.
    }

    /**
     * Adds an SQL statement to the transaction queue.
     * @param {string|Array<string>} statementText - The SQL statement(s) to be executed.
     * @param {function} onStatementSuccess - Callback for success of this specific statement.
     * @param {function} onStatementError - Callback for error of this specific statement.
     */
    DBTransactionHandler.prototype.queueStatement = function(statementText, onStatementSuccess, onStatementError) {
      // Add the prepared options for this statement to the pending list.
      this.pendingStatements.push(buildInvocationOptions({
        statementContent: Array.isArray(statementText) ? statementText : [statementText], // Ensure content is an array
        dbPath: this.databaseIdentifier
      }, onStatementSuccess, onStatementError));
    };

    /**
     * Completes the transaction by sending all queued statements to the native plugin
     * within a BEGIN/COMMIT block.
     * @param {function} onCompletion - Callback for successful transaction commit.
     * @param {function} onFailure - Callback for transaction failure/rollback.
     */
    DBTransactionHandler.prototype.finalizeTransaction = function(onCompletion, onFailure) {
      if (this.transactionFinished) {
        throw new Error("This transaction has already been processed (completed or failed).");
      }
      this.transactionFinished = true; // Mark transaction as completed to prevent re-runs.

      // Prepare options for the BEGIN statement.
      const beginTransactionOptions = buildInvocationOptions({
        statementContent: ["BEGIN;"],
        dbPath: this.databaseIdentifier
      });

      // Prepare options for the COMMIT statement, including transaction-level callbacks.
      const commitTransactionOptions = buildInvocationOptions({
        statementContent: ["COMMIT;"],
        dbPath: this.databaseIdentifier
      }, onCompletion, onFailure);

      // Assemble all operations: BEGIN, user statements, then COMMIT.
      const allBatchOperations = [
        beginTransactionOptions,
        ...this.pendingStatements, // Spread operator for cleaner array concatenation
        commitTransactionOptions
      ];

      // If no statements were added between BEGIN and COMMIT, it's an empty transaction.
      if (this.pendingStatements.length === 0) {
        console.warn(`[DBTransaction] Executing an empty transaction for database: ${this.databaseIdentifier}.`);
      }

      // Prepare the final payload for the batch execution.
      const batchInvocationPayload = {
        operations: allBatchOperations
      };

      // Execute the native Cordova plugin method for batch operations.
      globalContext.Cordova.exec("SqliteDBManager.executeStatementBatch", batchInvocationPayload);

      // Clear the pending statements as they have been sent.
      this.pendingStatements = [];
      console.log(`[DBTransaction] Transaction finalized for database: ${this.databaseIdentifier}`);
    };

    return DBTransactionHandler;

  })();

}).call(this); // Execute the IIFE with 'this' as the global context.