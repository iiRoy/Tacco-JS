(function() {
  // Ensure Date.now is available for consistent timestamp retrieval
  if (!Date.now) {
    Date.now = function() {
      return +new Date(); // Return current timestamp
    };
  }

  // Feature detection for CSSStyleDeclaration.setProperty behavior
  try {
    document.createElement("section").style.setProperty("visibility", "hidden", null);
  } catch (errorInstance) {
    // If setting property with null priority fails, polyfill setProperty
    var visualDeclarationPrototype = CSSStyleDeclaration.prototype,
      visualDeclarationSetProp = visualDeclarationPrototype.setProperty; // Cache original method
    visualDeclarationPrototype.setProperty = function(propName, propVal, impFlag) {
      // Convert value to string for compatibility, then call original method
      visualDeclarationSetProp.call(this, propName, String(propVal), impFlag);
    };
  }

  // Initialize a global utility object, providing version information
  myLib = {
    release: "2.9.5-beta"
  }; // Semantic version string for library

  // Utility function to extend a constructor's prototype with new properties
  function extendConstructor(constructorFunc, newProperties) {
    try {
      for (var propIdentifier in newProperties) {
        Object.defineProperty(constructorFunc.prototype, propIdentifier, {
          value: newProperties[propIdentifier],
          enumerable: false // Make properties non-enumerable by default
        });
      }
    } catch (errorObject) {
      // Fallback for older environments that lack Object.defineProperty
      constructorFunc.prototype = newProperties;
    }
  }

  var collectionConverter = convertToArraySlice; // Default method for array-like object conversion

  // Creates a new true Array by iterating and copying elements from an array-like object
  function copyCollectionElements(arrayLikeObject) {
    var idx = -1,
      itemCount = arrayLikeObject.length,
      resultArray = [];
    while (++idx < itemCount) {
      resultArray.push(arrayLikeObject[idx]);
    }
    return resultArray;
  }

  // Creates a new true Array using Array.prototype.slice from an array-like object
  function convertToArraySlice(arrayLikeObject) {
    return Array.prototype.slice.call(arrayLikeObject);
  }

  // Test environment for array conversion: checks if NodeList can be sliced
  try {
    collectionConverter(document.documentElement.childNodes)[0].nodeType;
  } catch (conversionError) {
    // If native slice fails on NodeList, use the element-by-element copy method
    collectionConverter = copyCollectionElements;
  }

  // Determines the most appropriate method to extend array-like objects
  var arrayLikeExtender = [].__proto__ ?

    // Modern approach: Directly set the __proto__ for prototype chain extension
    function(targetArr, sourcePrototype) {
      targetArr.__proto__ = sourcePrototype;
    } :

    // Legacy approach: Manually copy each property from the source prototype
    function(targetArr, sourcePrototype) {
      for (var protoProp in sourcePrototype) targetArr[protoProp] = sourcePrototype[protoProp];
    };

  // Creates a new map-like object from a plain JavaScript object
  myLib.dictionary = function(inputObject) {
    var dataStore = new CustomDataStructure();
    for (var objectKey in inputObject) {
      dataStore.place(objectKey, inputObject[objectKey]);
    }
    return dataStore;
  };

  function CustomDataStructure() {} // Constructor for our custom key-value map

  // Extend the CustomDataStructure prototype with map-like methods
  extendConstructor(CustomDataStructure, {
    // Checks if a key exists in the custom map
    hasItem: function(lookupKey) {
      return mapInternalPrefix + lookupKey in this;
    },
    // Retrieves the value associated with a key
    getItem: function(lookupKey) {
      return this[mapInternalPrefix + lookupKey];
    },
    // Stores a key-value pair in the map
    place: function(itemKey, itemValue) {
      return this[mapInternalPrefix + itemKey] = itemValue;
    },
    // Removes a key-value pair from the map
    deleteItem: function(itemKey) {
      itemKey = mapInternalPrefix + itemKey;
      return itemKey in this && delete this[itemKey];
    },
    // Returns an array containing all keys present in the map
    listKeys: function() {
      var allKeys = [];
      this.iterate(function(k) {
        allKeys.push(k);
      });
      return allKeys;
    },
    // Returns an array containing all values present in the map
    listValues: function() {
      var allValues = [];
      this.iterate(function(k, v) {
        allValues.push(v);
      });
      return allValues;
    },
    // Returns an array of objects, each containing a key and its value
    listEntries: function() {
      var allEntries = [];
      this.iterate(function(k, v) {
        allEntries.push({
          keyId: k,
          valData: v
        });
      });
      return allEntries;
    },
    // Iterates over each key-value pair, calling a callback function
    iterate: function(callbackFunc) {
      for (var mappedKey in this) {
        // Check if the key belongs to the map (and not the prototype chain)
        if (mappedKey.charCodeAt(0) === mapInternalPrefixCharCode) {
          callbackFunc.call(this, mappedKey.substring(1), this[mappedKey]);
        }
      }
    }
  });

  var mapInternalPrefix = "\u0001", // A unique character to prevent key collisions with built-in properties
    mapInternalPrefixCharCode = mapInternalPrefix.charCodeAt(0); // Character code for efficient lookup

  // Simple function that returns its input argument unchanged
  function returnSelf(inputDatum) {
    return inputDatum;
  }

  // Function that returns the 'this' context it was called with
  function provideThis() {
    return this;
  }

  // Function that always returns the boolean value `true`
  function returnAlwaysTrue() {
    return true;
  }

  // Converts a value into a function that returns that value, if it's not already a function
  function createValueFunction(inputVal) {
    return typeof inputVal === "function" ? inputVal : function() {
      return inputVal;
    };
  }

  myLib.valueAdapter = createValueFunction; // Expose the value adapter utility

  // Copies a variable number of methods from a source object to a target object,
  // ensuring the 'this' context is correctly bound for the source.
  myLib.forwardMethods = function(destinationObj, sourceObj) {
    var argIndex = 1,
      totalArgs = arguments.length,
      currentMethod;
    while (++argIndex < totalArgs) {
      destinationObj[currentMethod = arguments[argIndex]] = bindMethodToSource(destinationObj, sourceObj, sourceObj[currentMethod]);
    }
    return destinationObj;
  };

  // Internal helper to bind a method to its source object, handling getter-setter patterns.
  // If no arguments are passed, it acts as a getter; otherwise, a setter returning the target.
  function bindMethodToSource(destObject, srcObject, originalMethod) {
    return function() {
      var returnedVal = originalMethod.apply(srcObject, arguments);
      return arguments.length ? destObject : returnedVal;
    };
  }

  // A comparison function for sorting in ascending order
  myLib.sortAsc = function(valA, valB) {
    return valA < valB ? -1 : valA > valB ? 1 : valA >= valB ? 0 : NaN;
  };

  // A comparison function for sorting in descending order
  myLib.sortDesc = function(valA, valB) {
    return valB < valA ? -1 : valB > valA ? 1 : valB >= valA ? 0 : NaN;
  };

  // Calculates the mean (average) of numerical values in an array.
  // An optional valueAccessor function can be provided to extract numbers.
  myLib.calculateMean = function(inputList, valueAccessor) {
    var listLength = inputList.length,
      currentValue,
      sumAccumulator = 0,
      listIndex = -1,
      validCount = 0;
    if (arguments.length === 1) {
      while (++listIndex < listLength)
        if (isNumeric(currentValue = inputList[listIndex])) sumAccumulator += (currentValue - sumAccumulator) / ++validCount;
    } else {
      while (++listIndex < listLength)
        if (isNumeric(currentValue = valueAccessor.call(inputList, inputList[listIndex], listIndex))) sumAccumulator += (currentValue - sumAccumulator) / ++validCount;
    }
    return validCount ? sumAccumulator : undefined;
  };

  // Calculates the median of numerical values in an array.
  // An optional valueAccessor function can be provided to transform elements before calculation.
  myLib.calculateMedian = function(inputList, valueAccessor) {
    if (arguments.length > 1) inputList = inputList.map(valueAccessor);
    inputList = inputList.filter(isNumeric); // Filter out non-numeric values
    return inputList.length ? myLib.findQuantile(inputList.sort(myLib.sortAsc), 0.5) : undefined;
  };

  // Finds the minimum numerical value in an array.
  // An optional valueAccessor function can be provided to extract numbers.
  myLib.findMin = function(inputList, valueAccessor) {
    var listIndex = -1,
      listLength = inputList.length,
      elementA,
      elementB;
    if (arguments.length === 1) {
      while (++listIndex < listLength && ((elementA = inputList[listIndex]) == null || elementA != elementA)) elementA = undefined;
      while (++listIndex < listLength)
        if ((elementB = inputList[listIndex]) != null && elementA > elementB) elementA = elementB;
    } else {
      while (++listIndex < listLength && ((elementA = valueAccessor.call(inputList, inputList[listIndex], listIndex)) == null || elementA != elementA)) elementA = undefined;
      while (++listIndex < listLength)
        if ((elementB = valueAccessor.call(inputList, inputList[listIndex], listIndex)) != null && elementA > elementB) elementA = elementB;
    }
    return elementA;
  };

  // Finds the maximum numerical value in an array.
  // An optional valueAccessor function can be provided to extract numbers.
  myLib.findMax = function(inputList, valueAccessor) {
    var listIndex = -1,
      listLength = inputList.length,
      elementA,
      elementB;
    if (arguments.length === 1) {
      while (++listIndex < listLength && ((elementA = inputList[listIndex]) == null || elementA != elementA)) elementA = undefined;
      while (++listIndex < listLength)
        if ((elementB = inputList[listIndex]) != null && elementB > elementA) elementA = elementB;
    } else {
      while (++listIndex < listLength && ((elementA = valueAccessor.call(inputList, inputList[listIndex], listIndex)) == null || elementA != elementA)) elementA = undefined;
      while (++listIndex < listLength)
        if ((elementB = valueAccessor.call(inputList, inputList[listIndex], listIndex)) != null && elementB > elementA) elementA = elementB;
    }
    return elementA;
  };

  // Finds both the minimum and maximum numerical values (the extent) in an array.
  // Returns an array `[min, max]`.
  myLib.findExtent = function(inputList, valueAccessor) {
    var listIndex = -1,
      listLength = inputList.length,
      currentMin,
      currentVal,
      currentMax;
    if (arguments.length === 1) {
      while (++listIndex < listLength && ((currentMin = currentMax = inputList[listIndex]) == null || currentMin != currentMin)) currentMin = currentMax = undefined;
      while (++listIndex < listLength)
        if ((currentVal = inputList[listIndex]) != null) {
          if (currentMin > currentVal) currentMin = currentVal;
          if (currentMax < currentVal) currentMax = currentVal;
        }
    } else {
      while (++listIndex < listLength && ((currentMin = currentMax = valueAccessor.call(inputList, inputList[listIndex], listIndex)) == null || currentMin != currentMin)) currentMin = undefined;
      while (++listIndex < listLength)
        if ((currentVal = valueAccessor.call(inputList, inputList[listIndex], listIndex)) != null) {
          if (currentMin > currentVal) currentMin = currentVal;
          if (currentMax < currentVal) currentMax = currentVal;
        }
    }
    return [currentMin, currentMax];
  };

  // Provides functions for generating various types of random numbers.
  myLib.randomGenerators = {
    // Generates random numbers following a normal (Gaussian) distribution.
    // Uses the Box-Muller transform.
    normalDistribution: function(average, stdDev) {
      if (arguments.length < 2) stdDev = 1.0; // Default standard deviation
      if (arguments.length < 1) average = 0.0; // Default mean
      return function() {
        var valX, valY, radiusSquared;
        do {
          valX = Math.random() * 2 - 1; // Random number in [-1, 1)
          valY = Math.random() * 2 - 1; // Random number in [-1, 1)
          radiusSquared = valX * valX + valY * valY; // Squared distance from origin
        } while (!radiusSquared || radiusSquared > 1); // Ensure point is within unit circle
        // Apply Box-Muller transform
        return average + stdDev * valX * Math.sqrt(-2 * Math.log(radiusSquared) / radiusSquared);
      };
    }
  };

  // Helper function to determine if a value is a valid number (not null/undefined, not NaN)
  function isNumeric(valueToCheck) {
    return valueToCheck != null && !isNaN(valueToCheck);
  }

  // Calculates the sum of numerical values in an array.
  // An optional valueAccessor function can be provided to extract numbers.
  myLib.calculateSum = function(inputList, valueAccessor) {
    var totalSum = 0.0,
      listLength = inputList.length,
      currentNum,
      listIndex = -1;

    if (arguments.length === 1) {
      while (++listIndex < listLength)
        if (!isNaN(currentNum = +inputList[listIndex])) totalSum += currentNum;
    } else {
      while (++listIndex < listLength)
        if (!isNaN(currentNum = +valueAccessor.call(inputList, inputList[listIndex], listIndex))) totalSum += currentNum;
    }

    return totalSum;
  };

  // Computes the R-7 quantile for a sorted array of numerical values.
  // The 'percentile' parameter should be between 0 and 1.
  myLib.findQuantile = function(sortedValues, percentile) {
    var H_value = (sortedValues.length - 1) * percentile + 1,
      h_floor = Math.floor(H_value),
      val_v = sortedValues[h_floor - 1],
      remainder_e = H_value - h_floor;
    return remainder_e ? val_v + remainder_e * (sortedValues[h_floor] - val_v) : val_v;
  };

  // Transposes a matrix (swaps its rows and columns).
  // Expects an array of arrays where inner arrays are rows.
  myLib.matrixTranspose = function(inputMatrix) {
    return myLib.combineArrays.apply(myLib, inputMatrix);
  };

  // Combines multiple arrays into a single array of tuples (zipping).
  // E.g., combineArrays([1,2],[a,b]) -> [[1,a],[2,b]]
  myLib.combineArrays = function() {
    var numArrays;
    if (!(numArrays = arguments.length)) return []; // Return empty if no arrays provided
    for (var outerIndex = -1,
        minLen = myLib.findMin(arguments, getArrayLength), // Find the length of the shortest array
        zippedResults = new Array(minLen); ++outerIndex < minLen;) {
      for (var innerIndex = -1, innerNumArrays, currentZip = zippedResults[outerIndex] = new Array(numArrays); ++innerIndex < numArrays;) {
        currentZip[innerIndex] = arguments[innerIndex][outerIndex];
      }
    }
    return zippedResults;
  };

  // Helper function to return the length property of an object (assumed array-like)
  function getArrayLength(dataItem) {
    return dataItem.length;
  }

  // Creates a bisector object with methods to find insertion points in sorted arrays.
  // An optional accessorFunction can be used to extract comparable values from array elements.
  myLib.createBisector = function(accessorFunction) {
    return {
      // Finds the insertion point for `searchVal` in `arr` to maintain sorted order.
      // If `searchVal` is present, returns the index of the leftmost occurrence.
      findLeft: function(arr, searchVal, lowIdx, highIdx) {
        if (arguments.length < 3) lowIdx = 0;
        if (arguments.length < 4) highIdx = arr.length;
        while (lowIdx < highIdx) {
          var middleIdx = (lowIdx + highIdx) >>> 1; // Efficient integer division
          if (accessorFunction.call(arr, arr[middleIdx], middleIdx) < searchVal) lowIdx = middleIdx + 1;
          else highIdx = middleIdx;
        }
        return lowIdx;
      },
      // Finds the insertion point for `searchVal` in `arr` to maintain sorted order.
      // If `searchVal` is present, returns the index immediately after the rightmost occurrence.
      findRight: function(arr, searchVal, lowIdx, highIdx) {
        if (arguments.length < 3) lowIdx = 0;
        if (arguments.length < 4) highIdx = arr.length;
        while (lowIdx < highIdx) {
          var middleIdx = (lowIdx + highIdx) >>> 1; // Efficient integer division
          if (searchVal < accessorFunction.call(arr, arr[middleIdx], middleIdx)) highIdx = middleIdx;
          else lowIdx = middleIdx + 1;
        }
        return lowIdx;
      }
    };
  };

  var identityBisector = myLib.createBisector(function(dataElement) {
    return dataElement;
  }); // A bisector instance for arrays of primitive values
  myLib.insertLeft = identityBisector.findLeft; // Expose the findLeft method
  myLib.insert = myLib.insertRight = identityBisector.findRight; // Expose findRight and an alias 'insert'

  // Finds the first element in an array based on a comparison function.
  // If no comparison function is provided, it uses ascending order.
  myLib.findFirst = function(inputList, comparisonFunc) {
    var currentIdx = 0,
      listSize = inputList.length,
      bestElement = inputList[0],
      testElement;
    if (arguments.length === 1) comparisonFunc = myLib.sortAsc;
    while (++currentIdx < listSize) {
      if (comparisonFunc.call(inputList, bestElement, testElement = inputList[currentIdx]) > 0) {
        bestElement = testElement;
      }
    }
    return bestElement;
  };

  // Finds the last element in an array based on a comparison function.
  // If no comparison function is provided, it uses ascending order.
  myLib.findLast = function(inputList, comparisonFunc) {
    var currentIdx = 0,
      listSize = inputList.length,
      bestElement = inputList[0],
      testElement;
    if (arguments.length === 1) comparisonFunc = myLib.sortAsc;
    while (++currentIdx < listSize) {
      if (comparisonFunc.call(inputList, bestElement, testElement = inputList[currentIdx]) <= 0) {
        bestElement = testElement;
      }
    }
    return bestElement;
  };

  // Creates a data grouping mechanism, similar to SQL's GROUP BY.
  // Allows defining multiple grouping keys, sorting, and aggregation.
  myLib.dataGrouper = function() {
    var groupProcessor = {},
      groupingKeys = [], // Functions to extract keys for grouping
      keySorters = [], // Functions to sort keys at each level
      valueSorter, // Function to sort leaf values
      aggregationFunction; // Function to apply to the innermost groups

    // Recursively processes the data to create a nested map structure
    function processGroupMap(dataCollection, level) {
      // Base case: If all grouping levels are processed, apply aggregation or sort leaf values
      if (level >= groupingKeys.length) return aggregationFunction ?
        aggregationFunction.call(groupProcessor, dataCollection) :
        (valueSorter ? dataCollection.sort(valueSorter) : dataCollection);

      var dataIdx = -1,
        totalDataItems = dataCollection.length,
        currentKeyFunc = groupingKeys[level++], // Get key function for current level
        currentKeyValue,
        dataObject,
        subGroups = new CustomDataStructure(), // Use custom map for current level's groups
        subGroupItems,
        outputMap = {}; // Resulting map for this level

      // Group items by the current key function
      while (++dataIdx < totalDataItems) {
        if (subGroupItems = subGroups.getItem(currentKeyValue = currentKeyFunc(dataObject = dataCollection[dataIdx]))) {
          subGroupItems.push(dataObject);
        } else {
          subGroups.place(currentKeyValue, [dataObject]);
        }
      }

      // Recursively process each subgroup
      subGroups.iterate(function(keyName) {
        outputMap[keyName] = processGroupMap(subGroups.getItem(keyName), level);
      });

      return outputMap;
    }

    // Recursively converts the nested map structure into an array of entries
    function processGroupEntries(groupMap, level) {
      if (level >= groupingKeys.length) return groupMap; // Base case: return leaf values/aggregated result

      var entryList = [],
        currentKeySorter = keySorters[level++], // Get key sorter for current level
        mapProp;

      // Convert map properties to entry objects
      for (mapProp in groupMap) {
        entryList.push({
          groupKey: mapProp,
          groupValues: processGroupEntries(groupMap[mapProp], level)
        });
      }

      // Apply key sorting if defined for this level
      if (currentKeySorter) entryList.sort(function(itemA, itemB) {
        return currentKeySorter(itemA.groupKey, itemB.groupKey);
      });

      return entryList;
    }

    // Public method to group data into a nested map structure
    groupProcessor.asMap = function(dataCollection) {
      return processGroupMap(dataCollection, 0);
    };

    // Public method to group data and return as an array of nested entries
    groupProcessor.asEntries = function(dataCollection) {
      return processGroupEntries(processGroupMap(dataCollection, 0), 0);
    };

    // Adds a key function to define a new grouping level
    groupProcessor.addKey = function(keyFunction) {
      groupingKeys.push(keyFunction);
      return groupProcessor;
    };

    // Sets a custom sorting function for the most recently added key.
    // This sorting is applied only when generating 'entries' output.
    groupProcessor.setKeySorter = function(sorterFunction) {
      keySorters[groupingKeys.length - 1] = sorterFunction;
      return groupProcessor;
    };

    // Defines a sorting function for the leaf values within each group.
    // This applies to both 'asMap' and 'asEntries' outputs.
    groupProcessor.setValueSorter = function(sorterFunction) {
      valueSorter = sorterFunction;
      return groupProcessor;
    };

    // Sets an aggregation function to be applied to the innermost groups.
    groupProcessor.setAggregation = function(aggregator) {
      aggregationFunction = aggregator;
      return groupProcessor;
    };

    return groupProcessor;
  };

  // Retrieves all enumerable property names (keys) from a given object.
  myLib.getObjectKeys = function(targetObject) {
    var objectKeys = [];
    for (var propName in targetObject) objectKeys.push(propName);
    return objectKeys;
  };

  // Retrieves all enumerable property values from a given object.
  myLib.getObjectValues = function(targetObject) {
    var objectValues = [];
    for (var propName in targetObject) objectValues.push(targetObject[propName]);
    return objectValues;
  };

  // Retrieves all enumerable key-value pairs (entries) from a given object.
  // Each entry is an object with 'propKey' and 'propValue' properties.
  myLib.getObjectEntries = function(targetObject) {
    var objectEntries = [];
    for (var propName in targetObject) objectEntries.push({
      propKey: propName,
      propValue: targetObject[propName]
    });
    return objectEntries;
  };

  // Reorders elements of an `originalArray` based on a list of `newIndexes`.
  // Returns a new array with elements in the specified order.
  myLib.reorderArray = function(originalArray, newIndexes) {
    var reorderedItems = [],
      currentIndex = -1,
      numIndexes = newIndexes.length;
    while (++currentIndex < numIndexes) {
      reorderedItems[currentIndex] = originalArray[newIndexes[currentIndex]];
    }
    return reorderedItems;
  };

  // Merges multiple arrays into a single, flat array.
  // Equivalent to `[].concat(...listOfArrays)`.
  myLib.flattenArrays = function(listOfArrays) {
    return Array.prototype.concat.apply([], listOfArrays);
  };

  // Splits an `inputArray` into multiple sub-arrays based on a `delimiterFn`.
  // A new sub-array starts when the delimiter function returns true.
  myLib.segmentArray = function(inputArray, delimiterFn) {
    var segmentedArrays = [],
      currentSegment = [],
      itemValue,
      itemIndex = -1,
      arrayLength = inputArray.length;
    if (arguments.length < 2) delimiterFn = defaultDelimiter; // Use default if not provided
    while (++itemIndex < arrayLength) {
      if (delimiterFn.call(currentSegment, itemValue = inputArray[itemIndex], itemIndex)) {
        currentSegment = []; // Start a fresh segment
      } else {
        if (!currentSegment.length) segmentedArrays.push(currentSegment); // Add segment to list if it's new
        currentSegment.push(itemValue);
      }
    }
    return segmentedArrays;
  };

  // Default delimiter function for array segmentation: splits on null or undefined values.
  function defaultDelimiter(dataItem) {
    return dataItem == null;
  }

  // Collapses multiple whitespace characters in a string into single spaces
  // and removes leading/trailing whitespace.
  function normalizeWhitespace(inputString) {
    return inputString.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
  }

  // Generates an array of numbers within a specified range, similar to Python's range().
  // `startValue`, `endValue` (exclusive), and `increment` can be specified.
  myLib.generateRange = function(startValue, endValue, increment) {
    if (arguments.length < 3) {
      increment = 1.0; // Default increment
      if (arguments.length < 2) {
        endValue = startValue; // If only one arg, it's the end, start at 0
        startValue = 0.0;
      }
    }
    // Throw an error for ranges that would result in an infinite loop
    if ((endValue - startValue) / increment === Infinity) throw new Error("Range definition results in an infinite sequence.");

    var numberRange = [],
      scaleFactor = getDecimalPrecisionFactor(Math.abs(increment)), // Scale to handle float precision
      loopIndex = -1,
      currentNumber;

    // Scale all values to integers to prevent floating point inaccuracies during iteration
    startValue *= scaleFactor;
    endValue *= scaleFactor;
    increment *= scaleFactor;

    if (increment < 0) {
      while ((currentNumber = startValue + increment * ++loopIndex) > endValue) {
        numberRange.push(currentNumber / scaleFactor);
      }
    } else {
      while ((currentNumber = startValue + increment * ++loopIndex) < endValue) {
        numberRange.push(currentNumber / scaleFactor);
      }
    }
    return numberRange;
  };

  // Calculates a scaling factor to help maintain precision with floating-point numbers
  // when performing arithmetic operations, especially in range generation.
  function getDecimalPrecisionFactor(inputNum) {
    var factor = 1;
    while (inputNum * factor % 1) factor *= 10; // Multiply by 10 until no decimal part remains
    return factor;
  }

  // Escapes special characters in a string so it can be safely used within a regular expression.
  myLib.escapeRegex = function(inputString) {
    return inputString.replace(regexEscapePattern, "\\$&");
  };

  var regexEscapePattern = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g; // Regular expression for special regex characters

  // Rounds a `numberToRound` to a specified number of `decimalPlaces`.
  // If `decimalPlaces` is not provided or 0, rounds to the nearest integer.
  myLib.roundToDecimals = function(numberToRound, decimalPlaces) {
    return decimalPlaces ?
      Math.round(numberToRound * (decimalPlaces = Math.pow(10, decimalPlaces))) / decimalPlaces :
      Math.round(numberToRound);
  };

  // Performs an XMLHttpRequest (XHR) to fetch data from a `resourceUrl`.
  // Supports optional `mimeType` override and requires a `responseHandler` callback.
  myLib.fetchData = function(resourceUrl, mimeType, responseHandler) {
    var httpRequest = new XMLHttpRequest();
    if (arguments.length < 3) responseHandler = mimeType, mimeType = null;
    else if (mimeType && httpRequest.overrideMimeType) httpRequest.overrideMimeType(mimeType);

    httpRequest.open("GET", resourceUrl, true); // Initialize the request

    if (mimeType) httpRequest.setRequestHeader("Accept", mimeType); // Set Accept header if mimeType is specified

    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState === 4) { // Request is complete
        var httpStatus = httpRequest.status;
        // Invoke the callback with the request object if successful, otherwise null
        responseHandler(!httpStatus && httpRequest.response || httpStatus >= 200 && httpStatus < 300 || httpStatus === 304 ? httpRequest : null);
      }
    };
    httpRequest.send(null); // Send the request (no body for GET)
  };
})();