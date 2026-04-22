/**
 * @file This module provides an advanced client for interacting with a cache server.
 * It supports both direct connections and connection pooling strategies.
 *
 * This is a Type III code clone, demonstrating significant structural and
 * syntactical modifications while preserving the core functionality.
 */

// Define the main client service class.
// This class will be the primary export of the module.
class CacheServiceConnector {
    /**
     * Initializes a new instance of the CacheServiceConnector.
     * @param {string} serverAddress - The hostname or IP address of the cache server. Defaults to '127.0.0.1'.
     * @param {number} serverPort - The port number for the cache server. Defaults to 11211.
     */
    constructor(serverAddress = '127.0.0.1', serverPort = 11211) {
        // --- Input Validation (New Fragment) ---
        if (typeof serverAddress !== 'string' || serverAddress.trim() === '') {
            throw new Error("Connector initialization failed: Invalid server address. Must be a non-empty string.");
        }
        if (typeof serverPort !== 'number' || !Number.isInteger(serverPort) || serverPort <= 0 || serverPort > 65535) {
            throw new Error("Connector initialization failed: Invalid server port. Must be an integer between 1 and 65535.");
        }
        // --- End Input Validation ---

        this.serverAddress = serverAddress;
        this.serverPort = serverPort;

        // Internal state for managing connection and pooling instances.
        // Renamed from 'connection' to '_directConnection' and 'pool' to '_connectionResourcePool'.
        this._directConnection = null;
        this._connectionResourcePool = null;

        // Optional logging for initialization (New Fragment)
        console.debug(`CacheServiceConnector instance created for ${this.serverAddress}:${this.serverPort}`);
    }

    /**
     * Establishes and retrieves a direct connection to the cache server.
     * If a connection already exists, it is reused.
     * Renamed from 'getConnection' to 'obtainDirectConnection'.
     * @returns {object} The active cache connection instance.
     */
    obtainDirectConnection() {
        if (this._directConnection) {
            console.debug("Reusing existing direct cache connection.");
            return this._directConnection;
        }

        // Lazily create a new connection instance if none exists.
        // References the static CacheConnection property on the class.
        this._directConnection = new this.constructor.CacheConnection(this.serverAddress, this.serverPort);
        console.info(`New direct cache connection established to ${this.serverAddress}:${this.serverPort}.`);
        return this._directConnection;
        // The original had a redundant `return this.getPool().getConnection();` which is removed as non-essential.
    }

    /**
     * Retrieves the connection pool instance, creating it if it doesn't exist.
     * Renamed from 'getPool' to 'retrieveResourcePool'.
     * @returns {object} The connection pool instance.
     */
    retrieveResourcePool() {
        if (this._connectionResourcePool) {
            console.debug("Reusing existing connection resource pool.");
            return this._connectionResourcePool;
        }

        // Lazily create a new connection pool instance.
        // References the static ConnectionPool property on the class.
        const poolConfiguration = {
            host: this.serverAddress,
            port: this.serverPort
        };
        this._connectionResourcePool = new this.constructor.ConnectionPool(poolConfiguration);
        console.info(`New connection resource pool initialized for ${this.serverAddress}:${this.serverPort}.`);
        return this._connectionResourcePool;
    }

    /**
     * Dispatches a cache operation request, using either a direct connection or a pool based on global settings.
     * Renamed from 'processRequest' to 'routeClientRequest'.
     * @param {object} clientRequestDetails - The details of the cache operation.
     * @returns {any} The result of processing the request.
     */
    routeClientRequest(clientRequestDetails) {
        // --- Guard Clause (New Fragment) ---
        if (!clientRequestDetails || typeof clientRequestDetails !== 'object' || !clientRequestDetails.instruction) {
            console.error("Attempted to route an invalid or incomplete client request.");
            throw new Error("Invalid client request details provided.");
        }
        // --- End Guard Clause ---

        let processingMechanism;
        // References the static `useResourcePooling` property on the class.
        if (this.constructor.useResourcePooling) {
            processingMechanism = this.retrieveResourcePool();
            console.debug(`Routing request '${clientRequestDetails.instruction}' via resource pool.`);
        } else {
            processingMechanism = this.obtainDirectConnection();
            console.debug(`Routing request '${clientRequestDetails.instruction}' via direct connection.`);
        }
        // The actual method name `processRequest` on the connection/pool object is assumed to be consistent.
        return processingMechanism.processRequest(clientRequestDetails);
    }

