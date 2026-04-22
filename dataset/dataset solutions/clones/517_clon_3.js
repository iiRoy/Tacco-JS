var fileSystemHandler = require('fs');

// Define constants for clarity and potential future modification
const STDIN_FILE_DESCRIPTOR = process.stdin.fd;
const UTF8_ENCODING = 'utf8';
const UNREACHABLE_NODE_COST = Infinity; // Represents an unreachable path
const DIRECT_EDGE_WEIGHT = 1; // Cost for a direct connection between nodes
const START_INDEX_ZERO = 0; // Common starting index for arrays/loops

/**
 * Safely parses an input string into an integer.
 * Returns null or throws an error if parsing fails, depending on strictness.
 * @param {string} inputString - The string to parse.
 * @returns {number | null} The parsed integer or null if invalid.
 */
function safeParseInteger(inputString) {
    const parsedValue = parseInt(inputString, 10);
    // Check if the parsed value is a valid number and not NaN
    if (!isNaN(parsedValue)) {
        return parsedValue;
    }
    // For robustness, could throw an error or return a default value
    console.error(`Warning: Could not parse "${inputString}" as an integer. Returning 0.`);
    return 0; // Default to 0 in case of parsing error for this context
}

/**
 * Reads data from standard input, processes it, and returns an array of lines.
 * This function encapsulates the initial I/O operations.
 * @returns {string[]} An array of strings, each representing a line from stdin.
 */
function retrieveInputLines() {
    // Determine the total size of the input data from stdin.
    // fs.fstatSync is deprecated, using fs.statSync on the descriptor is a modern equivalent.
    const fileStats = fileSystemHandler.fstatSync(STDIN_FILE_DESCRIPTOR);
    const totalDataSize = fileStats.size;

    // Allocate a buffer to hold the input data.
    const dataBuffer = Buffer.alloc(totalDataSize);

    // Read the entire content from stdin into the buffer.
    const actualBytesLoaded = fileSystemHandler.readSync(
        STDIN_FILE_DESCRIPTOR,
        dataBuffer,
        START_INDEX_ZERO,
        totalDataSize,
        START_INDEX_ZERO
    );

    // Convert the buffer content to a UTF-8 string and split it into lines.
    const processedLines = dataBuffer
        .toString(UTF8_ENCODING, START_INDEX_ZERO, actualBytesLoaded)
        .split('\n');

    return processedLines;
}

// Global variable to store all input lines, initialized once.
let parsedInputLines = retrieveInputLines();

/**
 * Initializes an adjacency matrix for a graph with a specified number of vertices.
 * All self-loops have a cost of 0, and all other connections are initially unreachable.
 * @param {number} numVertices - The total number of vertices in the graph.
 * @returns {number[][]} An initialized square adjacency matrix.
 */
function initializeConnectivityMatrix(numVertices) {
    // Ensure a positive number of vertices for graph creation.
    if (numVertices <= 0) {
        console.warn("Attempted to create a graph with zero or negative vertices. Returning empty matrix.");
        return [];
    }

    // Create an empty array to represent the graph's adjacency matrix.
    const connectivityMatrix = [];

    // Populate the matrix:
    // - Diagonal elements (self-loops) are 0.
    // - All other elements are set to UNREACHABLE_NODE_COST.
    for (let rowIdx = START_INDEX_ZERO; rowIdx < numVertices; rowIdx++) {
        connectivityMatrix[rowIdx] = []; // Initialize the row
        for (let colIdx = START_INDEX_ZERO; colIdx < numVertices; colIdx++) {
            connectivityMatrix[rowIdx][colIdx] = (rowIdx === colIdx) ? START_INDEX_ZERO : UNREACHABLE_NODE_COST;
        }
    }
    return connectivityMatrix;
}

/**
 * Computes all-pairs shortest paths in a given graph using the Floyd-Warshall algorithm.
 * The input matrix is modified in-place to store the shortest path distances.
 * @param {number[][]} distanceMap - The adjacency matrix where distanceMap[i][j] is the weight of the edge from i to j.
 * @returns {number[][]} The updated distanceMap containing all-pairs shortest path distances.
 */
function calculateAllPairShortestPaths(distanceMap) {
    // Validate input: ensure distanceMap is an array and not empty.
    if (!Array.isArray(distanceMap) || distanceMap.length === START_INDEX_ZERO) {
        console.error("Invalid or empty distance map provided for shortest path calculation.");
        return [];
    }

    const vertexCount = distanceMap.length;

    // The core Floyd-Warshall triple loop.
    // 'intermediateNode' represents the pivot vertex 'k'.
    // 'sourceNode' represents the starting vertex 'i'.
    // 'destinationNode' represents the ending vertex 'j'.
    for (let intermediateNode = START_INDEX_ZERO; intermediateNode < vertexCount; intermediateNode++) {
        for (let sourceNode = START_INDEX_ZERO; sourceNode < vertexCount; sourceNode++) {
            for (let destinationNode = START_INDEX_ZERO; destinationNode < vertexCount; destinationNode++) {
                // Calculate the path length going through the intermediate node.
                const pathThroughIntermediate = distanceMap[sourceNode][intermediateNode] + distanceMap[intermediateNode][destinationNode];

                // Update the shortest path if a shorter one is found.
                distanceMap[sourceNode][destinationNode] = Math.min(
                    distanceMap[sourceNode][destinationNode],
                    pathThroughIntermediate
                );
            }
        }
    }
    return distanceMap;
}

