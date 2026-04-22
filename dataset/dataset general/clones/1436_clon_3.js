class DataStoreManager {
  /**
   * Initializes a new manager for data persistence.
   *
   * This class provides an abstraction layer over a key-value store,
   * supporting both publicly accessible and dynamically generated
   * (e.g., user-specific) keys for data storage and retrieval.
   *
   * @param {object} connectionClient An established client for the underlying data store (e.g., a Redis client instance).
   *                                  It must expose `set`, `get`, and `flushdb` methods.
   * @param {Function} dynamicKeyResolver A function that generates a unique, potentially user-specific,
   *                                      key for an item based on its public identifier.
   *                                      Expected signature: `(publicIdentifier: string) => string`.
   */
  constructor(connectionClient, dynamicKeyResolver) {
    // --- Constructor-level validation and guard clauses ---
    if (!connectionClient || typeof connectionClient.set !== 'function' || typeof connectionClient.get !== 'function' || typeof connectionClient.flushdb !== 'function') {
      console.error("Initialization Error: The provided connection client is invalid or missing required methods (set, get, flushdb).");
      throw new Error("Invalid data store connection client provided.");
    }
    if (typeof dynamicKeyResolver !== 'function') {
      console.error("Initialization Error: A valid dynamic key resolver function is required.");
      throw new Error("A valid dynamic key resolver function is required.");
    }

    // Assign internal properties
    this.persistentClient = connectionClient;
    this.keyGenerationStrategy = dynamicKeyResolver;

    // --- Internal helper functions for data processing ---

    /**
     * Prepares data for storage by serializing it to a JSON string.
     * Functions within the data structure are explicitly removed during serialization.
     *
     * @param {any} inputData The data payload to be serialized.
     * @returns {string|null} The JSON string representation of the data, or null if input is undefined.
     */
    const serializeForStorage = (inputData) => {
      if (inputData === undefined) {
        console.debug("Attempted to serialize an undefined payload. Storing as null.");
        return null; // Explicitly handle undefined input
      }
      return JSON.stringify(inputData, (propertyName, propertyValue) => {
        // Remove functions from the object before serialization to prevent errors or unexpected behavior.
        return (typeof propertyValue === 'function') ? undefined : propertyValue; // 'undefined' removes the key from the output
      });
    };

    /**
     * Safely parses a JSON string retrieved from storage back into an object.
     * Handles cases where the retrieved content might be null or parsing fails.
     *
     * @param {string|null|undefined} serializedContent The raw string content from the data store.
     * @param {Function} completionCallback The callback to invoke with (error, parsedObject).
     */
    const parseRetrievedContent = (serializedContent, completionCallback) => {
      if (serializedContent === null || serializedContent === undefined || serializedContent === "null") { // "null" string might be stored if original was null
        return completionCallback(null, null); // No content found or explicitly stored null
      }
      try {
        const parsedObject = JSON.parse(serializedContent);
        return completionCallback(null, parsedObject);
      } catch (parsingError) {
        console.error("Error during content deserialization:", parsingError.message, "Raw content:", serializedContent);
        return completionCallback(parsingError);
      }
    };

    // --- Public methods for the DataStoreManager instance ---

    /**
     * Stores a data item in the managed persistent store.
     * The item can be designated as confidential, which means a dynamically
     * generated key will be used for storage.
     *
     * @param {string} resourceLocator The public, unique identifier for the data item.
     * @param {boolean} isConfidential True if the item should be stored under a dynamically generated, private key; false for public key.
     * @param {any} itemPayload The actual data to be stored. Functions within this payload are stripped.
     * @param {Function} completionHandler A callback function with signature `(error: Error | null, result: any)`
     *                                     to be invoked upon completion of the storage operation.
     */
    this.commitData = (resourceLocator, isConfidential, itemPayload, completionHandler) => {
      // --- Input validation for commitData ---
      if (typeof resourceLocator !== 'string' || resourceLocator.trim() === '') {
        return completionHandler(new Error("A valid non-empty string resource locator is required for commitData."));
      }
      if (typeof completionHandler !== 'function') {
        console.warn(`Warning: No completion handler provided for commitData operation with locator '${resourceLocator}'. Operation will proceed but results won't be reported.`);
        // If no callback, we can't report errors or success, so just return.
        return;
      }

      try {
        // Determine the actual storage key based on the confidentiality flag
        const storageKey = isConfidential ? this.keyGenerationStrategy(resourceLocator) : resourceLocator;

        // Prepare the payload for storage
        const processedPayload = serializeForStorage(itemPayload);
        if (processedPayload === null && itemPayload !== null && itemPayload !== undefined) {
            console.warn(`CommitData: Payload for key '${storageKey}' became null after serialization. Original type: ${typeof itemPayload}.`);
        }

        // Execute the set operation on the persistent client
        this.persistentClient.set(storageKey, processedPayload, (operationError, operationResult) => {
          if (operationError) {
            console.error(`Failed to store data for key '${storageKey}':`, operationError.message);
            return completionHandler(operationError);
          }
          console.log(`Successfully stored data for key: ${storageKey}`);
          completionHandler(null, operationResult);
        });
      } catch (internalProcessingError) {
        console.error("An unexpected error occurred during commitData execution:", internalProcessingError.message);
        completionHandler(internalProcessingError);
      }
    };

    /**
     * Retrieves a data item from the persistent store.
     * It first attempts to retrieve using a dynamically generated (private) key,
     * and if not found, falls back to the public key.
     *
     * @param {string} resourceLocator The public, unique identifier for the data item.
     * @param {Function} resultHandler A callback function with signature `(error: Error | null, data: any | null)`
     *                                 to be invoked with the retrieved data or an error.
     */
    this.fetchData = (resourceLocator, resultHandler) => {
      // --- Input validation for fetchData ---
      if (typeof resourceLocator !== 'string' || resourceLocator.trim() === '') {
        return resultHandler(new Error("A valid non-empty string resource locator is required for fetchData."));
      }
      if (typeof resultHandler !== 'function') {
        console.warn(`Warning: No result handler provided for fetchData operation with locator '${resourceLocator}'. Operation will proceed but results won't be reported.`);
        return;
      }

      const dynamicallyGeneratedKey = this.keyGenerationStrategy(resourceLocator);
      const publicIdentifierKey = resourceLocator; // The public key is the resource locator itself

      // Inner utility to handle the final parsing and callback after a successful get operation
      const processFinalResult = (error, rawValue) => {
        if (error) {
          console.error(`Error during data retrieval for resource '${resourceLocator}':`, error.message);
          return resultHandler(error);
        }
        parseRetrievedContent(rawValue, resultHandler); // Use the shared parse helper
      };

      // --- Retrieval Strategy: Private scope first, then public ---

      // Step 1: Attempt to retrieve from the dynamically generated (private) scope
      this.persistentClient.get(dynamicallyGeneratedKey, (privateScopeError, privateScopeValue) => {
        if (privateScopeError) {
          console.error(`Fetch from private scope failed for '${resourceLocator}':`, privateScopeError.message);
          // If private fetch errors, we treat it as a failure for the entire operation.
          return resultHandler(privateScopeError);
        }

        // If a value is successfully found in the private scope, process and return it immediately.
        if (privateScopeValue !== null && privateScopeValue !== undefined) {
          console.log(`Data found in private scope for '${resourceLocator}'.`);
          return processFinalResult(null, privateScopeValue);
        }

        // Step 2: No value in private scope, now attempt to retrieve from the public scope
        console.log(`No private data found for '${resourceLocator}', checking public scope.`);
        this.persistentClient.get(publicIdentifierKey, (publicScopeError, publicScopeValue) => {
          // Regardless of public scope success or failure, this is the final lookup, so process its result.
          processFinalResult(publicScopeError, publicScopeValue);
        });
      });
    };

    /**
     * Completely purges all data from the underlying data store.
     * This operation is irreversible and should be used with extreme caution.
     *
     * @param {Function} completionHandler A callback function with signature `(error: Error | null, result: any)`
     *                                     to be invoked upon completion of the purge operation.
     */
    this.purgeStore = (completionHandler) => {
      // --- Input validation for purgeStore ---
      if (typeof completionHandler !== 'function') {
        console.warn("Warning: No completion handler provided for purgeStore operation. Operation will proceed but results won't be reported.");
        return;
      }
      // Add a prominent warning log for this destructive operation
      console.warn("DANGER: Initiating a full purge of the data store. This action is irreversible and will delete ALL data.");

      this.persistentClient.flushdb((operationError, operationResult) => {
        if (operationError) {
          console.error("Failed to purge data store:", operationError.message);
          return completionHandler(operationError);
        }
        console.log("Data store purged successfully.");
        completionHandler(null, operationResult);
      });
    };
  }
}

// Export the DataStoreManager class for module usage.
module.exports = DataStoreManager;