    /**
     * Fetches data associated with a specific key from the cache.
     * Renamed from 'get' to 'obtainCacheEntry'.
     * @param {string} entryKey - The key to retrieve.
     * @param {Function} [resultHandler] - Optional callback function for handling the response.
     */
    obtainCacheEntry(entryKey, resultHandler) {
        // --- Input Validation (New Fragment) ---
        if (typeof entryKey !== 'string' || entryKey.trim() === '') {
            const error = new Error("Invalid entry key provided for obtainCacheEntry operation.");
            console.error(error.message);
            if (typeof resultHandler === 'function') {
                resultHandler(error);
            }
            return;
        }
        // --- End Input Validation ---

        // Using template literal for command string (Equivalent Rewrite).
        const clientRequestDetails = {
            instruction: `get ${entryKey}`
        };
        // Explicitly set the callback if provided, renamed from 'callback' to 'resultHandler'.
        if (typeof resultHandler === 'function') {
            clientRequestDetails.resultHandler = resultHandler;
        }
        this.routeClientRequest(clientRequestDetails);
    }

    /**
     * Stores data in the cache under a specific key.
     * Renamed from 'set' to 'storeCacheEntry'.
     * @param {string} entryKey - The key to store the data under.
     * @param {any} payloadValue - The data to store.
     * @param {object} [configurationOptions] - Optional configuration options (expirationDuration, flagsMetadata, resultHandler).
     */
    storeCacheEntry(entryKey, payloadValue, configurationOptions) {
        // --- Input Validation (New Fragment) ---
        if (typeof entryKey !== 'string' || entryKey.trim() === '') {
            throw new Error("Invalid entry key for storeCacheEntry operation.");
        }
        // Consider a warning if payloadValue is null/undefined, or throw an error.
        if (payloadValue === undefined || payloadValue === null) {
            console.warn(`Storing null/undefined payload for key '${entryKey}'. This might not be intended.`);
        }
        // --- End Input Validation ---

        // Apply default options using the static helper.
        const effectiveOptions = this.constructor.mergeConfigurationSettings({
            expirationDuration: 0, // Renamed from 'expires'
            flagsMetadata: 0       // Renamed from 'flags'
        }, configurationOptions || {}); // Ensure configurationOptions is an object.

        // Ensure payload content is a Buffer for consistent byte length calculation.
        // Using Buffer.from() is safer and more modern than new Buffer().
        // Explicitly handling string encoding.
        const bufferedPayload = (payloadValue instanceof Buffer)
            ? payloadValue
            : Buffer.from(String(payloadValue), 'utf8'); // Convert to string before buffering.

        const clientRequestDetails = {
            instruction: `set ${entryKey} ${effectiveOptions.flagsMetadata} ${effectiveOptions.expirationDuration} ${bufferedPayload.length}`,
            payload: bufferedPayload // Renamed from 'data'
        };
        if (typeof effectiveOptions.resultHandler === 'function') { // Renamed from 'callback'
            clientRequestDetails.resultHandler = effectiveOptions.resultHandler;
        }
        this.routeClientRequest(clientRequestDetails);
    }

