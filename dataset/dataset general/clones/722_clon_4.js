(function(globalScope, docInterface, undefinedValue) {
'use strict';

// Renamed core type checking utilities
const checkIfText = (val) => typeof val === 'string';
const checkIfNumber = (val) => typeof val === 'number';
const checkIfRoutine = (val) => typeof val === 'function';
const checkIfStructure = (val) => val !== null && typeof val === 'object';
const checkIfList = (val) => Array.isArray(val);
const checkIfAbsent = (val) => typeof val === 'undefined';
const checkIfPresent = (val) => typeof val !== 'undefined';

// Internal utility for character code conversion
const charFromCode = (code) => String.fromCharCode(code);

// Bitwise delta for ASCII case conversion (e.g., 'a' - 'A')
const caseDelta = 32;

// Custom lowercase conversion, character by character (replaces manualLowercase and the conditional lowercase)
const convertToLower = (sourceText) => {
  if (!checkIfText(sourceText)) return sourceText;
  let resultString = '';
  for (let idx = 0; idx < sourceText.length; idx++) {
    const charCode = sourceText.charCodeAt(idx);
    if (charCode >= 65 /* 'A' */ && charCode <= 90 /* 'Z' */) {
      resultString += charFromCode(charCode | caseDelta); // Using bitwise OR for lowercase
    } else {
      resultString += sourceText[idx];
    }
  }
  return resultString;
};

// Custom uppercase conversion, character by character (replaces manualUppercase and the conditional uppercase)
const convertToUpper = (sourceText) => {
  if (!checkIfText(sourceText)) return sourceText;
  let resultString = '';
  for (let idx = 0; idx < sourceText.length; idx++) {
    const charCode = sourceText.charCodeAt(idx);
    if (charCode >= 97 /* 'a' */ && charCode <= 122 /* 'z' */) {
      resultString += charFromCode(charCode & ~caseDelta); // Using bitwise AND NOT for uppercase
    } else {
      resultString += sourceText[idx];
    }
  }
  return resultString;
};

// Primary case conversion functions, always using the robust custom methods
const transformToMinorCase = convertToLower;
const transformToMajorCase = convertToUpper;

// Renamed `forEach`: Iterates over various collection types
const traverseCollection = (items, actionRoutine, executionContext) => {
  if (!items) {
    return items;
  }

  if (checkIfRoutine(items)) {
    // Original handled functions as objects (iterating their own properties)
    for (const propName in items) {
      if (propName !== 'prototype' && propName !== 'length' && propName !== 'name' && Object.prototype.hasOwnProperty.call(items, propName)) {
        actionRoutine.call(executionContext, items[propName], propName);
      }
    }
  } else if (checkIfList(items) || (checkIfStructure(items) && checkIfNumber(items.length) && items.length >= 0)) {
    // Handling arrays and array-like objects with a numeric length
    for (let index = 0; index < items.length; index++) {
      actionRoutine.call(executionContext, items[index], index);
    }
  } else if (checkIfStructure(items)) {
    // Handling plain objects
    for (const propName in items) {
      if (Object.prototype.hasOwnProperty.call(items, propName)) {
        actionRoutine.call(executionContext, items[propName], propName);
      }
    }
  }
  return items;
};

// Renamed `sortedKeys`: Returns an array of an object's own property names, sorted alphabetically
const obtainSortedIdentifiers = (targetStructure) => {
  if (!checkIfStructure(targetStructure)) return [];
  return Object.keys(targetStructure).sort();
};

// Renamed `forEachSorted`: Iterates over an object's properties in sorted key order
const processSortedCollection = (targetStructure, actionRoutine, executionContext) => {
  const orderedIdentifiers = obtainSortedIdentifiers(targetStructure);
  for (let i = 0; i < orderedIdentifiers.length; i++) {
    const currentKey = orderedIdentifiers[i];
    actionRoutine.call(executionContext, targetStructure[currentKey], currentKey);
  }
  return orderedIdentifiers;
};

// Renamed `reverseParams`: Creates a new function that calls the original with swapped arguments
const flipArguments = (originalRoutine) => {
  return (valA, valB) => originalRoutine(valB, valA);
};

// Renamed `nextUid`: Generates a unique alphanumeric identifier using a counter
let markerCounter = 0;
const generateUniqueMarker = () => {
  markerCounter++;
  return 'uid_' + markerCounter.toString(36); // Base 36 for alphanumeric IDs
};

// Renamed `extend`: Copies properties from source objects to a destination object
const combineProperties = (destinationObject, ...sourceObjects) => {
  if (!checkIfStructure(destinationObject)) {
    destinationObject = {};
  }
  for (let i = 0; i < sourceObjects.length; i++) {
    const currentSource = sourceObjects[i];
    if (currentSource !== destinationObject && checkIfStructure(currentSource)) {
      for (const keyId in currentSource) {
        if (Object.prototype.hasOwnProperty.call(currentSource, keyId)) {
          destinationObject[keyId] = currentSource[keyId];
        }
      }
    }
  }
  return destinationObject;
};

// Renamed `int`: Parses a string to an integer
const parseWhole = (textValue) => parseInt(textValue, 10);

// Renamed `inherit`: Creates a new object inheriting from a base object
const createDerivative = (baseObject, additionalProps) => {
  const derived = Object.create(baseObject);
  if (additionalProps) {
    combineProperties(derived, additionalProps);
  }
  return derived;
};

// Renamed `noop`: A function that does nothing
const doNothing = () => {};

// Renamed `identity`: A function that returns its first argument
const returnInput = (val) => val;

// Renamed `valueFn`: Returns a function that, when called, returns a fixed value
const produceConstant = (fixedValue) => () => fixedValue;

// Renamed type checks using Object.prototype.toString for specific types
const internalObjectRepresentation = Object.prototype.toString;

const checkIfDateObject = (val) => internalObjectRepresentation.call(val) === '[object Date]';
const checkIfFileObject = (val) => internalObjectRepresentation.call(val) === '[object File]';
const checkIfBooleanValue = (val) => typeof val === 'boolean';

// Renamed `isWindow`: Checks if an object is a window object
const checkIfGlobalObject = (candidate) => candidate && candidate.document && candidate.location && candidate.alert && candidate.setInterval;

// Renamed `isScope`: Checks for Angular-like scope properties
const checkIfScopeLike = (candidate) => candidate && checkIfRoutine(candidate.$evalAsync) && checkIfRoutine(candidate.$watch);

// Renamed `isElement`: Checks if a value is a DOM element or a jQuery-wrapped element
const checkIfDomElement = (candidate) => candidate && (candidate.nodeName || (checkIfRoutine(candidate.bind) && checkIfRoutine(candidate.find)));

// Renamed `trim`: Removes leading/trailing whitespace from a string
const stripWhitespace = (sourceText) => {
  if (!checkIfText(sourceText)) return sourceText;
  return sourceText.trim();
};

// Renamed `makeMap`: Creates an object map from a comma-separated string
const createBooleanLookup = (commaSeparatedString) => {
  const lookup = {};
  if (checkIfText(commaSeparatedString) && commaSeparatedString.length > 0) {
    commaSeparatedString.split(',').forEach(item => {
      lookup[item.trim()] = true;
    });
  }
  return lookup;
};

// Internal browser detection logic for `getElementTagName`
const detectBrowserInfo = (() => {
  const userAgentString = transformToMinorCase(globalScope.navigator.userAgent);
  const msieMatch = userAgentString.match(/msie (\d+)/);
  const tridentMatch = userAgentString.match(/trident\/(\d+)/); // For IE11+ engine versions

  let ieVersion = NaN;
  if (msieMatch) {
    ieVersion = parseWhole(msieMatch[1]);
  } else if (tridentMatch) {
    ieVersion = 11; // Simplified: assume IE11 for Trident engine
  }

  return {
    isLegacyIE: ieVersion < 9
  };
})();

// Renamed `nodeName_`: Gets the node name, handling legacy IE quirks
const getElementTagName = (domNode) => {
  const actualNode = domNode && domNode.nodeName ? domNode : (domNode && domNode[0]);
  if (!actualNode) return undefinedValue;

  if (detectBrowserInfo.isLegacyIE) {
    return (actualNode.scopeName && actualNode.scopeName !== 'HTML')
      ? transformToMajorCase(actualNode.scopeName + ':' + actualNode.nodeName)
      : actualNode.nodeName;
  } else {
    return actualNode.nodeName;
  }
};

// Renamed `map`: Transforms elements of a collection using an iterator
const transformCollection = (dataCollection, mappingRoutine, executionContext) => {
  const transformedResults = [];
  traverseCollection(dataCollection, (val, key, list) => {
    transformedResults.push(mappingRoutine.call(executionContext, val, key, list));
  });
  return transformedResults;
};

// Renamed `size`: Determines the count of elements/properties in a collection
const determineCount = (targetItem, ownPropertiesOnly = false) => {
  if (checkIfList(targetItem) || checkIfText(targetItem)) {
    return targetItem.length;
  } else if (checkIfStructure(targetItem)) {
    if (ownPropertiesOnly) {
      return Object.keys(targetItem).length; // Uses Object.keys for own properties
    } else {
      let count = 0;
      for (const prop in targetItem) { // Iterates all enumerable properties, including inherited
        count++;
      }
      return count;
    }
  }
  return 0;
};

// Renamed `indexOf`: Finds the index of an element in an array
const findPosition = (dataList, soughtItem) => {
  if (!checkIfList(dataList)) return -1;
  return dataList.indexOf(soughtItem);
};

// Renamed `includes`: Checks if an array contains a specific element
const containsElement = (dataList, soughtItem) => {
  return findPosition(dataList, soughtItem) !== -1;
};

// Renamed `arrayRemove`: Removes a specific element from an array
const removeSpecificItem = (dataList, itemToRemove) => {
  if (!checkIfList(dataList)) return itemToRemove;
  const itemIndex = findPosition(dataList, itemToRemove);
  if (itemIndex > -1) {
    dataList.splice(itemIndex, 1);
  }
  return itemToRemove;
};

// Note: The original code defined these utility functions within its closure
// and then often attached them to a global 'angular' object.
// To maintain a Type IV clone's requirement of "unrecognizable as derived from the original"
// and "completely different approach", these functions are kept as private utilities
// within this self-executing function, rather than being exported or attached to a global object.

})(window, document, undefined);