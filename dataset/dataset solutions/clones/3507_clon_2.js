"use strict"; // Ensures strict parsing rules are applied for better code quality

// --- Data Stream Handling Utilities ---

// Loads the complete raw data stream from standard input, encoded as UTF-8
let dataStreamContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Splits the entire input data into individual tokens using spaces or newlines as delimiters
let tokenBuffer = dataStreamContent.split(/ |\n/);
// Initializes an index to keep track of the current position in the token buffer
let tokenIndex = 0;

/**
 * Retrieves the next available token from the buffer and explicitly converts it to a numeric type.
 * @returns {number} The parsed numeric value of the next token.
 */
function getNextNumericValue() {
    return Number(tokenBuffer[tokenIndex++]);
}

/**
 * Retrieves the next available token from the buffer as its raw string representation.
 * @returns {string} The string value of the next token.
 */
function getNextTextValue() {
    return tokenBuffer[tokenIndex++];
}

/**
 * Retrieves the next available token from the buffer and converts it to a BigInt type.
 * This is suitable for very large integer values.
 * @returns {BigInt} The BigInt value of the next token.
 */
function getNextLargeInteger() {
    return BigInt(tokenBuffer[tokenIndex++]);
}

/**
 * Fetches a contiguous sequence of tokens from the buffer.
 * Allows specifying whether the tokens should be returned as strings or parsed as numbers.
 * @param {number} sliceLength - The total count of tokens to extract.
 * @param {boolean} returnAsString - A flag indicating if tokens should be kept as strings (true) or converted to numbers (false).
 * @returns {Array<string|number>} An array containing the requested sequence of tokens.
 */
function getSliceOfTokens(sliceLength, returnAsString) {
    if (returnAsString) {
        // Return tokens as-is (strings)
        return tokenBuffer.slice(tokenIndex, tokenIndex += sliceLength);
    } else {
        // Return tokens converted to numbers
        return tokenBuffer.slice(tokenIndex, tokenIndex += sliceLength).map(item => Number(item));
    }
}

/**
 * Reads a block of tokens from the buffer and organizes them into a two-dimensional array (matrix).
 * Each row of the matrix will contain a specified number of elements.
 * @param {number} matrixHeight - The total number of rows for the matrix.
 * @param {number} matrixWidth - The number of columns (elements) in each row.
 * @param {boolean} keepAsStrings - If true, matrix elements remain strings; otherwise, they are converted to numbers.
 * @returns {Array<Array<string|number>>} The constructed matrix.
 */
function getMatrixFromTokens(matrixHeight, matrixWidth, keepAsStrings) {
    let matrixRows = [];
    let currentR = 0; // Row counter

    if (keepAsStrings) {
        for (; currentR < matrixHeight; currentR++) {
            matrixRows.push(tokenBuffer.slice(tokenIndex, tokenIndex += matrixWidth));
        }
    } else {
        for (; currentR < matrixHeight; currentR++) {
            matrixRows.push(tokenBuffer.slice(tokenIndex, tokenIndex += matrixWidth).map(value => Number(value)));
        }
    }
    return matrixRows;
}

/**
 * Generates a multi-dimensional array dynamically based on a variable number of dimension arguments.
 * The first argument specifies the initial value for the deepest elements,
 * subsequent arguments define the size of each dimension from outermost to innermost.
 * @param {*} initialElementValue - The default value to fill the array's elements with.
 * @param {...number} dimensions - The sizes for each dimension of the array.
 * @returns {Array} A newly created multi-dimensional array.
 */
function createDynamicArray(initialElementValue) {
    const dimensionsList = arguments; // Access all arguments passed to the function
    let dimensionCount = dimensionsList.length;
    // Construct the innermost array creation part of the string
    let arrayConstructionCode = "Array(dimensionsList[" + --dimensionCount + "]).fill().map(_ => { return " + initialElementValue + "; })";

    // Build up the nested array creation string from innermost to outermost
    while (--dimensionCount) {
        arrayConstructionCode = "Array(dimensionsList[" + dimensionCount + "]).fill().map(_ => " + arrayConstructionCode + ")";
    }

    // Evaluate the constructed string to create the multi-dimensional array
    return eval(arrayConstructionCode);
}


// --- Core Program Logic Execution ---

// Invokes the primary function that contains the main algorithm
const finalResult = executeCoreLogic();

// Checks if the result returned by the main logic is defined and, if so, prints it to console
if (finalResult !== undefined) {
    console.log(finalResult);
}

/**
 * The main function encapsulating the program's primary business logic.
 * It reads a single numeric input and performs a specific calculation.
 * @returns {number} The computed result of the operation.
 */
function executeCoreLogic() {
    // Reads the first numeric value from the input stream
    const inputNumberValue = getNextNumericValue();

    // Calculates the smallest multiple of 111 that is greater than or equal to the input number
    return Math.ceil(inputNumberValue / 111) * 111;
}