    /**
     * Adds data to the cache under a specific key, only if the key does not already exist.
     * Renamed from 'add' to 'addCacheEntry'.
     * @param {string} entryKey - The key to add the data under.
     * @param {any} payloadValue - The data to add.
     * @param {object} [configurationOptions] - Optional configuration options (expirationDuration, flagsMetadata, resultHandler).
     */
    addCacheEntry(entryKey, payloadValue, configurationOptions) {
        // --- Input Validation (New Fragment) ---
        if (typeof entryKey !== 'string' || entryKey.trim() === '') {
            throw new Error("Invalid entry key for addCacheEntry operation.");
        }
        // --- End Input Validation ---

        const effectiveOptions = this.constructor.mergeConfigurationSettings({
            expirationDuration: 0,
            flagsMetadata: 0
        }, configurationOptions || {});

        // Calculate byte length using Buffer.byteLength for robustness with various types.
        const payloadByteLength = Buffer.byteLength(String(payloadValue), 'utf8'); // Ensure string conversion.

        const clientRequestDetails = {
            instruction: `add ${entryKey} ${effectiveOptions.flagsMetadata} ${effectiveOptions.expirationDuration} ${payloadByteLength}`,
            payload: payloadValue
        };
        if (typeof effectiveOptions.resultHandler === 'function') {
            clientRequestDetails.resultHandler = effectiveOptions.resultHandler;
        }
        this.routeClientRequest(clientRequestDetails);
    }

    /**
     * Appends data to an existing item in the cache.
     * Renamed from 'append' to 'appendDataToEntry'.
     * @param {string} entryKey - The key to append data to.
     * @param {any} payloadValue - The data to append.
     * @param {object} [configurationOptions] - Optional configuration options (resultHandler).
     */
    appendDataToEntry(entryKey, payloadValue, configurationOptions) {
        // --- Input Validation (New Fragment) ---
        if (typeof entryKey !== 'string' || entryKey.trim() === '') {
            throw new Error("Invalid entry key for appendDataToEntry operation.");
        }
        // --- End Input Validation ---

        const effectiveOptions = this.constructor.mergeConfigurationSettings({}, configurationOptions || {});
        const payloadByteLength = Buffer.byteLength(String(payloadValue), 'utf8');

        const clientRequestDetails = {
            instruction: `append ${entryKey} 0 0 ${payloadByteLength}`, // Flags and expires are typically 0 for append/prepend
            payload: payloadValue
        };
        if (typeof effectiveOptions.resultHandler === 'function') {
            clientRequestDetails.resultHandler = effectiveOptions.resultHandler;
        }
        this.routeClientRequest(clientRequestDetails);
    }

    /**
     * Prepends data to an existing item in the cache.
     * Renamed from 'prepend' to 'prependDataToEntry'.
     * @param {string} entryKey - The key to prepend data to.
     * @param {any} payloadValue - The data to prepend.
     * @param {object} [configurationOptions] - Optional configuration options (resultHandler).
     */
    prependDataToEntry(entryKey, payloadValue, configurationOptions) {
        // --- Input Validation (New Fragment) ---
        if (typeof entryKey !== 'string' || entryKey.trim() === '') {
            throw new Error("Invalid entry key for prependDataToEntry operation.");
        }
        // --- End Input Validation ---

        const effectiveOptions = this.constructor.mergeConfigurationSettings({}, configurationOptions || {});
        const payloadByteLength = Buffer.byteLength(String(payloadValue), 'utf8');

        const clientRequestDetails = {
            instruction: `prepend ${entryKey} 0 0 ${payloadByteLength}`,
            payload: payloadValue
        };
        if (typeof effectiveOptions.resultHandler === 'function') {
            clientRequestDetails.resultHandler = effectiveOptions.resultHandler;
        }
        this.routeClientRequest(clientRequestDetails);
    }

