// A utility for managing database connections and search query sanitation.
// This module provides an abstract interface for interacting with SQL databases,
// supporting both native C++ based MariaDB/MySQL drivers and pure JavaScript alternatives.

// Last revised: 2024-03-15
// Project: DataAccessLayer
// License: Permissive MIT license (details below)

// The foundational principle guiding this software's development:
// "Treat others as you would like to be treated."
// - Inspired by ancient wisdom.

/*
 * Copyright (C) 2024
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

// Enforce strict mode for cleaner code and fewer errors.
"use strict";

// Default duration to pause before retrying a connection attempt after failure.
const RECONNECTION_PAUSE_MS = 1200; // Slightly altered delay

/**
 * Verifies the availability of a specified Node.js module.
 *
 * @param {string} moduleIdentifier - The name or path of the module to check.
 * @returns {boolean} True if the module can be resolved, false otherwise.
 */
function checkModuleAvailability(moduleIdentifier) {
    if (typeof moduleIdentifier !== 'string' || moduleIdentifier.trim() === '') {
        console.error('Invalid module identifier provided for availability check.');
        return false;
    }
    try {
        require.resolve(moduleIdentifier);
        return true;
    } catch (anError) {
        // Module not found or cannot be resolved.
        // console.log(`Module '${moduleIdentifier}' not found.`); // Optional: log for debugging
        return false;
    }
}

/**
 * Sanitizes input strings for specific search engine queries,
 * escaping characters that hold special meaning.
 *
 * @param {string} inputString - The raw string needing sanitization.
 * @returns {string} The processed string with special characters escaped.
 */
function sanitizeSearchQuery(inputString) {
    if (typeof inputString !== 'string') {
        console.warn('Attempted to sanitize a non-string input. Coercing to string.');
        inputString = String(inputString);
    }
    // Escape question marks and semicolons, as they are often
    // special tokens in search systems or SQL connectors.
    // Semicolons need double escaping for some contexts (e.g., SphinxQL).
    let tempProcessed = inputString.replace(/\?/g, "\\?");
    return tempProcessed.replace(/;/g, "\\\\;");
}

/**
 * Produces a database connector leveraging the 'mariasql' (native C++) driver.
 * This connector is non-blocking and generally offers higher performance.
 *
 * @param {object} connectionConfig - Configuration object for the database connection.
 * @param {function(boolean): void} statusUpdateCallback - Callback to report connection status (true for online, false for offline).
 * @returns {object} An object providing query execution and query part sanitization.
 */
