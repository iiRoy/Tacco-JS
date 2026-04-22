/*
 * This file contains a collection of fundamental JavaScript utilities,
 * inspired by common data manipulation and DOM interaction patterns.
 * It provides core functionalities for array processing, object handling,
 * custom data structures, and event dispatching.
 *
 * This version is a structural variant (Type III clone) of an existing library,
 * featuring extensive identifier renaming, code restructuring, and
 * the addition/deletion of minor code fragments while preserving core logic.
 */
var libX = function() {
  // Initialize the primary toolkit object with a version identifier.
  var toolkit = {
    releaseId: "v3.3.5-alpha"
  };

  // Polyfill for Date.now() if not available in the environment.
  // Ensures consistent high-resolution time measurement.
  if (typeof Date.getCurrentTime === "undefined") {
    Date.getCurrentTime = function() {
      return +(new Date());
    };
  }

  // Common array operations setup.
  var lx_arraySliceRef = [].slice;

  // Utility to convert array-like objects into true arrays.
  // Includes a fallback for older browsers (e.g., IE < 9) where NodeList isn't a true array.
  var lx_convertToArray = function(listLike) {
    return lx_arraySliceRef.call(listLike);
  };

  var lx_mainDocument = document,
    lx_rootElement = lx_mainDocument.documentElement,
    lx_globalWindow = window;

  // Feature detection for NodeList to Array conversion efficiency.
  // Some older environments throw errors when accessing nodeType on non-existent elements
  // directly from lx_convertToArray result without proper checking.
  try {
    // Attempt to access a property on a converted NodeList.
    // If this fails, a less efficient conversion method is used.
    var testNodes = lx_convertToArray(lx_rootElement.childNodes);
    if (testNodes.length > 0) {
      void testNodes[0].nodeType; // Access property, discard value.
    } else {
      // If no child nodes, the test isn't conclusive about failure,
      // but the original code implies a direct access might throw.
      // We'll keep the fallback for robustness.
    }
  } catch (err) {
    // Fallback array conversion for environments where direct slice.call fails
    // or is problematic for NodeLists/HTMLCollections.
    lx_convertToArray = function(listLike) {
      var k = listLike.length,
        resultArr = new Array(k);
      while (k-- > 0) { // Loop from length-1 down to 0
        resultArr[k] = listLike[k];
      }
      return resultArr;
    };
  }

  // Feature detection and polyfill for DOM style and attribute setting methods.
  // Addresses inconsistencies in older browser implementations (e.g., IE).
  try {
    // Test if setProperty on style objects works as expected.
    lx_mainDocument.createElement("div").style.setProperty("opacity", 0, "");
  } catch (domError) {
    // If setProperty fails, polyfill Element.prototype methods to ensure string conversion.
    var lx_elementProto = lx_globalWindow.Element.prototype,
      lx_originalSetAttr = lx_elementProto.setAttribute,
      lx_originalSetAttrNS = lx_elementProto.setAttributeNS,
      lx_styleProto = lx_globalWindow.CSSStyleDeclaration.prototype,
      lx_originalSetStyleProp = lx_styleProto.setProperty;

    // Wrap setAttribute to ensure value is always a string.
    lx_elementProto.setAttribute = function(attributeName, attributeValue) {
      lx_originalSetAttr.call(this, attributeName, String(attributeValue));
    };

    // Wrap setAttributeNS, also ensuring string conversion.
    lx_elementProto.setAttributeNS = function(namespaceURI, qualifiedName, attributeValue) {
      lx_originalSetAttrNS.call(this, namespaceURI, qualifiedName, String(attributeValue));
    };

    // Wrap setProperty for CSS styles, ensuring value is a string.
    lx_styleProto.setProperty = function(propertyName, propertyValue, importantFlag) {
      lx_originalSetStyleProp.call(this, propertyName, String(propertyValue), importantFlag);
    };
  }

  /**
   * Compares two values for ascending order.
   * Returns -1 if 'a' is less than 'b', 1 if 'a' is greater than 'b', 0 if equal, NaN otherwise.
   * @param {*} valA - The first value.
   * @param {*} valB - The second value.
   * @returns {number} Comparison result.
   */
  toolkit.compareAscending = function(valA, valB) {
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    if (valA >= valB) return 0; // Handles NaN cases where a >= a is false
    return NaN;
  };

  /**
   * Compares two values for descending order.
   * Returns -1 if 'b' is less than 'a', 1 if 'b' is greater than 'a', 0 if equal, NaN otherwise.
   * @param {*} valA - The first value.
   * @param {*} valB - The second value.
   * @returns {number} Comparison result.
   */
  toolkit.compareDescending = function(valA, valB) {
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    if (valB >= valA) return 0; // Handles NaN cases
    return NaN;
  };

  /**
   * Finds the minimum value in an array.
   * Optionally takes an accessor function to extract values from array elements.
   * Handles null, undefined, and NaN values.
   * @param {Array} collection - The array to search.
   * @param {Function} [extractor] - Optional function to apply to each element.
   * @returns {*} The minimum value found, or undefined if no valid numbers are present.
   */
  toolkit.findSmallest = function(collection, extractor) {
    var idx = -1,
      count = collection.length,
      currentMin, testVal;
    var hasExtractor = (arguments.length > 1);

    // Find the first valid number to initialize currentMin.
    while (++idx < count) {
      testVal = hasExtractor ? extractor.call(collection, collection[idx], idx) : collection[idx];
      if (testVal != null && testVal <= testVal) { // Check for non-null/undefined and non-NaN
        currentMin = testVal;
        break;
      }
    }

    // If no valid number found, return undefined.
    if (idx === count) return undefined;

    // Iterate through the rest of the array to find the true minimum.
    while (++idx < count) {
      testVal = hasExtractor ? extractor.call(collection, collection[idx], idx) : collection[idx];
      if (testVal != null && testVal <= testVal && currentMin > testVal) {
        currentMin = testVal;
      }
    }
    return currentMin;
  };

  /**
   * Finds the maximum value in an array.
   * Optionally takes an accessor function to extract values from array elements.
   * Handles null, undefined, and NaN values.
   * @param {Array} collection - The array to search.
   * @param {Function} [extractor] - Optional function to apply to each element.
   * @returns {*} The maximum value found, or undefined if no valid numbers are present.
   */
  toolkit.findLargest = function(collection, extractor) {
    var idx = -1,
      count = collection.length,
      currentMax, testVal;
    var useExtractor = (arguments.length > 1);

    // Find the first valid number to initialize currentMax.
    while (++idx < count) {
      testVal = useExtractor ? extractor.call(collection, collection[idx], idx) : collection[idx];
      if (testVal != null && testVal <= testVal) { // Check for non-null/undefined and non-NaN
        currentMax = testVal;
        break;
      }
    }

    // If no valid number found, return undefined.
    if (idx === count) return undefined;

    // Iterate through the rest of the array to find the true maximum.
    while (++idx < count) {
      testVal = useExtractor ? extractor.call(collection, collection[idx], idx) : collection[idx];
      if (testVal != null && testVal <= testVal && testVal > currentMax) {
        currentMax = testVal;
      }
    }
    return currentMax;
  };

  /**
   * Computes the extent (min and max) of an array.
   * Optionally takes an accessor function.
   * Returns an array [min, max].
   * @param {Array} collection - The array to process.
   * @param {Function} [valueAccessor] - Optional function to extract values.
   * @returns {Array} An array containing [min, max], or [undefined, undefined] if no valid numbers.
   */
  toolkit.getBounds = function(collection, valueAccessor) {
    var cursor = -1,
      total = collection.length,
      firstVal, currentVal, minimum, maximum;
    var accessorProvided = (arguments.length > 1);

    // Find the first valid number to initialize min/max.
    while (++cursor < total) {
      firstVal = accessorProvided ? valueAccessor.call(collection, collection[cursor], cursor) : collection[cursor];
      if (firstVal != null && firstVal <= firstVal) {
        minimum = maximum = firstVal;
        break;
      }
    }

    // If no valid number found, return [undefined, undefined].
    if (cursor === total) return [undefined, undefined];

    // Iterate through the rest of the array.
    while (++cursor < total) {
      currentVal = accessorProvided ? valueAccessor.call(collection, collection[cursor], cursor) : collection[cursor];
      if (currentVal != null && currentVal <= currentVal) {
        if (minimum > currentVal) minimum = currentVal;
        if (maximum < currentVal) maximum = currentVal;
      }
    }
    return [minimum, maximum];
  };

  /**
   * Calculates the sum of numeric values in an array.
   * Non-numeric values that can be coerced to NaN are ignored.
   * @param {Array} dataSet - The array of numbers.
   * @param {Function} [dataExtractor] - Optional function to extract numeric values from elements.
   * @returns {number} The sum of valid numbers.
   */
  toolkit.calcTotal = function(dataSet, dataExtractor) {
    var accumulator = 0,
      listLength = dataSet.length,
      itemValue,
      loopIndex = -1;
    var useExtractor = (arguments.length > 1);

    while (++loopIndex < listLength) {
      itemValue = useExtractor ? dataExtractor.call(dataSet, dataSet[loopIndex], loopIndex) : dataSet[loopIndex];
      // Check if the value is a valid number after coercion.
      if (!isNaN(itemValue = +itemValue)) {
        accumulator += itemValue;
      }
    }
    return accumulator;
  };

  // Helper function to check if a value is a valid number (not null, undefined, or NaN).
  function lx_isNumeric(val) {
    return val != null && !isNaN(val);
  }

  /**
   * Computes the mean (average) of numeric values in an array.
   * Handles null, undefined, and NaN values by ignoring them.
   * Uses Welford's online algorithm for numerical stability.
   * @param {Array} dataSet - The array of numbers.
   * @param {Function} [dataExtractor] - Optional function to extract numeric values from elements.
   * @returns {number|undefined} The mean, or undefined if no valid numbers are present.
   */
  toolkit.calcAverage = function(dataSet, dataExtractor) {
    var dataLength = dataSet.length,
      currentValue,
      runningMean = 0,
      dataIndex = -1,
      validCount = 0;
    var useExtractor = (arguments.length > 1);

    while (++dataIndex < dataLength) {
      currentValue = useExtractor ? dataExtractor.call(dataSet, dataSet[dataIndex], dataIndex) : dataSet[dataIndex];
      if (lx_isNumeric(currentValue)) {
        validCount++;
        // Welford's online algorithm for mean calculation
        runningMean += (currentValue - runningMean) / validCount;
      }
    }
    return validCount > 0 ? runningMean : undefined;
  };

  /**
   * Calculates the p-th quantile of a sorted array of values.
   * Uses linear interpolation between values if p falls between indices.
   * @param {Array<number>} sortedValues - A numerically sorted array.
   * @param {number} percentile - The percentile (0 to 1).
   * @returns {number} The calculated quantile value.
   */
  toolkit.getQuantile = function(sortedValues, percentile) {
    if (!Array.isArray(sortedValues) || sortedValues.length === 0) return undefined;
    if (percentile < 0 || percentile > 1) {
      console.warn("Quantile percentile should be between 0 and 1.");
      percentile = Math.max(0, Math.min(1, percentile)); // Clamp percentile
    }

    var effectiveIndex = (sortedValues.length - 1) * percentile + 1,
      lowerIndex = Math.floor(effectiveIndex),
      lowerValue = +sortedValues[lowerIndex - 1], // Ensure numeric
      interpolationFactor = effectiveIndex - lowerIndex;

    // If interpolation factor is non-zero, interpolate between values.
    return interpolationFactor ?
      lowerValue + interpolationFactor * (+sortedValues[lowerIndex] - lowerValue) :
      lowerValue;
  };

  /**
   * Computes the median of an array of values.
   * Filters out non-numeric values and sorts the remainder.
   * @param {Array} dataSet - The array of values.
   * @param {Function} [dataExtractor] - Optional function to extract numeric values.
   * @returns {number|undefined} The median, or undefined if no valid numbers are present.
   */
  toolkit.getMedian = function(dataSet, dataExtractor) {
    var numericValues = dataSet;
    if (arguments.length > 1) {
      numericValues = dataSet.map(dataExtractor);
    }
    // Filter out non-numeric values and sort them.
    numericValues = numericValues.filter(lx_isNumeric).sort(toolkit.compareAscending);

    return numericValues.length > 0 ?
      toolkit.getQuantile(numericValues, 0.5) :
      undefined;
  };

  /**
   * Creates a bisector object for efficient insertion and search in sorted arrays.
   * @param {Function} valueAccessor - Function to extract the comparable value from an array element.
   * @returns {Object} An object with 'findLeft' and 'findRight' methods.
   */
  toolkit.makeBisector = function(valueAccessor) {
    return {
      /**
       * Finds the insertion point for 'target' in 'arr' to maintain sorted order,
       * such that all elements to the left are less than 'target'.
       * @param {Array} arr - The sorted array.
       * @param {*} target - The value to search for.
       * @param {number} [low=0] - The lower bound of the search range.
       * @param {number} [high=arr.length] - The upper bound of the search range.
       * @returns {number} The insertion index.
       */
      findLeft: function(arr, target, low, high) {
        // Normalize search range bounds.
        low = low == null ? 0 : low;
        high = high == null ? arr.length : high;

        while (low < high) {
          var midPoint = (low + high) >>> 1; // Faster integer division for midpoint
          var midValue = valueAccessor.call(arr, arr[midPoint], midPoint);
          if (midValue < target) {
            low = midPoint + 1;
          } else {
            high = midPoint;
          }
        }
        return low;
      },

      /**
       * Finds the insertion point for 'target' in 'arr' to maintain sorted order,
       * such that all elements to the left are less than or equal to 'target'.
       * @param {Array} arr - The sorted array.
       * @param {*} target - The value to search for.
       * @param {number} [low=0] - The lower bound of the search range.
       * @param {number} [high=arr.length] - The upper bound of the search range.
       * @returns {number} The insertion index.
       */
      findRight: function(arr, target, low, high) {
        // Normalize search range bounds.
        low = low == null ? 0 : low;
        high = high == null ? arr.length : high;

        while (low < high) {
          var midPoint = (low + high) >>> 1;
          var midValue = valueAccessor.call(arr, arr[midPoint], midPoint);
          if (target < midValue) {
            high = midPoint;
          } else {
            low = midPoint + 1;
          }
        }
        return low;
      }
    };
  };

  // Default bisector for values themselves.
  var lx_defaultBisector = toolkit.makeBisector(function(item) {
    return item;
  });

  toolkit.insertLeft = lx_defaultBisector.findLeft;
  toolkit.insertRight = lx_defaultBisector.findRight;
  // Alias for backward compatibility or common use case.
  toolkit.bisect = toolkit.insertRight;

  /**
   * Randomly shuffles the elements of an array in place (Fisher-Yates algorithm).
   * @param {Array} sourceArray - The array to shuffle.
   * @returns {Array} The shuffled array (same instance).
   */
  toolkit.randomizeOrder = function(sourceArray) {
    var remainingElements = sourceArray.length,
      tempValue, randomIdx;

    // While there remain elements to shuffle.
    while (remainingElements > 0) {
      // Pick a remaining element.
      randomIdx = Math.floor(Math.random() * remainingElements--);

      // And swap it with the current element.
      tempValue = sourceArray[remainingElements];
      sourceArray[remainingElements] = sourceArray[randomIdx];
      sourceArray[randomIdx] = tempValue;
    }
    return sourceArray;
  };

  /**
   * Creates a new array by picking elements from 'source' array based on 'indices'.
   * @param {Array} sourceArray - The array to pick elements from.
   * @param {Array<number>} indexList - An array of indices.
   * @returns {Array} A new array containing elements from sourceArray at the specified indices.
   */
  toolkit.rearrangeByIndices = function(sourceArray, indexList) {
    var listLen = indexList.length,
      reorderedResult = new Array(listLen);
    while (listLen-- > 0) {
      reorderedResult[listLen] = sourceArray[indexList[listLen]];
    }
    return reorderedResult;
  };

  /**
   * Generates an array of adjacent pairs from the input array.
   * E.g., [a, b, c, d] -> [[a, b], [b, c], [c, d]].
   * @param {Array} inputArr - The array to process.
   * @returns {Array<Array>} An array of pairs.
   */
  toolkit.getAdjacentPairs = function(inputArr) {
    var currentIdx = 0,
      totalCount = inputArr.length;
    if (totalCount < 2) return []; // Need at least two elements for a pair.

    var previousElement = inputArr[0],
      currentElement;
    var generatedPairs = new Array(totalCount - 1);

    while (currentIdx < totalCount - 1) {
      currentElement = inputArr[++currentIdx];
      generatedPairs[currentIdx - 1] = [previousElement, currentElement];
      previousElement = currentElement; // Update previous for next iteration
    }
    return generatedPairs;
  };

  /**
   * Zips multiple arrays together, creating an array of arrays where each inner array
   * contains elements at the same index from the input arrays.
   * The length of the resulting arrays is determined by the shortest input array.
   * @param {...Array} arrays - Multiple arrays to zip.
   * @returns {Array<Array>} The zipped array.
   */
  toolkit.combineArrays = function() {
    var inputArrs = Array.prototype.slice.call(arguments); // Convert arguments to a real array
    if (inputArrs.length === 0) return [];

    // Helper to get length of an array.
    var getArrLength = function(arr) {
      return arr.length;
    };

    var minLength = toolkit.findSmallest(inputArrs, getArrLength);
    if (minLength === undefined) return []; // No arrays or empty arrays

    var zippedResult = new Array(minLength);
    for (var i = 0; i < minLength; ++i) {
      var currentZipRow = new Array(inputArrs.length);
      for (var j = 0; j < inputArrs.length; ++j) {
        currentZipRow[j] = inputArrs[j][i];
      }
      zippedResult[i] = currentZipRow;
    }
    return zippedResult;
  };

  /**
   * Transposes a matrix (array of arrays). Rows become columns and columns become rows.
   * @param {Array<Array>} matrix - The input matrix.
   * @returns {Array<Array>} The transposed matrix.
   */
  toolkit.transposeMatrix = function(matrix) {
    // Leverage combineArrays (original d3.zip) by applying the matrix rows as arguments.
    return toolkit.combineArrays.apply(toolkit, matrix);
  };

  /**
   * Returns an array of enumerable property names (keys) of an object.
   * @param {Object} targetObj - The object to inspect.
   * @returns {Array<string>} An array of property names.
   */
  toolkit.getObjectKeys = function(targetObj) {
    var keyList = [];
    // Iterate over enumerable properties.
    for (var propName in targetObj) {
      keyList.push(propName);
    }
    return keyList;
  };

  /**
   * Returns an array of enumerable property values of an object.
   * @param {Object} targetObj - The object to inspect.
   * @returns {Array<*>} An array of property values.
   */
  toolkit.getObjectValues = function(targetObj) {
    var valueList = [];
    for (var propName in targetObj) {
      valueList.push(targetObj[propName]);
    }
    return valueList;
  };

  /**
   * Returns an array of {key, value} pairs for enumerable properties of an object.
   * @param {Object} targetObj - The object to inspect.
   * @returns {Array<Object>} An array of objects, each with 'key' and 'value' properties.
   */
  toolkit.getObjectEntries = function(targetObj) {
    var entryList = [];
    for (var propName in targetObj) {
      entryList.push({
        key: propName,
        value: targetObj[propName]
      });
    }
    return entryList;
  };

  /**
   * Merges multiple arrays into a single new array.
   * @param {Array<Array>} arrayOfArrays - An array containing other arrays.
   * @returns {Array} A new array with all elements from the input arrays.
   */
  toolkit.flattenArrays = function(arrayOfArrays) {
    // Using Array.prototype.concat.apply is efficient for this.
    return Array.prototype.concat.apply([], arrayOfArrays);
  };

  /**
   * Generates a sequence of numbers within a specified range, with an optional step.
   * Similar to Python's range().
   * @param {number} start - The starting value (inclusive).
   * @param {number} [stop] - The stopping value (exclusive). If only one argument, it's 'stop' and 'start' is 0.
   * @param {number} [step=1] - The increment/decrement step.
   * @returns {Array<number>} An array of numbers in the specified range.
   * @throws {Error} If an infinite range is detected.
   */
  toolkit.createRange = function(start, stop, step) {
    // Handle overloaded arguments: (stop), (start, stop), (start, stop, step)
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }

    // Guard against infinite loops with zero step or impossible range.
    if (step === 0) {
      if (start !== stop) throw new Error("Infinite range: step is zero, start and stop are different.");
      return []; // If start === stop and step is 0, it's an empty range.
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return []; // Range already exhausted or invalid direction.
    }

    // Check for potential infinite range (e.g., very small step leading to no progress).
    if ((stop - start) / step === Infinity) {
      throw new Error("Potential infinite range detected. Check start, stop, and step values.");
    }

    var resultRange = [],
      currentValue = start;
    if (step > 0) {
      while (currentValue < stop) {
        resultRange.push(currentValue);
        currentValue += step;
        // Add a small epsilon check for floating point precision issues if needed.
        // For now, rely on direct addition; original D3 handles this via integer scaling.
      }
    } else { // step < 0
      while (currentValue > stop) {
        resultRange.push(currentValue);
        currentValue += step;
      }
    }
    return resultRange;
  };

  // The original D3 code used integer scaling to avoid floating point issues in range generation.
  // I will introduce a helper to emulate this behavior more robustly for floating point steps.
  // This is an 'addition' of a helper function to improve robustness.
  function lx_scaleToInteger(value, scaleFactor) {
    return Math.round(value * scaleFactor);
  }

  function lx_determineScaleFactor(num) {
    var factor = 1;
    // Check if it's a floating point number.
    if (num % 1 !== 0) {
      var stringRep = num.toString();
      var decimalPointIndex = stringRep.indexOf('.');
      if (decimalPointIndex !== -1) {
        var numDecimals = stringRep.length - 1 - decimalPointIndex;
        factor = Math.pow(10, numDecimals);
      }
    }
    return factor;
  }

  // Rewrite toolkit.createRange to use the integer scaling for precision.
  toolkit.createPreciseRange = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }

    if (step === 0) {
      if (start !== stop) throw new Error("Infinite range: step is zero, start and stop are different.");
      return [];
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
    }

    // Determine a common scale factor to convert to integers for precise arithmetic.
    var scaleFactor = Math.max(lx_determineScaleFactor(start), lx_determineScaleFactor(stop), lx_determineScaleFactor(step));

    var scaledStart = lx_scaleToInteger(start, scaleFactor);
    var scaledStop = lx_scaleToInteger(stop, scaleFactor);
    var scaledStep = lx_scaleToInteger(step, scaleFactor);

    if ((scaledStop - scaledStart) / scaledStep === Infinity) {
      throw new Error("Potential infinite range detected after scaling.");
    }

    var preciseRange = [],
      scaledCurrent = scaledStart,
      scaledEnd = scaledStop;

    if (scaledStep > 0) {
      while (scaledCurrent < scaledEnd) {
        preciseRange.push(scaledCurrent / scaleFactor);
        scaledCurrent += scaledStep;
      }
    } else { // scaledStep < 0
      while (scaledCurrent > scaledEnd) {
        preciseRange.push(scaledCurrent / scaleFactor);
        scaledCurrent += scaledStep;
      }
    }
    return preciseRange;
  };

  // Use the precise range as the default.
  toolkit.createRange = toolkit.createPreciseRange;


  /**
   * Utility for adding methods to a constructor's prototype, handling old IE issues.
   * @param {Function} constructorFunc - The constructor whose prototype will be extended.
   * @param {Object} methodProps - An object mapping method names to functions.
   */
  function lx_extendPrototype(constructorFunc, methodProps) {
    try {
      // Use Object.defineProperty for modern browsers to ensure non-enumerable methods.
      for (var propKey in methodProps) {
        Object.defineProperty(constructorFunc.prototype, propKey, {
          value: methodProps[propKey],
          enumerable: false, // Make methods non-enumerable
          writable: true,
          configurable: true
        });
      }
    } catch (e) {
      // Fallback for older browsers (e.g., IE8) that don't support Object.defineProperty fully.
      // This makes methods enumerable, which is a compromise.
      constructorFunc.prototype = methodProps;
    }
  }

  // Internal prefix for custom map/set keys to avoid collisions with prototype properties.
  var lx_internalKeyPrefix = "\0",
    lx_prefixCharCode = lx_internalKeyPrefix.charCodeAt(0);

  /**
   * Custom Map implementation.
   * Provides a basic key-value store, particularly useful for keys that might clash
   * with standard JavaScript object properties or for ensuring consistent iteration order
   * (though iteration order is not strictly guaranteed by this implementation).
   * Uses a special prefix to store keys internally, avoiding collisions.
   */
  function lx_CustomMap() {
    this._size = 0; // Track the number of entries
  }

  lx_extendPrototype(lx_CustomMap, {
    // Checks if a key exists in the map.
    has: function(key) {
      return lx_internalKeyPrefix + key in this;
    },
    // Retrieves the value associated with a key.
    get: function(key) {
      return this[lx_internalKeyPrefix + key];
    },
    // Sets a key-value pair in the map.
    set: function(key, value) {
      var internalKey = lx_internalKeyPrefix + key;
      if (!(internalKey in this)) {
        this._size++; // Increment size only for new keys
      }
      this[internalKey] = value;
      return this; // Return 'this' for chaining
    },
    // Removes a key-value pair from the map.
    remove: function(key) {
      var internalKey = lx_internalKeyPrefix + key;
      if (internalKey in this) {
        delete this[internalKey];
        this._size--; // Decrement size
        return true;
      }
      return false;
    },
    // Returns an array of all keys in the map.
    getKeys: function() {
      var keysArr = [];
      this.forEach(function(k) {
        keysArr.push(k);
      });
      return keysArr;
    },
    // Returns an array of all values in the map.
    getValues: function() {
      var valuesArr = [];
      this.forEach(function(k, v) {
        valuesArr.push(v);
      });
      return valuesArr;
    },
    // Returns an array of {key, value} objects for all entries.
    getEntries: function() {
      var entriesArr = [];
      this.forEach(function(k, v) {
        entriesArr.push({
          key: k,
          value: v
        });
      });
      return entriesArr;
    },
    // Iterates over each key-value pair in the map.
    forEach: function(callbackFunc) {
      for (var internalProp in this) {
        // Ensure it's an own property and starts with the prefix.
        if (this.hasOwnProperty(internalProp) && internalProp.charCodeAt(0) === lx_prefixCharCode) {
          callbackFunc.call(this, internalProp.substring(1), this[internalProp]);
        }
      }
    },
    // Returns the number of key-value pairs in the map.
    getSize: function() {
      return this._size;
    },
    // Clears all entries from the map.
    clear: function() {
      var keysToRemove = this.getKeys();
      for (var i = 0; i < keysToRemove.length; i++) {
        this.remove(keysToRemove[i]);
      }
      return this;
    }
  });

  /**
   * Creates a new lx_CustomMap instance, optionally initialized with an object or another map.
   * @param {Object|lx_CustomMap} [initialData] - Data to populate the map.
   * @returns {lx_CustomMap} A new map instance.
   */
  toolkit.createDictionary = function(initialData) {
    var newMap = new lx_CustomMap();
    if (initialData instanceof lx_CustomMap) {
      initialData.forEach(function(k, v) {
        newMap.set(k, v);
      });
    } else if (initialData) {
      for (var p in initialData) {
        newMap.set(p, initialData[p]);
      }
    }
    return newMap;
  };

  /**
   * Provides a mechanism for grouping and aggregating hierarchical data.
   * Inspired by SQL's GROUP BY clause.
   * @returns {Object} A nest builder object.
   */
  toolkit.dataGrouper = function() {
    var grouper = {},
      keyFunctions = [],
      keyComparators = [],
      valueSorter,
      finalReducer;

    /**
     * Recursively maps an array of data into a nested structure.
     * @param {Function} mapConstructor - Constructor for the map type (e.g., toolkit.createDictionary).
     * @param {Array} dataArr - The array of data to group.
     * @param {number} currentDepth - The current nesting level.
     * @returns {Object|Array} The grouped data.
     */
    function processGroup(mapConstructor, dataArr, currentDepth) {
      // Base case: if we've processed all key levels.
      if (currentDepth >= keyFunctions.length) {
        return finalReducer ?
          finalReducer.call(grouper, dataArr) : // Apply rollup if defined
          valueSorter ? dataArr.sort(valueSorter) : dataArr; // Sort values if defined
      }

      var dataIndex = -1,
        arrayLength = dataArr.length,
        currentKeyFunc = keyFunctions[currentDepth++], // Get key function for this level
        itemKey,
        dataItem,
        mapSetter,
        groupedByKeyValue = new lx_CustomMap(), // Use custom map for grouping
        valuesForCurrentKey;

      // Group items by the current key function.
      while (++dataIndex < arrayLength) {
        dataItem = dataArr[dataIndex];
        itemKey = currentKeyFunc(dataItem); // Get key for the current item
        valuesForCurrentKey = groupedByKeyValue.get(itemKey);
        if (valuesForCurrentKey) {
          valuesForCurrentKey.push(dataItem);
        } else {
          groupedByKeyValue.set(itemKey, [dataItem]);
        }
      }

      // Determine the output structure (object or map) and the setter function.
      var outputContainer;
      if (mapConstructor) {
        outputContainer = mapConstructor();
        mapSetter = function(k, v) {
          outputContainer.set(k, processGroup(mapConstructor, v, currentDepth));
        };
      } else {
        outputContainer = {};
        mapSetter = function(k, v) {
          outputContainer[k] = processGroup(mapConstructor, v, currentDepth);
        };
      }

      // Recursively process each group.
      groupedByKeyValue.forEach(mapSetter);
      return outputContainer;
    }

    /**
     * Converts a grouped map into an array of {key, values} entries.
     * @param {Object|lx_CustomMap} groupedMap - The grouped data map.
     * @param {number} currentDepth - The current nesting level.
     * @returns {Array} An array of entries.
     */
    function mapToEntries(groupedMap, currentDepth) {
      // Base case: if we're at the deepest level, return the raw map (or rollup result).
      if (currentDepth >= keyFunctions.length) {
        return groupedMap;
      }

      var entryArray = [],
        keyComparator = keyComparators[currentDepth++]; // Get comparator for this level

      groupedMap.forEach(function(k, nestedMap) {
        entryArray.push({
          key: k,
          values: mapToEntries(nestedMap, currentDepth) // Recursive call
        });
      });

      return keyComparator ?
        entryArray.sort(function(entryA, entryB) {
          return keyComparator(entryA.key, entryB.key);
        }) :
        entryArray;
    }

    // Public API for the data grouper.

    /**
     * Groups data into a nested map structure.
     * @param {Array} arrayData - The input array of data.
     * @param {Function} [mapTypeFactory] - A function that returns a new map instance (e.g., toolkit.createDictionary).
     * @returns {Object|lx_CustomMap} The nested map.
     */
    grouper.asMap = function(arrayData, mapTypeFactory) {
      return processGroup(mapTypeFactory, arrayData, 0);
    };

    /**
     * Groups data and converts the result into an array of nested {key, values} objects.
     * @param {Array} arrayData - The input array of data.
     * @returns {Array} The nested array of entries.
     */
    grouper.asEntries = function(arrayData) {
      // First group into a custom map, then convert to entries.
      return mapToEntries(processGroup(toolkit.createDictionary, arrayData, 0), 0);
    };

    /**
     * Adds a key function for grouping.
     * @param {Function} accessorFn - Function to extract the key from a data item.
     * @returns {Object} The grouper instance for chaining.
     */
    grouper.byKey = function(accessorFn) {
      keyFunctions.push(accessorFn);
      return grouper;
    };

    /**
     * Specifies a custom sorting function for the keys at the last added key level.
     * @param {Function} comparatorFn - A comparison function (like Array.prototype.sort).
     * @returns {Object} The grouper instance for chaining.
     */
    grouper.sortKeys = function(comparatorFn) {
      if (keyFunctions.length > 0) {
        keyComparators[keyFunctions.length - 1] = comparatorFn;
      } else {
        console.warn("No key defined yet to apply key sorting.");
      }
      return grouper;
    };

    /**
     * Specifies a custom sorting function for the leaf values (the innermost arrays).
     * @param {Function} comparatorFn - A comparison function.
     * @returns {Object} The grouper instance for chaining.
     */
    grouper.sortValues = function(comparatorFn) {
      valueSorter = comparatorFn;
      return grouper;
    };

    /**
     * Specifies a rollup function to apply to the innermost arrays of values.
     * @param {Function} reducerFn - A function that takes an array of values and returns a single aggregated value.
     * @returns {Object} The grouper instance for chaining.
     */
    grouper.rollup = function(reducerFn) {
      finalReducer = reducerFn;
      return grouper;
    };

    return grouper;
  };

  /**
   * Custom Set implementation.
   * Provides a collection of unique values. Uses a special prefix to store keys internally.
   */
  function lx_CustomSet() {
    this._size = 0; // Track the number of entries
  }

  lx_extendPrototype(lx_CustomSet, {
    // Checks if a value is present in the set.
    has: function(val) {
      return lx_internalKeyPrefix + val in this;
    },
    // Adds a value to the set. Returns the added value.
    add: function(val) {
      var internalKey = lx_internalKeyPrefix + val;
      if (!(internalKey in this)) {
        this[internalKey] = true; // Store as a property with a truthy value
        this._size++;
      }
      return val;
    },
    // Removes a value from the set. Returns true if removed, false otherwise.
    remove: function(val) {
      var internalKey = lx_internalKeyPrefix + val;
      if (internalKey in this) {
        delete this[internalKey];
        this._size--;
        return true;
      }
      return false;
    },
    // Returns an array of all unique values in the set.
    getValues: function() {
      var uniqueVals = [];
      this.forEach(function(v) {
        uniqueVals.push(v);
      });
      return uniqueVals;
    },
    // Iterates over each value in the set.
    forEach: function(callbackFunc) {
      for (var internalProp in this) {
        if (this.hasOwnProperty(internalProp) && internalProp.charCodeAt(0) === lx_prefixCharCode) {
          callbackFunc.call(this, internalProp.substring(1));
        }
      }
    },
    // Returns the number of unique values in the set.
    getSize: function() {
      return this._size;
    },
    // Clears all values from the set.
    clear: function() {
      var valuesToRemove = this.getValues();
      for (var i = 0; i < valuesToRemove.length; i++) {
        this.remove(valuesToRemove[i]);
      }
      return this;
    }
  });

  /**
   * Creates a new lx_CustomSet instance, optionally initialized with an array of values.
   * @param {Array} [initialValues] - An array of values to add to the set.
   * @returns {lx_CustomSet} A new set instance.
   */
  toolkit.createUniqueSet = function(initialValues) {
    var newSet = new lx_CustomSet();
    if (initialValues && Array.isArray(initialValues)) {
      for (var i = 0, n = initialValues.length; i < n; ++i) {
        newSet.add(initialValues[i]);
      }
    }
    return newSet;
  };

  // Placeholder for future behavior modules.
  toolkit.interactiveBehaviors = {};

  /**
   * Rebinds methods from a source object to a target object, ensuring 'this' context.
   * Useful for exposing internal methods externally while maintaining their original context.
   * @param {Object} destination - The object to which methods will be rebound.
   * @param {Object} origin - The object from which methods are taken.
   * @param {...string} methodNames - Names of methods to rebind.
   * @returns {Object} The destination object.
   */
  toolkit.proxyMethods = function(destination, origin /*, methodNames... */ ) {
    var argIndex = 1, // Start from the second argument after destination and origin
      totalArgs = arguments.length,
      methodKey;

    while (++argIndex < totalArgs) {
      methodKey = arguments[argIndex];
      destination[methodKey] = lx_createBoundMethod(destination, origin, origin[methodKey]);
    }
    return destination;
  };

  /**
   * Helper for proxyMethods: Creates a function that calls the original method
   * with the correct 'this' context and handles return values.
   * @param {Object} targetObj - The object that will receive the proxied method.
   * @param {Object} sourceObj - The object where the original method resides.
   * @param {Function} originalMethod - The method to be bound.
   * @returns {Function} A new function that proxies the original method.
   */
  function lx_createBoundMethod(targetObj, sourceObj, originalMethod) {
    return function() {
      var result = originalMethod.apply(sourceObj, arguments);
      // If the original method returned the source object, return the target object instead
      // to allow chaining on the public interface.
      return result === sourceObj ? targetObj : result;
    };
  }

  // Utility to find a vendor-prefixed property name.
  // This is a common pattern for browser compatibility.
  function lx_getVendorPrefixedName(obj, baseName) {
    if (baseName in obj) return baseName; // Check without prefix first

    var capitalizedName = baseName.charAt(0).toUpperCase() + baseName.substring(1);
    var browserPrefixes = ["webkit", "ms", "moz", "Moz", "o", "O"]; // Common prefixes

    for (var i = 0; i < browserPrefixes.length; ++i) {
      var prefixedCandidate = browserPrefixes[i] + capitalizedName;
      if (prefixedCandidate in obj) {
        return prefixedCandidate;
      }
    }
    return undefined; // Not found with any prefix
  }

  // A simple no-operation function.
  function lx_doNothing() {}

  /**
   * Creates an event dispatcher, allowing custom events to be triggered and listened to.
   * @param {...string} eventTypes - Names of events to register.
   * @returns {Object} An event dispatcher object.
   */
  toolkit.createDispatcher = function() {
    var eventDispatcher = new lx_EventHub(),
      eventCount = arguments.length,
      idx = -1;

    // Register each event type provided.
    while (++idx < eventCount) {
      eventDispatcher[arguments[idx]] = lx_createEventSlot(eventDispatcher);
    }
    return eventDispatcher;
  };

  /**
   * Internal constructor for the event hub.
   * @private
   */
  function lx_EventHub() {}

  lx_EventHub.prototype.on = function(typeAndName, listenerCallback) {
    var dotIndex = typeAndName.indexOf("."),
      eventName = ""; // Named listener identifier

    // Parse event type and optional name.
    if (dotIndex >= 0) {
      eventName = typeAndName.substring(dotIndex + 1);
      typeAndName = typeAndName.substring(0, dotIndex);
    }

    if (typeAndName) { // If an event type is specified
      // If only type is provided, return the current listener for the given name.
      if (arguments.length < 2) {
        var eventSlot = this[typeAndName];
        return eventSlot && eventSlot.on(eventName);
      }
      // Otherwise, set the listener for the specific event type and name.
      return this[typeAndName].on(eventName, listenerCallback);
    }

    // If no specific event type, and listener is null, clear all listeners of that name across all types.
    if (arguments.length === 2 && listenerCallback == null) {
      for (var prop in this) {
        if (this.hasOwnProperty(prop) && typeof this[prop].on === 'function') {
          this[prop].on(eventName, null); // Clear listener by name for all event types
        }
      }
    }
    return this; // For chaining
  };

  /**
   * Helper function to create an event slot for a specific event type.
   * Manages listeners for a single event type.
   * @param {lx_EventHub} parentDispatcher - The main dispatcher instance.
   * @returns {Function} An event function that can trigger listeners and manage them.
   * @private
   */
  function lx_createEventSlot(parentDispatcher) {
    var activeListeners = [], // Stores all listener objects { name: '...', on: func }
      listenersByName = new lx_CustomMap(); // Maps names to listener objects for quick lookup

    /**
     * The function returned for a specific event type (e.g., dispatcher.click).
     * When called, it triggers all registered listeners for that event type.
     * @param {...*} args - Arguments to pass to the listeners.
     * @returns {lx_EventHub} The parent dispatcher for chaining.
     */
    function eventTrigger() {
      var currentListeners = activeListeners, // Snapshot listeners to prevent issues during modification
        listenerIndex = -1,
        totalListeners = currentListeners.length,
        listenerItem;

      while (++listenerIndex < totalListeners) {
        if (listenerItem = currentListeners[listenerIndex].callback) {
          listenerItem.apply(this, arguments); // Call the listener with the event context and arguments
        }
      }
      return parentDispatcher;
    }

    /**
     * Manages listeners for this specific event slot.
     * @param {string} name - The name of the listener (e.g., "myHandler").
     * @param {Function} [listenerFn] - The callback function. If null, removes the listener.
     * @returns {Function|undefined} The listener function if only 'name' is provided, or the parent dispatcher for chaining.
     */
    eventTrigger.on = function(name, listenerFn) {
      var existingListener = listenersByName.get(name),
        insertionIndex;

      // If only name is provided, return the listener function.
      if (arguments.length < 2) return existingListener && existingListener.callback;

      // If an existing listener with this name exists, remove it first.
      if (existingListener) {
        existingListener.callback = null; // Dereference callback to help GC
        insertionIndex = activeListeners.indexOf(existingListener);
        // Rebuild activeListeners array without the removed item.
        activeListeners = activeListeners.slice(0, insertionIndex).concat(activeListeners.slice(insertionIndex + 1));
        listenersByName.remove(name);
      }

      // If a new listener function is provided, add it.
      if (listenerFn) {
        var newListener = {
          name: name,
          callback: listenerFn
        };
        activeListeners.push(newListener);
        listenersByName.set(name, newListener);
      }
      return parentDispatcher; // Allow chaining
    };

    return eventTrigger;
  }

  // Global event object, similar to `window.event` but managed by the toolkit.
  toolkit.currentEvent = null;

  /**
   * Prevents the default action of the current event.
   * @returns {void}
   */
  function lx_preventCurrentDefault() {
    if (toolkit.currentEvent && typeof toolkit.currentEvent.preventDefault === 'function') {
      toolkit.currentEvent.preventDefault();
    }
  }

  /**
   * Retrieves the original source event from a wrapped event object.
   * @param {Event} wrappedEvent - The event object, potentially wrapped.
   * @returns {Event} The ultimate source event.
   */
  function lx_getEventSource(wrappedEvent) {
    var evt = wrappedEvent || toolkit.currentEvent;
    if (!evt) return null;
    var source;
    while (source = evt.sourceEvent) evt = source;
    return evt;
  }

  /**
   * Creates an event dispatcher that can be associated with a specific target.
   * Provides an 'of' method to set context and arguments for event firing.
   * @param {Object} targetObject - The object that will be the 'target' of dispatched events.
   * @param {...string} eventNames - Names of events to register for this dispatcher.
   * @returns {Object} A specialized event dispatcher.
   */
  function lx_createTargetedDispatcher(targetObject /*, eventNames... */ ) {
    var dispatcher = new lx_EventHub(),
      argIndex = 0,
      totalNames = arguments.length;

    // Register event names.
    while (++argIndex < totalNames) {
      dispatcher[arguments[argIndex]] = lx_createEventSlot(dispatcher);
    }

    /**
     * Returns a function that, when called with an event, will dispatch it
     * with a specific 'this' context and additional arguments.
     * @param {Object} contextObj - The 'this' context for event listeners.
     * @param {Array} extraArgs - Additional arguments to pass to event listeners.
     * @returns {Function} A function that takes an event object and dispatches it.
     */
    dispatcher.withContext = function(contextObj, extraArgs) {
      return function(incomingEvent) {
        var originalEvent = toolkit.currentEvent; // Store the current global event
        try {
          // Set up the new global event context.
          incomingEvent.sourceEvent = originalEvent; // Link to the previous event if nested
          incomingEvent.target = targetObject; // Assign the specific target
          toolkit.currentEvent = incomingEvent; // Update the global event

          // Trigger the specific event slot for the event type.
          var handler = dispatcher[incomingEvent.type];
          if (handler && typeof handler.apply === 'function') {
            handler.apply(contextObj, extraArgs);
          }
        } finally {
          // Restore the original global event context.
          toolkit.currentEvent = originalEvent;
        }
      };
    };
    return dispatcher;
  }

  /**
   * Escapes a string for use in a regular expression.
   * @param {string} inputString - The string to escape.
   * @returns {string} The escaped string.
   */
  toolkit.escapeRegex = function(inputString) {
    // Escape special regex characters: \ ^ $ * + ? | { } [ ] ( ) .
    var specialCharsRegex = /[\\\^\$\*\+\?\|\(\)\[\]\{\}\.]/g;
    return inputString.replace(specialCharsRegex, "\\$&");
  };

  // Regular expression for characters that need escaping in a regex.
  // This is a direct copy from original D3 logic, just renamed.
  var lx_regexEscapePattern = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  toolkit.escapeForRegex = function(inputStr) {
    return inputStr.replace(lx_regexEscapePattern, "\\$&");
  };

  // A utility for simple object inheritance (prototypal inheritance).
  // Provides a fallback for older environments (e.g., IE < 9) that don't support __proto__.
  var lx_prototypeInherit = {}.__proto__ ? function(childObj, parentProto) {
    childObj.__proto__ = parentProto;
  } : function(childObj, parentProto) {
    for (var prop in parentProto) {
      childObj[prop] = parentProto[prop]; // Copy properties directly
    }
  };

  /**
   * Augments a given object with methods from the selection prototype.
   * This is typically used internally to turn a plain array into a 'selection'.
   * @param {Array} groupsArray - The array of groups (e.g., [nodes]).
   * @returns {Array} The augmented array.
   * @private
   */
  function lx_augmentWithSelectionMethods(groupsArray) {
    lx_prototypeInherit(groupsArray, toolkit.selection.prototype);
    return groupsArray;
  }

  // DOM selection utilities.
  var lx_querySelector = function(selector, contextNode) {
      return contextNode.querySelector(selector);
    },
    lx_querySelectorAll = function(selector, contextNode) {
      return contextNode.querySelectorAll(selector);
    };

  // Feature detection for matchesSelector.
  // Uses vendor prefixes to find the correct method.
  var lx_matchesSelectorMethod = lx_rootElement[lx_getVendorPrefixedName(lx_rootElement, "matchesSelector")];

  /**
   * Checks if a DOM element matches a given CSS selector.
   * @param {Element} elementNode - The DOM element.
   * @param {string} selectorString - The CSS selector.
   * @returns {boolean} True if the element matches, false otherwise.
   */
  var lx_elementMatchesSelector = function(elementNode, selectorString) {
    return lx_matchesSelectorMethod.call(elementNode, selectorString);
  };

  // Conditional Sizzle.js integration (if Sizzle is detected).
  // This part is preserved to show the structural similarity to D3's original design.
  if (typeof Sizzle === "function") {
    lx_querySelector = function(selector, contextNode) {
      return Sizzle(selector, contextNode)[0] || null;
    };
    lx_querySelectorAll = function(selector, contextNode) {
      return Sizzle.uniqueSort(Sizzle(selector, contextNode));
    };
    lx_elementMatchesSelector = Sizzle.matchesSelector;
  }

  /**
   * Returns the root selection, which usually represents the document.
   * @returns {Object} The root selection.
   */
  toolkit.getGlobalSelection = function() {
    return lx_documentRootSelection;
  };

  // Define the prototype for selections.
  // Selections are array-like objects that have additional methods.
  var lx_selectionProto = toolkit.getGlobalSelection.prototype = [];

  /**
   * Transforms a selector string into a function that returns the first matching element.
   * @param {string|Function} selector - A CSS selector string or a function.
   * @returns {Function} A function that takes a node and returns a selected sub-node.
   * @private
   */
  function lx_resolveSelector(selector) {
    if (typeof selector === "function") return selector;
    return function(node) {
      return lx_querySelector(selector, node);
    };
  }

  // Core selection method: select a single element within each group.
  lx_selectionProto.pick = function(selector) {
    var newGroups = [],
      newGroup, selectedNode,
      currentGroup, currentNode;

    // Resolve the selector to a function for consistent application.
    var selectFn = lx_resolveSelector(selector);

    for (var j = 0, m = this.length; j < m; ++j) { // Iterate through existing groups
      newGroups.push(newGroup = []); // Each group produces a new subgroup
      currentGroup = this[j];
      for (var i = 0, n = currentGroup.length; i < n; ++i) { // Iterate through nodes in current group
        currentNode = currentGroup[i];
        if (currentNode) { // Only process if node exists
          selectedNode = selectFn.call(currentNode, currentNode, i); // Call selector function
          if (selectedNode) {
            newGroup.push(selectedNode);
          }
        }
      }
    }
    return lx_augmentWithSelectionMethods(newGroups);
  };

  // Initial root selection, representing the document (or html element).
  // It's an array of arrays, where the outer array has one element (the document/html)
  // and the inner array also has one element.
  var lx_documentRootSelection = lx_augmentWithSelectionMethods([
    [lx_rootElement]
  ]);
  lx_documentRootSelection.parentNode = lx_mainDocument; // Store parent context
  lx_documentRootSelection.node = function() {
    return lx_mainDocument;
  }; // Method to get the document node

  return toolkit;
}(); // Execute the function immediately and assign its return value to libX