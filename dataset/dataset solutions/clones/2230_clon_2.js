"use strict";

// This module provides a utility for parsing input data from a string.
var DATA_PARSER = (function() {
    /**
     * Creates a new input parser instance.
     * @param {string} inputString - The raw input string, typically read from a file.
     * @returns {InputProcessor} A new InputProcessor object.
     */
    function createParser(inputString) {
        return new InputProcessor(inputString);
    }

    /**
     * Represents an input processor that handles line-by-line and value-by-value parsing.
     * @class
     * @param {string} rawInput - The complete input string.
     */
    function InputProcessor(rawInput) {
        // Split the input into lines and trim whitespace from each.
        this._sourceLines = rawInput.trim().split("\n");
        // Initialize the current line index.
        this._lineIndex = 0x0;
    }

    /**
     * Reads the next value from the current line. If the current line is exhausted,
     * it moves to the next line.
     * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, as a number.
     * @returns {string|number} The parsed value.
     */
    InputProcessor.prototype.readNextValue = function(asString) {
        var currentLines = this._sourceLines;
        var currentIdx = this._lineIndex;
        var extractedValue;

        // If the current line hasn't been split into individual values yet, do so.
        // Values are stored in reverse order for efficient popping.
        if (typeof currentLines[currentIdx] === "string") {
            currentLines[currentIdx] = currentLines[currentIdx].split(" ").reverse();
        }

        // Pop the last value from the current line's array.
        extractedValue = currentLines[currentIdx].pop();

        // If the current line is now empty, advance to the next line.
        if (!currentLines[currentIdx].length) {
            this._lineIndex += 0x1;
        }

        // Return the value, converting to number if 'asString' is false.
        return asString ? extractedValue : +extractedValue;
    };

    /**
     * Reads all values from the current line and advances to the next line.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    InputProcessor.prototype.readLineValues = function(asString) {
        // Get the current line, split by space, and then advance the line index.
        var lineValues = this._sourceLines[this._lineIndex++].split(" ");
        // Return values as strings or numbers based on the flag.
        return asString ? lineValues : lineValues.map(val => +val);
    };

    /**
     * Reads a matrix of values from the input.
     * @param {number} numRows - The number of rows to read.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} The parsed matrix.
     */
    InputProcessor.prototype.readMatrix = function(numRows, asString) {
        // Extract the specified number of rows and split each into values.
        var resultArray = this._sourceLines.slice(this._lineIndex, this._lineIndex += numRows).map(line => line.split(" "));
        // Return matrix with string or number values.
        return asString ? resultArray : resultArray.map(row => row.map(val => +val));
    };

    /**
     * Reads a specified number of raw lines.
     * @param {number} numRows - The number of lines to read.
     * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of raw lines or numbers.
     */
    InputProcessor.prototype.readRows = function(numRows, asString) {
        // Extract the specified number of raw lines.
        var resultArray = this._sourceLines.slice(this._lineIndex, this._lineIndex += numRows);
        // Return lines as strings or numbers.
        return asString ? resultArray : resultArray.map(line => +line);
    };

    return createParser;
})();

// Initialize the input reader by reading from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    var dimensions = arguments;
    var dimCount = dimensions.length;
    // Start building the eval string from the innermost dimension.
    var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
    // Wrap with outer dimensions.
    while (--dimCount) {
        arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
    }
    // Evaluate the string to create the array.
    return eval(arrayCreationString);
}

// Global variables for graph representation and edge bitmasks.
var adjacencyList, edgeBitmask;

// Execute the main problem-solving logic.
var finalResult = solveProblem();

// If the main function returns a value, print it to console.
if (finalResult !== undefined) {
    console.log(finalResult);
}

/**
 * Main function to solve the problem.
 * @returns {number} The final calculated result.
 */
