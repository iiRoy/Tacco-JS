"use strict";

// This module provides a factory for creating input parsers.
// It processes raw string input into a structured buffer for sequential reading.
const InputDataProcessor = (function() {
    // Inner class representing the actual input buffer and its reading capabilities.
    class LineSegmentBuffer {
        /**
         * Initializes the buffer by pre-processing the raw input string.
         * Each line is split into tokens, and tokens are reversed to allow efficient 'pop' operations.
         * @param {string} rawInputContent - The entire input as a single string.
         */
        constructor(rawInputContent) {
            // Filter out empty lines and trim whitespace, then split each line into tokens.
            // Tokens are reversed so that 'pop()' retrieves them in their original order.
            this.tokenizedLines = rawInputContent.split('\n')
                                                .filter(line => line.trim().length > 0)
                                                .map(line => line.trim().split(' ').reverse());
            // Pointer to the current line being processed.
            this.currentLinePointer = 0;
            // A small buffer for tokens from the current line, if any are left.
            this.activeLineTokens = [];
        }

        /**
         * Retrieves the next token from the input stream.
         * This method simulates reading tokens one by one from left to right across lines.
         * @param {boolean} [returnAsText=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
         * @returns {string|number} The next token.
         * @throws {Error} If attempting to read past the end of the input.
         */
        obtainNextToken(returnAsText = false) {
            // If the current line's token buffer is empty, move to the next line.
            while (this.activeLineTokens.length === 0) {
                if (this.currentLinePointer >= this.tokenizedLines.length) {
                    throw new Error("End of input reached. No more tokens available.");
                }
                // Assign tokens from the next line to the active buffer.
                this.activeLineTokens = this.tokenizedLines[this.currentLinePointer];
                this.currentLinePointer++; // Advance the line pointer.
            }

            // Extract the last token from the reversed array (which is the next token in original order).
            const nextValue = this.activeLineTokens.pop();

            // Return based on the desired type.
            return returnAsText ? nextValue : Number(nextValue);
        }

        /**
         * Reads and returns all tokens from the current line as an array.
         * Advances the line pointer to the next line.
         * @param {boolean} [keepStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of tokens from the consumed line.
         * @throws {Error} If attempting to read past the end of the input.
         */
        consumeCurrentLineTokens(keepStrings = false) {
            if (this.currentLinePointer >= this.tokenizedLines.length) {
                throw new Error("End of input reached. Cannot consume more lines.");
            }
            // Get the current line's tokens, reverse them to original order.
            const lineTokens = this.tokenizedLines[this.currentLinePointer].reverse();
            this.currentLinePointer++; // Advance the line pointer.
            this.activeLineTokens = []; // Clear any residual tokens from previous `obtainNextToken` calls if this method is used mid-line.

            return keepStrings ? lineTokens : lineTokens.map(token => Number(token));
        }

        /**
         * Reads a block of 'numRows' lines, parsing each into an array of tokens.
         * Useful for reading matrices or multi-line data structures.
         * @param {number} numRows - The number of lines to read.
         * @param {boolean} [preserveText=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the block of data.
         * @throws {Error} If not enough lines are available.
         */
        readMultiLineBlock(numRows, preserveText = false) {
            if (this.currentLinePointer + numRows > this.tokenizedLines.length) {
                throw new Error(`Not enough lines available to read a block of ${numRows} rows.`);
            }

            const blockData = [];
            for (let i = 0; i < numRows; i++) {
                blockData.push(this.consumeCurrentLineTokens(preserveText));
            }
            return blockData;
        }

        /**
         * Reads a block of 'numRows' lines as raw strings, without tokenizing.
         * @param {number} numRows - The number of lines to read.
         * @returns {Array<string>} An array of raw line strings.
         * @throws {Error} If not enough lines are available.
         */
        fetchRawLineBlock(numRows) {
            if (this.currentLinePointer + numRows > this.tokenizedLines.length) {
                throw new Error(`Not enough raw lines available to read a block of ${numRows} rows.`);
            }
            const rawLines = [];
            for (let i = 0; i < numRows; i++) {
                // Reconstruct the original line from tokenized form for raw access.
                rawLines.push(this.tokenizedLines[this.currentLinePointer].reverse().join(' '));
                this.currentLinePointer++;
            }
            this.activeLineTokens = []; // Clear any residual tokens.
            return rawLines;
        }
    }

    // The factory function that gets exposed.
    // It creates and returns an instance of the LineSegmentBuffer.
    return function createInputParser(sourceString) {
        return new LineSegmentBuffer(sourceString);
    };
})();

// Instantiate the input parser with content from stdin.
const dataInputReader = InputDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a default value.
 * This is a recursive helper function to build nested arrays.
 * @param {*} initialValue - The value to fill all elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function buildNestedArray(initialValue, ...dimensions) {
    // Base case: if no more dimensions, return the initial value.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    // Create an array for the current dimension, filling it recursively.
    return Array.from({ length: currentDimensionSize }, () =>
        buildNestedArray(initialValue, ...remainingDimensions)
    );
}

