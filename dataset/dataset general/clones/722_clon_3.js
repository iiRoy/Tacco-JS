(function(globe, docRef, voidVal) {
'use strict'; // Enforcing stricter parsing and error handling

//////////////////////////////////// Utility Definitions

/**
 * Converts input to lowercase if it's a string; otherwise, returns it as is.
 * This is the optimized version for locales that behave as expected.
 * @param {any} inputVal - The value to potentially convert.
 * @returns {any} The lowercased string or original value.
 */
let strToLowerCase = function(inputVal) {
    if (typeof inputVal === 'string') {
        return inputVal.toLowerCase();
    }
    return inputVal;
};

/**
 * Converts input to uppercase if it's a string; otherwise, returns it as is.
 * This is the optimized version for locales that behave as expected.
 * @param {any} inputVal - The value to potentially convert.
 * @returns {any} The uppercased string or original value.
 */
let strToUpperCase = function(inputVal) {
    if (typeof inputVal === 'string') {
        return inputVal.toUpperCase();
    }
    return inputVal;
};

/**
 * Provides a manual lowercase conversion, character by character.
 * Useful for locales where built-in `toLowerCase` might fail (e.g., Turkish 'i').
 * @param {any} charSequence - The string to convert.
 * @returns {any} Manually lowercased string or original value.
 */
const fallbackLowerCase = function(charSequence) {
    if (typeof charSequence !== 'string') {
        return charSequence;
    }
    return charSequence.replace(/[A-Z]/g, function(char) {
        return charFromCode(char.charCodeAt(0) | 32);
    });
};

/**
 * Provides a manual uppercase conversion, character by character.
 * Useful for locales where built-in `toUpperCase` might fail.
 * @param {any} charSequence - The string to convert.
 * @returns {any} Manually uppercased string or original value.
 */
const fallbackUpperCase = function(charSequence) {
    if (typeof charSequence !== 'string') {
        return charSequence;
    }
    return charSequence.replace(/[a-z]/g, function(char) {
        return charFromCode(char.charCodeAt(0) & ~32);
    });
};

// Check for problematic locale behavior (e.g., Turkish 'i' vs 'I')
// If standard methods are unreliable, switch to manual, slower alternatives.
const testChar = 'I';
if (strToLowerCase(testChar) !== 'i') {
    strToLowerCase = fallbackLowerCase;
    strToUpperCase = fallbackUpperCase;
}

/**
 * Helper to get a character from its ASCII/Unicode code.
 * @param {number} code The character code.
 * @returns {string} The character.
 */
function charFromCode(code) {
    return String.fromCharCode(code);
}

// Core library elements and initial setup
const runtimeError = globe.Error;
const arraySlice = [].slice; // Alias for array slice method
const arrayPush = [].push;   // Alias for array push method
const objectProtoToString = Object.prototype.toString; // Cached toString method

// Determine if the browser is Internet Explorer and its major version.
// This is a legacy check for older browser compatibility.
const ieVersion = (function() {
    const ua = globe.navigator ? globe.navigator.userAgent : '';
    const match = /msie (\d+)/.exec(strToLowerCase(ua));
    if (match && match[1]) {
        return parseInteger(match[1]);
    }
    return NaN;
})();

let simpleJQuery, externalJQuery; // References for potential jQuery integration, delayed binding.

// Main library object, or create it if it doesn't exist.
const applicationRoot = globe.myAppLib || (globe.myAppLib = {});

// Internal state for unique ID generation.
let uniqueIdDigits = ['0', '0', '0'];

/**
 * Iterates over a collection (array or object) and applies a callback.
 * @param {Object|Array} collection - The object or array to iterate.
 * @param {Function} processor - The callback function `(value, key)` to apply.
 * @param {Object=} contextObj - Optional context (`this`) for the processor function.
 * @returns {Object|Array} The original collection.
 */
function iterateCollection(collection, processor, contextObj) {
    if (!collection || !processor) {
        // Guard against null/undefined collection or missing processor.
        console.warn("Attempted to iterate a null/undefined collection or with a missing processor.");
        return collection;
    }

    if (typeof collection.forEach === 'function' && collection.forEach !== iterateCollection) {
        // Use native forEach if available and not recursively calling itself.
        collection.forEach(processor, contextObj);
    } else if (isNumeric(collection.length) && typeof collection !== 'function') {
        // Handle array-like objects (e.g., NodeList, arguments).
        for (let idx = 0; idx < collection.length; idx++) {
            processor.call(contextObj, collection[idx], idx, collection);
        }
    } else if (isObjectInstance(collection)) {
        // General object iteration.
        for (const propKey in collection) {
            // Ensure property belongs to the object itself, not its prototype chain.
            if (Object.prototype.hasOwnProperty.call(collection, propKey)) {
                processor.call(contextObj, collection[propKey], propKey, collection);
            }
        }
    } else if (isFunctionObj(collection)) {
        // Special handling for functions treated as objects (e.g., prototype properties).
        for (const funcProp in collection) {
            // Exclude common function properties, focus on custom ones.
            if (Object.prototype.hasOwnProperty.call(collection, funcProp) &&
                funcProp !== 'prototype' && funcProp !== 'length' && funcProp !== 'name') {
                processor.call(contextObj, collection[funcProp], funcProp, collection);
            }
        }
    }
    return collection;
}

/**
 * Retrieves and sorts the keys of an object.
 * @param {Object} targetObj - The object whose keys are to be sorted.
 * @returns {Array<string>} An array of sorted keys.
 */
function obtainSortedKeys(targetObj) {
    const allKeys = [];
    if (targetObj && isObjectInstance(targetObj)) {
        for (const k in targetObj) {
            if (Object.prototype.hasOwnProperty.call(targetObj, k)) {
                allKeys.push(k);
            }
        }
    }
    return allKeys.sort();
}

/**
 * Iterates over an object's properties in a sorted key order.
 * @param {Object} targetObj - The object to iterate.
 * @param {Function} callbackFn - The function to call for each property `(value, key)`.
 * @param {Object=} context - Optional context for the callback.
 * @returns {Array<string>} The sorted keys that were iterated.
 */
function iterateSorted(targetObj, callbackFn, context) {
    const keysOrdered = obtainSortedKeys(targetObj);
    for (let i = 0; i < keysOrdered.length; i++) {
        const currentKey = keysOrdered[i];
        callbackFn.call(context, targetObj[currentKey], currentKey);
    }
    return keysOrdered;
}

/**
 * Creates a new function that reverses the order of the first two arguments
 * for a given iterator function.
 * @param {function(string, *)} originalIterator - The iterator function (key, value).
 * @returns {function(*, string)} A new function with arguments (value, key).
 */
function flipParams(originalIterator) {
    return function(val, ky) {
        originalIterator(ky, val);
    };
}

/**
 * Generates a unique alpha-numeric string ID.
 * The ID grows slowly and avoids numeric overflow issues.
 * @returns {string} A unique identifier string.
 */
function generateUniqueId() {
    let currentIdx = uniqueIdDigits.length;
    let charCode;

    while (currentIdx > 0) {
        currentIdx--;
        charCode = uniqueIdDigits[currentIdx].charCodeAt(0);

        if (charCode === 57 /* '9' */) {
            uniqueIdDigits[currentIdx] = 'A';
            return uniqueIdDigits.join('');
        }
        if (charCode === 90 /* 'Z' */) {
            uniqueIdDigits[currentIdx] = '0';
        } else {
            uniqueIdDigits[currentIdx] = String.fromCharCode(charCode + 1);
            return uniqueIdDigits.join('');
        }
    }
    // If all digits rolled over, prepend a new '0'.
    uniqueIdDigits.unshift('0');
    return uniqueIdDigits.join('');
}

/**
 * Merges properties from source objects into a destination object.
 * @param {Object} destObject - The target object to extend.
 * @param {...Object} sourceObjects - One or more source objects.
 * @returns {Object} The extended destination object.
 */
function mergeObjects(destObject) {
    if (!destObject || typeof destObject !== 'object') {
        console.error("Destination object for merge must be a valid object.");
        return destObject; // Or throw an error depending on desired behavior
    }

    // Convert arguments to a real array, skipping the first (destObject).
    const sources = arraySlice.call(arguments, 1);

    for (let i = 0; i < sources.length; i++) {
        const currentSrc = sources[i];
        if (currentSrc && typeof currentSrc === 'object') {
            for (const prop in currentSrc) {
                if (Object.prototype.hasOwnProperty.call(currentSrc, prop)) {
                    destObject[prop] = currentSrc[prop];
                }
            }
        }
    }
    return destObject;
}

/**
 * Parses a string into an integer with base 10.
 * @param {string} inputStr - The string to parse.
 * @returns {number} The parsed integer.
 */
function parseInteger(inputStr) {
    return parseInt(inputStr, 10);
}

/**
 * Establishes prototypal inheritance. Creates a new object whose prototype is `parentObj`,
 * optionally extending it with `extraProperties`.
 * @param {Object} parentObj - The object to inherit from.
 * @param {Object=} extraProperties - Properties to add to the new object.
 * @returns {Object} The newly created object with inherited properties.
 */
function createInheritedObject(parentObj, extraProperties) {
    if (!parentObj) {
        throw new Error("Parent object is required for inheritance.");
    }

    // Temporary constructor function.
    const TempCtor = function() {};
    TempCtor.prototype = parentObj;

    // Create an instance of TempCtor, which now has parentObj as its prototype.
    const childInstance = new TempCtor();

    // Extend with extra properties if provided.
    if (extraProperties) {
        mergeObjects(childInstance, extraProperties);
    }
    return childInstance;
}

/**
 * A function that does nothing. Useful as a default callback.
 */
function blankFunction() {
    // This function intentionally left blank.
}
blankFunction.$dependencies = []; // A placeholder for dependency injection metadata.

/**
 * A function that simply returns its first argument.
 * @param {*} value - Any value.
 * @returns {*} The input value.
 */
function returnFirstArg(value) {
    return value;
}
returnFirstArg.$dependencies = []; // Dependency metadata.

/**
 * Creates a function that always returns a specific value.
 * @param {*} fixedValue - The value the returned function will always return.
 * @returns {Function} A function that returns `fixedValue`.
 */
function createValueReturner(fixedValue) {
    return function() {
        return fixedValue;
    };
}

/**
 * Checks if a value is strictly `undefined`.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is `undefined`.
 */
function isUndefinedVal(val) {
    return val === voidVal; // Using voidVal (undefined parameter) for strict comparison.
}

/**
 * Checks if a value is not `undefined`.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is defined.
 */
function isDefinedVal(val) {
    return val !== voidVal;
}

/**
 * Determines if a value is an object, excluding `null`.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is an object and not `null`.
 */
function isObjectInstance(val) {
    return val !== null && typeof val === 'object';
}

/**
 * Determines if a value is a string.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a string.
 */
function isStringVal(val) {
    return typeof val === 'string';
}

/**
 * Determines if a value is a number.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a number.
 */
function isNumeric(val) {
    return typeof val === 'number';
}

/**
 * Determines if a value is a Date object.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a Date.
 */
function isDateObject(val) {
    return objectProtoToString.call(val) === '[object Date]';
}

/**
 * Determines if a value is an Array.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is an Array.
 */
function isArrayType(val) {
    return objectProtoToString.call(val) === '[object Array]';
}

/**
 * Determines if a value is a function.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a function.
 */
function isFunctionObj(val) {
    return typeof val === 'function';
}

/**
 * Checks if the given object is a browser window object.
 * @param {*} obj - The object to check.
 * @returns {boolean} True if `obj` appears to be a window.
 */
function isBrowserWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
}

/**
 * Checks if an object is an AngularJS scope (based on typical methods).
 * @param {*} obj - The object to check.
 * @returns {boolean} True if `obj` resembles an AngularJS scope.
 */
function isAngularScope(obj) {
    return obj && isFunctionObj(obj.$evalAsync) && isFunctionObj(obj.$watch);
}

/**
 * Checks if an object is a File object.
 * @param {*} obj - The object to check.
 * @returns {boolean} True if `obj` is a File.
 */
function isFileObject(obj) {
    return objectProtoToString.call(obj) === '[object File]';
}

/**
 * Checks if a value is a boolean.
 * @param {*} val - The value to check.
 * @returns {boolean} True if `val` is a boolean.
 */
function isBooleanVal(val) {
    return typeof val === 'boolean';
}

/**
 * Trims whitespace from both ends of a string.
 * @param {*} input - The value to trim.
 * @returns {string|*} The trimmed string or original value if not a string.
 */
function trimString(input) {
    if (isStringVal(input)) {
        return input.replace(/^\s+|\s+$/g, ''); // Using a single regex for both ends.
    }
    return input;
}

/**
 * Checks if a value represents a DOM element or a jQuery-wrapped element.
 * @param {*} nodeCandidate - The value to check.
 * @returns {boolean} True if `nodeCandidate` is an element.
 */
function isDomElement(nodeCandidate) {
    return !!(nodeCandidate &&
              (nodeCandidate.nodeType === 1 || // Standard DOM element
               (nodeCandidate.bind && nodeCandidate.find && isFunctionObj(nodeCandidate.bind)))); // jQuery-like object
}

/**
 * Creates an object where keys from a comma-separated string have `true` values.
 * E.g., "key1,key2" -> {key1: true, key2: true}
 * @param {string} keyString - Comma-separated string of keys.
 * @returns {Object} An object map.
 */
function createKeyMap(keyString) {
    const outputMap = {};
    if (!isStringVal(keyString) || keyString.trim() === '') {
        return outputMap; // Return empty for invalid input.
    }
    const keyArray = keyString.split(',');
    for (const item of keyArray) { // Using for...of for modern iteration.
        outputMap[item.trim()] = true;
    }
    return outputMap;
}

let determineNodeName; // Function to get an element's node name.

// Conditional implementation based on browser's IE version.
if (ieVersion < 9) {
    determineNodeName = function(elem) {
        const targetElem = elem.nodeName ? elem : elem[0];
        // Handle IE's specific behavior with scopeName for custom elements.
        return (targetElem.scopeName && targetElem.scopeName !== 'HTML')
            ? strToUpperCase(targetElem.scopeName + ':' + targetElem.nodeName)
            : targetElem.nodeName;
    };
} else {
    determineNodeName = function(elem) {
        // For modern browsers or IE9+, directly get nodeName.
        return elem.nodeName ? elem.nodeName : elem[0].nodeName;
    };
}

/**
 * Transforms each element of a collection using an iterator function.
 * @param {Object|Array} collection - The collection to transform.
 * @param {Function} transformer - The function `(value, key, collection)` to apply.
 * @param {Object=} context - Optional context for the transformer.
 * @returns {Array} A new array containing the transformed elements.
 */
function transformCollection(collection, transformer, context) {
    const transformedResults = [];
    if (!collection) return transformedResults;

    iterateCollection(collection, function(val, key, coll) {
        transformedResults.push(transformer.call(context, val, key, coll));
    });
    return transformedResults;
}

/**
 * Calculates the size of a collection (array length, string length, or object property count).
 * @param {Object|Array|string} collection - The item to measure.
 * @param {boolean} [ownPropsOnly=false] - If true, only counts own properties for objects.
 * @returns {number} The size or 0 if not a measurable type.
 */
function getCollectionSize(collection, ownPropsOnly = false) {
    if (isArrayType(collection) || isStringVal(collection)) {
        return collection.length;
    } else if (isObjectInstance(collection)) {
        let count = 0;
        for (const prop in collection) {
            if (ownPropsOnly ? Object.prototype.hasOwnProperty.call(collection, prop) : true) {
                count++;
            }
        }
        return count;
    }
    return 0; // Return 0 for non-measurable types.
}

/**
 * Checks if an array contains a specific object.
 * @param {Array} targetArray - The array to search.
 * @param {*} searchObj - The object to find.
 * @returns {boolean} True if `searchObj` is found in `targetArray`.
 */
function arrayContains(targetArray, searchObj) {
    if (!isArrayType(targetArray)) {
        console.warn("Input is not an array for arrayContains.");
        return false;
    }
    return findElementIndex(targetArray, searchObj) !== -1;
}

/**
 * Finds the index of an element in an array.
 * @param {Array} targetArray - The array to search.
 * @param {*} searchObj - The object to find.
 * @returns {number} The index of the element, or -1 if not found.
 */
function findElementIndex(targetArray, searchObj) {
    if (!isArrayType(targetArray)) {
        console.warn("Input is not an array for findElementIndex.");
        return -1;
    }
    if (targetArray.indexOf) { // Use native indexOf if available.
        return targetArray.indexOf(searchObj);
    }

    // Fallback for older environments.
    for (let i = 0; i < targetArray.length; i++) {
        if (searchObj === targetArray[i]) {
            return i;
        }
    }
    return -1;
}

/**
 * Removes the first occurrence of a value from an array.
 * @param {Array} modifyArray - The array to modify.
 * @param {*} valueToRemove - The value to remove.
 * @returns {*} The removed value, or undefined if not found.
 */
function removeItemFromArray(modifyArray, valueToRemove) {
    if (!isArrayType(modifyArray)) {
        console.warn("Input is not an array for removeItemFromArray.");
        return voidVal;
    }
    const idx = findElementIndex(modifyArray, valueToRemove);
    if (idx >= 0) {
        modifyArray.splice(idx, 1);
        return valueToRemove;
    }
    return voidVal; // Indicate that nothing was removed.
}

// Expose some utilities on the global application object (myAppLib).
// This simulates how AngularJS exposes its core utilities.
mergeObjects(applicationRoot, {
    toLower: strToLowerCase,
    toUpper: strToUpperCase,
    each: iterateCollection,
    eachSorted: iterateSorted,
    nextUniqueId: generateUniqueId,
    merge: mergeObjects,
    isUndef: isUndefinedVal,
    isDef: isDefinedVal,
    isObj: isObjectInstance,
    isStr: isStringVal,
    isNum: isNumeric,
    isFn: isFunctionObj,
    isArr: isArrayType,
    isEl: isDomElement,
    trim: trimString,
    map: transformCollection,
    size: getCollectionSize,
    includes: arrayContains,
    remove: removeItemFromArray,
    noop: blankFunction,
    id: returnFirstArg
});

// Final assignments if needed, e.g., to simpleJQuery, externalJQuery
// This part remains similar as it's an external dependency check.
// jqLite, jQuery // delay binding since jQuery could be loaded after us.
// The original code had these as global vars, but didn't assign them here.
// I'll keep them as global variables that might be assigned later by other scripts.

})(window, document, undefined);