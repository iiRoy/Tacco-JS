/**
 * Helper function to create multi-dimensional arrays initialized with a specific value.
 * This function avoids the use of `eval` for safer and more predictable array creation.
 *
 * @param {*} initialValue The value to fill the array elements with.
 * @param {...number} dimensions A list of numbers representing the size of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function createMultiDimensionalArray(initialValue, ...dimensions) {
    // Base case: if no more dimensions, return the initial value.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Guard clause: Ensure dimension size is positive to prevent infinite loops or errors.
    if (currentDimensionSize <= 0) {
        return []; // Return an empty array for invalid or zero-sized dimensions.
    }

    // Recursively create the array structure.
    return Array.from({ length: currentDimensionSize }, () =>
        createMultiDimensionalArray(initialValue, ...remainingDimensions)
    );
}

/**
 * InputReaderFactory is an Immediately Invoked Function Expression (IIFE)
 * that provides a factory function to create an InputProcessor instance.
 * The InputProcessor is designed to sequentially read and parse data from a given string source.
 */
const InputReaderFactory = (function() {
    /**
     * Creates a new instance of InputProcessor.
     * @param {string} sourceText The complete raw input string (e.g., file content).
     * @returns {InputProcessor} A configured InputProcessor object.
     */
    function createInputProcessor(sourceText) {
        return new InputProcessor(sourceText);
    }

    /**
     * @class InputProcessor
     * Manages the parsing and sequential reading of lines and tokens from a source string.
     * It keeps track of the current line and token index to facilitate sequential access.
     */
    function InputProcessor(sourceText) {
        /** @private @type {string[]} All lines from the source string, trimmed and split. */
        this._sourceLines = sourceText.trim().split(/\r?\n/);
        /** @private @type {number} The index of the current line being processed. */
        this._currentLineIndex = 0;
        /** @private @type {string[]} A buffer holding tokens from the currently active line. */
        this._currentLineTokensBuffer = [];
        /** @private @type {number} The index of the next token to read from `_currentLineTokensBuffer`. */
        this._currentTokenBufferIndex = 0;
    }

    // Define prototype methods for the InputProcessor class.
    InputProcessor.prototype = {
        /**
         * Reads the next available token. If the current line's buffer is exhausted,
         * it loads tokens from the next line.
         *
         * @param {boolean} [returnAsString=false] If true, returns the token as a string; otherwise, attempts to parse as a float.
         * @returns {string|number|undefined} The token value, or `undefined` if no more tokens are available.
         */
        readNextToken: function(returnAsString = false) {
            // Check if the current token buffer is empty or fully consumed.
            if (this._currentTokenBufferIndex >= this._currentLineTokensBuffer.length) {
                // If there are no more lines in the source, return undefined.
                if (this._currentLineIndex >= this._sourceLines.length) {
                    return undefined;
                }

                // Load the next line and split it into tokens. Filter out empty strings from splitting.
                this._currentLineTokensBuffer = this._sourceLines[this._currentLineIndex]
                                                    .split(/\s+/)
                                                    .filter(Boolean);
                this._currentTokenBufferIndex = 0; // Reset token index for the new line.
                this._currentLineIndex++;          // Advance to the next line.

                // If the newly loaded line is empty (e.g., a blank line in input), try reading the next token again.
                if (this._currentLineTokensBuffer.length === 0) {
                    return this.readNextToken(returnAsString);
                }
            }

            // Retrieve the token and advance the buffer index.
            const tokenValue = this._currentLineTokensBuffer[this._currentTokenBufferIndex];
            this._currentTokenBufferIndex++;

            // Return the token, converting to number if specified.
            return returnAsString ? tokenValue : parseFloat(tokenValue);
        },

        /**
         * Reads all tokens from the current line and advances to the next line.
         *
         * @param {boolean} [returnAsStrings=false] If true, returns tokens as strings; otherwise, as numbers.
         * @returns {string[]|number[]} An array of tokens from the consumed line.
         */
        readLineAsTokens: function(returnAsStrings = false) {
            // If no more lines, return an empty array.
            if (this._currentLineIndex >= this._sourceLines.length) {
                return [];
            }

            // Read the current line, split into tokens, and advance the line index.
            const lineTokens = this._sourceLines[this._currentLineIndex++]
                                    .split(/\s+/)
                                    .filter(Boolean);

            // Clear the token buffer as this method consumes a full line, bypassing the buffer.
            this._currentLineTokensBuffer = [];
            this._currentTokenBufferIndex = 0;

            // Return tokens, converting to numbers if specified.
            return returnAsStrings ? lineTokens : lineTokens.map(parseFloat);
        },

        /**
         * Reads a specified number of lines, treating each as a row of tokens, forming a matrix.
         *
         * @param {number} numberOfLines The count of lines to read.
         * @param {boolean} [returnAsStrings=false] If true, elements are strings; otherwise, numbers.
         * @returns {string[][]|number[][]} A 2D array (matrix) of tokens.
         */
        readMatrixOfTokens: function(numberOfLines, returnAsStrings = false) {
            // Guard clause: Ensure a positive number of lines is requested.
            if (numberOfLines <= 0) {
                return [];
            }

            const matrix = [];
            for (let i = 0; i < numberOfLines; i++) {
                // If we run out of lines prematurely, log a warning and return partial matrix.
                if (this._currentLineIndex >= this._sourceLines.length) {
                    console.warn(`Warning: Requested ${numberOfLines} lines, but only ${i} were available.`);
                    break;
                }
                matrix.push(this.readLineAsTokens(returnAsStrings));
            }
            return matrix;
        },

        /**
         * Reads a specified number of raw lines without splitting them into tokens.
         *
         * @param {number} numberOfLines The count of raw lines to read.
         * @param {boolean} [returnAsNumbers=false] If true, attempts to parse each line as a float.
         * @returns {string[]|number[]} An array of raw line strings or numbers.
         */
        readRawLines: function(numberOfLines, returnAsNumbers = false) {
            // Guard clause: Ensure a positive number of lines is requested.
            if (numberOfLines <= 0) {
                return [];
            }

            const lines = [];
            // Determine the end index, clamping to the available source lines.
            const endIndex = Math.min(this._currentLineIndex + numberOfLines, this._sourceLines.length);

            // Collect the raw lines.
            for (let i = this._currentLineIndex; i < endIndex; i++) {
                lines.push(this._sourceLines[i]);
            }
            // Update the current line index.
            this._currentLineIndex = endIndex;

            // Clear the token buffer as raw lines are read directly.
            this._currentLineTokensBuffer = [];
            this._currentTokenBufferIndex = 0;

            // Return lines, converting to numbers if specified.
            return returnAsNumbers ? lines.map(parseFloat) : lines;
        }
    };

    return createInputProcessor;
})();

