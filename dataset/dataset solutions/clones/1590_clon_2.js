"use strict";
// This script processes input data to calculate a specific value.

// Read all input from standard input
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens by space or newline
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0; // Current position in the token stream

/**
 * Retrieves the next number from the token stream.
 * @returns {number} The next number.
 */
function getNextNum() {
    return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next string from the token stream.
 * @returns {string} The next string.
 */
function getNextStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next BigInt from the token stream.
 * @returns {BigInt} The next BigInt.
 */
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves a specified number of items from the token stream.
 * @param {number} count - The number of items to retrieve.
 * @param {boolean} asStrings - If true, returns strings; otherwise, returns numbers.
 * @returns {Array<number|string>} An array of retrieved items.
 */
function getNextNums(count, asStrings) {
    if (asStrings) {
        return tokenStream.slice(tokenIndex, tokenIndex += count);
    } else {
        return tokenStream.slice(tokenIndex, tokenIndex += count).map(item => +item);
    }
}

/**
 * Retrieves a matrix (2D array) of items from the token stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns.
 * @param {boolean} asStrings - If true, returns strings; otherwise, returns numbers.
 * @returns {Array<Array<number|string>>} The matrix.
 */
function getNextMatrix(height, width, asStrings) {
    var resultMatrix = [];
    var rowCounter = 0;
    if (asStrings) {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(item => +item));
        }
    }
    return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments;
    var argLength = args.length;
    var evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
    }
    return eval(evalString);
}

// Execute the main processing function
var finalResult = processData();

// Output the result if it's not undefined
if (finalResult !== undefined) {
    console.log(String(finalResult));
}

/**
 * Main function to process the input and compute the final value.
 * @returns {number} The computed result.
 */
