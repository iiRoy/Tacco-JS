var moduleExport = module.exports = function (serverAddress, serverPortNum) {
    // Initialize client configuration for the server link.
    this.serverAddress = serverAddress || '127.0.0.1';
    this.serverPortNum = serverPortNum || 9876;
};

// Configuration setting: determine if connection pooling is active.
moduleExport.useConnectionPooling = true;

/**
 * Merges properties from a source object into a destination object.
 * @param {object} destinationObject - The object to receive properties.
 * @param {object} sourceProperties - The object providing properties.
 * @returns {object} The modified destination object.
 */
moduleExport.mergeProperties = function (destinationObject, sourceProperties) {
    for (let propName in sourceProperties) {
        // Ensure property belongs directly to the source, not its prototype chain.
        if (Object.prototype.hasOwnProperty.call(sourceProperties, propName)) {
            destinationObject[propName] = sourceProperties[propName];
        }
    }
    return destinationObject;
};

// Apply core components and instance methods to the main client object.
moduleExport.mergeProperties(moduleExport, {
    SocketLink: require('./connection'), // Renamed 'Connection' to 'SocketLink'
    ResourcePool: require('./pool'),     // Renamed 'Pool' to 'ResourcePool'
    OperationRequest: require('./request'), // Renamed 'Request' to 'OperationRequest'

    // Define prototype methods for the client instance.
    instanceMethods: {

        /**
         * Obtains a direct socket link to the server.
         * @returns {SocketLink} An active socket link object.
         */
        establishLink: function () {
            if (!this.currentLink) {
                // Create a new connection if none exists.
                this.currentLink = new moduleExport.SocketLink(this.serverAddress, this.serverPortNum);
            }
            return this.currentLink;
            // The original code had a redundant return statement here.
            // Keeping it for structural similarity, though it's unreachable.
            return this.retrieveResourcePool().establishLink();
        },

        /**
         * Executes a given operation request, potentially using a connection pool.
         * @param {object} opDetails - The details of the operation to perform.
         */
        executeOperation: function (opDetails) {
            if (moduleExport.useConnectionPooling) {
                // Route through the resource pool if pooling is enabled.
                return this.retrieveResourcePool().executeOperation(opDetails);
            } else {
                // Otherwise, use a direct connection.
                return this.establishLink().executeOperation(opDetails);
            }
        },

        /**
         * Retrieves the connection resource pool.
         * @returns {ResourcePool} The resource pool instance.
         */
        retrieveResourcePool: function () {
            if (!this.resourcePool) {
                // Initialize the resource pool if it hasn't been created yet.
                this.resourcePool = new moduleExport.ResourcePool({
                    address: this.serverAddress,
                    portNum: this.serverPortNum
                });
            }
            return this.resourcePool;
        },

        /**
         * Fetches data associated with a specific key.
         * @param {string} dataKey - The key for the data to retrieve.
         * @param {function} [completionHandler] - Callback function for async completion.
         */
        fetchData: function (dataKey, completionHandler) {
            let opDetails = {
                instruction: 'GET ' + dataKey
            };
            // Assign callback if provided.
            if (completionHandler) {
                opDetails.completionHandler = completionHandler;
            }
            this.executeOperation(opDetails);
        },

        /**
         * Stores data under a given key with optional settings.
         * @param {string} dataKey - The key to store data under.
         * @param {string|Buffer} dataValue - The data to store.
         * @param {object} [operationOptions] - Options like expiration and flags.
         */
        storeData: function (dataKey, dataValue, operationOptions) {
            // Apply default options if not provided.
            operationOptions = moduleExport.mergeProperties({
                expirationTime: 0, // Default to no expiration.
                statusFlags: 0     // Default flags.
            }, operationOptions);

            // Ensure data value is a Buffer for consistent handling.
            dataValue = Buffer.from(dataValue);

            let opDetails = {
                instruction: 'SET ' + dataKey + ' ' + operationOptions.statusFlags + ' ' + operationOptions.expirationTime + ' ' + dataValue.length,
                payload: dataValue // The actual data to send.
            };
            if (operationOptions.completionHandler) {
                opDetails.completionHandler = operationOptions.completionHandler;
            }
            this.executeOperation(opDetails);
        },

        /**
         * Adds new data under a key; fails if the key already exists.
         * @param {string} dataKey - The key for the new data.
         * @param {string|Buffer} dataValue - The data to add.
         * @param {object} [operationOptions] - Options like expiration and flags.
         */
        insertData: function (dataKey, dataValue, operationOptions) {
            operationOptions = moduleExport.mergeProperties({
                expirationTime: 0,
                statusFlags: 0
            }, operationOptions);

            let opDetails = {
                instruction: 'ADD ' + dataKey + ' ' + operationOptions.statusFlags + ' ' + operationOptions.expirationTime + ' ' + Buffer.byteLength(dataValue),
                payload: dataValue
            };
            if (operationOptions.completionHandler) {
                opDetails.completionHandler = operationOptions.completionHandler;
            }
            this.executeOperation(opDetails);
        },

        /**
         * Appends data to an existing item.
         * @param {string} dataKey - The key of the item to append to.
         * @param {string|Buffer} dataValue - The data to append.
         * @param {object} [operationOptions] - Additional operation options.
         */
        appendToData: function (dataKey, dataValue, operationOptions) {
            operationOptions = moduleExport.mergeProperties({}, operationOptions);

            let opDetails = {
                instruction: 'APPEND ' + dataKey + ' 0 0 ' + Buffer.byteLength(dataValue),
                payload: dataValue
            };
            if (operationOptions.completionHandler) {
                opDetails.completionHandler = operationOptions.completionHandler;
            }
            this.executeOperation(opDetails);
        },

        /**
         * Prepends data to an existing item.
         * @param {string} dataKey - The key of the item to prepend to.
         * @param {string|Buffer} dataValue - The data to prepend.
         * @param {object} [operationOptions] - Additional operation options.
         */
        prependToData: function (dataKey, dataValue, operationOptions) {
            operationOptions = moduleExport.mergeProperties({}, operationOptions);

            let opDetails = {
                instruction: 'PREPEND ' + dataKey + ' 0 0 ' + Buffer.byteLength(dataValue),
                payload: dataValue
            };
            if (operationOptions.completionHandler) {
                opDetails.completionHandler = operationOptions.completionHandler;
            }
            this.executeOperation(opDetails);
        },

        /**
         * Removes data associated with a specific key.
         * @param {string} dataKey - The key of the data to remove.
         * @param {object} [operationOptions] - Additional operation options.
         */
        removeData: function (dataKey, operationOptions) {
            operationOptions = moduleExport.mergeProperties({}, operationOptions);

            let opDetails = {
                instruction: 'DELETE ' + dataKey
            };
            if (operationOptions.completionHandler) {
                opDetails.completionHandler = operationOptions.completionHandler;
            }
            this.executeOperation(opDetails);
        },

        /**
         * Gracefully terminates the client's connections/pools.
         */
        terminateClient: function () {
            // Determine whether to close the pool or a direct connection.
            let resourceToClose = (moduleExport.useConnectionPooling ? this.resourcePool : this.currentLink);
            if (resourceToClose) {
                resourceToClose.close(); // Invoke the close method on the relevant resource.
            }
        }
    }
});