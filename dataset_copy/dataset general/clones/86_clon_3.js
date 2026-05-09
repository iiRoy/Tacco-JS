/*
 * This file contains utility functions for common array/object manipulations.
 * It's a re-engineered version of some classic PHP-like functions adapted for JavaScript,
 * with enhancements and modernizations.
 *
 * Original concepts by various contributors, adapted and extended.
 * This code is provided under a permissive license, allowing free use and modification.
 */

// A simple utility to determine the actual type of a variable,
// useful for distinguishing arrays from plain objects.
const determineVarType = (input) => {
    if (Array.isArray(input)) {
        return 'array';
    }
    const type = typeof input;
    if (type === 'object' && input !== null) {
        return 'object';
    }
    return type;
};

// --- Core Array/Object Utilities ---

/**
 * Creates an array from the provided arguments.
 * Essentially a wrapper for `Array.prototype.slice.call(arguments)`.
 *
 * @param {...any} args - Any number of arguments to be included in the array.
 * @returns {Array<any>} A new array containing all the input arguments.
 */
function createArrayFromArguments() {
    // If no arguments are passed, return an empty array.
    if (arguments.length === 0) {
        return [];
    }
    // Leverage the Array prototype's slice method to convert arguments object to a real array.
    return Array.prototype.slice.call(arguments);
}

/**
 * Transforms an object's keys to a specified case (lowercase or uppercase).
 *
 * @param {object} sourceObject - The object whose keys need to be case-transformed.
 * @param {string|number} [caseMode='LOWER'] - Determines the target case.
 *   Can be 'LOWER', 0 (for lowercase), 'UPPER', or 1 (for uppercase).
 * @returns {object|boolean} A new object with transformed keys, or false if input is invalid.
 */
function adjustObjectKeysCase(sourceObject, caseMode = 'LOWER') {
    // Input validation: Ensure the source is a non-null object.
    if (!sourceObject || determineVarType(sourceObject) !== 'object') {
        console.warn("Invalid input for adjustObjectKeysCase: Expected an object.");
        return false;
    }

    const processedObject = {}; // Use an object literal for cleaner creation.
    let keyTransformer; // Function to apply to each key.

    // Determine the key transformation logic based on caseMode.
    const effectiveCaseMode = typeof caseMode === 'string' ? caseMode.toUpperCase() : caseMode;

    if (effectiveCaseMode === 'UPPER' || effectiveCaseMode === 1) {
        keyTransformer = (key) => String(key).toUpperCase();
    } else { // Default to lowercase for 'LOWER', 0, or any other unrecognized value.
        keyTransformer = (key) => String(key).toLowerCase();
    }

    // Iterate over the source object's own properties and apply the transformation.
    for (const originalKey in sourceObject) {
        if (Object.prototype.hasOwnProperty.call(sourceObject, originalKey)) {
            const transformedKey = keyTransformer(originalKey);
            processedObject[transformedKey] = sourceObject[originalKey];
        }
    }

    return processedObject;
}

/**
 * Divides an input array into multiple smaller arrays (chunks) of a specified size.
 *
 * @param {Array<any>} sourceList - The array to be split.
 * @param {number} segmentSize - The desired size of each chunk.
 * @returns {Array<Array<any>>} An array of arrays, where each inner array is a chunk.
 *   Returns an empty array if inputs are invalid or `segmentSize` is non-positive.
 */
function splitIntoChunks(sourceList, segmentSize) {
    // Pre-validation: Check for valid array input and positive chunk size.
    if (!Array.isArray(sourceList) || sourceList.length === 0 || typeof segmentSize !== 'number' || segmentSize <= 0) {
        console.warn("Invalid input for splitIntoChunks: Expected a non-empty array and a positive number for segment size.");
        return [];
    }

    const resultChunks = []; // Initialize the array to hold the chunks.
    let currentChunk = [];   // Temporary array to build the current chunk.
    let elementCounter = 0;  // Tracks elements added to the current chunk.

    // Iterate through each item in the source list.
    for (let index = 0; index < sourceList.length; index++) {
        currentChunk.push(sourceList[index]);
        elementCounter++;

        // If the current chunk reaches the segment size or it's the last element,
        // add it to the results and reset for the next chunk.
        if (elementCounter === segmentSize || index === sourceList.length - 1) {
            resultChunks.push(currentChunk);
            currentChunk = [];
            elementCounter = 0;
        }
    }

    return resultChunks;
}

