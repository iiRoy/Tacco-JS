"use strict";

// This section handles input reading from standard input.
// It reads the entire input, splits it into tokens, and provides helper functions
// to consume these tokens in various formats.
let dataInput = require("fs").readFileSync("/dev/stdin", "utf8");
let tokenStream = dataInput.split(/ |\n/);
let tokenIndex = 0; // Pointer to the current token in the stream

/**
 * Retrieves the next token from the input stream and parses it as a number.
 * @returns {number} The numeric value of the next token.
 */
function readNum() {
    return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The string value of the next token.
 */
function readStr() {
    return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next token from the input stream and parses it as a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function readBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Reads a specified number of tokens from the stream.
 * Optionally parses them as numbers based on the 'shouldParseNumbers' flag.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} shouldParseNumbers - If true, tokens are converted to numbers; otherwise, they remain strings.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readNums(count, shouldParseNumbers) {
    if (shouldParseNumbers) {
        return tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
    } else {
        return tokenStream.slice(tokenIndex, tokenIndex += count);
    }
}

/**
 * Reads a 2D matrix of tokens from the stream.
 * Optionally parses elements as numbers.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in each row.
 * @param {boolean} shouldParseNumbers - If true, matrix elements are converted to numbers.
 * @returns {Array<Array<number|string>>} The parsed matrix.
 */
function readMatrix(height, width, shouldParseNumbers) {
    let matrixData = [];
    let rowIterator = 0;
    if (shouldParseNumbers) {
        for (; rowIterator < height; rowIterator++) {
            matrixData.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
        }
    } else {
        for (; rowIterator < height; rowIterator++) {
            matrixData.push(tokenStream.slice(tokenIndex, tokenIndex += width));
        }
    }
    return matrixData;
}

/**
 * Dynamically creates a multi-dimensional array with specified dimensions and initial value.
 * The dimensions are passed as subsequent arguments after the initial value.
 * @param {*} initialValue - The value to initialize all elements of the array with.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    let functionArguments = arguments;
    let argumentCount = functionArguments.length;
    // Construct an eval string to create the array dynamically
    let arrayCreationString = "Array(functionArguments[" + --argumentCount + "]).fill().map(element => { return " + initialValue + "; })";
    while (--argumentCount) {
        arrayCreationString = "Array(functionArguments[" + argumentCount + "]).fill().map(element => " + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

/**
 * Implements a Fenwick Tree (also known as a Binary Indexed Tree) for efficient
 * prefix sum queries and point updates.
 */
class FenwickTree {
    /**
     * Constructs a new Fenwick Tree.
     * @param {number} size - The maximum index (1-based) that the tree will support.
     */
    constructor(size) {
        this.treeArr = Array(size + 1).fill(0); // The internal array, 1-indexed
    }

    /**
     * Adds a specified value to the element at a given position in the conceptual array.
     * This updates all relevant nodes in the Fenwick Tree.
     * @param {number} valueChange - The amount to add to the element.
     * @param {number} position - The 1-based index of the element to update.
     */
    update(valueChange, position) {
        // Traverse up the tree, adding 'valueChange' to parent nodes
        for (let delta = valueChange, currentIdx = position; currentIdx < this.treeArr.length; currentIdx += currentIdx & -currentIdx) {
            this.treeArr[currentIdx] += delta;
        }
    }

    /**
     * Calculates the prefix sum up to a given position.
     * This sums all elements from index 1 up to 'position'.
     * @param {number} position - The 1-based index up to which the sum is required.
     * @returns {number} The sum of elements from 1 to 'position'.
     */
    query(position) {
        let totalSum = 0;
        // Traverse down the tree, summing relevant nodes
        for (let currentIdx = position; currentIdx > 0; currentIdx -= currentIdx & -currentIdx) {
            totalSum += this.treeArr[currentIdx];
        }
        return totalSum;
    }
}

// Execute the primary logic of the program and store its return value.
let programOutput = executeProgram();

// If the program's execution yields a non-undefined result, print it to the console.
if (programOutput !== undefined) {
    console.log(String(programOutput));
}

/**
 * The main function encapsulating the solution logic for the problem.
 * @returns {string|undefined} The final computed answer, formatted as a string, or undefined.
 */
function executeProgram() {
    // Read the number of elements and queries from input.
    let numElements = readNum();
    let numQueries = readNum();
    // Read the array of colors, ensuring they are parsed as numbers.
    let colorArray = readNums(numElements, true);

    // `colorPositions` will store lists of 1-based indices for each color.
    // `colorPositions[c][0]` will act as a pointer to the next relevant occurrence of color `c`.
    let colorPositions = createMultiDimArray("[1]", numElements);

    // Initialize a Fenwick Tree to track the count of "active" (first-occurring) colors.
    let fenwickInstance = new FenwickTree(numElements + 1);

    // `activeColors` set keeps track of colors whose first occurrence has been processed.
    let activeColors = new Set();

    // Process the initial `colorArray` to populate `colorPositions` and the Fenwick Tree.
    for (let elementIterator = 0; elementIterator < numElements; elementIterator++) {
        let currentColor = --colorArray[elementIterator]; // Convert color to 0-indexed
        colorPositions[currentColor].push(elementIterator + 1); // Store 1-based index of occurrence

        // If this is the first time we encounter this color, mark it active and update the BIT.
        if (!activeColors.has(currentColor)) {
            activeColors.add(currentColor);
            fenwickInstance.update(1, elementIterator + 1); // Add 1 at its position in the BIT
        }
    }

    // Append a sentinel value (numElements + 1) to each color's position list.
    // This simplifies boundary checks when advancing pointers later.
    for (let colorIterator = 0; colorIterator < numElements; colorIterator++) {
        colorPositions[colorIterator].push(numElements + 1);
    }

    // Read all query requests. Each request is [left_bound, right_bound, original_query_index].
    let queryRequests = Array(numQueries);
    for (let queryIterator = 0; queryIterator < numQueries; queryIterator++) {
        queryRequests[queryIterator] = [readNum(), readNum(), queryIterator];
    }

    // Sort queries by their left boundary. This allows for efficient processing using a sliding window approach.
    queryRequests.sort((queryA, queryB) => queryA[0] - queryB[0]);

    let finalAnswers = Array(numQueries); // Array to store the results for each query
    let currentPosition = 1; // Represents the current left boundary of the processing window

    // Process each query in sorted order.
    for (let queryIterator = 0; queryIterator < numQueries; queryIterator++) {
        let [leftBound, rightBound, originalIndex] = queryRequests[queryIterator];

        // Advance the `currentPosition` (left boundary of the window) until it matches `leftBound`.
        while (currentPosition < leftBound) {
            let processedColor = colorArray[currentPosition - 1]; // Get the color at the position being "removed"
            let nextColorPosIndex = ++colorPositions[processedColor][0]; // Increment pointer for this color's occurrences

            // The element at `currentPosition` is no longer the first occurrence of its color within the window.
            // So, remove its contribution from the Fenwick Tree.
            fenwickInstance.update(-1, currentPosition);
            // Add the *next* occurrence of this color to the Fenwick Tree, as it now becomes the first.
            fenwickInstance.update(1, colorPositions[processedColor][nextColorPosIndex]);
            currentPosition++; // Move the window's left boundary forward
        }
        // After adjusting the window, query the Fenwick Tree for the count of active colors
        // up to the `rightBound` of the current query.
        finalAnswers[originalIndex] = fenwickInstance.query(rightBound);
    }

    // Join the computed answers with newline characters and return the result.
    return finalAnswers.join("\n");
}
