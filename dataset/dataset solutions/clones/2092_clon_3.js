"use strict";

// --- Input Processing Module ---
// Utilizes Node.js file system to read from standard input.
const fileContentsBuffer = require("node:fs").readFileSync(0, "utf8"); // 0 represents stdin
// Splits the entire input string into an array of tokens using any whitespace as a delimiter.
const inputTokensStream = fileContentsBuffer.trim().split(/\s+/);
let currentTokenPointer = 0; // Index to keep track of the next token to read.

/**
 * Retrieves and converts the next token from the input stream to a number.
 * Assumes all necessary tokens are numeric.
 * @returns {number} The next numeric token from the input.
 */
const getNumericInputToken = () => {
    // Basic guard clause for unexpected end of input.
    if (currentTokenPointer >= inputTokensStream.length) {
        throw new Error("Attempted to read past the end of the input stream.");
    }
    // Convert the string token to a number and advance the pointer.
    return Number(inputTokensStream[currentTokenPointer++]);
};

// --- Global Data Structures for Tree Traversal and Results ---
let totalNodesCount; // Stores the total number of nodes in the graph.
let adjacencyListStructure; // Represents the graph as an array of arrays (adjacency list).
let nodeLevelInformation; // Stores the depth (level) of each node from the root.
let assignedValuesOutput; // Array to hold the final assigned numeric values for each node.

/**
 * Performs a Depth-First Search (DFS) to determine the level (depth) of each node
 * in the tree structure.
 * @param {number} nodeId - The identifier of the node currently being processed.
 * @param {number} parentNodeId - The identifier of the parent node (to prevent backtracking).
 * @param {number} currentLevel - The depth level of the current node from the root (0 for root).
 */
const computeTreeDepths = (nodeId, parentNodeId, currentLevel) => {
    // Assign the determined level to the current node.
    nodeLevelInformation[nodeId] = currentLevel;

    // Iterate through all neighbors (connected nodes) of the current node.
    for (let neighborIndex = 0; neighborIndex < adjacencyListStructure[nodeId].length; ++neighborIndex) {
        const connectedNeighbor = adjacencyListStructure[nodeId][neighborIndex];

        // If the neighbor is not the parent, proceed with DFS on that neighbor.
        // This prevents infinite loops in tree structures.
        if (connectedNeighbor !== parentNodeId) {
            // Recursively call the function for the neighbor, incrementing the level.
            computeTreeDepths(connectedNeighbor, nodeId, currentLevel + 1);
        }
    }
};

/**
 * Main function orchestrating the solution logic.
 * Reads input, constructs the graph, computes node depths, and assigns final values.
 * @returns {string} A space-separated string of the assigned values for each node.
 */
