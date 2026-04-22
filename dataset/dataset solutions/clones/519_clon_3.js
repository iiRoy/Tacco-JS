const fileSystemModule = require('fs');

// Define constants for clarity and potential future modification
const POSITIVE_INFINITY_VALUE = Number.POSITIVE_INFINITY;
const DEFAULT_EDGE_WEIGHT = 1; // Standard weight for connections in the graph

// --- Input Data Management ---
let fullInputContent;
try {
    // Attempt to read all data from standard input synchronously
    fullInputContent = fileSystemModule.readFileSync(process.stdin.fd, 'utf8');
} catch (readError) {
    // Log error and terminate if input stream cannot be accessed
    console.error("Critical: Unable to read standard input. Details:", readError.message);
    process.exit(1);
}

// Split the input into an array of lines, discarding any empty lines
const inputLinesArray = fullInputContent.split('\n').filter(line => line.trim() !== '');

let currentInputLinePointer = 0; // Tracks the current line being processed from inputLinesArray

/**
 * Safely retrieves and parses the next integer from the input lines.
 * Throws an error if input is exhausted or parsing fails.
 * @returns {number} The parsed integer value.
 */
const consumeNextInteger = () => {
    if (currentInputLinePointer >= inputLinesArray.length) {
        throw new Error("Input exhausted unexpectedly. More data was expected.");
    }
    const lineContent = inputLinesArray[currentInputLinePointer++];
    const numericValue = parseInt(lineContent, 10);

    if (isNaN(numericValue)) {
        throw new Error(`Invalid numeric format encountered on line ${currentInputLinePointer}: "${lineContent}"`);
    }
    return numericValue;
};

// --- Graph and Algorithm Utilities ---

/**
 * Generates a 2D array (matrix) initialized with a specific value.
 * @param {number} numRows - The number of rows in the grid.
 * @param {number} numCols - The number of columns in the grid.
 * @param {*} initialCellVal - The value to set for every cell.
 * @returns {Array<Array<*>>} A newly created 2D array.
 */
function initializeTwoDimensionalArray(numRows, numCols, initialCellVal) {
    // Basic validation for dimensions
    if (numRows <= 0 || numCols <= 0) {
        return []; // Return an empty array for invalid dimensions
    }
    // Use Array.from for a more functional approach to 2D array creation
    const grid = Array.from({ length: numRows }, () => Array(numCols).fill(initialCellVal));
    return grid;
}

/**
 * Executes Dijkstra's algorithm to find the shortest paths from a single source node
 * to all other nodes in a given graph.
 * @param {Array<Array<number>>} graphAdjacencyMatrix - The graph represented by its adjacency matrix.
 * @param {number} startNodeIdentifier - The index of the starting node.
 * @returns {Array<number>} An array where `distances[i]` is the shortest path length from `startNodeIdentifier` to node `i`.
 */
function calculateMinimumDistances(graphAdjacencyMatrix, startNodeIdentifier) {
    const totalVertexCount = graphAdjacencyMatrix.length;
    const distances = new Array(totalVertexCount).fill(POSITIVE_INFINITY_VALUE);
    const visitedStatus = new Array(totalVertexCount).fill(false);

    distances[startNodeIdentifier] = 0; // Distance to itself is zero

    // Iterate up to V-1 times, where V is the number of vertices, as a shortest path won't have more edges.
    for (let iterationCount = 0; iterationCount < totalVertexCount - 1; ++iterationCount) {
        let nodeWithMinDistance = -1; // Placeholder for the unvisited node with the smallest distance

        // Discover the unvisited node with the current minimum distance
        for (let vertexIndex = 0; vertexIndex < totalVertexCount; ++vertexIndex) {
            if (!visitedStatus[vertexIndex] && (nodeWithMinDistance === -1 || distances[vertexIndex] < distances[nodeWithMinDistance])) {
                nodeWithMinDistance = vertexIndex;
            }
        }

        // If no reachable unvisited node is found, terminate early
        if (nodeWithMinDistance === -1 || distances[nodeWithMinDistance] === POSITIVE_INFINITY_VALUE) {
            break;
        }

        visitedStatus[nodeWithMinDistance] = true; // Mark the node as processed

        // Update distances for all adjacent nodes (relaxation step)
        for (let adjacentNodeIndex = 0; adjacentNodeIndex < totalVertexCount; ++adjacentNodeIndex) {
            const edgeWeight = graphAdjacencyMatrix[nodeWithMinDistance][adjacentNodeIndex];

            // Check if there's an actual edge and if the adjacent node hasn't been visited yet
            if (edgeWeight !== POSITIVE_INFINITY_VALUE && !visitedStatus[adjacentNodeIndex]) {
                const potentialNewDistance = distances[nodeWithMinDistance] + edgeWeight;
                // If a shorter path is discovered, update the distance
                if (potentialNewDistance < distances[adjacentNodeIndex]) {
                    distances[adjacentNodeIndex] = potentialNewDistance;
                }
            }
        }
    }
    return distances;
}

