"use strict";

// Acquire file system module and read standard input synchronously
var fileContent = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the entire input into tokens using spaces or newlines as delimiters
// Initialize an index to track the current token position
var tokenStream = fileContent.split(/ |\n/),
    tokenIndex = 0;

/**
 * Retrieves the next token from the global token stream.
 * @param {boolean} isStringOutput - If true, returns the token as a string; otherwise, attempts to convert it to a number.
 * @returns {string|number} The processed token.
 */
function readNext(isStringOutput) {
    return isStringOutput ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Reads a specified number of tokens from the stream.
 * @param {number} countToRead - The quantity of tokens to extract.
 * @param {boolean} returnAsStrings - If true, tokens are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the extracted tokens.
 */
function readMultiple(countToRead, returnAsStrings) {
    if (returnAsStrings) {
        return tokenStream.slice(tokenIndex, tokenIndex += countToRead);
    } else {
        return tokenStream.slice(tokenIndex, tokenIndex += countToRead).map(val => +val);
    }
}

/**
 * Extracts a 2D matrix of tokens from the stream.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns per row.
 * @param {boolean} returnMatrixAsStrings - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The parsed matrix.
 */
function readMatrix(numRows, numCols, returnMatrixAsStrings) {
    var matrixResult = [];
    let currentRow = 0;
    if (returnMatrixAsStrings) {
        for (; currentRow < numRows; currentRow++) {
            matrixResult.push(tokenStream.slice(tokenIndex, tokenIndex += numCols));
        }
    } else {
        for (; currentRow < numRows; currentRow++) {
            matrixResult.push(tokenStream.slice(tokenIndex, tokenIndex += numCols).map(val => +val));
        }
    }
    return matrixResult;
}

/**
 * Dynamically creates a multi-dimensional array based on provided dimensions.
 * @param {*} initialElementValue - The value to initialize the innermost array elements with.
 * @param {...number} arrayDimensions - A variable number of arguments representing the size of each dimension.
 * @returns {Array} The newly constructed multi-dimensional array.
 */
function createMultiDimArray(initialElementValue) {
    var dimensionArguments = arguments,
        argumentCount = dimensionArguments.length,
        arrayConstructionCode = "Array(dimensionArguments[" + --argumentCount + "]).fill().map(item => { return " + initialElementValue + "; })";
    while (--argumentCount) {
        arrayConstructionCode = "Array(dimensionArguments[" + argumentCount + "]).fill().map(item => " + arrayConstructionCode + ")";
    }
    return eval(arrayConstructionCode);
}

/**
 * Performs a binary search to find the appropriate insertion point for a value in a sorted array,
 * effectively implementing a lower_bound operation.
 * @param {Array<number>} sortedData - The array to search within, assumed to be sorted in ascending order.
 * @param {number} targetValue - The value whose insertion point is sought.
 * @param {number} [startIndex=0] - The starting index for the search range.
 * @param {number} [endIndex=sortedData.length] - The exclusive ending index for the search range.
 * @returns {number} The index where `targetValue` could be inserted to maintain the sorted order.
 */
function findInsertionPoint(sortedData, targetValue, startIndex = 0, endIndex = sortedData.length) {
    for (var middleIndex; 1 < endIndex - startIndex;) {
        middleIndex = startIndex + endIndex >> 1; // Efficient integer division
        if (sortedData[middleIndex] < targetValue) {
            startIndex = middleIndex;
        } else {
            endIndex = middleIndex;
        }
    }
    return sortedData[startIndex] < targetValue ? endIndex : startIndex;
}

// Global variables for the problem's state
var finalResults,
    dynamicProgression = [0]; // Stores the current longest increasing subsequence (LIS)
var adjacencyList, // Represents the graph structure
    nodeValues;    // Stores the value associated with each graph node

// Execute the primary logic of the program
var programOutput = executeProgram();

// If the program produced a result, print it to the console
if (programOutput !== undefined) {
    console.log(programOutput);
}

/**
 * The main entry point for the problem-solving logic.
 * Handles input parsing, graph construction, and initiates the DFS traversal.
 * @returns {string} A newline-separated string of results for each node.
 */
function executeProgram() {
    var totalNodes = readNext(); // Read the number of nodes in the graph
    nodeValues = readMultiple(totalNodes); // Read the values for each node
    adjacencyList = createMultiDimArray("[]", totalNodes); // Initialize an empty adjacency list for the graph

    // Read edges and populate the adjacency list
    for (var edgeCounter = 1; edgeCounter < totalNodes; edgeCounter++) {
        var firstNode = readNext() - 1, // Convert to 0-indexed
            secondNode = readNext() - 1; // Convert to 0-indexed
        adjacencyList[firstNode].push(secondNode);
        adjacencyList[secondNode].push(firstNode);
    }

    finalResults = createMultiDimArray(0, totalNodes); // Initialize array to store results for each node
    performDepthFirstSearch(0, -1); // Start DFS from node 0, with a dummy parent -1

    return finalResults.join("\n"); // Format and return the results
}

/**
 * Performs a Depth First Search (DFS) traversal on the graph.
 * This function calculates the length of the longest increasing subsequence (LIS)
 * ending at the current node within its subtree, considering the path from the root.
 * @param {number} currentNode - The identifier of the node currently being visited.
 * @param {number} parentNode - The identifier of the parent node in the DFS tree.
 */
function performDepthFirstSearch(currentNode, parentNode) {
    // Find the position where the current node's value would fit in the LIS array
    var insertionPosition = findInsertionPoint(dynamicProgression, nodeValues[currentNode]),
        valueToRestore; // Temporarily holds a value if it's overwritten

    // If the insertion point is within the current bounds of the DP array,
    // it means we are replacing an existing element to potentially form a shorter LIS.
    if (insertionPosition !== dynamicProgression.length) {
        valueToRestore = dynamicProgression[insertionPosition]; // Save the old value
        dynamicProgression[insertionPosition] = nodeValues[currentNode]; // Update with current node's value
    } else {
        // If the insertion point is at the end, it means we are extending the LIS.
        insertionPosition++; // Increment position to reflect new length
        dynamicProgression.push(nodeValues[currentNode]); // Add current node's value
    }

    // The length of the LIS ending at this node is the current length of the DP array minus one (due to initial [0]).
    finalResults[currentNode] = dynamicProgression.length - 1;

    // Traverse all neighbors of the current node
    for (var neighborCounter = 0; neighborCounter < adjacencyList[currentNode].length; neighborCounter++) {
        var adjacentNode = adjacencyList[currentNode][neighborCounter];
        if (adjacentNode === parentNode) {
            continue; // Skip the parent node to avoid infinite loops in undirected graphs
        }
        performDepthFirstSearch(adjacentNode, currentNode); // Recursively call DFS for the neighbor
    }

    // Backtrack: restore the DP array to its state before processing the current node.
    // This is crucial for correctly calculating LIS for other branches.
    if (insertionPosition === dynamicProgression.length) {
        dynamicProgression.pop(); // If an element was added, remove it
    } else {
        dynamicProgression[insertionPosition] = valueToRestore; // Otherwise, restore the overwritten element
    }
}
