/*
 * Core JavaScript Utility Package
 * Version: 2.0.1
 * Build Timestamp: Fri Oct 27 2023 10:00:00 GMT
 * Project URL: http://example.com/utility-kit
 *
 * Copyright 2023 Acme Corp.
 * This software is licensed under the Apache 2.0 License.
 *
 * Incorporates concepts from Underscore.js
 * (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
 * Released under the MIT license.
 */
(function(globalContext) {
  // Initialize the primary global namespace for this utility package.
  // If 'AppUtils' already exists, reuse it; otherwise, create an empty object.
  globalContext.AppUtils = globalContext.AppUtils || {};
  // Store the current version number within the global namespace.
  globalContext.AppUtils.LIB_VERSION_STRING = "2.0.1";
}(this));


// Comprehensive JavaScript Toolkit v2.0.1
// (c) 2023 Acme Corp.
// Freely available under the Apache 2.0 open-source license.
// Design influenced by Underscore.js.
// For detailed API reference, visit: https://example.com/docs/toolkit

(function() {

  // --- Module Initialization ---
  // Sets up the foundational components for the toolkit.

  // Establish a reference to the global object, which is typically `window` in web browsers
  // or `global` in Node.js environments.
  var executionEnvironment = this;

  // Preserve any previously defined global variable named `_` to prevent conflicts.
  var oldUnderscoreRef = executionEnvironment._;

  // A unique object used as a signal to prematurely exit iteration loops.
  var loopBreakToken = {};

  // Cache frequently accessed prototype methods for performance optimization
  // and to ensure robustness against potential prototype modifications.
  var arrayPrototypeReference = Array.prototype;
  var objectPrototypeReference = Object.prototype;
  var functionPrototypeReference = Function.prototype;

  // Create local aliases for core array and object methods for faster access.
  var arraySliceMethod       = arrayPrototypeReference.slice;
  var arrayUnshiftMethod     = arrayPrototypeReference.unshift;
  var objectToStringMethod   = objectPrototypeReference.toString;
  var objectHasOwnProperty   = objectPrototypeReference.hasOwnProperty;

  // Store references to native ECMAScript 5 implementations of collection methods.
  // These are preferred when available for performance and reliability.
  var
    nativeArrayIterate      = arrayPrototypeReference.forEach,
    nativeArrayTransform    = arrayPrototypeReference.map,
    nativeArrayAccumulate   = arrayPrototypeReference.reduce,
    nativeArrayAccumulateRight = arrayPrototypeReference.reduceRight,
    nativeArrayFilter       = arrayPrototypeReference.filter,
    nativeArrayCheckAll     = arrayPrototypeReference.every,
    nativeArrayCheckAny     = arrayPrototypeReference.some,
    nativeArrayFindIndex    = arrayPrototypeReference.indexOf,
    nativeArrayLastIndex    = arrayPrototypeReference.lastIndexOf,
    nativeCheckIsArray      = Array.isArray,
    nativeObjectKeys        = Object.keys,
    nativeFunctionBind      = functionPrototypeReference.bind;

  // The primary utility object, exposed globally as `_`.
  // It also serves as a factory for `ChainableWrapper` instances.
  var _ = function(inputObject) {
    return new ChainableWrapper(inputObject);
  };

  // A constructor function used to wrap values for method chaining.
  var ChainableWrapper = function(valueToWrap) {
    this._wrappedValue = valueToWrap;
  };

  // Configure export mechanisms for various JavaScript environments.
  // Supports CommonJS (Node.js) and browser global scope.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _; // Node.js module export.
    }
    exports._ = _; // Also export as a named property.
  } else {
    executionEnvironment['_'] = _; // Browser global attachment.
  }

  // Set the current version of the utility toolkit.
  _.VERSION_IDENTIFIER = '2.0.1';

  // --- Collection Processing Functions ---
  // These functions operate on both array-like structures and plain objects.

  // A fundamental iteration function, similar to `forEach`.
  // It intelligently handles arrays, array-like objects, and general objects,
  // preferring native `forEach` when available.
  var iterateOverCollection = _.each = _.forEach = function(collectionData, callbackFn, contextObj) {
    // Basic validation: Exit early if the collection is null or undefined.
    if (collectionData === null || collectionData === undefined) {
      return;
    }

    // Attempt to use the native `forEach` method if it exists and is applicable.
    if (nativeArrayIterate && collectionData.forEach === nativeArrayIterate) {
      collectionData.forEach(callbackFn, contextObj);
      return;
    }

    // Handle array-like objects (e.g., arguments objects, DOM NodeLists).
    if (typeof collectionData.length === 'number' && collectionData.length === +collectionData.length) {
      for (var k = 0, limit = collectionData.length; k < limit; k++) {
        // Ensure the property is directly on the object (handles sparse arrays).
        if (objectHasOwnProperty.call(collectionData, k) && callbackFn.call(contextObj, collectionData[k], k, collectionData) === loopBreakToken) {
          return; // Stop iteration if the callback returns the break token.
        }
      }
      return;
    }

    // Fallback for iterating over properties of plain objects.
    var objectKeys = _.keys(collectionData);
    for (var i = 0, len = objectKeys.length; i < len; i++) {
        var key = objectKeys[i];
        if (callbackFn.call(contextObj, collectionData[key], key, collectionData) === loopBreakToken) {
            return; // Terminate early.
        }
    }
  };

  // Applies an iterator function to each element in a collection,
  // returning a new array with the transformed results.
  // Delegates to native `map` where possible.
  _.map = _.collect = function(sourceCollection, transformationFn, transformationContext) {
    var transformedElements = [];
    if (sourceCollection === null || sourceCollection === undefined) {
      return transformedElements;
    }

    // Use native `map` if available for performance.
    if (nativeArrayTransform && sourceCollection.map === nativeArrayTransform) {
      return sourceCollection.map(transformationFn, transformationContext);
    }

    // Manual mapping process.
    iterateOverCollection(sourceCollection, function(itemVal, itemIdx, allItems) {
      transformedElements.push(transformationFn.call(transformationContext, itemVal, itemIdx, allItems));
    });
    // For array-like objects, ensure the resulting array has the correct length.
    if (typeof sourceCollection.length === 'number' && sourceCollection.length === +sourceCollection.length) {
        transformedElements.length = sourceCollection.length;
    }
    return transformedElements;
  };

  // Reduces a collection to a single value by iteratively applying a function.
  // Also known as `inject` or `foldl`.
  // Leverages native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(inputCollection, reducerFunction, initialValue, operationContext) {
    var hasExplicitInitialValue = (arguments.length > 2);
    if (inputCollection === null || inputCollection === undefined) {
        inputCollection = []; // Treat null/undefined collections as empty for reduction.
    }

    // Prefer native `reduce` for efficiency.
    if (nativeArrayAccumulate && inputCollection.reduce === nativeArrayAccumulate) {
      if (operationContext) {
        reducerFunction = _.bind(reducerFunction, operationContext);
      }
      return hasExplicitInitialValue ? inputCollection.reduce(reducerFunction, initialValue) : inputCollection.reduce(reducerFunction);
    }

    // Manual reduction for non-native environments or non-array-like objects.
    var currentAccumulator = initialValue;
    var isFirstElement = true; // Flag to handle the first element when no initial value is given.

    iterateOverCollection(inputCollection, function(element, index, list) {
      if (!hasExplicitInitialValue && isFirstElement) {
        currentAccumulator = element;
        isFirstElement = false;
      } else {
        currentAccumulator = reducerFunction.call(operationContext, currentAccumulator, element, index, list);
      }
    });

    // Error handling for empty collections without an initial value.
    if (!hasExplicitInitialValue && _.size(inputCollection) === 0) {
      throw new TypeError('Cannot reduce an empty collection without an initial accumulator value.');
    }
    return currentAccumulator;
  };

  // Performs a right-to-left reduction on a collection, also known as `foldr`.
  // Delegates to native `reduceRight` if available.
  _.reduceRight = _.foldr = function(inputCollection, reducerFunction, initialValue, operationContext) {
    var hasExplicitInitial = (arguments.length > 2);
    if (inputCollection === null || inputCollection === undefined) {
        inputCollection = []; // Default to empty array for processing.
    }

    // Use native `reduceRight` if supported.
    if (nativeArrayAccumulateRight && inputCollection.reduceRight === nativeArrayAccumulateRight) {
      if (operationContext) {
        reducerFunction = _.bind(reducerFunction, operationContext);
      }
      return hasExplicitInitial ? inputCollection.reduceRight(reducerFunction, initialValue) : inputCollection.reduceRight(reducerFunction);
    }

    // Manual implementation: convert to array, reverse, then use standard `reduce`.
    var reversedArray = _.toArray(inputCollection).reverse();
    // Re-bind the function if a context is provided and there isn't an explicit initial value
    // because `_.reduce` might otherwise use `reversedArray[0]` as context if not careful.
    if (operationContext && !hasExplicitInitial) {
        reducerFunction = _.bind(reducerFunction, operationContext);
    }
    // Pass the context to `_.reduce` if it's there.
    return hasExplicitInitial ? _.reduce(reversedArray, reducerFunction, initialValue, operationContext) : _.reduce(reversedArray, reducerFunction);
  };

  // Finds the first element in a collection that satisfies a given predicate function.
  // Aliased as `detect`.
  _.find = _.detect = function(dataCollection, predicateFn, predicateContext) {
    var foundElement;
    // Use `_.some` to efficiently iterate and stop once a match is found.
    _.some(dataCollection, function(itemVal, itemIdx, fullList) {
      if (predicateFn.call(predicateContext, itemVal, itemIdx, fullList)) {
        foundElement = itemVal;
        return true; // Signal `_.some` to stop.
      }
      return false; // Continue searching.
    });
    return foundElement;
  };

  // Filters a collection, returning a new array containing only elements
  // for which the predicate function returns a truthy value.
  // Delegates to native `filter` if available.
  _.filter = _.select = function(sourceCollection, predicateFn, contextForPredicate) {
    var matchingElements = [];
    if (sourceCollection === null || sourceCollection === undefined) {
      return matchingElements;
    }
    // Prefer native `filter` for performance.
    if (nativeArrayFilter && sourceCollection.filter === nativeArrayFilter) {
      return sourceCollection.filter(predicateFn, contextForPredicate);
    }

    // Manual filtering.
    iterateOverCollection(sourceCollection, function(element, index, list) {
      if (predicateFn.call(contextForPredicate, element, index, list)) {
        matchingElements.push(element);
      }
    });
    return matchingElements;
  };

  // Returns a new array containing all elements for which the predicate function
  // returns a falsy value (i.e., elements that do NOT pass the truth test).
  _.reject = function(sourceCollection, predicateFn, contextForPredicate) {
    var nonMatchingElements = [];
    if (sourceCollection === null || sourceCollection === undefined) {
      return nonMatchingElements;
    }
    iterateOverCollection(sourceCollection, function(element, index, list) {
      if (!predicateFn.call(contextForPredicate, element, index, list)) {
        nonMatchingElements.push(element);
      }
    });
    return nonMatchingElements;
  };

  // Checks if all elements in a collection satisfy a given predicate function.
  // Delegates to native `every` if available. Aliased as `all`.
  _.every = _.all = function(sourceCollection, predicateFn, contextForPredicate) {
    var allPass = true; // Assume all elements pass until one fails.
    if (sourceCollection === null || sourceCollection === undefined) {
      return allPass; // Empty collections are considered to pass `every` test.
    }
    // Prefer native `every`.
    if (nativeArrayCheckAll && sourceCollection.every === nativeArrayCheckAll) {
      return sourceCollection.every(predicateFn, contextForPredicate);
    }

    iterateOverCollection(sourceCollection, function(element, index, list) {
      if (!predicateFn.call(contextForPredicate, element, index, list)) {
        allPass = false; // Found an element that fails the test.
        return loopBreakToken; // Stop further iteration.
      }
    });
    return allPass;
  };

  // Checks if at least one element in a collection satisfies a given predicate function.
  // Delegates to native `some` if available. Aliased as `any`.
  var checkAny = _.some = _.any = function(sourceCollection, predicateFn, contextForPredicate) {
    // If no predicate is provided, default to the identity function.
    var effectivePredicate = predicateFn || _.identity;
    var foundMatch = false; // Assume no match initially.
    if (sourceCollection === null || sourceCollection === undefined) {
      return foundMatch; // Empty collections don't have any matching elements.
    }
    // Prefer native `some`.
    if (nativeArrayCheckAny && sourceCollection.some === nativeArrayCheckAny) {
      return sourceCollection.some(effectivePredicate, contextForPredicate);
    }

    iterateOverCollection(sourceCollection, function(element, index, list) {
      if (effectivePredicate.call(contextForPredicate, element, index, list)) {
        foundMatch = true; // Found a matching element.
        return loopBreakToken; // Stop further iteration.
      }
    });
    return foundMatch;
  };

  // Determines if a specific `targetValue` is present in a collection (array or object).
  // Uses strict equality (`===`). Aliased as `contains`.
  _.include = _.contains = function(collection, targetValue) {
    if (collection === null || collection === undefined) {
      return false;
    }
    // For arrays, use native `indexOf` if available.
    if (nativeArrayFindIndex && collection.indexOf === nativeArrayFindIndex) {
      return collection.indexOf(targetValue) !== -1;
    }

    // For other collection types or non-native environments, use `_.some`.
    var isPresent = false;
    checkAny(collection, function(element) {
      if (element === targetValue) {
        isPresent = true;
        return true; // Signal to stop iteration.
      }
      return false;
    });
    return isPresent;
  };

  // Invokes a method (specified by `methodNameOrFunction`) on each item in a collection.
  // Any additional arguments are passed to the invoked method.
  _.invoke = function(dataCollection, methodNameOrFunction) {
    // Capture arguments to be passed to the invoked method.
    var methodArguments = arraySliceMethod.call(arguments, 2);
    return _.map(dataCollection, function(currentItem) {
      // Determine the actual method to call (function or string property name).
      var targetMethod = _.isFunction(methodNameOrFunction) ? methodNameOrFunction : currentItem[methodNameOrFunction];
      // Ensure the target method exists and is callable.
      if (targetMethod && _.isFunction(targetMethod)) {
        return targetMethod.apply(currentItem, methodArguments);
      }
      return undefined; // Return undefined if the method is not found or not callable.
    });
  };

  // Extracts a specific `propertyKey` from each object in a collection,
  // returning an array of those property values.
  _.pluck = function(dataCollection, propertyKey) {
    return _.map(dataCollection, function(currentItem){
      // Safely access the property; return undefined if item is null/undefined or property doesn't exist.
      return (currentItem !== null && currentItem !== undefined) ? currentItem[propertyKey] : undefined;
    });
  };

  // Finds the maximum element in a collection.
  // An optional `iterator` can be provided to compute a value for comparison.
  _.max = function(collection, iteratorFn, context) {
    // Optimization for simple numeric arrays without an iterator.
    if (!iteratorFn && _.isArray(collection) && collection.length > 0 && _.isNumber(collection[0])) {
      return Math.max.apply(Math, collection);
    }
    // Return negative infinity for empty collections without an iterator.
    if (!iteratorFn && _.isEmpty(collection)) {
      return -Infinity;
    }

    var maxResult = { comparisonValue : -Infinity, actualItem: undefined };
    iterateOverCollection(collection, function(itemVal, itemIdx, entireCollection) {
      var computedValue = iteratorFn ? iteratorFn.call(context, itemVal, itemIdx, entireCollection) : itemVal;
      if (computedValue >= maxResult.comparisonValue) { // Use >= to get the last maximum in case of ties.
        maxResult.comparisonValue = computedValue;
        maxResult.actualItem = itemVal;
      }
    });
    return maxResult.actualItem;
  };

  // Finds the minimum element in a collection.
  // An optional `iterator` can be provided to compute a value for comparison.
  _.min = function(collection, iteratorFn, context) {
    // Optimization for simple numeric arrays without an iterator.
    if (!iteratorFn && _.isArray(collection) && collection.length > 0 && _.isNumber(collection[0])) {
      return Math.min.apply(Math, collection);
    }
    // Return positive infinity for empty collections without an iterator.
    if (!iteratorFn && _.isEmpty(collection)) {
      return Infinity;
    }

    var minResult = { comparisonValue : Infinity, actualItem: undefined };
    iterateOverCollection(collection, function(itemVal, itemIdx, entireCollection) {
      var computedValue = iteratorFn ? iteratorFn.call(context, itemVal, itemIdx, entireCollection) : itemVal;
      if (computedValue < minResult.comparisonValue) {
        minResult.comparisonValue = computedValue;
        minResult.actualItem = itemVal;
      }
    });
    return minResult.actualItem;
  };

  // Randomly shuffles the elements of an array using the Fisher-Yates algorithm.
  _.shuffle = function(inputArray) {
    if (!_.isArray(inputArray)) {
        return []; // Return an empty array for non-array inputs.
    }
    var shuffledArray = [];
    var randomIdx;
    iterateOverCollection(inputArray, function(elementValue, currentIndex) {
      randomIdx = Math.floor(Math.random() * (currentIndex + 1));
      // Perform a swap operation.
      if (currentIndex !== randomIdx) { // Only swap if indices are different.
          shuffledArray[currentIndex] = shuffledArray[randomIdx];
      }
      shuffledArray[randomIdx] = elementValue;
    });
    return shuffledArray;
  };

  // Sorts the values in a collection based on a criterion produced by an iterator function
  // or a property key. Returns a new sorted array.
  _.sortBy = function(collection, criterion, context) {
    // Determine the actual iterator function.
    var sortIterator = _.isFunction(criterion) ? criterion : function(item) { return item[criterion]; };

    // Transform each item into an object containing its original value and the computed criterion.
    var mappedForSorting = _.map(collection, function(itemValue, itemIndex, fullList) {
      return {
        originalElement : itemValue,
        sortCriterion : sortIterator.call(context, itemValue, itemIndex, fullList)
      };
    });

    // Sort the temporary objects based on their `sortCriterion`.
    mappedForSorting.sort(function(leftObj, rightObj) {
      var critA = leftObj.sortCriterion;
      var critB = rightObj.sortCriterion;

      // Custom comparison logic for undefined values (pushes them to the end).
      if (critA === undefined) return 1;
      if (critB === undefined) return -1;

      if (critA < critB) return -1;
      if (critA > critB) return 1;
      return 0; // Criteria are equal.
    });

    // Extract the original elements from the sorted temporary objects.
    return _.pluck(mappedForSorting, 'originalElement');
  };

  // Groups the values in a collection based on a specified criterion.
  // The criterion can be a string (property name) or a function that returns a key.
  _.groupBy = function(collection, criterion) {
    var groupedOutput = {};
    // Determine the effective iterator function for grouping.
    var groupingIterator = _.isFunction(criterion) ? criterion : function(item) { return item[criterion]; };

    iterateOverCollection(collection, function(itemVal, itemIdx) {
      var groupKey = groupingIterator(itemVal, itemIdx);
      // Ensure the array for the group key exists, then push the item.
      (groupedOutput[groupKey] = groupedOutput[groupKey] || []).push(itemVal);
    });
    return groupedOutput;
  };

  // Determines the correct index to insert an object into a sorted array
  // while maintaining its sorted order. Uses a binary search algorithm.
  _.sortedIndex = function(sortedArray, objectToInsert, iterator) {
    var effectiveIterator = iterator || _.identity;
    var low = 0, high = sortedArray.length;
    // Binary search loop.
    while (low < high) {
      var mid = Math.floor((low + high) / 2); // Integer division.
      if (effectiveIterator(sortedArray[mid]) < effectiveIterator(objectToInsert)) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return low;
  };

  // Converts any iterable object (e.g., arguments, NodeList) into a true JavaScript Array.
  _.toArray = function(inputObject) {
    if (inputObject === null || inputObject === undefined) {
      return [];
    }
    // If it's already an array, clone it efficiently.
    if (_.isArray(inputObject)) {
      return arraySliceMethod.call(inputObject);
    }
    // If it's an arguments object, convert it.
    if (_.isArguments(inputObject)) {
      return arraySliceMethod.call(inputObject);
    }
    // If the object has its own `toArray` method, use it.
    if (inputObject.toArray && _.isFunction(inputObject.toArray)) {
      return inputObject.toArray();
    }
    // For general objects, return an array of its own enumerable property values.
    return _.values(inputObject);
  };

  // Returns the number of elements in a collection (array or object).
  _.size = function(collection) {
    if (collection === null || collection === undefined) {
        return 0; // Null/undefined collections have a size of 0.
    }
    if (_.isArray(collection) || _.isString(collection)) {
      return collection.length;
    }
    // For objects, count the number of own enumerable properties.
    return _.keys(collection).length;
  };

  // --- Array Manipulation Functions ---

  // Retrieves the first element(s) of an array.
  // If `numItems` is provided, returns an array containing the first `numItems`.
  // `isGuard` is an internal parameter for `_.map` compatibility.
  _.first = _.head = _.take = function(sourceArray, numItems, isGuard) {
    if (sourceArray === null || sourceArray === undefined || !_.isArray(sourceArray)) {
        return undefined; // Return undefined for invalid array input.
    }
    // If `numItems` is specified and not a guard, return a slice.
    if ((numItems !== null && numItems !== undefined) && !isGuard) {
      return arraySliceMethod.call(sourceArray, 0, numItems);
    }
    // Otherwise, return just the very first element.
    return sourceArray[0];
  };

  // Returns all elements of an array except the last one(s).
  // If `countToExclude` is specified, excludes that many elements from the end.
  _.initial = function(sourceArray, countToExclude, isGuard) {
    if (sourceArray === null || sourceArray === undefined || !_.isArray(sourceArray)) {
        return []; // Return empty array for invalid input.
    }
    var excludeCount = ((countToExclude === null || countToExclude === undefined) || isGuard) ? 1 : countToExclude;
    // Calculate the end index for slicing.
    return arraySliceMethod.call(sourceArray, 0, sourceArray.length - excludeCount);
  };

  // Retrieves the last element(s) of an array.
  // If `numItems` is provided, returns an array containing the last `numItems`.
  // `isGuard` is an internal parameter for `_.map` compatibility.
  _.last = function(sourceArray, numItems, isGuard) {
    if (sourceArray === null || sourceArray === undefined || !_.isArray(sourceArray)) {
        return undefined; // Return undefined for invalid input.
    }
    if ((numItems !== null && numItems !== undefined) && !isGuard) {
      // Return a slice from `Math.max(0, length - numItems)` to the end.
      return arraySliceMethod.call(sourceArray, Math.max(sourceArray.length - numItems, 0));
    } else {
      // Return the very last element.
      return sourceArray[sourceArray.length - 1];
    }
  };

  // Returns all elements of an array after a specified `startIndex`.
  // Aliased as `tail`. `isGuard` is for `_.map` compatibility.
  _.rest = _.tail = function(sourceArray, startIndex, isGuard) {
    if (sourceArray === null || sourceArray === undefined || !_.isArray(sourceArray)) {
        return []; // Return empty array for invalid input.
    }
    // If `startIndex` is not provided or it's a guard, default to 1 (skip the first element).
    var actualStartIndex = ((startIndex === null || startIndex === undefined) || isGuard) ? 1 : startIndex;
    return arraySliceMethod.call(sourceArray, actualStartIndex);
  };

  // Creates a new array with all falsy values (false, null, 0, "", undefined, NaN) removed.
  _.compact = function(inputArray) {
    if (inputArray === null || inputArray === undefined || !_.isArray(inputArray)) {
        return []; // Return empty array for invalid input.
    }
    return _.filter(inputArray, function(element){
        return Boolean(element); // Explicitly cast to boolean to filter falsy values.
    });
  };

  // Flattens a nested array into a single-level array.
  // If `isShallow` is true, it only flattens one level deep.
  _.flatten = function(nestedArray, isShallow) {
    if (!_.isArray(nestedArray)) {
        return []; // Ensure array input.
    }
    return _.reduce(nestedArray, function(accumulator, currentValue) {
      if (_.isArray(currentValue)) {
        // If it's an array, concatenate it (shallow) or recursively flatten it (deep).
        return accumulator.concat(isShallow ? currentValue : _.flatten(currentValue));
      }
      accumulator.push(currentValue); // If not an array, just push it.
      return accumulator;
    }, []);
  };

  // Returns a new array containing elements from the original array
  // that are not present in the subsequent arguments.
  _.without = function(sourceArray) {
    if (!_.isArray(sourceArray)) {
        return [];
    }
    // Collect all values to exclude from the arguments following `sourceArray`.
    var valuesToExclude = arraySliceMethod.call(arguments, 1);
    // Use `_.difference` for the actual exclusion logic.
    return _.difference(sourceArray, valuesToExclude);
  };

  // Produces a duplicate-free version of an array.
  // If `isSorted` is true, a faster algorithm can be used for pre-sorted arrays.
  // An `iterator` can be provided to compare based on computed values.
  _.uniq = _.unique = function(sourceArray, isSorted, iterator) {
    if (!_.isArray(sourceArray)) {
        return []; // Handle non-array input.
    }

    // Apply iterator if provided to get comparable values.
    var processedValues = iterator ? _.map(sourceArray, iterator) : sourceArray;
    var uniqueElements = [];
    var seenValues = []; // Tracks values that have already been added to `uniqueElements`.

    // If the array is small, `isSorted` optimization is less critical and could even be slower.
    // This check is a slight modification from original for potential optimization.
    if (sourceArray.length < 3) {
      isSorted = true;
    }

    iterateOverCollection(processedValues, function (processedVal, originalIndex) {
      if (isSorted) {
        // For sorted arrays, we only need to compare with the last seen value.
        if (seenValues.length === 0 || _.last(seenValues) !== processedVal) {
          seenValues.push(processedVal);
          uniqueElements.push(sourceArray[originalIndex]);
        }
      } else {
        // For unsorted arrays, check if the value has been seen anywhere before.
        if (!_.contains(seenValues, processedVal)) {
          seenValues.push(processedVal);
          uniqueElements.push(sourceArray[originalIndex]);
        }
      }
    });
    return uniqueElements;
  };

  // Creates a new array containing all unique elements from all given arrays (union).
  _.union = function() {
    // Flatten all argument arrays into a single array, then find unique elements.
    return _.uniq(_.flatten(arraySliceMethod.call(arguments), true));
  };

  // Returns an array of elements that are present in all given arrays (intersection).
  _.intersection = _.intersect = function(firstArray) {
    if (!_.isArray(firstArray)) {
        return [];
    }
    var otherArrays = arraySliceMethod.call(arguments, 1);
    // Get unique elements from the first array to avoid redundant checks.
    var uniqueInFirst = _.uniq(firstArray);

    return _.filter(uniqueInFirst, function(itemToCheck) {
      // Ensure the item exists in ALL other arrays.
      return _.every(otherArrays, function(currentOtherArray) {
        return _.indexOf(currentOtherArray, itemToCheck) >= 0;
      });
    });
  };

  // Computes the difference between the first array and subsequent arrays.
  // Only elements present exclusively in the `mainArray` will be returned.
  _.difference = function(mainArray) {
    if (!_.isArray(mainArray)) {
        return [];
    }
    // Flatten all subsequent argument arrays to get a consolidated list of values to exclude.
    var valuesToExclude = _.flatten(arraySliceMethod.call(arguments, 1), true);
    return _.filter(mainArray, function(elementValue){
      // Include an element only if it's NOT found in the `valuesToExclude` list.
      return !_.contains(valuesToExclude, elementValue);
    });
  };

  // Merges multiple arrays into a single array of tuples.
  // Elements at the same index across input arrays are grouped together.
  _.zip = function() {
    var allInputArrays = arraySliceMethod.call(arguments);
    // Determine the maximum length among all input arrays to set the result array size.
    var maxLength = _.max(_.pluck(allInputArrays, 'length'));
    var interleavedResult = new Array(maxLength);

    for (var i = 0; i < maxLength; i++) {
      // For each index, extract the element at that index from all input arrays.
      interleavedResult[i] = _.pluck(allInputArrays, "" + i);
    }
    return interleavedResult;
  };

  // Returns the index of the first occurrence of an item in an array, or -1 if not found.
  // Delegates to native `indexOf` if available.
  // If `isSorted` is true, an optimized binary search is used.
  _.indexOf = function(targetArray, searchItem, isSorted) {
    if (targetArray === null || targetArray === undefined || !_.isArray(targetArray)) {
      return -1;
    }
    var currentIdx, arrayLength;

    // Optimized binary search for sorted arrays.
    if (isSorted) {
      currentIdx = _.sortedIndex(targetArray, searchItem);
      // Verify if the item at the found index actually matches.
      return (currentIdx < targetArray.length && targetArray[currentIdx] === searchItem) ? currentIdx : -1;
    }

    // Prefer native `indexOf` for unsorted arrays.
    if (nativeArrayFindIndex && targetArray.indexOf === nativeArrayFindIndex) {
      return targetArray.indexOf(searchItem);
    }

    // Fallback: manual linear search.
    for (currentIdx = 0, arrayLength = targetArray.length; currentIdx < arrayLength; currentIdx++) {
      // Check for actual element existence (handles sparse arrays).
      if (objectHasOwnProperty.call(targetArray, currentIdx) && targetArray[currentIdx] === searchItem) {
        return currentIdx;
      }
    }
    return -1;
  };

  // Returns the index of the last occurrence of an item in an array, or -1 if not found.
  // Delegates to native `lastIndexOf` if available.
  _.lastIndexOf = function(targetArray, searchItem) {
    if (targetArray === null || targetArray === undefined || !_.isArray(targetArray)) {
      return -1;
    }
    // Prefer native `lastIndexOf`.
    if (nativeArrayLastIndex && targetArray.lastIndexOf === nativeArrayLastIndex) {
      return targetArray.lastIndexOf(searchItem);
    }

    // Manual reverse iteration for non-native environments.
    var currentIdx = targetArray.length;
    while (currentIdx--) { // Loop downwards from length-1 to 0.
      if (objectHasOwnProperty.call(targetArray, currentIdx) && targetArray[currentIdx] === searchItem) {
        return currentIdx;
      }
    }
    return -1;
  };

  // Generates an array of integers representing an arithmetic progression.
  // Similar to Python's `range()` function.
  _.range = function(startVal, stopVal, stepVal) {
    // Handle argument overloading: (stop), (start, stop), or (start, stop, step).
    if (arguments.length <= 1) {
      stopVal = startVal || 0; // If one argument, it's the stop value, start from 0.
      startVal = 0;
    }
    stepVal = arguments[2] || 1; // Default step is 1.

    // Calculate the length of the sequence, ensuring it's non-negative.
    var sequenceLength = Math.max(Math.ceil((stopVal - startVal) / stepVal), 0);
    var generatedArray = new Array(sequenceLength);
    var arrayPopulateIndex = 0;

    // Populate the array with values from the sequence.
    while(arrayPopulateIndex < sequenceLength) {
      generatedArray[arrayPopulateIndex++] = startVal;
      startVal += stepVal;
    }
    return generatedArray;
  };

  // --- Function Utility Functions ---

  // An empty constructor function used for prototype chain manipulation.
  var EmptyPrototypeConstructor = function(){};

  // Binds a function to a specific `this` context and partially applies arguments.
  // Delegates to native `Function.prototype.bind` if available.
  _.bind = function bindFunction(funcToBind, bindingContext) {
    if (!_.isFunction(funcToBind)) {
        // If not a function, return it as-is or throw an error.
        // For robustness, return as-is, consistent with some 'bind' polyfills.
        return funcToBind;
    }

    // Capture any additional arguments for partial application.
    var initialArguments = arraySliceMethod.call(arguments, 2);

    // If native `bind` is available, use it for performance and reliability.
    if (nativeFunctionBind && funcToBind.bind === nativeFunctionBind) {
      return nativeFunctionBind.apply(funcToBind, arraySliceMethod.call(arguments, 1));
    }

    // Manual binding implementation for environments without native `bind`.
    var BoundFunction = function() {
      // Determine the actual `this` context:
      // If `BoundFunction` is called with `new`, `this` refers to the new instance.
      // Otherwise, `this` should be the `bindingContext`.
      var effectiveContext = this instanceof BoundFunction && funcToBind ? this : bindingContext;
      // Combine initially bound arguments with runtime arguments.
      var runtimeArguments = arraySliceMethod.call(arguments);
      return funcToBind.apply(effectiveContext, initialArguments.concat(runtimeArguments));
    };

    // Ensure the bound function inherits the prototype chain of the original function.
    // This is crucial for correctly implementing `new BoundFunction()`.
    EmptyPrototypeConstructor.prototype = funcToBind.prototype;
    BoundFunction.prototype = new EmptyPrototypeConstructor();

    return BoundFunction;
  };

  // Partially applies arguments to a function, creating a new function.
  // This is similar to `_.bind` but does not alter the `this` context.
  _.partial = function(targetFunction) {
      var fixedArgs = arraySliceMethod.call(arguments, 1);
      return function() {
          var runtimeArgs = arraySliceMethod.call(arguments);
          return targetFunction.apply(this, fixedArgs.concat(runtimeArgs));
      };
  };

  // Memoizes a function's results, caching them based on its arguments.
  // By default, only the first argument is used as the cache key.
  _.memoize = function(funcToMemoize, hasherFunction) {
    var memoizedFunction = function() {
      // Determine the cache key. If a hasher is provided, use it; otherwise, use the first argument.
      var cacheKey = hasherFunction ? hasherFunction.apply(this, arguments) : arguments[0];
      memoizedFunction.cache = memoizedFunction.cache || {}; // Initialize cache if it doesn't exist.
      // If the result for this key is not in the cache, compute and store it.
      if (!objectHasOwnProperty.call(memoizedFunction.cache, cacheKey)) {
        memoizedFunction.cache[cacheKey] = funcToMemoize.apply(this, arguments);
      }
      return memoizedFunction.cache[cacheKey];
    };
    return memoizedFunction;
  };

  // Delays the execution of a function until the current call stack has cleared.
  // This is effectively executing the function on the "next tick" of the event loop.
  _.defer = function(funcToDefer) {
    var argsToPass = arraySliceMethod.call(arguments, 1);
    return setTimeout(function(){
      return funcToDefer.apply(null, argsToPass);
    }, 1); // A minimal delay, ensures asynchronous execution.
  };

  // Creates a debounced version of a function. It will only be executed after
  // `delayTime` milliseconds have passed since its last invocation.
  // If `immediate` is true, the function is invoked immediately on the first call,
  // then debounced for subsequent calls within the `delayTime`.
  _.debounce = function(funcToDebounce, delayTime, immediate) {
    var timeoutId;
    var lastExecutionResult;
    var currentContext;
    var currentArgs;

    var executeDelayed = function() {
      timeoutId = null; // Clear the timeout.
      if (!immediate) {
        lastExecutionResult = funcToDebounce.apply(currentContext, currentArgs); // Execute the function if not immediate.
      }
    };

    return function() {
      currentContext = this;
      currentArgs = arguments;
      var shouldCallNow = immediate && !timeoutId; // Check if immediate execution is required.
      clearTimeout(timeoutId); // Clear any existing debounce timeout.
      timeoutId = setTimeout(executeDelayed, delayTime); // Set a new timeout.
      if (shouldCallNow) {
        lastExecutionResult = funcToDebounce.apply(currentContext, currentArgs); // Execute immediately.
      }
      return lastExecutionResult;
    };
  };

  // Creates a throttled version of a function. It will execute at most once
  // within a specified `interval` (milliseconds).
  _.throttle = function(funcToThrottle, interval) {
    var timeoutIdentifier = null;
    var argumentsLastCalled = null;
    var contextLastCalled = null;
    var lastResultValue;
    var lastInvokeTime = 0;

    var invokeThrottledFunction = function() {
      lastResultValue = funcToThrottle.apply(contextLastCalled, argumentsLastCalled);
      lastInvokeTime = Date.now();
      timeoutIdentifier = null; // Clear the timeout after execution.
    };

    return function() {
      var now = Date.now();
      argumentsLastCalled = arguments;
      contextLastCalled = this;

      var timeRemaining = interval - (now - lastInvokeTime);

      if (timeRemaining <= 0 || timeRemaining > interval) {
        // If enough time has passed or it's the first call.
        if (timeoutIdentifier) {
          clearTimeout(timeoutIdentifier);
          timeoutIdentifier = null;
        }
        invokeThrottledFunction();
      } else if (!timeoutIdentifier) {
        // If not enough time has passed, but no timeout is currently scheduled.
        timeoutIdentifier = setTimeout(invokeThrottledFunction, timeRemaining);
      }
      return lastResultValue;
    };
  };

  // Creates a function that can only be called once. Subsequent calls will return
  // the result of the initial invocation without re-executing the function.
  _.once = function(funcToExecute) {
    var hasRun = false;
    var cachedOutput;
    return function() {
      if (!hasRun) {
        hasRun = true;
        cachedOutput = funcToExecute.apply(this, arguments);
      }
      return cachedOutput;
    };
  };

  // Creates a new function that is the composition of a list of functions.
  // The functions are applied from right to left, with the output of one
  // becoming the input of the next.
  _.compose = function() {
    var functionsToCompose = arguments;
    return function() {
      var currentResultArgs = arguments;
      for (var i = functionsToCompose.length - 1; i >= 0; i--) {
        currentResultArgs = [functionsToCompose[i].apply(this, currentResultArgs)];
      }
      return currentResultArgs[0];
    };
  };

  // Creates a new function that is the composition of a list of functions,
  // applied from left to right (a "pipeline").
  _.pipe = function() {
    var functionsInPipe = arguments;
    return function() {
      if (functionsInPipe.length === 0) {
        return undefined; // Or throw an error if no functions are provided.
      }
      var currentAccumulatedResult = functionsInPipe[0].apply(this, arguments);
      for (var i = 1; i < functionsInPipe.length; i++) {
        currentAccumulatedResult = functionsInPipe[i].call(this, currentAccumulatedResult);
      }
      return currentAccumulatedResult;
    };
  };

  // --- Object Utility Functions ---

  // Retrieves all own enumerable property names (keys) of an object.
  // Delegates to native `Object.keys` if available.
  _.keys = function(targetObject) {
    if (!_.isObject(targetObject)) {
        return []; // Return empty array for non-object inputs.
    }
    if (nativeObjectKeys) {
      return nativeObjectKeys(targetObject);
    }
    // Fallback for older environments: manual iteration.
    var propertyNames = [];
    for (var key in targetObject) {
      if (objectHasOwnProperty.call(targetObject, key)) {
        propertyNames.push(key);
      }
    }
    return propertyNames;
  };

  // Retrieves all own enumerable property values of an object.
  _.values = function(targetObject) {
    var propertyValues = [];
    if (!_.isObject(targetObject)) {
        return propertyValues;
    }
    iterateOverCollection(targetObject, function(val){
        propertyValues.push(val);
    });
    return propertyValues;
  };

  // Copies all enumerable own properties from one or more `sourceObjects`
  // to a `targetObject`, overwriting existing properties.
  _.extend = function(targetObject) {
    iterateOverCollection(arraySliceMethod.call(arguments, 1), function(sourceObj) {
      if (sourceObj !== null && sourceObj !== undefined) { // Ensure source object is not null/undefined.
          for (var key in sourceObj) {
            if (objectHasOwnProperty.call(sourceObj, key)) {
              targetObject[key] = sourceObj[key];
            }
          }
      }
    });
    return targetObject;
  };

  // Creates a shallow copy of an object.
  _.clone = function(sourceObject) {
    if (!_.isObject(sourceObject)) {
        return sourceObject; // Primitive values are returned directly.
    }
    if (_.isArray(sourceObject)) {
        return sourceObject.slice(); // Efficiently clone arrays.
    }
    // For general objects, create a new object and extend it.
    return _.extend({}, sourceObject);
  };

  // Fills in `undefined` properties in `targetObject` with values from `sourceObjects`.
  // Existing properties are not overwritten.
  _.defaults = function(targetObject) {
    iterateOverCollection(arraySliceMethod.call(arguments, 1), function(sourceObj) {
      if (sourceObj !== null && sourceObj !== undefined) {
          for (var key in sourceObj) {
            // Only assign if the property is currently undefined in the target.
            if (targetObject[key] === undefined) {
              targetObject[key] = sourceObj[key];
            }
          }
      }
    });
    return targetObject;
  };

  // Creates a new object that inherits directly from `prototypeObject`.
  // Optionally, `properties` can be an object whose own properties will be copied to the new object.
  _.create = function(prototypeObject, properties) {
    if (!_.isObject(prototypeObject) && prototypeObject !== null) {
        throw new TypeError('Prototype must be an object or null.');
    }
    EmptyPrototypeConstructor.prototype = prototypeObject;
    var newInstance = new EmptyPrototypeConstructor();
    if (properties) {
        // Copy own properties from the `properties` object to the new instance.
        _.extend(newInstance, properties);
    }
    return newInstance;
  };

  // Checks if an object has a specified `key` as its own property (not inherited).
  _.has = function(obj, key) {
    if (obj === null || obj === undefined) {
        return false; // Null/undefined objects cannot have own properties.
    }
    return objectHasOwnProperty.call(obj, key);
  };

  // --- Type Checking Functions ---

  // Internal helper to get the `[[Class]]` internal property of an object.
  var getObjectClass = function(obj) {
    return objectToStringMethod.call(obj);
  };

  // Checks if a value is a Function.
  _.isFunction = function(obj) {
    return getObjectClass(obj) === '[object Function]';
  };

  // Checks if a value is an Array. Prefers native `Array.isArray`.
  _.isArray = nativeCheckIsArray || function(obj) {
    return getObjectClass(obj) === '[object Array]';
  };

  // Checks if a value is an Object (meaning, not a primitive value).
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || (type === 'object' && obj !== null);
  };

  // Checks if a value is an Arguments object.
  _.isArguments = function(obj) {
    return getObjectClass(obj) === '[object Arguments]';
  };

  // Checks if a value is a String.
  _.isString = function(obj) {
    return getObjectClass(obj) === '[object String]';
  };

  // Checks if a value is a Number.
  _.isNumber = function(obj) {
    return getObjectClass(obj) === '[object Number]';
  };

  // Checks if a value is a Boolean.
  _.isBoolean = function(obj) {
    return obj === true || obj === false || getObjectClass(obj) === '[object Boolean]';
  };

  // Checks if a value is a Date object.
  _.isDate = function(obj) {
    return getObjectClass(obj) === '[object Date]';
  };

  // Checks if a value is a RegExp object.
  _.isRegExp = function(obj) {
    return getObjectClass(obj) === '[object RegExp]';
  };

  // Checks if a value is `NaN` (Not-a-Number).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj; // NaN is the only number not equal to itself.
  };

  // Checks if a value is `null`.
  _.isNull = function(obj) {
    return obj === null;
  };

  // Checks if a value is `undefined`.
  _.isUndefined = function(obj) {
    return obj === undefined;
  };

  // Checks if a collection (array or object) is empty.
  _.isEmpty = function(collection) {
    if (collection === null || collection === undefined) {
        return true;
    }
    if (_.isArray(collection) || _.isString(collection) || _.isArguments(collection)) {
        return collection.length === 0;
    }
    // For objects, check if it has any own enumerable properties.
    return _.keys(collection).length === 0;
  };

  // --- General Utilities ---

  // The identity function: returns the value passed to it.
  _.identity = function(value) {
    return value;
  };

  // Returns a function that always returns the same `value`.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  // Returns the first argument passed to it.
  _.firstArgument = function(arg1) {
    return arg1;
  };

  // A no-operation function.
  _.noop = function() {};

  // Escapes a string for safe use in HTML contexts.
  _.escape = function(htmlString) {
    if (!_.isString(htmlString)) return '';
    var entityMappings = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };
    return String(htmlString).replace(/[&<>"'\/]/g, function (char) {
      return entityMappings[char];
    });
  };

  // Unescapes HTML entities in a string.
  _.unescape = function(escapedString) {
    if (!_.isString(escapedString)) return '';
    var entityMappings = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#x27;': "'",
      '&#x2F;': '/'
    };
    // Use a regular expression to find all known entities.
    var regex = /&(amp|lt|gt|quot|#x27|#x2F);/g;
    return String(escapedString).replace(regex, function (entity) {
      return entityMappings[entity];
    });
  };

  // Converts an object into a URL query string.
  _.toQueryString = function(dataObject) {
    var queryParameters = [];
    for (var key in dataObject) {
      if (_.has(dataObject, key)) {
        var value = dataObject[key];
        // Handle arrays: encode each element separately.
        if (_.isArray(value)) {
          _.each(value, function(item) {
            queryParameters.push(encodeURIComponent(key) + '=' + encodeURIComponent(item));
          });
        } else if (value !== null && value !== undefined) {
          // Only encode non-null/undefined scalar values.
          queryParameters.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
      }
    }
    return queryParameters.join('&');
  };

  // --- Chaining and Mixins ---

  // Adds all properties from `sourceObject` to the `_` utility object
  // and also to the `ChainableWrapper` prototype, enabling chaining.
  _.mixin = function(sourceObject) {
    iterateOverCollection(_.keys(sourceObject), function(key) {
      var func = sourceObject[key];
      // Attach the function directly to the main `_` object.
      _[key] = func;
      // Also attach to the `ChainableWrapper` prototype for chaining.
      ChainableWrapper.prototype[key] = function() {
        // Prepend the wrapped value as the first argument.
        var args = [this._wrappedValue].concat(arraySliceMethod.call(arguments));
        // Execute the function, then re-wrap the result for continued chaining
        // if the result is an object.
        return _.wrap(func.apply(_, args));
      };
    });
  };

  // A helper function for chaining: wraps a value in a `ChainableWrapper`
  // if it's an object, otherwise returns the value directly.
  _.wrap = function(value) {
      return _.isObject(value) ? new ChainableWrapper(value) : value;
  };

  // Apply all currently defined utility functions to the `ChainableWrapper` prototype.
  _.mixin(_);

  // Add the `value` method to the wrapper to unwrap the underlying value.
  ChainableWrapper.prototype.value = function() {
    return this._wrappedValue;
  };

  // Add a `chain` method to the wrapper for explicit chaining (useful for clarity).
  ChainableWrapper.prototype.chain = function() {
    // This is essentially a no-op if all methods are already chainable.
    return this;
  };

  // Set up `noConflict` mode to restore the previous `_` global variable,
  // returning this utility library under a different reference.
  _.noConflict = function() {
    executionEnvironment._ = oldUnderscoreRef;
    return _;
  };

}).call(this);