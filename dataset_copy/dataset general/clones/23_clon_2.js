//
// DataVault.js v1.0.0
// (c) 2023 Acme Corp
// contact@acmecorp.com
//

((globalEnv) => {

  // Core DataVault constructor function
  const DataVault = function(inputData) {
    if (inputData instanceof DataVault) return inputData;
    if (!(this instanceof DataVault)) return new DataVault(inputData);
  };

  // Handle module exports for Node.js/CommonJS environments
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = DataVault;
    }
    exports.DataVault = DataVault;
  } else {
    // Expose DataVault globally in browser environments
    globalEnv.DataVault = DataVault;
  }

  // Initialize stored collection names from local storage
  let storedSets = localStorage.getItem('DataVault_Storage');

  if (!storedSets) {
    DataVault.storedSets = [];
    localStorage.setItem('DataVault_Storage', JSON.stringify(DataVault.storedSets));
  } else {
    DataVault.storedSets = JSON.parse(storedSets);
  }

  // Assign the current library version
  DataVault.programVersion = '1.0.0';

  // Utility Functions
  const terminationSignal = {}; // Used to break out of loops early

  // References to native prototype methods for efficiency
  const arrayPrototypeRef = Array.prototype;
  const objectPrototypeRef = Object.prototype;
  const functionPrototypeRef = Function.prototype;

  const arrPushMethod = arrayPrototypeRef.push;
  const arrSliceMethod = arrayPrototypeRef.slice;
  const arrConcatMethod = arrayPrototypeRef.concat;
  const objToStringMethod = objectPrototypeRef.toString;
  const objHasOwnMethod = objectPrototypeRef.hasOwnProperty;

  // Cache native array and object methods
  const systemForEach = arrayPrototypeRef.forEach;
  const systemMap = arrayPrototypeRef.map;
  const systemReduce = arrayPrototypeRef.reduce;
  const systemReduceRight = arrayPrototypeRef.reduceRight;
  const systemFilter = arrayPrototypeRef.filter;
  const systemEvery = arrayPrototypeRef.every;
  const systemSome = arrayPrototypeRef.some;
  const systemIndexOf = arrayPrototypeRef.indexOf;
  const systemLastIndexOf = arrayPrototypeRef.lastIndexOf;
  const systemIsArray = Array.isArray;
  const systemObjectKeys = Object.keys;
  const systemFunctionBind = functionPrototypeRef.bind;

  // Iterates over a collection (array or object)
  const processItems = DataVault.processItems = DataVault.forEveryElement = function(targetCollection, callbackFunction, executionScope) {
    if (targetCollection == null) return; // Exit if collection is null or undefined

    // Use native forEach if available and applicable
    if (systemForEach && targetCollection.forEach === systemForEach) {
      targetCollection.forEach(callbackFunction, executionScope);
    } else if (targetCollection.length === +targetCollection.length) {
      // Iterate over array-like objects
      for (let loopIndex = 0, collectionLength = targetCollection.length; loopIndex < collectionLength; loopIndex++) {
        if (callbackFunction.call(executionScope, targetCollection[loopIndex], loopIndex, targetCollection) === terminationSignal) return;
      }
    } else {
      // Iterate over object properties
      for (let propertyIdentifier in targetCollection) {
        if (DataVault.ownsProperty(targetCollection, propertyIdentifier)) {
          if (callbackFunction.call(executionScope, targetCollection[propertyIdentifier], propertyIdentifier, targetCollection) === terminationSignal) return;
        }
      }
    }
  };

  // Generates a random hexadecimal segment for UUID creation
  DataVault.generateHexSegment = function() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  };

  // Creates a unique identifier string
  DataVault.createUniqueId = function() {
    return DataVault.generateHexSegment() + DataVault.generateHexSegment() + new Date().getTime() + DataVault.generateHexSegment();
  };

  // Finds the index of a searchItem within a targetArray
  DataVault.findIndexOf = function(targetArray, searchItem, isSortedFlag) {
    if (targetArray == null) return -1; // No array to search

    let currentIdx = 0;
    const arrayLen = targetArray.length;

    if (isSortedFlag) {
      // Handle sorted arrays efficiently
      if (typeof isSortedFlag === 'number') {
        currentIdx = (isSortedFlag < 0 ? Math.max(0, arrayLen + isSortedFlag) : isSortedFlag);
      } else {
        currentIdx = DataVault.getSortedInsertionPoint(targetArray, searchItem);
        return targetArray[currentIdx] === searchItem ? currentIdx : -1;
      }
    }

    // Use native indexOf if available
    if (systemIndexOf && targetArray.indexOf === systemIndexOf) return targetArray.indexOf(searchItem, isSortedFlag);

    // Fallback to manual iteration
    for (; currentIdx < arrayLen; currentIdx++) {
      if (targetArray[currentIdx] === searchItem) return currentIdx;
    }
    return -1;
  };

  // A simple identity function that returns its input
  DataVault.passthroughValue = function(value) {
    return value;
  };

  // Determines the correct insertion point for an element in a sorted array
  DataVault.getSortedInsertionPoint = function(dataArr, elementToInsert, comparisonFn, boundContext) {
    comparisonFn = comparisonFn == null ? DataVault.passthroughValue : lookupIterator(comparisonFn); // Ensure a valid iterator
    const elementValue = comparisonFn.call(boundContext, elementToInsert);

    let startIndex = 0;
    let endIndex = dataArr.length;

    while (startIndex < endIndex) {
      const middlePoint = (startIndex + endIndex) >>> 1; // Faster integer division
      if (comparisonFn.call(boundContext, dataArr[middlePoint]) < elementValue) {
        startIndex = middlePoint + 1;
      } else {
        endIndex = middlePoint;
      }
    }
    return startIndex;
  };

  // Checks if any element in a collection satisfies a predicate
  const checkExistence = DataVault.checkAny = DataVault.testSome = function(inputSet, testFunction, functionContext) {
    testFunction || (testFunction = DataVault.passthroughValue); // Default to identity function
    let testResult = false;
    if (inputSet == null) return testResult;

    // Use native some if available
    if (systemSome && inputSet.some === systemSome) return inputSet.some(testFunction, functionContext);

    // Iterate and check
    processItems(inputSet, function(currentItem, currentIndex, entireList) {
      if (testResult || (testResult = testFunction.call(functionContext, currentItem, currentIndex, entireList))) return terminationSignal;
    });
    return !!testResult; // Return boolean result
  };

  // Filters a collection based on a predicate function
  DataVault.filterElements = DataVault.selectMatching = function(sourceSet, predicateFn, thisArg) {
    const filteredSet = [];
    if (sourceSet == null) return filteredSet;

    // Use native filter if available
    if (systemFilter && sourceSet.filter === systemFilter) return sourceSet.filter(predicateFn, thisArg);

    // Manual filtering
    processItems(sourceSet, function(currentItem, currentIndex, entireList) {
      if (predicateFn.call(thisArg, currentItem, currentIndex, entireList)) filteredSet[filteredSet.length] = currentItem;
    });
    return filteredSet;
  };

  // Queries a collection for objects matching specific properties
  DataVault.queryByProperties = function(dataObjects, propertyCriteria, returnSingle) {
    if (DataVault.isCollectionEmpty(propertyCriteria)) return returnSingle ? null : [];

    // Use find or filter based on 'returnSingle' flag
    return DataVault[returnSingle ? 'locateSingle' : 'filterElements'](dataObjects, function(currentObject) {
      for (const propertyName in propertyCriteria) {
        if (propertyCriteria[propertyName] !== currentObject[propertyName]) return false;
      }
      return true;
    });
  };

  // Finds the first element in a collection that satisfies a predicate
  DataVault.locateSingle = DataVault.detectOne = function(searchSource, matchCallback, callbackScope) {
    let foundItem;
    checkExistence(searchSource, function(currentItem, currentIndex, entireList) {
      if (matchCallback.call(callbackScope, currentItem, currentIndex, entireList)) {
        foundItem = currentItem;
        return true; // Stop iteration
      }
    });
    return foundItem;
  };

  // Checks if an object has a specified property directly (not inherited)
  DataVault.ownsProperty = function(targetObj, propKey) {
    return objHasOwnMethod.call(targetObj, propKey);
  };

  // Merges properties from source objects into a destination object
  DataVault.mergeObjects = function(destinationObj) {
    processItems(arrSliceMethod.call(arguments, 1), function(sourceObject) {
      if (sourceObject) {
        for (const propertyIdentifier in sourceObject) {
          destinationObj[propertyIdentifier] = sourceObject[propertyIdentifier];
        }
      }
    });
    return destinationObj;
  };

  // Transforms each element in a collection using a callback function
  DataVault.transformCollection = DataVault.collectTransformed = function(inputCollection, transformationFn, transformationContext) {
    const mappedResults = [];
    if (inputCollection == null) return mappedResults;

    // Use native map if available
    if (systemMap && inputCollection.map === systemMap) return inputCollection.map(transformationFn, transformationContext);

    // Manual mapping
    processItems(inputCollection, function(currentItem, currentIndex, entireList) {
      mappedResults[mappedResults.length] = transformationFn.call(transformationContext, currentItem, currentIndex, entireList);
    });
    return mappedResults;
  };

  // Returns the number of elements in a collection
  DataVault.getElementCount = function(targetEntity) {
    if (targetEntity == null) return 0;
    return (targetEntity.length === +targetEntity.length) ? targetEntity.length : DataVault.retrieveObjectKeys(targetEntity).length;
  };

  // Retrieves all enumerable property names of an object
  DataVault.retrieveObjectKeys = systemObjectKeys || function(inputObj) {
    if (inputObj !== Object(inputObj)) throw new TypeError('Invalid object provided');
    const objectPropertyNames = [];
    for (const propKey in inputObj) {
      if (DataVault.ownsProperty(inputObj, propKey)) objectPropertyNames[objectPropertyNames.length] = propKey;
    }
    return objectPropertyNames;
  };

  // Finds the maximum value in a collection
  DataVault.getMaximumValue = function(valueCollection, valueExtractor, extractorContext) {
    if (!valueExtractor && DataVault.isArrayType(valueCollection) && valueCollection[0] === +valueCollection[0] && valueCollection.length < 65535) {
      return Math.max.apply(Math, valueCollection);
    }
    if (!valueExtractor && DataVault.isCollectionEmpty(valueCollection)) return -Infinity;

    let resultContainer = {
      calculatedResult: -Infinity,
      actualValue: -Infinity
    };

    processItems(valueCollection, function(currentItem, currentIndex, entireList) {
      const calculatedResult = valueExtractor ? valueExtractor.call(extractorContext, currentItem, currentIndex, entireList) : currentItem;
      if (calculatedResult >= resultContainer.calculatedResult) {
        resultContainer = {
          actualValue: currentItem,
          calculatedResult: calculatedResult
        };
      }
    });
    return resultContainer.actualValue;
  };

  // Checks if a given data structure is empty
  DataVault.isCollectionEmpty = function(dataStructure) {
    if (dataStructure == null) return true;
    if (DataVault.isArrayType(dataStructure) || DataVault.isStringType(dataStructure)) return dataStructure.length === 0;
    for (const propName in dataStructure) {
      if (DataVault.ownsProperty(dataStructure, propName)) return false;
    }
    return true;
  };

  // Determines if an object is an array
  DataVault.isArrayType = systemIsArray || function(dataStructure) {
    return objToStringMethod.call(dataStructure) === '[object Array]';
  };

  // Determines if an object is a string
  DataVault.isStringType = function(dataStructure) {
    return objToStringMethod.call(dataStructure) === '[object String]';
  };

  // --- Database Management Functions ---

  // Resets and clears all DataVault collections
  DataVault.resetDataStore = DataVault.clearAll = function() {
    let persistedDbState = localStorage.getItem('DataVault_Storage');
    if (persistedDbState) {
      persistedDbState = JSON.parse(persistedDbState);
      DataVault.processItems(persistedDbState, function(collName) {
        localStorage.removeItem('DataVault_Collection_' + collName);
      });
      localStorage.setItem('DataVault_Storage', '[]');
    }
    DataVault.storedSets = []; // Clear in-memory collection list
  };

  // Returns a list of all existing collection names
  DataVault.listCollections = function() {
    return DataVault.storedSets;
  };

  // --- Document (Item) Definition ---
  // Represents a single document within a collection
  const DocumentEntry = DataVault.DocumentEntry = function(parentCollectionName, initialData) {
    const instanceRef = this;
    instanceRef._parentCollection = parentCollectionName;
    DataVault.mergeObjects(instanceRef, initialData); // Assign initial fields
  };

  // Saves the current document state to local storage
  DocumentEntry.prototype.saveRecord = function() {
    const instanceRef = this;
    let existingRecords;

    existingRecords = localStorage.getItem('DataVault_Collection_' + instanceRef._parentCollection);

    if (existingRecords) {
      existingRecords = JSON.parse(existingRecords);
    } else {
      existingRecords = []; // Initialize if no records exist
    }

    if (instanceRef._recordId) {
      // Update existing record if _recordId is present
      if (existingRecords.length) {
        const recordToUpdate = DataVault.locateSingle(existingRecords, function(docItem) {
          return docItem._recordId === instanceRef._recordId;
        });
        if (recordToUpdate) {
          DataVault.processItems(instanceRef, function(currentFieldVal, fieldKey) {
            if (fieldKey !== '_parentCollection') {
              if (instanceRef[fieldKey] !== undefined) {
                recordToUpdate[fieldKey] = instanceRef[fieldKey];
              }
            }
          });
        }
      }
    } else {
      // Create new record with a unique ID
      instanceRef._recordId = DataVault.createUniqueId();
      existingRecords.push(instanceRef);
    }

    localStorage.setItem('DataVault_Collection_' + instanceRef._parentCollection, JSON.stringify(existingRecords));

    // Execute any provided callback functions
    DataVault.processItems(arguments, function(callbackFn) {
      if (typeof callbackFn === 'function') {
        return callbackFn();
      }
    });
  };

  // Deletes the current document from its collection
  DocumentEntry.prototype.removeRecord = function() {
    const instanceRef = this;
    let storedCollectionData = localStorage.getItem('DataVault_Collection_' + instanceRef._parentCollection);

    if (storedCollectionData) {
      storedCollectionData = JSON.parse(storedCollectionData);
      const filteredRecords = DataVault.filterElements(storedCollectionData, function(docItem) {
        return docItem._recordId !== instanceRef._recordId;
      });
      localStorage.setItem('DataVault_Collection_' + instanceRef._parentCollection, JSON.stringify(filteredRecords));
    }

    // Execute any provided callback functions
    DataVault.processItems(arguments, function(callbackFn) {
      if (typeof callbackFn === 'function') {
        return callbackFn();
      }
    });
  };

  // --- Collection Definition ---
  // Manages a group of documents
  const DataCollection = DataVault.DataCollection = function(collectionIdentifier) {
    const instanceRef = this;
    let collectionData;

    instanceRef.identifier = collectionIdentifier;

    collectionData = localStorage.getItem('DataVault_Collection_' + collectionIdentifier);

    if (collectionData) {
      instanceRef.records = JSON.parse(collectionData);
    } else {
      instanceRef.records = []; // Initialize empty collection
      localStorage.setItem('DataVault_Collection_' + collectionIdentifier, '[]');
    }

    // Add collection name to the master list if not already present
    const collectionExists = DataVault.locateSingle(DataVault.storedSets, function(nameItem) {
      return nameItem === collectionIdentifier;
    });
    if (!collectionExists) {
      DataVault.storedSets.push(collectionIdentifier);
      localStorage.setItem('DataVault_Storage', JSON.stringify(DataVault.storedSets));
    }
  };

  // Retrieves documents from the collection based on criteria
  DataCollection.prototype.retrieve = function() {
    const instanceRef = this;
    let foundDocuments = [];

    // Refresh records from local storage
    instanceRef.records = JSON.parse(localStorage.getItem('DataVault_Collection_' + instanceRef.identifier));

    if (instanceRef.records.length && typeof arguments[0] === 'object' && DataVault.getElementCount(arguments[0])) {
      // Filter by provided attributes
      const matchedItems = DataVault.queryByProperties(instanceRef.records, arguments[0]);
      if (matchedItems.length) {
        foundDocuments = DataVault.transformCollection(matchedItems, function(docItem) {
          return new DocumentEntry(instanceRef.identifier, docItem);
        });
      }
    } else {
      // Return all documents if no criteria or empty criteria
      foundDocuments = DataVault.transformCollection(instanceRef.records, function(docItem) {
        return new DocumentEntry(instanceRef.identifier, docItem);
      });
    }

    // Execute any provided callback functions
    DataVault.processItems(arguments, function(callbackFn) {
      if (typeof callbackFn === 'function') {
        return callbackFn(foundDocuments);
      }
    });
  };

  // Stores new documents or saves the current collection state
  DataCollection.prototype.store = function() {
    const instanceRef = this;
    let newDocument; // To hold the newly created DocumentEntry

    if (!arguments[0]) {
      // Save the entire collection if no arguments provided
      localStorage.setItem('DataVault_Collection_' + instanceRef.identifier, JSON.stringify(instanceRef.records));
    } else {
      if (arguments[0].length) {
        // Handle an array of documents to save
        DataVault.processItems(arguments[0], function(incomingItem) {
          incomingItem._recordId = DataVault.createUniqueId();
          newDocument = new DocumentEntry(instanceRef.identifier, incomingItem);
          instanceRef.records.push(newDocument);
        });
      } else {
        // Handle a single document to save
        arguments[0]._recordId = DataVault.createUniqueId();
        newDocument = new DocumentEntry(instanceRef.identifier, arguments[0]);
        instanceRef.records.push(newDocument);
      }

      localStorage.setItem('DataVault_Collection_' + instanceRef.identifier, JSON.stringify(instanceRef.records));

      // Execute any provided callback functions, passing the new document
      DataVault.processItems(arguments, function(callbackFn) {
        if (typeof callbackFn === 'function') {
          return callbackFn(newDocument);
        }
      });
    }
  };

  // Modifies existing documents in the collection
  DataCollection.prototype.modify = function() {
    const instanceRef = this;
    const performUpsert = DataVault.locateSingle(arguments, function(argOption) {
      return argOption && argOption.upsert;
    });

    instanceRef.records = JSON.parse(localStorage.getItem('DataVault_Collection_' + instanceRef.identifier));

    const queryObject = arguments[0];
    const updateObject = arguments[1];

    const matchedDocuments = DataVault.queryByProperties(instanceRef.records, queryObject);

    if (DataVault.getElementCount(matchedDocuments)) {
      DataVault.processItems(matchedDocuments, function(docItem) {
        DataVault.processItems(updateObject, function(newValue, propertyKey) {
          docItem[propertyKey] = newValue;
        });
        // Re-wrap the updated item as a DocumentEntry if needed, though not strictly required for local storage
        // docItem = new DocumentEntry(instanceRef.identifier, docItem);
      });
      instanceRef.store(); // Save changes to local storage
    } else if (performUpsert) {
      // If no document found and upsert is true, create a new document
      instanceRef.store(updateObject);
    }

    // Execute any provided callback functions
    DataVault.processItems(arguments, function(callbackFn) {
      if (typeof callbackFn === 'function') {
        return callbackFn(matchedDocuments || []);
      }
    });
  };

  // Erases documents from the collection based on criteria
  DataCollection.prototype.erase = function() {
    const instanceRef = this;
    const itemsToDelete = DataVault.queryByProperties(instanceRef.records, arguments[0]);

    DataVault.processItems(itemsToDelete, function(docToDelete) {
      instanceRef.records.splice(DataVault.findIndexOf(instanceRef.records, docToDelete), 1);
    });

    instanceRef.store(); // Save the modified collection

    // Execute any provided callback functions
    DataVault.processItems(arguments, function(callbackFn) {
      if (typeof callbackFn === 'function') {
        return callbackFn();
      }
    });
  };

  // Empties the entire collection of all its documents
  DataCollection.prototype.emptyCollection = function() {
    const instanceRef = this;
    this.records = []; // Clear in-memory records
    localStorage.setItem('DataVault_Collection_' + instanceRef.identifier, '[]'); // Clear local storage
  };

})(this);