// Define a constant for effectively infinite path cost.
const PATH_MAX_VALUE = 1e15; // A large number representing infinity for pathfinding.

// Entry point of the program.
console.log(processGraphConnectivity());

/**
 * Main function to process graph data, apply Floyd-Warshall algorithm,
 * transform edge weights based on a threshold, and answer connectivity queries.
 * @returns {string} The results of the queries, joined by newlines.
 */
function processGraphConnectivity() {
    // --- Input Reading ---
    // Read graph parameters: number of nodes, number of edges, and path length threshold.
    const numberOfNodes = dataInputReader.obtainNextToken();
    const numberOfEdges = dataInputReader.obtainNextToken();
    const lengthThreshold = dataInputReader.obtainNextToken();

    // Read the list of initial edges.
    const edgeList = dataInputReader.readMultiLineBlock(numberOfEdges);

    // Read the number of connectivity queries.
    const numberOfQueries = dataInputReader.obtainNextToken();
    // Read the source-destination pairs for the queries.
    const queryPairs = dataInputReader.readMultiLineBlock(numberOfQueries);

    // --- Graph Initialization ---
    // Initialize the distance matrix (adjacency matrix for shortest paths).
    // All paths initially set to PATH_MAX_VALUE, representing no direct connection.
    const distanceMatrix = buildNestedArray(PATH_MAX_VALUE, numberOfNodes, numberOfNodes);

    // Set diagonal elements to 0, as the distance from a node to itself is zero.
    for (let nodeIdx = 0; nodeIdx < numberOfNodes; nodeIdx++) {
        distanceMatrix[nodeIdx][nodeIdx] = 0;
    }

    // Populate the distance matrix with initial edge weights.
    // Adjust node indices from 1-based to 0-based.
    edgeList.forEach(edge => {
        const [source, destination, weight] = edge;
        distanceMatrix[source - 1][destination - 1] = weight;
        distanceMatrix[destination - 1][source - 1] = weight; // Assuming an undirected graph.
    });

    // --- First Floyd-Warshall Algorithm Execution ---
    // Computes all-pairs shortest paths for the original graph.
    // This finds the minimum cost to travel between any two nodes.
    for (let kIntermediate = 0; kIntermediate < numberOfNodes; kIntermediate++) {
        for (let iStart = 0; iStart < numberOfNodes; iStart++) {
            for (let jEnd = 0; jEnd < numberOfNodes; jEnd++) {
                const pathViaIntermediate = distanceMatrix[iStart][kIntermediate] + distanceMatrix[kIntermediate][jEnd];
                // Update if a shorter path is found.
                if (pathViaIntermediate < distanceMatrix[iStart][jEnd]) {
                    distanceMatrix[iStart][jEnd] = pathViaIntermediate;
                }
            }
        }
    }

    // --- Path Cost Transformation ---
    // This step redefines the "cost" of a path based on the lengthThreshold.
    // If an existing path (wf[i][j]) is longer than 'l', it becomes effectively infinite (unusable).
    // Otherwise, it's considered a valid path with a cost of 1.
    for (let iRow = 0; iRow < numberOfNodes; iRow++) {
        for (let jCol = 0; jCol < numberOfNodes; jCol++) {
            const currentPathCost = distanceMatrix[iRow][jCol];
            // Only consider paths that actually exist (not initial PATH_MAX_VALUE unless i==j).
            if (currentPathCost !== PATH_MAX_VALUE) {
                if (currentPathCost <= lengthThreshold) {
                    distanceMatrix[iRow][jCol] = 1; // Valid path, cost 1.
                } else {
                    distanceMatrix[iRow][jCol] = PATH_MAX_VALUE; // Path too long, effectively infinite.
                }
            }
        }
    }

    // --- Second Floyd-Warshall Algorithm Execution ---
    // Re-run Floyd-Warshall on the transformed graph.
    // This finds the minimum number of "valid" segments (cost 1 paths) between nodes.
    for (let kIntermediate = 0; kIntermediate < numberOfNodes; kIntermediate++) {
        for (let iStart = 0; iStart < numberOfNodes; iStart++) {
            for (let jEnd = 0; jEnd < numberOfNodes; jEnd++) {
                const pathViaIntermediate = distanceMatrix[iStart][kIntermediate] + distanceMatrix[kIntermediate][jEnd];
                if (pathViaIntermediate < distanceMatrix[iStart][jEnd]) {
                    distanceMatrix[iStart][jEnd] = pathViaIntermediate;
                }
            }
        }
    }

    // --- Query Processing ---
    // Process each query to find the connectivity between specified nodes.
    const queryResults = queryPairs.map(pair => {
        const [sourceNode, destinationNode] = pair;
        const finalPathLength = distanceMatrix[sourceNode - 1][destinationNode - 1];

        // If the path is effectively infinite, it means no valid connection exists.
        // Otherwise, subtract 1 as per problem specific output format.
        return (finalPathLength >= PATH_MAX_VALUE) ? 0 : finalPathLength - 1;
    });

    // Join the results with newlines for final output.
    return queryResults.join("\n");
}