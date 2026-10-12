"use strict";
// This module provides a utility for parsing input data from a string.
var INPUT_PARSER = (function() {
    /**
     * Creates a new input parser instance.
     * @param {string} sourceString The raw input string.
     * @returns {InputReader} A new InputReader object.
     */
    function createParser(sourceString) {
        return new InputReader(sourceString);
    }

    /**
     * @class InputReader
     * @description Handles reading various data types from a pre-loaded string.
     * Each line is treated as a separate entry, and values within a line are space-separated.
     */
    function InputReader(sourceString) {
        // Store the input string, split by newlines and trimmed.
        this._sourceLines = sourceString.trim().split("\n");
        // Current line index for sequential reading.
        this._currentLineIndex = 0;
    }

    /**
     * Reads the next single value from the current line.
     * If the current line is exhausted, it moves to the next line.
     * Values are read from right to left on a line.
     * @param {boolean} [asString=false] If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    InputReader.prototype.readNextValue = function(asString) {
        var lines = this._sourceLines;
        var lineIdx = this._currentLineIndex;
        var resultVal;

        // If the current line hasn't been split into individual values yet, do so.
        // Values are processed in reverse order, so we split and reverse.
        if (typeof lines[lineIdx] === "string") {
            lines[lineIdx] = lines[lineIdx].split(" ").reverse();
        }

        // Pop the last element (which is the first in original order)
        resultVal = lines[lineIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!lines[lineIdx].length) {
            this._currentLineIndex++;
        }

        // Return as string or convert to number.
        return asString ? resultVal : +resultVal;
    };

    /**
     * Reads an entire line of space-separated values.
     * Advances the line index.
     * @param {boolean} [asStrings=false] If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed values.
     */
    InputReader.prototype.readLineOfValues = function(asStrings) {
        var currentLine = this._sourceLines[this._currentLineIndex++];
        var values = currentLine.split(" ");
        return asStrings ? values : values.map(val => +val);
    };

    /**
     * Reads a block of 'numLines' lines, parsing each into an array of values.
     * Advances the line index by 'numLines'.
     * @param {number} numLines The number of lines to read.
     * @param {boolean} [asStrings=false] If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
     */
    InputReader.prototype.readMatrix = function(numLines, asStrings) {
        var rawLines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        var parsedMatrix = rawLines.map(line => line.split(" "));
        return asStrings ? parsedMatrix : parsedMatrix.map(row => row.map(val => +val));
    };

    /**
     * Reads a block of 'numLines' raw lines.
     * Advances the line index by 'numLines'.
     * @param {number} numLines The number of lines to read.
     * @param {boolean} [asStrings=false] If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw or numeric lines.
     */
    InputReader.prototype.readRawLines = function(numLines, asStrings) {
        var lines = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
        return asStrings ? lines : lines.map(line => +line);
    };

    return createParser;
})();

// Initialize the input parser with data from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value or expression.
 * @param {string} initialValueExpression The string expression to initialize each element.
 * @param {...number} dimensions The dimensions of the array (e.g., dim1, dim2, dim3).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValueExpression) {
    var args = arguments;
    var argCount = args.length;
    var currentDimIndex = --argCount; // Start from the last dimension
    var arrayCreationString = "Array(args[" + currentDimIndex + "]).fill(0).map(x => {return " + initialValueExpression + ";})";

    // Build the nested array creation string from inner to outer dimensions.
    while (--currentDimIndex) {
        arrayCreationString = "Array(args[" + currentDimIndex + "]).fill(0).map(x => " + arrayCreationString + ")";
    }
    // Use eval to execute the dynamically generated array creation string.
    return eval(arrayCreationString);
}

// Global variables for graph representation and edge bitmasks.
var adjacencyList;
var edgeBitmasks;

// Execute the main problem-solving logic.
var resultValue = solveProblem();

// If the main function returns a value, print it to console.
if (resultValue !== undefined) {
    console.log(resultValue);
}

/**
 * Main function containing the problem's core logic.
 * @returns {number} The final calculated result.
 */
