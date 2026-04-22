"use strict"; // Enforce strict mode for cleaner code practices

// --- Core Utility Functions for Input and Array Management ---

// Obtain raw input data from standard input stream, assuming UTF-8 encoding.
const rawInputStream = require("fs").readFileSync("/dev/stdin", "utf8");

// Prepare an array of string tokens by splitting the raw input using spaces or newlines.
let inputTokenBuffer = rawInputStream.split(/ |\n/);

// Maintain a pointer to the current position within the input token buffer.
let currentReadPointer = 0;

/**
 * Fetches the next available token from the input buffer.
 * @param {boolean} [returnAsText=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
 * @returns {string|number|undefined} The processed token, or undefined if the buffer is exhausted.
 */
function retrieveNextToken(returnAsText = false) {
    // Implement a safety check to prevent reading beyond the buffer's limits.
    if (currentReadPointer >= inputTokenBuffer.length) {
        console.error("Attempted to read beyond the end of the input buffer. Check input format or program logic.");
        return undefined; // A more robust solution might throw an error.
    }
    const tokenExtracted = inputTokenBuffer[currentReadPointer++];
    return returnAsText ? tokenExtracted : +tokenExtracted; // Unary plus `+` efficiently converts to number.
}

/**
 * Extracts a specified quantity of tokens from the input buffer.
 * @param {number} quantity - The number of tokens to retrieve.
 * @param {boolean} [returnAsText=false] - If true, tokens are returned as strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the retrieved tokens. Returns an empty array on invalid input.
 */
function extractTokenSequence(quantity, returnAsText = false) {
    // Validate the requested quantity and ensure sufficient tokens remain.
    if (quantity <= 0 || currentReadPointer + quantity > inputTokenBuffer.length) {
        console.warn(`Warning: Invalid token quantity (${quantity}) or insufficient tokens remaining.`);
        return []; // Return an empty array for invalid requests.
    }
    const startPosition = currentReadPointer;
    currentReadPointer += quantity;
    const sequence = inputTokenBuffer.slice(startPosition, currentReadPointer);
    return returnAsText ? sequence : sequence.map(value => +value);
}

/**
 * Constructs a 2D matrix by reading tokens from the input buffer.
 * @param {number} matrixHeight - The number of rows for the matrix.
 * @param {number} matrixWidth - The number of columns for each row.
 * @param {boolean} [returnAsText=false] - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<string|number>>} The generated 2D matrix.
 */
function buildMatrixFromInput(matrixHeight, matrixWidth, returnAsText = false) {
    const outputMatrix = [];
    for (let rowIterator = 0; rowIterator < matrixHeight; rowIterator++) {
        // Leverage `extractTokenSequence` for consistent token retrieval.
        const rowData = extractTokenSequence(matrixWidth, returnAsText);
        if (rowData.length !== matrixWidth) {
            console.error(`Error: Incomplete row data for row ${rowIterator}. Expected ${matrixWidth} elements, got ${rowData.length}.`);
            // Optionally, pad the row or handle error more strictly.
            while (rowData.length < matrixWidth) rowData.push(returnAsText ? "" : 0);
        }
        outputMatrix.push(rowData);
    }
    return outputMatrix;
}

/**
 * Dynamically creates a multi-dimensional array, initialized with a specific value.
 * This function provides a safer alternative to `eval`-based array creation.
 * @param {*} initialElementValue - The value to populate all array elements with.
 * @param {...number} arrayDimensions - A sequence of numbers defining the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function generateMultiDimensionalArray(initialElementValue, ...arrayDimensions) {
    // Base case: if no more dimensions, return the initial value.
    if (arrayDimensions.length === 0) {
        return initialElementValue;
    }

    // Recursive step: create the current dimension and fill it.
    const currentDimensionSize = arrayDimensions[0];
    const remainingDimensions = arrayDimensions.slice(1);
    const newDimensionArray = new Array(currentDimensionSize);

    for (let index = 0; index < currentDimensionSize; index++) {
        newDimensionArray[index] = generateMultiDimensionalArray(initialElementValue, ...remainingDimensions);
    }
    return newDimensionArray;
}

// --- End Core Utility Functions ---


// --- Problem-Specific Constants ---
// A large value to represent effectively infinite distance in path calculations.
const INFINITY_DISTANCE = 1e9; // Retained from original for exact numerical behavior.
// The default weight for a direct connection (edge) between nodes.
const STANDARD_EDGE_WEIGHT = 1;

// The modular multiplication function (`mul` in original) was unused by `main`.
// As a Type III change, redundant code is removed for efficiency and clarity.

// --- Main Solution Logic ---

/**
 * Implements the primary algorithm to solve the problem.
 * This function calculates shortest paths in a line graph with a special teleport edge
 * and counts the frequency of each distinct shortest path length.
 * @returns {string} A newline-separated string of distance frequencies.
 */