function processData() {
    var dimensionSize = getNextNum();
    // Initialize a DP table with -1, and an offset value
    var memoTable = createMultiDimArray(-1, dimensionSize + 1, dimensionSize + 1);
    var offsetValue = 0;

    // Read the initial pair of numbers and sort them
    var initialPair = getNextNums(2).sort((val1, val2) => val1 - val2);

    // Initialize DP table for base cases
    memoTable[0][0] = memoTable[0][initialPair[0]] = memoTable[0][initialPair[1]] = memoTable[initialPair[0]][initialPair[1]] = 0;

    // Loop through the remaining N-1 triplets
    for (var loopCounter = 1; loopCounter < dimensionSize; loopCounter++) {
        var currentTriplet = getNextNums(3).sort((val1, val2) => val1 - val2);
        handleTriplet(...currentTriplet); // Process each triplet
    }

    // Read the final number
    var finalNum = getNextNum();

    // Calculate and return the final result
    return Math.max(memoTable[0][0], memoTable[finalNum][finalNum] + 1) + offsetValue;

    /**
     * Handles a triplet of values (valA, valB, valC) by updating the memoTable.
     * @param {number} valA - The first value.
     * @param {number} valB - The second value.
     * @param {number} valC - The third value.
     */
    function handleTriplet(valA, valB, valC) {
        if (valA === valC) {
            offsetValue++; // Increment offset if all values are equal
            return;
        }

        var updateQueue = []; // Reset the update queue for this triplet

        // Process single values
        processSingleValue(valA);
        if (valA < valB) processSingleValue(valB);
        if (valB < valC) processSingleValue(valC);

        // Process pairs of values
        processPairValues(valA, valB);
        if (valB < valC) processPairValues(valA, valC);
        if (valA < valB) processPairValues(valB, valC);

        // Process the triplet
        processTripleValues(valA, valB, valC);

        // Apply updates from the queue to the memoTable
        while (updateQueue.length > 0) {
            var coordX = updateQueue.pop();
            var coordY = updateQueue.pop();
            var newValue = updateQueue.pop();
            if (memoTable[coordX][coordY] < newValue) {
                memoTable[coordX][coordY] = newValue;
            }
        }
    }

    /**
     * Processes a single value 'valA' to update the memoTable.
     * @param {number} valA - The value to process.
     */
    function processSingleValue(valA) {
        enqueueIfGreater(0, 0, valA, valA); // Update based on (0,0) -> (valA,valA)
        // Iterate for values less than valA
        for (var loopCounter = 0; loopCounter < valA; loopCounter++) {
            enqueueIfGreater(loopCounter, valA, 0, loopCounter);
        }
        // Iterate for values greater than or equal to valA
        for (var loopCounter = valA; loopCounter <= dimensionSize; loopCounter++) {
            enqueueIfGreater(valA, loopCounter, 0, loopCounter);
        }
    }

    /**
     * Processes a pair of values (valA, valB) to update the memoTable.
     * @param {number} valA - The first value.
     * @param {number} valB - The second value.
     */
    function processPairValues(valA, valB) {
        enqueueIfGreater(valA, valB, 0, 0); // Update based on (0,0) -> (valA,valB)
        enqueueIfGreaterPlusOne(0, valB, valA, valA); // Update based on (valA,valA) -> (0,valB) + 1

        if (valA < valB) {
            enqueueIfGreaterPlusOne(0, valA, valB, valB); // Update based on (valB,valB) -> (0,valA) + 1
        } else { // valA === valB
            // Iterate for values less than valA
            for (var loopCounter = 0; loopCounter < valA; loopCounter++) {
                enqueueIfGreaterPlusOne(0, loopCounter, loopCounter, valA);
            }
            // Iterate for values greater than or equal to valA
            for (var loopCounter = valA; loopCounter <= dimensionSize; loopCounter++) {
                enqueueIfGreaterPlusOne(0, loopCounter, valA, loopCounter);
            }
        }
    }

    /**
     * Processes a triplet of values (valA, valB, valC) to update the memoTable.
     * @param {number} valA - The first value.
     * @param {number} valB - The second value.
     * @param {number} valC - The third value.
     */
    function processTripleValues(valA, valB, valC) {
        enqueueIfGreaterPlusOne(valB, valC, valA, valA); // Update based on (valA,valA) -> (valB,valC) + 1

        if (valA < valB) {
            enqueueIfGreaterPlusOne(valA, valC, valB, valB); // Update based on (valB,valB) -> (valA,valC) + 1
            if (valB < valC) {
                enqueueIfGreaterPlusOne(valA, valB, valC, valC); // Update based on (valC,valC) -> (valA,valB) + 1
            } else { // valB === valC
                // Iterate for values less than valA
                for (var loopCounter = 0; loopCounter < valA; loopCounter++) {
                    enqueueIfGreaterPlusOne(loopCounter, valA, loopCounter, valC);
                }
                // Iterate for values between valA and valC (exclusive)
                for (var loopCounter = valA; loopCounter < valC; loopCounter++) {
                    enqueueIfGreaterPlusOne(valA, loopCounter, loopCounter, valC);
                }
                // Iterate for values greater than or equal to valC
                for (var loopCounter = valC; loopCounter <= dimensionSize; loopCounter++) {
                    enqueueIfGreaterPlusOne(valA, loopCounter, valC, loopCounter);
                }
            }
        } else { // valA === valB
            enqueueIfGreaterPlusOne(valA, valA, valC, valC); // Update based on (valC,valC) -> (valA,valA) + 1
            // Iterate for values less than valA
            for (var loopCounter = 0; loopCounter < valA; loopCounter++) {
                enqueueIfGreaterPlusOne(loopCounter, valC, loopCounter, valA);
            }
            // Iterate for values between valA and valC (exclusive)
            for (var loopCounter = valA; loopCounter < valC; loopCounter++) {
                enqueueIfGreaterPlusOne(loopCounter, valC, valA, loopCounter);
            }
            // Iterate for values greater than or equal to valC
            for (var loopCounter = valC; loopCounter <= dimensionSize; loopCounter++) {
                enqueueIfGreaterPlusOne(valC, loopCounter, valA, loopCounter);
            }
        }
    }

    /**
     * Compares memoTable[coordC][coordD] with memoTable[coordA][coordB] and enqueues an update if greater.
     * @param {number} coordA - First index for target cell.
     * @param {number} coordB - Second index for target cell.
     * @param {number} coordC - First index for source cell.
     * @param {number} coordD - Second index for source cell.
     */
    function enqueueIfGreater(coordA, coordB, coordC, coordD) {
        if (memoTable[coordA][coordB] < memoTable[coordC][coordD]) {
            updateQueue.push(memoTable[coordC][coordD], coordB, coordA);
        }
    }

    /**
     * Compares memoTable[coordC][coordD] + 1 with memoTable[coordA][coordB] and enqueues an update if greater.
     * @param {number} coordA - First index for target cell.
     * @param {number} coordB - Second index for target cell.
     * @param {number} coordC - First index for source cell.
     * @param {number} coordD - Second index for source cell.
     */
    function enqueueIfGreaterPlusOne(coordA, coordB, coordC, coordD) {
        if (memoTable[coordA][coordB] < memoTable[coordC][coordD] + 1) {
            updateQueue.push(memoTable[coordC][coordD] + 1, coordB, coordA);
        }
    }
}
