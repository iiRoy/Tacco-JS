(  function () {

  // ------------------------- Core Configuration ---------------------------------

  // Establish the top-level execution context, 'window' in browsers, or 'global' on servers.
  var globalScope = this;

  // Preserve the previous state of the "util" variable.
  var priorUtil = globalScope.util;

  // Define a mechanism to exit loop iterations prematurely.
  var loopTerminator = typeof StopIteration !== 'undefined' ? StopIteration : '__loop_break_signal__';

  // A quick helper function to escape characters for regular expressions.
  var regexEscaper = function (inputStr) {
    return inputStr.replace(/([.*+?^${}()|[\]\/\\])/g, '\\$1');
  };

  // Optimize byte count for minified (but not gzipped) builds:
  var arrPrototype = Array.prototype,
    objPrototype = Object.prototype;

  // Create fast access aliases for fundamental prototype methods.
  var arrSlice = arrPrototype.slice,
    arrUnshift = arrPrototype.unshift,
    objToString = objPrototype.toString,
    ownPropertyChecker = objPrototype.hasOwnProperty,
    enumPropertyChecker = objPrototype.propertyIsEnumerable;

  // Declare all ECMA5 native implementations that we intend to utilize.
  var natForEach = arrPrototype.forEach,
    natMap = arrPrototype.map,
    natReduce = arrPrototype.reduce,
    natReduceRight = arrPrototype.reduceRight,
    natFilter = arrPrototype.filter,
    natEvery = arrPrototype.every,
    natSome = arrPrototype.some,
    natIndexOf = arrPrototype.indexOf,
    natLastIndexOf = arrPrototype.lastIndexOf,
    natIsArray = Array.isArray,
    natKeys = Object.keys;

  // Create a secure reference to the main utility object for internal use.
  var util = function (collection) {
    return new utilityWrapper(collection);
  };

  // Export the utility object for CommonJS modules.
  if (typeof moduleExports !== 'undefined') moduleExports.util = util;

  // Expose the utility object to the global context.
  globalScope.util = util;

  // Current library version.
  util.TOOL_VER = '0.6.0';

  // ------------------------ Data Structure Functions: ---------------------------

  // The primary iteration function.
  // Handles objects with forEach, arrays, and standard objects.
  // Leverages JavaScript 1.6's native forEach if available.
  var traverse = util.traverse = function (collection, processor, scope) {
    try {
      if (natForEach && collection.forEach === natForEach) {
        collection.forEach(processor, scope);
      } else if (util.isNumeric(collection.length)) {
        for (var idx = 0, len = collection.length; idx < len; idx++) processor.call(scope, collection[idx], idx, collection);
      } else {
        for (var propKey in collection) {
          if (ownPropertyChecker.call(collection, propKey)) processor.call(scope, collection[propKey], propKey, collection);
        }
      }
    } catch (err) {
      if (err != loopTerminator) throw err;
    }
    return collection;
  };

  // Produces a new array by applying a function to each item.
  // Utilizes JavaScript 1.6's native map where possible.
  util.transform = function (collection, processor, scope) {
    if (natMap && collection.map === natMap) return collection.map(processor, scope);
    var resultsArr = [];
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      resultsArr.push(processor.call(scope, itemValue, itemIndex, sourceList));
    });
    return resultsArr;
  };

  // Aggregates a list of values into a single result, also known as foldl or inject.
  // Delegates to JavaScript 1.8's native reduce if present.
  util.aggregate = function (collection, accumulator, processor, scope) {
    if (natReduce && collection.reduce === natReduce) return collection.reduce(util.createBoundFn(processor, scope), accumulator);
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      accumulator = processor.call(scope, accumulator, itemValue, itemIndex, sourceList);
    });
    return accumulator;
  };

  // The right-to-left version of aggregate, also known as foldr.
  // Leverages JavaScript 1.8's native reduceRight if available.
  util.reverseAggregate = function (collection, accumulator, processor, scope) {
    if (natReduceRight && collection.reduceRight === natReduceRight) return collection.reduceRight(util.createBoundFn(processor, scope), accumulator);
    var reversedItems = util.duplicateObject(util.convertToArray(collection)).reverse();
    return util.aggregate(reversedItems, accumulator, processor, scope);
  };

  // Returns the first item that satisfies a truth test.
  util.findFirst = function (collection, processor, scope) {
    var foundItem;
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      if (processor.call(scope, itemValue, itemIndex, sourceList)) {
        foundItem = itemValue;
        util.terminateLoop();
      }
    });
    return foundItem;
  };

  // Returns all items that pass a truth test.
  // Delegates to JavaScript 1.6's native filter if applicable.
  util.select = function (collection, processor, scope) {
    if (natFilter && collection.filter === natFilter) return collection.filter(processor, scope);
    var selectedItems = [];
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      processor.call(scope, itemIndex, sourceList, itemValue) && selectedItems.push(itemValue);
    });
    return selectedItems;
  };

  // Returns all items for which a truth test fails.
  util.discard = function (collection, processor, scope) {
    var discardedItems = [];
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      !processor.call(scope, itemValue, itemIndex, sourceList) && discardedItems.push(itemValue);
    });
    return discardedItems;
  };

  // Determines if all items in the collection satisfy a truth test.
  // Leverages JavaScript 1.6's native every if available.
  util.allTrue = function (collection, processor, scope) {
    processor = processor || util.returnSelf;
    if (natEvery && collection.every === natEvery) return collection.every(processor, scope);
    var testResult = true;
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      if (!(testResult = testResult && processor.call(scope, itemValue, itemIndex, sourceList))) util.terminateLoop();
    });
    return testResult;
  };

  // Determines if at least one item in the collection satisfies a truth test.
  // Delegates to JavaScript 1.6's native some if available.
  util.anyTrue = function (collection, processor, scope) {
    processor = processor || util.returnSelf;
    if (natSome && collection.some === natSome) return collection.some(processor, scope);
    var testResult = false;
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      if (testResult = processor.call(scope, itemValue, itemIndex, sourceList)) util.terminateLoop();
    });
    return testResult;
  };

  // Checks if a given value is present in the array or object using '==='.
  util.contains = function (collection, searchValue) {
    if (natIndexOf && collection.indexOf === natIndexOf) return collection.indexOf(searchValue) != -1;
    var wasFound = false;
    traverse(collection, function (itemValue) {
      if (wasFound = itemValue === searchValue) util.terminateLoop();
    });
    return wasFound;
  };

  // Executes a specified method with arguments on every item in a collection.
  util.applyMethod = function (collection, methodName) {
    var fnArguments = util.getTail(arguments, 2);
    return util.transform(collection, function (itemValue) {
      return (methodName ? itemValue[methodName] : itemValue).apply(itemValue, fnArguments);
    });
  };

  // A convenience method for a common map use case: extracting a property.
  util.extractProperty = function (collection, propKey) {
    return util.transform(collection, function (itemValue) {
      return itemValue[propKey];
    });
  };

  // Returns the maximum item or (item-based computation).
  util.findMaximum = function (collection, processor, scope) {
    if (!processor && util.isAnArray(collection)) return Math.max.apply(Math, collection);
    var maxResult = {
      calcResult: -Infinity
    };
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      var currentCalc = processor ? processor.call(scope, itemValue, itemIndex, sourceList) : itemValue;
      currentCalc >= maxResult.calcResult && (maxResult = {
        itemValue: itemValue,
        calcResult: currentCalc
      });
    });
    return maxResult.itemValue;
  };

  // Returns the minimum item (or item-based computation).
  util.findMinimum = function (collection, processor, scope) {
    if (!processor && util.isAnArray(collection)) return Math.min.apply(Math, collection);
    var minResult = {
      calcResult: Infinity
    };
    traverse(collection, function (itemValue, itemIndex, sourceList) {
      var currentCalc = processor ? processor.call(scope, itemValue, itemIndex, sourceList) : itemValue;
      currentCalc < minResult.calcResult && (minResult = {
        itemValue: itemValue,
        calcResult: currentCalc
      });
    });
    return minResult.itemValue;
  };

  // Sorts the collection's values based on a criterion produced by a processor.
  util.sortCollectionBy = function (collection, processor, scope) {
    return util.extractProperty(util.transform(collection, function (itemValue, itemIndex, sourceList) {
      return {
        itemValue: itemValue,
        criteria: processor.call(scope, itemValue, itemIndex, sourceList)
      };
    }).sort(function (leftItem, rightItem) {
      var critA = leftItem.criteria,
        critB = rightItem.criteria;
      return critA < critB ? -1 : critA > critB ? 1 : 0;
    }), 'itemValue');
  };

  // Uses a comparator function to determine the correct insertion index for an object
  // to maintain order. Employs binary search.
  util.insertionIndex = function (dataArray, collectionItem, processor) {
    processor = processor || util.returnSelf;
    var lowIdx = 0,
      highIdx = dataArray.length;
    while (lowIdx < highIdx) {
      var midIdx = (lowIdx + highIdx) >> 1;
      processor(dataArray[midIdx]) < processor(collectionItem) ? lowIdx = midIdx + 1 : highIdx = midIdx;
    }
    return lowIdx;
  };

  // Converts any iterable into a standard array.
  util.convertToArray = function (dataIterable) {
    if (!dataIterable) return [];
    if (dataIterable.convertToArray) return dataIterable.convertToArray();
    if (util.isAnArray(dataIterable)) return dataIterable;
    if (util.isArgsObject(dataIterable)) return arrSlice.call(dataIterable);
    return util.getObjectValues(dataIterable);
  };

  // Returns the number of elements in a collection.
  util.elementCount = function (collection) {
    return util.convertToArray(collection).length;
  };

  // -------------------------- Array Manipulation Functions: ------------------------------

  // Retrieves the first element(s) of an array.
  // Providing 'count' will return the first 'count' values. Aliased as 'getHead'.
  // The 'isProtected' check allows compatibility with util.transform.
  util.getHead = function (dataArray, count, isProtected) {
    return count && !isProtected ? arrSlice.call(dataArray, 0, count) : dataArray[0];
  };

  // Returns all elements except the first entry of the array. Aliased as 'getTail'.
  // Particularly useful for the arguments object. Providing a 'startIndex' will return
  // the rest of the values from that index onwards. The 'isProtected' check
  // allows compatibility with util.transform.
  util.getTail = function (dataArray, startIndex, isProtected) {
    return arrSlice.call(dataArray, util.isUndef(startIndex) || isProtected ? 1 : startIndex);
  };

  // Retrieves the last element of an array.
  util.getLast = function (dataArray) {
    return dataArray[dataArray.length - 1];
  };

  // Removes all falsy values from an array.
  util.removeFalsy = function (dataArray) {
    return util.select(dataArray, function (itemValue) {
      return !!itemValue;
    });
  };

  // Produces a completely flattened version of an array (removes nested arrays).
  util.deNest = function (dataArray) {
    return util.aggregate(dataArray, [], function (accumulator, itemValue) {
      if (util.isAnArray(itemValue)) return accumulator.concat(util.deNest(itemValue));
      accumulator.push(itemValue);
      return accumulator;
    });
  };

  // Returns a version of the array that excludes the specified value(s).
  util.excludeValues = function (dataArray) {
    var excludedItems = util.getTail(arguments);
    return util.select(dataArray, function (itemValue) {
      return !util.contains(excludedItems, itemValue);
    });
  };

  // Creates a version of the array with no duplicate elements. If the array is
  // already sorted, a faster algorithm can be used.
  util.uniqueElements = function (dataArray, isSorted) {
    return util.aggregate(dataArray, [], function (accumulator, el, idx) {
      if (0 == idx || (isSorted === true ? util.getLast(accumulator) != el : !util.contains(accumulator, el))) accumulator.push(el);
      return accumulator;
    });
  };

  // Generates an array containing items common to all provided arrays.
  util.commonElements = function (dataArray) {
    var otherArrays = util.getTail(arguments);
    return util.select(util.uniqueElements(dataArray), function (item) {
      return util.allTrue(otherArrays, function (otherArray) {
        return util.findPosition(otherArray, item) >= 0;
      });
    });
  };

  // Combines multiple lists into a single array -- elements sharing
  // an index are grouped.
  util.interleave = function () {
    var fnArguments = util.convertToArray(arguments);
    var maxLength = util.findMaximum(util.extractProperty(fnArguments, 'length'));
    var resultantArray = new Array(maxLength);
    for (var i = 0; i < maxLength; i++) resultantArray[i] = util.extractProperty(fnArguments, String(i));
    return resultantArray;
  };

  // If the browser lacks native indexOf (e.g., MSIE), we provide this.
  // Returns the position of the first occurrence of an item, or -1 if not found.
  // Delegates to JavaScript 1.8's native indexOf if available.
  util.findPosition = function (dataArray, targetItem) {
    if (natIndexOf && dataArray.indexOf === natIndexOf) return dataArray.indexOf(targetItem);
    for (var i = 0, len = dataArray.length; i < len; i++)
      if (dataArray[i] === targetItem) return i;
    return -1;
  };


  // Delegates to JavaScript 1.6's native lastIndexOf if available.
  util.findLastPosition = function (dataArray, targetItem) {
    if (natLastIndexOf && dataArray.lastIndexOf === natLastIndexOf) return dataArray.lastIndexOf(targetItem);
    var i = dataArray.length;
    while (i--)
      if (dataArray[i] === targetItem) return i;
    return -1;
  };

  // Creates an integer array representing an arithmetic progression. A port of
  // Python's native range() function. See:
  // http://docs.python.org/library/functions.html#range
  util.generateSequence = function (startValue, endValue, stepValue) {
    var argList = util.convertToArray(arguments);
    var singleArg = argList.length <= 1;
    var start = singleArg ? 0 : argList[0],
      end = singleArg ? argList[0] : argList[1],
      step = argList[2] || 1;
    var seqLength = Math.ceil((end - start) / step);
    if (seqLength <= 0) return [];
    var sequenceArray = new Array(seqLength);
    for (var i = start, currentIdx = 0; true; i += step) {
      if ((step > 0 ? i - end : end - i) >= 0) return sequenceArray;
      sequenceArray[currentIdx++] = i;
    }
  };

  // ----------------------- Function Utilities: ------------------------------

  // Creates a function bound to a specific object (setting 'this' and arguments).
  // Binding with arguments is also known as 'currying'.
  util.createBoundFn = function (operation, targetObject) {
    var fnArguments = util.getTail(arguments, 2);
    return function () {
      return operation.apply(targetObject || {}, fnArguments.concat(util.convertToArray(arguments)));
    };
  };

  // Binds all methods of an object to that object itself. Useful for ensuring
  // that all callbacks defined on an object maintain their context.
  util.bindAllMethods = function (targetObject) {
    var operations = util.getTail(arguments);
    if (operations.length == 0) operations = util.getFunctionNames(targetObject);
    traverse(operations, function (fnName) {
      targetObject[fnName] = util.createBoundFn(targetObject[fnName], targetObject);
    });
    return targetObject;
  };

  // Delays function execution for a specified number of milliseconds,
  // then calls it with the provided arguments.
  util.scheduleDelayed = function (operation, delayMs) {
    var fnArguments = util.getTail(arguments, 2);
    return setTimeout(function () {
      return operation.apply(operation, fnArguments);
    }, delayMs);
  };

  // Defers a function, scheduling it to run after the current call stack clears.
  util.scheduleDeferred = function (operation) {
    return util.scheduleDelayed.apply(util, [operation, 1].concat(util.getTail(arguments)));
  };

  // Returns the first function passed as an argument to the second,
  // allowing argument adjustment, pre/post code execution, and conditional execution.
  util.decorateFunction = function (originalFn, decorator) {
    return function () {
      var fnArguments = [originalFn].concat(util.convertToArray(arguments));
      return decorator.apply(decorator, fnArguments);
    };
  };

  // Returns a function that represents the composition of a list of functions,
  // where each function consumes the return value of the function preceding it.
  util.chainFunctions = function () {
    var operations = util.convertToArray(arguments);
    return function () {
      var fnArguments = util.convertToArray(arguments);
      for (var i = operations.length - 1; i >= 0; i--) {
        fnArguments = [operations[i].apply(this, fnArguments)];
      }
      return fnArguments[0];
    };
  };

  // ------------------------- Object Manipulation Functions: ------------------------------

  // Retrieves the names of an object's enumerable properties.
  // Delegates to ECMA5's native Object.keys.
  util.getObjectKeys = natKeys || function (collection) {
    if (util.isAnArray(collection)) return util.generateSequence(0, collection.length);
    var propertyKeys = [];
    for (var propKey in collection)
      if (ownPropertyChecker.call(collection, propKey)) propertyKeys.push(propKey);
    return propertyKeys;
  };

  // Retrieves the values of an object's properties.
  util.getObjectValues = function (collection) {
    return util.transform(collection, util.returnSelf);
  };

  // Returns a sorted list of callable function names available on the object.
  util.getFunctionNames = function (collection) {
    return util.select(util.getObjectKeys(collection), function (propKey) {
      return util.isCallable(collection[propKey]);
    }).sort();
  };

  // Extends a given object with all properties from one or more source objects.
  util.assignProperties = function (target) {
    var i = 1,
      length = arguments.length,
      sourceObject;
    for (; i < length; i++) {
      // Only process defined values
      if ((sourceObject = arguments[i]) != undefined) {
        Object.getOwnPropertyNames(sourceObject).forEach(function (propName) {
          var propDescriptor = Object.getOwnPropertyDescriptor(sourceObject, propName) || {
            value: sourceObject[propName]
          };
          if (propDescriptor.get) {
            target.__defineGetter__(propName, propDescriptor.get);
            if (propDescriptor.set) target.__defineSetter__(propName, propDescriptor.set);
          } else if (target !== propDescriptor.value) {
            target[propName] = propDescriptor.value;
          }
        });
      }
    }
    return target;
  };


  // Creates a shallow duplicate of an object.
  util.duplicateObject = function (collection) {
    if (util.isAnArray(collection)) return arrSlice.call(collection, 0);
    return util.assignProperties({}, collection);
  };

  // Invokes a callbackFn with the object, then returns the object.
  // The main purpose is to "tap into" a method chain to perform operations on intermediate results.
  util.inspectChain = function (collection, callbackFn) {
    callbackFn(collection);
    return collection;
  };

  // Performs a deep comparison to check if two objects are equivalent.
  util.deepEquals = function (valA, valB) {
    // Check object identity.
    if (valA === valB) return true;
    // Different types?
    var typeA = typeof (valA),
      typeB = typeof (valB);
    if (typeA != typeB) return false;
    // Basic equality test (beware of coercions).
    if (valA == valB) return true;
    // One is falsy and the other truthy.
    if ((!valA && valB) || (valA && !valB)) return false;
    // Does one of them implement an deepEquals()?
    if (valA.deepEquals) return valA.deepEquals(valB);
    // Compare dates' internal integer values.
    if (util.isADate(valA) && util.isADate(valB)) return valA.getTime() === valB.getTime();
    // Both are NaN?
    if (util.isNotANumber(valA) && util.isNotANumber(valB)) return true;
    // Compare regular expressions.
    if (util.isRegex(valA) && util.isRegex(valB))
      return valA.source === valB.source &&
        valA.global === valB.global &&
        valA.ignoreCase === valB.ignoreCase &&
        valA.multiline === valB.multiline;
    // If valA is not an object by this point, we cannot handle it.
  };

  // ------------------- Utility Type Checks (Helper Functions): --------------------

  // Determines if an object is an array.
  util.isAnArray = natIsArray || function (checkVal) {
    return objToString.call(checkVal) == '[object Array]';
  };

  // Determines if a value is a function.
  util.isCallable = function (checkVal) {
    return objToString.call(checkVal) == '[object Function]';
  };

  // Determines if a value is a string.
  util.isAString = function (checkVal) {
    return objToString.call(checkVal) == '[object String]';
  };

  // Determines if a value is a number.
  util.isNumeric = function (checkVal) {
    return objToString.call(checkVal) == '[object Number]';
  };

  // Determines if a value is a boolean.
  util.isBoolean = function (checkVal) {
    return objToString.call(checkVal) == '[object Boolean]';
  };

  // Determines if a value is a Date object.
  util.isADate = function (checkVal) {
    return objToString.call(checkVal) == '[object Date]';
  };

  // Determines if a value is a RegExp object.
  util.isRegex = function (checkVal) {
    return objToString.call(checkVal) == '[object RegExp]';
  };

  // Determines if a value is NaN.
  util.isNotANumber = function (checkVal) {
    return checkVal !== checkVal; // NaN is the only value not equal to itself.
  };

  // Determines if a value is an Arguments object.
  util.isArgsObject = function (checkVal) {
    return objToString.call(checkVal) == '[object Arguments]';
  };

  // Determines if a value is undefined.
  util.isUndef = function (checkVal) {
    return typeof checkVal == 'undefined';
  };

  // A simple function that returns the value passed to it.
  util.returnSelf = function (val) {
    return val;
  };

  // A function to throw the loop terminator.
  util.terminateLoop = function () {
    throw loopTerminator;
  };

  // The object used to wrap collections.
  var utilityWrapper = function (obj) {
    this.wrapped = obj;
  };

  // Add all of the utility functions to the wrapper object.
  traverse(util.getFunctionNames(util), function (fnName) {
    utilityWrapper.prototype[fnName] = function () {
      var fnArguments = util.convertToArray(arguments);
      arrUnshift.call(fnArguments, this.wrapped);
      return util[fnName].apply(util, fnArguments);
    };
  });

  // Alias some methods to provide a more functional style.
  utilityWrapper.prototype.value = function () {
    return this.wrapped;
  };
  utilityWrapper.prototype.valueOf = utilityWrapper.prototype.toJSON = utilityWrapper.prototype.value;

  utilityWrapper.prototype.each = utilityWrapper.prototype.traverse;
  utilityWrapper.prototype.map = utilityWrapper.prototype.transform;
  utilityWrapper.prototype.reduce = utilityWrapper.prototype.aggregate;
  utilityWrapper.prototype.reduceRight = utilityWrapper.prototype.reverseAggregate;
  utilityWrapper.prototype.filter = utilityWrapper.prototype.select;
  utilityWrapper.prototype.every = utilityWrapper.prototype.allTrue;
  utilityWrapper.prototype.some = utilityWrapper.prototype.anyTrue;
  utilityWrapper.prototype.detect = utilityWrapper.prototype.findFirst;
  utilityWrapper.prototype.pluck = utilityWrapper.prototype.extractProperty;
  utilityWrapper.prototype.first = utilityWrapper.prototype.getHead;
  utilityWrapper.prototype.rest = utilityWrapper.prototype.getTail;
  utilityWrapper.prototype.last = utilityWrapper.prototype.getLast;
  utilityWrapper.prototype.compact = utilityWrapper.prototype.removeFalsy;
  utilityWrapper.prototype.flatten = utilityWrapper.prototype.deNest;
  utilityWrapper.prototype.without = utilityWrapper.prototype.excludeValues;
  utilityWrapper.prototype.uniq = utilityWrapper.prototype.uniqueElements;
  utilityWrapper.prototype.min = utilityWrapper.prototype.findMinimum;
  utilityWrapper.prototype.max = utilityWrapper.prototype.findMaximum;
  utilityWrapper.prototype.sortBy = utilityWrapper.prototype.sortCollectionBy;
  utilityWrapper.prototype.tap = utilityWrapper.prototype.inspectChain;
  utilityWrapper.prototype.toArray = utilityWrapper.prototype.convertToArray;
  utilityWrapper.prototype.size = utilityWrapper.prototype.elementCount;
  utilityWrapper.prototype.initial = utilityWrapper.prototype.getInitial; // New alias: 'initial'
  utilityWrapper.prototype.union = utilityWrapper.prototype.combineArrays; // New alias: 'union'
  utilityWrapper.prototype.difference = utilityWrapper.prototype.arrayDifference; // New alias: 'difference'
  utilityWrapper.prototype.zip = utilityWrapper.prototype.interleave; // Existing alias
  utilityWrapper.prototype.indexOf = utilityWrapper.prototype.findPosition;
  utilityWrapper.prototype.lastIndexOf = utilityWrapper.prototype.findLastPosition;
  utilityWrapper.prototype.range = utilityWrapper.prototype.generateSequence;


  // For convenience, add aliases for some methods that return wrapped values.
  // This is a common pattern in utility libraries for chaining.
  util.chain = function (obj) {
    return util(obj).chain();
  };
  utilityWrapper.prototype.chain = function () {
    this._chain = true;
    return this;
  };

  // The wrapper function to handle chaining.
  var processChain = function (instance, method, args) {
    return instance._chain ? util(method.apply(util, args)).chain() : method.apply(util, args);
  };

  // Add chaining support to all functions that return a collection.
  traverse(['transform', 'select', 'discard', 'uniqueElements', 'commonElements', 'interleave', 'generateSequence',
    'removeFalsy', 'deNest', 'excludeValues', 'extractProperty', 'sortCollectionBy', 'getHead', 'getTail', 'getLast',
    'convertToArray', 'getObjectKeys', 'getObjectValues', 'getFunctionNames'
  ], function (fnName) {
    var originalFn = util[fnName];
    util[fnName] = function () {
      return processChain(this, originalFn, arguments);
    };
  });

  // Add chaining support to all functions that return a boolean or scalar value.
  traverse(['elementCount', 'findPosition', 'findLastPosition', 'findMaximum', 'findMinimum', 'insertionIndex', 'contains',
    'allTrue', 'anyTrue', 'isNumeric', 'isAnArray', 'isCallable', 'isAString', 'isBoolean', 'isADate', 'isRegex', 'isNotANumber',
    'isArgsObject', 'isUndef', 'deepEquals'
  ], function (fnName) {
    var originalFn = util[fnName];
    util[fnName] = function () {
      return this._chain ? util(originalFn.apply(util, arguments)).chain() : originalFn.apply(util, arguments);
    };
  });

  // Add chaining support to functions that modify the object in place (like assignProperties).
  traverse(['assignProperties', 'bindAllMethods'], function (fnName) {
    var originalFn = util[fnName];
    util[fnName] = function () {
      var returned = originalFn.apply(util, arguments);
      return this._chain ? util(returned).chain() : returned;
    };
  });


  // Add two new utility methods for array manipulation that were not in the original.
  // These are for demonstrating data type changes/new functionality if needed,
  // but keeping it simple for Type II.
  // Get all but the last element of an array.
  util.getInitial = function (dataArray, count, isProtected) {
    return count && !isProtected ? arrSlice.call(dataArray, 0, dataArray.length - count) : arrSlice.call(dataArray, 0, dataArray.length - 1);
  };

  // Computes the union of the passed-in arrays: the unique values from all of the arrays.
  util.combineArrays = function () {
    return util.uniqueElements(arrSlice.call(arguments).flat());
  };

  // Computes the list of values in the first array that are not present in the subsequent arrays.
  util.arrayDifference = function (dataArray) {
    var otherArrays = util.getTail(arguments);
    otherArrays = util.deNest(otherArrays); // Flatten other arrays for easier comparison
    return util.select(dataArray, function (item) {
      return !util.contains(otherArrays, item);
    });
  };

  // Add the new functions to the wrapper prototype for chaining.
  utilityWrapper.prototype.initial = utilityWrapper.prototype.getInitial;
  utilityWrapper.prototype.union = utilityWrapper.prototype.combineArrays;
  utilityWrapper.prototype.difference = utilityWrapper.prototype.arrayDifference;


}) ();