/**
 * Determines if all reachable nodes from the start can also reach the end node,
 * given a set of possible moves and node displacements.
 * This is the main problem-solving logic.
 * @param {number} maxStepSize - The maximum number of steps allowed in a single move.
 * @param {number} totalNodes - The total number of intermediate nodes (excluding start/end).
 * @param {number[]} nodeDisplacements - An array where nodeDisplacements[i] is the displacement at node i.
 * @returns {boolean} True if all reachable nodes can eventually reach the final destination, false otherwise.
 */
function evaluateConnectivity(maxStepSize, totalNodes, nodeDisplacements) {
    // The graph will include a virtual start node (index 0) and a virtual end node (index totalNodes + 1).
    const effectiveGraphSize = totalNodes + 2;
    const finalDestinationNodeIndex = totalNodes + 1;

    // Initialize an adjacency matrix for the problem's graph.
    // Edges will represent possible moves between positions.
    const adjacencies = initializeConnectivityMatrix(effectiveGraphSize);

    // Populate the adjacency matrix based on allowed moves and displacements.
    // Iterate through each possible current node, including the virtual start.
    for (let currentNode = START_INDEX_ZERO; currentNode <= totalNodes; currentNode++) {
        // For each current node, iterate through all possible step amounts (from 1 up to maxStepSize).
        for (let stepAmount = DIRECT_EDGE_WEIGHT; stepAmount <= maxStepSize; stepAmount++) {
            // Calculate the initial next position based on current node and step amount.
            let nextBasePosition = currentNode + stepAmount;

            // Apply displacement if the next position is within the range of nodes with displacements.
            // Node displacements are defined for indices 1 to `totalNodes`.
            // Virtual start (0) and end (totalNodes + 1) have no explicit displacement.
            let displacementValue = START_INDEX_ZERO;
            if (nextBasePosition >= DIRECT_EDGE_WEIGHT && nextBasePosition <= totalNodes) {
                displacementValue = nodeDisplacements[nextBasePosition];
            }

            // Calculate the final target position after displacement.
            let potentialNextNode = nextBasePosition + displacementValue;

            // Ensure the target position stays within the valid bounds of the graph (0 to effectiveGraphSize - 1).
            potentialNextNode = Math.min(
                Math.max(potentialNextNode, START_INDEX_ZERO),
                effectiveGraphSize - DIRECT_EDGE_WEIGHT
            );

            // If the calculated target position is different from the current node,
            // add a direct edge with DIRECT_EDGE_WEIGHT.
            if (potentialNextNode !== currentNode) {
                adjacencies[currentNode][potentialNextNode] = DIRECT_EDGE_WEIGHT;
            }
        }
    }

    // Compute all-pairs shortest paths using Floyd-Warshall on the constructed graph.
    // This will update 'adjacencies' to contain the shortest path distances.
    calculateAllPairShortestPaths(adjacencies);

    // After computing all shortest paths, check the connectivity condition:
    // For every node 'intermediate' that is reachable from the start node (node 0),
    // it must also be possible to reach the final destination node (totalNodes + 1) from 'intermediate'.
    for (let intermediate = START_INDEX_ZERO; intermediate < effectiveGraphSize; intermediate++) {
        const isReachableFromStart = (adjacencies[START_INDEX_ZERO][intermediate] < UNREACHABLE_NODE_COST);
        const canReachFinalDestination = (adjacencies[intermediate][finalDestinationNodeIndex] < UNREACHABLE_NODE_COST);

        // If a node is reachable from the start but cannot reach the final destination,
        // then the overall connectivity condition is not met.
        if (isReachableFromStart && !canReachFinalDestination) {
            return false; // Path is not feasible
        }
    }

    // If all checks pass, the path is feasible.
    return true;
}

/**
 * Displays the result to the console in a standardized format.
 * @param {boolean} successFlag - True for 'OK', false for 'NG'.
 */
function displayResult(successFlag) {
    console.log(successFlag ? 'OK' : 'NG');
}

// Main processing loop:
// Reads parameters (maxStepValue, totalNodes) and nodeDisplacements from input lines,
// then calls the main evaluation function.
let currentMaxStepValue;
// The loop continues as long as the parsed maxStepValue is not 0 (which signals end of input).
while ((currentMaxStepValue = safeParseInteger(parsedInputLines.shift())) !== START_INDEX_ZERO) {
    // Retrieve the total number of intermediate nodes for the current test case.
    const currentTotalNodes = safeParseInteger(parsedInputLines.shift());

    // Initialize an array to store node displacement values.
    // The problem statement implies d[0] and d[n+1] are 0 for boundary conditions.
    const displacementValues = new Array(currentTotalNodes + 2).fill(START_INDEX_ZERO);

    // Populate displacement values for nodes 1 to `currentTotalNodes`.
    for (let nodeIdx = DIRECT_EDGE_WEIGHT; nodeIdx <= currentTotalNodes; nodeIdx++) {
        displacementValues[nodeIdx] = safeParseInteger(parsedInputLines.shift());
    }

    // Execute the core logic and display the outcome.
    const isFeasible = evaluateConnectivity(currentMaxStepValue, currentTotalNodes, displacementValues);
    displayResult(isFeasible);
}