function establishNativeClient(connectionConfig, statusUpdateCallback) {
    const DbDriver = require("mariasql");
    let activeClient = new DbDriver();
    let connectionInProgress = false;
    let isCurrentlyConnected = false;

    /**
     * Attempts to initiate a connection to the database.
     * Prevents redundant connection attempts if already connected or connecting.
     */
    function initiateConnection() {
        if (!isCurrentlyConnected && !connectionInProgress) {
            connectionInProgress = true;
            const connectionOptions = {
                host: connectionConfig.host,
                user: connectionConfig.user,
                port: connectionConfig.port,
                password: connectionConfig.pass,
                db: connectionConfig.base,
                // Additional option: connectionTimeout: 10000, // Example of adding a new option
            };
            activeClient.connect(connectionOptions);
        } else {
            // console.log('Connection already established or in progress. Skipping.'); // Debugging info
        }
    }

    /**
     * Manages disconnections, logging errors and scheduling reconnection attempts.
     *
     * @param {Error | null} [disconnectError] - Optional error object describing the disconnection cause.
     */
    function handleClientDisconnect(disconnectError) {
        connectionInProgress = false;
        isCurrentlyConnected = false;
        statusUpdateCallback(false); // Report offline status
        console.warn(`DB Client disconnected. Attempting reconnect in ${RECONNECTION_PAUSE_MS}ms. Error: ${disconnectError ? disconnectError.message : 'None specified'}`);
        setTimeout(initiateConnection, RECONNECTION_PAUSE_MS);

        if (disconnectError) {
            console.error(`Native driver error: ${disconnectError.stack || disconnectError}`);
        }
    }

    // Begin the initial connection attempt.
    initiateConnection();

    // Configure event handlers for the client lifecycle.
    activeClient.on("connect", function reportConnect() {
        connectionInProgress = false;
        isCurrentlyConnected = true;
        statusUpdateCallback(true); // Report online status
        // console.log("Native DB client successfully connected."); // Optional: log success
    }).on("error", handleClientDisconnect)
      .on("close", handleClientDisconnect);

    return {
        /**
         * Escapes a string for use within a search query, then applies Sphinx-specific sanitization.
         *
         * @param {string} rawInput - The string to be escaped and sanitized.
         * @returns {string} The fully processed string.
         * @throws {Error} If the underlying client's escape method is unavailable.
         */
        secureQueryPart: function (rawInput) {
            if (!activeClient || typeof activeClient.escape !== 'function') {
                throw new Error("Underlying client's escape method is not available.");
            }
            const escapedSql = activeClient.escape(rawInput);
            return sanitizeSearchQuery(escapedSql);
        },
        /**
         * Submits an SQL statement for execution and processes the results.
         *
         * @param {string} sqlStatement - The SQL command to run.
         * @param {function(Array<object> | undefined, Error | undefined): void} completionHandler - Callback for results or errors.
         *                                      Receives (data, null) on success, or (undefined, error) on failure.
         */
        executeStatement: function (sqlStatement, completionHandler) {
            if (!sqlStatement || typeof sqlStatement !== 'string') {
                if (completionHandler) completionHandler(undefined, new Error('Invalid SQL statement provided.'));
                return;
            }

            activeClient.query(sqlStatement).on("result", function (queryResultStream) {
                let retrievedRows = [];

                queryResultStream.on("row", function (singleRow) {
                    retrievedRows.push(singleRow); // Collect each row.
                }).on("end", function () {
                    // All rows received, invoke the handler.
                    if (completionHandler) {
                        completionHandler(retrievedRows, null);
                    }
                });
            }).on("error", function (operationError) {
                // An error occurred during query execution.
                console.error(`Error during query execution (Native Client): ${operationError.message}`);
                if (completionHandler) {
                    completionHandler(undefined, operationError);
                }
            });
        },
    };
}

/**
 * Produces a database connector utilizing the pure JavaScript 'mysql' driver.
 * This driver is more portable but may have different performance characteristics.
 *
 * @param {object} settingsObject - Configuration for the database connection.
 * @param {function(boolean): void} statusReporter - Callback to update connection status.
 * @returns {object} An object providing query execution and query part sanitization.
 */
