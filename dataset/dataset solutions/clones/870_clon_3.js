function ProcessGraphData(rawData) {
    "use strict";

    // Helper function to determine the longest path score using Depth First Search
    function determineLongestPathScore(currentNodeIndex, accumulatedWeight, recursionDepth, pathVisitedSet) {
        let maxBranchScore = 0; // Stores the maximum score found in this branch

        // If the current node has no outgoing connections or is invalid,
        // it means we've reached a dead end for this path.
        if (!adjacentNodes[currentNodeIndex] || adjacentNodes[currentNodeIndex].length === 0) {
            return accumulatedWeight;
        }

        // Iterate over all neighbors of the current node
        for (const nextVertex of adjacentNodes[currentNodeIndex]) {
            // Only proceed if the next vertex has not been visited in the current path
            if (!pathVisitedSet.has(nextVertex)) {
                // Calculate the new accumulated weight for the path
                const edgeCost = weightedEdges[currentNodeIndex].get(nextVertex);
                const newAccumulatedValue = accumulatedWeight + edgeCost;

                // Mark the next vertex as visited for the current path
                pathVisitedSet.add(nextVertex);

                // Recursively call the function for the next vertex
                // Update maxBranchScore with the maximum value returned from recursive calls
                maxBranchScore = Math.max(maxBranchScore, determineLongestPathScore(nextVertex, newAccumulatedValue, recursionDepth + 1, pathVisitedSet));

                // Backtrack: remove the next vertex from the visited set
                // This allows other paths to visit this node
                pathVisitedSet.delete(nextVertex);
            }
        }
        return maxBranchScore; // Return the highest score found in this branch
    }

    // Initialize console output and input parsing utilities
    const logOutput = console.log;
    const inputReader = new DataStreamParser(rawData, " \n");

    // Read graph dimensions
    const totalVertices = inputReader.readNextInteger();
    const totalEdges = inputReader.readNextInteger();

    // Guard clause for invalid number of vertices
    if (totalVertices <= 0) {
        logOutput(0);
        return;
    }

    // Data structures to represent the graph:
    // `weightedEdges`: An array where each element is a Map storing edge weights
    //                  (e.g., weightedEdges[source].get(destination) gives weight C)
    // `adjacentNodes`: An array where each element is a list of directly connected neighbor nodes
    let weightedEdges = [];
    let adjacentNodes = [];
    let loopIndex; // Loop counter variable

    // Initialize graph data structures for all vertices
    for (loopIndex = 0; loopIndex < totalVertices; loopIndex++) {
        weightedEdges[loopIndex] = new Map();
        adjacentNodes[loopIndex] = [];
    }

    // Read and populate graph edges from input
    for (loopIndex = 0; loopIndex < totalEdges; loopIndex++) {
        const sourceVertex = inputReader.readNextInteger();
        const targetVertex = inputReader.readNextInteger();
        const connectionWeight = inputReader.readNextInteger();

        // Basic validation for vertex indices
        if (sourceVertex < 0 || sourceVertex >= totalVertices || targetVertex < 0 || targetVertex >= totalVertices) {
            // Optionally log an error or throw an exception for invalid input
            // For this problem, we'll simply skip invalid edges
            continue;
        }

        // Add the target vertex to the source vertex's adjacency list
        adjacentNodes[sourceVertex].push(targetVertex);
        // Store the weight for the edge from source to target
        weightedEdges[sourceVertex].set(targetVertex, connectionWeight);
    }

    // Initiate the DFS traversal starting from node 0 with an initial score of 0,
    // at recursion level 0, and an empty set of visited nodes.
    const finalMaxPath = determineLongestPathScore(0, 0, 0, new Set());

    // Output the maximum path score found
    logOutput(finalMaxPath);
}

// DataStreamParser class for tokenizing and parsing input strings
const DataStreamParser = (function() {
    /**
     * Constructs a new DataStreamParser instance.
     * @param {string} sourceString - The raw string input to parse.
     * @param {string} tokenDelimiter - A string containing characters to use as delimiters.
     */
    function DataStreamParser(sourceString, tokenDelimiter) {
        // Create a regular expression from the delimiter string.
        // It handles special regex characters by escaping them.
        const regexPattern = new RegExp(`[${tokenDelimiter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`, 'g');

        // Clean up carriage returns and split the string into tokens.
        // Filter out any empty tokens that might result from splitting.
        this.parsedTokens = sourceString.replace(/\r/g, '').split(regexPattern).filter(token => token !== '');
        this.currentPosition = 0; // Current index in the token list
    }

    DataStreamParser.prototype = {
        /**
         * Checks if there are more tokens available to read.
         * @returns {boolean} True if more tokens exist, false otherwise.
         */
        hasMoreTokens: function() {
            return this.currentPosition < this.parsedTokens.length;
        },

        /**
         * Retrieves the next token from the stream and advances the position.
         * @returns {string} The next token.
         * @throws {Error} If no more tokens are available.
         */
        getNextToken: function() {
            if (!this.hasMoreTokens()) {
                throw new Error("No more tokens available in the input stream.");
            }
            return this.parsedTokens[this.currentPosition++];
        },

        /**
         * Reads the next token and attempts to convert it to a number.
         * @returns {number} The numeric value of the token.
         * @throws {TypeError} If the token cannot be converted to a number.
         */
        readNextNumber: function() {
            const token = this.getNextToken();
            const num = Number(token);
            if (isNaN(num)) {
                throw new TypeError(`'${token}' cannot be converted to a number.`);
            }
            return num;
        },

        /**
         * Reads the next token and converts it to an integer.
         * @param {number} [base=10] - The radix (base) for parsing the integer.
         * @returns {number} The integer value of the token.
         */
        readNextInteger: function(base = 10) {
            return parseInt(this.readNextNumber(), base);
        },

        /**
         * Peeks at the next token without advancing the stream position.
         * @returns {string|undefined} The next token, or undefined if no more tokens.
         */
        peekAhead: function() {
            return this.parsedTokens[this.currentPosition];
        }
    };

    return DataStreamParser;
}());

// Main execution point: Read input from /dev/stdin and pass it to the processing function.
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));