function solveShortestPathProblem() {
    // Retrieve problem parameters from input.
    let numberOfNodes = retrieveNextToken(); // N: Total number of nodes (1-indexed).
    let teleportNodeA = retrieveNextToken(); // X: First endpoint of the special teleport link.
    let teleportNodeB = retrieveNextToken(); // Y: Second endpoint of the special teleport link.

    // Initialize an array to accumulate counts for each shortest path distance.
    // The maximum possible distance is `numberOfNodes - 1`.
    // Array size `numberOfNodes` to store counts for distances 1 to `numberOfNodes - 1` (using 0-based indexing for distances).
    let pathDistanceFrequency = generateMultiDimensionalArray(0, numberOfNodes);

    // Initialize a 2D matrix to store the shortest path distances between any two nodes.
    // Dimensions are `(numberOfNodes + 2) x (numberOfNodes + 2)` to allow for 1-based node indexing
    // (nodes 1 to N) and provide boundary padding (indices 0 and N+1) for the DP loops.
    let distanceAdjacencyMatrix = generateMultiDimensionalArray(INFINITY_DISTANCE, numberOfNodes + 2, numberOfNodes + 2);

    // Phase 1: Establish initial direct edge distances in the matrix.
    // Iterate through each logical node from 1 to N.
    for (let currentNode = 1; currentNode <= numberOfNodes; currentNode++) {
        // Distance from a node to itself is always zero.
        distanceAdjacencyMatrix[currentNode][currentNode] = 0;

        // Set distances for direct neighbors on the line graph.
        // The original code sets map[i][i-1] and map[i][i+1] unconditionally.
        // This implies edges to "dummy" nodes 0 and N+1 are considered, which aids
        // the DP calculation by providing boundary conditions.
        distanceAdjacencyMatrix[currentNode][currentNode - 1] = STANDARD_EDGE_WEIGHT;
        distanceAdjacencyMatrix[currentNode - 1][currentNode] = STANDARD_EDGE_WEIGHT; // Ensure bidirectionality.

        distanceAdjacencyMatrix[currentNode][currentNode + 1] = STANDARD_EDGE_WEIGHT;
        distanceAdjacencyMatrix[currentNode + 1][currentNode] = STANDARD_EDGE_WEIGHT; // Ensure bidirectionality.

        // Incorporate the special teleport edge between teleportNodeA and teleportNodeB.
        // This is also a bidirectional edge with a weight of 1.
        if (currentNode === teleportNodeA) {
            distanceAdjacencyMatrix[currentNode][teleportNodeB] = STANDARD_EDGE_WEIGHT;
            distanceAdjacencyMatrix[teleportNodeB][currentNode] = STANDARD_EDGE_WEIGHT;
        }
    }

    // Phase 2: Propagate shortest paths using a dynamic programming approach on the distance matrix.
    // This involves two passes over the upper triangular part of the matrix,
    // ensuring distances converge by considering paths through intermediate "grid neighbors".
    // This specific DP pattern is preserved from the original code.

    // First propagation pass: Iterate from top-left to bottom-right of the upper triangle.
    for (let rowCursor = 1; rowCursor <= numberOfNodes; rowCursor++) {
        for (let colCursor = rowCursor + 1; colCursor <= numberOfNodes; colCursor++) {
            // Calculate potential new shortest path for distanceAdjacencyMatrix[rowCursor][colCursor]
            // based on the current value and values of its "grid neighbors" in the matrix.
            // This is a form of relaxation, similar to Bellman-Ford or Floyd-Warshall,
            // but applied to the (row, col) indices as if they were coordinates in a grid.
            const pathThroughLeft = distanceAdjacencyMatrix[rowCursor][colCursor - 1] + STANDARD_EDGE_WEIGHT;
            const pathThroughRight = distanceAdjacencyMatrix[rowCursor][colCursor + 1] + STANDARD_EDGE_WEIGHT;
            const pathThroughUp = distanceAdjacencyMatrix[rowCursor - 1][colCursor] + STANDARD_EDGE_WEIGHT;
            const pathThroughDown = distanceAdjacencyMatrix[rowCursor + 1][colCursor] + STANDARD_EDGE_WEIGHT;
            const existingPath = distanceAdjacencyMatrix[rowCursor][colCursor]; // Current known shortest path.

            // Update the distance with the minimum of all considered options.
            distanceAdjacencyMatrix[rowCursor][colCursor] = Math.min(
                existingPath,
                pathThroughLeft,
                pathThroughRight,
                pathThroughUp,
                pathThroughDown
            );
            // Maintain symmetry: distance from col to row is same as row to col.
            distanceAdjacencyMatrix[colCursor][rowCursor] = distanceAdjacencyMatrix[rowCursor][colCursor];
        }
    }

    // Second propagation pass: Iterate from bottom-right to top-left of the upper triangle.
    // This reverse pass is vital for ensuring full convergence, as values propagated
    // as "future" in the first pass now act as "past" values, enabling further relaxation.
    for (let rowCursor = numberOfNodes - 1; rowCursor > 0; rowCursor--) {
        for (let colCursor = numberOfNodes; colCursor > rowCursor; colCursor--) {
            // Re-calculate shortest path with the same logic.
            const pathThroughLeft = distanceAdjacencyMatrix[rowCursor][colCursor - 1] + STANDARD_EDGE_WEIGHT;
            const pathThroughRight = distanceAdjacencyMatrix[rowCursor][colCursor + 1] + STANDARD_EDGE_WEIGHT;
            const pathThroughUp = distanceAdjacencyMatrix[rowCursor - 1][colCursor] + STANDARD_EDGE_WEIGHT;
            const pathThroughDown = distanceAdjacencyMatrix[rowCursor + 1][colCursor] + STANDARD_EDGE_WEIGHT;
            const existingPath = distanceAdjacencyMatrix[rowCursor][colCursor];

            distanceAdjacencyMatrix[rowCursor][colCursor] = Math.min(
                existingPath,
                pathThroughLeft,
                pathThroughRight,
                pathThroughUp,
                pathThroughDown
            );
            // Maintain symmetry.
            distanceAdjacencyMatrix[colCursor][rowCursor] = distanceAdjacencyMatrix[rowCursor][colCursor];

            // After this final update, the distance for the pair (rowCursor, colCursor) is considered final.
            // Increment the frequency counter for this specific distance.
            // Distances are 1-indexed, so `calculatedDistance - 1` maps to the array index.
            const finalCalculatedDistance = distanceAdjacencyMatrix[rowCursor][colCursor];
            // Ensure the distance is valid and within the expected range for indexing `pathDistanceFrequency`.
            if (finalCalculatedDistance >= 1 && finalCalculatedDistance < numberOfNodes) {
                pathDistanceFrequency[finalCalculatedDistance - 1]++;
            }
        }
    }

    // Format the final result: a newline-separated string of distance counts.
    // The problem typically asks for distances from 1 to N-1, so we slice the array accordingly.
    return pathDistanceFrequency.slice(0, numberOfNodes - 1).join("\n");
}

// Execute the main problem-solving function.
let finalOutputContent = solveShortestPathProblem();

// Output the result to the console if it's a valid value.
if (finalOutputContent !== undefined) {
    console.log(finalOutputContent);
}