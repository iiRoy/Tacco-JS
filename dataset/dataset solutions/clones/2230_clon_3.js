"use strict";

// --- Input Processing Utility ---
// This class provides methods to read various data types from a string buffer,
// typically used for competitive programming input. It replaces the original GET IIFE.
class InputProcessor {
    // Constructor initializes the input buffer and line cursor.
    // Input string is split into lines, and whitespace trimmed.
    constructor(sourceString) {
        // Store all lines from the input string.
        this.allInputLines = sourceString.trim().split("\n");
        // Keep track of the current line being processed in `allInputLines`.
        this.currentLineIndex = 0;
        // Buffer for tokens of the current line, allowing reading values one by one.
        // This buffer stores tokens in reverse order to mimic the original `a()` method's `pop()` behavior.
        this.bufferedLineTokens = [];
    }

    /**
     * Reads a single value from the current line.
     * The original `a()` method implicitly reads tokens from left-to-right on a line
     * by splitting and reversing the line once, then popping from the reversed array.
     * This method replicates that behavior.
     *
     * @param {boolean} [asString=false] - If true, returns the value as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The next single value.
     * @throws {Error} If end of input is reached.
     */
    readSingleValue(asString = false) {
        // If the current line's token buffer is empty, load the next line.
        if (this.bufferedLineTokens.length === 0) {
            if (this.currentLineIndex >= this.allInputLines.length) {
                throw new Error("End of input reached while trying to read a single value.");
            }
            // Split the next line by spaces and reverse the resulting array.
            // This prepares it for `pop()` to yield values in their original order.
            this.bufferedLineTokens = this.allInputLines[this.currentLineIndex].split(" ").reverse();
            this.currentLineIndex++; // Advance to the next line in the main input buffer.
        }

        // Pop the last element from the reversed token buffer (which is the first element of the original line).
        const value = this.bufferedLineTokens.pop();
        return asString ? value : Number(value);
    }

    /**
     * Reads the entire current line as an array of values.
     * This method consumes a full line from the `allInputLines` buffer, bypassing `bufferedLineTokens`.
     *
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of values from the line.
     * @throws {Error} If end of input is reached.
     */
    readLineValues(asString = false) {
        if (this.currentLineIndex >= this.allInputLines.length) {
            throw new Error("End of input reached while trying to read a full line.");
        }
        // Clear `bufferedLineTokens` as this operation consumes an entire new line.
        this.bufferedLineTokens = [];
        const lineContent = this.allInputLines[this.currentLineIndex++];
        const rawValues = lineContent.split(" ");
        return asString ? rawValues : rawValues.map(Number);
    }

    /**
     * Reads 'numLines' lines, treating each line as a single value, and returns them as a 1D array.
     *
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} A 1D array of values.
     * @throws {Error} If not enough lines are available.
     */
    getLinesAsArray(numLines, asString = false) {
        if (this.currentLineIndex + numLines > this.allInputLines.length) {
            throw new Error(`Not enough lines available for array read: requested ${numLines}, available ${this.allInputLines.length - this.currentLineIndex}`);
        }
        this.bufferedLineTokens = []; // Clear buffer as multiple lines are consumed.
        const resultArray = [];
        for (let i = 0; i < numLines; i++) {
            const line = this.allInputLines[this.currentLineIndex++];
            resultArray.push(asString ? line : Number(line));
        }
        return resultArray;
    }

    /**
     * Reads 'numLines' lines, splitting each line into multiple values, and returns them as a 2D matrix.
     *
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [asString=false] - If true, returns values as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of values.
     * @throws {Error} If not enough lines are available.
     */
    getLinesAsMatrix(numLines, asString = false) {
        if (this.currentLineIndex + numLines > this.allInputLines.length) {
            throw new Error(`Not enough lines available for matrix read: requested ${numLines}, available ${this.allInputLines.length - this.currentLineIndex}`);
        }
        this.bufferedLineTokens = []; // Clear buffer as multiple lines are consumed.
        const resultMatrix = [];
        for (let i = 0; i < numLines; i++) {
            const line = this.allInputLines[this.currentLineIndex++];
            const values = line.split(" ");
            resultMatrix.push(asString ? values : values.map(Number));
        }
        return resultMatrix;
    }
}

