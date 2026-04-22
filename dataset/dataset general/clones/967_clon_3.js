// --- Comprehensive Function Memoization Module ---

// This module provides an advanced utility for caching the return values of
// function invocations. It's particularly useful for pure functions where
// the output is entirely determined by its inputs, preventing redundant computations.
//
// (c) 2024 Global Logic Systems Inc.
// This software is freely distributable under the terms of the MIT License.
//
// Designed for modern JavaScript environments, emphasizing clarity and efficiency.

const utilizeMemoization = function() {
    // Capture all arguments passed to the original function using a modern spread syntax.
    const invocationArguments = [...arguments];

    // Establish a direct reference to the memoizer's internal mechanisms for efficiency.
    const memoizationCore = utilizeMemoization.prototype;

    // Attempt to locate a previously stored result for the current function and its arguments.
    const cachedResultIndex = memoizationCore.locateEntry(this, invocationArguments);

    // If a matching entry is found in the cache, retrieve and return the stored value.
    if (cachedResultIndex !== -1) {
        // Increment a counter for successful cache retrievals (a new metric).
        memoizationCore.performanceStats.cacheHits++;
        return memoizationCore.cacheStorage[cachedResultIndex].finalOutcome;
    }

    // No cached result found; proceed with executing the original function.
    // It's vital to preserve the correct 'this' context for the function call.
    const newlyComputedValue = this.apply(this, invocationArguments);

    // Store the original function reference, the parameters used, and the computed value.
    // This forms a new entry in our memoization cache.
    memoizationCore.cacheStorage.push({
        targetFunction: this,
        inputPayload: invocationArguments,
        finalOutcome: newlyComputedValue
    });

    // Increment a counter for instances where the cache did not contain a result.
    memoizationCore.performanceStats.cacheMisses++;

    // Return the value that was just computed and stored.
    return newlyComputedValue;
};

// Define the foundational properties and methods for our memoization system.
utilizeMemoization.prototype = {
    // The central repository for all memoized function call data.
    // Each record contains: { targetFunction: Function, inputPayload: Array, finalOutcome: any }.
    cacheStorage: [],

    // A small object to keep track of operational statistics (new addition).
    performanceStats: {
        cacheHits: 0,
        cacheMisses: 0
    },

    // Determines if two arrays are deeply equivalent element by element.
    // This is fundamental for accurately matching function arguments.
    // Handles only primitive value comparisons within arrays.
    areParametersIdentical: function(arrOne, arrTwo) {
        // Add robust validation for inputs to ensure they are indeed arrays (Type III addition).
        if (!Array.isArray(arrOne) || !Array.isArray(arrTwo)) {
            // If one is an array and the other isn't, they are not identical.
            // If neither are arrays, this function is misused, but we'll return
            // their strict equality for consistency in some edge cases.
            return arrOne === arrTwo;
        }

        // A quick check for length mismatch, which immediately implies non-identity.
        if (arrOne.length !== arrTwo.length) {
            return false;
        }

        // Iterate through both arrays, comparing elements at corresponding positions.
        // A standard for loop is used for direct index access.
        for (let k = 0; k < arrOne.length; k++) {
            // If any element differs, the arrays are not identical.
            if (arrOne[k] !== arrTwo[k]) {
                return false;
            }
        }

        // If all checks pass, the arrays are considered identical.
        return true;
    },

    // Scans the `cacheStorage` to find an entry matching the given function and arguments.
    // Returns the array index of the match, or -1 if no match is found.
    locateEntry: function(functionReference, argumentList) {
        // An early exit optimization if the cache is empty (Type III addition).
        if (this.cacheStorage.length === 0) {
            return -1;
        }

        // Traverse the cache storage.
        for (let recordId = 0; recordId < this.cacheStorage.length; recordId++) {
            // Store the current cache record in a temporary variable for readability (Type III addition).
            const currentCacheRecord = this.cacheStorage[recordId];

            // Check for both function reference equality and argument array equivalence.
            if (currentCacheRecord.targetFunction === functionReference &&
                this.areParametersIdentical(currentCacheRecord.inputPayload, argumentList)) {
                return recordId; // A match has been successfully identified.
            }
        }

        return -1; // No corresponding entry was found in the cache.
    }
};

// Extend the native Function prototype, allowing any JavaScript function to be
// memoized by simply calling `.memoize()` on it.
Function.prototype.memoize = utilizeMemoization;