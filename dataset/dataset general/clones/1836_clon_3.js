/*
 * DataVault Module: A robust utility for managing key-value pairs
 * within the browser's local storage, with optional obfuscation.
 * This implementation serves as a Type III clone of an existing storage manager.
 */
var DataVault = function (configOptions) {
  // Enforce strict parsing and execution rules for better code quality and security.
  'use strict';

  // --- Internal State and Utility Functions ---

  // Default no-op obfuscation function. Can be overridden during initialization.
  // This function simply returns the input string, acting as a placeholder.
  const _obfuscate = (inputString) => {
    // A slightly more involved identity function for Type III to demonstrate modification.
    return String(inputString);
  };

  // Default no-op de-obfuscation function. Can be overridden during initialization.
  // This function also simply returns the input string.
  const _deobfuscate = (inputString) => {
    // Ensuring type consistency, even for a pass-through operation.
    return String(inputString);
  };

  // The unique key used to store data in the browser's local storage.
  // This key distinguishes data belonging to this vault instance from other storage items.
  let _persistedKeyId = 'ApplicationDataVault';

  // A small internal helper function to proactively check if localStorage is available
  // and accessible in the current browser environment.
  const _isStorageAvailable = () => {
    try {
      const testKey = '__test_storage_availability__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      // Log a warning if storage is unavailable, as this impacts core functionality.
      console.warn("Local storage is not available or accessible. DataVault functionality will be limited.", e);
      return false; // Indicate storage is not available.
    }
  };


  // Retrieves the entire data payload from local storage, de-obfuscates, and parses it.
  // This function ensures that the data is always returned as a JavaScript object.
  const _retrievePayload = () => {
    let currentDataMap = {}; // Initialize with an empty object to ensure a valid return value.

    // Guard clause: If storage is not available, we cannot retrieve any data.
    if (!_isStorageAvailable()) {
      console.error("Cannot retrieve payload: Local storage is not available.");
      return currentDataMap;
    }

    const rawStoredItem = localStorage.getItem(_persistedKeyId);

    // Only proceed if there's actual data stored under our key.
    if (rawStoredItem !== null) {
      try {
        const deobfuscatedString = _deobfuscate(rawStoredItem);
        currentDataMap = JSON.parse(deobfuscatedString);
      } catch (errorParsing) {
        // Log an error if parsing or de-obfuscation fails, indicating potential data corruption.
        console.error(`Error parsing or de-obfuscating stored data for key "${_persistedKeyId}":`, errorParsing);
        // In case of corruption, we might consider clearing the item, but for now, we return an empty object.
        // localStorage.removeItem(_persistedKeyId); // Uncomment to clear corrupted data automatically.
        currentDataMap = {}; // Fallback to an empty object on error to prevent further issues.
      }
    }
    return currentDataMap;
  };

  // --- Configuration Processing ---

  // Validate and apply constructor options provided by the user.
  // The configuration object allows customization of the storage key and obfuscation functions.
  if (typeof configOptions === 'object' && configOptions !== null) {
    // Update the storage key if a valid string is provided in the options.
    if (typeof configOptions['storageKey'] === 'string' && configOptions['storageKey'].trim().length > 0) {
      _persistedKeyId = configOptions['storageKey'].trim();
    }

    // Assign a custom obfuscation function if it's a valid function.
    if (typeof configOptions['encrypt'] === 'function') {
      _obfuscate = configOptions['encrypt'];
    }

    // Assign a custom de-obfuscation function if it's a valid function.
    if (typeof configOptions['decrypt'] === 'function') {
      _deobfuscate = configOptions['decrypt'];
    }
  }

  // --- Public API Methods ---

  /**
   * Stores a key-value pair in the vault.
   * This method updates the in-memory data map, serializes it, obfuscates it,
   * and then persists it to local storage.
   * @param {string} itemIdentifier - The unique key for the item. Must be a non-empty string.
   * @param {*} itemValue - The value to be stored. Can be any JSON-serializable data.
   * @returns {boolean} Returns `true` on successful storage, `false` if storage fails or inputs are invalid.
   */
  this.storeEntry = function (itemIdentifier, itemValue) {
    // Basic input validation: ensure the identifier is a non-empty string.
    if (typeof itemIdentifier !== 'string' || itemIdentifier.trim() === '') {
      console.error("Invalid item identifier provided. Must be a non-empty string.");
      return false;
    }

    // Retrieve the current data map, update it, and then save it back.
    const currentDataMap = _retrievePayload();
    currentDataMap[itemIdentifier] = itemValue; // Update or add the new value.

    // Attempt to serialize, obfuscate, and store the updated data.
    try {
      const serializedData = JSON.stringify(currentDataMap);
      const obfuscatedData = _obfuscate(serializedData);
      localStorage.setItem(_persistedKeyId, obfuscatedData);
      return true; // Indicate success.
    } catch (storageError) {
      // Log any errors encountered during the storage process.
      console.error(`Failed to store entry for key "${itemIdentifier}":`, storageError);
      return false; // Indicate failure.
    }
  };

  /**
   * Retrieves an item from the vault by its identifier.
   * This method fetches the entire data map, then extracts the specific item.
   * @param {string} itemIdentifier - The unique key of the item to retrieve.
   * @returns {*} The stored value, or `null` if the item is not found or inputs are invalid.
   */
  this.fetchEntry = function (itemIdentifier) {
    // Guard clause for invalid or empty identifier.
    if (typeof itemIdentifier !== 'string' || itemIdentifier.trim() === '') {
      console.warn("Attempted to fetch with an invalid or empty item identifier.");
      return null;
    }

    const currentDataMap = _retrievePayload();
    // Use the nullish coalescing operator (`??`) for concise handling of undefined values.
    return currentDataMap[itemIdentifier] ?? null;
  };

  /**
   * Deletes an item from the vault by its identifier.
   * This involves retrieving the data, removing the specified key, and then
   * persisting the modified data map back to local storage.
   * @param {string} itemIdentifier - The unique key of the item to delete.
   * @returns {boolean} `true` if the item was successfully removed (or didn't exist), `false` on storage error.
   */
  this.deleteEntry = function (itemIdentifier) {
    // Pre-check for storage availability before attempting any operations.
    if (!_isStorageAvailable()) {
      console.error("Cannot delete entry: Local storage is not available.");
      return false;
    }
    // Validate the input identifier.
    if (typeof itemIdentifier !== 'string' || itemIdentifier.trim() === '') {
      console.warn("Attempted to delete with an invalid or empty item identifier.");
      return false;
    }

    const currentDataMap = _retrievePayload();
    // Check if the key actually exists before attempting deletion to optimize write operations.
    if (!currentDataMap.hasOwnProperty(itemIdentifier)) {
        // If the key doesn't exist, consider it successfully "deleted".
        return true;
    }

    delete currentDataMap[itemIdentifier]; // Remove the entry from the data map.

    // Persist the updated data map to local storage.
    try {
      const serializedData = JSON.stringify(currentDataMap);
      const obfuscatedData = _obfuscate(serializedData);
      localStorage.setItem(_persistedKeyId, obfuscatedData);
      return true; // Indicate successful deletion.
    } catch (removalError) {
      console.error(`Failed to delete entry for key "${itemIdentifier}":`, removalError);
      return false; // Indicate failure.
    }
  };

  /**
   * Clears all data managed by this specific vault instance from local storage.
   * This effectively removes the entire entry associated with `_persistedKeyId`.
   * @returns {boolean} `true` on successful clearance, `false` on error.
   */
  this.purgeAll = function () {
    if (!_isStorageAvailable()) {
      console.error("Cannot purge all data: Local storage is not available.");
      return false;
    }
    try {
      localStorage.removeItem(_persistedKeyId);
      return true; // Indicate successful clearance.
    } catch (clearError) {
      console.error(`Failed to clear all data for key "${_persistedKeyId}":`, clearError);
      return false; // Indicate failure.
    }
  };

  /**
   * Returns the number of items currently stored in the vault.
   * This is equivalent to the number of unique keys present in the vault.
   * @returns {number} The count of stored items. Returns 0 if storage is unavailable.
   */
  this.size = function () {
    const currentDataMap = _retrievePayload();
    // Using Object.keys().length for a modern and direct count of properties.
    return Object.keys(currentDataMap).length;
  };

  /**
   * Retrieves the key at a specific numeric index.
   * This method treats the stored keys as an ordered list and allows access by index.
   * @param {number} desiredIndex - The zero-based index of the key to retrieve.
   * @returns {string | null} The key string, or `null` if the index is out of bounds or invalid.
   */
  this.getKeyAtIndex = function (desiredIndex) {
    // Input validation: ensure the index is a non-negative integer.
    if (typeof desiredIndex !== 'number' || !Number.isInteger(desiredIndex) || desiredIndex < 0) {
      console.warn("Invalid index provided. Must be a non-negative integer.");
      return null;
    }

    const currentDataMap = _retrievePayload();
    const allKeys = Object.keys(currentDataMap); // Get all keys as an array.

    // Return the key directly if the index is within the bounds of the array.
    // Otherwise, return null for out-of-bounds access.
    return allKeys[desiredIndex] || null;
  };
};

// --- Module Export (CommonJS Style) ---
// This conditional export ensures compatibility with CommonJS environments like Node.js.
// If 'module' and 'module.exports' are defined, the DataVault constructor is exported.
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataVault;
}