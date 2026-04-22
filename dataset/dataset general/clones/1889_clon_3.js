(function() {
  // Ensure Date.now polyfill for older environments
  if (typeof Date.now === 'undefined') {
    Date.now = function() {
      // Return milliseconds since epoch
      return +new Date();
    };
  }

  // Global object for data visualization utilities
  var dataViz = {
    release: "3.0.0-beta"
  };

  // Attempt to detect and patch a CSSStyleDeclaration.prototype.setProperty bug
  // This block handles cases where setProperty might not correctly coerce values to strings.
  try {
    const testDiv = document.createElement("div");
    testDiv.style.setProperty("test-prop", 0, ""); // Test with a numeric value
    // If no error, assume setProperty works as expected.
  } catch (error) {
    // If an error occurs (e.g., IE < 9), we need to patch setProperty.
    const originalStyleProto = CSSStyleDeclaration.prototype;
    const nativeSetProperty = originalStyleProto.setProperty;

    // Override the setProperty method to ensure value is always a string.
    originalStyleProto.setProperty = function(propName, propValue, propPriority) {
      // Call the original method, converting the value to a string.
      nativeSetProperty.call(this, propName, String(propValue), propPriority);
    };
  }

  // A utility function to extend a constructor's prototype with properties.
  // This handles both modern (defineProperty) and older (direct assignment) browser behaviors.
  function augmentConstructorPrototype(constructorRef, extensionProps) {
    try {
      // Modern approach: Define properties with specific descriptors (non-enumerable by default).
      for (const propKey in extensionProps) {
        Object.defineProperty(constructorRef.prototype, propKey, {
          value: extensionProps[propKey],
          enumerable: false, // Prevents these methods from showing up in 'for...in' loops
          configurable: true // Allows redefining or deleting the property
        });
      }
    } catch (err) {
      // Fallback for older browsers that don't support Object.defineProperty fully on prototypes.
      // Directly assign properties to the prototype. This makes them enumerable.
      constructorRef.prototype = Object.assign(constructorRef.prototype, extensionProps);
      //console.warn("Using fallback prototype extension due to Object.defineProperty limitations.");
    }
  }

  // Array conversion utilities
  // Default to Array.prototype.slice for efficient conversion of array-like objects.
  let convertToArray = function(collection) {
    return Array.prototype.slice.call(collection);
  };

  // Fallback function for array-like object conversion if slice fails or is inappropriate.
  function iterativeArrayCopy(pseudoCollection) {
    const resultArr = [];
    let idx = 0;
    const count = pseudoCollection.length;
    while (idx < count) {
      resultArr.push(pseudoCollection[idx]);
      idx++;
    }
    return resultArr;
  }

  // Feature detection for array-like object conversion:
  // Some environments (like older IE or specific DOM collections) might not allow
  // Array.prototype.slice.call on NodeList or similar objects.
  try {
    // Attempt to slice a simple DOM collection. If it works, 'convertToArray' is fine.
    convertToArray(document.createElement("ul").children);
  } catch (e) {
    // If slicing fails, switch to the iterative copy method.
    convertToArray = iterativeArrayCopy;
  }

  // Utility for extending arrays with custom prototypes (e.g., for method chaining).
  // This uses __proto__ if available, otherwise falls back to direct property assignment.
  const extendArrayProto = ([]).__proto__ ?
    // Modern way: Directly set the prototype chain (faster and more accurate).
    function(targetArray, customPrototype) {
      targetArray.__proto__ = customPrototype;
    } :
    // Fallback: Copy properties manually (less ideal, but works).
    function(targetArray, customPrototype) {
      for (const prop in customPrototype) {
        if (customPrototype.hasOwnProperty(prop)) { // Ensure we only copy own properties
          targetArray[prop] = customPrototype[prop];
        }
      }
    };

  // --- Custom Map Implementation ---
  // A simple map-like object that uses a prefix to avoid key collisions with built-in Object properties.
  function CustomStore() {}

  // A unique prefix character to distinguish map keys from inherited object properties.
  // Using a null character is common as it's unlikely to be a user-supplied key.
  const keyPrefixChar = "\0";
  const keyPrefixCharCode = keyPrefixChar.charCodeAt(0);

  augmentConstructorPrototype(CustomStore, {
    // Checks if a key exists in the map.
    has: function(searchKey) {
      return (keyPrefixChar + searchKey) in this;
    },
    // Retrieves the value associated with a key.
    get: function(searchKey) {
      return this[keyPrefixChar + searchKey];
    },
    // Sets a key-value pair in the map.
    set: function(storeKey, storeValue) {
      this[keyPrefixChar + storeKey] = storeValue;
      return this; // Enable chaining
    },
    // Removes a key-value pair from the map.
    remove: function(deleteKey) {
      const internalKey = keyPrefixChar + deleteKey;
      if (internalKey in this) {
        delete this[internalKey];
        return true;
      }
      return false;
    },
    // Returns an array of all keys in the map.
    keys: function() {
      const allKeys = [];
      this.forEach(function(k) {
        allKeys.push(k);
      });
      return allKeys;
    },
    // Returns an array of all values in the map.
    values: function() {
      const allValues = [];
      this.forEach(function(k, v) {
        allValues.push(v);
      });
      return allValues;
    },
    // Returns an array of all entries ({key, value}) in the map.
    entries: function() {
      const allEntries = [];
      this.forEach(function(k, v) {
        allEntries.push({
          key: k,
          value: v
        });
      });
      return allEntries;
    },
    // Iterates over each key-value pair in the map.
    forEach: function(callbackFn) {
      for (const p in this) {
        // Check if the property starts with our unique prefix and is an own property.
        if (this.hasOwnProperty(p) && p.charCodeAt(0) === keyPrefixCharCode) {
          // Call the callback with the actual key (without prefix) and value.
          callbackFn.call(this, p.substring(1), this[p]);
        }
      }
    }
  });

  // Factory function to create a CustomStore from a plain object.
  dataViz.createMap = function(sourceObject) {
    const newMap = new CustomStore();
    if (sourceObject) { // Add a guard for null/undefined objects
      for (const keyId in sourceObject) {
        // Ensure it's an own property to avoid iterating prototype chain.
        if (sourceObject.hasOwnProperty(keyId)) {
          newMap.set(keyId, sourceObject[keyId]);
        }
      }
    }
    return newMap;
  };


  // --- Core Utility Functions ---

  // Returns the input value itself.
  function passThrough(val) {
    return val;
  }

  // Returns the 'this' context.
  function currentContext() {
    return this;
  }

  // Always returns true.
  function alwaysTrue() {
    return true;
  }

  // Creates a function that returns a constant value, or returns the function itself if already one.
  function createFunctor(inputVal) {
    if (typeof inputVal === "function") {
      return inputVal;
    }
    // Return a new function that always returns the input value.
    return function() {
      return inputVal;
    };
  }
  dataViz.functor = createFunctor;

  // Rebinds methods from a source object to a target object.
  // Useful for creating chainable APIs where methods need to maintain their original context.
  dataViz.rebind = function(targetObj, sourceObj) {
    let argIndex = 2; // Start from the third argument (method names)
    const totalArgs = arguments.length;
    let currentMethodName;

    // Loop through all method names provided as arguments.
    while (argIndex < totalArgs) {
      currentMethodName = arguments[argIndex];
      // Assign the rebound function to the target object.
      targetObj[currentMethodName] = createReboundMethod(targetObj, sourceObj, sourceObj[currentMethodName]);
      argIndex++;
    }
    return targetObj; // Allow chaining
  };

  // Helper for rebind: creates a function that calls the original method with the source context.
  function createReboundMethod(targetObj, sourceObj, originalMethod) {
    // If originalMethod is not a function, return it directly.
    if (typeof originalMethod !== 'function') {
      return originalMethod;
    }
    return function() {
      const methodResult = originalMethod.apply(sourceObj, arguments);
      // If arguments were provided, assume it's a setter and return the target for chaining.
      // Otherwise, it's a getter, so return the method's result.
      return arguments.length ? targetObj : methodResult;
    };
  }

  // --- Comparison and Statistical Functions ---

  // Compares two values for ascending order.
  dataViz.ascending = function(valA, valB) {
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    if (valA === valB) return 0; // Handles equal numbers and strings
    return NaN; // Handles non-comparable types or NaN values
  };

  // Compares two values for descending order.
  dataViz.descending = function(valA, valB) {
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    if (valA === valB) return 0;
    return NaN;
  };

  // Checks if a value is a valid number (not null, undefined, or NaN).
  function isValidNumber(val) {
    return val != null && !isNaN(val);
  }

  // Calculates the mean (average) of an array of numbers.
  // An optional accessor function `fn` can be provided to extract values.
  dataViz.mean = function(dataArray, accessorFn) {
    let totalCount = 0;
    let runningSum = 0;
    let dataLen = dataArray.length;
    let currentVal;
    let idx = -1;

    if (arguments.length === 1) { // No accessor provided
      while (++idx < dataLen) {
        currentVal = dataArray[idx];
        if (isValidNumber(currentVal)) {
          runningSum += (currentVal - runningSum) / (++totalCount);
        }
      }
    } else { // Accessor function provided
      while (++idx < dataLen) {
        currentVal = accessorFn.call(dataArray, dataArray[idx], idx);
        if (isValidNumber(currentVal)) {
          runningSum += (currentVal - runningSum) / (++totalCount);
        }
      }
    }
    // Return mean if values were found, otherwise undefined.
    return totalCount ? runningSum : undefined;
  };

  // Calculates the median of an array of numbers.
  dataViz.median = function(dataArray, accessor) {
    // If an accessor is provided, map the array to its extracted values.
    if (arguments.length > 1) {
      dataArray = dataArray.map(accessor);
    }
    // Filter out non-numeric values.
    dataArray = dataArray.filter(isValidNumber);

    if (!dataArray.length) {
      return undefined; // No valid numbers to calculate median from.
    }

    // Sort the array in ascending order.
    dataArray.sort(dataViz.ascending);

    // Calculate the quantile at 0.5 (median).
    return dataViz.quantile(dataArray, 0.5);
  };

  // Finds the minimum value in an array.
  dataViz.min = function(dataArray, accessor) {
    let minVal;
    let tempVal;
    let arrLength = dataArray.length;
    let currIndex = -1;

    if (arguments.length === 1) { // No accessor
      // Find first valid number to initialize minVal
      while (++currIndex < arrLength) {
        tempVal = dataArray[currIndex];
        if (isValidNumber(tempVal)) {
          minVal = tempVal;
          break;
        }
      }
      // Continue finding minimum
      while (++currIndex < arrLength) {
        tempVal = dataArray[currIndex];
        if (isValidNumber(tempVal) && minVal > tempVal) {
          minVal = tempVal;
        }
      }
    } else { // With accessor
      while (++currIndex < arrLength) {
        tempVal = accessor.call(dataArray, dataArray[currIndex], currIndex);
        if (isValidNumber(tempVal)) {
          minVal = tempVal;
          break;
        }
      }
      while (++currIndex < arrLength) {
        tempVal = accessor.call(dataArray, dataArray[currIndex], currIndex);
        if (isValidNumber(tempVal) && minVal > tempVal) {
          minVal = tempVal;
        }
      }
    }
    return minVal;
  };

  // Finds the maximum value in an array.
  dataViz.max = function(dataArray, accessor) {
    let maxVal;
    let tempVal;
    let arrLength = dataArray.length;
    let currIndex = -1;

    if (arguments.length === 1) { // No accessor
      while (++currIndex < arrLength) {
        tempVal = dataArray[currIndex];
        if (isValidNumber(tempVal)) {
          maxVal = tempVal;
          break;
        }
      }
      while (++currIndex < arrLength) {
        tempVal = dataArray[currIndex];
        if (isValidNumber(tempVal) && maxVal < tempVal) {
          maxVal = tempVal;
        }
      }
    } else { // With accessor
      while (++currIndex < arrLength) {
        tempVal = accessor.call(dataArray, dataArray[currIndex], currIndex);
        if (isValidNumber(tempVal)) {
          maxVal = tempVal;
          break;
        }
      }
      while (++currIndex < arrLength) {
        tempVal = accessor.call(dataArray, dataArray[currIndex], currIndex);
        if (isValidNumber(tempVal) && maxVal < tempVal) {
          maxVal = tempVal;
        }
      }
    }
    return maxVal;
  };

  // Finds both the minimum and maximum values in an array.
  dataViz.extent = function(dataArray, accessor) {
    let currentMin, currentMax;
    let processedVal;
    let arrayLength = dataArray.length;
    let arrayIndex = -1;

    // Find the first valid number to initialize min/max.
    while (++arrayIndex < arrayLength) {
      processedVal = (arguments.length === 1) ? dataArray[arrayIndex] : accessor.call(dataArray, dataArray[arrayIndex], arrayIndex);
      if (isValidNumber(processedVal)) {
        currentMin = currentMax = processedVal;
        break; // Found initial values, exit loop
      }
    }

    // If no valid numbers were found, return [undefined, undefined].
    if (currentMin === undefined) {
      return [undefined, undefined];
    }

    // Continue iterating to find true min and max.
    while (++arrayIndex < arrayLength) {
      processedVal = (arguments.length === 1) ? dataArray[arrayIndex] : accessor.call(dataArray, dataArray[arrayIndex], arrayIndex);
      if (isValidNumber(processedVal)) {
        if (currentMin > processedVal) currentMin = processedVal;
        if (currentMax < processedVal) currentMax = processedVal;
      }
    }
    return [currentMin, currentMax];
  };

  // Sums the values in an array.
  dataViz.sum = function(dataArray, accessor) {
    let totalSum = 0;
    let arrayLen = dataArray.length;
    let currentItem;
    let i = -1;

    if (arguments.length === 1) { // No accessor
      while (++i < arrayLen) {
        currentItem = +dataArray[i]; // Coerce to number
        if (!isNaN(currentItem)) { // Only add if it's a valid number
          totalSum += currentItem;
        }
      }
    } else { // With accessor
      while (++i < arrayLen) {
        currentItem = +accessor.call(dataArray, dataArray[i], i);
        if (!isNaN(currentItem)) {
          totalSum += currentItem;
        }
      }
    }
    return totalSum;
  };

  // Calculates the p-th quantile of a sorted array.
  // Uses the R-7 method (inverse of empirical distribution function with averaging).
  dataViz.quantile = function(sortedValues, prob) {
    const arrLen = sortedValues.length;
    if (!arrLen) return undefined; // No values, no quantile.

    // Calculate the index for the quantile.
    const hIndex = (arrLen - 1) * prob;
    const lowerIndex = Math.floor(hIndex);
    const remainder = hIndex - lowerIndex;

    const valLower = sortedValues[lowerIndex];

    // If remainder is zero, it's an exact match.
    if (remainder === 0) {
      return valLower;
    }

    // If remainder is not zero, interpolate between two points.
    const valUpper = sortedValues[lowerIndex + 1];
    return valLower + remainder * (valUpper - valLower);
  };


  // --- Random Number Generators ---
  dataViz.random = {
    // Generates a random number from a normal (Gaussian) distribution.
    // Uses the Box-Muller transform.
    normal: function(mean = 0, stdDev = 1) { // Use ES6 default parameters for cleaner code
      return function() {
        let u, v, s; // Uniform samples and sum of squares
        // Generate two uniform random numbers (u, v) and ensure they are within the unit circle.
        do {
          u = Math.random() * 2 - 1; // Range [-1, 1]
          v = Math.random() * 2 - 1; // Range [-1, 1]
          s = u * u + v * v;
        } while (s >= 1 || s === 0); // s must be in (0, 1)

        // Calculate the polar transform constant.
        const polarConst = Math.sqrt(-2 * Math.log(s) / s);
        // Return one of the two normally distributed values.
        // We could also return `stdDev * v * polarConst + mean` if we needed a pair.
        return mean + stdDev * u * polarConst;
      };
    }
  };


  // --- Array Manipulation ---

  // Transposes a matrix (array of arrays).
  dataViz.transpose = function(inputMatrix) {
    // If matrix is empty or null, return an empty array.
    if (!inputMatrix || inputMatrix.length === 0) {
      return [];
    }
    // Use the zip function, applying the matrix rows as arguments.
    return dataViz.zip.apply(null, inputMatrix);
  };

  // Zips multiple arrays together, creating an array of tuples.
  dataViz.zip = function() {
    const inputArrays = arguments;
    const numArrays = inputArrays.length;
    if (numArrays === 0) {
      return [];
    }

    // Find the minimum length among all input arrays.
    // This ensures we don't go out of bounds if arrays have different lengths.
    const minLength = dataViz.min(convertToArray(inputArrays), arr => arr.length);

    const zippedResult = new Array(minLength);
    let outerIdx = -1;

    while (++outerIdx < minLength) {
      const currentTuple = new Array(numArrays);
      let innerIdx = -1;
      while (++innerIdx < numArrays) {
        currentTuple[innerIdx] = inputArrays[innerIdx][outerIdx];
      }
      zippedResult[outerIdx] = currentTuple;
    }
    return zippedResult;
  };


  // --- Bisector for Sorted Arrays ---

  // Factory function to create a bisector object.
  // A bisector finds the insertion point for a value in a sorted array.
  dataViz.bisector = function(accessor) {
    return {
      // Finds the insertion point for `x` such that all elements to the left are `< x`.
      left: function(sortedArray, searchVal, low = 0, high = sortedArray.length) {
        while (low < high) {
          const mid = low + high >>> 1; // Faster integer division
          if (accessor.call(sortedArray, sortedArray[mid], mid) < searchVal) {
            low = mid + 1;
          } else {
            high = mid;
          }
        }
        return low;
      },
      // Finds the insertion point for `x` such that all elements to the left are `<= x`.
      right: function(sortedArray, searchVal, low = 0, high = sortedArray.length) {
        while (low < high) {
          const mid = low + high >>> 1;
          if (searchVal < accessor.call(sortedArray, sortedArray[mid], mid)) {
            high = mid;
          } else {
            low = mid + 1;
          }
        }
        return low;
      }
    };
  };

  // Create a default bisector for simple numeric arrays.
  const defaultBisector = dataViz.bisector(passThrough); // Uses the passThrough identity function

  dataViz.bisectLeft = defaultBisector.left;
  dataViz.bisect = dataViz.bisectRight = defaultBisector.right;


  // --- Array Search (First/Last) ---

  // Finds the "first" element in an array based on a comparison function.
  // By default, finds the smallest element (ascending order).
  dataViz.findFirst = function(inputArray, comparator) {
    const arrLength = inputArray.length;
    if (arrLength === 0) return undefined;

    let currentBest = inputArray[0];
    let candidate;
    let index = 0;

    // Use default ascending comparator if none provided.
    const effectiveComparator = comparator || dataViz.ascending;

    while (++index < arrLength) {
      candidate = inputArray[index];
      // If the current best is "greater" than the candidate, update currentBest.
      if (effectiveComparator.call(inputArray, currentBest, candidate) > 0) {
        currentBest = candidate;
      }
    }
    return currentBest;
  };

  // Finds the "last" element in an array based on a comparison function.
  // By default, finds the largest element (ascending order comparator, but logic reversed).
  dataViz.findLast = function(inputArray, comparator) {
    const arrLength = inputArray.length;
    if (arrLength === 0) return undefined;

    let currentBest = inputArray[0];
    let candidate;
    let index = 0;

    const effectiveComparator = comparator || dataViz.ascending;

    while (++index < arrLength) {
      candidate = inputArray[index];
      // If the current best is "less than or equal to" the candidate, update currentBest.
      // This effectively finds the last occurrence of the "largest" value.
      if (effectiveComparator.call(inputArray, currentBest, candidate) <= 0) {
        currentBest = candidate;
      }
    }
    return currentBest;
  };


  // --- Data Nesting (Grouping) ---

  // Provides a fluent API for grouping and aggregating data.
  dataViz.nest = function() {
    const nestConfig = {};
    const groupingKeys = []; // Functions to extract keys for grouping levels
    const keySorts = []; // Optional sort functions for keys at each level
    let valueSorter; // Optional sort function for leaf values
    let rollupFunction; // Optional function to aggregate leaf values

    // Internal function to recursively map data based on grouping keys.
    function processMap(dataItems, currentDepth) {
      // Base case: If we've processed all grouping keys, apply rollup or sort leaf values.
      if (currentDepth >= groupingKeys.length) {
        return rollupFunction ?
          rollupFunction.call(nestConfig, dataItems) :
          (valueSorter ? dataItems.sort(valueSorter) : dataItems);
      }

      const currentKeyAccessor = groupingKeys[currentDepth];
      const itemsByGroup = new CustomStore(); // Use our custom map for grouping
      let itemIterator = -1;
      const totalItems = dataItems.length;

      // Group items by the current level's key.
      while (++itemIterator < totalItems) {
        const currentItem = dataItems[itemIterator];
        const groupKey = currentKeyAccessor(currentItem);
        let groupList = itemsByGroup.get(groupKey);

        if (!groupList) {
          groupList = [];
          itemsByGroup.set(groupKey, groupList);
        }
        groupList.push(currentItem);
      }

      const outputObject = {};
      // Recursively process each group.
      itemsByGroup.forEach(function(groupKey, groupValues) {
        outputObject[groupKey] = processMap(groupValues, currentDepth + 1);
      });

      return outputObject;
    }

    // Internal function to recursively convert the nested map into an array of entries.
    function convertMapToEntries(nestedMap, currentDepth) {
      // Base case: If no more grouping levels, just return the map (which contains leaf values/rollup result).
      if (currentDepth >= groupingKeys.length) {
        return nestedMap;
      }

      const entriesArray = [];
      const currentKeySorter = keySorts[currentDepth];

      // Iterate through the keys of the current map level.
      for (const mapKey in nestedMap) {
        // Ensure it's an own property to avoid prototype chain issues.
        if (nestedMap.hasOwnProperty(mapKey)) {
          entriesArray.push({
            key: mapKey,
            values: convertMapToEntries(nestedMap[mapKey], currentDepth + 1)
          });
        }
      }

      // If a key sort function is defined for this level, apply it.
      if (currentKeySorter) {
        entriesArray.sort(function(entryA, entryB) {
          return currentKeySorter(entryA.key, entryB.key);
        });
      }

      return entriesArray;
    }

    // Public API for the nest object.

    // Processes the input array into a nested object (map).
    nestConfig.map = function(inputArray) {
      return processMap(inputArray, 0);
    };

    // Processes the input array into a nested array of entries.
    nestConfig.entries = function(inputArray) {
      return convertMapToEntries(processMap(inputArray, 0), 0);
    };

    // Adds a key accessor function for a new grouping level.
    nestConfig.key = function(accessorFn) {
      groupingKeys.push(accessorFn);
      return nestConfig; // Chainable
    };

    // Specifies a custom sorting function for the keys of the most recently added grouping level.
    nestConfig.sortKeys = function(sortFn) {
      if (groupingKeys.length > 0) {
        keySorts[groupingKeys.length - 1] = sortFn;
      }
      return nestConfig;
    };

    // Specifies a custom sorting function for the leaf values.
    nestConfig.sortValues = function(sortFn) {
      valueSorter = sortFn;
      return nestConfig;
    };

    // Specifies a rollup function to aggregate leaf values.
    nestConfig.rollup = function(aggregatorFn) {
      rollupFunction = aggregatorFn;
      return nestConfig;
    };

    return nestConfig;
  };


  // --- Object Property Iteration ---

  // Returns an array of an object's enumerable own property names.
  dataViz.getObjKeys = function(sourceObj) {
    const keysArray = [];
    for (const propName in sourceObj) {
      if (sourceObj.hasOwnProperty(propName)) {
        keysArray.push(propName);
      }
    }
    return keysArray;
  };

  // Returns an array of an object's enumerable own property values.
  dataViz.getObjValues = function(sourceObj) {
    const valuesArray = [];
    for (const propName in sourceObj) {
      if (sourceObj.hasOwnProperty(propName)) {
        valuesArray.push(sourceObj[propName]);
      }
    }
    return valuesArray;
  };

  // Returns an array of an object's enumerable own property [key, value] pairs.
  dataViz.getObjEntries = function(sourceObj) {
    const entriesArray = [];
    for (const propName in sourceObj) {
      if (sourceObj.hasOwnProperty(propName)) {
        entriesArray.push({
          key: propName,
          value: sourceObj[propName]
        });
      }
    }
    return entriesArray;
  };


  // --- Array Transformation Utilities ---

  // Rearranges elements of an array based on a list of indexes.
  dataViz.reorder = function(sourceArray, indexMap) {
    const rearranged = new Array(indexMap.length);
    let mapIndex = -1;
    const mapLength = indexMap.length;
    while (++mapIndex < mapLength) {
      rearranged[mapIndex] = sourceArray[indexMap[mapIndex]];
    }
    return rearranged;
  };

  // Flattens an array of arrays into a single array.
  dataViz.flattenArrays = function(arrayOfArrays) {
    // Using concat.apply with an empty array is a common and efficient way to flatten.
    return [].concat.apply([], arrayOfArrays);
  };

  // Splits an array into sub-arrays based on a predicate function.
  dataViz.partition = function(inputArray, separatorPredicate) {
    const resultPartitions = [];
    let currentSegment = [];
    let itemIdx = -1;
    const arrayLen = inputArray.length;

    // Default predicate: split on null or undefined values.
    const effectivePredicate = separatorPredicate || function(d) {
      return d == null;
    };

    while (++itemIdx < arrayLen) {
      const currentItem = inputArray[itemIdx];
      // If the predicate returns true, it's a separator.
      if (effectivePredicate.call(currentSegment, currentItem, itemIdx)) {
        // If the current segment is not empty, push it to results.
        if (currentSegment.length > 0) {
          resultPartitions.push(currentSegment);
        }
        currentSegment = []; // Start a new segment.
      } else {
        currentSegment.push(currentItem);
      }
    }
    // Add the last segment if it's not empty.
    if (currentSegment.length > 0) {
      resultPartitions.push(currentSegment);
    }
    return resultPartitions;
  };


  // --- String Utilities ---

  // Collapses multiple whitespace characters into a single space and trims leading/trailing whitespace.
  function normalizeWhitespace(inputString) {
    return inputString.replace(/^\s+|\s+$/g, "").replace(/\s+/g, " ");
  }

  // Escapes a string for use as a literal in a regular expression.
  // This is crucial for dynamic regex creation.
  const regexEscapePattern = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  dataViz.escapeRegex = function(inputStr) {
    return inputStr.replace(regexEscapePattern, "\\$&");
  };


  // --- Numeric Utilities ---

  // Generates a sequence of numbers within a specified range.
  dataViz.numericRange = function(startVal, endVal, stepSize) {
    // Handle overloaded arguments:
    // range(stop) -> start=0, step=1
    // range(start, stop) -> step=1
    if (arguments.length < 3) {
      stepSize = 1;
      if (arguments.length < 2) {
        endVal = startVal;
        startVal = 0;
      }
    }

    // Guard against infinite loops for zero step or step in wrong direction.
    if (stepSize === 0 || (stepSize > 0 && startVal >= endVal) || (stepSize < 0 && startVal <= endVal)) {
      return [];
    }

    const rangeOutput = [];
    let currentNum = startVal;
    let iterationCount = 0;

    // Use a small epsilon or integer scaling to handle floating point inaccuracies
    // and ensure the loop terminates correctly.
    const precisionFactor = getPrecisionFactor(Math.abs(stepSize));
    startVal *= precisionFactor;
    endVal *= precisionFactor;
    stepSize *= precisionFactor;

    if (stepSize > 0) {
      while (currentNum * precisionFactor < endVal) {
        rangeOutput.push(currentNum);
        currentNum = (startVal + stepSize * (++iterationCount)) / precisionFactor;
      }
    } else { // stepSize < 0
      while (currentNum * precisionFactor > endVal) {
        rangeOutput.push(currentNum);
        currentNum = (startVal + stepSize * (++iterationCount)) / precisionFactor;
      }
    }

    return rangeOutput;
  };

  // Helper function to determine a scaling factor for floating point numbers
  // to convert them to integers for precise arithmetic.
  function getPrecisionFactor(num) {
    let factor = 1;
    // Multiplies factor by 10 until num * factor is an integer.
    // Handles numbers like 0.1, 0.01, etc.
    while (num * factor % 1 !== 0 && factor < 1e9) { // Cap factor to prevent infinite loop for irrational numbers
      factor *= 10;
    }
    return factor;
  }

  // Rounds a number to a specified number of decimal places.
  dataViz.roundTo = function(inputNum, decimalPlaces) {
    if (decimalPlaces === undefined || decimalPlaces === null || decimalPlaces === 0) {
      return Math.round(inputNum);
    }
    const multiplier = Math.pow(10, decimalPlaces);
    return Math.round(inputNum * multiplier) / multiplier;
  };


  // --- Asynchronous Utilities (XHR) ---

  // Performs an XMLHttpRequest (GET request).
  dataViz.fetchData = function(urlAddress, mimeType, completionCallback) {
    const xhrRequest = new XMLHttpRequest();

    // Handle optional `mimeType` argument.
    if (arguments.length < 3) {
      completionCallback = mimeType; // If 2 args, second is callback.
      mimeType = null;
    } else if (mimeType && xhrRequest.overrideMimeType) {
      // Set overrideMimeType if supported and specified.
      xhrRequest.overrideMimeType(mimeType);
    }

    xhrRequest.open("GET", urlAddress, true); // Async GET request

    // Set Accept header if mimeType is provided.
    if (mimeType) {
      xhrRequest.setRequestHeader("Accept", mimeType);
    }

    // Define the event handler for state changes.
    xhrRequest.onreadystatechange = function() {
      // Check if the request is complete (readyState 4).
      if (xhrRequest.readyState === 4) {
        const responseStatus = xhrRequest.status;
        // Determine if the request was successful.
        // Status 0 for local file access, 2xx for success, 304 for not modified.
        const isSuccess = (!responseStatus && xhrRequest.response) ||
          (responseStatus >= 200 && responseStatus < 300) ||
          (responseStatus === 304);

        if (isSuccess) {
          completionCallback(xhrRequest); // Pass the request object on success
        } else {
          // Log an error and pass null to the callback on failure.
          console.error(`Fetch failed for URL: ${urlAddress}, Status: ${responseStatus}`);
          completionCallback(null);
        }
      }
    };

    xhrRequest.send(null); // Send the request (body is null for GET).
  };

  // Expose the dataViz object globally.
  window.dataViz = dataViz;

})();