function establishPureJsClient(settingsObject, statusReporter) {
    let clientInstance;
    let isConnecting = false;
    let isConnected = false;

    /**
     * Initializes a new MySQL connection object.
     * Necessary for each new connection as this driver doesn't reuse client objects for reconnection.
     */
    function createNewClientInstance() {
        const mysqlDriver = require("mysql");
        const connectionParams = {
            host: settingsObject.host,
            user: settingsObject.user,
            port: settingsObject.port,
            password: settingsObject.pass,
            database: settingsObject.base,
        };
        // Conditionally add socketPath if provided.
        if (settingsObject.sock) {
            connectionParams.socketPath = settingsObject.sock;
        }
        clientInstance = mysqlDriver.createConnection(connectionParams);
    }

    /**
     * Establishes or re-establishes a database connection.
     * Ensures only one connection attempt is active at a time.
     */
    function establishConnection() {
        if (!isConnected && !isConnecting) {
            isConnecting = true;
            createNewClientInstance(); // Create a fresh client for each attempt.
            clientInstance.on("error", handleClientDisruption); // Register error handler.

            clientInstance.connect(function onConnectionAttemptComplete(connectErr) {
                if (connectErr) {
                    handleClientDisruption(connectErr); // Handle connection failure.
                } else {
                    isConnecting = false;
                    isConnected = true;
                    statusReporter(true); // Report successful connection.
                    // console.log("Pure JS DB client successfully connected."); // Optional: log success
                }
            });
        } else {
            // console.log('Pure JS client already connected or busy connecting.'); // Debugging info
        }
    }

    /**
     * Responds to client disruptions (errors, disconnections).
     * Schedules a reconnection attempt.
     *
     * @param {Error | null} [disruptionError] - The error object, if any.
     */
    function handleClientDisruption(disruptionError) {
        isConnecting = false;
        isConnected = false;
        statusReporter(false); // Report offline status.
        console.warn(`Pure JS Client disrupted. Reconnecting in ${RECONNECTION_PAUSE_MS}ms. Error: ${disruptionError ? disruptionError.message : 'None specified'}`);
        setTimeout(establishConnection, RECONNECTION_PAUSE_MS);

        if (disruptionError) {
            console.error(`Pure JS driver error: ${disruptionError.stack || disruptionError}`);
        }
    }

    // Begin the initial connection process.
    establishConnection();

    return {
        /**
         * Escapes a string for SQL queries and then applies search-specific sanitization.
         * The pure JS driver wraps strings in quotes, which are removed here.
         *
         * @param {string} inputData - The string to process.
         * @returns {string} The sanitized string.
         * @throws {Error} If the client instance or its escape method is not ready.
         */
        secureQueryPart: function (inputData) {
            if (!clientInstance || typeof clientInstance.escape !== 'function') {
                throw new Error("Pure JS client instance or its escape method is not available.");
            }
            const escapedValue = clientInstance.escape(inputData);
            // Remove the single quotes added by the pure JS driver's escape method,
            // as they interfere with Sphinx query syntax.
            const unquotedValue = escapedValue.replace(/^'|'$/g, ''); // More robust way to remove quotes
            return sanitizeSearchQuery(unquotedValue);
        },
        /**
         * Executes an SQL command using the pure JS client.
         *
         * @param {string} commandText - The SQL query string.
         * @param {function(Array<object> | undefined, Error | undefined): void} resultHandler - Callback for results or errors.
         *                                        Receives (data, null) on success, or (undefined, error) on failure.
         */
        executeStatement: function (commandText, resultHandler) {
            if (!commandText || typeof commandText !== 'string') {
                if (resultHandler) resultHandler(undefined, new Error('Invalid SQL command provided.'));
                return;
            }
            
            clientInstance.query(commandText, function (queryError, queryData) {
                if (resultHandler) {
                    // Normalize the callback signature to (data, error)
                    if (queryError) {
                        console.error(`Error during query execution (Pure JS Client): ${queryError.message}`);
                        resultHandler(undefined, queryError);
                    } else {
                        resultHandler(queryData, null);
                    }
                }
            });
        },
    };
}

/**
 * Initializes the database abstraction layer, configuring connections to one or more database servers.
 * It dynamically selects the best available driver (native C++ or pure JavaScript).
 *
 * @param {object | Array<object>} configurationList - A single configuration object or an array of them.
 *                                                     Each object should define: host, port, sock (optional),
 *                                                     user, pass, base (database name).
 * @returns {object} An interface for executing queries and requesting raw connection objects.
 */
