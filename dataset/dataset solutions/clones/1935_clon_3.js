"use strict";

// Helper for reading input from standard input
const dataBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
// Split the input data by spaces or newlines, and filter out any empty strings
const tokenArray = dataBuffer.split(/ |\n/).filter(Boolean);
let currentTokenIndex = 0; // Pointer to the current token in the array

/**
 * Retrieves the next token from the processed input stream.
 * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
 * @returns {string|number} The next token, or NaN/empty string if no more tokens.
 */
function obtainNextToken(asString = false) {
    // Basic guard: check if we've run out of tokens
    if (currentTokenIndex >= tokenArray.length) {
        return asString ? "" : NaN;
    }
    const token = tokenArray[currentTokenIndex++];
    return asString ? token : Number(token);
}

/**
 * Reads a specified quantity of tokens from the input stream.
 * @param {number} quantity - The number of tokens to read.
 * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
 * @returns {Array<string|number>} An array containing the read tokens.
 */
function readMultipleTokens(quantity, asString = false) {
    // Basic guard: ensure quantity is positive
    if (quantity <= 0) return [];

    const start = currentTokenIndex;
    const end = currentTokenIndex + quantity;
    const tokens = tokenArray.slice(start, end);
    currentTokenIndex = end;

    // Validation: check if the expected quantity of tokens was read
    if (tokens.length < quantity) {
        // Fill the rest with default values if input is shorter than expected
        const missing = quantity - tokens.length;
        for (let i = 0; i < missing; i++) {
            tokens.push(asString ? "" : NaN);
        }
    }
    return asString ? tokens : tokens.map(Number);
}

/**
 * Creates a multi-dimensional array with specified dimensions and an initial fill value.
 * This function replaces the original `xArray` which used `eval`.
 * @param {any} fillValue - The value to fill the innermost array elements with. Can be "[]" for empty arrays.
 * @param {...number} dimensions - The sizes of the dimensions, from outermost to innermost.
 * @returns {Array} The initialized multi-dimensional array.
 */
function createMultiDimensionalArray(fillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return fillValue; // Base case for 0 dimensions (should not happen with usage)
    }

    const currentDimSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // If this is the innermost dimension, fill it with the specified value or an empty array
    if (remainingDimensions.length === 0) {
        return Array(currentDimSize).fill().map(() => {
            // Special handling for the "[]" string to create actual empty arrays
            return (typeof fillValue === 'string' && fillValue === '[]') ? [] : fillValue;
        });
    } else {
        // For outer dimensions, recursively create nested arrays
        return Array(currentDimSize).fill().map(() => createMultiDimensionalArray(fillValue, ...remainingDimensions));
    }
}

/**
 * Performs a binary search to find the correct insertion point for a target value
 * in a sorted array, maintaining its sorted order. This is a "lower_bound" equivalent.
 * @param {Array<number>} sortedSequence - The array to search within (must be sorted ascending).
 * @param {number} targetValue - The value for which to find the insertion index.
 * @param {number} [searchLow=0] - The starting index of the search range.
 * @param {number} [searchHigh=sortedSequence.length] - The exclusive ending index of the search range.
 * @returns {number} The index where `targetValue` should be inserted.
 */
function findCeilingIndex(sortedSequence, targetValue, searchLow = 0, searchHigh = sortedSequence.length) {
    // Continue searching as long as the low pointer is less than the high pointer
    while (searchLow < searchHigh) {
        // Calculate the middle index to avoid potential overflow for very large numbers
        const searchMid = Math.floor(searchLow + (searchHigh - searchLow) / 2);

        // If the middle element is less than the target, search in the right half
        if (sortedSequence[searchMid] < targetValue) {
            searchLow = searchMid + 1;
        } else {
            // Otherwise, search in the left half (including the middle element)
            searchHigh = searchMid;
        }
    }
    return searchLow; // `searchLow` now holds the insertion point
}


// Global variables for the problem solution state
let finalResultsArray;       // Stores the computed LIS length for each node (renamed from 'ans')
let currentPathLIS;          // Tracks the current Longest Increasing Subsequence values during DFS (renamed from 'dp')
let graphAdjacencyList;      // Represents the graph as an adjacency list (renamed from 'g')
let nodeValuesArray;         // Stores the value associated with each node (renamed from 'a')

