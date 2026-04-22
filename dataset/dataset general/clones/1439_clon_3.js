// Copyright 2023, DataForge Solutions Inc.
// All rights reserved under the Apache License, Version 2.0.
// For details, see <http://www.apache.org/licenses/LICENSE-2.0>

const indexedDataWrapper = (() => {

  // Internal logging utility - can be toggled for debugging.
  const _logDebug = (...msgs) => {
    // console.debug("[IDW Debug]", ...msgs);
  };

  /**
   * Generates a unique key pair for IndexedDB storage.
   * Consists of a parent path and the item's own key.
   * @param {Array<string|number>} itemPath - The full path to the item.
   * @returns {[string, string|number]} A tuple [parentEncodedPath, itemKey].
   */
  const generateRecordKey = (itemPath) => {
    if (!Array.isArray(itemPath)) {
      _logDebug("Invalid path provided to generateRecordKey:", itemPath);
      itemPath = []; // Default to empty array for safety
    }

    const currentKey = itemPath.length > 0 ? itemPath[itemPath.length - 1] : '';
    const parentPathSegments = itemPath.slice(0, -1);

    // If path is short and no key, it's the root (parent: '', key: 0)
    // Otherwise, encode parent path segments and join with '/'
    const encodedParentPath = parentPathSegments.length > 0
      ? parentPathSegments.map(encodeURIComponent).join('/')
      : (itemPath.length === 0 && !currentKey ? '' : ''); // Root item has empty parent

    // Special handling for the very root of a store, using a numeric key.
    const finalKey = (itemPath.length < 2 && !currentKey && itemPath.length === 0) ? 0 : currentKey;

    return [encodedParentPath, finalKey];
  };

  /**
   * Creates an IndexedDB key range for querying child elements.
   * @param {Array<string|number>} parentSegments - Path segments of the parent.
   * @param {string|number|null} lowerBoundKey - Lower bound for child keys.
   * @param {string|number|null} upperBoundKey - Upper bound for child keys.
   * @param {boolean} lowerExclusive - If the lower bound is exclusive.
   * @param {boolean} upperExclusive - If the upper bound is exclusive.
   * @returns {IDBKeyRange} An IndexedDB key range object.
   */
  const createIndexedDBRange = (parentSegments, lowerBoundKey, upperBoundKey, lowerExclusive, upperExclusive) => {
    // Ensure parentSegments is an array
    if (!Array.isArray(parentSegments)) {
      _logDebug("Invalid parentSegments provided to createIndexedDBRange:", parentSegments);
      parentSegments = [];
    }

    const encodedParentPath = parentSegments.map(encodeURIComponent).join('/');

    // Determine the actual lower bound for the IndexedDB key.
    const effectiveLower = (lowerBoundKey === null || lowerBoundKey === undefined)
      ? [encodedParentPath]
      : [encodedParentPath, lowerBoundKey];

    // Determine the actual upper bound for the IndexedDB key.
    // The '\0' character ensures we get all children of the parent path.
    const effectiveUpper = (upperBoundKey === null || upperBoundKey === undefined)
      ? [encodedParentPath + '\0']
      : [encodedParentPath, upperBoundKey];

    // The 'ue' parameter in the original code seems to be a boolean flag that
    // defaults to true if upperBound is null or undefined.
    // Let's explicitly set upperExclusive if upperBoundKey is not provided.
    const finalUpperExclusive = (upperBoundKey === null || upperBoundKey === undefined) ? true : upperExclusive;

    return IDBKeyRange.bound(effectiveLower, effectiveUpper, lowerExclusive, finalUpperExclusive);
  };

  /**
   * Resolves a string path into an array of path segments, handling array indices.
   * This involves fetching intermediate objects to determine numeric keys for arrays.
   * @param {IDBObjectStore} dataStore - The IndexedDB object store.
   * @param {string} stringPath - The input path string (e.g., "users/123/data").
   * @param {function(Array<string|number>, boolean): void} completionHandler - Callback (resolvedPath, isEmptySlot).
   */
  const navigatePathSegments = (dataStore, stringPath, completionHandler) => {
    if (!stringPath) stringPath = ''; // Ensure path is a string

    let currentSegments = stringPath.split('/').map(decodeURIComponent);
    if (!currentSegments.length || (currentSegments.length === 1 && currentSegments[0] === '')) {
      currentSegments = []; // Normalize empty path
    }

    // Inner recursive function to advance through path segments
    const advanceResolution = (segmentIndex, wasEmptySlot) => {
      // Find the next segment that looks like an array index placeholder
      while (segmentIndex < currentSegments.length && !/^\d+$/.test(currentSegments[segmentIndex])) {
        segmentIndex++;
      }

      if (segmentIndex === currentSegments.length) {
        // All segments resolved or no array index placeholders found
        return completionHandler(currentSegments, wasEmptySlot);
      }

      const desiredPosition = parseInt(currentSegments[segmentIndex], 10);
      const currentParentPath = currentSegments.slice(0, segmentIndex);

      // Fetch the parent object to check its type
      dataStore.get(generateRecordKey(currentParentPath)).onsuccess = (eventResult) => {
        const parentRecord = eventResult.target.result;

        if (!parentRecord) {
          // Parent doesn't exist, path cannot be resolved further
          return completionHandler(currentSegments, wasEmptySlot);
        }

        if (parentRecord.type !== 'array') {
          // Parent is not an array, so the numeric segment is not an index
          // Treat it as a regular object key and continue
          return advanceResolution(segmentIndex + 1, wasEmptySlot);
        }

        // Parent is an array, we need to find the actual key for the desired position
        currentSegments[segmentIndex] = desiredPosition; // Temporarily set to numeric index

        dataStore.openCursor(createIndexedDBRange(currentParentPath)).onsuccess = (cursorEvent) => {
          const cursor = cursorEvent.target.result;

          if (cursor && desiredPosition > 0) {
            // Advance cursor to the desired position (0-indexed)
            cursor.advance(desiredPosition);
            // After advance, the cursor will be at the target or null if out of bounds.
            // The position is now effectively 0 relative to the new cursor.
            // We don't need to re-advance if the cursor is already at the target.
            // The original logic sets position to 0; let's simplify.
            // The next `onsuccess` event will fire with the cursor at the advanced position.
          } else {
            // If cursor is null (out of bounds) or position is 0 (first element)
            if (cursor) {
              // Found the element, update the segment with its actual key
              currentSegments[segmentIndex] = cursor.value.key;
            }
            // Continue with the next segment or signal an empty slot if cursor was null
            advanceResolution(segmentIndex + 1, !cursor);
          }
        };
      };
    };

    advanceResolution(0, false); // Start resolution from the first segment
  };

  /**
   * Recursively retrieves data from the store, building up the full JSON structure.
   * @param {IDBObjectStore} dataStore - The IndexedDB object store.
   * @param {Array<string|number>} itemPath - The resolved path to the item.
   * @param {function(...any): void} resultHandler - Callback to return the constructed value.
   * @param {function(Array<string|number>, boolean): (boolean|object)} [cursorConfigurator] - Function for cursor options.
   */
  const retrieveDataRecursive = (dataStore, itemPath, resultHandler, cursorConfigurator) => {
    // Ensure cursorConfigurator is a function or use a default no-op.
    if (typeof cursorConfigurator !== 'function') {
      cursorConfigurator = () => ({}); // Default to empty config to get all children
    }

    // Fetch the target item record first.
    dataStore.get(generateRecordKey(itemPath)).onsuccess = (eventResult) => {
      const targetRecord = eventResult.target.result;

      if (!targetRecord) {
        // If the target record itself doesn't exist, return undefined.
        return resultHandler(undefined);
      }

      // Inner recursive function to process children.
      const processChildren = (currentRecord, currentParentPath, relativePathSegments, childCompletionCallback) => {
        const recordValue = currentRecord.value;
        const recordType = currentRecord.type;

        let outstandingTasks = 1; // Start with 1 for the current record, decremented when done.
        let currentIndex = 0; // For array indices.

        // If not an object or array, it's a primitive value; return it directly.
        if (recordType !== 'object' && recordType !== 'array') {
          return childCompletionCallback(recordValue);
        }

        const isArrayType = (recordType === 'array');
        let constructedValue = isArrayType ? [] : {};

        // Get cursor configuration for this level.
        const currentCursorConfig = cursorConfigurator(relativePathSegments, isArrayType);

        if (currentCursorConfig === false) {
          // Cursor configurator explicitly said to stop recursion here.
          return childCompletionCallback(constructedValue);
        }

        // Normalize cursor configuration.
        const effectiveConfig = (typeof currentCursorConfig !== 'object' || currentCursorConfig === null)
          ? { action: currentCursorConfig || (() => {}) }
          : currentCursorConfig;

        // Ensure action is a function.
        if (typeof effectiveConfig.action !== 'function') {
          effectiveConfig.action = () => {};
        }

        const range = createIndexedDBRange(
          currentParentPath,
          effectiveConfig.lowerBound,
          effectiveConfig.upperBound,
          effectiveConfig.lowerExclusive,
          effectiveConfig.upperExclusive
        );
        const direction = effectiveConfig.descending ? 'prev' : 'next';

        dataStore.openCursor(range, direction).onsuccess = (cursorEvent) => {
          const cursor = cursorEvent.target.result;

          if (!cursor) {
            // No more children for this level.
            // Decrement outstandingTasks for the current record and check if all done.
            if (--outstandingTasks === 0) {
              childCompletionCallback(constructedValue);
            }
            return;
          }

          const childRecord = cursor.value;
          const childKey = isArrayType ? currentIndex++ : childRecord.key;
          const childAction = effectiveConfig.action(childKey);

          if (childAction === 'stop') {
            // Stop processing children at this level.
            if (--outstandingTasks === 0) {
              childCompletionCallback(constructedValue);
            }
            return;
          }

          if (childAction !== 'skip') {
            // Process this child. Increment outstandingTasks for the child's recursive call.
            constructedValue[childKey] = null; // Placeholder
            outstandingTasks++;
            processChildren(
              childRecord,
              currentParentPath.concat([childRecord.key]),
              relativePathSegments.concat([childKey]),
              (resolvedChildValue) => {
                constructedValue[childKey] = resolvedChildValue;
                // Decrement outstandingTasks for the child.
                if (--outstandingTasks === 0) {
                  childCompletionCallback(constructedValue);
                }
              }
            );
          }

          cursor.continue(); // Move to the next child.
        };
      };

      // Initiate the recursive processing from the root itemPath.
      processChildren(targetRecord, itemPath, [], resultHandler);
    };
  };

  /**
   * Recursively stores a JavaScript value into the IndexedDB store.
   * Creates/updates records for the value and its descendants.
   * @param {IDBObjectStore} dataStore - The IndexedDB object store.
   * @param {Array<string|number>} itemPath - The path where to store the value.
   * @param {any} itemValue - The JavaScript value to store.
   * @param {function(string|undefined): void} completionHandler - Callback with error message or undefined on success.
   */
  const storeDataRecursive = (dataStore, itemPath, itemValue, completionHandler) => {
    const recordType = Array.isArray(itemValue) ? 'array'
      : (typeof itemValue === 'object' && itemValue !== null) ? 'object'
      : (itemValue === null) ? 'null'
      : typeof itemValue;

    const [parentKeyComponent, selfKeyComponent] = generateRecordKey(itemPath);

    let completionCounter = 1; // One for the current item
    const decrementedCallback = () => {
      if (--completionCounter === 0) {
        completionHandler(undefined); // All operations successful
      }
    };

    // Store the current item's metadata and value (if primitive).
    const recordToPut = {
      parent: parentKeyComponent,
      key: selfKeyComponent,
      type: recordType,
      value: (recordType === 'object' || recordType === 'array' || recordType === 'null') ? null : itemValue
    };
    dataStore.put(recordToPut).onsuccess = decrementedCallback;

    // Recursively store children if it's an array or object.
    if (recordType === 'array') {
      if (!Array.isArray(itemValue)) {
        _logDebug("Expected array but got:", itemValue, "at path:", itemPath);
        return completionHandler("Internal error: Expected array for 'array' type.");
      }
      itemValue.forEach((element, index) => {
        completionCounter++;
        storeDataRecursive(dataStore, itemPath.concat([index]), element, decrementedCallback);
      });
    } else if (recordType === 'object') {
      if (typeof itemValue !== 'object' || itemValue === null) {
        _logDebug("Expected object but got:", itemValue, "at path:", itemPath);
        return completionHandler("Internal error: Expected object for 'object' type.");
      }
      Object.keys(itemValue).forEach((propKey) => {
        completionCounter++;
        storeDataRecursive(dataStore, itemPath.concat([propKey]), itemValue[propKey], decrementedCallback);
      });
    }

    // If initial completionCounter is still 1 and no children were processed, call immediately.
    if (completionCounter === 1) {
      completionHandler(undefined);
    }
  };

  /**
   * Appends a new value to an array at the given path.
   * Finds the next available numeric index.
   * @param {IDBObjectStore} dataStore - The IndexedDB object store.
   * @param {Array<string|number>} parentPath - The path to the parent array.
   * @param {any} newValue - The value to append.
   * @param {function(string|undefined): void} completionHandler - Callback with error message or undefined.
   */
  const appendToCollection = (dataStore, parentPath, newValue, completionHandler) => {
    // Find the highest existing numeric key for the parent path.
    dataStore.openCursor(createIndexedDBRange(parentPath), 'prev').onsuccess = (eventResult) => {
      const cursor = eventResult.target.result;
      const nextIndex = cursor ? cursor.value.key + 1 : 0; // If no items, start at 0.
      storeDataRecursive(dataStore, parentPath.concat([nextIndex]), newValue, completionHandler);
    };
  };

  /**
   * Recursively deletes an item and all its descendants from the store.
   * @param {IDBObjectStore} dataStore - The IndexedDB object store.
   * @param {Array<string|number>} itemPath - The path to the item to delete.
   * @param {function(string|undefined): void} completionHandler - Callback with error message or undefined.
   */
  const removeDescendantEntries = (dataStore, itemPath, completionHandler) => {
    let tasksRemaining = 1; // One for the initial completion check.
    const decrementAndCheck = () => {
      if (--tasksRemaining === 0) {
        completionHandler(undefined);
      }
    };

    // Open a cursor for all children of the given path.
    dataStore.openCursor(createIndexedDBRange(itemPath)).onsuccess = (eventResult) => {
      const cursor = eventResult.target.result;

      if (!cursor) {
        // No more children. Decrement the initial task and complete.
        return decrementAndCheck();
      }

      const childRecord = cursor.value;

      // Delete the current child record.
      tasksRemaining++;
      dataStore.delete([childRecord.parent, childRecord.key]).onsuccess = decrementAndCheck;

      // If the child is an object or array, recursively delete its children.
      if (childRecord.type === 'object' || childRecord.type === 'array') {
        tasksRemaining++;
        removeDescendantEntries(dataStore, itemPath.concat([childRecord.key]), decrementAndCheck);
      }

      cursor.continue(); // Move to the next sibling.
    };
  };

  // Check for IndexedDB API availability.
  if (!window.indexedDB) {
    console.error("IndexedDB is not supported by this browser. Data persistence will not work.");
    return {
      open: () => {
        throw new Error("IndexedDB not supported.");
      },
      delete: () => {
        throw new Error("IndexedDB not supported.");
      },
      list: (cb) => {
        cb([]);
      }
    };
  }

  return {
    /**
     * Initializes and opens an IndexedDB database connection.
     * @param {string} dbName - Name of the database.
     * @param {object|function(UpgradeTransaction): void} [upgradeSchema] - Initial data JSON or upgrade function.
     * @param {number} [dbVersion=1] - Database schema version.
     * @param {function(DOMException|null, boolean): void} [errorHandler] - Callback for errors (error, isBlocked).
     * @returns {DatabaseClient} An API client for interacting with the database.
     */
    open: function(dbName, upgradeSchema, dbVersion = 1, errorHandler) {
      let indexedDbHandle = null;
      let pendingOperations = []; // Queue for operations before DB is open.
      let shouldCloseImmediately = false; // Flag to close DB once opened, if requested early.
      let isUpgrading = false; // Flag to prevent re-entry during upgrade.

      /**
       * Internal function to establish or reuse a database connection.
       * @param {string|Array<string>} requiredStores - Stores required for the operation.
       * @param {function(): void} onConnectionReady - Callback when DB is open and ready.
       */
      const initiateConnection = (requiredStores, onConnectionReady) => {
        if (indexedDbHandle) {
          // If already open, proceed immediately.
          return onConnectionReady();
        }
        if (pendingOperations.length > 0) {
          // If connection is pending, queue the current operation.
          pendingOperations.push(onConnectionReady);
          return;
        }

        // First operation, initiate connection.
        pendingOperations = [onConnectionReady];
        const dbOpenRequest = indexedDB.open(dbName, dbVersion);

        dbOpenRequest.onupgradeneeded = (eventObject) => {
          isUpgrading = true;
          indexedDbHandle = eventObject.target.result;
          let initialDataSet = upgradeSchema === undefined || typeof upgradeSchema === 'function' ? {} : upgradeSchema;
          let effectiveUpgradeHandler = upgradeSchema;

          if (typeof upgradeSchema !== 'function') {
            // If upgradeSchema is JSON, create a default handler.
            effectiveUpgradeHandler = (upgradeContext) => {
              const storesToCreate = Array.isArray(requiredStores) ? requiredStores : [requiredStores];
              storesToCreate.forEach((storeName) => {
                if (!indexedDbHandle.objectStoreNames.contains(storeName)) {
                  upgradeContext.createObjectStore(storeName, initialDataSet);
                }
              });
            };
          }

          // Define the upgrade context for the user-provided handler.
          const upgradeContext = {
            oldVersion: eventObject.oldVersion,
            newVersion: eventObject.newVersion,
            createObjectStore: function(storeName, initialData) {
              if (indexedDbHandle.objectStoreNames.contains(storeName)) {
                console.warn(`Object store '${storeName}' already exists. Skipping creation.`);
                return this; // Return self for chaining.
              }
              const newStore = indexedDbHandle.createObjectStore(storeName, { keyPath: ['parent', 'key'] });
              if (initialData !== undefined && initialData !== null && Object.keys(initialData).length > 0) {
                // Populate the new store with initial data.
                storeDataRecursive(newStore, [], initialData, (err) => {
                  if (err) console.error(`Error populating store '${storeName}':`, err);
                });
              }
              return this;
            },
            deleteObjectStore: function(storeName) {
              if (indexedDbHandle.objectStoreNames.contains(storeName)) {
                indexedDbHandle.deleteObjectStore(storeName);
              } else {
                console.warn(`Object store '${storeName}' does not exist. Skipping deletion.`);
              }
              return this;
            }
          };
          effectiveUpgradeHandler(upgradeContext);
        };

        dbOpenRequest.onsuccess = (eventObject) => {
          indexedDbHandle = eventObject.target.result;
          isUpgrading = false; // Reset upgrade flag
          // Process all queued operations.
          let nextCallback;
          while ((nextCallback = pendingOperations.shift())) {
            nextCallback();
          }
          // If close was called before DB was ready, close it now.
          if (shouldCloseImmediately) {
            indexedDbHandle.close();
            indexedDbHandle = null;
            shouldCloseImmediately = false;
          }
        };

        // Handle errors and blocked events.
        if (errorHandler) {
          dbOpenRequest.onerror = (eventObject) => { errorHandler(eventObject.target.error, false); };
          dbOpenRequest.onblocked = () => { errorHandler(null, true); };
        } else {
          dbOpenRequest.onerror = (eventObject) => {
            console.error(`IndexedDB Error for database '${dbName}':`, eventObject.target.error);
          };
          dbOpenRequest.onblocked = () => {
            console.warn(`IndexedDB connection to '${dbName}' blocked. Close other tabs.`);
          };
        }
      };

      /**
       * Creates a transaction wrapper for performing operations.
       * @param {boolean} isWritable - True for readwrite, false for readonly.
       * @param {string|Array<string>} objectStores - Store(s) to operate on.
       * @param {function(...any): void} transactionCompletionCallback - Callback when all transaction ops complete.
       * @returns {object} An object with wrapped CRUD methods.
       */
      const executeTransaction = (isWritable, objectStores, transactionCompletionCallback) => {
        let activeTransaction = null;
        let operationsOutstanding = 0;
        const operationResults = [];
        const transactionApi = {}; // The object returned to the user for chaining.

        // Helper to manage operation completions.
        const signalOperationComplete = (opIndex, resultValue) => {
          operationResults[opIndex] = resultValue;
          if (--operationsOutstanding === 0) {
            // All operations within this transaction are done.
            const resultsCopy = operationResults.slice(); // Pass a copy
            operationResults.length = 0; // Clear for next transaction.
            transactionCompletionCallback.apply(null, resultsCopy);
          }
        };

        // Define internal CRUD methods that operate directly on IDBObjectStore.
        const internalCrudMethods = {
          getItem: retrieveDataRecursive,
          putItem: (store, path, value, cb, insertMode, emptySlot) => {
            const parentPathSegments = path.slice(0, -1);
            const targetKey = path[path.length - 1];

            dataStore.get(generateRecordKey(parentPathSegments)).onsuccess = (evt) => {
              const parentRecord = evt.target.result;

              // Validate parent existence and type.
              if (!parentRecord && parentPathSegments.length > 0) {
                return cb('Parent resource does not exist.');
              }
              if (insertMode && (!parentPathSegments.length || parentRecord.type !== 'array')) {
                return cb('Insertion only supported for array parents.');
              }
              if (parentRecord && parentRecord.type !== 'object' && parentRecord.type !== 'array') {
                return cb('Parent resource is not an object or array.');
              }
              if (parentRecord && parentRecord.type === 'array' && typeof targetKey !== 'number') {
                return cb('Invalid index for array resource.');
              }

              if (emptySlot) {
                // If it's an empty slot found by resolvePath, append.
                appendToCollection(store, parentPathSegments, value, cb);
              } else if (insertMode) {
                // Handle insertion into an array, shifting subsequent elements.
                let shiftIndex = 0;
                let lastKeyToShift = targetKey;
                store.openCursor(createIndexedDBRange(parentPathSegments, targetKey)).onsuccess = (cursorEvent) => {
                  const shiftCursor = cursorEvent.target.result;
                  if (shiftCursor && shiftCursor.value.key === targetKey + shiftIndex++) {
                    lastKeyToShift = shiftCursor.value.key;
                    return shiftCursor.continue();
                  }

                  // Found the last key to shift. Now shift elements backwards.
                  let shiftTasks = 1; // For the initial put of the new value.
                  const shiftCompletion = () => {
                    if (--shiftTasks === 0) cb(undefined);
                  };

                  store.openCursor(createIndexedDBRange(parentPathSegments, targetKey, lastKeyToShift), 'prev').onsuccess = (reverseCursorEvent) => {
                    const reverseCursor = reverseCursorEvent.target.result;
                    if (!reverseCursor) {
                      // All elements shifted, now insert the new value.
                      storeDataRecursive(store, path, value, shiftCompletion);
                      return;
                    }

                    const originalIndex = reverseCursor.value.key;
                    const originalItemPath = parentPathSegments.concat([originalIndex]);
                    const newPathForShiftedItem = parentPathSegments.concat([originalIndex + 1]);

                    shiftTasks++;
                    // Get item, delete old, put new at shifted position.
                    retrieveDataRecursive(store, originalItemPath, (itemToShift) => {
                      // Delete children first, then delete the item itself.
                      removeDescendantEntries(store, originalItemPath, (deleteErr) => {
                        if (deleteErr) {
                          console.error("Error deleting old item for shift:", deleteErr);
                          shiftCompletion();
                          return;
                        }
                        store.delete(generateRecordKey(originalItemPath)).onsuccess = () => {
                          storeDataRecursive(store, newPathForShiftedItem, itemToShift, shiftCompletion);
                        };
                      });
                    });
                    reverseCursor.continue();
                  };
                };
              } else {
                // Standard put (overwrite or create).
                removeDescendantEntries(store, path, (deleteErr) => {
                  if (deleteErr) {
                    cb(deleteErr);
                    return;
                  }
                  dataStore.delete(generateRecordKey(path)).onsuccess = () => {
                    storeDataRecursive(store, path, value, cb);
                  };
                });
              }
            };
          },
          addItem: (store, path, cb, value) => {
            dataStore.get(generateRecordKey(path)).onsuccess = (evt) => {
              const parentRecord = evt.target.result;
              if (!parentRecord) return cb('Parent resource does not exist for append.');
              if (parentRecord.type !== 'array') return cb('Parent resource is not an array for append.');
              appendToCollection(store, path, value, cb);
            };
          },
          deleteItem: (store, path, cb) => {
            removeDescendantEntries(store, path, (err) => {
              if (err) {
                cb(err);
                return;
              }
              // Finally, delete the item itself.
              dataStore.delete(generateRecordKey(path)).onsuccess = () => cb(undefined);
            });
          }
        };

        // Wrap each internal method for transactional execution.
        Object.keys(internalCrudMethods).forEach((methodName) => {
          const originalCrudMethod = internalCrudMethods[methodName];

          transactionApi[methodName] = function(storeName, rawPath, operationValue, isInsertion) {
            // Validate arguments for common cases.
            if (rawPath === undefined || rawPath === null) rawPath = ''; // Default path.
            if (typeof rawPath !== 'string') {
              console.warn("Path argument should be a string, received:", rawPath);
              rawPath = String(rawPath);
            }

            const currentOpIndex = operationsOutstanding++; // Assign index and increment.

            // Ensure DB connection and transaction are ready.
            initiateConnection(objectStores, () => {
              if (!activeTransaction) {
                activeTransaction = indexedDbHandle.transaction(objectStores, isWritable ? 'readwrite' : 'readonly');
                // Set up transaction completion.
                activeTransaction.oncomplete = () => _logDebug("Transaction complete.");
                activeTransaction.onerror = (evt) => {
                  console.error("Transaction error:", evt.target.error);
                  // Mark all remaining ops as failed.
                  for (let i = 0; i < operationsOutstanding; i++) {
                    if (operationResults[i] === undefined) { // If not yet set by success.
                      operationResults[i] = evt.target.error.message || "Transaction failed.";
                    }
                  }
                  // Force completion if still pending.
                  if (operationsOutstanding > 0) {
                    operationsOutstanding = 1; // Only one remaining to trigger completion.
                    signalOperationComplete(currentOpIndex, evt.target.error.message || "Transaction failed.");
                  }
                };
                activeTransaction.onabort = (evt) => {
                  console.warn("Transaction aborted:", evt.target.error);
                  // Mark all remaining ops as aborted.
                  for (let i = 0; i < operationsOutstanding; i++) {
                    if (operationResults[i] === undefined) {
                      operationResults[i] = evt.target.error?.message || "Transaction aborted.";
                    }
                  }
                  // Force completion if still pending.
                  if (operationsOutstanding > 0) {
                    operationsOutstanding = 1;
                    signalOperationComplete(currentOpIndex, evt.target.error?.message || "Transaction aborted.");
                  }
                };
              }

              const dataStore = activeTransaction.objectStore(storeName);

              // Resolve the path before executing the actual CRUD operation.
              navigatePathSegments(dataStore, rawPath, (resolvedPathArray, isEmptyArraySlot) => {
                originalCrudMethod(
                  dataStore,
                  resolvedPathArray,
                  (opResult) => signalOperationComplete(currentOpIndex, opResult),
                  operationValue,
                  isInsertion,
                  isEmptyArraySlot
                );
              });
            });
            return this; // Enable chaining.
          };
        });

        // Add a .then() method for callback.
        transactionApi.then = function(finalCallback) {
          transactionCompletionCallback = finalCallback;
          // If no operations were queued, call callback immediately.
          if (operationsOutstanding === 0) {
            finalCallback.apply(null, operationResults);
          }
        };

        // If not writable, disable modifying methods.
        if (!isWritable) {
          transactionApi.putItem = null;
          transactionApi.addItem = null;
          transactionApi.deleteItem = null;
          transactionApi.insertItem = null; // Insert uses put internally, so disable directly.
        }

        return transactionApi;
      };

      // The public API for a connected database.
      const dbClientInstance = {
        /**
         * Initiates a database transaction.
         * @param {boolean} isWriteable - true for readwrite, false for readonly.
         * @param {string|Array<string>} stores - The object store(s) to operate on.
         * @returns {TransactionAPI|ScopedTransactionAPI} Transaction object for chaining.
         */
        createTransaction: function(isWriteable, stores = 'data') {
          let transactionCompletionHandler;
          const transactionController = executeTransaction(isWriteable, stores, function() {
            if (transactionCompletionHandler) {
              transactionCompletionHandler.apply(dbClientInstance, arguments);
            }
          });

          // Return either a multi-store TransactionAPI or a single-store ScopedTransactionAPI.
          return Array.isArray(stores) ? { // Multi-store API
            getItem: function(storeName, path, cursorConfig) {
              transactionController.getItem(storeName, path, cursorConfig);
              return this;
            },
            putItem: transactionController.putItem ? function(storeName, path, value) {
              transactionController.putItem(storeName, path, value);
              return this;
            } : null,
            insertItem: transactionController.putItem ? function(storeName, path, value) {
              transactionController.putItem(storeName, path, value, true); // `true` for insert mode.
              return this;
            } : null,
            addItem: transactionController.addItem ? function(storeName, path, value) {
              transactionController.addItem(storeName, path, value);
              return this;
            } : null,
            deleteItem: transactionController.deleteItem ? function(storeName, path) {
              transactionController.deleteItem(storeName, path);
              return this;
            } : null,
            then: function(cb) {
              transactionCompletionHandler = cb;
            }
          } : { // ScopedTransactionAPI (single store)
            getItem: function(path, cursorConfig) {
              transactionController.getItem(stores, path, cursorConfig);
              return this;
            },
            putItem: transactionController.putItem ? function(path, value) {
              transactionController.putItem(stores, path, value);
              return this;
            } : null,
            insertItem: transactionController.putItem ? function(path, value) {
              transactionController.putItem(stores, path, value, true);
              return this;
            } : null,
            addItem: transactionController.addItem ? function(path, value) {
              transactionController.addItem(stores, path, value);
              return this;
            } : null,
            deleteItem: transactionController.deleteItem ? function(path) {
              transactionController.deleteItem(stores, path);
              return this;
            } : null,
            then: function(cb) {
              transactionCompletionHandler = cb;
            }
          };
        },

        // Convenience methods for single-store operations.
        fetchItem: function(path = '', isWriteable = false, cursorConfig, storeName = 'data') {
          return this.createTransaction(isWriteable, storeName).getItem(path, cursorConfig);
        },
        updateItem: function(path = '', value, storeName = 'data') {
          return this.createTransaction(true, storeName).putItem(path, value);
        },
        insertItem: function(path = '', value, storeName = 'data') {
          return this.createTransaction(true, storeName).insertItem(path, value);
        },
        appendToItem: function(path = '', value, storeName = 'data') {
          return this.createTransaction(true, storeName).addItem(path, value);
        },
deleteItem: function(path = '', storeName = 'data') {
          return this.createTransaction(true, storeName).deleteItem(path);
        },

        /**
         * Closes the database connection.
         */
        closeConnection: function() {
          if (indexedDbHandle) {
            indexedDbHandle.close();
            indexedDbHandle = null;
            pendingOperations = []; // Clear any pending ops.
          } else {
            // If DB not yet open, set flag to close it once it does.
            shouldCloseImmediately = true;
          }
        }
      };
      return dbClientInstance;
    },

    /**
     * Deletes an entire IndexedDB database.
     * @param {string} dbName - Name of the database to delete.
     * @param {function(DOMException|null, boolean): void} completionHandler - Callback (error, isBlocked).
     */
    delete: function(dbName, completionHandler) {
      const deletionRequest = indexedDB.deleteDatabase(dbName);
      deletionRequest.onsuccess = deletionRequest.onerror = (eventObject) => {
        completionHandler(eventObject.target.error, false);
      };
      deletionRequest.onblocked = () => {
        completionHandler(null, true);
      };
    },

    /**
     * Lists all IndexedDB database names in the origin.
     * @param {function(Array<string>): void} callback - Callback with array of database names.
     */
    listDatabases: function(callback) {
      if (!indexedDB.webkitGetDatabaseNames && !indexedDB.databases) {
        console.warn("Browser does not support listing database names.");
        return callback([]);
      }
      // Use standard Promise-based API if available, fallback to webkit prefix.
      const listRequest = indexedDB.databases ? indexedDB.databases() : indexedDB.webkitGetDatabaseNames();
      listRequest.onsuccess = (eventObject) => {
        const dbNames = eventObject.target.result.map(dbInfo => typeof dbInfo === 'object' ? dbInfo.name : dbInfo);
        callback(dbNames);
      };
      listRequest.onerror = (eventObject) => {
        console.error("Error listing databases:", eventObject.target.error);
        callback([]);
      };
    }
  };
})();