    /**
     * Deletes an item from the cache.
     * Renamed from 'del' to 'removeCacheEntry'.
     * @param {string} entryKey - The key of the item to delete.
     * @param {object} [configurationOptions] - Optional configuration options (resultHandler).
     */
    removeCacheEntry(entryKey, configurationOptions) {
        // --- Input Validation (New Fragment) ---
        if (typeof entryKey !== 'string' || entryKey.trim() === '') {
            throw new Error("Invalid entry key for removeCacheEntry operation.");
        }
        // --- End Input Validation ---

        const effectiveOptions = this.constructor.mergeConfigurationSettings({}, configurationOptions || {});

        const clientRequestDetails = {
            instruction: `delete ${entryKey}`
        };
        if (typeof effectiveOptions.resultHandler === 'function') {
            clientRequestDetails.resultHandler = effectiveOptions.resultHandler;
        }
        this.routeClientRequest(clientRequestDetails);
    }

    /**
     * Terminates the client, closing any active connections or pools.
     * Renamed from 'shutdown' to 'closeClientResources'.
     */
    closeClientResources() {
        let managedResource = null;
        let resourceType = 'unknown'; // Added for logging clarity

        // Use an if-else block instead of a ternary for better readability and logging (Equivalent Rewrite).
        if (this.constructor.useResourcePooling) {
            managedResource = this._connectionResourcePool;
            resourceType = 'connection pool';
        } else {
            managedResource = this._directConnection;
            resourceType = 'direct connection';
        }

        if (managedResource && typeof managedResource.close === 'function') {
            managedResource.close();
            console.log(`CacheServiceConnector: Successfully closed the ${resourceType}.`);
        } else if (managedResource) {
            console.warn(`CacheServiceConnector: Active ${resourceType} found but lacks a 'close' method.`);
        } else {
            console.info(`CacheServiceConnector: No active ${resourceType} to close.`);
        }

        // Reset internal references to ensure resources are properly released.
        // (New Fragment - explicit nulling).
        this._directConnection = null;
        this._connectionResourcePool = null;
    }

    // --- Static Properties and Methods (Rewritten from original module exports) ---

    /**
     * Static flag to control whether connection pooling is used.
     * Renamed from 'exports.pooling' to 'CacheServiceConnector.useResourcePooling'.
     * @type {boolean}
     */
    static useResourcePooling = true; // Default value, can be overridden.

    /**
     * Static utility method to merge configuration settings.
     * Renamed from 'exports.apply' to 'CacheServiceConnector.mergeConfigurationSettings'.
     * Rewritten to use Object.assign for brevity and modern JS.
     * @param {object} destinationObject - The object to merge properties into.
     * @param {object} sourceProperties - The object containing properties to merge from.
     * @returns {object} The modified destination object.
     */
    static mergeConfigurationSettings(destinationObject, sourceProperties) {
        // --- Guard Clause (New Fragment) ---
        if (typeof destinationObject !== 'object' || destinationObject === null) {
            console.error("Attempted to merge settings into an invalid destination object.");
            return destinationObject; // Return original if destination is invalid.
        }
        if (!sourceProperties || typeof sourceProperties !== 'object') {
            return destinationObject; // Nothing to merge if source is invalid.
        }
        // --- End Guard Clause ---

        // Using Object.assign for a more concise and modern way to merge properties.
        // This is functionally equivalent to the original for...in loop for enumerable own properties.
        return Object.assign(destinationObject, sourceProperties);
    }

    // Require external utility modules as static properties.
    // Renamed from 'Connection' to 'CacheConnection'.
    static CacheConnection = require('./cache_connection_handler');
    // Renamed from 'Pool' to 'ConnectionPool'.
    static ConnectionPool = require('./connection_pool_manager');
    // Renamed from 'Request' to 'CacheRequest'.
    // The original code imported 'Request' but it wasn't directly used in the client's prototype methods.
    // It's likely an internal dependency of CacheConnection/ConnectionPool.
    // Keeping it here for fidelity, but it could be removed if truly unused, as a Type III change.
    static CacheRequest = require('./cache_operation_request');
}

// Export the main class as the module.
module.exports = CacheServiceConnector;