/**
 * Constructs an object using one array for property names (keys) and another for values.
 *
 * @param {Array<string|number>} propertyNames - An array of keys.
 * @param {Array<any>} propertyValues - An array of values.
 * @returns {object|boolean} A new object, or false if inputs are invalid or lengths don't match.
 */
function mergeKeyValues(propertyNames, propertyValues) {
    // Robust input verification for both arrays.
    if (!Array.isArray(propertyNames) || !Array.isArray(propertyValues)) {
        console.error("Input error: Both arguments must be arrays for mergeKeyValues.");
        return false;
    }

    // Critical check: Key and value arrays must have the same number of elements.
    if (propertyNames.length !== propertyValues.length) {
        console.error("Input error: Key array and value array must have matching lengths.");
        return false;
    }

    // If both arrays are empty, return an empty object immediately.
    if (propertyNames.length === 0) {
        return {};
    }

    // Create an object with no prototype to avoid unintended inherited properties.
    const finalObject = Object.create(null);

    // Iterate and assign keys and values.
    for (let i = 0; i < propertyNames.length; i++) {
        finalObject[propertyNames[i]] = propertyValues[i];
    }

    return finalObject;
}

/**
 * Counts the occurrences of each unique value within an array or object.
 * Only primitive values (numbers, strings) are counted.
 *
 * @param {Array<any>|object} sourceCollection - The array or object to process.
 * @returns {object} An object where keys are unique values from the input
 *   and values are their respective counts. Returns an empty object for invalid input.
 */
function tallyElementOccurrences(sourceCollection) {
    const countsMap = {}; // This object will store the counts.

    // Guard clause for invalid input types.
    if (sourceCollection === null || typeof sourceCollection !== 'object') {
        console.warn("tallyElementOccurrences received invalid input; expected an array or object.");
        return {};
    }

    // Helper function to process a single value.
    const processValueForCount = (val) => {
        // Only count numbers (integers) and strings. Floats are ignored, as per PHP's behavior.
        if (typeof val === 'number' && Number.isInteger(val)) {
            // Convert number to string for key consistency if needed, though JS handles numeric keys.
            const key = String(val);
            countsMap[key] = (countsMap[key] || 0) + 1;
        } else if (typeof val === 'string') {
            countsMap[val] = (countsMap[val] || 0) + 1;
        }
        // Booleans, null, undefined, objects, arrays are implicitly ignored.
    };

    // Iterate based on whether it's an array or an object.
    if (Array.isArray(sourceCollection)) {
        for (const item of sourceCollection) {
            processValueForCount(item);
        }
    } else { // Assume it's a plain object.
        for (const key in sourceCollection) {
            if (Object.prototype.hasOwnProperty.call(sourceCollection, key)) {
                processValueForCount(sourceCollection[key]);
            }
        }
    }

    return countsMap;
}

/**
 * Computes the difference between the first array and subsequent arrays.
 * It returns all values from the first array that are not present in any of the other arrays.
 * Values are compared loosely (value equality, not strict equality).
 *
 * @param {Array<any>} initialArray - The primary array to compare against.
 * @param {...Array<any>} compareArrays - One or more arrays to compare with the initial array.
 * @returns {Array<any>} A new array containing elements unique to the initialArray.
 */
function findArrayDifferences(initialArray, ...compareArrays) {
    // Validate the initial array.
    if (!Array.isArray(initialArray)) {
        console.error("findArrayDifferences: First argument must be an array.");
        return [];
    }

    if (initialArray.length === 0) {
        return [];
    }

    // If no comparison arrays are provided, all elements in the initialArray are "different".
    if (compareArrays.length === 0) {
        return [...initialArray]; // Return a shallow copy.
    }

    // Create a Set for each comparison array for efficient lookups.
    // Use `Set` for performance, as `Set.has()` is O(1) on average.
    const comparisonSets = compareArrays.map(arr => {
        if (!Array.isArray(arr)) {
            console.warn("findArrayDifferences: Non-array argument provided in comparison arrays; it will be ignored.");
            return new Set();
        }
        return new Set(arr);
    });

    const uniqueElements = [];

    // Iterate through elements of the initial array.
    for (const primaryElement of initialArray) {
        let isUniqueToPrimary = true;

        // Check if the primary element exists in any of the comparison sets.
        for (const currentSet of comparisonSets) {
            if (currentSet.has(primaryElement)) {
                isUniqueToPrimary = false;
                break; // Found in a comparison set, no need to check further sets.
            }
        }

        // If the element was not found in any comparison set, it's unique.
        if (isUniqueToPrimary) {
            uniqueElements.push(primaryElement);
        }
    }

    return uniqueElements;
}

