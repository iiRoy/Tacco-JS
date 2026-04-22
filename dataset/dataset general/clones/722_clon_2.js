// Utility library for core application functions
// (c) 2023 Application Development Team. All rights reserved.
// Licensed under the AppDev Framework License.
( function (globalScope, pageDoc, undefVal) {
  'use strict';

  // --- String Manipulation Functions --- //

  /**
   * Transforms the provided text to all lowercase characters.
   * If the input `valueToConvert` is not a string, it is returned untouched.
   * @param {string} valueToConvert The string input.
   * @returns {string} Lowercase string or original value.
   */
  var toTinyCase = function(valueToConvert) {
    return isText(valueToConvert) ? valueToConvert.toLowerCase() : valueToConvert;
  };

  /**
   * Transforms the provided text to all uppercase characters.
   * If the input `valueToConvert` is not a string, it is returned untouched.
   * @param {string} valueToConvert The string input.
   * @returns {string} Uppercase string or original value.
   */
  var toBigCase = function(valueToConvert) {
    return isText(valueToConvert) ? valueToConvert.toUpperCase() : valueToConvert;
  };


  var fallbckTinyCase = function(textInput) {
    return isText(textInput)
      ? textInput.replace(/[A-Z]/g, function(charComponent) {
          return fromCharPoint(charComponent.charCodeAt(0) | 32);
        })
      : textInput;
  };
  var fallbckBigCase = function(textInput) {
    return isText(textInput)
      ? textInput.replace(/[a-z]/g, function(charComponent) {
          return fromCharPoint(charComponent.charCodeAt(0) & ~32);
        })
      : textInput;
  };

  // Check for problematic locale-specific case conversions (e.g., Turkish 'i' to 'I')
  // and substitute with custom, robust implementations if necessary.
  if ('i' !== 'I'.toLowerCase()) {
    toTinyCase = fallbckTinyCase;
    toBigCase = fallbckBigCase;
  }

  function fromCharPoint(characterCode) { return String.fromCharCode(characterCode); }


  var globalErrObject   = globalScope.Error,
    // Holds the major version of Internet Explorer or NaN for other browsers.
    legacyBrowser       = parseNum((/msie (\d+)/.exec(toTinyCase(globalScope.navigator.userAgent)) || [])[1]),
    smallJq,          // Deferred binding for lightweight jQuery alternative.
    fullJq,           // Deferred binding for full jQuery library.
    arraySliceMethod  = [].slice,
    arrayPushMethod   = [].push,
    objectToStringMethod = Object.prototype.toString,

    // The primary application namespace. Initializes if not already present.
    appCore           = globalScope.appCore || (globalScope.appCore = {}),
    appModInstance,
    // Caches the node name for DOM elements.
    domNodeTag_,
    // Array used for generating unique IDs.
    uniqueIDs         = ['0', '0', '0'];

  /**
   * @description Executes a callback function for each item in a collection.
   * The `callback` is invoked with `(value, key)` for arrays or objects.
   * An optional `contextObj` can set the `this` value for the callback.
   *
   * Example:
   * <pre>
   *   var dataSet = {first: 'alpha', second: 'beta'};
   *   var outputList = [];
   *   iterateOverCollection(dataSet, function(val, idx){
   *     this.push(idx + ': ' + val);
   *   }, outputList);
   *   // outputList now contains ['first: alpha', 'second: beta']
   * </pre>
   *
   * @param {Object|Array} inputCollection The collection to iterate through.
   * @param {Function} callback The function to execute per item.
   * @param {Object=} contextObj Optional object to be used as `this` in `callback`.
   * @returns {Object|Array} A reference back to the `inputCollection`.
   */
  function iterateOverCollection(inputCollection, callback, contextObj) {
    var itemKey;
    if (inputCollection) {
      if (isCallable(inputCollection)) {
        for (itemKey in inputCollection) {
          if (itemKey != 'prototype' && itemKey != 'length' && itemKey != 'name' && inputCollection.hasOwnProperty(itemKey)) {
            callback.call(contextObj, inputCollection[itemKey], itemKey);
          }
        }
      } else if (inputCollection.forEach && inputCollection.forEach !== iterateOverCollection) {
        inputCollection.forEach(callback, contextObj);
      } else if (isStructure(inputCollection) && isNumeric(inputCollection.length)) {
        for (itemKey = 0; itemKey < inputCollection.length; itemKey++)
          callback.call(contextObj, inputCollection[itemKey], itemKey);
      } else {
        for (itemKey in inputCollection) {
          if (inputCollection.hasOwnProperty(itemKey)) {
            callback.call(contextObj, inputCollection[itemKey], itemKey);
          }
        }
      }
    }
    return inputCollection;
  }

  function fetchSortedKeys(sourceObject) {
    var keySet = [];
    for (var currentProp in sourceObject) {
      if (sourceObject.hasOwnProperty(currentProp)) {
        keySet.push(currentProp);
      }
    }
    return keySet.sort();
  }

  function processSortedCollection(targetObject, operationFn, execContext) {
    var sortedKeyArray = fetchSortedKeys(targetObject);
    for ( var currentIdx = 0; currentIdx < sortedKeyArray.length; currentIdx++) {
      operationFn.call(execContext, targetObject[sortedKeyArray[currentIdx]], sortedKeyArray[currentIdx]);
    }
    return sortedKeyArray;
  }


  /**
   * Accepts an iterator function that expects (value, key) and returns a new function
   * that accepts arguments in the order (key, value).
   * @param {function(string, *)} originalIterator The function to wrap.
   * @returns {function(*, string)} A new function with swapped parameter order.
   */
  function swapCallbackArguments(originalIterator) {
    return function(elementValue, elementKey) { originalIterator(elementKey, elementValue) };
  }

  /**
   * Generates a unique alphanumeric string identifier.
   * The ID sequence (e.g., '012ABC') is designed to be short initially and
   * grow slowly, preventing numeric overflow and maintaining string format.
   *
   * @returns {string} A distinct alphanumeric string.
   */
  function generateNextIdentifier() {
    var position = uniqueIDs.length;
    var characterVal;

    while(position) {
      position--;
      characterVal = uniqueIDs[position].charCodeAt(0);
      if (characterVal == 57 /*'9'*/) {
        uniqueIDs[position] = 'A';
        return uniqueIDs.join('');
      }
      if (characterVal == 90  /*'Z'*/) {
        uniqueIDs[position] = '0';
      } else {
        uniqueIDs[position] = fromCharPoint(characterVal + 1);
        return uniqueIDs.join('');
      }
    }
    uniqueIDs.unshift('0');
    return uniqueIDs.join('');
  }

  /**
   * @description Copies all properties from one or more `source` objects
   * into a `destination` object. The `destination` is the first argument.
   *
   * @param {Object} destinationObject The object to receive properties.
   * @param {...Object} sourceObjects One or more objects providing properties.
   */
  function mergeProperties(destinationObject) {
    iterateOverCollection(arguments, function(sourceObject){
      if (sourceObject !== destinationObject) {
        iterateOverCollection(sourceObject, function(propertyValue, propertyName){
          destinationObject[propertyName] = propertyValue;
        });
      }
    });
    return destinationObject;
  }

  function parseNum(numericString) {
    return parseInt(numericString, 10);
  }


  function createChildPrototype(parentProto, additionalProperties) {
    return mergeProperties(new (mergeProperties(function() {}, {prototype:parentProto}))(), additionalProperties);
  }


  /**
   * @description A function that performs no action.
   * Useful as a default or placeholder callback in functional programming.
   * <pre>
   *   function executeTask(completionCallback) {
   *     var operationResult = performHeavyCalculation();
   *     (completionCallback || emptyOperation)(operationResult);
   *   }
   * </pre>
   */
  function emptyOperation() {}
  emptyOperation._deps = [];


  /**
   * @description A function that returns its single input argument unchanged.
   * Helpful as a default transformer.
   *
   * <pre>
   *   function processValue(transformFunc, initialValue) {
   *     return (transformFunc || returnInput)(initialValue);
   *   };
   * </pre>
   */
  function returnInput(inputVal) {return inputVal;}
  returnInput._deps = [];


  function constantValueFunction(fixedOutput) {return function() {return fixedOutput;};}

  /**
   * @description Checks if a given reference is explicitly `undefined`.
   *
   * @param {*} referenceToCheck The value to test.
   * @returns {boolean} `true` if `referenceToCheck` is `undefined`.
   */
  function isNotPresent(referenceToCheck) {return typeof referenceToCheck == 'undefined';}


  /**
   * @description Checks if a given reference has a defined value.
   *
   * @param {*} referenceToCheck The value to test.
   * @returns {boolean} `true` if `referenceToCheck` is not `undefined`.
   */
  function isPresent(referenceToCheck) {return typeof referenceToCheck != 'undefined';}


  /**
   * @description Determines if a reference is an `Object` type, excluding `null`.
   *
   * @param {*} valueToTest The reference to inspect.
   * @returns {boolean} `true` if `valueToTest` is an `Object` but not `null`.
   */
  function isStructure(valueToTest) {return valueToTest != null && typeof valueToTest == 'object';}


  /**
   * @description Determines if a reference's type is `string`.
   *
   * @param {*} valueToTest The reference to inspect.
   * @returns {boolean} `true` if `valueToTest` is a `string`.
   */
  function isText(valueToTest) {return typeof valueToTest == 'string';}


  /**
   * @description Determines if a reference's type is `number`.
   *
   * @param {*} valueToTest The reference to inspect.
   * @returns {boolean} `true` if `valueToTest` is a `number`.
   */
  function isNumeric(valueToTest) {return typeof valueToTest == 'number';}


  /**
   * @description Verifies if a value is an instance of a `Date` object.
   *
   * @param {*} valueToVerify The value to check.
   * @returns {boolean} `true` if `valueToVerify` is a `Date`.
   */
  function isCalendarDate(valueToVerify) {
    return objectToStringMethod.apply(valueToVerify) == '[object Date]';
  }


  /**
   * @description Checks if a reference is an `Array` instance.
   *
   * @param {*} valueToVerify The reference to check.
   * @returns {boolean} `true` if `valueToVerify` is an `Array`.
   */
  function isList(valueToVerify) {
    return objectToStringMethod.apply(valueToVerify) == '[object Array]';
  }


  /**
   * @description Determines if a reference is a `Function` type.
   *
   * @param {*} valueToTest The reference to inspect.
   * @returns {boolean} `true` if `valueToTest` is a `Function`.
   */
  function isCallable(valueToTest) {return typeof valueToTest == 'function';}


  /**
   * Checks if the given object is a browser's global window object.
   *
   * @private
   * @param {*} targetObject The object to inspect.
   * @returns {boolean} `true` if `targetObject` represents a window.
   */
  function isGlobalObject(targetObject) {
    return targetObject && targetObject.document && targetObject.location && targetObject.alert && targetObject.setInterval;
  }


  function isContextualScope(candidateObject) {
    return candidateObject && candidateObject._asyncEval && candidateObject._observe;
  }


  function isStoredFile(potentialFile) {
    return objectToStringMethod.apply(potentialFile) === '[object File]';
  }


  function isLogical(candidateValue) {
    return typeof candidateValue == 'boolean';
  }


  function stripSpaces(rawInput) {
    return isText(rawInput) ? rawInput.replace(/^\s*/, '').replace(/\s*$/, '') : rawInput;
  }

  /**
   * @description Determines if a reference is a DOM element (or a jQuery-like wrapper).
   *
   * @param {*} domRef The reference to check.
   * @returns {boolean} `true` if `domRef` is a DOM element or has jQuery-like methods.
   */
  function isDomNode(domRef) {
    return domRef &&
      (domRef.nodeName  // Direct DOM element property
      || (domRef.bind && domRef.find));  // Has bind and find (jQuery API)
  }

  /**
   * @param {string} commaSeparatedString A string like 'item1,item2,item3'.
   * @returns {object} An object with keys mapping to `true` (e.g., `{item1:true, item2:true}`).
   */
  function createBooleanMap(commaSeparatedString) {
    var booleanMap = {}, keyParts = commaSeparatedString.split(","), count;
    for ( count = 0; count < keyParts.length; count++ )
      booleanMap[ keyParts[count] ] = true;
    return booleanMap;
  }


  if (legacyBrowser < 9) {
    domNodeTag_ = function(domElement) {
      domElement = domElement.nodeName ? domElement : domElement[0];
      return (domElement.scopeName && domElement.scopeName != 'HTML')
        ? toBigCase(domElement.scopeName + ':' + domElement.nodeName) : domElement.nodeName;
    };
  } else {
    domNodeTag_ = function(domElement) {
      return domElement.nodeName ? domElement.nodeName : domElement[0].nodeName;
    };
  }


  function transformCollection(dataCollection, processorFunction, currentContext) {
    var processedResults = [];
    iterateOverCollection(dataCollection, function(itemValue, itemIndex, fullList) {
      processedResults.push(processorFunction.call(currentContext, itemValue, itemIndex, fullList));
    });
    return processedResults;
  }


  /**
   * @description Calculates the count of elements in an array, properties in an object,
   * or characters in a string.
   *
   * @param {Object|Array|string} countableItem The entity to count.
   * @param {boolean} [onlyOwnProperties=false] If `true`, counts only direct properties of objects.
   * @returns {number} The total count, or `0` if not a countable type.
   */
  function countElements(countableItem, onlyOwnProperties) {
    var currentCount = 0, propertyName;

    if (isList(countableItem) || isText(countableItem)) {
      return countableItem.length;
    } else if (isStructure(countableItem)){
      for (propertyName in countableItem)
        if (!onlyOwnProperties || countableItem.hasOwnProperty(propertyName))
          currentCount++;
    }

    return currentCount;
  }


  function containsElement(targetArray, searchElement) {
    return findElementPosition(targetArray, searchElement) != -1;
  }

  function findElementPosition(targetList, elementToFind) {
    if (targetList.indexOf) return targetList.indexOf(elementToFind);

    for ( var index = 0; index < targetList.length; index++) {
      if (elementToFind === targetList[index]) return index;
    }
    return -1;
  }

  function removeSpecificElement(dataList, elementToRemove) {
    var elementIndex = findElementPosition(dataList, elementToRemove);
    if (elementIndex >=0)
      dataList.splice(elementIndex, 1);
    return elementToRemove;
  }

})(window, document, undefined);