"use strict";

// A module for processing input from standard streams.
// It provides methods to read tokens, lines, and blocks of data efficiently.
const InputProcessor = (function() {
    /**
     * Initializes a new input reader instance.
     * @param {string} entireInputContent - The full string content read from the input source.
     * @returns {InputReader} An object capable of reading data sequentially.
     */
    function createInputReader(entireInputContent) {
        return new DataStreamHandler(entireInputContent);
    }

    /**
     * @class
     * Handles the sequential reading and parsing of input data.
     */
    function DataStreamHandler(entireInputContent) {
        // All input lines, stripped of leading/trailing whitespace.
        this._inputLinesStorage = entireInputContent.trim().split("\n");
        // Index of the current line being processed.
        this._currentLinePointer = 0;
        // A temporary buffer to hold tokens from the current line, allowing token-by-token extraction.
        this._activeLineTokens = [];
    }

    /**
     * Extracts the next single token from the input stream.
     * It manages moving to the next line automatically when the current line's tokens are exhausted.
     * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
     * @returns {string|number} The extracted token.
     * @throws {Error} If the end of the input stream is reached unexpectedly.
     */
    DataStreamHandler.prototype.fetchNextToken = function(returnAsString = false) {
        // If the token buffer is empty, replenish it from the next available line.
        if (this._activeLineTokens.length === 0) {
            if (this._currentLinePointer >= this._inputLinesStorage.length) {
                throw new Error("Input stream exhausted. No more tokens available.");
            }
            const currentLineText = this._inputLinesStorage[this._currentLinePointer];
            // Split the line into tokens and reverse the array so `pop()` extracts tokens in their original order.
            this._activeLineTokens = currentLineText.split(" ").reverse();
            this._currentLinePointer++; // Advance the line pointer for subsequent reads.
        }

        const extractedToken = this._activeLineTokens.pop(); // Get the last token (original first).

        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads an entire line from the input stream and returns its tokens.
     * Any partially read tokens from the previous line are discarded.
     * @param {boolean} [returnAsStrings=false] - If true, tokens are returned as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all tokens from the read line.
     * @throws {Error} If the end of the input stream is reached prematurely.
     */
    DataStreamHandler.prototype.retrieveLineTokens = function(returnAsStrings = false) {
        // Clear any residual tokens from the previous line to ensure a fresh line read.
        this._activeLineTokens = [];

        if (this._currentLinePointer >= this._inputLinesStorage.length) {
            throw new Error("Input stream exhausted. Cannot retrieve full line data.");
        }
        const fullLineContent = this._inputLinesStorage[this._currentLinePointer++];
        const parsedTokens = fullLineContent.split(" ");
        return returnAsStrings ? parsedTokens : parsedTokens.map(str => Number(str));
    };

    /**
     * Reads a specified number of lines and structures them into a 2D array (matrix).
     * @param {number} numberOfLines - The count of lines to read for the matrix.
     * @param {boolean} [returnAsStrings=false] - If true, matrix elements are strings; otherwise, numbers.
     * @returns {Array<Array<string|number>>} The constructed matrix.
     * @throws {Error} If there are insufficient lines remaining in the stream.
     */
    DataStreamHandler.prototype.extractLineMatrix = function(numberOfLines, returnAsStrings = false) {
        this._activeLineTokens = []; // Clear token buffer.

        if (this._currentLinePointer + numberOfLines > this._inputLinesStorage.length) {
            throw new Error(`Insufficient lines remaining to extract a matrix of ${numberOfLines} lines.`);
        }
        const lineBlock = this._inputLinesStorage.slice(this._currentLinePointer, this._currentLinePointer + numberOfLines);
        this._currentLinePointer += numberOfLines; // Update the line pointer.

        return lineBlock.map(line => {
            const tokensOnLine = line.split(" ");
            return returnAsStrings ? tokensOnLine : tokensOnLine.map(str => Number(str));
        });
    };

    /**
     * Reads a block of `numLines` as raw strings or numbers without splitting into tokens.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, returns lines as raw strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of lines.
     * @throws {Error} If there are insufficient lines remaining in the stream.
     */
    DataStreamHandler.prototype.fetchRawLineBlock = function(numLines, returnAsStrings = false) {
        this._activeLineTokens = []; // Clear token buffer.

        if (this._currentLinePointer + numLines > this._inputLinesStorage.length) {
            throw new Error(`Insufficient lines remaining to fetch a block of ${numLines} raw lines.`);
        }
        const rawLineData = this._inputLinesStorage.slice(this._currentLinePointer, this._currentLinePointer + numLines);
        this._currentLinePointer += numLines;

        return returnAsStrings ? rawLineData : rawLineData.map(str => Number(str));
    };

    return createInputReader;
})();

// Instantiate the input reader by reading all content from standard input.
const standardInputReader = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specified value.
 * This helper uses `eval` to construct the array based on a variable number of dimensions.
 * @param {any} defaultFillValue - The value to assign to every element in the innermost array.
 * @param {...number} arrayDimensions - The sizes for each dimension, ordered from outermost to innermost.
 * @returns {Array} A new multi-dimensional array.
 */
function createDynamicArray(defaultFillValue, ...arrayDimensions) {
    const totalDimensions = arrayDimensions.length;
    if (totalDimensions === 0) {
        return defaultFillValue; // If no dimensions, return the scalar value.
    }

    // Start building the `eval` string from the innermost dimension.
    let arrayConstructionCode = `Array(arrayDimensions[${totalDimensions - 1}]).fill(null).map(() => ${JSON.stringify(defaultFillValue)})`;

    // Wrap the inner array creation with outer array creations for each remaining dimension.
    for (let i = totalDimensions - 2; i >= 0; --i) {
        arrayConstructionCode = `Array(arrayDimensions[${i}]).fill(null).map(() => ${arrayConstructionCode})`;
    }

    // Execute the constructed string to create the array.
    // Note: Use of `eval` can be a security risk and is generally discouraged in production code
    // due to performance implications and potential for injection vulnerabilities.
    // It is used here to replicate the original code's approach.
    return eval(arrayConstructionCode);
}

// Global variables representing the graph structure and path coverage data.
let graphAdjacencyList; // Represents the graph as an adjacency list (array of arrays).
let edgePathBitmasks;   // Stores a bitmask for each edge, indicating which query paths traverse it.

// Execute the primary logic of the application.
const applicationOutput = processGraphAnalysis();
// Display the result if the function returns a non-undefined value.
if (applicationOutput !== undefined) {
    console.log(applicationOutput);
}

/**
 * The main function orchestrating the graph processing and dynamic programming solution.
 * It reads graph data, processes queries to identify covered edges, and then
 * calculates the final count using dynamic programming.
 * @returns {number} The total number of valid subsets of query paths.
 */
function processGraphAnalysis() {
    const numNodes = standardInputReader.fetchNextToken(); // Read N, the count of nodes.

    // Arrays to store the endpoints of each edge in a canonical (min, max) order.
    const firstEdgeNode = [];
    const secondEdgeNode = [];

    // Initialize the adjacency list for the graph. Each node gets an empty array for its neighbors.
    graphAdjacencyList = createDynamicArray([], numNodes);
    // Initialize the array that will store bitmasks for the (N-1) edges.
    edgePathBitmasks = createDynamicArray(0, numNodes - 1);

    // Read the N-1 edges and populate the graph.
    for (let currentEdgeIndex = 0; currentEdgeIndex < numNodes - 1; ++currentEdgeIndex) {
        const nodeEndpointA = standardInputReader.fetchNextToken() - 1; // 0-indexed node.
        const nodeEndpointB = standardInputReader.fetchNextToken() - 1; // 0-indexed node.

        // Store edges canonically to simplify later lookup (e.g., edge (1,2) is same as (2,1)).
        firstEdgeNode[currentEdgeIndex] = Math.min(nodeEndpointA, nodeEndpointB);
        secondEdgeNode[currentEdgeIndex] = Math.max(nodeEndpointA, nodeEndpointB);

        // Add bidirectional connections to the adjacency list.
        graphAdjacencyList[nodeEndpointA].push(nodeEndpointB);
        graphAdjacencyList[nodeEndpointB].push(nodeEndpointA);
    }

    const numQueries = standardInputReader.fetchNextToken(); // Read M, the count of query paths.

    // Process each query path to determine which edges it covers.
    for (let queryIteration = 0; queryIteration < numQueries; ++queryIteration) {
        const pathStart = standardInputReader.fetchNextToken() - 1; // Start node of current query path.
        const pathEnd = standardInputReader.fetchNextToken() - 1;   // End node of current query path.

        // Create a unique bitmask for this query (e.g., 1, 2, 4, 8, ...).
        const currentQueryIdentifier = 1 << queryIteration;

        // Find the unique path between the start and end nodes using DFS.
        const discoveredPathNodes = findPathInTreeDFS(pathStart, pathEnd, -1, []);

        // Basic validation: A path should always be found in a connected tree.
        if (!discoveredPathNodes || discoveredPathNodes.length < 2) {
            console.error(`Error: Path not found or too short between ${pathStart} and ${pathEnd}.`);
            continue; // Skip this query if path is invalid.
        }

        // Iterate through each edge in the discovered path.
        for (let segmentIdx = 1; segmentIdx < discoveredPathNodes.length; ++segmentIdx) {
            const nodeX = discoveredPathNodes[segmentIdx - 1];
            const nodeY = discoveredPathNodes[segmentIdx];

            // Form the canonical representation of the edge.
            const canonicalX = Math.min(nodeX, nodeY);
            const canonicalY = Math.max(nodeX, nodeY);

            // Find the index of this canonical edge in our stored edge lists.
            // Using findIndex is more readable than a manual loop and suitable for small N-1.
            const correspondingEdgeIndex = firstEdgeNode.findIndex((minVal, idx) =>
                minVal === canonicalX && secondEdgeNode[idx] === canonicalY
            );

            if (correspondingEdgeIndex !== -1) {
                // Apply the current query's bitmask to the found edge.
                edgePathBitmasks[correspondingEdgeIndex] |= currentQueryIdentifier;
            } else {
                console.warn(`Warning: Edge (${canonicalX}, ${canonicalY}) from path not found in initial edge list.`);
            }
        }
    }

    // Dynamic Programming phase to count valid subsets of query paths.
    // `totalMaskCombinations` represents 2^M, the total number of possible subsets of queries.
    const totalMaskCombinations = 1 << numQueries;
    // `dpStateCounts[mask]` will store the number of ways to achieve a state where
    // the union of selected edges' bitmasks results in `mask`.
    let dpStateCounts = createDynamicArray(0, totalMaskCombinations);
    dpStateCounts[0] = 1; // Base case: an empty set of edges (resulting in mask 0) can be formed in 1 way.

    // Iterate through each of the (N-1) edges in the graph.
    for (let currentEdge = 0; currentEdge < numNodes - 1; ++currentEdge) {
        const edgeMaskValue = edgePathBitmasks[currentEdge];

        if (edgeMaskValue === 0) {
            // If the current edge is not part of any query path, its inclusion or exclusion
            // does not change the bitmask state. Thus, each existing count can be achieved
            // in two ways (with or without this edge).
            for (let maskIndex = 0; maskIndex < totalMaskCombinations; ++maskIndex) {
                dpStateCounts[maskIndex] *= 2;
            }
        } else {
            // If the current edge is part of one or more query paths, its inclusion affects the mask.
            // We use a temporary array to calculate the next state to avoid using updated values
            // from the current iteration prematurely.
            const nextDpStateCounts = createDynamicArray(0, totalMaskCombinations);

            for (let maskIndex = 0; maskIndex < totalMaskCombinations; ++maskIndex) {
                // Option 1: Exclude the current edge.
                // The state `maskIndex` remains, inheriting its count from the previous `dpStateCounts`.
                nextDpStateCounts[maskIndex] += dpStateCounts[maskIndex];

                // Option 2: Include the current edge.
                // The new state becomes `maskIndex` ORed with `edgeMaskValue`.
                // Its count is incremented by the count of `maskIndex` from the previous `dpStateCounts`.
                nextDpStateCounts[maskIndex | edgeMaskValue] += dpStateCounts[maskIndex];
            }
            dpStateCounts = nextDpStateCounts; // Update the DP table for the next iteration.
        }
    }

    // The final answer is the count of ways to achieve the state where all M query bits are set.
    return dpStateCounts[totalMaskCombinations - 1];
}

/**
 * Performs a Depth-First Search (DFS) to discover the unique path between two nodes in a tree structure.
 * This function is optimized for trees where a simple parent check prevents cycles, removing the need for a global 'visited' set.
 * @param {number} currentTraversalNode - The node currently being visited in the DFS.
 * @param {number} finalDestinationNode - The target node to reach.
 * @param {number} previousNodeInPath - The node from which `currentTraversalNode` was entered (to avoid immediate backtracking).
 * @param {Array<number>} accumulatedPath - An array representing the path taken from the start node to `currentTraversalNode`.
 * @returns {Array<number>|undefined} The path as an array of node indices if `finalDestinationNode` is found, otherwise `undefined`.
 */
function findPathInTreeDFS(currentTraversalNode, finalDestinationNode, previousNodeInPath, accumulatedPath) {
    // Add the current node to the path being built.
    accumulatedPath.push(currentTraversalNode);

    // If the current node is the target, the path is found.
    if (currentTraversalNode === finalDestinationNode) {
        return accumulatedPath;
    }

    // Get neighbors of the current node.
    const neighborNodes = graphAdjacencyList[currentTraversalNode];

    // Iterate through each neighbor if the node exists in the adjacency list.
    if (neighborNodes) {
        for (const neighbor of neighborNodes) {
            // Skip the node we just came from to prevent infinite loops in a tree.
            if (neighbor === previousNodeInPath) {
                continue;
            }

            // Recursively search from the neighbor.
            const pathResult = findPathInTreeDFS(neighbor, finalDestinationNode, currentTraversalNode, accumulatedPath);

            // If the recursive call found the path, propagate it back up immediately.
            if (pathResult) {
                return pathResult;
            }
        }
    }

    // If no path was found through any neighbor, backtrack: remove the current node
    // from the path and return undefined to indicate no path via this branch.
    accumulatedPath.pop();
    return undefined;
}