// --- Multi-dimensional Array Initialization Utility ---
// This function replaces the `xArray` utility, avoiding the use of `eval`
// by recursively building multi-dimensional arrays.
/**
 * Recursively creates a multi-dimensional array with specified dimensions,
 * filled with a given initial value.
 *
 * @param {Array<number>} dimensions - An array specifying the size of each dimension.
 * @param {*} fillValue - The value to initialize each element with. If an object, it's deep-cloned.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray(dimensions, fillValue) {
    // Base case: if no more dimensions, return the fill value.
    // If fillValue is an object, clone it to prevent shared references.
    if (dimensions.length === 0) {
        return (typeof fillValue === 'object' && fillValue !== null)
            ? JSON.parse(JSON.stringify(fillValue))
            : fillValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = initializeMultiDimensionalArray(remainingDimensions, fillValue);
    }
    return newArray;
}

// --- Main Program Execution Flow ---
// Read input from standard input using Node.js 'fs' module.
const fs = require("fs");
const rawInputContent = fs.readFileSync("/dev/stdin", "utf8");
// Create an instance of our custom input parser.
const inputParserInstance = new InputProcessor(rawInputContent);

/**
 * Encapsulates the core problem-solving logic.
 * This function replaces the original `main` function.
 * @returns {number} The final result of the dynamic programming calculation.
 */