// --- Main Program Logic ---

// Initialize the input processor by reading from standard input.
// This uses Node.js's file system module to read synchronously.
const inputDataProcessor = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Helper function to check if two nodes are directly connected in the graph.
 *
 * @param {number} nodeU The index of the first node.
 * @param {number} nodeV The index of the second node.
 * @param {string[][]} adjacencyMatrix The adjacency matrix representing the graph.
 * @returns {boolean} True if `nodeU` and `nodeV` are adjacent (connected by an edge), false otherwise.
 */
function isAdjacent(nodeU, nodeV, adjacencyMatrix) {
    // Basic validation for node indices to prevent out-of-bounds access.
    if (nodeU < 0 || nodeV < 0 || nodeU >= adjacencyMatrix.length || nodeV >= adjacencyMatrix.length) {
        return false;
    }
    // Adjacency is indicated by a string "1" in the matrix.
    return adjacencyMatrix[nodeU][nodeV] === "1";
}

/**
 * Executes the primary graph analysis logic to determine graph properties,
 * particularly related to bipartiteness and path lengths.
 *
 * @returns {number} The calculated result, which is either -1 (if the graph is not bipartite) or
 *                   the maximum BFS level found across all components plus the count of isolated nodes.
 */
function runGraphAnalysis() {
    // Read the total number of vertices (N) from the input.
    const numVertices = inputDataProcessor.readNextToken();

    // Guard clause: Handle cases where the number of vertices is invalid or zero.
    // For an empty graph, the maximum bipartite level is 0.
    if (numVertices <= 0) {
        return 0;
    }

    // Read the adjacency matrix. It's provided as strings '0' or '1'.
    const adjacencyMatrix = inputDataProcessor.readMatrixOfTokens(numVertices, true);

    // `connectedStatus` tracks if a vertex has at least one outgoing edge.
    // Initialized to 0 (isolated) for all vertices.
    const connectedStatus = createMultiDimensionalArray(0, numVertices);
    let anyConnectionExists = false;   // Flag to indicate if the entire graph has any edges.
    let isolatedNodesCount = 0;        // Counter for vertices with no connections.

    // First pass: Determine `connectedStatus` for each vertex and count isolated nodes.
    for (let currentVertex = 0; currentVertex < numVertices; currentVertex++) {
        let vertexHasOutgoingEdges = false;
        for (let neighborVertex = 0; neighborVertex < numVertices; neighborVertex++) {
            if (isAdjacent(currentVertex, neighborVertex, adjacencyMatrix)) {
                vertexHasOutgoingEdges = true;
                anyConnectionExists = true; // Mark that the graph is not entirely empty.
                break; // No need to check further for this vertex's connections.
            }
        }
        if (vertexHasOutgoingEdges) {
            connectedStatus[currentVertex] = 1; // Mark as connected.
        } else {
            isolatedNodesCount++; // Increment count for isolated nodes.
        }
    }

    // Optimization: If no connections exist in the entire graph, return `numVertices`.
    // In this scenario, all nodes are isolated, and the "max level" is effectively 0 for each.
    // The problem implies `n` is the answer if no connections.
    if (!anyConnectionExists) {
        return numVertices;
    }

    // Proceed to the core BFS-based calculation if connections are present.
    return findBipartiteMaxLevel(numVertices, adjacencyMatrix, connectedStatus, isolatedNodesCount);
}

