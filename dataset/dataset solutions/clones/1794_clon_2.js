"use strict";
// Import file system module for reading input
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split input into tokens by space or newline, initialize token index
var tokenStream = rawData.split(/ |\n/),
    tokenIndex = 0;

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next numeric token.
 */
function getNextNum() {
    return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The next string token.
 */
function getNextStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function getNextBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves an array of 'count' tokens, converting them to numbers or keeping as strings.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} isStringFlag - If true, tokens remain strings; otherwise, they are converted to numbers.
 * @returns {Array<number|string>} An array of tokens.
 */
function getNumsArray(count, isStringFlag) {
    return isStringFlag ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

/**
 * Retrieves an array of 'count' tokens, converting them to BigInts.
 * @param {number} count - The number of tokens to retrieve.
 * @returns {Array<BigInt>} An array of BigInt tokens.
 */
function getBigIntsArray(count) {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(val => BigInt(val));
}

/**
 * Retrieves a 2D matrix of tokens with specified height and width.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} isStringFlag - If true, tokens remain strings; otherwise, they are converted to numbers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function getMatrix(height, width, isStringFlag) {
    var resultMatrix = [],
        rowCounter = 0;
    if (isStringFlag) {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    } else {
        for (; rowCounter < height; rowCounter++) {
            resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    }
    return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var args = arguments,
        dimCount = args.length,
        arrayCreationString = "Array(args[" + --dimCount + "]).fill().map(element=>{return " + initialValue + ";})";
    while (--dimCount) {
        arrayCreationString = "Array(args[" + dimCount + "]).fill().map(element=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}


// Execute the main processing function and print its result
console.log(processIllumination());

/**
 * Main function to simulate light bulb illumination over iterations.
 * @returns {string} The final illumination state as a space-separated string.
 */
function processIllumination() {
    let numPoints = getNextNum(); // Total number of points (N)
    let numIterations = getNextNum(); // Number of simulation iterations (K)
    let currentIllumination = getNumsArray(numPoints); // Initial illumination array (A)

    let nextIllumination = new Array(numPoints); // Array to store illumination for the next step (B)
    let pointIdx, coveredIdx, iterCount, minCoverageIdx, maxCoverageIdx;

    // Loop through each simulation iteration
    for (iterCount = 0; iterCount < numIterations; iterCount++) {
        nextIllumination.fill(0); // Reset next illumination array for current iteration
        let minNextIllum = iterCount; // Initialize minimum illumination for this step

        // Iterate through each light bulb (pointIdx)
        for (pointIdx = 0; pointIdx < numPoints; pointIdx++) {
            // Calculate the effective range of the current light bulb
            // Adjusting for 0-based indexing for array access
            minCoverageIdx = Math.max(pointIdx + 1 - currentIllumination[pointIdx], 1) - 1;
            maxCoverageIdx = Math.min(pointIdx + 1 + currentIllumination[pointIdx], numPoints) - 1;

            // Increment illumination for all points covered by the current bulb
            for (coveredIdx = minCoverageIdx; coveredIdx <= maxCoverageIdx; coveredIdx++) {
                nextIllumination[coveredIdx]++;
            }
            // Track the minimum illumination value encountered in the nextIllumination array
            minNextIllum = Math.min(minNextIllum, nextIllumination[pointIdx]);
        }

        // Update current illumination state for the next iteration
        currentIllumination = nextIllumination.concat();

        // Optimization: If all points are fully illuminated (illumination >= N)
        // after a certain number of iterations, further iterations won't change the state.
        if (iterCount > 41) {
            if (minNextIllum >= numPoints) {
                break; // Exit early if stable state is reached
            }
        }
    }
    // Return the final illumination state as a space-separated string
    return currentIllumination.join(" ");
}
