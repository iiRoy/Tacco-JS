var dataVault = function() {

  // Utility to split a path string into segments, handling URI encoding and numeric array indices
  var segmentPath = function(pathStr) {
    if (!pathStr) return [];
    return pathStr.split('/').map(function(segment) {
      var decoded = decodeURIComponent(segment);
      // Check if it's an array index (0 or positive integers)
      if (/^0$|^[1-9][0-9]*$/.test(decoded)) {
        return parseInt(decoded, 10);
      }
      return decoded;
    });
  };

  // Utility to navigate a JavaScript object/array using path segments
  // Returns { parent: object|array, key: string|number, value: any } at the target path, or undefined if not found
  // If createIntermediate is true, it will create objects/arrays along the path as needed
  var locateObjectNode = function(rootObject, pathSegments, createIntermediate) {
    var current = rootObject;
    var parent = undefined;
    var key = undefined;

    if (pathSegments.length === 0) {
      return { parent: undefined, key: undefined, value: rootObject }; // Root node itself
    }

    for (var i = 0; i < pathSegments.length; i++) {
      key = pathSegments[i];

      if (current === null || typeof current !== 'object') {
        return undefined; // Path broken or trying to traverse a primitive
      }

      if (i < pathSegments.length - 1) { // Not the last segment
        if (!current.hasOwnProperty(key) || current[key] === null || typeof current[key] !== 'object') {
          if (createIntermediate) {
            // Determine if next segment is numeric to create an array, otherwise an object
            current[key] = (typeof pathSegments[i+1] === 'number') ? [] : {};
          } else {
            return undefined; // Path not found
          }
        }
        parent = current;
        current = current[key];
      } else { // Last segment
        parent = current;
        current = current[key];
      }
    }
    return { parent: parent, key: key, value: current };
  };

  // Utility to recursively apply a filter/transformation to an object structure
  // The filterFn takes (pathSegments, isCollection) and returns an object { filterChild: fn(childKey, childValue), transformNode: fn(nodeValue) }
  // or false to stop recursion for this branch, or undefined/null to apply no special filtering/transformation.
  var applyDataFilter = function(node, currentPathSegments, filterFn) {
    if (node === null || typeof node !== 'object') {
      return node; // Primitives are returned as-is
    }

    var isCollection = Array.isArray(node);
    var filterResult = filterFn(currentPathSegments, isCollection);

    if (filterResult === false) {
      return undefined; // Filter requests to stop this branch
    }

    var filterChild = (filterResult && typeof filterResult.filterChild === 'function') ? filterResult.filterChild : function() { return true; };
    var transformNode = (filterResult && typeof filterResult.transformNode === 'function') ? filterResult.transformNode : function(val) { return val; };

    var processedNode = isCollection ? [] : {};
    var originalKeys = Object.keys(node);

    // Apply sorting/range if filterResult specifies it (simplified from original IDBKeyRange)
    if (filterResult && (filterResult.lowerBoundary !== undefined || filterResult.upperBoundary !== undefined || filterResult.descending)) {
      originalKeys.sort(function(a, b) {
        var keyA = isCollection ? parseInt(a, 10) : a;
        var keyB = isCollection ? parseInt(b, 10) : b;
        if (filterResult.descending) {
          return keyB < keyA ? -1 : keyB > keyA ? 1 : 0;
        }
        return keyA < keyB ? -1 : keyA > keyB ? 1 : 0;
      });
    }

    for (var i = 0; i < originalKeys.length; i++) {
      var key = originalKeys[i];
      var childValue = node[key];
      var childKey = isCollection ? parseInt(key, 10) : key;

      // Apply boundary checks (simplified)
      if (filterResult && filterResult.lowerBoundary !== undefined && childKey < filterResult.lowerBoundary) continue;
      if (filterResult && filterResult.upperBoundary !== undefined && childKey > filterResult.upperBoundary) continue;
      if (filterResult && filterResult.lowerExclusive && childKey === filterResult.lowerBoundary) continue;
      if (filterResult && filterResult.upperExclusive && childKey === filterResult.upperBoundary) continue;


      if (!filterChild(childKey, childValue)) {
        continue; // Filter requests to skip this child
      }

      var nextPathSegments = currentPathSegments.concat([childKey]);
      var processedChild = applyDataFilter(childValue, nextPathSegments, filterFn);

      if (processedChild !== undefined) { // Only add if not explicitly stopped by filter
        if (isCollection) {
          processedNode.push(processedChild);
        } else {
          processedNode[childKey] = processedChild;
        }
      }
    }

    return transformNode(processedNode);
  };


  // Main object returned by dataVault()
  var vaultFacade = {
    establish: function(vaultName, setupRoutine, initialVersion, faultHandler) {
      var currentVaultHandle;
      var pendingQueue;
      var closeRequested;

      var initiateConnection = function(containerNames, callback) {
        if (currentVaultHandle) return callback();
        if (pendingQueue) return pendingQueue.push(callback);
        pendingQueue = [callback];

        var dbRequest = indexedDB.open(vaultName, initialVersion || 1);

        dbRequest.onupgradeneeded = function(event) {
          var db = event.target.result;
          var schemaUtil = {
            oldSchemaVersion: event.oldVersion,
            newSchemaVersion: event.target.newVersion, // Use target.newVersion
            createContainer: function(name, initialContents) {
              if (db.objectStoreNames.contains(name)) {
                throw new Error('Container "' + name + '" already exists.');
              }
              var store = db.createObjectStore(name, { keyPath: 'id' }); // Each store holds one full document at key 'id': 0
              if (initialContents !== undefined) {
                store.add({ id: 0, data: initialContents });
              }
              return schemaUtil;
            },
            removeContainer: function(name) {
              if (db.objectStoreNames.contains(name)) {
                db.deleteObjectStore(name);
              }
              return schemaUtil;
            }
          };
          if (typeof setupRoutine === 'function') {
            setupRoutine(schemaUtil);
          } else if (setupRoutine !== undefined) { // Assume setupRoutine is an object for initial data
            (Array.isArray(containerNames) ? containerNames : [containerNames]).forEach(function(name) {
              schemaUtil.createContainer(name, setupRoutine);
            });
          }
        };

        dbRequest.onsuccess = function(event) {
          currentVaultHandle = event.target.result;
          var nextCallback;
          while ((nextCallback = pendingQueue.shift())) {
            nextCallback();
          }
          if (closeRequested) {
            currentVaultHandle.close();
            closeRequested = null;
          }
        };

        if (faultHandler) {
          dbRequest.onerror = function(event) { faultHandler(event.target.error, false); };
          dbRequest.onblocked = function() { faultHandler(null, true); };
        }
      };

      var createOperationProcessor = function(accessMode, containerList, finalCallback) {
        var transactionHandle;
        var pendingOperationsCount = 0;
        var operationResults = [];
        var processorInstance = {};

        var executeOperation = function(containerName, pathSegments, value, insertMode, appendToArray, dataFilterFn) {
          var operationIndex = operationResults.push(undefined) - 1;
          pendingOperationsCount++;

          initiateConnection(containerList, function() {
            if (!transactionHandle) {
              transactionHandle = currentVaultHandle.transaction(containerList, accessMode);
              transactionHandle.oncomplete = function() {
                var resultsToReturn = operationResults;
                operationResults = []; // Reset for next batch of operations
                if (finalCallback) finalCallback.apply(processorInstance, resultsToReturn);
              };
              transactionHandle.onerror = function(event) {
                console.error("Vault transaction error:", event.target.error);
                if (finalCallback) finalCallback(event.target.error);
              };
              transactionHandle.onabort = function() {
                console.warn("Vault transaction aborted.");
                if (finalCallback) finalCallback("Transaction aborted");
              };
            }

            var objectStore = transactionHandle.objectStore(containerName);
            var getRequest = objectStore.get(0); // Always retrieve the single root document

            getRequest.onsuccess = function(event) {
              var fullDocumentWrapper = event.target.result; // Expects { id: 0, data: {...} }
              var fullDocument = fullDocumentWrapper ? fullDocumentWrapper.data : undefined;
              var operationError = undefined;
              var performPut = false; // Flag to decide if we should put the document back
              var performDeleteRoot = false; // Flag to decide if we should delete the root record

              if (pathSegments.length === 0) { // Root level operation
                if (dataFilterFn) { // Retrieve root
                  operationResults[operationIndex] = applyDataFilter(fullDocument, [], dataFilterFn);
                } else if (value !== undefined) { // Deposit root
                  fullDocument = value;
                  performPut = true;
                } else if (insertMode || appendToArray) {
                  operationError = "Cannot insert/append at root level directly without a path.";
                } else { // Remove root
                  performDeleteRoot = true;
                }
              } else { // Non-root path operation
                // For write operations to a non-existent root, initialize it
                if (accessMode !== 'readonly' && (fullDocument === undefined || fullDocument === null)) {
                    fullDocument = {};
                }

                var target = locateObjectNode(fullDocument, pathSegments, accessMode !== 'readonly');
                var parentNode = target ? target.parent : undefined;
                var targetKey = pathSegments[pathSegments.length - 1]; // Always use the last segment as key

                if (dataFilterFn) { // Retrieve operation
                  operationResults[operationIndex] = target ? applyDataFilter(target.value, pathSegments, dataFilterFn) : undefined;
                } else if (value !== undefined) { // Deposit or Insert/Append
                  if (!parentNode) {
                    operationError = "Parent path does not exist for write operation.";
                  } else if (insertMode) {
                    if (!Array.isArray(parentNode)) { operationError = "Parent is not an array for insert operation."; }
                    else { parentNode.splice(targetKey, 0, value); performPut = true; }
                  } else if (appendToArray) { // Append special case for array
                    if (!Array.isArray(parentNode)) { operationError = "Parent is not an array for append operation."; }
                    else { parentNode.push(value); performPut = true; } // Append to end
                  } else { // Deposit
                    parentNode[targetKey] = value;
                    performPut = true;
                  }
                } else { // Remove operation
                  if (!parentNode || !parentNode.hasOwnProperty(targetKey)) {
                    operationError = "Path to remove does not exist.";
                  } else {
                    if (Array.isArray(parentNode)) {
                      parentNode.splice(targetKey, 1);
                    } else {
                      delete parentNode[targetKey];
                    }
                    performPut = true;
                  }
                }
              }

              if (operationError) {
                operationResults[operationIndex] = operationError;
                if (!--pendingOperationsCount) { /* transaction will complete */ }
                return;
              }

              if (performDeleteRoot) {
                var deleteRequest = objectStore.delete(0);
                deleteRequest.onsuccess = function() {
                  operationResults[operationIndex] = undefined; // Success
                  if (!--pendingOperationsCount) { /* transaction will complete */ }
                };
                deleteRequest.onerror = function(event) {
                  operationResults[operationIndex] = event.target.error.message || "Database delete error.";
                  if (!--pendingOperationsCount) { /* transaction will complete */ }
                };
              } else if (performPut && accessMode !== 'readonly') { // Only put if it was a modification and not just a retrieve
                 var putRequest = objectStore.put({ id: 0, data: fullDocument });
                 putRequest.onsuccess = function() {
                   operationResults[operationIndex] = undefined; // Success
                   if (!--pendingOperationsCount) { /* transaction will complete */ }
                 };
                 putRequest.onerror = function(event) {
                   operationResults[operationIndex] = event.target.error.message || "Database write error.";
                   if (!--pendingOperationsCount) { /* transaction will complete */ }
                 };
              } else { // Read operation or no modification
                if (!--pendingOperationsCount) { /* transaction will complete */ }
              }
            };

            getRequest.onerror = function(event) {
              operationResults[operationIndex] = event.target.error.message || "Database read error.";
              if (!--pendingOperationsCount) { /* transaction will complete */ }
            };
          });
        };

        processorInstance = Array.isArray(containerList) ? { // Multiple containers
          retrieve: function(container, path, dataFilter) {
            executeOperation(container, segmentPath(path), undefined, false, false, dataFilter);
            return processorInstance;
          },
          deposit: accessMode === 'readwrite' ? function(container, path, val) {
            executeOperation(container, segmentPath(path), val);
            return processorInstance;
          } : null,
          insertAt: accessMode === 'readwrite' ? function(container, path, val) {
            executeOperation(container, segmentPath(path), val, true);
            return processorInstance;
          } : null,
          appendItem: accessMode === 'readwrite' ? function(container, path, val) {
            executeOperation(container, segmentPath(path), val, false, true);
            return processorInstance;
          } : null,
          removeItem: accessMode === 'readwrite' ? function(container, path) {
            executeOperation(container, segmentPath(path), undefined); // Value undefined implies remove
            return processorInstance;
          } : null,
          thenDone: function(callback) {
            finalCallback = callback;
          }
        } : { // Single container
          retrieve: function(path, dataFilter) {
            executeOperation(containerList, segmentPath(path), undefined, false, false, dataFilter);
            return processorInstance;
          },
          deposit: accessMode === 'readwrite' ? function(path, val) {
            executeOperation(containerList, segmentPath(path), val);
            return processorInstance;
          } : null,
          insertAt: accessMode === 'readwrite' ? function(path, val) {
            executeOperation(containerList, segmentPath(path), val, true);
            return processorInstance;
          } : null,
          appendItem: accessMode === 'readwrite' ? function(path, val) {
            executeOperation(containerList, segmentPath(path), val, false, true);
            return processorInstance;
          } : null,
          removeItem: accessMode === 'readwrite' ? function(path) {
            executeOperation(containerList, segmentPath(path), undefined); // Value undefined implies remove
            return processorInstance;
          } : null,
          thenDone: function(callback) {
            finalCallback = callback;
          }
        };

        return processorInstance;
      };

      var exposedVault = {
        process: function(writable, containerNames) {
          if (containerNames === null || containerNames === undefined) containerNames = 'mainData'; // Default container
          var currentCallback;
          var processor = createOperationProcessor(writable ? 'readwrite' : 'readonly', containerNames, function() {
            if (currentCallback) currentCallback.apply(exposedVault, arguments);
          });
          processor.thenDone = function(callback) { currentCallback = callback; }; // Override thenDone
          return processor;
        },
        retrieve: function(path, writable, dataFilter, container) {
          return exposedVault.process(writable, container).retrieve(path, dataFilter);
        },
        deposit: function(path, value, container) {
          return exposedVault.process(true, container).deposit(path, value);
        },
        insertAt: function(path, value, container) {
          return exposedVault.process(true, container).insertAt(path, value);
        },
        appendItem: function(path, value, container) {
          return exposedVault.process(true, container).appendItem(path, value);
        },
        removeItem: function(path, container) {
          return exposedVault.process(true, container).removeItem(path);
        },
        terminate: function() {
          if (currentVaultHandle) {
            currentVaultHandle.close();
            currentVaultHandle = null;
          } else {
            closeRequested = true;
          }
        }
      };
      return exposedVault;
    },
    purge: function(vaultName, callback) {
      var deleteRequest = indexedDB.deleteDatabase(vaultName);
      deleteRequest.onsuccess = deleteRequest.onerror = function(event) {
        callback(event.target.error, false);
      };
      deleteRequest.onblocked = function() {
        callback(null, true);
      };
    },
    listNames: function(callback) {
      if (indexedDB.databases) { // Standard way
        indexedDB.databases().then(function(dbs) {
          callback(dbs.map(function(dbInfo) { return dbInfo.name; }));
        }).catch(function(error) {
          console.error("Error listing databases:", error);
          callback([]); // Return empty array on error
        });
      } else if (indexedDB.webkitGetDatabaseNames) { // For older WebKit/Chrome
        indexedDB.webkitGetDatabaseNames().onsuccess = function(event) {
          callback(event.target.result);
        };
      } else {
        console.warn("IndexedDB.databases() not supported. Cannot list database names.");
        callback([]);
      }
    }
  };
  return vaultFacade;
}();