/*
 * Enhanced Storage Management Utility for jQuery
 *
 * Copyright (c) 2013-2024 J. Maverick
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 *
 * Project Repository:
 * https://github.com/jmaverick/jQuery-Storage-API-Enhanced
 *
 * Current Build Version: 2.0.0-alpha
 *
 */
(function (storageFactory) {
  // Check for Asynchronous Module Definition (AMD) environment
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], storageFactory);
  }
  // Check for CommonJS environment (e.g., Node.js)
  else if (typeof exports === 'object') {
    storageFactory(require('jquery'));
  }
  // Assume browser global scope if no module loader detected
  else {
    storageFactory(jQuery);
  }
}(function(jQueryInstance){
  // Define prefixes for cookie fallback keys to prevent clashes
  var localCookieKeyPrefix = "app_lcl_";
  var sessionCookieKeyPrefix = "app_sess_";

  // Helper function to safely parse JSON or return raw string
  function tryParseJson(valueToParse) {
    if (typeof valueToParse !== 'string' || !valueToParse) {
      return valueToParse; // Not a string or empty, return as is
    }
    try {
      const parsed = JSON.parse(valueToParse);
      // Ensure that if it was a stringified primitive, it's not re-stringified
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed;
      }
      return valueToParse; // Was a primitive string, return raw
    } catch (parseError) {
      return valueToParse; // Parsing failed, treat as plain string
    }
  }

  // Core function to retrieve data from a storage mechanism
  function retrieveStoredValue(storageIdentifier) {
    const inputArguments = arguments;
    const argumentCount = inputArguments.length;
    const targetStorage = window[storageIdentifier];
    const primaryKey = inputArguments[1];
    let queryResult;

    // Validate minimum arguments
    if (argumentCount < 2) {
      throw new Error('At least two arguments are required for data retrieval.');
    }

    // Handle array of keys for bulk retrieval
    if (jQueryInstance.isArray(primaryKey)) {
      queryResult = {};
      for (let i = 0; i < primaryKey.length; i++) {
        const currentItemKey = primaryKey[i];
        queryResult[currentItemKey] = tryParseJson(targetStorage.getItem(currentItemKey));
      }
      return queryResult;
    }
    // Handle single key retrieval
    else if (argumentCount === 2) {
      return tryParseJson(targetStorage.getItem(primaryKey));
    }
    // Handle nested key path retrieval
    else {
      let currentLevelData;
      try {
        currentLevelData = tryParseJson(targetStorage.getItem(primaryKey));
        if (currentLevelData === null || typeof currentLevelData === 'undefined') {
          throw new ReferenceError(`Primary key '${primaryKey}' not found in storage.`);
        }
      } catch (initialError) {
        throw new ReferenceError(`Cannot access '${primaryKey}' for nested retrieval.`);
      }

      // Traverse deeper into the object structure
      for (let j = 2; j < argumentCount - 1; j++) {
        const nextKeySegment = inputArguments[j];
        if (typeof currentLevelData !== 'object' || currentLevelData === null || !currentLevelData.hasOwnProperty(nextKeySegment)) {
          const pathSoFar = Array.prototype.slice.call(inputArguments, 1, j + 1).join('.');
          throw new ReferenceError(`Path segment '${pathSoFar}' not defined in storage.`);
        }
        currentLevelData = currentLevelData[nextKeySegment];
      }

      // Final segment can be an array of keys or a single key
      const finalSegment = inputArguments[argumentCount - 1];
      if (jQueryInstance.isArray(finalSegment)) {
        const finalResults = {};
        for (let k = 0; k < finalSegment.length; k++) {
          const subKey = finalSegment[k];
          if (currentLevelData && currentLevelData.hasOwnProperty(subKey)) {
            finalResults[subKey] = currentLevelData[subKey];
          } else {
            finalResults[subKey] = undefined; // Indicate missing sub-key
          }
        }
        return finalResults;
      } else {
        if (currentLevelData && currentLevelData.hasOwnProperty(finalSegment)) {
          return currentLevelData[finalSegment];
        }
        return undefined; // If the final segment is not found
      }
    }
  }

  // Core function to store data into a storage mechanism
  function assignStoredValue(storageIdentifier) {
    const inputArguments = arguments;
    const argumentCount = inputArguments.length;
    const targetStorage = window[storageIdentifier];
    const primaryKeyOrObject = inputArguments[1];
    const valueToSet = inputArguments[2];
    let dataToOperateOn = {};

    // Validate minimum arguments for setting data
    if (argumentCount < 2 || (!jQueryInstance.isPlainObject(primaryKeyOrObject) && argumentCount < 3)) {
      throw new Error('Insufficient arguments: Either an object for bulk setting or a key-value pair is required.');
    }

    // Handle setting multiple values from an object
    if (jQueryInstance.isPlainObject(primaryKeyOrObject)) {
      for (const propName in primaryKeyOrObject) {
        if (primaryKeyOrObject.hasOwnProperty(propName)) {
          const propValue = primaryKeyOrObject[propName];
          targetStorage.setItem(propName, JSON.stringify(propValue));
        }
      }
      return primaryKeyOrObject;
    }
    // Handle setting a single key-value pair
    else if (argumentCount === 3) {
      if (valueToSet === null || typeof valueToSet !== 'object') {
        targetStorage.setItem(primaryKeyOrObject, valueToSet);
      } else {
        targetStorage.setItem(primaryKeyOrObject, JSON.stringify(valueToSet));
      }
      return valueToSet;
    }
    // Handle setting a value at a nested path within an object
    else {
      let rootValue;
      try {
        const existingRoot = targetStorage.getItem(primaryKeyOrObject);
        if (existingRoot !== null) {
          rootValue = JSON.parse(existingRoot);
          if (typeof rootValue !== 'object' || rootValue === null) {
            // If existing value is not an object, overwrite it with an object
            rootValue = {};
          }
        } else {
          rootValue = {}; // Initialize if no existing root value
        }
      } catch (parseError) {
        rootValue = {}; // Fallback to empty object if parsing fails
      }
      dataToOperateOn = rootValue; // Reference for modification

      let currentPathNode = dataToOperateOn;
      // Traverse the path to the target nesting level
      for (let i = 2; i < argumentCount - 2; i++) {
        const pathSegment = inputArguments[i];
        if (typeof currentPathNode[pathSegment] !== 'object' || currentPathNode[pathSegment] === null) {
          currentPathNode[pathSegment] = {}; // Create object if it doesn't exist or is not an object
        }
        currentPathNode = currentPathNode[pathSegment];
      }
      // Set the final value at the specified path
      currentPathNode[inputArguments[argumentCount - 2]] = inputArguments[argumentCount - 1];
      targetStorage.setItem(primaryKeyOrObject, JSON.stringify(rootValue));
      return rootValue;
    }
  }

  // Core function to remove data from a storage mechanism
  function deleteStoredValue(storageIdentifier) {
    const inputArguments = arguments;
    const argumentCount = inputArguments.length;
    const targetStorage = window[storageIdentifier];
    const primaryKey = inputArguments[1];
    let rootObjectToModify;

    // Validate minimum arguments
    if (argumentCount < 2) {
      throw new Error('At least two arguments are required for data deletion.');
    }

    // Handle array of keys for bulk removal
    if (jQueryInstance.isArray(primaryKey)) {
      for (let i = 0; i < primaryKey.length; i++) {
        targetStorage.removeItem(primaryKey[i]);
      }
      return true;
    }
    // Handle single key removal
    else if (argumentCount === 2) {
      targetStorage.removeItem(primaryKey);
      return true;
    }
    // Handle nested path removal
    else {
      try {
        const existingRoot = targetStorage.getItem(primaryKey);
        if (existingRoot === null) {
          throw new ReferenceError(`Primary key '${primaryKey}' not found in storage.`);
        }
        rootObjectToModify = JSON.parse(existingRoot);
      } catch (parseError) {
        throw new ReferenceError(`Cannot parse data for '${primaryKey}' to remove nested path.`);
      }

      let currentPathNode = rootObjectToModify;
      let parentPathNode = null;
      let lastSegmentKey = null;

      // Traverse to the parent of the item to be deleted
      for (let i = 2; i < argumentCount - 1; i++) {
        const pathSegment = inputArguments[i];
        if (typeof currentPathNode !== 'object' || currentPathNode === null || !currentPathNode.hasOwnProperty(pathSegment)) {
          const pathSoFar = Array.prototype.slice.call(inputArguments, 1, i).join('.');
          throw new ReferenceError(`Path segment '${pathSoFar}' not defined in storage for deletion.`);
        }
        parentPathNode = currentPathNode; // Keep track of the parent
        currentPathNode = currentPathNode[pathSegment];
        lastSegmentKey = pathSegment;
      }

      const finalSegmentToDelete = inputArguments[argumentCount - 1];
      if (jQueryInstance.isArray(finalSegmentToDelete)) {
        for (let j = 0; j < finalSegmentToDelete.length; j++) {
          const subKeyToRemove = finalSegmentToDelete[j];
          if (currentPathNode && currentPathNode.hasOwnProperty(subKeyToRemove)) {
            delete currentPathNode[subKeyToRemove];
          }
        }
      } else {
        if (currentPathNode && currentPathNode.hasOwnProperty(finalSegmentToDelete)) {
          delete currentPathNode[finalSegmentToDelete];
        }
      }
      targetStorage.setItem(primaryKey, JSON.stringify(rootObjectToModify));
      return true;
    }
  }

  // Function to clear all items from a specified storage or a namespace
  function purgeAllStorageItems(storageId, reinitializeNamespaces) {
    // Retrieve all keys for the given storage
    const allKeys = retrieveKeys(storageId);

    // Iterate and remove each item
    for (let i = 0; i < allKeys.length; i++) {
      deleteStoredValue(storageId, allKeys[i]);
    }

    // If reinitialization is requested, re-create all known namespaces
    if (reinitializeNamespaces) {
      for (const ns in jQueryInstance.registeredNamespaces) {
        if (jQueryInstance.registeredNamespaces.hasOwnProperty(ns)) {
          establishNamespace(ns);
        }
      }
    }
    return true;
  }

  // Function to check if storage items are considered "empty"
  function checkIfEmpty(storageId) {
    const inputArguments = arguments;
    const argumentCount = inputArguments.length;
    const itemKey = inputArguments[1];

    // If only storageId is provided, check if the entire storage is empty
    if (argumentCount === 1) {
      return (retrieveKeys(storageId).length === 0);
    }
    // If an array of keys is provided, check if all items in the array are empty
    else if (jQueryInstance.isArray(itemKey)) {
      for (let i = 0; i < itemKey.length; i++) {
        if (!checkIfEmpty(storageId, itemKey[i])) {
          return false; // If any item is not empty, return false
        }
      }
      return true; // All items in the array are empty
    }
    // For other cases (single key or nested path), retrieve value and check its emptiness
    else {
      try {
        const retrievedValue = retrieveStoredValue.apply(this, inputArguments);
        let valuesToCheck = {};

        // If the last argument was an array, retrieveStoredValue already returns an object
        if (!jQueryInstance.isArray(inputArguments[argumentCount - 1])) {
          valuesToCheck = { 'singleValue': retrievedValue };
        } else {
          valuesToCheck = retrievedValue;
        }

        // Check each retrieved value for emptiness criteria
        for (const keyInResult in valuesToCheck) {
          if (valuesToCheck.hasOwnProperty(keyInResult)) {
            const currentItem = valuesToCheck[keyInResult];
            // An item is considered "not empty" if it's a non-empty object, non-empty array, or a truthy value
            if (
                (jQueryInstance.isPlainObject(currentItem) && !jQueryInstance.isEmptyObject(currentItem)) ||
                (jQueryInstance.isArray(currentItem) && currentItem.length > 0) ||
                (currentItem !== null && typeof currentItem !== 'undefined' && currentItem !== false && currentItem !== 0 && currentItem !== '')
            ) {
              return false; // Found a non-empty item
            }
          }
        }
        return true; // All checked items are empty
      } catch (error) {
        // If retrieval fails (e.g., key not found), it's considered "empty" in this context
        return true;
      }
    }
  }

  // Function to check if storage items exist and are not null/undefined
  function checkIfPresent(storageId) {
    const inputArguments = arguments;
    const argumentCount = inputArguments.length;
    const itemKey = inputArguments[1];

    // Validate minimum arguments
    if (argumentCount < 2) {
      throw new Error('At least two arguments are required to check for existence.');
    }

    // Handle array of keys for bulk existence check
    if (jQueryInstance.isArray(itemKey)) {
      for (let i = 0; i < itemKey.length; i++) {
        if (!checkIfPresent(storageId, itemKey[i])) {
          return false; // If any item is not present, return false
        }
      }
      return true; // All items in the array are present
    }
    // For other cases (single key or nested path), retrieve value and check its existence
    else {
      try {
        const retrievedValue = retrieveStoredValue.apply(this, inputArguments);
        let valuesToCheck = {};

        // If the last argument was an array, retrieveStoredValue already returns an object
        if (!jQueryInstance.isArray(inputArguments[argumentCount - 1])) {
          valuesToCheck = { 'singleValue': retrievedValue };
        } else {
          valuesToCheck = retrievedValue;
        }

        // Check each retrieved value for existence criteria
        for (const keyInResult in valuesToCheck) {
          if (valuesToCheck.hasOwnProperty(keyInResult)) {
            const currentItem = valuesToCheck[keyInResult];
            // An item is considered "present" if it's not strictly undefined or null
            if (currentItem === undefined || currentItem === null) {
              return false; // Found a non-existent item
            }
          }
        }
        return true; // All checked items are present
      } catch (error) {
        // If retrieval fails (e.g., key not found), it's considered not present
        return false;
      }
    }
  }

  // Function to get all keys from a storage or a specific object within it
  function retrieveKeys(storageId) {
    const inputArguments = arguments;
    const argumentCount = inputArguments.length;
    const targetStorage = window[storageId];
    const collectedKeys = [];
    let dataToExtractKeysFrom = {};

    // If more than one argument, it implies getting keys from a nested object
    if (argumentCount > 1) {
      // Use retrieveStoredValue to get the target object
      dataToExtractKeysFrom = retrieveStoredValue.apply(this, inputArguments);
      // If the retrieved item is not an object, it has no keys
      if (typeof dataToExtractKeysFrom !== 'object' || dataToExtractKeysFrom === null) {
        return [];
      }
    } else {
      // Otherwise, get keys directly from the storage itself
      dataToExtractKeysFrom = targetStorage;
    }

    // Handle cookie storage specific key retrieval
    if (dataToExtractKeysFrom._isCookieEmulator) {
      // Iterate through all cookies and filter by prefix if applicable
      const allCookies = jQueryInstance.cookie();
      const currentPrefix = dataToExtractKeysFrom._keyPrefix;
      for (const cookieName in allCookies) {
        if (allCookies.hasOwnProperty(cookieName) && cookieName !== '') {
          if (!currentPrefix && cookieName.indexOf(localCookieKeyPrefix) === -1 && cookieName.indexOf(sessionCookieKeyPrefix) === -1) {
            collectedKeys.push(cookieName);
          } else if (currentPrefix && cookieName.indexOf(currentPrefix) === 0) {
            collectedKeys.push(cookieName.substring(currentPrefix.length));
          }
        }
      }
    } else {
      // For native storage, iterate through items
      // Note: Native storage objects like localStorage/sessionStorage don't directly expose enumerable properties in a standard way
      // We need to iterate using length and key() method
      if (targetStorage && typeof targetStorage.length === 'number') {
        for (let i = 0; i < targetStorage.length; i++) {
          collectedKeys.push(targetStorage.key(i));
        }
      } else {
        // Fallback for objects that might not be native Storage, but are treated as such
        for (const key in dataToExtractKeysFrom) {
          if (dataToExtractKeysFrom.hasOwnProperty(key)) {
            collectedKeys.push(key);
          }
        }
      }
    }
    return collectedKeys;
  }

  // Function to create and initialize a new namespaced storage instance
  function establishNamespace(namespaceName) {
    // Ensure namespace name is a non-empty string
    if (!namespaceName || typeof namespaceName !== "string") {
      throw new Error('The first parameter for namespace creation must be a non-empty string.');
    }

    // Initialize namespace in native or cookie-emulated storages
    if (isNativeStorageSupported) {
      if (!window.localStorage.getItem(namespaceName)) window.localStorage.setItem(namespaceName, '{}');
      if (!window.sessionStorage.getItem(namespaceName)) window.sessionStorage.setItem(namespaceName, '{}');
    } else {
      if (!window.localCookieStorageEmulator.getItem(namespaceName)) window.localCookieStorageEmulator.setItem(namespaceName, '{}');
      if (!window.sessionCookieStorageEmulator.getItem(namespaceName)) window.sessionCookieStorageEmulator.setItem(namespaceName, '{}');
    }

    // Create the namespace storage objects
    const newNamespace = {
      localStorage: jQueryInstance.extend({}, jQueryInstance.localStorage, { _namespaceKey: namespaceName }),
      sessionStorage: jQueryInstance.extend({}, jQueryInstance.sessionStorage, { _namespaceKey: namespaceName })
    };

    // If jQuery.cookie plugin is available, also create a cookie-based namespace
    if (jQueryInstance.cookie) {
      if (!window.cookieStorageEmulator.getItem(namespaceName)) window.cookieStorageEmulator.setItem(namespaceName, '{}');
      newNamespace.cookieStorage = jQueryInstance.extend({}, jQueryInstance.cookieStorage, { _namespaceKey: namespaceName });
    }

    // Register the new namespace globally
    jQueryInstance.registeredNamespaces[namespaceName] = newNamespace;
    return newNamespace;
  }

  // Utility function to check if a browser's native storage is functional
  function verifyStorageCapability(storageTypeName) {
    const testKey = 'js_api_test_item';
    try {
      // Check if the storage object exists
      if (!window[storageTypeName]) {
        return false;
      }
      // Attempt to set and remove an item to confirm functionality
      window[storageTypeName].setItem(testKey, testKey);
      window[storageTypeName].removeItem(testKey);
      return true;
    } catch (error) {
      // If any operation fails, storage is not available or not usable
      return false;
    }
  }

  // Determine if native localStorage is supported by the browser
  const isNativeStorageSupported = verifyStorageCapability('localStorage');

  // Define a base handler object for storage operations
  const baseStorageHandler = {
    _storageKind: '', // 'localStorage', 'sessionStorage', 'cookieStorageEmulator'
    _namespaceKey: '', // Optional namespace identifier

    // Internal method to prepare arguments and call the core functions
    invokeOperation: function(coreFunction, originalArguments) {
      const processedArgs = [this._storageKind]; // Start with the storage type
      const inputArgsArray = Array.prototype.slice.call(originalArguments);
      const firstInputArg = inputArgsArray[0];

      // If a namespace is defined, prepend it to the argument list for core functions
      if (this._namespaceKey) {
        processedArgs.push(this._namespaceKey);
      }

      // If the first argument is a string containing a dot, it's a nested path
      if (typeof firstInputArg === 'string' && firstInputArg.indexOf('.') !== -1) {
        inputArgsArray.shift(); // Remove the original first argument
        // Split the path and prepend its segments to the arguments
        Array.prototype.unshift.apply(inputArgsArray, firstInputArg.split('.'));
      }

      // Append all processed arguments to the list for the core function call
      Array.prototype.push.apply(processedArgs, inputArgsArray);

      // Execute the core storage function with the prepared arguments
      return coreFunction.apply(this, processedArgs);
    },

    // Public API: Retrieve items from storage
    get: function() {
      // If no arguments and a namespace is active, attempt to retrieve the entire namespace object
      if (arguments.length === 0 && this._namespaceKey) {
        return this.invokeOperation(retrieveStoredValue, [this._namespaceKey]);
      }
      return this.invokeOperation(retrieveStoredValue, arguments);
    },

    // Public API: Set items in storage
    set: function() {
      const currentArguments = arguments;
      const currentArgCount = currentArguments.length;
      const firstArgument = currentArguments[0];

      // Validate minimum arguments for setting
      if (currentArgCount < 1 || (!jQueryInstance.isPlainObject(firstArgument) && currentArgCount < 2)) {
        throw new Error('Invalid arguments: Must provide an object or a key-value pair.');
      }

      // If the first argument is an object and a namespace is active, handle each property individually
      if (jQueryInstance.isPlainObject(firstArgument) && this._namespaceKey) {
        for (const keyProp in firstArgument) {
          if (firstArgument.hasOwnProperty(keyProp)) {
            assignStoredValue(this._storageKind, this._namespaceKey, keyProp, firstArgument[keyProp]);
          }
        }
        return firstArgument;
      } else {
        // Otherwise, delegate to the internal operation invoker
        const operationResult = this.invokeOperation(assignStoredValue, currentArguments);
        // If operating within a namespace, return the relevant part of the result
        if (this._namespaceKey && typeof firstArgument === 'string' && firstArgument.indexOf('.') === -1) {
          return operationResult[firstArgument];
        }
        return operationResult;
      }
    },

    // Public API: Remove items from storage
    remove: function() {
      if (arguments.length < 1) {
        throw new Error('At least one argument (key or array of keys) is required for removal.');
      }
      return this.invokeOperation(deleteStoredValue, arguments);
    },

    // Public API: Remove all items from this storage or namespace
    removeAll: function(shouldReinitializeNamespaces) {
      if (this._namespaceKey) {
        // For a namespace, clear its content by setting it to an empty object
        assignStoredValue(this._storageKind, this._namespaceKey, {});
        return true;
      } else {
        // For a top-level storage, purge all items
        return purgeAllStorageItems(this._storageKind, shouldReinitializeNamespaces);
      }
    },

    // Public API: Check if items are empty
    isEmpty: function() {
      return this.invokeOperation(checkIfEmpty, arguments);
    },

    // Public API: Check if items exist
    isSet: function() {
      if (arguments.length < 1) {
        throw new Error('At least one argument (key or array of keys) is required to check for existence.');
      }
      return this.invokeOperation(checkIfPresent, arguments);
    },

    // Public API: Get keys of items
    keys: function() {
      return this.invokeOperation(retrieveKeys, arguments);
    }
  };

  // Integrate with jQuery.cookie plugin if available for fallback and cookieStorage
  if (jQueryInstance.cookie) {
    // Ensure window.name is set for session cookie emulation
    if (!window.name) {
      window.name = 'js_session_' + Math.floor(Math.random() * 100000000);
    }

    // Define a cookie-based storage emulator
    var cookieStoreEmulator = {
      _isCookieEmulator: true, // Marker for cookie-based storage
      _keyPrefix: '',          // Prefix for cookie keys
      _expiration: null,       // Cookie expiration (days or Date object)
      _path: null,             // Cookie path
      _domain: null,           // Cookie domain

      // Emulates setItem for cookies
      setItem: function(keyName, value) {
        jQueryInstance.cookie(this._keyPrefix + keyName, value, {
          expires: this._expiration,
          path: this._path,
          domain: this._domain
        });
      },
      // Emulates getItem for cookies
      getItem: function(keyName) {
        return jQueryInstance.cookie(this._keyPrefix + keyName);
      },
      // Emulates removeItem for cookies
      removeItem: function(keyName) {
        jQueryInstance.removeCookie(this._keyPrefix + keyName, {
          path: this._path,
          domain: this._domain
        });
      },
      // Clears all cookies associated with this emulator's prefix
      clear: function() {
        const allCookies = jQueryInstance.cookie();
        for (const cookieKey in allCookies) {
          if (allCookies.hasOwnProperty(cookieKey) && cookieKey !== '') {
            // Check if the cookie key matches the current emulator's prefix
            // or if it matches the global local/session prefixes if this is the generic cookieStorageEmulator
            const hasCorrectPrefix = (
              (!this._keyPrefix && cookieKey.indexOf(localCookieKeyPrefix) === -1 && cookieKey.indexOf(sessionCookieKeyPrefix) === -1) ||
              (this._keyPrefix && cookieKey.indexOf(this._keyPrefix) === 0)
            );
            if (hasCorrectPrefix) {
              jQueryInstance.removeCookie(cookieKey, { path: this._path, domain: this._domain });
            }
          }
        }
      },
      // Chainable methods for configuring cookie options
      setExpires: function(expiryValue) {
        this._expiration = expiryValue;
        return this;
      },
      setPath: function(pathValue) {
        this._path = pathValue;
        return this;
      },
      setDomain: function(domainValue) {
        this._domain = domainValue;
        return this;
      },
      // Set multiple configuration options at once
      setConfiguration: function(configObject) {
        if (configObject.path) this._path = configObject.path;
        if (configObject.domain) this._domain = configObject.domain;
        if (configObject.expires) this._expiration = configObject.expires;
        return this;
      },
      // Reset all configuration options to default null values
      resetDefaultConfiguration: function() {
        this._path = this._domain = this._expiration = null;
        return this;
      }
    };

    // If native storage is not available, use cookie emulators as fallbacks
    if (!isNativeStorageSupported) {
      window.localCookieStorageEmulator = jQueryInstance.extend({}, cookieStoreEmulator, {
        _keyPrefix: localCookieKeyPrefix,
        _expiration: 365 * 10 // Local storage equivalent: expires in 10 years
      });
      window.sessionCookieStorageEmulator = jQueryInstance.extend({}, cookieStoreEmulator, {
        _keyPrefix: sessionCookieKeyPrefix + window.name + '_', // Session storage equivalent: tied to window.name
        _expiration: null // Session cookies expire when browser closes
      });
    }
    // Always provide a generic cookieStorageEmulator
    window.cookieStorageEmulator = jQueryInstance.extend({}, cookieStoreEmulator);

    // Expose cookieStorage API through jQuery
    jQueryInstance.cookieStorage = jQueryInstance.extend({}, baseStorageHandler, {
      _storageKind: 'cookieStorageEmulator',
      // Override configuration methods to operate on the global cookieStoreEmulator instance
      setExpires: function(e) { window.cookieStorageEmulator.setExpires(e); return this; },
      setPath: function(p) { window.cookieStorageEmulator.setPath(p); return this; },
      setDomain: function(d) { window.cookieStorageEmulator.setDomain(d); return this; },
      setConfiguration: function(c) { window.cookieStorageEmulator.setConfiguration(c); return this; },
      resetDefaultConfiguration: function() { window.cookieStorageEmulator.resetDefaultConfiguration(); return this; }
    });
  }

  // Extend jQuery with a method to initialize namespaced storage
  jQueryInstance.initStorageNamespace = function(namespaceIdentifier) {
    return establishNamespace(namespaceIdentifier);
  };

  // Expose localStorage and sessionStorage APIs through jQuery
  if (isNativeStorageSupported) {
    jQueryInstance.localStorage = jQueryInstance.extend({}, baseStorageHandler, { _storageKind: 'localStorage' });
    jQueryInstance.sessionStorage = jQueryInstance.extend({}, baseStorageHandler, { _storageKind: 'sessionStorage' });
  } else {
    // Fallback to cookie emulators if native storage is not available
    jQueryInstance.localStorage = jQueryInstance.extend({}, baseStorageHandler, { _storageKind: 'localCookieStorageEmulator' });
    jQueryInstance.sessionStorage = jQueryInstance.extend({}, baseStorageHandler, { _storageKind: 'sessionCookieStorageEmulator' });
  }

  // Object to hold all registered namespace storage instances
  jQueryInstance.registeredNamespaces = {};

  // Method to clear all types of storage
  jQueryInstance.clearAllStorageData = function(shouldReinitializeNamespaces) {
    jQueryInstance.localStorage.removeAll(shouldReinitializeNamespaces);
    jQueryInstance.sessionStorage.removeAll(shouldReinitializeNamespaces);
    if (jQueryInstance.cookieStorage) {
      jQueryInstance.cookieStorage.removeAll(shouldReinitializeNamespaces);
    }

    // If namespaces are not to be reinitialized, clear the registeredNamespaces object
    if (!shouldReinitializeNamespaces) {
      jQueryInstance.registeredNamespaces = {};
    }
  };
}));