/**
 * Computes the difference between the first object and subsequent objects,
 * considering both keys and their associated values.
 * Returns key-value pairs from the first object that do not have a matching key-value pair
 * (same key AND same value) in any of the subsequent objects.
 *
 * @param {object} primaryObject - The initial object for comparison.
 * @param {...object} comparatorObjects - One or more objects to compare against.
 * @returns {object} An object containing the differing key-value pairs.
 */
function compareObjectsByValueAndKey(primaryObject, ...comparatorObjects) {
    // Validate the primary object.
    if (determineVarType(primaryObject) !== 'object' || primaryObject === null) {
        console.error("compareObjectsByValueAndKey: First argument must be a valid object.");
        return {};
    }

    if (Object.keys(primaryObject).length === 0) {
        return {};
    }

    // If no comparators, all elements are unique to the primary object.
    if (comparatorObjects.length === 0) {
        return { ...primaryObject }; // Return a shallow copy.
    }

    const differingPairs = {};

    // Iterate over each key-value pair in the primary object.
    for (const key in primaryObject) {
        if (Object.prototype.hasOwnProperty.call(primaryObject, key)) {
            const primaryValue = primaryObject[key];
            let isUniqueToPrimary = true;

            // Check against each comparator object.
            for (const currentComparator of comparatorObjects) {
                // Ensure the comparator is a valid object.
                if (determineVarType(currentComparator) !== 'object' || currentComparator === null) {
                    continue; // Skip invalid comparators.
                }

                // If the key exists in the comparator and its value matches, it's not unique.
                if (Object.prototype.hasOwnProperty.call(currentComparator, key) &&
                    currentComparator[key] === primaryValue) {
                    isUniqueToPrimary = false;
                    break; // No need to check other comparators for this key.
                }
            }

            // If the key-value pair was not found identically in any comparator, add it to results.
            if (isUniqueToPrimary) {
                differingPairs[key] = primaryValue;
            }
        }
    }

    return differingPairs;
}

/**
 * Identifies and returns key-value pairs from the first object whose keys
 * are not present in any of the subsequent comparison objects.
 * This function focuses solely on key existence, ignoring values.
 *
 * @param {object} initialObj - The primary object from which to filter.
 * @param {...object} comparisonObjects - One or more objects whose keys will be used for exclusion.
 * @returns {object} A new object containing only the key-value pairs
 *   from `initialObj` whose keys are unique to it.
 */
function filterObjectByKeys(initialObj, ...comparisonObjects) {
    // Validate the initial object.
    if (determineVarType(initialObj) !== 'object' || initialObj === null) {
        console.error("filterObjectByKeys: First argument must be a valid object.");
        return {};
    }

    // If no comparison objects are provided, all keys in the initial object are "unique".
    if (comparisonObjects.length === 0) {
        return { ...initialObj }; // Return a shallow copy.
    }

    // Create a Set of all keys from the comparison objects for efficient lookup.
    const keysToExclude = new Set();
    for (const compObj of comparisonObjects) {
        if (determineVarType(compObj) === 'object' && compObj !== null) {
            for (const key of Object.keys(compObj)) {
                keysToExclude.add(key);
            }
        }
    }

    const filteredObject = {};

    // Iterate over the initial object's own keys.
    for (const key in initialObj) {
        if (Object.prototype.hasOwnProperty.call(initialObj, key)) {
            // If the key is not in our exclusion set, add it to the filtered object.
            if (!keysToExclude.has(key)) {
                filteredObject[key] = initialObj[key];
            }
        }
    }

    return filteredObject;
}

/**
 * Creates a new object (or array-like object) filled with a specified value
 * for a given number of elements, starting at a particular index.
 *
 * @param {number} startIndex - The starting index for the new elements.
 * @param {number} elementCount - The number of elements to add.
 * @param {any} fillValue - The value to use for filling.
 * @returns {object} An object with numeric keys starting from `startIndex`.
 *   Returns an empty object if `elementCount` is non-positive or inputs are invalid.
 */
