"use strict";

// This module provides an advanced input parsing utility for competitive programming.
// It allows reading various data types (numbers, strings, lines, matrices) from a string source.
// The factory function creates an InputReader instance configured for a specific input string.
const InputReaderFactory = (function () {
    /**
     * Constructs a new InputReader instance.
     * @param {string} rawInputString - The entire input content, typically read from a file or standard input.
     */
    function InputReader(rawInputString) {
        // Pre-process the raw input: split into lines, trim whitespace from each line,
        // and filter out any resulting empty lines to ensure valid data.
        this._inputLines = rawInputString.split(/\r?\n/)
                                   .map(line => line.trim())
                                   .filter(line => line.length > 0);
        this._currentLineCursor = 0; // Tracks the index of the next line to be processed.
        this._currentTokenBuffer = []; // A temporary buffer to hold tokens from the current line
                                       // when reading individual values.
    }

    /**
     * Reads the next individual value from the input stream.
     * If the current line's token buffer is exhausted, it loads and processes the next line.
     * @param {boolean} returnAsString - If true, the value is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The parsed value.
     * @throws {Error} If an attempt is made to read beyond the available input.
     */
    InputReader.prototype.readSingleValue = function (returnAsString = false) {
        // If the token buffer is empty, it means we need to fetch tokens from a new line.
        if (this._currentTokenBuffer.length === 0) {
            // Check if there are any more lines left to read.
            if (this._currentLineCursor >= this._inputLines.length) {
                throw new Error("Input buffer exhausted: No more values to read.");
            }
            // Split the current line into tokens by spaces, filtering out any empty strings.
            const activeLine = this._inputLines[this._currentLineCursor++];
            this._currentTokenBuffer = activeLine.split(' ').filter(token => token.length > 0);
            // Reverse the buffer so that `pop()` retrieves tokens in their original order (LIFO from end).
            this._currentTokenBuffer.reverse();
        }

        const extractedToken = this._currentTokenBuffer.pop();
        // A token should always be available here if the previous checks and filters worked.
        if (extractedToken === undefined) {
             throw new Error("Internal error: Unexpected empty token during value extraction.");
        }
        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads and parses an entire line of values.
     * This method clears any pending tokens from the current line buffer before processing the new line.
     * @param {boolean} returnAsStrings - If true, values in the line are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing the parsed values from the line.
     * @throws {Error} If no more input lines are available.
     */
    InputReader.prototype.readFullLine = function (returnAsStrings = false) {
        if (this._currentLineCursor >= this._inputLines.length) {
            throw new Error("Input buffer exhausted: No more lines to read.");
        }
        // Discard any leftover tokens from a previous `readSingleValue` call on this line.
        this._currentTokenBuffer = [];

        const lineSegments = this._inputLines[this._currentLineCursor++].split(' ').filter(token => token.length > 0);
        return returnAsStrings ? lineSegments : lineSegments.map(val => Number(val));
    };

    /**
     * Reads a specified number of lines, treating each as a row in a matrix.
     * @param {number} numberOfRows - The total number of lines (rows) to read for the matrix.
     * @param {boolean} returnAsStrings - If true, all matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the parsed matrix.
     * @throws {Error} If there are not enough input lines to form the requested matrix.
     */
    InputReader.prototype.readInputMatrix = function (numberOfRows, returnAsStrings = false) {
        const matrixData = [];
        for (let rowIdx = 0; rowIdx < numberOfRows; rowIdx++) {
            matrixData.push(this.readFullLine(returnAsStrings));
        }
        return matrixData;
    };

    /**
     * Reads a specified number of lines as raw strings, without splitting them into tokens.
     * @param {number} numRawLines - The number of raw lines to retrieve.
     * @returns {Array<string>} An array of raw line strings.
     * @throws {Error} If not enough input lines are available.
     */
    InputReader.prototype.readRawLines = function (numRawLines) {
        if (this._currentLineCursor + numRawLines > this._inputLines.length) {
            throw new Error(`Insufficient input: Expected ${numRawLines} raw lines, but only ${this._inputLines.length - this._currentLineCursor} remaining.`);
        }
        // Clear any buffered tokens as we're reading whole lines.
        this._currentTokenBuffer = [];
        const rawLineCollection = this._inputLines.slice(this._currentLineCursor, this._currentLineCursor + numRawLines);
        this._currentLineCursor += numRawLines;
        return rawLineCollection;
    };

    // The factory returns the constructor function for `InputReader`.
    return InputReader;
})();

/**
 * Recursively creates a multi-dimensional array initialized with a specified value.
 * This function avoids `eval` for safer and more predictable array initialization.
 * @param {*} defaultValue - The value to populate all elements of the array with.
 * @param {...number} dimensions - A variadic list of integers representing the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimensionalArray(defaultValue, ...dimensions) {
    if (dimensions.length === 0) {
        return defaultValue; // Base case: if no dimensions left, return the default value.
    }
    const currentDimSize = dimensions[0]; // Size of the current dimension.
    const remainingDims = dimensions.slice(1); // Remaining dimensions for recursion.

    const newArrayInstance = new Array(currentDimSize);
    for (let i = 0; i < currentDimSize; i++) {
        // Recursively fill the current dimension with arrays of the next dimension.
        newArrayInstance[i] = createMultiDimensionalArray(defaultValue, ...remainingDims);
    }
    return newArrayInstance;
}

// Access the Node.js file system module for reading input.
const fileSystem = require("fs");
// Instantiate the input parser by providing the content of stdin.
const inputProcessor = new InputReaderFactory(fileSystem.readFileSync("/dev/stdin", "utf8"));

// Global variables to store graph structure and path-related bitmasks.
let adjacencyList;      // Represents the graph using an adjacency list (array of arrays).
let edgePathBitmasks;   // An array where each element stores a bitmask indicating which query paths traverse that edge.
let edgeIndexMap;       // A map for efficient lookup of an edge's array index using its sorted node pair (e.g., "min-max").

/**
 * Contains the core logic for solving the problem.
 * It reads graph data, processes queries, and applies dynamic programming.
 * @returns {number} The final calculated result, representing the number of ways.
 */
function problemSolver() {
    const totalNodes = inputProcessor.readSingleValue();

    // Handle edge cases for very small graphs.
    // If there's only one node, no edges can be formed.
    // If M queries are present, it's impossible to find paths if M > 0.
    if (totalNodes < 2) {
        const totalQueriesForSmallGraph = inputProcessor.readSingleValue(); // Still need to consume M from input.
        if (totalNodes === 1 && totalQueriesForSmallGraph === 0) {
            return 1; // One way to select no paths in a 1-node, 0-query scenario.
        }
        return 0; // Otherwise, no valid paths or graph.
    }

    // Initialize data structures for graph representation.
    // `edgeList` stores edges as [u, v] for quick iteration.
    const edgeList = [];
    adjacencyList = createMultiDimensionalArray([], totalNodes);
    edgeIndexMap = new Map(); // Map: "minNode-maxNode" string key -> edge array index.

    // Read and process all `totalNodes - 1` edges to build the graph.
    for (let currentEdgeIdx = 0; currentEdgeIdx < totalNodes - 1; currentEdgeIdx++) {
        const firstNode = inputProcessor.readSingleValue() - 1; // Convert to 0-indexed.
        const secondNode = inputProcessor.readSingleValue() - 1; // Convert to 0-indexed.

        // Ensure nodes are stored in a consistent order (min-max) for `edgeIndexMap`.
        const smallerNode = Math.min(firstNode, secondNode);
        const largerNode = Math.max(firstNode, secondNode);

        edgeList.push([smallerNode, largerNode]);
        edgeIndexMap.set(`${smallerNode}-${largerNode}`, currentEdgeIdx); // Store the edge's original index.

        // Build the adjacency list for the graph.
        adjacencyList[firstNode].push(secondNode);
        adjacencyList[secondNode].push(firstNode);
    }

    const totalQueries = inputProcessor.readSingleValue();
    // Initialize `edgePathBitmasks`: an array of zeros, one for each edge.
    // Each element will accumulate bits representing query paths that use that edge.
    edgePathBitmasks = createMultiDimensionalArray(0, totalNodes - 1);

    // Process each query path.
    for (let queryIdx = 0; queryIdx < totalQueries; queryIdx++) {
        const pathStart = inputProcessor.readSingleValue() - 1; // 0-indexed start node for the query.
        const pathEnd = inputProcessor.readSingleValue() - 1;   // 0-indexed end node for the query.
        const queryBit = 1 << queryIdx; // A unique bitmask for the current query path.

        // Find the unique path between `pathStart` and `pathEnd` in the tree using DFS.
        const pathNodesSequence = findTreePathDFS(pathStart, pathEnd, -1, []);

        // This condition should ideally not be met in a valid tree input,
        // but included for robustness against disconnected components or invalid queries.
        if (!pathNodesSequence || pathNodesSequence.length < 2) {
             console.warn(`Warning: Path not found or too short for query from ${pathStart} to ${pathEnd}. Skipping.`);
             continue;
        }

        // Iterate through the edges that form the `pathNodesSequence`.
        for (let pathSegmentIdx = 0; pathSegmentIdx < pathNodesSequence.length - 1; pathSegmentIdx++) {
            const nodeU = pathNodesSequence[pathSegmentIdx];
            const nodeV = pathNodesSequence[pathSegmentIdx + 1];

            // Get the consistently ordered (min-max) pair for the current edge.
            const minEdgeNode = Math.min(nodeU, nodeV);
            const maxEdgeNode = Math.max(nodeU, nodeV);

            const edgeIdentifier = `${minEdgeNode}-${maxEdgeNode}`;
            const edgeArrayIdx = edgeIndexMap.get(edgeIdentifier);

            if (edgeArrayIdx === undefined) {
                 // This indicates a serious internal inconsistency if an edge in the path isn't in the map.
                 throw new Error(`Critical: Edge ${edgeIdentifier} from DFS path not found in lookup map.`);
            }

            // Apply the current query's bitmask to the corresponding edge.
            edgePathBitmasks[edgeArrayIdx] |= queryBit;
        }
    }

    // Dynamic Programming phase: calculate combinations of query paths.
    const totalPathStates = 1 << totalQueries; // 2^M, representing all subsets of queries.
    const dpTable = createMultiDimensionalArray(0, totalPathStates); // DP array, initialized to 0.
    dpTable[0] = 1; // Base case: There is 1 way to achieve an empty set of satisfied queries (by choosing no paths).

    // Iterate through each edge in the graph.
    for (let edgeArrayIdx = 0; edgeArrayIdx < totalNodes - 1; edgeArrayIdx++) {
        const currentEdgeAssociatedMask = edgePathBitmasks[edgeArrayIdx];

        if (currentEdgeAssociatedMask === 0) {
            // If this edge is not part of ANY query path, it can be chosen or not.
            // This effectively doubles the number of ways for ALL existing path combinations.
            for (let stateIdx = 0; stateIdx < totalPathStates; stateIdx++) {
                dpTable[stateIdx] *= 2;
            }
        } else {
            // If this edge IS part of one or more query paths (defined by `currentEdgeAssociatedMask`).
            // Iterate through DP states in reverse to ensure we're using values from the previous edge's calculation.
            for (let stateIdx = totalPathStates - 1; stateIdx >= 0; --stateIdx) {
                // Check if the current state `stateIdx` already includes all the bits in `currentEdgeAssociatedMask`.
                if ((stateIdx & currentEdgeAssociatedMask) === currentEdgeAssociatedMask) {
                    // If it does, this edge can still be chosen or not, doubling the count for this specific state.
                    dpTable[stateIdx] *= 2;
                } else {
                    // If the current state `stateIdx` does NOT fully cover `currentEdgeAssociatedMask`,
                    // we can form a new state by including the bits from `currentEdgeAssociatedMask`.
                    // The count for this new state (`stateIdx | currentEdgeAssociatedMask`) is increased
                    // by the count of the current state (`stateIdx`).
                    dpTable[stateIdx | currentEdgeAssociatedMask] += dpTable[stateIdx];
                }
            }
        }
    }

    // The final result is the count of ways to satisfy ALL query paths,
    // which corresponds to the DP state where all query bits are set (totalPathStates - 1).
    return dpTable[totalPathStates - 1];
}

/**
 * Performs a Depth-First Search to find the unique path between two nodes in a tree structure.
 * @param {number} currentNode - The node currently being visited in the DFS.
 * @param {number} targetNode - The destination node for which the path is sought.
 * @param {number} previousNode - The node from which `currentNode` was reached (to prevent immediate backtracking).
 * @param {Array<number>} currentPathTrace - An array accumulating the nodes in the path from start to `currentNode`.
 * @returns {Array<number>|null} The array of nodes forming the path from start to target, or null if no path found.
 */
function findTreePathDFS(currentNode, targetNode, previousNode, currentPathTrace) {
    currentPathTrace.push(currentNode); // Add the current node to the path being built.

    if (currentNode === targetNode) {
        return currentPathTrace; // If the target is reached, return the accumulated path.
    }

    // Iterate through all neighbors of the current node.
    for (const neighborNode of adjacencyList[currentNode]) {
        // Skip the node from which we just came to avoid going back and forth in a tree.
        if (neighborNode === previousNode) {
            continue;
        }

        // Recursively call DFS for the neighbor.
        const pathFoundInSubtree = findTreePathDFS(neighborNode, targetNode, currentNode, currentPathTrace);

        // If the recursive call found the target, propagate that path back up immediately.
        if (pathFoundInSubtree) {
            return pathFoundInSubtree;
        }
    }

    // If no path to the target was found through any neighbor, backtrack:
    // remove the current node from the path as it's not on the correct route.
    currentPathTrace.pop();
    return null; // No path found from this branch of the DFS.
}

// Execute the main solver function and print its returned result to standard output.
console.log(problemSolver());