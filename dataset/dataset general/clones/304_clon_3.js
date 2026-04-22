/*
 * app-data-orchestrator v1.0.0
 *
 * A robust data management layer for web applications
 * Inspired by classic MVC patterns and modern data handling approaches.
 */

'use strict';

(function (globalScope, moduleInitializer) {

  // Check for AMD loader like RequireJS
  if (typeof define === 'function' && define.amd) {
    define(['angular'], function (ngFramework) {
      return moduleInitializer(ngFramework, document);
    });
  } else {
    // No AMD, assume global Angular is available
    /* global angular */
    moduleInitializer(angular, document);
  }

}(window, function (ngFramework, domDocument, undefValue) { // Added undefValue for safety

  var mainEntityBlueprint; // Placeholder for a default data model constructor

  /**
   * Throws a new Error instance with the given message.
   * Useful for concise error signaling within expressions.
   * @param {string} problemDescription - The message for the error.
   */
  var signalIssue = function (problemDescription) {
    throw new Error(problemDescription);
  };

  /**
   * A minimal toolkit of common utility functions, mirroring some
   * functionality from popular libraries like Lodash/Underscore.
   * Designed for internal use to avoid external dependencies.
   *
   * Supported (or partially supported) operations include:
   * - Type checks: isText, isNumeric, isPlainObject, isCollection, isArgumentsObject, isCallable
   * - Equality: areEquivalent
   * - Object/Array manipulation: isVoid, assignProperties, ownsProperty, findPosition, getObjectKeys, getObjectValues, getKeyValuePairs
   * - Collection operations: includesElement, unrollCollection, getUniqueElements, excludeElements, transformElements, createIterator, propertyMatcher, checkAny, locateItem, selectItems
   * - Cloning: duplicateValue
   * - Unique ID generation: generateUniqueId
   */
  var uniqueIdentifierSeed = 0; // Counter for generating unique IDs

  var utilToolkit = {}; // Our custom utility object

  /**
   * Checks if a value is a string.
   * @param {*} testValue - The value to check.
   * @returns {boolean} True if the value is a string, false otherwise.
   */
  utilToolkit.isText = function (testValue) {
    return ngFramework.isString(testValue);
  };

  /**
   * Checks if a value is a number.
   * @param {*} testValue - The value to check.
   * @returns {boolean} True if the value is a number, false otherwise.
   */
  utilToolkit.isNumeric = function (testValue) {
    return ngFramework.isNumber(testValue);
  };

  /**
   * Checks if a value is a plain object (not null, not an array, not a function).
   * @param {*} testValue - The value to check.
   * @returns {boolean} True if the value is a plain object, false otherwise.
   */
  utilToolkit.isPlainObject = function (testValue) {
    if (testValue == null) return false; // Null or undefined are not objects
    var typeOfValue = typeof testValue;
    return typeOfValue === 'object' && !Array.isArray(testValue);
  };

  /**
   * Checks if a value is an array.
   * @param {*} testValue - The value to check.
   * @returns {boolean} True if the value is an array, false otherwise.
   */
  utilToolkit.isCollection = function (testValue) {
    return ngFramework.isArray(testValue);
  };

  /**
   * Checks if a value is an arguments object.
   * @param {*} testValue - The value to check.
   * @returns {boolean} True if the value is an arguments object, false otherwise.
   */
  utilToolkit.isArgumentsObject = function (testValue) {
    return Object.prototype.toString.call(testValue) === '[object Arguments]';
  };

  /**
   * Checks if a value is a function.
   * @param {*} testValue - The value to check.
   * @returns {boolean} True if the value is a function, false otherwise.
   */
  utilToolkit.isCallable = function (testValue) {
    return ngFramework.isFunction(testValue);
  };

  /**
   * Performs a deep comparison to check if two values are equivalent.
   * @param {*} valA - The first value.
   * @param {*} valB - The second value.
   * @returns {boolean} True if values are equivalent, false otherwise.
   */
  utilToolkit.areEquivalent = function (valA, valB) {
    return ngFramework.equals(valA, valB);
  };

  /**
   * Checks if a collection or object is empty.
   * @param {*} targetObj - The object or collection to check.
   * @returns {boolean} True if empty, false otherwise.
   */
  utilToolkit.isVoid = function (targetObj) {
    if (targetObj == null) return true; // Null or undefined is void.

    // Handle array-like structures (arrays, strings, arguments)
    if (utilToolkit.isCollection(targetObj) || utilToolkit.isText(targetObj) || utilToolkit.isArgumentsObject(targetObj)) {
      return targetObj.length === 0;
    }

    // Handle plain objects
    if (utilToolkit.isPlainObject(targetObj)) {
      for (var propKey in targetObj) {
        if (utilToolkit.ownsProperty(targetObj, propKey)) return false; // Has at least one own property
      }
      return true; // No own properties found
    }

    // Other types are considered not void if not null/undefined
    return false;
  };

  /**
   * Copies all enumerable own properties from one or more source objects
   * to a target object. Handles getter/setter properties correctly.
   * @param {object} targetObject - The object to extend.
   * @param {...object} sourceObjects - One or more objects to merge into the target.
   * @returns {object} The modified target object.
   */
  utilToolkit.assignProperties = function (targetObject) {
    if (!utilToolkit.isPlainObject(targetObject) && !utilToolkit.isCallable(targetObject)) {
      return targetObject; // Only extend objects or functions
    }

    var currentSource;
    var propertyName;
    var hasOwnProp = Object.prototype.hasOwnProperty;

    for (var i = 1, argCount = arguments.length; i < argCount; i++) {
      currentSource = arguments[i];
      if (currentSource == null) continue; // Skip null/undefined sources

      for (propertyName in currentSource) {
        if (!hasOwnProp.call(currentSource, propertyName)) continue; // Skip inherited properties

        // Check for target object accessors that have only getters and not setters and ignore them
        var destinationDescriptor = Object.getOwnPropertyDescriptor(targetObject, propertyName);
        if (destinationDescriptor && (destinationDescriptor.get && !destinationDescriptor.set)) continue;

        targetObject[propertyName] = currentSource[propertyName];
      }
    }
    return targetObject;
  };

  /**
   * Checks if an object has the specified property as its own property.
   * @param {object} targetObj - The object to check.
   * @param {string} propKey - The name of the property.
   * @returns {boolean} True if the object has the property, false otherwise.
   */
  utilToolkit.ownsProperty = function(targetObj, propKey) {
    // Add a guard for null/undefined objects
    if (targetObj == null) return false;
    return Object.prototype.hasOwnProperty.call(targetObj, propKey);
  };

  /**
   * Returns the first index at which a given element can be found in the array, or -1 if it is not present.
   * @param {Array} searchCollection - The array to search within.
   * @param {*} searchItem - The element to search for.
   * @returns {number} The index of the item, or -1.
   */
  utilToolkit.findPosition = function (searchCollection, searchItem) {
    if (!utilToolkit.isCollection(searchCollection) || searchCollection.length === 0) return -1;
    for (var i = 0; i < searchCollection.length; i++) {
      if (searchCollection[i] === searchItem) return i;
    }
    return -1;
  };

  /**
   * Retrieves all enumerable own property names of an object.
   * @param {object} targetObj - The object to inspect.
   * @returns {Array<string>} An array of property names.
   */
  utilToolkit.getObjectKeys = function (targetObj) {
    if (!utilToolkit.isPlainObject(targetObj) && !utilToolkit.isCallable(targetObj)) return [];
    if (Object.keys) return Object.keys(targetObj); // Use native if available

    var propertyNames = [];
    for (var keyName in targetObj) {
      if (utilToolkit.ownsProperty(targetObj, keyName)) propertyNames.push(keyName);
    }
    return propertyNames;
  };

  /**
   * Retrieves all enumerable own property values of an object.
   * @param {object} targetObj - The object to inspect.
   * @returns {Array<*>} An array of property values.
   */
  utilToolkit.getObjectValues = function (targetObj) {
    var propertyNames = utilToolkit.getObjectKeys(targetObj);
    var valueCount = propertyNames.length;
    var propertyValues = new Array(valueCount);

    for (var i = 0; i < valueCount; i++) {
      propertyValues[i] = targetObj[propertyNames[i]];
    }
    return propertyValues;
  };

  /**
   * Converts an object into an array of [key, value] pairs.
   * @param {object} targetObj - The object to convert.
   * @returns {Array<Array<string, *>>} An array of key-value pairs.
   */
  utilToolkit.getKeyValuePairs = function (targetObj) {
    var propertyNames = utilToolkit.getObjectKeys(targetObj);
    var pairCount = propertyNames.length;
    var pairsArray = new Array(pairCount);
    for (var i = 0; i < pairCount; i++) {
      var currentKey = propertyNames[i];
      pairsArray[i] = [currentKey, targetObj[currentKey]];
    }
    return pairsArray;
  };

  /**
   * Checks if a collection or object contains a specific element.
   * @param {Array|object} targetCollection - The collection to search.
   * @param {*} searchElement - The element to find.
   * @returns {boolean} True if the element is found, false otherwise.
   */
  utilToolkit.includesElement = function (targetCollection, searchElement) {
    if (targetCollection == null) return false;
    // If it's not array-like, convert its values to an array for searching
    if (typeof targetCollection.length !== 'number' || targetCollection.length !== +targetCollection.length) {
      targetCollection = utilToolkit.getObjectValues(targetCollection);
    }
    return utilToolkit.findPosition(targetCollection, searchElement) >= 0;
  };

  /**
   * Flattens a nested array (recursively or shallowly).
   * @param {Array} sourceArr - The array to flatten.
   * @param {boolean} [isShallow=false] - If true, only flatten one level.
   * @param {boolean} [strictMode=false] - If true, only push non-array elements.
   * @param {Array} [resultAccumulator=[]] - Internal accumulator for recursion.
   * @returns {Array} The flattened array.
   */
  utilToolkit.unrollCollection = function (sourceArr, isShallow, strictMode, resultAccumulator) {
    // Guard against non-array input
    if (!utilToolkit.isCollection(sourceArr)) return [];

    strictMode = !!strictMode;
    resultAccumulator = resultAccumulator || [];

    // Optimization for shallow flattening of arrays containing only arrays
    if (isShallow && utilToolkit.isCollection(sourceArr) && sourceArr.length > 0) {
      var allSubArrays = true;
      for (var m = 0; m < sourceArr.length; m++) {
        if (!utilToolkit.isCollection(sourceArr[m])) {
          allSubArrays = false;
          break;
        }
      }
      if (allSubArrays) {
        Array.prototype.push.apply(resultAccumulator, Array.prototype.concat.apply([], sourceArr));
        return resultAccumulator;
      }
    }

    for (var i = 0, len = sourceArr.length; i < len; i++) {
      var currentVal = sourceArr[i];
      if (!utilToolkit.isCollection(currentVal) && !utilToolkit.isArgumentsObject(currentVal)) {
        if (!strictMode) resultAccumulator.push(currentVal);
      } else if (isShallow) {
        Array.prototype.push.apply(resultAccumulator, currentVal);
      } else {
        utilToolkit.unrollCollection(currentVal, isShallow, strictMode, resultAccumulator);
      }
    }

    return resultAccumulator;
  };

  /**
   * Computes the difference between the first array and subsequent arrays.
   * Returns a new array of unique elements from the first array that are not present in any of the other arrays.
   * @param {Array} mainArray - The array to compare against.
   * @param {...Array} otherArrays - Arrays whose elements should be excluded.
   * @returns {Array} The array of unique elements.
   */
  utilToolkit.getUniqueElements = function (mainArray) {
    if (!utilToolkit.isCollection(mainArray)) return [];

    // Flatten all subsequent arguments into a single array of elements to exclude
    var elementsToExclude = utilToolkit.unrollCollection(Array.prototype.slice.call(arguments, 1), true, true, []);

    // Filter the main array
    return utilToolkit.selectItems(mainArray, function (itemValue) {
      return !utilToolkit.includesElement(elementsToExclude, itemValue);
    });
  };

  /**
   * Returns a new array with all instances of the given values removed.
   * @param {Array} sourceArray - The array to filter.
   * @param {...*} valuesToRemove - Values to be excluded from the array.
   * @returns {Array} A new array without the specified values.
   */
  utilToolkit.excludeElements = function (sourceArray) {
    if (!utilToolkit.isCollection(sourceArray)) return [];
    // The implementation is a direct passthrough to getUniqueElements
    return utilToolkit.getUniqueElements(sourceArray, Array.prototype.slice.call(arguments, 1));
  };

  /**
   * Creates a new array with the results of calling a provided function on every element in the calling array.
   * @param {Array|object} collection - The collection (array or array-like object) to iterate over.
   * @param {Function} mapFunction - Function that produces an element of the new array.
   * @returns {Array} A new array with each element being the result of the callback function.
   */
  utilToolkit.transformElements = function (collection, mapFunction) {
    // If it's a true array, use native map for performance
    if (utilToolkit.isCollection(collection)) {
      return collection.map(mapFunction);
    }
    // For array-like objects or others, iterate manually
    var results = [];
    if (collection == null) return results;

    var keys = collection.length !== +collection.length && utilToolkit.getObjectKeys(collection),
        length = (keys || collection).length;

    for (var i = 0; i < length; i++) {
      var currentKey = keys ? keys[i] : i;
      results.push(mapFunction(collection[currentKey], currentKey, collection));
    }
    return results;
  };

  /**
   * Creates a function that returns the result of calling the provided predicate with specific arguments.
   * @param {*} predicateValue - A function, an object (for matching), or a property name.
   * @returns {Function} An iteratee function.
   */
  utilToolkit.createIterator = function (predicateValue) {
    if (predicateValue == null) return ngFramework.identity; // Angular's no-op function

    if (utilToolkit.isCallable(predicateValue)) {
      var predicateFn = predicateValue;
      return function (item, index, list) {
        return predicateFn.call(null, item, index, list);
      };
    }

    if (utilToolkit.isPlainObject(predicateValue)) {
      return utilToolkit.propertyMatcher(predicateValue);
    }

    // Default: return a function that extracts a property by name
    var propertyExtractor = function (keyIdentifier) {
      return function (targetItem) {
        if (targetItem == null) return undefValue; // Guard against null/undefined
        return targetItem[keyIdentifier];
      };
    };

    return propertyExtractor(predicateValue);
  };

  /**
   * Creates a predicate function that checks if an object has matching property values.
   * @param {object} attributesToMatch - An object of key-value pairs to match against.
   * @returns {Function} A predicate function.
   */
  utilToolkit.propertyMatcher = function (attributesToMatch) {
    var matchPairs = utilToolkit.getKeyValuePairs(attributesToMatch);
    var pairCount = matchPairs.length;

    return function (candidateObject) {
      if (candidateObject == null) return !pairCount; // If no attributes to match, null is a match.

      for (var i = 0; i < pairCount; i++) {
        var currentPair = matchPairs[i];
        var matchKey = currentPair[0];
        var matchValue = currentPair[1];

        // Check if property exists and its value matches
        if (!(matchKey in candidateObject) || candidateObject[matchKey] !== matchValue) {
          return false;
        }
      }
      return true;
    };
  };

  /**
   * Checks if any element in a collection passes the predicate test.
   * @param {Array|object} collection - The collection to iterate over.
   * @param {Function|object|string} predicate - The predicate function, object to match, or property name.
   * @returns {boolean} True if any element passes the test, false otherwise.
   */
  utilToolkit.checkAny = function (collection, predicate) {
    if (collection == null) return false;

    var testPredicate = utilToolkit.createIterator(predicate);

    var itemKeys = !utilToolkit.isCollection(collection) && utilToolkit.getObjectKeys(collection);
    var collectionLength = (itemKeys || collection).length;
    var currentItemKey;

    for (var i = 0; i < collectionLength; i++) {
      currentItemKey = itemKeys ? itemKeys[i] : i;
      if (testPredicate(collection[currentItemKey], currentItemKey, collection)) return true;
    }

    return false;
  };

  /**
   * Finds the first element in a collection that satisfies the predicate.
   * @param {Array|object} collection - The collection to search.
   * @param {Function|object|string} predicate - The predicate function, object to match, or property name.
   * @returns {*} The first element that satisfies the predicate, or undefined.
   */
  utilToolkit.locateItem = function (collection, predicate) {
    var foundItem;
    var searchPredicate = utilToolkit.createIterator(predicate);

    // Use checkAny's internal iteration to find the first match
    utilToolkit.checkAny(collection, function (itemValue, itemIndex, itemCollection) {
      if (searchPredicate(itemValue, itemIndex, itemCollection)) {
        foundItem = itemValue;
        return true; // Stop iteration
      }
      return false; // Continue iteration
    });

    return foundItem;
  };

  /**
   * Returns a new array containing all elements of a collection that satisfy the predicate.
   * @param {Array|object} collection - The collection to filter.
   * @param {Function|object|string} predicate - The predicate function, object to match, or property name.
   * @returns {Array} A new array with the filtered elements.
   */
  utilToolkit.selectItems = function (collection, predicate) {
    var filteredResults = [];
    if (collection == null) return filteredResults;

    var testPredicate = utilToolkit.createIterator(predicate);

    // Using Angular's forEach for consistency and robustness across array-like objects
    ngFramework.forEach(collection, function (itemValue, itemIndex, itemCollection) {
      if (testPredicate(itemValue, itemIndex, itemCollection)) {
        filteredResults.push(itemValue);
      }
    });

    return filteredResults;
  };

  /**
   * Creates a shallow copy of an object or array.
   * @param {*} originalValue - The value to clone.
   * @returns {*} A shallow copy of the value.
   */
  utilToolkit.duplicateValue = function (originalValue) {
    if (originalValue == null || typeof originalValue !== 'object') return originalValue; // Primitives are returned as is
    if (utilToolkit.isCollection(originalValue)) {
      return originalValue.slice(); // Array shallow copy
    }
    // For plain objects, create a new object and assign properties
    return utilToolkit.assignProperties({}, originalValue);
  };

  /**
   * Generates a unique ID string.
   * @param {string} [idPrefix=''] - An optional prefix for the ID.
   * @returns {string} A unique ID string.
   */
  utilToolkit.generateUniqueId = function (idPrefix) {
    var currentId = ++uniqueIdentifierSeed;
    var prefixString = (idPrefix == null) ? '' : String(idPrefix);
    return prefixString + currentId;
  };


  // --- Supplementary Internal Helpers ---
  // These are more specialized helpers not directly mimicking Lodash.

  /**
   * Attempts to define a getter/setter property on a destination object
   * based on a source object's property descriptor.
   * @param {object} destinationObject - The object where the property will be defined.
   * @param {object} sourceObject - The object from which to read the property descriptor.
   * @param {string} propertyName - The name of the property.
   * @returns {boolean} True if a getter/setter was successfully defined, false otherwise.
   */
  var configurePropertyAccess = function (destinationObject, sourceObject, propertyName) {
    if (!utilToolkit.isPlainObject(sourceObject) || !utilToolkit.isPlainObject(destinationObject) || !propertyName) {
      return false; // Invalid inputs
    }

    // Get the property descriptor from the source
    var propertyDescriptor = Object.getOwnPropertyDescriptor(sourceObject, propertyName);

    // If a descriptor exists and it defines a getter or setter
    if (propertyDescriptor && (propertyDescriptor.get || propertyDescriptor.set)) {
      // Manually copy the definition across to preserve accessor behavior.
      // Make it enumerable and configurable so it behaves like a regular property
      // and can be overridden/iterated.
      Object.defineProperty(
        destinationObject, propertyName,
        {
          get: propertyDescriptor.get,
          set: propertyDescriptor.set,
          enumerable: true,
          configurable: true
        }
      );
      return true;
    }
    return false; // Not an accessor property or no descriptor
  };

  /**
   * Creates a new object by omitting specified properties from a source object.
   * Only supports string property names.
   * @param {object} sourceObject - The object from which to omit properties.
   * @param {...string} propertiesToExclude - Names of properties to omit.
   * @returns {object} A new object with the specified properties removed.
   */
  var filterObjectProperties = function (sourceObject) {
    if (sourceObject == null) return {}; // Return empty object for null/undefined source
    if (!utilToolkit.isPlainObject(sourceObject)) return sourceObject; // Return as-is if not an object

    var args = Array.prototype.slice.call(arguments, 1);
    var propertiesToExclude = utilToolkit.unrollCollection(args, true, true, []); // Ensure flat list of keys
    var allKeys = utilToolkit.getObjectKeys(sourceObject);
    var filteredResult = {};

    for (var i = 0; i < allKeys.length; i++) {
      var currentKey = allKeys[i];
      // Only include if the key is an own property and not in the exclusion list
      if (utilToolkit.ownsProperty(sourceObject, currentKey) && !utilToolkit.includesElement(propertiesToExclude, currentKey)) {
        // Attempt to copy as an accessor if it is one, otherwise a direct value copy
        if (!configurePropertyAccess(filteredResult, sourceObject, currentKey)) {
          filteredResult[currentKey] = sourceObject[currentKey];
        }
      }
    }
    return filteredResult;
  };

  /**
   * Performs a recursive (deep) copy of an object or array,
   * using a custom extender function for objects.
   * @param {*} originalValue - The value to copy.
   * @param {Function} [mergerFunction=utilToolkit.assignProperties] - Custom function to merge objects.
   * @returns {*} A deep copy of the value.
   */
  var recursiveCopy = function (originalValue, mergerFunction) {
    if (originalValue == null || typeof originalValue !== 'object') {
      return originalValue; // Primitives, null, undefined don't need deep copy
    }

    // Default merger function if none provided or invalid
    if (!mergerFunction || !utilToolkit.isCallable(mergerFunction)) {
      mergerFunction = utilToolkit.assignProperties;
    }

    if (utilToolkit.isCollection(originalValue)) {
      var newArray = [];
      for (var i = 0; i < originalValue.length; i++) {
        newArray.push(recursiveCopy(originalValue[i], mergerFunction)); // Recurse for array elements
      }
      return newArray;
    } else if (utilToolkit.isCallable(originalValue)) {
      return originalValue; // Functions are typically passed by reference
    } else if (utilToolkit.isPlainObject(originalValue)) {
      // For plain objects, use the merger function to create a new object
      return mergerFunction({}, originalValue);
    } else {
      // Fallback for other complex types (e.g., Date, RegExp) - shallow copy or return as-is
      return utilToolkit.duplicateValue(originalValue);
    }
  };

  /**
   * Merges properties from multiple source objects into a target object,
   * handling deep cloning for nested objects/arrays and preserving accessor properties.
   * @param {object} targetContainer - The primary object to merge into.
   * @param {...object} sourceObjects - Objects whose properties will be merged.
   * @returns {object} The modified targetContainer.
   */
  var mergeWithAccessors = function (targetContainer) {
    targetContainer = targetContainer || {}; // Ensure target is an object

    // Iterate over all arguments starting from the second one (sources)
    for (var argIdx = 1; argIdx < arguments.length; argIdx++) {
      var currentSourceObj = arguments[argIdx];

      if (currentSourceObj !== targetContainer && utilToolkit.isPlainObject(currentSourceObj)) {
        for (var propKey in currentSourceObj) {
          if (utilToolkit.ownsProperty(currentSourceObj, propKey)) { // Ensure it's an own property
            // Attempt to define as a getter/setter; if successful, move to next property
            if (!configurePropertyAccess(targetContainer, currentSourceObj, propKey)) {
              // If not an accessor, perform a deep clone for nested objects/arrays
              targetContainer[propKey] = recursiveCopy(currentSourceObj[propKey], mergeWithAccessors);
            }
          }
        }
      }
    }
    return targetContainer;
  };


  // # Resource Path Utilities
  // =========================

  /**
   * Helper object for managing and transforming URL-like resource paths.
   */
  var resourcePathUtil = {
    /**
     * Performs a simple check to see if a string appears to be a path.
     * @param {string} pathString - The string to check.
     * @returns {boolean} True if it contains slashes or hyphens, suggesting a path.
     */
    looksLikePath: function (pathString) {
      if (!utilToolkit.isText(pathString)) return false;
      return pathString.includes('/') || pathString.includes('-');
    },

    /**
     * Ensures a string is formatted as a URL path, starting with a single slash.
     * @param {string} rawString - The string to format.
     * @returns {string} A path string, e.g., '/my/path'.
     */
    formatAsPath: function (rawString) {
      if (!rawString) return '';
      // Ensure leading slash and normalize multiple slashes
      return resourcePathUtil.normalizePathSlashes('/' + rawString);
    },

    /**
     * Combines multiple path segments into a single, normalized path.
     * Any number of arguments can be provided.
     * @param {...string} pathSegments - Strings representing parts of a path.
     * @returns {string} The combined and normalized path.
     */
    joinPathSegments: function () {
      var validSegments = [];
      for (var i = 0; i < arguments.length; i++) {
        var segment = arguments[i];
        if (segment) { // Filter out empty or null segments
          validSegments.push(segment);
        }
      }

      if (validSegments.length === 0) return '';
      // Join segments with a slash and then format as a proper path
      return resourcePathUtil.formatAsPath(validSegments.join('/'));
    },

    /**
     * Replaces multiple consecutive slashes in a URL with a single slash.
     * @param {string} inputPath - The path string to clean.
     * @returns {string} The path with normalized slashes.
     */
    normalizePathSlashes: function (inputPath) {
      if (!inputPath) return '';
      return inputPath.replace(/(\/)\/+/g, '$1'); // Replaces //, ///, etc. with a single /
    },

    /**
     * Removes leading and trailing slashes from a path string.
     * @param {string} inputPath - The path string to trim.
     * @returns {string} The path without boundary slashes.
     */
    cleanPathBoundaries: function (inputPath) {
      if (!inputPath) return '';
      return inputPath.replace(/^\/|\/$/g, ''); // Remove leading or trailing slash
    },

    /**
     * Analyzes two paths and attempts to remove any overlapping common suffix from the first path.
     * For example, `/api/users/123` and `/users/123` would result in `/api`.
     * @param {string} mainPath - The primary path.
     * @param {string} overlapCandidatePath - The path to check for overlapping segments.
     * @returns {string} The mainPath with the common suffix removed, formatted as a path.
     */
    removePathOverlap: function (mainPath, overlapCandidatePath) {
      if (!mainPath || !overlapCandidatePath) return mainPath;

      var primarySections = resourcePathUtil.cleanPathBoundaries(mainPath).split('/');
      var candidateSections = resourcePathUtil.cleanPathBoundaries(overlapCandidatePath).split('/');

      var commonSuffixLength = 0;
      var minLength = Math.min(primarySections.length, candidateSections.length);

      // Find the length of the common suffix from the end
      for (var i = 1; i <= minLength; i++) {
        if (primarySections[primarySections.length - i] === candidateSections[candidateSections.length - i]) {
          commonSuffixLength++;
        } else {
          break;
        }
      }

      if (commonSuffixLength > 0) {
        // Remove the common suffix from the main path's sections
        var remainingSections = primarySections.slice(0, primarySections.length - commonSuffixLength);
        return resourcePathUtil.formatAsPath(remainingSections.join('/'));
      }

      return resourcePathUtil.formatAsPath(mainPath); // No overlap, return original formatted path
    },

    /**
     * Replaces URL placeholders (e.g., ':id', ':_name') with actual parameter values.
     * @param {string} urlTemplate - The URL string with placeholders.
     * @param {object} pathParameters - An object containing key-value pairs for placeholders.
     * @param {boolean} [allowMissingParams=false] - If true, missing parameters will not throw an error.
     * @returns {string} The URL with placeholders substituted.
     */
    substitutePathPlaceholders: function (urlTemplate, pathParameters, allowMissingParams) {
      if (!urlTemplate) return '';
      if (pathParameters == null) { // Guard for null/undefined parameters object
        if (urlTemplate.includes(':') && !allowMissingParams) {
          signalIssue('URL template "' + urlTemplate + '" contains placeholders but no parameters were provided.');
        }
        return urlTemplate;
      }

      // Regex to find placeholders like :paramName or :_paramName
      return urlTemplate.replace(/\:([a-zA-Z_][a-zA-Z0-9_]*)/g, function (fullMatch, paramName) {
        var actualValue = pathParameters[paramName];
        if (actualValue === undefValue && !allowMissingParams) {
          signalIssue('Missing parameter "' + paramName + '" for URL template: ' + urlTemplate);
        }
        return actualValue;
      });
    }

    // Note: The original code had a comment about 'idAttribute' which is
    // context-specific to the modelizer library and not a generic URL helper function.
    // So, it's omitted as a Type III deletion of non-essential/context-specific fragments.
  };

  // The original code would likely continue with the main Modelizer logic here.
  // This example focuses only on the utility and URL helper parts as requested.

  // Export the utilities and helper objects (or integrate them into the main module)
  // For this exercise, we'll imagine they are part of a larger module.
  // In a real scenario, this factory would return the main angular module.

  // Example of what might be returned by the factory:
  // ngFramework.module('appDataOrchestrator', [])
  //   .constant('dataKit', utilToolkit)
  //   .constant('pathResolver', resourcePathUtil)
  //   .factory('Model', function() { /* ... Model definition using utilToolkit and pathResolver ... */ });

}));