/**
 * Determines if a specific connectivity pattern exists within a generated graph.
 * This function builds a graph based on jump limits and offsets, then uses Dijkstra's
 * to verify reachability.
 * @param {number} maxPossibleJump - The upper bound for jump distances.
 * @param {number} coreElementCount - The number of primary elements (referred to as 'n' in problem context).
 * @param {Array<number>} elementJumpOffsets - An array containing offset values for each element.
 * @returns {boolean} True if the required connectivity is met, false otherwise.
 */
function checkRequiredNetworkPaths(maxPossibleJump, coreElementCount, elementJumpOffsets) {
    // The graph includes nodes from 0 to coreElementCount + 1.
    // Thus, the total number of nodes is coreElementCount + 2.
    const networkGraphSize = coreElementCount + 2;
    const networkGraph = initializeTwoDimensionalArray(networkGraphSize, networkGraphSize, POSITIVE_INFINITY_VALUE);

    // Construct the graph by adding edges based on jump rules
    for (let sourceNode = 0; sourceNode <= coreElementCount; ++sourceNode) {
        // Iterate through all possible jump distances, from 0 up to (maxPossibleJump - 1)
        // This matches the original code's loop behavior for 'j'.
        for (let jumpDistance = 0; jumpDistance < maxPossibleJump; ++jumpDistance) {
            const offsetLookupIndex = sourceNode + jumpDistance;
            let currentOffsetValue = 0; // Default offset if index is out of bounds

            // Safely retrieve the offset value, treating out-of-bounds as 0
            if (offsetLookupIndex >= 0 && offsetLookupIndex < elementJumpOffsets.length) {
                currentOffsetValue = elementJumpOffsets[offsetLookupIndex];
            }
            // Ensure the offset value is a valid number
            if (typeof currentOffsetValue !== 'number' || isNaN(currentOffsetValue)) {
                currentOffsetValue = 0;
            }

            // Calculate the raw target node index before clamping
            const potentialTargetNodeRaw = sourceNode + jumpDistance + currentOffsetValue;
            
            // Clamp the target node index to ensure it stays within graph boundaries [0, networkGraphSize - 1]
            const finalTargetNode = Math.min(Math.max(potentialTargetNodeRaw, 0), networkGraphSize - 1);

            // Add a directed edge if the source and target nodes are distinct
            // Only add if an edge doesn't already exist or if this is a better path (though all weights are 1)
            if (finalTargetNode !== sourceNode && networkGraph[sourceNode][finalTargetNode] === POSITIVE_INFINITY_VALUE) {
                networkGraph[sourceNode][finalTargetNode] = DEFAULT_EDGE_WEIGHT;
            }
        }
    }

    // Phase 1: Verify reachability from the initial starting point (node 0) to the final destination (node coreElementCount + 1)
    const pathsFromInitialStart = calculateMinimumDistances(networkGraph, 0);
    const ultimateDestinationNode = coreElementCount + 1;

    if (pathsFromInitialStart[ultimateDestinationNode] === POSITIVE_INFINITY_VALUE) {
        return false; // The final destination is unreachable from the start
    }

    // Phase 2: For every intermediate node reachable from the initial start (nodes 1 to coreElementCount),
    // confirm that the final destination is also reachable from that intermediate node.
    for (let intermediateNode = 1; intermediateNode <= coreElementCount; ++intermediateNode) {
        // Only perform this check if the intermediate node itself is reachable from the initial start
        if (pathsFromInitialStart[intermediateNode] < POSITIVE_INFINITY_VALUE) {
            const distancesFromIntermediate = calculateMinimumDistances(networkGraph, intermediateNode);
            if (distancesFromIntermediate[ultimateDestinationNode] === POSITIVE_INFINITY_VALUE) {
                return false; // Found a reachable intermediate node from which the end is unreachable
            }
        }
    }

    return true; // All connectivity conditions are satisfied
}


// --- Main Program Loop ---
let maxJumpSetting;
let numElements;

try {
    // Loop continues as long as the first input value (maxJumpSetting) is not zero
    while (true) {
        maxJumpSetting = consumeNextInteger();
        if (maxJumpSetting === 0) {
            break; // Exit condition for the main loop
        }

        numElements = consumeNextInteger();

        // Initialize the array for jump offsets. It needs space for nodes 0 through numElements + 1.
        const elementJumpOffsets = new Array(numElements + 2);
        elementJumpOffsets[0] = 0; // Special offset for the starting node
        elementJumpOffsets[numElements + 1] = 0; // Special offset for the ending node

        // Populate jump offsets for the core elements (nodes 1 to numElements)
        for (let i = 1; i <= numElements; ++i) {
            elementJumpOffsets[i] = consumeNextInteger();
        }

        // Execute the connectivity check and output the result
        const connectivityResult = checkRequiredNetworkPaths(maxJumpSetting, numElements, elementJumpOffsets);
        console.log(connectivityResult ? 'OK' : 'NG');
    }
} catch (runtimeError) {
    // Catch and report any errors that occur during the main processing loop
    console.error("Runtime Error during problem processing:", runtimeError.message);
    // console.error(runtimeError.stack); // Uncomment for full stack trace debugging
    process.exit(1); // Terminate with an error code
}