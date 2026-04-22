(function() {
  // ------------------------- Core Utility Initialization ---------------------------------

  // Identify the global object, 'window' in browsers, 'global' in Node.js.
  var globalScope = this;

  // Store the existing reference of the '_' variable if it exists, to restore later if needed.
  var oldUtilsRef = globalScope._;

  // A unique marker (Symbol) used to signal early termination of iterative processes.
  // This helps to cleanly break out of loops without affecting external error handling.
  const iterationBreakSignal = Symbol('ITERATION_BREAK_FLAG');

  // A utility function to escape special characters in a string for safe use within regular expressions.
  // This helps prevent potential regex injection issues by ensuring characters like '.', '*', '(', etc.,
  // are treated as literals.
  const escapeRegexChars = function(inputString) {
    if (typeof inputString !== 'string') {
      // If the input is not a string, return an empty string to avoid errors.
      return '';
    }
    // The regex matches characters that have special meaning in regular expressions.
    // '$&' in the replacement string inserts the matched substring itself, prefixed by a backslash.
    return inputString.replace(/[\\^$*+?.()|[\]{}!@#%&]/g, '\\$&');
  };

  // Obtain direct references to the prototype objects of Array and Object for efficient property access.
  // Using `Object.getPrototypeOf([])` is a modern and robust way to get the prototype.
  const arrayProtoRef = Object.getPrototypeOf([]);
  const objectProtoRef = Object.getPrototypeOf({});

  // Create bound versions of common array and object methods.
  // This ensures these methods are called with the correct `this` context,
  // making them reusable and robust against context changes.
  const arraySliceMethod = Function.prototype.call.bind(arrayProtoRef.slice);
  const arrayUnshiftMethod = Function.prototype.call.bind(arrayProtoRef.unshift);
  const objectToStringMethod = Function.prototype.call.bind(objectProtoRef.toString);
  const objectHasOwnPropertyMethod = Function.prototype.call.bind(objectProtoRef.hasOwnProperty);
  const objectIsPropertyEnumerable = Function.prototype.call.bind(objectProtoRef.propertyIsEnumerable);

  // Cache references to native ECMA-compliant array and object methods for performance.
  // These native implementations are preferred when available due to their optimized performance.
  const
    nativeArrayIteration = arrayProtoRef.forEach,
    nativeArrayTransformation = arrayProtoRef.map,
    nativeArrayReduction = arrayProtoRef.reduce,
    nativeArrayRightReduction = arrayProtoRef.reduceRight,
    nativeArrayFiltering = arrayProtoRef.filter,
    nativeArrayAll = arrayProtoRef.every,
    nativeArrayAny = arrayProtoRef.some,
    nativeArrayFindIndex = arrayProtoRef.indexOf,
    nativeArrayFindLastIndex = arrayProtoRef.lastIndexOf,
    nativeArrayCheck = Array.isArray,
    nativeObjectPropertyKeys = Object.keys;

  // Define the main utility object, named `$$` to avoid conflicts with `_`.
  // This object will encapsulate all the helper functions.
  // In this version, `$$` is purely a functional utility collection, not a constructor.
  var $$ = function(input) {
    // This function simply returns its input, acting as an identity function
    // when invoked directly, consistent with a functional utility approach.
    return input;
  };

  // Configure export mechanisms for various JavaScript environments.
  // This ensures the utility library can be used in CommonJS (Node.js) and AMD (RequireJS) modules.
  if (typeof moduleExports !== 'undefined' && moduleExports.exports) {
    moduleExports.exports = $$;
  } else if (typeof define === 'function' && define.amd) {
    // Define the module for AMD loaders, allowing it to be loaded asynchronously.
    define('$$', [], function() {
      return $$;
    });
  }
  // Export the utility object to the global scope (e.g., `window` in browsers).
  globalScope.$$ = $$;

  // Metadata for the utility library.
  $$.LIB_VERSION = '1.0.0-beta';
  $$.BUILD_TIMESTAMP = '2023-10-27T10:30:00Z'; // Added a build timestamp

  // ------------------------ Fundamental Helper Utilities ---------------------------

  // An identity function that returns the value passed to it.
  $$.identity = function(value) {
    return value;
  };

  // A no-operation function; it does nothing and returns `undefined`.
  $$.noOperation = function() {};

  // Creates a function that, when called, always returns a predefined value.
  $$.createConstantFunction = function(fixedValue) {
    return function() {
      return fixedValue;
    };
  };

  // Determines if a value is an object (excluding null).
  $$.isObject = function(val) {
    const type = typeof val;
    return type === 'function' || (type === 'object' && val !== null);
  };

  // Determines if a value is an array. Leverages native `Array.isArray` if available.
  $$.isArray = nativeArrayCheck || function(val) {
    return objectToStringMethod(val) === '[object Array]';
  };

  // Determines if a value is a function.
  $$.isFunction = function(val) {
    return typeof val === 'function';
  };

  // Determines if a value is a number. Handles primitive numbers and `Number` objects.
  $$.isNumber = function(val) {
    return typeof val === 'number' || ($$.isObject(val) && objectToStringMethod(val) === '[object Number]');
  };

  // Determines if a value is a string. Handles primitive strings and `String` objects.
  $$.isString = function(val) {
    return typeof val === 'string' || ($$.isObject(val) && objectToStringMethod(val) === '[object String]');
  };

  // Determines if a value is a boolean. Handles primitive booleans and `Boolean` objects.
  $$.isBoolean = function(val) {
    return val === true || val === false || ($$.isObject(val) && objectToStringMethod(val) === '[object Boolean]');
  };

  // Determines if a value is a `Date` object.
  $$.isDate = function(val) {
    return objectToStringMethod(val) === '[object Date]';
  };

  // Determines if a value is a `RegExp` object.
  $$.isRegExp = function(val) {
    return objectToStringMethod(val) === '[object RegExp]';
  };

  // Determines if a value is `NaN`. Uses `Number.isNaN` for robustness.
  $$.isNotANumber = function(val) {
    return $$.isNumber(val) && Number.isNaN(val);
  };

  // Determines if a value is the `arguments` object.
  $$.isArgumentsObject = function(val) {
    return objectToStringMethod(val) === '[object Arguments]';
  };

  // Determines if a value is an HTML DOM element. (A basic check).
  $$.isDomElement = function(val) {
    return !!(val && val.nodeType === 1);
  };

  // Determines if a collection or object is empty.
  $$.isEmptyCollection = function(targetEntity) {
    if (targetEntity == null) return true; // Null or undefined are considered empty.
    if ($$.isArray(targetEntity) || $$.isString(targetEntity)) return targetEntity.length === 0;
    if ($$.isObject(targetEntity)) return nativeObjectPropertyKeys(targetEntity).length === 0;
    return false; // Other types are not typically considered "empty" in this context.
  };

  // Function to trigger the loop termination signal.
  $$.signalIterationBreak = function() {
    throw iterationBreakSignal;
  };

  // ------------------------ Collection Processing Routines ---------------------------

  // The core iteration function. Executes a `callback` for each element in a `collection`.
  // Supports native `forEach`, array-like objects, and plain objects.
  const iterateCollection = $$.forEach = function(collection, callback, contextReference) {
    // Early exit for null or undefined collections.
    if (collection == null) {
      return collection;
    }

    try {
      // Prefer native `forEach` for arrays if available for performance.
      if (nativeArrayIteration && collection.forEach === nativeArrayIteration) {
        collection.forEach(callback, contextReference);
      } else if ($$.isNumber(collection.length) && collection.length >= 0 && ($$.isArray(collection) || $$.isArgumentsObject(collection))) {
        // Handle array-like structures (arrays, `arguments` objects, NodeLists).
        // Iterates forward through numerical indices.
        for (let i = 0, len = collection.length; i < len; i++) {
          callback.call(contextReference, collection[i], i, collection);
        }
      } else if ($$.isObject(collection)) {
        // Iterate over enumerable properties of a plain object.
        // Uses `nativeObjectPropertyKeys` for a robust way to get keys.
        const objectKeys = nativeObjectPropertyKeys(collection);
        for (let j = 0, numKeys = objectKeys.length; j < numKeys; j++) {
          const currentKey = objectKeys[j];
          // Ensure the property belongs directly to the object, not its prototype.
          if (objectHasOwnPropertyMethod(collection, currentKey)) {
            callback.call(contextReference, collection[currentKey], currentKey, collection);
          }
        }
      }
    } catch (error) {
      // Catch our specific iteration break signal to stop the loop silently.
      if (error !== iterationBreakSignal) {
        // Re-throw any other unexpected errors, potentially logging them first.
        console.error("An unexpected error occurred during collection iteration:", error);
        throw error;
      }
    }
    return collection;
  };

  // Transforms a collection by applying a `transformer` function to each element,
  // returning a new array containing the results.
  $$.transformEach = function(collection, transformer, contextReference) {
    if (collection == null) return []; // Return an empty array for null/undefined input.
    // Use native `map` for arrays if available.
    if (nativeArrayTransformation && collection.map === nativeArrayTransformation) {
      return collection.map(transformer, contextReference);
    }
    const resultAccumulator = [];
    iterateCollection(collection, function(item, index, source) {
      resultAccumulator.push(transformer.call(contextReference, item, index, source));
    });
    return resultAccumulator;
  };

  // Aggregates a collection into a single value by repeatedly applying an `aggregator` function.
  $$.aggregate = function(collection, aggregator, initialValue, contextReference) {
    if (collection == null) return initialValue; // Return `initialValue` for null/undefined input.

    // Use native `reduce` for arrays if available.
    if (nativeArrayReduction && $$.isArray(collection) && collection.reduce === nativeArrayReduction) {
      return collection.reduce(function(acc, val, idx, arr) {
        return aggregator.call(contextReference, acc, val, idx, arr);
      }, initialValue);
    }

    let currentResult = initialValue;
    let hasInitialValue = arguments.length >= 3;

    // Handle the case where no initial value is provided, using the first element as the start.
    if (!hasInitialValue && collection.length > 0) {
      currentResult = collection[0];
      // Create a temporary slice to start iteration from the second element.
      const remainingElements = arraySliceMethod(collection, 1);
      iterateCollection(remainingElements, function(element, idx, source) {
        currentResult = aggregator.call(contextReference, currentResult, element, idx + 1, collection);
      });
    } else {
      iterateCollection(collection, function(element, idx, source) {
        currentResult = aggregator.call(contextReference, currentResult, element, idx, source);
      });
    }
    return currentResult;
  };

  // Right-associative version of `aggregate`. Processes elements from right to left.
  $$.aggregateRight = function(collection, aggregator, initialValue, contextReference) {
    if (collection == null) return initialValue;

    // Use native `reduceRight` for arrays if available.
    if (nativeArrayRightReduction && $$.isArray(collection) && collection.reduceRight === nativeArrayRightReduction) {
      return collection.reduceRight(function(acc, val, idx, arr) {
        return aggregator.call(contextReference, acc, val, idx, arr);
      }, initialValue);
    }

    // Manually create a reversed array for iteration.
    const reversedItems = [];
    if ($$.isArray(collection)) {
      for (let i = collection.length - 1; i >= 0; i--) {
        reversedItems.push(collection[i]);
      }
    } else if ($$.isObject(collection)) {
      // For objects, reverse the keys and store key-value pairs.
      const keysReversed = nativeObjectPropertyKeys(collection).reverse();
      for (let i = 0; i < keysReversed.length; i++) {
        const key = keysReversed[i];
        reversedItems.push({ key: key, value: collection[key] });
      }
    } else {
      return initialValue; // Cannot reduce non-iterable, non-objects.
    }

    let currentResult = initialValue;
    let hasInitialValue = arguments.length >= 3;

    if (!hasInitialValue && reversedItems.length > 0) {
      // Determine the initial value based on the type of reversed item.
      currentResult = ($$.isObject(reversedItems[0]) && reversedItems[0].hasOwnProperty('value')) ? reversedItems[0].value : reversedItems[0];
      const remainingReversed = arraySliceMethod(reversedItems, 1);
      iterateCollection(remainingReversed, function(itemData, idx) {
        const itemValue = ($$.isObject(itemData) && itemData.hasOwnProperty('value')) ? itemData.value : itemData;
        const originalIndex = ($$.isArray(collection)) ? collection.length - 2 - idx : itemData.key;
        currentResult = aggregator.call(contextReference, currentResult, itemValue, originalIndex, collection);
      });
    } else {
      iterateCollection(reversedItems, function(itemData, idx) {
        const itemValue = ($$.isObject(itemData) && itemData.hasOwnProperty('value')) ? itemData.value : itemData;
        const originalIndex = ($$.isArray(collection)) ? collection.length - 1 - idx : itemData.key;
        currentResult = aggregator.call(contextReference, currentResult, itemValue, originalIndex, collection);
      });
    }
    return currentResult;
  };

  // Finds the first element in a collection that satisfies a given `predicate` function.
  $$.findFirstMatch = function(collection, predicate, contextReference) {
    let matchedItem;
    iterateCollection(collection, function(item, index, source) {
      if (predicate.call(contextReference, item, index, source)) {
        matchedItem = item;
        $$.signalIterationBreak(); // Use the custom break mechanism.
      }
    });
    return matchedItem;
  };

  // Creates a new array containing only the elements for which the `predicate` function returns true.
  $$.filterCollection = function(collection, predicate, contextReference) {
    if (collection == null) return [];
    // Use native `filter` for arrays if available.
    if (nativeArrayFiltering && collection.filter === nativeArrayFiltering) {
      return collection.filter(predicate, contextReference);
    }
    const filteredElements = [];
    iterateCollection(collection, function(item, index, source) {
      if (predicate.call(contextReference, item, index, source)) {
        filteredElements.push(item);
      }
    });
    return filteredElements;
  };

  // Creates a new array containing only the elements for which the `predicate` function returns false.
  $$.rejectCollection = function(collection, predicate, contextReference) {
    if (collection == null) return [];
    const rejectedElements = [];
    iterateCollection(collection, function(item, index, source) {
      if (!predicate.call(contextReference, item, index, source)) {
        rejectedElements.push(item);
      }
    });
    return rejectedElements;
  };

  // Checks if all elements in a collection satisfy the `predicate` function.
  $$.testAll = function(collection, predicate, contextReference) {
    predicate = predicate || $$.identity;
    if (collection == null) return true; // An empty collection vacuously satisfies 'all'.
    // Use native `every` for arrays if available.
    if (nativeArrayAll && collection.every === nativeArrayAll) {
      return collection.every(predicate, contextReference);
    }
    let allElementsPass = true;
    iterateCollection(collection, function(item, index, source) {
      if (!predicate.call(contextReference, item, index, source)) {
        allElementsPass = false;
        $$.signalIterationBreak();
      }
    });
    return allElementsPass;
  };

  // Checks if at least one element in a collection satisfies the `predicate` function.
  $$.testAny = function(collection, predicate, contextReference) {
    predicate = predicate || $$.identity;
    if (collection == null) return false; // An empty collection cannot satisfy 'any'.
    // Use native `some` for arrays if available.
    if (nativeArrayAny && collection.some === nativeArrayAny) {
      return collection.some(predicate, contextReference);
    }
    let anyElementPasses = false;
    iterateCollection(collection, function(item, index, source) {
      if (predicate.call(contextReference, item, index, source)) {
        anyElementPasses = true;
        $$.signalIterationBreak();
      }
    });
    return anyElementPasses;
  };

  // Determines if a `targetValue` is present in a `collection` using strict equality.
  $$.includesValue = function(collection, targetValue) {
    if (collection == null) return false;
    // Use native `indexOf` for arrays if available for efficiency.
    if (nativeArrayFindIndex && collection.indexOf === nativeArrayFindIndex) {
      return collection.indexOf(targetValue) !== -1;
    }
    let foundValue = false;
    iterateCollection(collection, function(item) {
      if (item === targetValue) {
        foundValue = true;
        $$.signalIterationBreak();
      }
    });
    return foundValue;
  };

  // Invokes a specified `methodName` on each item in a `collection`, passing `additionalArgs`.
  $$.invokeMethodOnEach = function(collection, methodName, ...additionalArgs) {
    return $$.transformEach(collection, function(item) {
      const methodToCall = (methodName && item != null) ? item[methodName] : item;
      if ($$.isFunction(methodToCall)) {
        return methodToCall.apply(item, additionalArgs);
      }
      return undefined; // Return undefined if the method doesn't exist or isn't a function.
    });
  };

  // Extracts a list of values for a specific `propertyName` from a collection of objects.
  $$.extractProperty = function(collection, propertyName) {
    return $$.transformEach(collection, function(item) {
      return (item != null && objectHasOwnPropertyMethod(item, propertyName)) ? item[propertyName] : undefined;
    });
  };

  // Retrieves the maximum value from a collection. An optional `evaluator` function
  // can be provided to determine the value used for comparison.
  $$.findMaximum = function(collection, evaluator, contextReference) {
    if ($$.isEmptyCollection(collection)) return -Infinity; // Return -Infinity for empty collections.
    if (!evaluator && $$.isArray(collection)) {
      return Math.max(...collection); // Use spread operator for direct array max.
    }
    let currentMaximum = -Infinity;
    let maximumItem = undefined;

    iterateCollection(collection, function(item, index, source) {
      const evaluatedValue = evaluator ? evaluator.call(contextReference, item, index, source) : item;
      // Handle initial -Infinity and new greater values.
      if (evaluatedValue > currentMaximum || (currentMaximum === -Infinity && $$.isNumber(evaluatedValue))) {
        currentMaximum = evaluatedValue;
        maximumItem = item;
      }
    });
    return maximumItem;
  };

  // Retrieves the minimum value from a collection. An optional `evaluator` function
  // can be provided to determine the value used for comparison.
  $$.findMinimum = function(collection, evaluator, contextReference) {
    if ($$.isEmptyCollection(collection)) return Infinity; // Return Infinity for empty collections.
    if (!evaluator && $$.isArray(collection)) {
      return Math.min(...collection); // Use spread operator for direct array min.
    }
    let currentMinimum = Infinity;
    let minimumItem = undefined;

    iterateCollection(collection, function(item, index, source) {
      const evaluatedValue = evaluator ? evaluator.call(contextReference, item, index, source) : item;
      // Handle initial Infinity and new smaller values.
      if (evaluatedValue < currentMinimum || (currentMinimum === Infinity && $$.isNumber(evaluatedValue))) {
        currentMinimum = evaluatedValue;
        minimumItem = item;
      }
    });
    return minimumItem;
  };

  // Sorts a collection based on a criterion produced by a `criterionFunction`.
  $$.sortCollectionBy = function(collection, criterionFunction, contextReference) {
    if (collection == null) return [];
    const itemsWithCriteria = $$.transformEach(collection, function(item, index, source) {
      return {
        originalElement: item, // Store the original item.
        sortingCriterion: criterionFunction.call(contextReference, item, index, source)
      };
    });

    itemsWithCriteria.sort(function(leftEntry, rightEntry) {
      const a = leftEntry.sortingCriterion;
      const b = rightEntry.sortingCriterion;
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    });

    return $$.extractProperty(itemsWithCriteria, 'originalElement');
  };

  // Determines the correct insertion index for an element in a `sortedArray`
  // to maintain its sorted order, using a binary search algorithm.
  $$.getSortedInsertionPoint = function(sortedArray, targetElement, valueExtractor) {
    valueExtractor = valueExtractor || $$.identity;
    if (!$$.isArray(sortedArray)) return 0; // If not an array, assume insertion at start.

    let lowPointer = 0;
    let highPointer = sortedArray.length;
    const extractedTargetValue = valueExtractor(targetElement);

    while (lowPointer < highPointer) {
      const midPointer = Math.floor((lowPointer + highPointer) / 2); // Use Math.floor for integer division.
      if (valueExtractor(sortedArray[midPointer]) < extractedTargetValue) {
        lowPointer = midPointer + 1;
      } else {
        highPointer = midPointer;
      }
    }
    return lowPointer;
  };

  // Converts any iterable or array-like structure into a true JavaScript array.
  $$.convertToArray = function(input) {
    if (input == null) return [];
    if ($$.isArray(input)) return arraySliceMethod(input); // Return a shallow copy if already an array.
    if (input.toArray && $$.isFunction(input.toArray)) return input.toArray();
    if ($$.isArgumentsObject(input)) return arraySliceMethod(input);
    if (typeof input[Symbol.iterator] === 'function') {
      return Array.from(input); // Support for ES6 iterables.
    }
    if ($$.isObject(input)) {
      return $$.getObjectValues(input); // Fallback for plain objects.
    }
    return [];
  };

  // Returns the number of elements in a collection or object.
  $$.getElementCount = function(collection) {
    if (collection == null) return 0;
    if ($$.isNumber(collection.length)) return collection.length;
    return $$.convertToArray(collection).length; // Use our `convertToArray` for robustness.
  };

  // -------------------------- Array Manipulation Functions ------------------------------

  // Retrieves the first element(s) of an array. If `count` is provided, returns the first `count` elements.
  $$.retrieveFirst = function(inputArray, count, isInternalFlag) {
    if (inputArray == null || inputArray.length === 0) return undefined;
    if (count != null && !isInternalFlag) {
      return arraySliceMethod(inputArray, 0, count);
    }
    return inputArray[0];
  };

  // Retrieves all elements of an array except the first one (or from a `startIndex` onward).
  $$.retrieveRemaining = function(inputArray, startIndex, isInternalFlag) {
    if (inputArray == null) return [];
    const actualStartIndex = (startIndex == null || isInternalFlag) ? 1 : startIndex;
    return arraySliceMethod(inputArray, actualStartIndex);
  };

  // Retrieves the last element of an array.
  $$.retrieveLast = function(inputArray) {
    if (inputArray == null || inputArray.length === 0) return undefined;
    return inputArray[inputArray.length - 1];
  };

  // Creates a new array with all falsy values (false, null, 0, "", undefined, NaN) removed.
  $$.removeFalsy = function(inputArray) {
    if (inputArray == null) return [];
    return $$.filterCollection(inputArray, function(item) {
      return Boolean(item); // Explicitly convert to boolean.
    });
  };

  // Flattens a deeply nested array into a single-level array using an iterative approach.
  $$.unrollDeepArray = function(nestedArray) {
    if (!$$.isArray(nestedArray)) return [];
    const flattenedResult = [];
    const processingStack = [...nestedArray]; // Initialize stack with a shallow copy.

    while (processingStack.length > 0) {
      const currentElement = processingStack.shift(); // Process elements in order.
      if ($$.isArray(currentElement)) {
        arrayUnshiftMethod.apply(processingStack, currentElement); // Add nested elements to the front of the stack.
      } else {
        flattenedResult.push(currentElement);
      }
    }
    return flattenedResult;
  };

  // Returns a new array with specified `valuesToExclude` removed.
  $$.omitValues = function(inputArray, ...valuesToExclude) {
    if (inputArray == null) return [];
    return $$.filterCollection(inputArray, function(item) {
      return !$$.includesValue(valuesToExclude, item);
    });
  };

  // Produces a version of the array containing only unique elements.
  $$.getUniqueElements = function(inputArray, isPreSorted) {
    if (inputArray == null) return [];
    const distinctList = [];
    const encounteredValues = new Set(); // Use a Set for efficient uniqueness checks.

    iterateCollection(inputArray, function(item) {
      if (!encounteredValues.has(item)) {
        encounteredValues.add(item);
        distinctList.push(item);
      }
    });
    return distinctList;
  };

  // Computes the intersection of multiple arrays, returning elements common to all.
  $$.findCommonElements = function(firstArray, ...otherArrays) {
    if (firstArray == null || firstArray.length === 0) return [];
    const uniqueFirstArray = $$.getUniqueElements(firstArray);
    const commonElements = [];

    iterateCollection(uniqueFirstArray, function(item) {
      let isPresentInAll = true;
      for (let i = 0; i < otherArrays.length; i++) {
        if (!$$.includesValue(otherArrays[i], item)) {
          isPresentInAll = false;
          break;
        }
      }
      if (isPresentInAll) {
        commonElements.push(item);
      }
    });
    return commonElements;
  };

  // Combines multiple arrays into a single array of tuples, where each tuple
  // contains elements at the same index from the input arrays.
  $$.interleaveArrays = function(...inputArrays) {
    if (inputArrays.length === 0) return [];
    const arrayLengths = $$.transformEach(inputArrays, arr => arr ? arr.length : 0);
    const maximumLength = Math.max(...arrayLengths);
    const interleavedResult = [];

    for (let i = 0; i < maximumLength; i++) {
      const currentTuple = $$.transformEach(inputArrays, arr => (arr && i < arr.length) ? arr[i] : undefined);
      interleavedResult.push(currentTuple);
    }
    return interleavedResult;
  };

  // Finds the first index of a `targetElement` in an `inputArray`.
  $$.locateFirstIndex = function(inputArray, targetElement) {
    if (inputArray == null) return -1;
    // Use native `indexOf` for arrays if available.
    if (nativeArrayFindIndex && inputArray.indexOf === nativeArrayFindIndex) {
      return inputArray.indexOf(targetElement);
    }
    for (let i = 0, len = inputArray.length; i < len; i++) {
      if (inputArray[i] === targetElement) return i;
    }
    return -1;
  };

  // Finds the last index of a `targetElement` in an `inputArray`.
  $$.locateLastIndex = function(inputArray, targetElement) {
    if (inputArray == null) return -1;
    // Use native `lastIndexOf` for arrays if available.
    if (nativeArrayFindLastIndex && inputArray.lastIndexOf === nativeArrayFindLastIndex) {
      return inputArray.lastIndexOf(targetElement);
    }
    for (let i = inputArray.length - 1; i >= 0; i--) {
      if (inputArray[i] === targetElement) return i;
    }
    return -1;
  };

  // Generates an array of numbers within a specified range, similar to Python's `range()`.
  $$.createNumberSequence = function(startOrEnd, endValue, stepIncrement) {
    const argumentsPassed = $$.convertToArray(arguments);
    let start = 0;
    let end = 0;
    let step = 1;

    // Parse arguments based on count, supporting different signatures.
    if (argumentsPassed.length === 1) {
      end = startOrEnd;
    } else if (argumentsPassed.length >= 2) {
      start = startOrEnd;
      end = endValue;
      if (argumentsPassed.length >= 3) {
        step = stepIncrement;
      }
    } else {
      return []; // No valid arguments provided.
    }

    if (step === 0) {
      throw new Error("Step value cannot be zero for sequence generation.");
    }

    const sequenceResult = [];
    if (step > 0) {
      for (let i = start; i < end; i += step) {
        sequenceResult.push(i);
      }
    } else { // Negative step.
      for (let i = start; i > end; i += step) {
        sequenceResult.push(i);
      }
    }
    return sequenceResult;
  };

  // ----------------------- Function Manipulation Utilities ------------------------------

  // Creates a new function where the `this` context and initial arguments are permanently bound.
  $$.bindContextAndArguments = function(operationFunction, boundContext, ...initialArguments) {
    if (!$$.isFunction(operationFunction)) {
      throw new TypeError('The target must be a callable function.');
    }
    const finalContext = boundContext ?? this; // Use nullish coalescing for context.
    return function(...runtimeArguments) {
      return operationFunction.apply(finalContext, initialArguments.concat(runtimeArguments));
    };
  };

  // Binds all specified methods of an `object` to that `object` instance itself.
  $$.bindObjectMethods = function(targetObject, ...specificMethodNames) {
    if (targetObject == null) {
      throw new TypeError('Cannot bind methods on a null or undefined object.');
    }
    // If no specific method names are provided, bind all callable methods.
    const methodsToProcess = specificMethodNames.length > 0 ? specificMethodNames : $$.getCallableProperties(targetObject);
    iterateCollection(methodsToProcess, function(methodName) {
      if ($$.isFunction(targetObject[methodName])) {
        targetObject[methodName] = $$.bindContextAndArguments(targetObject[methodName], targetObject);
      }
    });
    return targetObject;
  };

  // Delays the execution of a `callbackFunction` by `delayMilliseconds`,
  // passing `invocationArguments` to it.
  $$.delayFunctionCall = function(callbackFunction, delayMilliseconds, ...invocationArguments) {
    if (!$$.isFunction(callbackFunction)) {
      throw new TypeError('The function to delay must be callable.');
    }
    return setTimeout(function() {
      return callbackFunction.apply(null, invocationArguments);
    }, delayMilliseconds);
  };

  // Defers a `callbackFunction`'s execution until the current JavaScript call stack has cleared.
  $$.deferFunctionCall = function(callbackFunction, ...invocationArguments) {
    if (!$$.isFunction(callbackFunction)) {
      throw new TypeError('The function to defer must be callable.');
    }
    // Using setTimeout with a 0ms delay effectively pushes the function to the end of the event queue.
    return setTimeout(function() {
      return callbackFunction.apply(null, invocationArguments);
    }, 0);
  };

  // Wraps an `originalFunction` with a `wrapperFunction`, allowing the wrapper to
  // intercept and augment the original function's behavior.
  $$.createFunctionWrapper = function(originalFunction, wrapperFunction) {
    if (!$$.isFunction(originalFunction) || !$$.isFunction(wrapperFunction)) {
      throw new TypeError('Both original and wrapper must be callable functions.');
    }
    return function(...runtimeArguments) {
      const combinedArguments = [originalFunction, ...runtimeArguments];
      // Preserve the `this` context of the call to the wrapped function.
      return wrapperFunction.apply(this, combinedArguments);
    };
  };

  // Creates a new function that is a composition of several `functionsInOrder`.
  // The output of one function becomes the input of the next, from right to left.
  $$.composeFunctionChain = function(...functionsInOrder) {
    // Filter out non-functions and reverse the order once for efficient iteration.
    const validFunctions = functionsInOrder.filter($$.isFunction).reverse();

    if (validFunctions.length === 0) {
      return $$.identity; // If no valid functions, return an identity function.
    }

    return function(...initialArgs) {
      let currentArguments = initialArgs;
      for (let i = 0; i < validFunctions.length; i++) {
        // Apply the current function and update `currentArguments` with its result.
        currentArguments = [validFunctions[i].apply(this, currentArguments)];
      }
      return currentArguments[0];
    };
  };

  // ------------------------- Object Manipulation Utilities ------------------------------

  // Retrieves the enumerable property names of an `inputObject`.
  $$.getObjectPropertyNames = nativeObjectPropertyKeys || function(inputObject) {
    if (!$$.isObject(inputObject)) return [];
    if ($$.isArray(inputObject)) return $$.createNumberSequence(0, inputObject.length);
    const propertyNamesList = [];
    for (const property in inputObject) {
      if (objectHasOwnPropertyMethod(inputObject, property)) propertyNamesList.push(property);
    }
    return propertyNamesList;
  };

  // Retrieves the enumerable property values of an `inputObject`.
  $$.getObjectPropertyValues = function(inputObject) {
    if (!$$.isObject(inputObject)) return [];
    const valuesOutput = [];
    const keys = $$.getObjectPropertyNames(inputObject);
    iterateCollection(keys, function(key) {
      valuesOutput.push(inputObject[key]);
    });
    return valuesOutput;
  };

  // Returns a sorted list of the names of callable methods available on an `inputObject`.
  $$.getCallableProperties = function(inputObject) {
    if (!$$.isObject(inputObject)) return [];
    return $$.getObjectPropertyNames(inputObject)
      .filter(function(propName) {
        return $$.isFunction(inputObject[propName]);
      })
      .sort();
  };

  // Merges properties from one or more `sourceObjects` into a `destinationObject`.
  // Properties in later source objects overwrite properties from earlier ones.
  $$.deepMergeObjects = function(destinationObject, ...sourceObjects) {
    if (!$$.isObject(destinationObject)) {
      destinationObject = {}; // Initialize `destinationObject` if it's not an object.
    }
    iterateCollection(sourceObjects, function(sourceObj) {
      if ($$.isObject(sourceObj)) {
        for (const propertyName in sourceObj) {
          // Get the property descriptor to handle getters/setters correctly.
          const descriptor = Object.getOwnPropertyDescriptor(sourceObj, propertyName);
          if (descriptor) {
            if (descriptor.get || descriptor.set) {
              Object.defineProperty(destinationObject, propertyName, descriptor);
            } else {
              destinationObject[propertyName] = sourceObj[propertyName];
            }
          }
        }
      }
    });
    return destinationObject;
  };

  // Creates a shallow clone (duplicate) of an object or array.
  $$.createShallowCopy = function(original) {
    if (original == null) return original;
    if ($$.isArray(original)) return Array.from(original);
    if ($$.isObject(original)) return $$.deepMergeObjects({}, original); // Use merge to clone objects.
    return original; // Return primitives as they are immutable.
  };

  // Invokes an `interceptorFunction` with `valueToProcess`, then returns the `valueToProcess`.
  // Useful for side effects within method chains.
  $$.pipeThroughInterceptor = function(valueToProcess, interceptorFunction) {
    if ($$.isFunction(interceptorFunction)) {
      interceptorFunction(valueToProcess);
    }
    return valueToProcess;
  };

  // Performs a deep comparison to check if two values are equivalent.
  $$.areValuesDeepEqual = function(valueA, valueB) {
    // Strict equality check first.
    if (valueA === valueB) return true;

    // Handle null/undefined values (null === null, undefined === undefined, null !== undefined).
    if (valueA == null || valueB == null) return valueA === valueB;

    // Check for a custom `isCustomEqual` method on the first object for specialized comparison.
    if ($$.isFunction(valueA.isCustomEqual)) {
      return valueA.isCustomEqual(valueB);
    }

    const typeOfA = typeof valueA;
    const typeOfB = typeof valueB;

    // If types are different, they're not deep equal (unless one is a primitive wrapper).
    if (typeOfA !== typeOfB) return false;

    // Compare Date objects by their time value.
    if ($$.isDate(valueA) && $$.isDate(valueB)) {
      return valueA.getTime() === valueB.getTime();
    }

    // Compare RegExp objects by their source string and flags.
    if ($$.isRegExp(valueA) && $$.isRegExp(valueB)) {
      return valueA.source === valueB.source &&
             valueA.flags === valueB.flags;
    }

    // Handle NaN explicitly (NaN is not equal to itself).
    if ($$.isNotANumber(valueA) && $$.isNotANumber(valueB)) return true;

    // If not objects by this point, and not strictly equal, they cannot be deep equal.
    if (!($$.isObject(valueA) && $$.isObject(valueB))) {
      return false;
    }

    // --- Deep comparison for objects and arrays ---
    const keysFromA = $$.getObjectPropertyNames(valueA);
    const keysFromB = $$.getObjectPropertyNames(valueB);

    // If the number of properties differs, the objects are not equal.
    if (keysFromA.length !== keysFromB.length) return false;

    // Iterate through properties of `valueA` and recursively compare their values.
    for (let i = 0; i < keysFromA.length; i++) {
      const currentKey = keysFromA[i];
      // Check if `valueB` has the same property and if their values are deep equal.
      if (!objectHasOwnPropertyMethod(valueB, currentKey) || !$$.areValuesDeepEqual(valueA[currentKey], valueB[currentKey])) {
        return false;
      }
    }

    return true;
  };

})();