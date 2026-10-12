"use strict";

// Input processing utilities
// Reads the entire standard input from the specified path.
let rawData = require("fs").readFileSync("/dev/stdin", "utf8");
// Splits the raw input string into an array of tokens using space or newline as delimiters.
let tokenArray = rawData.split(/ |\n/);
// An index to keep track of the current position in the tokenArray.
let tokenIndex = 0;

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The numeric value of the next token.
 */
function getNextNum() {
    return +tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The string value of the next token.
 */
function getNextStr() {
    return tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function getNextBigInt() {
    return BigInt(tokenArray[tokenIndex++]);
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} asStrings - If true, tokens are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<number|string>} An array containing the retrieved tokens.
 */
function getNumsArray(count, asStrings) {
    // If 'asStrings' is true, return the slice of string tokens directly.
    // Otherwise, map the slice to numbers.
    return asStrings
        ? tokenArray.slice(tokenIndex, (tokenIndex += count))
        : tokenArray.slice(tokenIndex, (tokenIndex += count)).map((item) => +item);
}

/**
 * Retrieves a 2D matrix of tokens from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, they are numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrix(height, width, asStrings) {
    let resultMatrix = []; // Initialize an empty array to store the matrix rows.
    let rowIdx = 0; // Loop counter for rows.

    if (asStrings) {
        // If string elements are desired, push slices of string tokens.
        for (; rowIdx < height; rowIdx++) {
            resultMatrix.push(tokenArray.slice(tokenIndex, (tokenIndex += width)));
        }
    } else {
        // Otherwise, push slices mapped to numbers.
        for (; rowIdx < height; rowIdx++) {
            resultMatrix.push(
                tokenArray.slice(tokenIndex, (tokenIndex += width)).map((item) => +item)
            );
        }
    }
    return resultMatrix;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` and should be used with caution, especially with untrusted input.
 * @param {*} initialValue - The value to initialize each element of the array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    let args = arguments; // Access all arguments passed to the function.
    let argCount = args.length; // Get the total number of arguments.

    // Construct the string representation for array creation.
    // Start with the innermost dimension.
    let arrayCreationString =
        "Array(args[" +
        --argCount +
        "]).fill().map(x=>{return " +
        initialValue +
        ";})";

    // Wrap with outer dimensions.
    while (--argCount) {
        arrayCreationString =
            "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    // Execute the constructed string to create the array.
    return eval(arrayCreationString);
}

// Execute the core logic of the problem and store its return value.
let programResult = executeSolution();

// If the program's result is not undefined, print it to the console.
if (programResult !== undefined) {
    console.log(String(programResult));
}

/**
 * The main function containing the solution to the problem.
 * It calculates a specific value based on input 'N' and 'N-1' pairs of 'u' and 'v'.
 * @returns {number} The final calculated result.
 */
function executeSolution() {
    // Read the initial integer value, typically representing the number of nodes or elements.
    let nodeCount = getNextNum();

    // Calculate an initial sum based on 'nodeCount'. This formula is often related to combinations or paths.
    // It's equivalent to C(nodeCount + 2, 3).
    let totalPaths = (nodeCount * (nodeCount + 0b1) * (nodeCount + 2)) / 6;

    // Loop 'nodeCount - 1' times to process additional input pairs.
    for (let edgeIndex = 0x1; edgeIndex < nodeCount; edgeIndex++) {
        let nodeU = getNextNum(); // Read the first value of the pair.
        let nodeV = getNextNum(); // Read the second value of the pair.

        // Ensure 'nodeU' is always less than or equal to 'nodeV' by swapping if necessary.
        if (nodeU > nodeV) {
            let swapHolder = nodeU; // Temporary variable for the swap operation.
            nodeU = nodeV;
            nodeV = swapHolder;
        }

        // Subtract a calculated value from 'totalPaths' based on the current pair (nodeU, nodeV).
        // This subtraction typically accounts for invalid or excluded paths/combinations.
        totalPaths -= nodeU * (nodeCount - nodeV + 0b1);
    }

    // Return the final adjusted total.
    return totalPaths;
}