/**
 * Performs a Breadth-First Search (BFS) to determine the maximum level (distance)
 * within connected components and checks if the graph is bipartite.
 *
 * @param {number} numVertices The total number of vertices in the graph.
 * @param {string[][]} adjacencyMatrix The graph's adjacency matrix.
 * @param {number[]} connectedStatus An array where `1` indicates a connected node, `0` an isolated one.
 * @param {number} initialIsolatedCount The pre-calculated count of isolated nodes.
 * @returns {number} The maximum BFS level + `initialIsolatedCount`, or -1 if the graph is not bipartite.
 */
function findBipartiteMaxLevel(numVertices, adjacencyMatrix, connectedStatus, initialIsolatedCount) {
    let maxBipartiteLevel = 0; // Stores the maximum BFS level found across all graph components.

    // Iterate through each vertex to ensure all connected components are processed.
    for (let startVertex = 0; startVertex < numVertices; startVertex++) {
        // Skip processing nodes that are isolated (already accounted for in `initialIsolatedCount`)
        // or have already been visited as part of another component's BFS.
        if (connectedStatus[startVertex] === 0) {
            continue;
        }

        // `distanceLevels` stores the BFS distance (level) from the current `startVertex`.
        // -1: unvisited, 0: start node, 1+: distance from start node.
        const distanceLevels = createMultiDimensionalArray(-1, numVertices);
        distanceLevels[startVertex] = 0; // The starting node is at level 0.

        // `currentLevelQueue` holds nodes to be processed at the current BFS level.
        const currentLevelQueue = [];
        let currentBFSLevel = 0; // Represents the level *being assigned* to neighbors.

        // Populate the initial queue with direct neighbors of the `startVertex`.
        // These neighbors are at level 1.
        for (let neighborIdx = 0; neighborIdx < numVertices; neighborIdx++) {
            if (isAdjacent(startVertex, neighborIdx, adjacencyMatrix)) {
                distanceLevels[neighborIdx] = 1; // Assign level 1.
                currentLevelQueue.push(neighborIdx);
            }
        }
        // After initial setup, `currentBFSLevel` is 1, as we're now looking for nodes at level 2.
        currentBFSLevel = 1;

        // Main BFS loop: Continues as long as there are nodes to visit in the current level.
        while (currentLevelQueue.length > 0) {
            const nextLevelQueue = []; // Queue for nodes discovered for the *next* BFS level.

            // Process all nodes currently in `currentLevelQueue`.
            while (currentLevelQueue.length > 0) {
                const currentNode = currentLevelQueue.shift(); // Get node from the front of the queue (FIFO).
                const currentNodeLevel = distanceLevels[currentNode]; // Level of the current node.

                // Explore all potential neighbors of `currentNode`.
                for (let neighborOfCurrent = 0; neighborOfCurrent < numVertices; neighborOfCurrent++) {
                    if (!isAdjacent(currentNode, neighborOfCurrent, adjacencyMatrix)) {
                        continue; // If not adjacent, skip.
                    }

                    // Case 1: Neighbor is unvisited.
                    if (distanceLevels[neighborOfCurrent] === -1) {
                        distanceLevels[neighborOfCurrent] = currentNodeLevel + 1; // Assign next level.
                        nextLevelQueue.push(neighborOfCurrent); // Add to the queue for the next BFS iteration.
                    }
                    // Case 2: Neighbor has already been visited.
                    // For a graph to be bipartite, adjacent nodes must always have distance levels
                    // that differ by exactly 1. If this is not the case, it indicates an odd-length cycle,
                    // making the graph non-bipartite.
                    else if (Math.abs(distanceLevels[neighborOfCurrent] - currentNodeLevel) !== 1) {
                        return -1; // Graph is not bipartite.
                    }
                }
            }
            // After processing all nodes at `currentNodeLevel`, move to the next level.
            currentLevelQueue.push(...nextLevelQueue);
            currentBFSLevel++; // Increment `currentBFSLevel` for the next iteration.
        }

        // Update the overall maximum bipartite level found across all components.
        // `currentBFSLevel - 1` is the actual maximum level reached in the completed BFS for this component.
        maxBipartiteLevel = Math.max(maxBipartiteLevel, currentBFSLevel - 1);
    }

    // The final result is the maximum level found in any bipartite component
    // plus the count of nodes that were completely isolated from all components.
    return maxBipartiteLevel + initialIsolatedCount;
}

// Execute the graph analysis and output the final result to the console.
console.log(runGraphAnalysis());