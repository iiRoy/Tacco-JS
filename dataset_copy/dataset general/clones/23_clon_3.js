/*
*   PermaStore.js v1.1 - A persistent local data management utility
*   (c) 2024 Reimagined by AI Assistant
*   contact@example.com (placeholder)
*/

(function(globalScope){

  // Guard against environments where localStorage isn't available.
  // This check is performed once at script load time.
  const isLocalStorageAvailable = (() => {
    try {
      const testKey = '__ps_test__';
      globalScope.localStorage.setItem(testKey, testKey);
      globalScope.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.warn("PermaStore: localStorage is not available. Data will not persist.");
      return false;
    }
  })();

  // Main constructor function for the PermaStore library.
  // It can act as both a namespace for static methods and a constructor for instances.
  var PermaStore = function(instanceConfig) {
    // If an existing PermaStore instance is passed, return it directly.
    if (instanceConfig instanceof PermaStore) {
      return instanceConfig;
    }
    // Enforce 'new' keyword usage for instance creation.
    if (!(this instanceof PermaStore)) {
      return new PermaStore(instanceConfig);
    }
    // Initialize instance-specific properties.
    this._creationTimestamp = Date.now();
    this._instanceConfig = instanceConfig || {};
    console.log(`PermaStore instance created at ${new Date(this._creationTimestamp).toISOString()}`);
  };

  // --- Module export strategy ---
  // This section ensures PermaStore is correctly exposed in different JavaScript environments (e.g., Node.js, browser).
  if (typeof exports !== 'undefined' && isLocalStorageAvailable) {
    if (typeof module !== 'undefined' && module.exports) {
      // CommonJS (Node.js) export.
      module.exports = PermaStore;
    }
    // Also attach to exports for broader compatibility (e.g., when `exports` is used directly).
    exports.PermaStore = PermaStore;
  } else if (isLocalStorageAvailable) {
    // Browser global export.
    globalScope.PermaStore = PermaStore;
    console.info("PermaStore loaded into global scope.");
  } else {
    // If localStorage is unavailable, provide a non-persistent, warning-laden stub.
    globalScope.PermaStore = function() {
      console.error("PermaStore: localStorage is not available, operations will not persist.");
      return {
        // Dummy properties and methods for basic API compatibility.
        registeredStores: [],
        VERSION_ID: '1.1-no-persistence',
        retrieveFromStorage: () => null,
        saveToStorage: () => {},
        removeStorageItem: () => {},
        purgeData: () => console.warn("PermaStore no-op: localStorage unavailable."),
        listStoreNames: () => [],
        DataEntry: function() { console.warn("PermaStore no-op: localStorage unavailable."); },
        RecordStore: function() { console.warn("PermaStore no-op: localStorage unavailable."); },
      };
    };
    console.warn("PermaStore: Running in non-persistent mode due to localStorage unavailability.");
  }

  // --- Internal Storage Management & Initialization ---
  PermaStore.storageKey = 'PermaStoreRegistry'; // The key used in localStorage to track all store names.

  // Helper function to safely parse JSON strings from localStorage.
  const parseJsonSafely = (jsonString, defaultValue = []) => {
    if (!jsonString) return defaultValue;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      console.error("PermaStore: Error parsing JSON from localStorage:", e);
      return defaultValue;
    }
  };

  // Helper to retrieve a string item from localStorage.
  const retrieveFromStorage = (key) => {
    if (!isLocalStorageAvailable) return null;
    return globalScope.localStorage.getItem(key);
  };

  // Helper to save data (JSON-stringified) to localStorage.
  const saveToStorage = (key, data) => {
    if (!isLocalStorageAvailable) return;
    try {
      globalScope.localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`PermaStore: Error saving data for key '${key}' to localStorage:`, e);
      if (e.name === 'QuotaExceededError') {
        console.error("PermaStore: LocalStorage quota exceeded!");
      }
    }
  };

  // Helper to remove an item from localStorage.
  const removeStorageItem = (key) => {
    if (!isLocalStorageAvailable) return;
    globalScope.localStorage.removeItem(key);
  };

  // Initialize the list of all registered data stores.
  // This list persists across sessions and is loaded on script initialization.
  var storedRegistry = retrieveFromStorage(PermaStore.storageKey);
  if (!storedRegistry) {
    PermaStore.registeredStores = [];
    saveToStorage(PermaStore.storageKey, PermaStore.registeredStores);
    console.log("PermaStore: Initialized new registry for data stores.");
  } else {
    PermaStore.registeredStores = parseJsonSafely(storedRegistry);
    console.log(`PermaStore: Loaded ${PermaStore.registeredStores.length} registered stores.`);
  }

  PermaStore.VERSION_ID = '1.1'; // Current version identifier for the library.

  // --- Core Utilities Section ---
  // These internal helpers provide fundamental functionalities for data manipulation and iteration.

  // A special object used as a signal to break out of PermaStore's custom iteration loops.
  var stopIterationFlag = {};

  // Cache references to native prototype methods for performance and robustness against modifications.
  var arrayPrototypeRef = Array.prototype,
      objectPrototypeRef = Object.prototype;

  var arrayPush = arrayPrototypeRef.push,
      arraySlice = arrayPrototypeRef.slice,
      objectToString = objectPrototypeRef.toString,
      objectHasOwnProperty = objectPrototypeRef.hasOwnProperty;

  var nativeForEachMethod = arrayPrototypeRef.forEach,
      nativeMapMethod = arrayPrototypeRef.map,
      nativeSomeMethod = arrayPrototypeRef.some,
      nativeFilterMethod = arrayPrototypeRef.filter,
      nativeIndexOfMethod = arrayPrototypeRef.indexOf,
      nativeIsArrayMethod = Array.isArray,
      nativeObjectKeysMethod = Object.keys;

  // Resolves an iterator argument (which can be a string property name or a function) into a function.
  var resolveIterator = function(iterator) {
    if (typeof iterator === 'string') {
      const propName = iterator;
      return function(item) { return item[propName]; };
    }
    return iterator || PermaStore.returnSelf; // Default to identity function if no iterator is provided.
  };

  // Iterates over a given collection (array or object), applying a callback to each element.
  PermaStore.applyToEach = PermaStore.forEachElement = function(collection, callbackFn, contextScope) {
    if (collection == null) return; // Gracefully handle null or undefined collections.

    // Prefer native `forEach` for arrays if available.
    if (nativeForEachMethod && collection.forEach === nativeForEachMethod) {
      try {
        collection.forEach(callbackFn, contextScope);
      } catch (e) {
        if (e === stopIterationFlag) return; // Catch our custom breaker.
        throw e; // Re-throw other unexpected errors.
      }
    } else if (typeof collection.length === 'number' && collection.length >= 0 && collection.length === Math.floor(collection.length)) {
      // Iterate over array-like objects (e.g., `arguments` object, DOM NodeList).
      for (var k = 0, len = collection.length; k < len; k++) {
        if (callbackFn.call(contextScope, collection[k], k, collection) === stopIterationFlag) {
          return;
        }
      }
    } else {
      // Iterate over plain objects (enumerating own properties).
      for (var propKey in collection) {
        if (PermaStore.ownsProperty(collection, propKey)) {
          if (callbackFn.call(contextScope, collection[propKey], propKey, collection) === stopIterationFlag) {
            return;
          }
        }
      }
    }
  };

  // Generates a random hexadecimal segment, typically used for creating unique IDs.
  PermaStore.generateHexSegment = function() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  };

  // Generates a unique identifier string, incorporating a timestamp for better uniqueness.
  PermaStore.createUniqueId = function() {
    const timestampPart = Date.now().toString(16); // Hexadecimal timestamp.
    return `ps-${PermaStore.generateHexSegment()}${PermaStore.generateHexSegment()}-${timestampPart}-${PermaStore.generateHexSegment()}`;
  };

  // Finds the index of a specific element within an array.
  PermaStore.findIndexOfElement = function(targetArray, elementToFind, isArraySorted) {
    if (targetArray == null) return -1;
    let startingIndex = 0, arrayLength = targetArray.length;

    // Optimization for sorted arrays: use binary search to narrow down the search range.
    if (isArraySorted) {
      if (typeof isArraySorted === 'number') { // If a numeric index is provided.
        startingIndex = (isArraySorted < 0 ? Math.max(0, arrayLength + isArraySorted) : isArraySorted);
      } else { // If 'true' is passed, indicating the array is sorted.
        const potentialIndex = PermaStore.determineSortedInsertIndex(targetArray, elementToFind);
        return (potentialIndex < arrayLength && targetArray[potentialIndex] === elementToFind) ? potentialIndex : -1;
      }
    }

    // Prefer native `indexOf` for performance.
    if (nativeIndexOfMethod && targetArray.indexOf === nativeIndexOfMethod) {
      return targetArray.indexOf(elementToFind, startingIndex);
    }

    // Fallback to manual iteration if native method is not available or suitable.
    for (let j = startingIndex; j < arrayLength; j++) {
      if (targetArray[j] === elementToFind) return j;
    }
    return -1;
  };

  // A simple identity function that returns whatever value is passed to it.
  PermaStore.returnSelf = function(value) {
    return value;
  };

  // Determines the correct insertion point for an element in a sorted array to maintain its order.
  PermaStore.determineSortedInsertIndex = function(sortedArray, valueToInsert, valueExtractor, contextScope) {
    const resolvedExtractor = resolveIterator(valueExtractor);
    const targetValue = resolvedExtractor.call(contextScope, valueToInsert);
    let lowBound = 0, highBound = sortedArray.length;

    // Binary search algorithm.
    while (lowBound < highBound) {
      const midPoint = Math.floor((lowBound + highBound) / 2);
      if (resolvedExtractor.call(contextScope, sortedArray[midPoint]) < targetValue) {
        lowBound = midPoint + 1;
      } else {
        highBound = midPoint;
      }
    }
    return lowBound;
  };

  // Checks if at least one element in a collection satisfies a given predicate function.
  PermaStore.somePredicate = PermaStore.checkAnyMatch = function(collection, predicateFn, contextScope) {
    const resolvedPredicate = resolveIterator(predicateFn);
    let foundMatch = false;
    if (collection == null) return foundMatch;

    // Prefer native `some` method.
    if (nativeSomeMethod && collection.some === nativeSomeMethod) {
      return collection.some(resolvedPredicate, contextScope);
    }

    // Fallback to custom iteration.
    PermaStore.applyToEach(collection, function(itemValue, itemIndex, fullList) {
      if (resolvedPredicate.call(contextScope, itemValue, itemIndex, fullList)) {
        foundMatch = true;
        return stopIterationFlag; // Signal to break the iteration.
      }
    });
    return !!foundMatch; // Ensure a boolean return value.
  };

  // Filters a collection, returning a new array containing only elements that satisfy a predicate.
  PermaStore.selectMatchingElements = PermaStore.filterCollection = function(collection, predicateFn, contextScope) {
    const filteredResults = [];
    if (collection == null) return filteredResults;
    const resolvedPredicate = resolveIterator(predicateFn);

    // Prefer native `filter` method.
    if (nativeFilterMethod && collection.filter === nativeFilterMethod) {
      return collection.filter(resolvedPredicate, contextScope);
    }

    // Fallback to custom iteration.
    PermaStore.applyToEach(collection, function(itemValue, itemIndex, fullList) {
      if (resolvedPredicate.call(contextScope, itemValue, itemIndex, fullList)) {
        arrayPush.call(filteredResults, itemValue); // Efficient array push.
      }
    });
    return filteredResults;
  };

  // Finds all elements in a collection that match a given set of properties.
  PermaStore.filterByProperties = function(collection, propertiesToMatch, returnFirstOnly) {
    if (PermaStore.isCollectionEmpty(propertiesToMatch)) return returnFirstOnly ? null : [];
    
    // Choose the appropriate search method based on `returnFirstOnly` flag.
    const searchMethod = returnFirstOnly ? PermaStore.locateFirstMatch : PermaStore.selectMatchingElements;

    return searchMethod(collection, function(item) {
      // Check if every property in `propertiesToMatch` has a matching value in `item`.
      for (let prop in propertiesToMatch) {
        if (PermaStore.ownsProperty(propertiesToMatch, prop)) {
          if (item[prop] !== propertiesToMatch[prop]) {
            return false; // Mismatch found, this item does not satisfy criteria.
          }
        }
      }
      return true; // All properties matched.
    });
  };

  // Locates the first element in a collection that satisfies a predicate function.
  PermaStore.locateFirstMatch = PermaStore.detectFirst = function(collection, predicateFn, contextScope) {
    let firstFoundElement;
    const resolvedPredicate = resolveIterator(predicateFn);

    // Reuse `somePredicate` to efficiently find and break on the first match.
    PermaStore.somePredicate(collection, function(itemValue, itemIndex, fullList) {
      if (resolvedPredicate.call(contextScope, itemValue, itemIndex, fullList)) {
        firstFoundElement = itemValue;
        return true; // Signal `somePredicate` to break.
      }
    });
    return firstFoundElement;
  };

  // Checks if an object has a specific property as its own property (not inherited).
  PermaStore.ownsProperty = function(targetObject, propertyKey) {
    return objectHasOwnProperty.call(targetObject, propertyKey);
  };

  // Merges properties from one or more source objects into a target object.
  PermaStore.mergeObjects = function(targetObject) {
    if (targetObject === null || typeof targetObject !== 'object') {
      console.warn("PermaStore.mergeObjects: Target object is null or not an object. Returning target unchanged.");
      return targetObject;
    }
    const sources = arraySlice.call(arguments, 1); // Get all source objects from arguments.
    PermaStore.applyToEach(sources, function(sourceObj) {
      if (sourceObj && typeof sourceObj === 'object') {
        for (let key in sourceObj) {
          if (PermaStore.ownsProperty(sourceObj, key)) { // Only copy own properties from source.
            targetObject[key] = sourceObj[key];
          }
        }
      }
    });
    return targetObject;
  };

  // Transforms each element in a collection using an iterator function, returning a new array of transformed elements.
  PermaStore.transformElements = PermaStore.mapCollection = function(collection, iteratorFn, contextScope) {
    const transformedResults = [];
    if (collection == null) return transformedResults;
    const resolvedIterator = resolveIterator(iteratorFn);

    // Prefer native `map` method.
    if (nativeMapMethod && collection.map === nativeMapMethod) {
      return collection.map(resolvedIterator, contextScope);
    }

    // Fallback to custom iteration.
    PermaStore.applyToEach(collection, function(itemValue, itemIndex, fullList) {
      arrayPush.call(transformedResults, resolvedIterator.call(contextScope, itemValue, itemIndex, fullList));
    });
    return transformedResults;
  };

  // Returns the number of elements in a collection (array-like length or object key count).
  PermaStore.countElements = function(collection) {
    if (collection == null) return 0;
    // For array-like objects, return their length.
    if (typeof collection.length === 'number' && collection.length >= 0) {
      return collection.length;
    }
    // For plain objects, return the count of their own enumerable keys.
    return PermaStore.retrieveObjectKeys(collection).length;
  };

  // Retrieves all enumerable own property names of an object.
  PermaStore.retrieveObjectKeys = nativeObjectKeysMethod || function(targetObject) {
    if (typeof targetObject !== 'object' || targetObject === null) {
      throw new TypeError('PermaStore.retrieveObjectKeys: Invalid object provided');
    }
    const propertyKeys = [];
    for (let key in targetObject) {
      if (PermaStore.ownsProperty(targetObject, key)) {
        arrayPush.call(propertyKeys, key);
      }
    }
    return propertyKeys;
  };

  // Finds the maximum value in a collection, optionally using an extractor function.
  PermaStore.findMaximumValue = function(collection, valueExtractor, contextScope) {
    if (!valueExtractor && PermaStore.isAnArray(collection) && collection.length > 0 && typeof collection[0] === 'number') {
      // Optimized path for pure numeric arrays without an extractor.
      try {
        return Math.max.apply(Math, collection);
      } catch (e) {
        console.warn("PermaStore.findMaximumValue: Math.max.apply failed (e.g., array too large), falling back to iteration.", e);
      }
    }
    if (PermaStore.isCollectionEmpty(collection)) return -Infinity; // Handle empty collections.

    const resolvedExtractor = resolveIterator(valueExtractor);
    let maxResult = { computedValue: -Infinity, originalValue: undefined };

    PermaStore.applyToEach(collection, function(item, index, list) {
      const currentComputed = resolvedExtractor.call(contextScope, item, index, list);
      if (currentComputed > maxResult.computedValue) { // Use `>` to return the last max if multiple exist.
        maxResult = { originalValue: item, computedValue: currentComputed };
      }
    });
    return maxResult.originalValue; // Return the original item that yielded the maximum computed value.
  };

  // Checks if a collection (array, string, or object) is empty.
  PermaStore.isCollectionEmpty = function(collection) {
    if (collection == null) return true;
    if (PermaStore.isAnArray(collection) || PermaStore.isAString(collection)) {
      return collection.length === 0;
    }
    // For objects, check if it has any own enumerable properties.
    for (let prop in collection) {
      if (PermaStore.ownsProperty(collection, prop)) return false;
    }
    return true;
  };

  // Checks if an object is an array using `Array.isArray` or a reliable fallback.
  PermaStore.isAnArray = nativeIsArrayMethod || function(testObject) {
    return objectToString.call(testObject) === '[object Array]';
  };

  // Checks if an object is a string.
  PermaStore.isAString = function (testObject) {
    return objectToString.call(testObject) === '[object String]';
  };

  // --- Database Management Operations ---

  // Resets or purges all data managed by PermaStore across all registered stores.
  PermaStore.purgeData = PermaStore.eraseAll = function(){
    if (!isLocalStorageAvailable) {
      console.warn("PermaStore.purgeData: localStorage not available, no action taken.");
      return;
    }
    // Retrieve the current list of all registered store names.
    const currentRegistry = parseJsonSafely(retrieveFromStorage(PermaStore.storageKey));

    if (currentRegistry && PermaStore.isAnArray(currentRegistry)) {
      PermaStore.applyToEach(currentRegistry, function(storeName) {
        removeStorageItem(`PermaStore_${storeName}`); // Remove data for each individual store.
        console.log(`PermaStore: Removed data for store: ${storeName}`);
      });
      // Clear the main registry itself.
      saveToStorage(PermaStore.storageKey, []);
      PermaStore.registeredStores = []; // Update the in-memory registry.
      console.log("PermaStore: All data stores have been purged and registry cleared.");
    } else {
      console.log("PermaStore: No data stores found in registry to purge.");
    }
  };

  // Returns the names of all currently registered data stores.
  PermaStore.listStoreNames = function(){
    return PermaStore.registeredStores;
  };

  // --- Document (Record) Definition ---
  // Represents a single data entry or "document" within a RecordStore.
  var DataEntry = PermaStore.DataEntry = function (parentStoreName, initialData) {
    const currentEntry = this;
    currentEntry._parentStore = parentStoreName; // Internal reference to the parent store's name.
    currentEntry.recordId = initialData?.recordId || initialData?._id || PermaStore.createUniqueId(); // Prioritize existing ID, then generate new.
    currentEntry._createdAt = initialData?._createdAt || Date.now(); // Record creation timestamp.
    currentEntry._lastModified = Date.now(); // Record last modification timestamp.

    // Merge provided fields into this new data entry instance.
    PermaStore.mergeObjects(currentEntry, initialData);

    // Standardize internal ID and collection name properties.
    delete currentEntry._id; // Ensure only `recordId` is used.
    delete currentEntry.__collection; // Ensure only `_parentStore` is used.
  };

  // Saves the current DataEntry instance to its associated RecordStore.
  DataEntry.prototype.save = function () {
    const currentEntry = this;
    const storeIdentifier = currentEntry._parentStore;
    if (!storeIdentifier) {
      console.error("DataEntry.save: Cannot save, parent store name is undefined.");
      return;
    }

    let currentStoreContents = parseJsonSafely(retrieveFromStorage(`PermaStore_${storeIdentifier}`));
    if (!PermaStore.isAnArray(currentStoreContents)) {
        currentStoreContents = []; // Ensure it's an array, even if initial parsing failed.
    }

    let isUpdateOperation = false;
    // Attempt to find and update an existing record by its ID.
    PermaStore.applyToEach(currentStoreContents, function(existingRecord) {
      if (existingRecord.recordId === currentEntry.recordId) {
        PermaStore.mergeObjects(existingRecord, currentEntry); // Update properties of the existing record.
        existingRecord._lastModified = Date.now(); // Update modification timestamp.
        isUpdateOperation = true;
        return stopIterationFlag; // Break the loop once the record is updated.
      }
    });

    if (!isUpdateOperation) {
      // If no existing record was found, add this as a new record.
      currentEntry._createdAt = currentEntry._createdAt || Date.now(); // Ensure creation timestamp is set.
      currentEntry._lastModified = Date.now();
      arrayPush.call(currentStoreContents, currentEntry);
      console.log(`DataEntry: New record (ID: ${currentEntry.recordId}) added to store '${storeIdentifier}'.`);
    } else {
      console.log(`DataEntry: Record (ID: ${currentEntry.recordId}) updated in store '${storeIdentifier}'.`);
    }

    saveToStorage(`PermaStore_${storeIdentifier}`, currentStoreContents); // Persist changes to localStorage.

    // Execute any provided callback functions in the arguments list.
    PermaStore.applyToEach(arguments, function(argFunction) {
      if (typeof argFunction === 'function') {
        argFunction.call(currentEntry); // Call callback with the DataEntry instance as `this`.
      }
    });
  };

  // Deletes the current DataEntry instance from its parent RecordStore.
  DataEntry.prototype.delete = function () {
    const currentEntry = this;
    const storeIdentifier = currentEntry._parentStore;
    if (!storeIdentifier) {
      console.error("DataEntry.delete: Cannot delete, parent store name is undefined.");
      return;
    }

    let currentStoreContents = parseJsonSafely(retrieveFromStorage(`PermaStore_${storeIdentifier}`));
    if (!PermaStore.isAnArray(currentStoreContents)) {
      console.warn(`DataEntry.delete: Store '${storeIdentifier}' is empty or invalid, nothing to delete.`);
      return;
    }

    // Filter out the record to be deleted based on its `recordId`.
    const remainingRecords = PermaStore.selectMatchingElements(currentStoreContents, function(item) {
      return item.recordId !== currentEntry.recordId;
    });

    if (remainingRecords.length < currentStoreContents.length) {
      saveToStorage(`PermaStore_${storeIdentifier}`, remainingRecords); // Persist the updated store contents.
      console.log(`DataEntry: Record (ID: ${currentEntry.recordId}) deleted from store '${storeIdentifier}'.`);
    } else {
      console.warn(`DataEntry: Record (ID: ${currentEntry.recordId}) not found in store '${storeIdentifier}', no deletion performed.`);
    }

    // Execute any provided callback functions.
    PermaStore.applyToEach(arguments, function(argFunction) {
      if (typeof argFunction === 'function') {
        argFunction.call(currentEntry);
      }
    });
  };

  // --- Collection (Store) Definition ---
  // Represents a collection of DataEntries, providing methods for managing them.
  var RecordStore = PermaStore.RecordStore = function (storeIdentifier) {
    const currentStore = this;
    if (typeof storeIdentifier !== 'string' || storeIdentifier.trim() === '') {
      throw new Error("RecordStore: A valid non-empty string identifier is required for a new store.");
    }
    currentStore.storeName = storeIdentifier.trim();

    // Load existing data for this specific store from localStorage.
    let retrievedStoreData = retrieveFromStorage(`PermaStore_${currentStore.storeName}`);
    currentStore.dataEntries = parseJsonSafely(retrievedStoreData);

    // If this store's name isn't already in the global registry, add it.
    const storeExistsInRegistry = PermaStore.somePredicate(PermaStore.registeredStores, function(registeredName) {
      return registeredName === currentStore.storeName;
    });

    if (!storeExistsInRegistry) {
      arrayPush.call(PermaStore.registeredStores, currentStore.storeName);
      saveToStorage(PermaStore.storageKey, PermaStore.registeredStores); // Update the global registry.
      console.log(`RecordStore: New store '${currentStore.storeName}' registered.`);
    } else {
      console.log(`RecordStore: Store '${currentStore.storeName}' already registered, loaded ${currentStore.dataEntries.length} entries.`);
    }
  };

  // Finds data entries within this RecordStore based on query criteria.
  RecordStore.prototype.find = function () {
    const currentStore = this;
    let queryCriteria = arguments[0];
    let callbackFn = null;
    let matchedRecords = [];

    // Ensure `dataEntries` property is fresh from storage before performing a query.
    currentStore.dataEntries = parseJsonSafely(retrieveFromStorage(`PermaStore_${currentStore.storeName}`));

    // Determine if the first argument is a callback or query criteria.
    if (typeof queryCriteria === 'function') {
        callbackFn = queryCriteria;
        queryCriteria = {}; // No criteria provided, so treat as empty object.
    } else if (typeof arguments[1] === 'function') {
        callbackFn = arguments[1];
    }

    // If query criteria is a non-empty object, filter entries by its properties.
    if (typeof queryCriteria === 'object' && queryCriteria !== null && !PermaStore.isCollectionEmpty(queryCriteria)) {
      const filteredRawItems = PermaStore.filterByProperties(currentStore.dataEntries, queryCriteria);
      if (filteredRawItems.length) {
        matchedRecords = PermaStore.transformElements(filteredRawItems, function(item) {
          return new PermaStore.DataEntry(currentStore.storeName, item); // Wrap raw data in DataEntry instances.
        });
      }
    } else {
      // If no specific criteria, return all entries wrapped as DataEntry instances.
      matchedRecords = PermaStore.transformElements(currentStore.dataEntries, function(item) {
        return new PermaStore.DataEntry(currentStore.storeName, item);
      });
    }

    if (callbackFn) {
        callbackFn.call(currentStore, matchedRecords); // Execute callback with results.
    } else {
        return matchedRecords; // If no callback, return results directly.
    }
  };

  // Saves new data entries or the current in-memory state of the store.
  RecordStore.prototype.save = function () {
    const currentStore = this;
    let dataToSave = arguments[0];
    let callbackFn = null;

    // Iterate arguments to find a callback function.
    PermaStore.applyToEach(arguments, function(arg) {
        if (typeof arg === 'function') {
            callbackFn = arg;
            // A Type III change: if the callback was the first argument, set dataToSave to undefined.
            if (arg === dataToSave) dataToSave = undefined;
            return stopIterationFlag;
        }
    });

    if (dataToSave === undefined) {
      // If no specific data is provided, assume we're saving the current in-memory state.
      saveToStorage(`PermaStore_${currentStore.storeName}`, currentStore.dataEntries);
      console.log(`RecordStore: In-memory state of '${currentStore.storeName}' saved to storage.`);
      if (callbackFn) callbackFn.call(currentStore, currentStore.dataEntries);
      return;
    }

    if (typeof dataToSave !== 'object' || dataToSave === null) {
      console.error("RecordStore.save: Data to save must be an object or array of objects.");
      if (callbackFn) callbackFn.call(currentStore, null, new Error("Invalid data format"));
      return;
    }

    const newEntries = [];
    // Helper function to process a single data entry.
    const processSingleEntry = function(entryData) {
      if (typeof entryData !== 'object' || entryData === null) {
        console.warn("RecordStore.save: Skipping invalid entry data:", entryData);
        return null;
      }
      entryData.recordId = entryData.recordId || entryData._id || PermaStore.createUniqueId(); // Ensure unique ID.
      entryData._createdAt = entryData._createdAt || Date.now();
      entryData._lastModified = Date.now();
      const newEntryInstance = new PermaStore.DataEntry(currentStore.storeName, entryData);
      arrayPush.call(currentStore.dataEntries, newEntryInstance); // Add to in-memory store.
      arrayPush.call(newEntries, newEntryInstance);
      return newEntryInstance;
    };

    if (PermaStore.isAnArray(dataToSave)) {
      PermaStore.applyToEach(dataToSave, processSingleEntry); // Process each item if an array.
    } else {
      processSingleEntry(dataToSave); // Process single item if an object.
    }

    saveToStorage(`PermaStore_${currentStore.storeName}`, currentStore.dataEntries); // Persist all changes.
    console.log(`RecordStore: ${newEntries.length} new entries saved to store '${currentStore.storeName}'.`);

    if (callbackFn) {
      callbackFn.call(currentStore, newEntries.length === 1 ? newEntries[0] : newEntries);
    }
  };

  // Updates existing data entries in the RecordStore based on criteria.
  RecordStore.prototype.update = function () {
    const currentStore = this;
    let queryCriteria = arguments[0];
    let updatePayload = arguments[1];
    let options = arguments[2];
    let callbackFn = null;

    // Parse arguments: queryCriteria, updatePayload, [options], [callback].
    for (let i = 2; i < arguments.length; i++) {
        if (typeof arguments[i] === 'function') {
            callbackFn = arguments[i];
        } else if (typeof arguments[i] === 'object' && arguments[i] !== null) {
            options = arguments[i];
        }
    }

    if (typeof queryCriteria !== 'object' || queryCriteria === null || PermaStore.isCollectionEmpty(queryCriteria)) {
        console.error("RecordStore.update: Missing or invalid query criteria for update operation.");
        if (callbackFn) callbackFn.call(currentStore, [], new Error("Invalid query criteria"));
        return;
    }
    if (typeof updatePayload !== 'object' || updatePayload === null || PermaStore.isCollectionEmpty(updatePayload)) {
        console.error("RecordStore.update: Missing or invalid update payload.");
        if (callbackFn) callbackFn.call(currentStore, [], new Error("Invalid update payload"));
        return;
    }

    const shouldUpsertIfNotFound = options && options.upsert === true;
    let updatedRecords = [];

    // Ensure data entries are fresh from storage before applying updates.
    currentStore.dataEntries = parseJsonSafely(retrieveFromStorage(`PermaStore_${currentStore.storeName}`));

    const targetRecords = PermaStore.filterByProperties(currentStore.dataEntries, queryCriteria);

    if (PermaStore.countElements(targetRecords) > 0) {
      PermaStore.applyToEach(currentStore.dataEntries, function(entry) {
        // Check if this entry matches the update criteria.
        let isMatch = true;
        for (let key in queryCriteria) {
          if (PermaStore.ownsProperty(queryCriteria, key) && entry[key] !== queryCriteria[key]) {
            isMatch = false;
            break;
          }
        }

        if (isMatch) {
          PermaStore.mergeObjects(entry, updatePayload); // Apply the update payload to the matching entry.
          entry._lastModified = Date.now(); // Update modification timestamp.
          arrayPush.call(updatedRecords, new PermaStore.DataEntry(currentStore.storeName, entry)); // Wrap and track updated record.
        }
      });
      saveToStorage(`PermaStore_${currentStore.storeName}`, currentStore.dataEntries); // Persist all changes.
      console.log(`RecordStore: Updated ${updatedRecords.length} entries matching criteria in '${currentStore.storeName}'.`);
    } else if (shouldUpsertIfNotFound) {
      // If no records found and `upsert` option is true, create a new record.
      const newRecordData = PermaStore.mergeObjects({}, queryCriteria, updatePayload); // Combine criteria and payload.
      currentStore.save(newRecordData, function(savedRecord) {
        arrayPush.call(updatedRecords, savedRecord);
        console.log(`RecordStore: Upserted new record (ID: ${savedRecord.recordId}) to '${currentStore.storeName}'.`);
      });
    } else {
      console.log(`RecordStore: No entries matched criteria in '${currentStore.storeName}', no update performed.`);
    }

    if (callbackFn) {
        callbackFn.call(currentStore, updatedRecords);
    } else {
        return updatedRecords;
    }
  };

  // Deletes data entries from the RecordStore based on specified criteria.
  RecordStore.prototype.delete = function () {
    const currentStore = this;
    let deleteCriteria = arguments[0];
    let callbackFn = null;

    if (typeof arguments[1] === 'function') {
        callbackFn = arguments[1];
    }

    if (typeof deleteCriteria !== 'object' || deleteCriteria === null || PermaStore.isCollectionEmpty(deleteCriteria)) {
      console.error("RecordStore.delete: Missing or invalid delete criteria.");
      if (callbackFn) callbackFn.call(currentStore, new Error("Invalid delete criteria"));
      return;
    }

    // Ensure `dataEntries` are fresh from storage.
    currentStore.dataEntries = parseJsonSafely(retrieveFromStorage(`PermaStore_${currentStore.storeName}`));

    let recordsBeforeDeletion = currentStore.dataEntries.length;
    // Filter out items that match the delete criteria, effectively deleting them.
    currentStore.dataEntries = PermaStore.selectMatchingElements(currentStore.dataEntries, function(item) {
      // Return `true` for items that should *not* be deleted (i.e., they do not match criteria).
      for (let prop in deleteCriteria) {
        if (PermaStore.ownsProperty(deleteCriteria, prop)) {
          if (item[prop] !== deleteCriteria[prop]) {
            return true; // This item does NOT match criteria, so keep it.
          }
        }
      }
      return false; // This item DOES match criteria, so filter it out (delete it).
    });

    const deletedCount = recordsBeforeDeletion - currentStore.dataEntries.length;
    if (deletedCount > 0) {
      saveToStorage(`PermaStore_${currentStore.storeName}`, currentStore.dataEntries); // Persist remaining items.
      console.log(`RecordStore: Deleted ${deletedCount} entries from store '${currentStore.storeName}'.`);
    } else {
      console.warn(`RecordStore: No entries matched delete criteria in '${currentStore.storeName}', no deletion performed.`);
    }

    if (callbackFn) {
        callbackFn.call(currentStore, deletedCount);
    }
  };

  // Completely removes all data from this specific RecordStore and unregisters its name.
  RecordStore.prototype.drop = function() {
    const currentStore = this;
    removeStorageItem(`PermaStore_${currentStore.storeName}`); // Delete the store's data from localStorage.
    currentStore.dataEntries = []; // Clear in-memory data.

    // Remove the store's name from the global registry of stores.
    const registryIndex = PermaStore.findIndexOfElement(PermaStore.registeredStores, currentStore.storeName);
    if (registryIndex !== -1) {
      PermaStore.registeredStores.splice(registryIndex, 1); // Remove from array.
      saveToStorage(PermaStore.storageKey, PermaStore.registeredStores); // Update the persisted registry.
      console.log(`RecordStore: Store '${currentStore.storeName}' has been dropped and unregistered.`);
    } else {
      console.warn(`RecordStore: Store '${currentStore.storeName}' was not found in registry during drop operation.`);
    }
  };

})(typeof window !== 'undefined' ? window : this); // Use 'this' as fallback for global object in non-browser environments.