function solveProblem() {
    // Read the number of nodes in the graph.
    var nodeCount = inputReader.readNextValue();
    // Arrays to store edge endpoints.
    var edgeStartNodes = [],
        edgeEndNodes = [];

    // Initialize the adjacency list for the graph.
    adjacencyList = createMultiDimArray("[]", nodeCount);
    // Initialize bitmasks for each edge.
    edgeBitmask = createMultiDimArray(0x0, nodeCount - 0x1);

    // Read graph edges.
    for (var idx = 0x0; idx < nodeCount - 0x1; ++idx) {
        var startNode = inputReader.readNextValue() - 0x1; // Adjust to 0-indexed.
        var endNode = inputReader.readNextValue() - 0x1; // Adjust to 0-indexed.

        // Store edges such that edgeStartNodes[idx] <= edgeEndNodes[idx].
        edgeStartNodes[idx] = Math.min(startNode, endNode);
        edgeEndNodes[idx] = Math.max(startNode, endNode);

        // Add edges to the adjacency list.
        adjacencyList[startNode].push(endNode);
        adjacencyList[endNode].push(startNode);
    }

    // Read the number of queries (paths).
    var queryCount = inputReader.readNextValue();

    // Process each query.
    for (var idx = 0x0; idx < queryCount; ++idx) {
        var queryNodeU = inputReader.readNextValue() - 0x1; // Adjust to 0-indexed.
        var queryNodeV = inputReader.readNextValue() - 0x1; // Adjust to 0-indexed.

        // Create a bit for the current query.
        var currentBit = 0x1 << idx;

        // Find the path between queryNodeU and queryNodeV using DFS.
        var pathNodes = depthFirstSearch(queryNodeU, queryNodeV, -0x1, []);

        // Iterate through the path to update edge bitmasks.
        for (var pathIdx = 0x1; pathIdx < pathNodes.length; ++pathIdx) {
            var minNode = Math.min(pathNodes[pathIdx - 0x1], pathNodes[pathIdx]);
            var maxNode = pathNodes[pathIdx - 0x1] + pathNodes[pathIdx] - minNode; // This is equivalent to Math.max

            // Find the corresponding edge in the stored edge list.
            for (var edgeIdx = 0x0;; ++edgeIdx) {
                if (edgeStartNodes[edgeIdx] === minNode && edgeEndNodes[edgeIdx] === maxNode) {
                    // Apply the current query's bit to the edge's bitmask.
                    edgeBitmask[edgeIdx] |= currentBit;
                    break; // Found the edge, move to the next path segment.
                }
            }
        }
    }

    // Calculate the maximum possible bitmask for queries.
    var maxBitmask = 0x1 << queryCount;
    // Initialize the dynamic programming table.
    var dynamicProgrammingTable = createMultiDimArray(0x0, maxBitmask);
    dynamicProgrammingTable[0x0] = 0x1; // Base case: one way to have no bits set.

    // Iterate through each edge to build up the DP table.
    for (var edgeIdx = 0x0; edgeIdx < nodeCount - 0x1; ++edgeIdx) {
        var nextDpTable = createMultiDimArray(0x0, maxBitmask);
        for (var currentMask = 0x0; currentMask < maxBitmask; ++currentMask) {
            if (dynamicProgrammingTable[currentMask] === 0x0) continue; // Skip if no ways to reach this mask.

            // Case 1: The current edge has no associated queries (bitmask is 0).
            // It can either be included or excluded, effectively doubling the ways for the current mask.
            if (edgeBitmask[edgeIdx] === 0x0) {
                nextDpTable[currentMask] += dynamicProgrammingTable[currentMask] * 0x2;
            } else {
                // Case 2: The current edge is associated with some queries.
                // Option A: Exclude the edge. The mask remains the same.
                nextDpTable[currentMask] += dynamicProgrammingTable[currentMask];
                // Option B: Include the edge. The mask is updated with the edge's bitmask.
                nextDpTable[currentMask | edgeBitmask[edgeIdx]] += dynamicProgrammingTable[currentMask];
            }
        }
        // Update the DP table for the next iteration.
        dynamicProgrammingTable = nextDpTable;
    }

    // The final result is the number of ways to achieve the full bitmask (all queries covered).
    return dynamicProgrammingTable[maxBitmask - 0x1];
}

/**
 * Performs a Depth First Search to find a path between a start node and a target node.
 * @param {number} currentNode - The current node being visited.
 * @param {number} targetNode - The node to find.
 * @param {number} parentNode - The parent node in the DFS path (to avoid going backward).
 * @param {Array<number>} currentPath - The path accumulated so far.
 * @returns {Array<number>|undefined} The path from start to target if found, otherwise undefined.
 */
function depthFirstSearch(currentNode, targetNode, parentNode, currentPath) {
    // Add the current node to the path.
    currentPath.push(currentNode);

    // If the target node is reached, return the path.
    if (targetNode === currentNode) {
        return currentPath;
    }

    // Explore neighbors.
    for (var neighborNode of adjacencyList[currentNode]) {
        // Skip the parent node to avoid cycles in simple path finding.
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

    // If no path was found through this branch, backtrack by removing the current node.
    currentPath.pop();
}