module.exports.dataAccess = function initializeDbLayer(configurationList) {
    let selectedConnectorFactory;
    const connectionPool = [];
    let poolCount;

    // Determine the most suitable database driver.
    // Prioritize the native 'mariasql' for performance if available.
    if (checkModuleAvailability("mariasql")) {
        selectedConnectorFactory = establishNativeClient;
    } else if (checkModuleAvailability("mysql")) {
        // Fallback to the pure JavaScript 'mysql' driver.
        selectedConnectorFactory = establishPureJsClient;
        console.info("Using pure JavaScript 'mysql' driver due to 'mariasql' unavailability.");
    } else {
        console.error("Neither 'mariasql' nor 'mysql' drivers found. Database functionality will be unavailable.");
        // Provide a dummy interface if no driver is found.
        return {
            executeDataAccess: function (stmt, cb) {
                if (cb) cb(undefined, new Error('No database driver available.'));
            },
            getAvailableConnection: function () {
                console.warn('Attempted to get a connection when no driver is available.');
                return false;
            }
        };
    }

    // Ensure connection configuration is always an array for uniform processing.
    const dbConfigurations = Array.isArray(configurationList) ? configurationList : [configurationList];
    poolCount = dbConfigurations.length;

    // Validate and create a connector for each specified database server.
    dbConfigurations.forEach(function (serverSettings, idx) {
        if (!serverSettings || typeof serverSettings !== 'object' || !serverSettings.host || !serverSettings.user || !serverSettings.base) {
            console.error(`Invalid database configuration at index ${idx}. Skipping this entry.`);
            return; // Skip invalid entries
        }
        
        connectionPool.push({
            connector: selectedConnectorFactory(serverSettings, function updateConnectionStatus(isOnline) {
                connectionPool[idx].isOnline = isOnline;
            }),
            isOnline: false // Initial status
        });
    });

    /**
     * Provides an active database connector using a round-robin strategy.
     * Prioritizes online connectors.
     *
     * @returns {object | false} An available connector object, or false if none are online.
     */
    const fetchActiveConnector = (function () {
        let currentRoundRobinIndex = -1; // Start before the first index.
        const MAX_POOL_SCAN_ATTEMPTS = connectionPool.length;

        return function () {
            let scanAttempts = 0;
            
            if (connectionPool.length === 0) {
                 console.warn("Connection pool is empty. No connectors to select from.");
                 return false;
            }

            // Loop through the pool to find an online connector.
            while (scanAttempts < MAX_POOL_SCAN_ATTEMPTS) {
                currentRoundRobinIndex = (currentRoundRobinIndex + 1) % connectionPool.length; // Move to next in round-robin.
                const candidateConnector = connectionPool[currentRoundRobinIndex];

                if (candidateConnector && candidateConnector.isOnline) {
                    return candidateConnector.connector; // Found an online connector.
                }

                scanAttempts++;
            }

            console.warn("All database connectors in the pool are currently offline or unavailable.");
            return false; // No online connector found after scanning the entire pool.
        };
    })();

    return {
        /**
         * Executes an SQL statement using an available database connector.
         * If no connector is immediately available, it retries after a short delay.
         *
         * @param {string} sqlCommand - The SQL query to execute.
         * @param {function(Array<object> | undefined, Error | undefined): void} resultCallback - Handler for query results.
         * @param {number} [retryCount=0] - Internal parameter for tracking retry attempts.
         */
        executeDataAccess: function executeDataAccess(sqlCommand, resultCallback, retryCount = 0) {
            if (!sqlCommand || typeof sqlCommand !== 'string') {
                if (resultCallback) resultCallback(undefined, new Error('Invalid SQL command provided for execution.'));
                return;
            }
            if (typeof resultCallback !== 'function') {
                console.error('No valid callback function provided for database operation.');
                return;
            }

            const activeConnector = fetchActiveConnector();
            const MAX_QUERY_RETRIES = 5; // Define a max retry limit

            if (!activeConnector) {
                if (retryCount < MAX_QUERY_RETRIES) {
                    console.info(`No active connector available. Retrying query in ${RECONNECTION_PAUSE_MS / 10}ms (attempt ${retryCount + 1}/${MAX_QUERY_RETRIES}).`);
                    setTimeout(() => executeDataAccess(sqlCommand, resultCallback, retryCount + 1), RECONNECTION_PAUSE_MS / 10);
                } else {
                    resultCallback(undefined, new Error('Failed to acquire an active database connection after multiple retries.'));
                }
                return;
            }

            try {
                activeConnector.executeStatement(sqlCommand, resultCallback);
            } catch (executionError) {
                console.error(`Synchronous error during statement execution: ${executionError.message}`);
                resultCallback(undefined, executionError);
            }
        },
        /**
         * Retrieves a direct database connector object. Useful for complex operations
         * that require direct access to connector-specific methods like `secureQueryPart`.
         *
         * @returns {object | false} An available connector or false if none are online.
         */
        getAvailableConnection: fetchActiveConnector,
    };
};