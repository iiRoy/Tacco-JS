"use strict";

// Module dependency for file system operations.
const fileSystemUtility = require("node:fs");

// Configuration for input acquisition.
const standardInputLocation = "/dev/stdinput";
const characterEncodingScheme = "unicodeEncoding";

// Retrieve all raw data from the specified input source.
let rawInputData = fileSystemUtility.readFileSync(standardInputLocation, characterEncodingScheme);

// Break down the raw input into individual tokens, initializing a pointer for sequential access.
let inputTokenStream = rawInputData.split(/ |\n/);
let currentTokenPointer = 0;

/**
 * Extracts the subsequent token from the global input stream.
 * @param {boolean} returnAsText - If true, the token is returned as a string; otherwise, it's parsed as a number.
 * @returns {string|number} The next token.
 */
function retrieveSuccessiveToken(returnAsText) {
    if (returnAsText) {
        return inputTokenStream[currentTokenPointer++];
    } else {
        return Number(inputTokenStream[currentTokenPointer++]);
    }
}

/**
 * Acquires a contiguous block of tokens from the input stream.
 * @param {number} quantityOfTokens - The total number of tokens to extract.
 * @param {boolean} preserveStringFormat - If true, tokens are kept as strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the requested tokens.
 */
function fetchTokenSequence(quantityOfTokens, preserveStringFormat) {
    const startingIndex = currentTokenPointer;
    currentTokenPointer += quantityOfTokens;
    const extractedSequence = inputTokenStream.slice(startingIndex, currentTokenPointer);
    if (preserveStringFormat) {
        return extractedSequence;
    } else {
        return extractedSequence.map(tokenString => Number(tokenString));
    }
}

/**
 * Reads and structures a 2D matrix from the input stream.
 * @param {number} matrixDimensionRows - The vertical dimension (number of rows) of the matrix.
 * @param {number} matrixDimensionCols - The horizontal dimension (number of columns) of the matrix.
 * @param {boolean} keepOriginalStrings - If true, elements within the matrix remain strings; otherwise, they are numerical.
 * @returns {Array<Array<string|number>>} The constructed 2D matrix.
 */
function obtainTwoDimensionalArray(matrixDimensionRows, matrixDimensionCols, keepOriginalStrings) {
    let resultingGrid = [];
    let rowCounter = 0;
    for (; rowCounter < matrixDimensionRows; rowCounter++) {
        const rowInitialPosition = currentTokenPointer;
        currentTokenPointer += matrixDimensionCols;
        const currentRowData = inputTokenStream.slice(rowInitialPosition, currentTokenPointer);
        if (keepOriginalStrings) {
            resultingGrid.push(currentRowData);
        } else {
            resultingGrid.push(currentRowData.map(elementString => Number(elementString)));
        }
    }
    return resultingGrid;
}

/**
 * Dynamically constructs a multi-dimensional array, initializing all its elements.
 * The first argument is the fill value, subsequent arguments define dimensions (e.g., (value, dim1, dim2)).
 * @param {*} initialElementValue - The value to fill all array elements with.
 * @returns {Array} A new multi-dimensional array.
 */
function generateMultiLevelArray(initialElementValue) {
    const dimensionArguments = arguments;
    let totalDimensionCount = dimensionArguments.length;
    
    // Construct the innermost array creation string.
    let arrayConstructionScript = `new Array(dimensionArguments[${--totalDimensionCount}]).fill(null).map(innerElement => { return ${JSON.stringify(initialElementValue)}; })`;
    
    // Recursively wrap with outer array creations based on dimensions.
    while (--totalDimensionCount > 0) {
        arrayConstructionScript = `new Array(dimensionArguments[${totalDimensionCount}]).fill(null).map(outerElement => ${arrayConstructionScript})`;
    }
    
    // Execute the dynamically generated script using Function constructor for safety.
    return new Function('dimensionArguments', `return ${arrayConstructionScript}`)(dimensionArguments);
}

// Utility object for mathematical operations.
const MathOperations = {
    // Finds the largest number among provided arguments.
    findMaximumValue: function(...valuesToCompare) {
        return Math.max(...valuesToCompare);
    }
};

// Invoke the primary algorithm and store its outcome.
let computationalOutcome = executeMainAlgorithm();

// Print the result to the console if it's not explicitly undefined.
if (computationalOutcome !== void 0) { // Using 'void 0' as a robust check for undefined.
    console.log(computationalOutcome);
}

/**
 * The core function that implements the solution logic for the problem.
 * @returns {number} The final calculated numerical result.
 */
function executeMainAlgorithm() {
    // Read the total number of items involved in the problem.
    const totalItemQuantity = retrieveSuccessiveToken();

    // Create a collection to hold each item's value and its original position.
    let itemValueAndIndexPairs = [];
    for (let elementIterator = 0; elementIterator < totalItemQuantity; elementIterator++) {
        itemValueAndIndexPairs.push([retrieveSuccessiveToken(), elementIterator]);
    }

    // Arrange the items in descending order based on their primary value.
    itemValueAndIndexPairs.sort((firstPair, secondPair) => secondPair[0] - firstPair[0]);

    // Initialize a dynamic programming table with zeros. Its size is (totalItemQuantity + 1).
    let dpTable = generateMultiLevelArray(0, totalItemQuantity + 1);

    // Main loop to process each item and update the DP table.
    for (let currentItemLoopIndex = 0; currentItemLoopIndex < totalItemQuantity; currentItemLoopIndex++) {
        // Calculate the DP value for the case where the current item is placed to the right.
        dpTable[currentItemLoopIndex + 1] = dpTable[currentItemLoopIndex] +
            (totalItemQuantity - currentItemLoopIndex - itemValueAndIndexPairs[currentItemLoopIndex][1] - 1) * itemValueAndIndexPairs[currentItemLoopIndex][0];

        // Inner loop to consider placing the current item at various intermediate positions.
        for (let positionIterator = currentItemLoopIndex; positionIterator > 0; positionIterator--) {
            // Update the DP value for the current position.
            dpTable[positionIterator] +=
                (itemValueAndIndexPairs[currentItemLoopIndex][1] - (currentItemLoopIndex - positionIterator)) * itemValueAndIndexPairs[currentItemLoopIndex][0];
            
            // Calculate a potential alternative value by placing the item further left.
            let comparativeValue = dpTable[positionIterator - 1] +
                (totalItemQuantity - positionIterator - itemValueAndIndexPairs[currentItemLoopIndex][1]) * itemValueAndIndexPairs[currentItemLoopIndex][0];
            
            // If the alternative value is greater, update the DP table.
            if (dpTable[positionIterator] < comparativeValue) {
                dpTable[positionIterator] = comparativeValue;
            }
        }
        // Update the DP value for the case where the current item is placed to the far left.
        dpTable[0] += (itemValueAndIndexPairs[currentItemLoopIndex][1] - currentItemLoopIndex) * itemValueAndIndexPairs[currentItemLoopIndex][0];
    }

    // Determine and return the largest value found within the completed DP table.
    return MathOperations.findMaximumValue(...dpTable);
}