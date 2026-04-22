var dataStoreModule = (function() {
  /**
   * Configuration constants for the data store module.
   * These values define operational parameters and key names.
   */
  const configurationSettings = {
    // Defines the maximum allowed storage size in bytes (4.5 MB).
    // This is a common practical limit for localStorage to prevent issues.
    maximumStorageAllocationBytes: 4.5 * 1024 * 1024,
    // The key used in localStorage to track the access order of items (Least Recently Used).
    lruOrderTrackingKey: 'lru_access_sequence',
    // Delay in milliseconds for asynchronous operations to prevent UI blocking.
    // A value of 0 defers execution to the next event loop cycle.
    asynchronousOperationDelayMs: 0
  };

  /**
   * Internal state management for the data store.
   * Tracks initialization status and operational readiness.
   */
  const moduleState = {
    isModuleInitialized: false,
    isStorageSystemFunctional: false // Indicates if localStorage is available and usable.
  };

  // The main public interface object for the data store.
  const dataStore = {};

  /**
   * Safely attempts to parse a JSON string into a JavaScript object.
   * Provides error handling and returns the original input if parsing fails or is unnecessary.
   * @param {any} inputCandidate The value to be parsed.
   * @returns {any} The parsed object or the original input on failure/non-string input.
   */
  function safeJSONParseOperation(inputCandidate) {
    // If the input is not a string or is an empty string, it cannot be JSON parsed.
    // Return it as-is, assuming it's already in the desired format or an invalid input.
    if (typeof inputCandidate !== 'string' || inputCandidate.trim().length === 0) {
      return inputCandidate;
    }
    try {
      const parsedResult = JSON.parse(inputCandidate);
      return parsedResult;
    } catch (parseError) {
      // Log a warning if parsing fails but gracefully return the original string.
      console.warn("DataStore: JSON parsing failed for input:", inputCandidate, "Error:", parseError.message);
      return inputCandidate;
    }
  }

  /**
   * Safely attempts to convert a JavaScript object into a JSON string.
   * Returns the original input if it's already a string or if stringification fails.
   * @param {any} objectToSerialize The object to convert to a JSON string.
   * @returns {string|any} The JSON string representation or the original object on failure/pre-stringified input.
   */
  function safeJSONStringifyOperation(objectToSerialize) {
    // If the object is already a string, no need to stringify.
    if (typeof objectToSerialize === 'string') {
      return objectToSerialize;
    }
    try {
      const serializedString = JSON.stringify(objectToSerialize);
      return serializedString;
    } catch (stringifyError) {
      // Log an error if stringification fails and return the original object.
      console.error("DataStore: JSON stringification failed for object:", objectToSerialize, "Error:", stringifyError.message);
      return objectToSerialize;
    }
  }

  /**
   * Verifies the availability and functionality of a given browser storage system.
   * Performs a dummy write/read operation to ensure actual usability.
   * @param {string} systemIdentifier The name of the storage system (e.g., 'localStorage', 'sessionStorage').
   * @returns {boolean} True if the storage system is fully supported and operational, false otherwise.
   */
  function checkStorageSystemAvailability(systemIdentifier) {
    // Input validation: ensure a valid string identifier is provided.
    if (typeof systemIdentifier !== 'string' || systemIdentifier.length === 0) {
      console.error("DataStore: Attempted to check availability with an invalid storage system identifier.");
      return false;
    }
    try {
      // Check if the system exists on the window object and is not null.
      // Perform a test operation to catch cases where storage is disabled (e.g., incognito mode).
      const testKey = `__${systemIdentifier}_test_key__`;
      const testValue = `__${systemIdentifier}_test_value__`;
      window[systemIdentifier].setItem(testKey, testValue);
      window[systemIdentifier].removeItem(testKey); // Clean up the test entry.
      return true;
    } catch (accessibilityError) {
      // Log a warning if the storage system is not accessible.
      console.warn(`DataStore: Storage system '${systemIdentifier}' is not available or accessible. Reason: ${accessibilityError.message}`);
      return false;
    }
  }

  // Initialize the operational status of the data store by checking localStorage.
  moduleState.isStorageSystemFunctional = checkStorageSystemAvailability('localStorage');

  /**
   * Calculates the approximate byte size of a string using a UTF-8 compatible encoding scheme.
   * This estimation is useful for managing storage limits.
   * @param {any} stringValueToMeasure The value whose byte length is to be calculated (will be converted to string).
   * @returns {number} The estimated byte length of the string. Returns 0 for null/undefined inputs.
   */
  function calculateUTF8StringByteLength(stringValueToMeasure) {
    // Guard clause for non-string or empty inputs.
    if (stringValueToMeasure === null || stringValueToMeasure === undefined) {
      return 0;
    }
    const processedString = String(stringValueToMeasure); // Ensure it's a string.

    let totalByteCount = 0;
    for (let charIndex = 0; charIndex < processedString.length; charIndex++) {
      const unicodeCharCode = processedString.charCodeAt(charIndex);
      // Determine byte length based on Unicode character code ranges for UTF-8.
      if (unicodeCharCode < 0x80) { // 0-127 (Basic Latin) -> 1 byte
        totalByteCount += 1;
      } else if (unicodeCharCode < 0x800) { // 128-2047 -> 2 bytes
        totalByteCount += 2;
      } else if (unicodeCharCode < 0x10000) { // 2048-65535 (BMP) -> 3 bytes
        totalByteCount += 3;
      } else { // Characters above BMP (surrogate pairs in JavaScript) -> 4 bytes
        // This handles characters like emojis or less common CJK characters.
        totalByteCount += 4;
        // Skip the next character as it's part of the surrogate pair.
        // For accurate UTF-8, this is how surrogate pairs are handled.
        charIndex++; // Advance past the second surrogate character.
      }
    }
    return totalByteCount;
  }

  /**
   * Verifies if there is enough free space in the storage system for a required number of bytes.
   * @param {number} bytesRequired The number of bytes that need to be accommodated.
   * @returns {boolean} True if sufficient space is available, false otherwise.
   */
  function hasSufficientStorageCapacity(bytesRequired) {
    // Input validation: ensure bytesRequired is a positive number.
    if (typeof bytesRequired !== 'number' || bytesRequired < 0) {
      console.error("DataStore: Invalid byte count provided for capacity check.");
      return false;
    }
    return bytesRequired < dataStore.getRemainingCapacity();
  }

  /**
   * Updates the Least Recently Used (LRU) order list for a specific item key.
   * Moves the item to the end of the list (most recently used position) or adds it if new.
   * @param {string} itemIdentifier The key of the item whose access order needs updating.
   * @returns {Array<string>} The updated LRU order list.
   */
  function refreshLRUAccessOrder(itemIdentifier) {
    // Guard against invalid or reserved keys.
    if (typeof itemIdentifier !== 'string' || !itemIdentifier || itemIdentifier === configurationSettings.lruOrderTrackingKey) {
      console.debug("DataStore: Skipping LRU order update for invalid or reserved key:", itemIdentifier);
      return [];
    }

    let currentOrderList = safeJSONParseOperation(localStorage.getItem(configurationSettings.lruOrderTrackingKey));
    // Ensure the list is an array, initializing if null or invalid.
    if (!Array.isArray(currentOrderList)) {
      currentOrderList = [];
    }

    const keyPosition = currentOrderList.indexOf(itemIdentifier);

    if (keyPosition > -1) {
      // If the key already exists, remove it from its current position.
      currentOrderList.splice(keyPosition, 1);
    }
    // Add the key to the end of the list, marking it as most recently used.
    currentOrderList.push(itemIdentifier);

    localStorage.setItem(configurationSettings.lruOrderTrackingKey, safeJSONStringifyOperation(currentOrderList));
    return currentOrderList;
  }

  /**
   * Evicts items from the storage based on the LRU strategy until a specified amount of space is freed.
   * Starts by removing the least recently used items.
   * @param {number} targetBytesToFree The minimum number of bytes that need to be cleared.
   */
  function evictLeastRecentlyUsedItems(targetBytesToFree) {
    // Guard clause for invalid target byte amount.
    if (typeof targetBytesToFree !== 'number' || targetBytesToFree <= 0) {
      console.error("DataStore: Invalid byte amount specified for eviction process.");
      return;
    }

    let bytesReclaimedSoFar = 0;
    while (bytesReclaimedSoFar < targetBytesToFree) {
      let lruList = safeJSONParseOperation(localStorage.getItem(configurationSettings.lruOrderTrackingKey));

      // If the LRU list is empty, no more items can be evicted.
      if (!Array.isArray(lruList) || lruList.length === 0) {
        console.warn("DataStore: LRU list is empty, unable to free more space via eviction.");
        break;
      }

      const keyToEvict = lruList.shift(); // Get the least recently used key.
      localStorage.setItem(configurationSettings.lruOrderTrackingKey, safeJSONStringifyOperation(lruList)); // Update the LRU list.

      if (keyToEvict && keyToEvict !== configurationSettings.lruOrderTrackingKey) {
        const valueOfEvictedItem = localStorage.getItem(keyToEvict);
        if (valueOfEvictedItem !== null) {
          const sizeOfEvictedItem = calculateUTF8StringByteLength(keyToEvict + valueOfEvictedItem);
          bytesReclaimedSoFar += sizeOfEvictedItem;
          localStorage.removeItem(keyToEvict); // Explicitly remove the item.
          console.info(`DataStore: Evicted item '${keyToEvict}' to reclaim ${sizeOfEvictedItem} bytes.`);
        } else {
          // This case suggests a discrepancy between LRU list and actual storage.
          console.warn(`DataStore: Key '${keyToEvict}' in LRU list but not found in localStorage. Skipping removal.`);
        }
      } else if (keyToEvict === configurationSettings.lruOrderTrackingKey) {
          // Defensive check: prevent evicting the LRU list itself.
          console.error(`DataStore: Attempted to evict the LRU tracking key. This should not happen.`);
      }
    }
    console.log(`DataStore: Eviction complete. Reclaimed ${bytesReclaimedSoFar} bytes, targeted ${targetBytesToFree} bytes.`);
  }

  /**
   * Calculates the total approximate byte size currently occupied by all items in the data store.
   * This includes the size of both keys and their corresponding values.
   * @returns {number} The total current usage in bytes. Returns 0 if storage is not functional.
   */
  dataStore.getCurrentStorageUsage = function() {
    if (!moduleState.isStorageSystemFunctional) {
      console.warn("DataStore: Storage system not operational. Current usage cannot be determined.");
      return 0;
    }

    let cumulativeByteSize = 0;
    const allStoredKeys = Object.keys(localStorage);

    for (const currentKey of allStoredKeys) {
      const storedValue = localStorage.getItem(currentKey);
      if (storedValue !== null) {
        // Include both key and value in the size calculation.
        cumulativeByteSize += calculateUTF8StringByteLength(currentKey + storedValue);
      }
    }
    return cumulativeByteSize;
  };

  /**
   * Determines the remaining available capacity in the data store in bytes.
   * @returns {number} The amount of free space remaining in bytes. Returns 0 if storage is not functional.
   */
  dataStore.getRemainingCapacity = function() {
    if (!moduleState.isStorageSystemFunctional) {
      return 0; // No capacity if storage is not functional.
    }
    const currentlyUsedBytes = dataStore.getCurrentStorageUsage();
    const availableCapacity = configurationSettings.maximumStorageAllocationBytes - currentlyUsedBytes;
    // Ensure the returned capacity is never negative.
    return Math.max(0, availableCapacity);
  };

  /**
   * Initializes the LRU order tracking list if it doesn't already exist in localStorage.
   * This ensures the mechanism for managing item access order is set up correctly.
   */
  function initializeLRUTrackingList() {
    if (!moduleState.isStorageSystemFunctional) {
      return;
    }
    const existingLRUList = localStorage.getItem(configurationSettings.lruOrderTrackingKey);
    // If the list doesn't exist or is invalid, initialize it as an empty array.
    if (existingLRUList === null || !Array.isArray(safeJSONParseOperation(existingLRUList))) {
      localStorage.setItem(configurationSettings.lruOrderTrackingKey, safeJSONStringifyOperation([]));
      console.info("DataStore: LRU access order list initialized.");
    }
  }

  // Perform initial setup for the LRU tracking list upon module load.
  initializeLRUTrackingList();
  moduleState.isModuleInitialized = true;

  /**
   * Stores a key-value pair in the data store, managing storage space with LRU eviction.
   * The operation is asynchronous to prevent blocking the main thread.
   * @param {string} storageKey The unique key for the item.
   * @param {any} valueToStore The data to be stored.
   * @param {Function} [onCompletionCallback] Optional callback function `(error)` to be executed upon completion.
   */
  dataStore.storeDataEntry = function(storageKey, valueToStore, onCompletionCallback) {
    // Guard clause: check if the storage system is functional.
    if (!moduleState.isStorageSystemFunctional) {
      console.error("DataStore: Storage system is not operational. Cannot store data.");
      if (typeof onCompletionCallback === 'function') onCompletionCallback(new Error("Storage system not available."));
      return;
    }
    // Guard clause: validate the storage key.
    if (typeof storageKey !== 'string' || storageKey.length === 0 || storageKey === configurationSettings.lruOrderTrackingKey) {
      console.error("DataStore: Invalid or reserved key provided for storing data:", storageKey);
      if (typeof onCompletionCallback === 'function') onCompletionCallback(new Error("Invalid storage key."));
      return;
    }

    // Defer the actual storage logic to the next event loop cycle.
    setTimeout(() => {
      const stringifiedData = safeJSONStringifyOperation(valueToStore);
      const dataSizeInBytes = calculateUTF8StringByteLength(storageKey + stringifiedData);

      // Check if there's enough space; if not, trigger eviction.
      if (!hasSufficientStorageCapacity(dataSizeInBytes)) {
        console.warn(`DataStore: Insufficient space for key '${storageKey}' (${dataSizeInBytes} bytes). Initiating eviction process.`);
        evictLeastRecentlyUsedItems(dataSizeInBytes);
      }

      // Update the LRU order to mark this item as recently accessed.
      refreshLRUAccessOrder(storageKey);

      // Store the item in localStorage.
      localStorage.setItem(storageKey, stringifiedData);
      console.info(`DataStore: Successfully stored '${storageKey}' (approx. ${dataSizeInBytes} bytes).`);

      // Invoke the callback if provided, indicating success.
      if (typeof onCompletionCallback === 'function') {
        onCompletionCallback(null); // Null indicates no error.
      }
    }, configurationSettings.asynchronousOperationDelayMs);
  };

  /**
   * Retrieves an item from the data store by its key.
   * The operation is asynchronous to prevent blocking the main thread.
   * @param {string} storageKey The key of the item to retrieve.
   * @param {Function} resultHandlerCallback Callback function `(error, value)` to receive the retrieved data.
   *                                       `value` will be `undefined` if the item is not found.
   */
  dataStore.retrieveDataEntry = function(storageKey, resultHandlerCallback) {
    // Guard clause: ensure storage is functional.
    if (!moduleState.isStorageSystemFunctional) {
      console.error("DataStore: Storage system is not operational. Cannot retrieve data.");
      if (typeof resultHandlerCallback === 'function') resultHandlerCallback(new Error("Storage system not available."));
      return;
    }
    // Guard clause: validate the storage key.
    if (typeof storageKey !== 'string' || storageKey.length === 0 || storageKey === configurationSettings.lruOrderTrackingKey) {
      console.error("DataStore: Invalid or reserved key provided for retrieving data:", storageKey);
      if (typeof resultHandlerCallback === 'function') resultHandlerCallback(new Error("Invalid storage key."));
      return;
    }
    // Mandate for a callback: ensure a handler is provided.
    if (typeof resultHandlerCallback !== 'function') {
      console.error("DataStore: A callback function is required for retrieveDataEntry operation.");
      return;
    }

    // Defer the actual retrieval logic.
    setTimeout(() => {
      const retrievedStringData = localStorage.getItem(storageKey);

      if (retrievedStringData !== null) { // Check for null explicitly (item exists).
        // Update LRU order as this item has just been accessed.
        refreshLRUAccessOrder(storageKey);
        // Parse the retrieved string data back into an object.
        const parsedValue = safeJSONParseOperation(retrievedStringData);
        console.info(`DataStore: Successfully retrieved '${storageKey}'.`);
        resultHandlerCallback(null, parsedValue); // Pass null for no error, then the parsed value.
      } else {
        // Cache miss: item not found in storage.
        console.info(`DataStore: Item with key '${storageKey}' not found.`);
        resultHandlerCallback(null, undefined); // Consistent with original: return undefined for a cache miss.
      }
    }, configurationSettings.asynchronousOperationDelayMs);
  };

  // Return the public interface of the data store module.
  return dataStore;

})(); // End of Immediately Invoked Function Expression (IIFE)