function populateArrayWithValues(startIndex, elementCount, fillValue) {
    // Comprehensive input validation.
    if (typeof startIndex !== 'number' || !Number.isInteger(startIndex) ||
        typeof elementCount !== 'number' || !Number.isInteger(elementCount) || elementCount < 0) {
        console.error("populateArrayWithValues: Invalid startIndex or elementCount. Must be integers, elementCount non-negative.");
        return {};
    }

    if (elementCount === 0) {
        return {}; // No elements to fill.
    }

    const filledCollection = {}; // Use a plain object to allow arbitrary starting indices.

    // Loop to populate the collection.
    for (let i = 0; i < elementCount; i++) {
        const currentKey = startIndex + i;
        filledCollection[currentKey] = fillValue;
    }

    return filledCollection;
}

/**
 * Swaps keys with their corresponding values within an object.
 * If multiple values are identical, the last encountered value for that key will override previous ones.
 *
 * @param {object} sourceData - The object whose keys and values are to be flipped.
 * @returns {object} A new object with keys and values interchanged. Returns an empty object for invalid input.
 */
function reverseKeyValuePairs(sourceData) {
    // Input validation: Ensure sourceData is a non-null object.
    if (determineVarType(sourceData) !== 'object' || sourceData === null) {
        console.warn("reverseKeyValuePairs: Invalid input; expected an object.");
        return {};
    }

    const flippedObject = {}; // The new object to store flipped pairs.

    // Iterate over the keys of the source object.
    for (const originalKey in sourceData) {
        // Ensure it's an own property to avoid prototype chain issues.
        if (Object.prototype.hasOwnProperty.call(sourceData, originalKey)) {
            const originalValue = sourceData[originalKey];

            // The original value becomes the new key.
            // The original key becomes the new value.
            // If originalValue is not a string or number, it might be coerced to one.
            // If multiple original keys map to the same original value, the last one wins.
            flippedObject[originalValue] = originalKey;
        }
    }

    return flippedObject;
}

/**
 * Verifies if a specific key (property name) exists within an object or array.
 * This check includes inherited properties. For own properties only, use `Object.prototype.hasOwnProperty.call(obj, key)`.
 *
 * @param {string|number} targetKey - The key to check for existence.
 * @param {object|Array<any>} dataContainer - The object or array to inspect.
 * @returns {boolean} True if the key exists in the data container (or its prototype chain), false otherwise.
 */
function doesKeyExist(targetKey, dataContainer) {
    // Guard clause for invalid dataContainer types.
    if (dataContainer === null || (typeof dataContainer !== 'object' && !Array.isArray(dataContainer))) {
        console.warn("doesKeyExist: Invalid dataContainer; expected an object or array.");
        return false;
    }
    // The `in` operator naturally checks for existence in the object itself and its prototype chain.
    return targetKey in dataContainer;
}

/**
 * Extracts all keys (property names) from an object or array.
 * Optionally, it can filter these keys based on a specific value they map to.
 *
 * @param {object|Array<any>} inputCollection - The object or array to extract keys from.
 * @param {any} [filterValue] - An optional value to match. Only keys whose corresponding
 *   value strictly equals this `filterValue` will be returned.
 * @param {boolean} [strictComparison=true] - If `true`, uses strict equality (`===`) for value comparison;
 *   otherwise, uses loose equality (`==`).
 * @returns {Array<string|number>} An array containing the extracted keys. Returns an empty array for invalid input.
 */
function extractObjectKeys(inputCollection, filterValue, strictComparison = true) {
    // Initial validation for the input collection.
    if (inputCollection === null || (typeof inputCollection !== 'object' && !Array.isArray(inputCollection))) {
        console.warn("extractObjectKeys: Invalid inputCollection; expected an object or array.");
        return [];
    }

    const resultingKeys = [];

    // Determine if a value filter is active.
    const isFilteringByValue = arguments.length > 1;

    // Iterate over the keys of the input collection.
    // Object.keys() only returns own, enumerable properties.
    for (const key of Object.keys(inputCollection)) {
        if (isFilteringByValue) {
            const currentValue = inputCollection[key];
            let valueMatches = false;

            // Apply strict or loose comparison based on the flag.
            if (strictComparison) {
                valueMatches = (currentValue === filterValue);
            } else {
                valueMatches = (currentValue == filterValue); // Intentionally loose.
            }

            if (valueMatches) {
                resultingKeys.push(key);
            }
        } else {
            // No value filter, just add the key.
            resultingKeys.push(key);
        }
    }

    return resultingKeys;
}