const executeMainSolution = () => {
    totalNodesCount = getNumericInputToken(); // Read the total number of nodes (N).

    // Initialize the adjacency list for the graph.
    // Each element is an empty array to store neighbors.
    adjacencyListStructure = Array.from({ length: totalNodesCount }, () => []);
    // Initialize an array to store the depth of each node.
    nodeLevelInformation = new Array(totalNodesCount);
    // Initialize the array to store the final assigned values.
    assignedValuesOutput = new Array(totalNodesCount);

    // Read N-1 edges to construct the tree.
    // Edges are 1-indexed in problem, convert to 0-indexed for arrays.
    for (let edgeIdx = 0; edgeIdx < totalNodesCount - 1; ++edgeIdx) {
        const nodeA = getNumericInputToken() - 1; // First node of the edge
        const nodeB = getNumericInputToken() - 1; // Second node of the edge

        // Add bidirectional connections to the adjacency list.
        adjacencyListStructure[nodeA].push(nodeB);
        adjacencyListStructure[nodeB].push(nodeA);
    }

    // Start DFS from node 0 (arbitrary root), with no parent (-1) and initial depth 0.
    computeTreeDepths(0, -1, 0);

    let oddDepthNodeCount = 0; // Counter for nodes at odd depths.
    let evenDepthNodeCount = 0; // Counter for nodes at even depths.
    const nodeParityFlags = new Array(totalNodesCount); // Stores 0 for even depth, 1 for odd depth.

    // Determine parity of depth for each node and count odd/even depths.
    for (let nodeIdx = 0; nodeIdx < totalNodesCount; ++nodeIdx) {
        // Depth modulo 2 gives parity (0 for even, 1 for odd).
        const currentParity = nodeLevelInformation[nodeIdx] % 2;
        nodeParityFlags[nodeIdx] = currentParity;

        if (currentParity === 1) { // Odd depth
            oddDepthNodeCount++;
        } else { // Even depth
            evenDepthNodeCount++;
        }
    }

    // Calculate group sizes for numbers 1, 2, 3 (mod 3).
    // groupSizeForMod1: Numbers like 1, 4, 7...
    // groupSizeForMod3: Numbers like 3, 6, 9...
    // groupSizeForMod2: Numbers like 2, 5, 8...
    const groupSizeForMod1 = Math.ceil(totalNodesCount / 3);
    const groupSizeForMod3 = Math.floor(totalNodesCount / 3);
    const groupSizeForMod2 = totalNodesCount - groupSizeForMod1 - groupSizeForMod3;

    let cursorValueForMod1 = 1; // Current value to assign for numbers 1, 4, 7...
    let cursorValueForMod2 = 2; // Current value to assign for numbers 2, 5, 8...
    let cursorValueForMod3 = 3; // Current value to assign for numbers 3, 6, 9...

    // --- Assignment Logic based on Parity Counts ---
    // This part tries to assign numbers 1,4,7... and 2,5,8... to the two parity groups.
    // Numbers 3,6,9... are typically reserved for the smaller parity group or as a fallback.

    // Case 1: If the count of odd-depth nodes is relatively small (can fit into groupSizeForMod3 slots)
    if (oddDepthNodeCount <= groupSizeForMod3) {
        for (let nodeIdx = 0; nodeIdx < totalNodesCount; ++nodeIdx) {
            if (nodeParityFlags[nodeIdx] === 1) { // If node has odd depth
                assignedValuesOutput[nodeIdx] = cursorValueForMod3;
                cursorValueForMod3 += 3;
            } else { // If node has even depth
                // Prioritize assigning 1, 4, 7...
                if (cursorValueForMod1 <= totalNodesCount) {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod1;
                    cursorValueForMod1 += 3;
                }
                // Fallback to 2, 5, 8...
                else if (cursorValueForMod2 <= totalNodesCount) {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod2;
                    cursorValueForMod2 += 3;
                }
                // Ultimate fallback to 3, 6, 9... (if still available)
                else {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod3;
                    cursorValueForMod3 += 3;
                }
            }
        }
    }
    // Case 2: If the count of even-depth nodes is relatively small
    else if (evenDepthNodeCount <= groupSizeForMod3) {
        for (let nodeIdx = 0; nodeIdx < totalNodesCount; ++nodeIdx) {
            if (nodeParityFlags[nodeIdx] === 0) { // If node has even depth
                assignedValuesOutput[nodeIdx] = cursorValueForMod3;
                cursorValueForMod3 += 3;
            } else { // If node has odd depth
                // Prioritize assigning 1, 4, 7...
                if (cursorValueForMod1 <= totalNodesCount) {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod1;
                    cursorValueForMod1 += 3;
                }
                // Fallback to 2, 5, 8...
                else if (cursorValueForMod2 <= totalNodesCount) {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod2;
                    cursorValueForMod2 += 3;
                }
                // Ultimate fallback to 3, 6, 9...
                else {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod3;
                    cursorValueForMod3 += 3;
                }
            }
        }
    }
    // Case 3: Both odd-depth and even-depth node counts are large (neither fits into groupSizeForMod3)
    else {
        for (let nodeIdx = 0; nodeIdx < totalNodesCount; ++nodeIdx) {
            if (nodeParityFlags[nodeIdx] === 1) { // If node has odd depth
                // Try to assign 1, 4, 7...
                if (cursorValueForMod1 <= totalNodesCount) {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod1;
                    cursorValueForMod1 += 3;
                }
                // Fallback to 3, 6, 9... if 1,4,7... values are exhausted or not applicable.
                else {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod3;
                    cursorValueForMod3 += 3;
                }
            } else { // If node has even depth
                // Try to assign 2, 5, 8...
                if (cursorValueForMod2 <= totalNodesCount) {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod2;
                    cursorValueForMod2 += 3;
                }
                // Fallback to 3, 6, 9...
                else {
                    assignedValuesOutput[nodeIdx] = cursorValueForMod3;
                    cursorValueForMod3 += 3;
                }
            }
        }
    }
    
    // Join the final assigned values into a single space-separated string.
    return assignedValuesOutput.join(" ");
};

// Execute the main solution logic and print the result to standard output.
// The `process.argv.length` check for stack size adjustment is removed as it's
// specific to competitive programming environments and not core logic.
console.log(executeMainSolution());