function calculateSolution() {
    // Read the total number of nodes in the graph.
    const numberOfNodes = inputParserInstance.readSingleValue();

    // Initialize the adjacency list for the graph.
    // `adjacencyList[i]` will store an array of nodes connected to node `i`.
    const adjacencyList = initializeMultiDimensionalArray([numberOfNodes], []);

    // A map to quickly find the index of an edge given its two endpoints.
    // Key format: "nodeA,nodeB" where nodeA <= nodeB.
    const edgeToIndexMap = new Map();
    // Arrays to store the sorted node pairs for each edge, mirroring `a` and `b` from original.
    const edgeNodeA_sorted = [];
    const edgeNodeB_sorted = [];

    // An array to store bitmasks for each edge.
    // `edgeActivationMasks[k]` will be a bitmask representing which queries use the k-th edge.
    const edgeActivationMasks = initializeMultiDimensionalArray([numberOfNodes - 1], 0);

    // Process all (numberOfNodes - 1) edges to build the graph.
    for (let edgeCounter = 0; edgeCounter < numberOfNodes - 1; edgeCounter++) {
        // Read the two nodes connected by the current edge (1-indexed, convert to 0-indexed).
        const rawNodeOne = inputParserInstance.readSingleValue();
        const rawNodeTwo = inputParserInstance.readSingleValue();
        const nodeX = rawNodeOne - 1;
        const nodeY = rawNodeTwo - 1;

        // Add bidirectional connections to the adjacency list.
        adjacencyList[nodeX].push(nodeY);
        adjacencyList[nodeY].push(nodeX);

        // Store the sorted pair of nodes for this edge and its index.
        // This ensures a consistent key for `edgeToIndexMap`.
        const smallerNode = Math.min(nodeX, nodeY);
        const largerNode = Math.max(nodeX, nodeY);
        edgeNodeA_sorted[edgeCounter] = smallerNode;
        edgeNodeB_sorted[edgeCounter] = largerNode;
        edgeToIndexMap.set(`${smallerNode},${largerNode}`, edgeCounter);
    }

    // Read the number of path queries.
    const numberOfQueries = inputParserInstance.readSingleValue();

    // Process each query to determine which edges are part of which paths.
    for (let queryCounter = 0; queryCounter < numberOfQueries; queryCounter++) {
        // Read the start and target nodes for the current query (1-indexed, convert to 0-indexed).
        const rawQueryStart = inputParserInstance.readSingleValue();
        const rawQueryTarget = inputParserInstance.readSingleValue();
        const queryStartNode = rawQueryStart - 1;
        const queryTargetNode = rawQueryTarget - 1;

        // Calculate the unique bitmask for this query (e.g., 1, 2, 4, 8...).
        const currentQueryBitmask = 1 << queryCounter;

        // Array to store the nodes in the path found by DFS.
        const pathNodeSequence = [];

        // --- Nested DFS Function ---
        // Performs a Depth First Search to find a path between two nodes.
        // This is a closure, allowing it to access `adjacencyList` from `calculateSolution` scope.
        const depthFirstPathSearch = (currentNode, goalNode, previousNode, currentPathAccumulator) => {
            currentPathAccumulator.push(currentNode); // Add current node to the path.

            // If the goal node is reached, return the accumulated path.
            if (currentNode === goalNode) {
                return currentPathAccumulator;
            }

            // Iterate over all neighbors of the current node.
            for (const neighbor of adjacencyList[currentNode]) {
                // Skip the node from which we just came (to avoid cycles in tree-like traversal).
                if (neighbor === previousNode) {
                    continue;
                }
                // Recursively call DFS for the neighbor.
                const foundPathResult = depthFirstPathSearch(neighbor, goalNode, currentNode, currentPathAccumulator);
                // If a path was found in the recursive call, propagate it up immediately.
                if (foundPathResult) {
                    return foundPathResult;
                }
            }

            // If no path was found through this branch, backtrack by removing the current node.
            currentPathAccumulator.pop();
            return undefined; // Indicate no path found from this node.
        };

        // Execute DFS to find the path for the current query.
        const discoveredPath = depthFirstPathSearch(queryStartNode, queryTargetNode, -1, pathNodeSequence);

        // If a path was successfully found, update the edge bitmasks.
        if (discoveredPath) {
            // Iterate through consecutive nodes in the path to identify edges.
            for (let i = 0; i < discoveredPath.length - 1; i++) {
                const nodeOneInPath = discoveredPath[i];
                const nodeTwoInPath = discoveredPath[i + 1];

                // Sort the nodes to get a consistent key for `edgeToIndexMap`.
                const sortedPathNodeA = Math.min(nodeOneInPath, nodeTwoInPath);
                const sortedPathNodeB = Math.max(nodeOneInPath, nodeTwoInPath);

                // Look up the index of this edge using the map.
                const edgeKey = `${sortedPathNodeA},${sortedPathNodeB}`;
                const edgeMappingIndex = edgeToIndexMap.get(edgeKey);

                // Apply the current query's bitmask to the identified edge.
                if (edgeMappingIndex !== undefined) {
                    edgeActivationMasks[edgeMappingIndex] |= currentQueryBitmask;
                } else {
                    // This scenario indicates a potential issue in graph or path construction.
                    console.warn(`Warning: Edge ${edgeKey} from path not found in edge lookup map.`);
                }
            }
        }
    }

    // --- Dynamic Programming Calculation ---
    // `maxPossibleMask` represents the total number of unique query combinations (2^numberOfQueries).
    const maxPossibleMask = 1 << numberOfQueries;
    // `dpWays` table stores the count of ways to satisfy different combinations of queries
    // by selecting a subset of edges processed so far.
    // `dpWays[mask]` = number of ways to achieve `mask` using edges.
    const dpWays = initializeMultiDimensionalArray([maxPossibleMask], 0);
    // Base case: There is one way to achieve an empty mask (by choosing no edges).
    dpWays[0] = 1;

    // Iterate through each edge in the graph.
    // Each edge has a corresponding bitmask in `edgeActivationMasks`.
    for (let currentEdgeIdx = 0; currentEdgeIdx < numberOfNodes - 1; currentEdgeIdx++) {
        // `nextDpWays` will store the updated DP states after considering the current edge.
        const nextDpWays = initializeMultiDimensionalArray([maxPossibleMask], 0);
        // Get the bitmask associated with the current edge.
        const edgeSpecificMask = edgeActivationMasks[currentEdgeIdx];

        // Iterate through all possible masks accumulated from previous edges.
        for (let currentCombinationMask = 0; currentCombinationMask < maxPossibleMask; currentCombinationMask++) {
            // If the current combination mask is unreachable (0 ways), skip.
            if (dpWays[currentCombinationMask] === 0) {
                continue;
            }

            // Scenario 1: The current edge is NOT chosen.
            // The combination mask remains `currentCombinationMask`.
            nextDpWays[currentCombinationMask] += dpWays[currentCombinationMask];

            // Scenario 2: The current edge IS chosen.
            // The new combination mask becomes `currentCombinationMask | edgeSpecificMask`.
            // If `edgeSpecificMask` is 0, choosing this edge doesn't change the mask.
            // In this specific case, the original code had `dp2[i] += dp[i]*2;` for `bitor[j] === 0`.
            // This means an edge with a 0 mask can either be chosen or not chosen, both leading to the same mask.
            // My Case 1 already accounts for "not chosen". If `edgeSpecificMask` is 0, choosing it also leads
            // to `currentCombinationMask`, so we add `dpWays[currentCombinationMask]` again to `nextDpWays[currentCombinationMask]`.
            if (edgeSpecificMask !== 0) {
                nextDpWays[currentCombinationMask | edgeSpecificMask] += dpWays[currentCombinationMask];
            } else {
                // If the edge's mask is 0, choosing it results in the same `currentCombinationMask`.
                // This effectively doubles the count for `currentCombinationMask`, matching `*2` in original.
                nextDpWays[currentCombinationMask] += dpWays[currentCombinationMask];
            }
        }
        // Update the main DP table for the next iteration.
        // `Object.assign` provides a shallow copy of properties, effectively replacing `dpWays` contents.
        Object.assign(dpWays, nextDpWays);
    }

    // The final answer is the number of ways to satisfy ALL queries,
    // which corresponds to the mask where all query bits are set (`maxPossibleMask - 1`).
    return dpWays[maxPossibleMask - 1];
}

// Execute the main solution logic and print its return value.
const problemResult = calculateSolution();
if (problemResult !== undefined) {
    console.log(problemResult);
}