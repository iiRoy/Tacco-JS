// Copyright 2014, K. Ganser <http://kganser.com>
// MIT Licensed, with this copyright and permission notice
// <http://opensource.org/licenses/MIT>

var dataStoreFacade = function() {

  var generateKeySegment = function( resourceIdentifier ) {
    var segmentKey = resourceIdentifier.length ? resourceIdentifier[resourceIdentifier.length - 1] : '';
    return [
      resourceIdentifier.length < 2 && !segmentKey
        ? 0
        : resourceIdentifier.slice(0, -1).map(encodeURIComponent).join('/'),
      segmentKey
    ];
  };

  var createBoundedKeyRange = function( parentIdentifier, lowerBoundKey, upperBoundKey, lowerExclusiveFlag, upperBoundExclusiveFlag ) {
    parentIdentifier = parentIdentifier.map(encodeURIComponent).join('/');
    upperBoundExclusiveFlag = upperBoundKey == null || upperBoundExclusiveFlag;
    lowerBoundKey = lowerBoundKey == null ? [parentIdentifier] : [parentIdentifier, lowerBoundKey];
    upperBoundKey = upperBoundKey == null ? [parentIdentifier + '\0'] : [parentIdentifier, upperBoundKey];
    return IDBKeyRange.bound(lowerBoundKey, upperBoundKey, lowerExclusiveFlag, upperBoundExclusiveFlag);
  };

  var processPathSegments = function( dataStore, segmentPath, completionCallback ) {
    // substitute array indices in segmentPath with numerical keys;
    // second argument to completionCallback is true if segmentPath is an empty array slot
    segmentPath = segmentPath ? segmentPath.split('/').map(decodeURIComponent) : [];
    (function iterateSegments( indexCounter, isPathEmpty ) {
      while ( indexCounter < segmentPath.length && !/0|[1-9][0-9]*/.test(segmentPath[indexCounter]) ) {
        indexCounter++;
      }
      if ( indexCounter === segmentPath.length ) {
        return completionCallback(segmentPath, isPathEmpty);
      }
      var numericPosition = parseInt(segmentPath[indexCounter]);
      dataStore.get(generateKeySegment(segmentPath.slice(0, indexCounter))).onsuccess = function( eventObj ) {
        var queryResult = eventObj.target.result;
        if ( !queryResult ) {
          return completionCallback(segmentPath, isPathEmpty);
        }
        if ( queryResult.type !== 'array' ) {
          return iterateSegments(indexCounter + 1);
        }
        // set to numeric index initially, and to key if element is found
        segmentPath[indexCounter] = numericPosition;
        dataStore.openCursor(createBoundedKeyRange(segmentPath.slice(0, indexCounter))).onsuccess = function( eventObject ) {
          var storeCursor = eventObject.target.result;
          if ( storeCursor && numericPosition ) {
            storeCursor.advance(numericPosition);
            numericPosition = 0;
          } else {
            if ( storeCursor ) {
              segmentPath[indexCounter] = storeCursor.value.key;
            }
            iterateSegments(indexCounter + 1, !storeCursor);
          }
        };
      };
    }(0));
  };

  var retrieveValue = function( dataStore, targetPath, resultCallback, traversalCursor ) {
    var processChildNode;
    if ( typeof traversalCursor !== 'function' ) {
      traversalCursor = function() {};
    }
    dataStore.get(generateKeySegment(targetPath)).onsuccess = function( eventObj ) {
      var itemData = eventObj.target.result;
      if ( !itemData ) {
        return processChildNode || resultCallback();
      }
      (processChildNode = function( itemData, parentPath, currentPathSegments, finalCallback ) {
        var nodeValue = itemData.value,
            nodeType = itemData.type,
            pendingChildren = 1,
            arrayIndex = 0;
        if ( nodeType !== 'object' && nodeType !== 'array' ) {
          return finalCallback(nodeValue);
        }
        var isArrayNode = nodeType === 'array',
            cursorOptions = traversalCursor(currentPathSegments, isArrayNode);
        nodeValue = isArrayNode ? [] : {};
        if ( cursorOptions === false ) {
          return finalCallback(nodeValue);
        }
        if ( !cursorOptions || typeof cursorOptions !== 'object' ) {
          cursorOptions = { action: cursorOptions || {} };
        }
        if ( typeof cursorOptions.action !== 'function' ) {
          cursorOptions.action = function() {};
        }
        dataStore.openCursor(
          createBoundedKeyRange(parentPath, cursorOptions.lowerBound, cursorOptions.upperBound, cursorOptions.lowerExclusive, cursorOptions.upperExclusive),
          cursorOptions.descending ? 'prev' : 'next'
        ).onsuccess = function( eventObject ) {
          var dataIterator = eventObject.target.result;
          if ( !dataIterator ) {
            return --pendingChildren || finalCallback(nodeValue);
          }
          var childData = dataIterator.value,
              elementKey = isArrayNode ? arrayIndex++ : childData.key,
              cursorAction = cursorOptions.action(elementKey);
          if ( cursorAction === 'stop' ) {
            return --pendingChildren || finalCallback(nodeValue);
          }
          if ( cursorAction !== 'skip' ) {
            nodeValue[elementKey] = pendingChildren++;
            processChildNode(childData, parentPath.concat([childData.key]), currentPathSegments.concat([elementKey]), function( childNode ) {
              nodeValue[elementKey] = childNode;
              if ( !--pendingChildren ) {
                finalCallback(nodeValue);
              }
            });
          }
          dataIterator.continue();
        };
      })(itemData, targetPath, [], resultCallback);
    };
  };

  var storeValue = function( dataStore, targetPath, inputData, completionCallback ) {
    // { key: (key or index relative to parent)
    //   parent: (path of parent entry)
    //   type: (string|number|boolean|null|array|object)
    //   value: (or null if array or object) }
    var dataType = Array.isArray(inputData)
      ? 'array'
      : typeof inputData === 'object'
        ? inputData ? 'object' : 'null'
        : typeof inputData,
        entryKey = generateKeySegment(targetPath),
        pendingWrites = 1,
        writeComplete = function() { if ( !--pendingWrites ) completionCallback(); };
    dataStore.put({parent: entryKey[0], key: entryKey[1], type: dataType, value: typeof inputData === 'object' ? null : inputData}).onsuccess = writeComplete;
    if ( dataType === 'array' ) {
      inputData.forEach(function( itemVal, idx ) {
        pendingWrites++;
        storeValue(dataStore, targetPath.concat([idx]), itemVal, writeComplete);
      });
    } else if ( dataType === 'object' ) {
      Object.keys(inputData).forEach(function( keyName ) {
        pendingWrites++;
        storeValue(dataStore, targetPath.concat([keyName]), inputData[keyName], writeComplete);
      });
    }
  };

  var addToList = function( dataStore, targetPath, inputData, completionCallback ) {
    dataStore.openCursor(createBoundedKeyRange(targetPath), 'prev').onsuccess = function( eventObj ) {
      var lastElementCursor = eventObj.target.result;
      storeValue(dataStore, targetPath.concat([lastElementCursor ? lastElementCursor.value.key + 1 : 0]), inputData, completionCallback);
    };
  };

  var removeDescendants = function( dataStore, targetPath, completionCallback ) {
    var pendingDeletions = 1,
        deletionComplete = function() { if ( !--pendingDeletions ) completionCallback(); };
    dataStore.openCursor(createBoundedKeyRange(targetPath)).onsuccess = function( eventObj ) {
      var childCursor = eventObj.target.result;
      if ( !childCursor ) {
        return deletionComplete();
      }
      var childData = childCursor.value;
      pendingDeletions++;
      dataStore.delete([childData.parent, childData.key]).onsuccess = deletionComplete;
      if ( childData.type === 'object' || childData.type === 'array' ) {
        pendingDeletions++;
        removeDescendants(dataStore, targetPath.concat([childData.key]), deletionComplete);
      }
      childCursor.continue();
    }
  };

  return {
    establishConnection: function( databaseName, schemaUpgradeHandler, schemaVersion, connectionErrorHandler ) {
    /** dataStoreFacade: {
          establishConnection: function(databaseName:string, schemaUpgradeHandler=`{}`:json|function(UpgradeTransaction), schemaVersion=1:number, connectionErrorHandler=undefined:function(error:DOMError, blocked:boolean)) -> DatabaseConnection,
          eraseStore: function(databaseName:string, completionCallback:function(error:undefined|DOMError, blocked:boolean)),
          enumerateDatabases: function(completionCallback:function(DOMStringList))
        }

        This facade is built upon `indexedDB`. An upgrade transaction is initiated on `establishConnection` if the database version is less than
        the requested version or does not exist. If `schemaUpgradeHandler` is a JSON value, the object stores in the initial transaction
        operation on this `DatabaseConnection` will be populated with this value during an upgrade. Otherwise, an upgrade event will
        be managed by the provided function via `UpgradeTransaction`. */
      var instanceRef, databaseHandle, pendingRequests, shouldClose, initiateDatabaseOpen = function( objectStoreNames, completionHandler ) {
        if ( databaseHandle ) {
          return completionHandler();
        }
        if ( pendingRequests ) {
          return pendingRequests.push(completionHandler);
        }
        pendingRequests = [completionHandler];
        var dbOpenRequest = indexedDB.open(databaseName, schemaVersion || 1);
        dbOpenRequest.onupgradeneeded = function( eventObject ) {
          var upgradeRef, dbConnection = eventObject.target.result,
              initialData = schemaUpgradeHandler === undefined || typeof schemaUpgradeHandler === 'function' ? {} : schemaUpgradeHandler;
          if ( typeof schemaUpgradeHandler !== 'function' ) {
            schemaUpgradeHandler = function( upgradeTransaction ) {
              (Array.isArray(objectStoreNames) ? objectStoreNames : [objectStoreNames]).forEach(function( storeName ) {
                upgradeTransaction.provisionObjectStore(storeName, initialData);
              });
            };
          }
          /** UpgradeTransaction: {
                previousVersion: number,
                currentVersion: number,
                provisionObjectStore: function(name:string, initialData=`{}`:json) -> UpgradeTransaction,
                deprovisionObjectStore: function(name:string) -> UpgradeTransaction
              } */
          schemaUpgradeHandler(upgradeRef = {
            previousVersion: eventObject.oldVersion,
            currentVersion: eventObject.newVersion,
            provisionObjectStore: function( storeName, storeInitialData ) {
              if ( dbConnection.objectStoreNames.contains(storeName) ) {
                throw 'objectStore already exists';
              }
              storeValue(dbConnection.createObjectStore(storeName, {keyPath: ['parent', 'key']}), [], storeInitialData === undefined ? {} : storeInitialData, function() {});
              return upgradeRef;
            },
            deprovisionObjectStore: function( storeName ) {
              if ( dbConnection.objectStoreNames.contains(storeName) ) {
                dbConnection.deleteObjectStore(storeName);
              }
              return upgradeRef;
            }
          });
        };
        dbOpenRequest.onsuccess = function( eventObject ) {
          databaseHandle = eventObject.target.result;
          while ( (completionHandler = pendingRequests.shift()) ) {
            completionHandler();
          }
          if ( shouldClose ) {
            databaseHandle.close();
            shouldClose = null;
          }
        };
        if ( connectionErrorHandler ) {
          dbOpenRequest.onerror = function( eventObject ) { connectionErrorHandler(eventObject.target.error, false); };
          dbOpenRequest.onblocked = function() { connectionErrorHandler(null, true); };
        }
      };

      var transaction = function( transactionType, objectStoreNames, transactionCallback ) {
        var transactionHandle, operationsPending = 0, operationResults = [], transactionRef = {
          fetchData: retrieveValue,
          updateData: function( targetStore, resourcePath, transactionCallback, inputData, insertAtPosition, isEmptySlot ) {
            var parentResourcePath = resourcePath.slice(0, -1);
            targetStore.get(generateKeySegment(parentResourcePath)).onsuccess = function( eventObj ) {
              var parentEntry = eventObj.target.result,
                  pathSegment = resourcePath[resourcePath.length - 1];
              if ( !parentEntry && resourcePath.length ) {
                return transactionCallback('Parent resource does not exist');
              }
              if ( insertAtPosition && (!resourcePath.length || parentEntry.type !== 'array') ) {
                return transactionCallback('Parent resource is not an array');
              }
              if ( parentEntry && parentEntry.type !== 'object' && parentEntry.type !== 'array' ) {
                return transactionCallback('Parent resource is not an object or array');
              }
              if ( parentEntry && parentEntry.type === 'array' && typeof pathSegment !== 'number' ) {
                return transactionCallback('Invalid index to array resource');
              }
              if ( isEmptySlot ) { // array slot
                addToList(targetStore, parentResourcePath, inputData, transactionCallback);
              } else if ( insertAtPosition ) {
                var idx = 0, lastAffectedKey = pathSegment;
                targetStore.openCursor(createBoundedKeyRange(parentResourcePath, pathSegment)).onsuccess = function( eventObject ) {
                  var dataCursor = eventObject.target.result;
                  if ( dataCursor && dataCursor.value.key === pathSegment + idx++ ) {
                    // all contiguous keys after desired position must be shifted by one
                    lastAffectedKey = dataCursor.value.key;
                    return dataCursor.continue();
                  }
                  // found last key to shift; now shift subsequent elements' keys
                  var shiftPending = 1,
                      shiftComplete = function() { if ( !--shiftPending ) transactionCallback(); };
                  targetStore.openCursor(createBoundedKeyRange(parentResourcePath, pathSegment, lastAffectedKey), 'prev').onsuccess = function( eventObject2 ) {
                    dataCursor = eventObject2.target.result;
                    if ( !dataCursor ) {
                      return storeValue(targetStore, resourcePath, inputData, shiftComplete);
                    }
                    var currentIdx = dataCursor.value.key,
                        currentResourcePath = parentResourcePath.concat([currentIdx]);
                    shiftPending++;
                    retrieveValue(targetStore, currentResourcePath, function( resultData ) { // TODO: delete/put within cursor
                      removeDescendants(targetStore, currentResourcePath, function() {
                        storeValue(targetStore, parentResourcePath.concat([currentIdx + 1]), resultData, shiftComplete);
                        dataCursor.continue();
                      });
                    });
                  };
                };
              } else {
                removeDescendants(targetStore, resourcePath, function() {
                  storeValue(targetStore, resourcePath, inputData, transactionCallback);
                });
              }
            };
          },
          addToArray: function( targetStore, resourcePath, transactionCallback, inputData ) {
            targetStore.get(generateKeySegment(resourcePath)).onsuccess = function( eventObj ) {
              var parentEntry = eventObj.target.result;
              if ( !parentEntry ) {
                return transactionCallback('Parent resource does not exist');
              }
              if ( parentEntry.type !== 'array' ) {
                return transactionCallback('Parent resource is not an array');
              }
              addToList(targetStore, resourcePath, inputData, transactionCallback);
            };
          },
          removeData: function( targetStore, resourcePath, transactionCallback ) {
            targetStore.delete(generateKeySegment(resourcePath));
            removeDescendants(targetStore, resourcePath, transactionCallback);
          }
        };
        Object.keys(transactionRef).forEach(function( operationName ) {
          var operationMethod = transactionRef[operationName];
          var transactionWrapper = function( targetStore, resourcePath, inputData, insertAtPosition ) {
            var resultIndex = operationResults.push(operationsPending++) - 1, tempPath = resourcePath;
            processPathSegments(targetStore = transactionHandle.objectStore(targetStore), resourcePath, function( resolvedPath, isEmptySlot ) {
              operationMethod(targetStore, resolvedPath, function( resultValue ) {
                operationResults[resultIndex] = resultValue;
                if ( !--operationsPending ) {
                  var finalResults = operationResults;
                  operationResults = [];
                  transactionCallback.apply(null, finalResults);
                }
              }, inputData, insertAtPosition, isEmptySlot);
            });
          };
          transactionRef[operationName] = function( targetStore, resourcePath, inputData, insertAtPosition ) {
            if ( transactionHandle ) {
              return transactionWrapper(targetStore, resourcePath, inputData, insertAtPosition);
            }
            initiateDatabaseOpen(objectStoreNames, function() {
              if ( !transactionHandle ) {
                transactionHandle = databaseHandle.transaction(objectStoreNames, transactionType);
              }
              transactionWrapper(targetStore, resourcePath, inputData, insertAtPosition);
            });
          };
        });
        return transactionRef;
      };

      /** DatabaseConnection: {
            transaction: function(isWritable=false:boolean, objectStoreNames='data':[string, ...]|string) -> TransactionObject|ScopedTransactionObject,
            fetchData: function(resourcePath='':string, isWritable=false:boolean, traversalCursor=undefined:CursorFunction, objectStoreName='data':string) -> ScopedTransactionObject,
            updateData: function(resourcePath='':string, inputData:json, objectStoreName='data':string) -> ScopedTransactionObject,
            insertData: function(resourcePath='':string, inputData:json, objectStoreName='data':string) -> ScopedTransactionObject,
            addToArray: function(resourcePath='':string, inputData:json, objectStoreName='data':string) -> ScopedTransactionObject,
            removeData: function(resourcePath='':string, objectStoreName='data':string) -> ScopedTransactionObject,
            closeConnection: function
          }

          `fetchData`, `updateData`, `insertData`, `addToArray`, and `removeData` are convenience methods that operate through `transaction` for
          a single objectStore and return the corresponding `ScopedTransactionObject`. `fetchData` initiates a read-only
          transaction by default. `transaction` returns a `ScopedTransactionObject` if a single (string) objectStore is
          specified, and a `TransactionObject` if operating on multiple objectStores. */
      return instanceRef = {
        transaction: function( isWritable, objectStoreNames ) {
          if ( objectStoreNames == null ) {
            objectStoreNames = 'data';
          }
          var transactionInstance, completionHandler,
          transactionObject = transaction(isWritable ? 'readwrite' : 'readonly', objectStoreNames, function() {
            if ( completionHandler ) {
              completionHandler.apply(transactionInstance, arguments);
            }
          });
          /** TransactionObject: {
                fetchData: function(objectStoreName:string, resourcePath='':string, traversalCursor=undefined:CursorFunction) -> TransactionObject,
                updateData: null|function(objectStoreName:string, resourcePath='':string, inputData:json) -> TransactionObject,
                insertData: null|function(objectStoreName:string, resourcePath='':string, inputData:json) -> TransactionObject,
                addToArray: null|function(objectStoreName:string, resourcePath='':string, inputData:json) -> TransactionObject,
                removeData: null|function(objectStoreName:string, resourcePath='':string) -> TransactionObject,
                then: function(callback:function(this:TransactionObject, json|undefined, ...))
              }

              A `TransactionObject` operating on multiple data stores must specify an object store as the first argument to every
              operation. Otherwise, these methods correspond to `ScopedTransactionObject` methods. */

          /** ScopedTransactionObject: {
                fetchData: function(resourcePath='':string, traversalCursor=undefined:CursorFunction) -> ScopedTransactionObject,
                updateData: null|function(resourcePath='':string, inputData:json) -> ScopedTransactionObject,
                insertData: null|function(resourcePath='':string, inputData:json) -> ScopedTransactionObject,
                addToArray: null|function(resourcePath='':string, inputData:json) -> ScopedTransactionObject,
                removeData: null|function(resourcePath='':string) -> ScopedTransactionObject,
                then: function(callback:function(this:ScopedTransactionObject, json|undefined, ...))
              }

              All methods except `then` are chainable and execute on the same transaction in parallel. If the
              transaction is not writable, `updateData`, `insertData`, `addToArray`, and `removeData` are null.

              `resourcePath` is a `/`-separated string of array indices and `encodeURIComponent`-encoded object keys denoting
              the path to the desired element within the object store's JSON data structure; e.g.
              `'users/123/givenName'`. If undefined, `traversalCursor` buffers all data at the requested path as the result of a
              `fetchData` operation. `insertData` will splice the given `inputData` into the parent array at the specified position,
              shifting any subsequent elements forward.

              When all pending operations complete, `callback` is invoked with the result of each queued operation in
              order. More operations can be queued onto the same transaction at that time via `this`.

              Results from `updateData`, `insertData`, `addToArray`, and `removeData` are error strings or undefined if successful. `fetchData`
              results are JSON data or undefined if no value exists at the requested path. */

          /** CursorFunction: function(currentPathSegments:[string|number, ...], isArrayNode:boolean) -> boolean|CursorAction|{
                lowerBound=null: string|number,
                lowerExclusive=false: boolean,
                upperBound=null: string|number,
                upperExclusive=false: boolean,
                reverseOrder=false: boolean,
                action: CursorAction
              } */

          /** CursorAction:function(elementKey:string|number) -> undefined|string

              `CursorFunction` is a function called for each array or object encountered in the requested JSON structure. It is
              called with a `currentPathSegments` array (of strings and/or numeric indices) relative to the requested path (i.e. `[]`
              represents the path as requested in `fetchData`) and an `isArrayNode` boolean that is true if the substructure is an
              array. It returns a `CursorAction` callback or object with a range and `action`, or false to prevent
              recursion into the structure. `lowerBound` and `upperBound` restrict the keys/indices traversed for this
              object/array, and the `CursorAction` function is called with each `elementKey` in the requested range, in order. The
              `CursorAction` callback can optionally return either `'skip'` or `'stop'` to exclude the element at the given
              key from the structure or to exclude and stop iterating, respectively.

              For example, the following call uses a cursor to fetch only the immediate members of the object at the
              requested path. Object and array values will be empty:

             `db.fetchData('path/to/object', false, function(currentPathSegments) {
                return !currentPathSegments.length;
              });`

              The following call will get immediate members of the requested object sorted lexicographically (by code
              unit value) up to and including key value `'c'`, but excluding key `'abc'` (if any):

             `db.fetchData('path/to/object', false, function(currentPathSegments) {
                return currentPathSegments.length ? false : {
                  upperBound: 'c',
                  action: function(elementKey) {
                    if (elementKey === 'abc') return 'skip';
                  }
                };
              });` */
          return transactionInstance = Array.isArray(objectStoreNames) ? {
            fetchData: function( objectStoreName, resourcePath, traversalCursor ) {
              transactionObject.fetchData(objectStoreName, resourcePath, traversalCursor);
              return transactionInstance;
            },
            updateData: !isWritable ? null : function( objectStoreName, resourcePath, inputData ) {
              transactionObject.updateData(objectStoreName, resourcePath, inputData);
              return transactionInstance;
            },
            insertData: !isWritable ? null : function( objectStoreName, resourcePath, inputData ) {
              transactionObject.updateData(objectStoreName, resourcePath, inputData, true);
              return transactionInstance;
            },
            addToArray: !isWritable ? null : function( objectStoreName, resourcePath, inputData ) {
              transactionObject.addToArray(objectStoreName, resourcePath, inputData);
              return transactionInstance;
            },
            removeData: !isWritable ? null : function( objectStoreName, resourcePath ) {
              transactionObject.removeData(objectStoreName, resourcePath);
              return transactionInstance;
            },
            then: function( callbackFunction ) {
              completionHandler = callbackFunction;
            }
          } : {
            fetchData: function( resourcePath, traversalCursor ) {
              transactionObject.fetchData(objectStoreNames, resourcePath, traversalCursor);
              return transactionInstance;
            },
            updateData: !isWritable ? null : function( resourcePath, inputData ) {
              transactionObject.updateData(objectStoreNames, resourcePath, inputData);
              return transactionInstance;
            },
            insertData: !isWritable ? null : function( resourcePath, inputData ) {
              transactionObject.updateData(objectStoreNames, resourcePath, inputData, true);
              return transactionInstance;
            },
            addToArray: !isWritable ? null : function( resourcePath, inputData ) {
              transactionObject.addToArray(objectStoreNames, resourcePath, inputData);
              return transactionInstance;
            },
            removeData: !isWritable ? null : function( resourcePath ) {
              transactionObject.removeData(objectStoreNames, resourcePath);
              return transactionInstance;
            },
            then: function( callbackFunction ) {
              completionHandler = callbackFunction;
            }
          };
        },
        fetchData: function( resourcePath, isWritable, traversalCursor, objectStoreName ) {
          return instanceRef.transaction(isWritable, objectStoreName).fetchData(resourcePath, traversalCursor);
        },
        updateData: function( resourcePath, inputData, objectStoreName ) {
          return instanceRef.transaction(true, objectStoreName).updateData(resourcePath, inputData);
        },
        insertData: function( resourcePath, inputData, objectStoreName ) {
          return instanceRef.transaction(true, objectStoreName).insertData(resourcePath, inputData);
        },
        addToArray: function( resourcePath, inputData, objectStoreName ) {
          return instanceRef.transaction(true, objectStoreName).addToArray(resourcePath, inputData);
        },
        removeData: function( resourcePath, objectStoreName ) {
          return instanceRef.transaction(true, objectStoreName).removeData(resourcePath);
        },
        closeConnection: function() {
          if ( databaseHandle ) {
            databaseHandle.close();
            databaseHandle = null;
          } else {
            shouldClose = true;
          }
        }
      };
    },
    eraseStore: function( databaseName, completionCallback ) {
      var deleteRequest = indexedDB.deleteDatabase(databaseName);
      deleteRequest.onsuccess = deleteRequest.onerror = function( eventObj ) {
        completionCallback(eventObj.target.error, false);
      };
      deleteRequest.onblocked = function() {
        completionCallback(null, true);
      };
    },
    enumerateDatabases: function( completionCallback ) {
      indexedDB.webkitGetDatabaseNames().onsuccess = function( eventObj ) {
        completionCallback(eventObj.target.result);
      };
    }
  };
}();