/**
 * Applies a callback function to each element of one or more arrays.
 * If multiple arrays are provided, the callback receives elements at the same index from each array as separate arguments.
 *
 * @param {Function} processorFunction - The function to apply to each element(s).
 * @param {...Array<any>} inputArrays - One or more arrays whose elements will be processed.
 * @returns {Array<any>} A new array containing the results of applying the callback.
 *   Returns an empty array if inputs are invalid or no arrays are provided.
 */
function transformArrayElements(processorFunction, ...inputArrays) {
    // Validate the processor function.
    if (typeof processorFunction !== 'function') {
        console.error("transformArrayElements: First argument must be a function.");
        return [];
    }

    // Filter out non-array inputs from the rest parameters.
    const validArrays = inputArrays.filter(arr => Array.isArray(arr));

    if (validArrays.length === 0) {
        return []; // No valid arrays to process.
    }

    // Determine the maximum length among all valid input arrays.
    // This dictates how many times the callback will be invoked.
    const maxLength = Math.max(...validArrays.map(arr => arr.length));

    const transformedResults = [];

    // Iterate up to the maximum length.
    for (let i = 0; i < maxLength; i++) {
        const currentArgumentsForCallback = [];
        // Collect the element at the current index from each valid array.
        // If an array is shorter, its element will be `undefined`.
        for (let j = 0; j < validArrays.length; j++) {
            currentArgumentsForCallback.push(validArrays[j][i]);
        }

        // Apply the processor function with the collected arguments.
        // `null` as `this` context for a standalone function.
        transformedResults.push(processorFunction.apply(null, currentArgumentsForCallback));
    }

    return transformedResults;
}

/**
 * Extends an array to a specified length by padding it with a given value.
 * Padding can occur at the beginning or end of the array.
 *
 * @param {Array<any>} sourceArray - The original array to pad.
 * @param {number} targetSize - The desired length of the new array.
 *   If positive, pads at the end. If negative, pads at the beginning.
 * @param {any} paddingValue - The value to use for padding.
 * @returns {Array<any>} The padded array. If `targetSize` is less than or equal to
 *   the `sourceArray`'s length, a shallow copy of the original array is returned.
 */
function extendArray(sourceArray, targetSize, paddingValue) {
    // Input validation: Ensure sourceArray is an array and targetSize is a number.
    if (!Array.isArray(sourceArray)) {
        console.error("extendArray: First argument must be an array.");
        return [];
    }
    if (typeof targetSize !== 'number' || !Number.isInteger(targetSize)) {
        console.error("extendArray: Second argument (targetSize) must be an integer.");
        return [...sourceArray]; // Return a copy of the original array on invalid size.
    }

    const currentLength = sourceArray.length;
    const absTargetSize = Math.abs(targetSize);

    // If the target size is not greater than the current length,
    // no padding is needed. Return a shallow copy of the original.
    if (absTargetSize <= currentLength) {
        return [...sourceArray];
    }

    const numberOfElementsToPad = absTargetSize - currentLength;
    // Create an array filled with the padding value.
    const paddingElements = Array(numberOfElementsToPad).fill(paddingValue);

    // Determine if padding should be at the start or end.
    if (targetSize < 0) { // Negative targetSize means pad at the beginning.
        return [...paddingElements, ...sourceArray];
    } else { // Positive targetSize means pad at the end.
        return [...sourceArray, ...paddingElements];
    }
}

/**
 * Removes and returns the last element from an array.
 * This function modifies the original array.
 *
 * @param {Array<any>} targetArray - The array from which to remove the last element.
 * @returns {any|null} The removed element, or `null` if the array is empty or invalid.
 */
function removeLastElement(targetArray) {
    // Input validation: Ensure targetArray is an actual array.
    if (!Array.isArray(targetArray)) {
        console.error("removeLastElement: Input must be an array.");
        return null;
    }

    // If the array is empty, there's nothing to pop.
    if (targetArray.length === 0) {
        return null;
    }

    // Use the native `pop()` method for efficiency.
    return targetArray.pop();
}