// Entry point for the main problem logic
const solutionEntryPoint = () => {
    const numberOfNodes = obtainNextToken(); // Read the total number of nodes

    // Guard: Ensure a valid number of nodes is read
    if (isNaN(numberOfNodes) || numberOfNodes <= 0) {
        return "Error: Invalid node count."; // Or throw an error
    }

    nodeValuesArray = readMultipleTokens(numberOfNodes); // Read values for all nodes

    // Initialize the adjacency list: an array of empty arrays for each node
    graphAdjacencyList = createMultiDimensionalArray("[]", numberOfNodes);

    // Read edges and populate the adjacency list
    for (let edgeCounter = 0; edgeCounter < numberOfNodes - 1; ++edgeCounter) {
        // Node indices are 0-based in array, input is often 1-based, so subtract 1
        const nodeU = obtainNextToken() - 1;
        const nodeV = obtainNextToken() - 1;

        // Basic validation for node indices
        const isValidU = nodeU >= 0 && nodeU < numberOfNodes;
        const isValidV = nodeV >= 0 && nodeV < numberOfNodes;

        if (isValidU && isValidV) {
            // Add bidirectional edges for an undirected graph
            graphAdjacencyList[nodeU].push(nodeV);
            graphAdjacencyList[nodeV].push(nodeU);
        } else {
            // Handle invalid edge input, e.g., by skipping it
            // console.warn(`Skipping invalid edge: (${nodeU+1}, ${nodeV+1})`);
        }
    }

    // Initialize the results array with zeros
    finalResultsArray = createMultiDimensionalArray(0, numberOfNodes);

    // Initialize currentPathLIS with a sentinel value
    // This sentinel ensures that the first actual node value can always extend the LIS.
    currentPathLIS = [Number.MIN_SAFE_INTEGER];

    // Begin the Depth-First Search traversal from node 0 (root) with no parent (-1)
    performDepthFirstSearch(0, -1);

    // Join the computed results for each node with newlines and return
    return finalResultsArray.join("\n");
};

/**
 * Executes a Depth-First Search traversal on the graph to calculate
 * the longest increasing subsequence (LIS) path length ending at each node.
 * @param {number} currentNodeIdentifier - The ID of the current node being processed.
 * @param {number} parentNodeIdentifier - The ID of the parent node in the DFS tree (used to prevent backtracking immediately).
 */
const performDepthFirstSearch = (currentNodeIdentifier, parentNodeIdentifier) => {
    // Retrieve the value of the current node
    const valueOfCurrentNode = nodeValuesArray[currentNodeIdentifier];

    // Find the appropriate position for `valueOfCurrentNode` in `currentPathLIS`.
    // This finds the smallest element >= `valueOfCurrentNode` in `currentPathLIS`.
    const insertionPointIndex = findCeilingIndex(currentPathLIS, valueOfCurrentNode);

    let originalValueAtInsertionPoint; // Stores the value that might be replaced
    let elementWasAppended = false;    // Flag to indicate if a new element was added to the end

    // If `insertionPointIndex` is equal to `currentPathLIS.length`, it means `valueOfCurrentNode`
    // is greater than all elements in `currentPathLIS`, thus extending the LIS.
    if (insertionPointIndex === currentPathLIS.length) {
        currentPathLIS.push(valueOfCurrentNode);
        elementWasAppended = true;
    } else {
        // Otherwise, `valueOfCurrentNode` replaces an existing element at `insertionPointIndex`.
        // This is done to maintain the possibility of forming a longer LIS later with smaller end elements.
        originalValueAtInsertionPoint = currentPathLIS[insertionPointIndex];
        currentPathLIS[insertionPointIndex] = valueOfCurrentNode;
    }

    // The length of the LIS ending at `currentNodeIdentifier` is the current size of `currentPathLIS` minus the sentinel.
    finalResultsArray[currentNodeIdentifier] = currentPathLIS.length - 1;

    // Iterate through all adjacent nodes to `currentNodeIdentifier`
    // Using for...of loop for cleaner iteration over neighbors
    for (const adjacentNodeIdentifier of graphAdjacencyList[currentNodeIdentifier]) {
        // Skip the parent node to avoid cycles and redundant traversals in a tree context
        if (adjacentNodeIdentifier === parentNodeIdentifier) {
            continue;
        }
        // Recursively call DFS for the unvisited adjacent node
        performDepthFirstSearch(adjacentNodeIdentifier, currentNodeIdentifier);
    }

    // Backtracking step: restore `currentPathLIS` to its state before this node was processed.
    if (elementWasAppended) {
        // If an element was added, simply remove it from the end.
        currentPathLIS.pop();
    } else {
        // If an element was replaced, restore its original value.
        currentPathLIS[insertionPointIndex] = originalValueAtInsertionPoint;
    }
};

// Execute the main solution logic and print the output
const programOutput = solutionEntryPoint();
if (programOutput !== undefined && programOutput !== null) {
    console.log(programOutput);
}