function solveProblem() {
    // Read the number of nodes in the graph.
    var nodeCount = inputData.readNextValue();

    // Arrays to store the two endpoints of each edge, ensuring min/max order.
    var edgeEndpointsA = [];
    var edgeEndpointsB = [];

    // Initialize the adjacency list for the graph.
    adjacencyList = createMultiDimArray("[]", nodeCount);
    // Initialize an array to store bitmasks for each edge.
    edgeBitmasks = createMultiDimArray(0, nodeCount - 1);

    // Read graph edges and build the adjacency list.
    for (var edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        var startNode = inputData.readNextValue() - 1; // 0-indexed
        var endNode = inputData.readNextValue() - 1;   // 0-indexed

        // Store edges such that edgeEndpointsA[i] <= edgeEndpointsB[i]
        edgeEndpointsA[edgeIndex] = Math.min(startNode, endNode);
        edgeEndpointsB[edgeIndex] = Math.max(startNode, endNode);

        // Add edges to the adjacency list (undirected graph).
        adjacencyList[startNode].push(endNode);
        adjacencyList[endNode].push(startNode);
    }

    // Read the number of queries (paths).
    var queryCount = inputData.readNextValue();

    // Process each query.
    for (var queryIndex = 0; queryIndex < queryCount; queryIndex++) {
        var queryStartNode = inputData.readNextValue() - 1; // 0-indexed start of query path
        var queryEndNode = inputData.readNextValue() - 1;   // 0-indexed end of query path

        // Create a unique bitmask for the current query.
        var currentBitmask = (1 << queryIndex);

        // Find the path between queryStartNode and queryEndNode using DFS.
        // The pathNodes array will contain the sequence of nodes in the path.
        var pathNodes = depthFirstSearch(queryStartNode, queryEndNode, -1, []);

        // Iterate through the edges in the found path.
        for (var pathSegmentIndex = 1; pathSegmentIndex < pathNodes.length; pathSegmentIndex++) {
            var node1 = pathNodes[pathSegmentIndex - 1];
            var node2 = pathNodes[pathSegmentIndex];

            // Determine the canonical representation of the edge (min, max).
            var minNode = Math.min(node1, node2);
            var maxNode = node1 + node2 - minNode; // Equivalent to Math.max(node1, node2)

            // Find the index of this edge in the original edge list.
            for (var originalEdgeIndex = 0;; originalEdgeIndex++) {
                if (edgeEndpointsA[originalEdgeIndex] === minNode && edgeEndpointsB[originalEdgeIndex] === maxNode) {
                    // Apply the current query's bitmask to this edge.
                    edgeBitmasks[originalEdgeIndex] |= currentBitmask;
                    break; // Found the edge, move to the next path segment.
                }
            }
        }
    }

    // Dynamic programming part: Calculate combinations of bitmasks.
    var totalBitmaskCombinations = (1 << queryCount); // Total possible states for queries.
    var dynamicProgArray = createMultiDimArray(0, totalBitmaskCombinations);
    dynamicProgArray[0] = 1; // Base case: one way to have no queries selected.

    // Iterate through each edge in the graph.
    for (var edgeLoopIndex = 0; edgeLoopIndex < nodeCount - 1; edgeLoopIndex++) {
        // If an edge is not part of any query path (its bitmask is 0).
        if (edgeBitmasks[edgeLoopIndex] === 0) {
            // This edge can either be included or not, effectively doubling the ways for each existing state.
            for (var stateIndex = 0; stateIndex < totalBitmaskCombinations; stateIndex++) {
                dynamicProgArray[stateIndex] *= 2;
            }
        } else {
            // If the edge is part of one or more query paths.
            // Create a temporary DP array for the current iteration.
            var tempDPArray = createMultiDimArray(0, totalBitmaskCombinations);
            for (var stateIndex = 0; stateIndex < totalBitmaskCombinations; stateIndex++) {
                // Option 1: Don't use this edge to satisfy any query.
                // The current state 'stateIndex' contributes to 'stateIndex' in the next step.
                tempDPArray[stateIndex] += dynamicProgArray[stateIndex];

                // Option 2: Use this edge to satisfy the queries represented by its bitmask.
                // The current state 'stateIndex' combined with the edge's bitmask
                // contributes to the new state 'stateIndex | edgeBitmasks[edgeLoopIndex]'.
                tempDPArray[stateIndex | edgeBitmasks[edgeLoopIndex]] += dynamicProgArray[stateIndex];
            }
            // Update the main DP array with the results from the temporary array.
            dynamicProgArray = tempDPArray;
        }
    }

    // The final result is the number of ways to satisfy all queries (represented by totalBitmaskCombinations - 1).
    return dynamicProgArray[totalBitmaskCombinations - 1];
}

/**
 * Performs a Depth-First Search to find a path between a start node and a target node.
 * @param {number} currentNode The current node in the DFS traversal.
 * @param {number} targetNode The node to find.
 * @param {number} parentNode The parent node to avoid going back immediately.
 * @param {Array<number>} currentPath The path accumulated so far.
 * @returns {Array<number>|undefined} The path from startNode to targetNode if found, otherwise undefined.
 */
function depthFirstSearch(currentNode, targetNode, parentNode, currentPath) {
    currentPath.push(currentNode); // Add current node to the path.

    // If the target node is found, return the current path.
    if (targetNode === currentNode) {
        return currentPath;
    }

    // Explore neighbors.
    for (var neighborNode of adjacencyList[currentNode]) {
        // Skip the parent node to avoid infinite loops in undirected graphs.
        if (neighborNode === parentNode) {
            continue;
        }

        // Recursively call DFS for the neighbor.
        var foundPath = depthFirstSearch(neighborNode, targetNode, currentNode, currentPath);
        // If a path was found in the recursive call, propagate it up.
        if (foundPath) {
            return foundPath;
        }
    }

    // If no path was found through this node, backtrack by removing it from the path.
    currentPath.pop();
    // Return undefined if no path to targetNode was found from this branch.
}
