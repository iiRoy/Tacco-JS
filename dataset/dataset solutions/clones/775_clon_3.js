// This module provides functionalities for analyzing graph shortest paths.
// It reads graph configuration and edge data from standard input,
// computes all-pairs shortest paths using the Floyd-Warshall algorithm,
// and then determines a specific minimum path sum based on given start and target nodes.

// --- Global Input Handling Variables ---
// A buffer to accumulate all incoming data from the standard input stream.
let rawInputAccumulator = '';

// --- Configuration Constants ---
// A symbolic constant to represent an infinite or unreachable distance in the graph.
const INFINITE_PATH_WEIGHT = Infinity;
// The radix for parsing integers from string representations.
const DECIMAL_RADIX = 10;

// --- Standard Input Stream Setup ---
// Resume the standard input stream to ensure it's actively listening for data.
process.stdin.resume();
// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener: triggered when data chunks are received from stdin.
process.stdin.on('data', (inputChunk) => {
    // Append the received data chunk to our accumulator.
    rawInputAccumulator += inputChunk;
});

// Event listener: triggered when the standard input stream has ended (no more data).
process.stdin.on('end', () => {
    // Once all input is collected, split it into an array of lines.
    const parsedInputLines = rawInputAccumulator.split('\n');
    // Initiate the core graph processing logic with the collected lines.
    processGraphScenario(parsedInputLines);
});

// --- Helper Functions ---

/**
 * Safely parses a string into an integer. If parsing fails (e.g., non-numeric string),
 * it returns a specified fallback value instead of NaN.
 * @param {string} stringValue - The string to be parsed.
 * @param {number} [fallbackValue=0] - The default value to return if parsing is unsuccessful.
 * @returns {number} The parsed integer or the fallback value.
 */
function parseStringAsInteger(stringValue, fallbackValue = 0) {
    const numericValue = parseInt(stringValue, DECIMAL_RADIX);
    // Use Number.isNaN for a robust check against NaN.
    return Number.isNaN(numericValue) ? fallbackValue : numericValue;
}

/**
 * Initializes a square 2D array (matrix) representing the distances between nodes in a graph.
 * All diagonal elements (distance from a node to itself) are set to 0.
 * All other elements are set to INFINITE_PATH_WEIGHT, indicating no direct path initially.
 * @param {number} numberOfVertices - The total count of nodes/vertices in the graph.
 * @returns {Array<Array<number>>} A newly created and initialized distance matrix.
 */
function createInitialDistanceMatrix(numberOfVertices) {
    // A graph with zero or negative vertices is not meaningful for pathfinding.
    if (numberOfVertices <= 0) {
        console.error("Error: Graph must have a positive number of vertices.");
        return []; // Return an empty array for invalid input.
    }

    const distanceGrid = new Array(numberOfVertices);
    for (let rowIterator = 0; rowIterator < numberOfVertices; rowIterator++) {
        distanceGrid[rowIterator] = new Array(numberOfVertices);
        for (let colIterator = 0; colIterator < numberOfVertices; colIterator++) {
            // Set distance to self as 0, all others as infinite initially.
            distanceGrid[rowIterator][colIterator] = (rowIterator === colIterator) ? 0 : INFINITE_PATH_WEIGHT;
        }
    }
    return distanceGrid;
}

/**
 * Populates the distance matrix with edge weights provided in the input lines.
 * It assumes a directed graph where an edge (u, v, w) updates d[u-1][v-1].
 * @param {Array<Array<number>>} currentGraphMatrix - The distance matrix to be updated.
 * @param {Array<string>} edgeInputLines - An array of strings, each describing an edge.
 * @param {number} expectedEdgeCount - The total number of edges to read from input.
 * @param {number} totalVertexCount - The total number of vertices in the graph for bounds checking.
 */
function loadGraphEdgeData(currentGraphMatrix, edgeInputLines, expectedEdgeCount, totalVertexCount) {
    // Edge data starts from the second line of the input (index 1).
    for (let edgeCounter = 0; edgeCounter < expectedEdgeCount; edgeCounter++) {
        const currentEdgeLine = edgeInputLines[edgeCounter + 1]; // +1 to skip the configuration line.

        // Skip if the line is empty or undefined.
        if (!currentEdgeLine || currentEdgeLine.trim() === '') {
            console.warn(`Warning: Missing or empty edge data on line ${edgeCounter + 2}. Skipping.`);
            continue;
        }

        const edgeParts = currentEdgeLine.split(' ');

        // Validate the format of the edge data.
        if (edgeParts.length < 3) {
            console.warn(`Warning: Malformed edge entry on line ${edgeCounter + 2}. Expected 3 components (source, dest, weight), got ${edgeParts.length}. Skipping.`);
            continue;
        }

        // Parse node indices and weight, adjusting for 0-based indexing.
        const sourceNodeZeroBased = parseStringAsInteger(edgeParts[0]) - 1;
        const destinationNodeZeroBased = parseStringAsInteger(edgeParts[1]) - 1;
        const edgeWeightValue = parseStringAsInteger(edgeParts[2]);

        // Validate that parsed node indices are within graph bounds and weight is non-negative.
        if (sourceNodeZeroBased < 0 || sourceNodeZeroBased >= totalVertexCount ||
            destinationNodeZeroBased < 0 || destinationNodeZeroBased >= totalVertexCount ||
            edgeWeightValue < 0) { // Edge weights are typically non-negative for Floyd-Warshall.
            console.warn(`Warning: Invalid edge parameters detected: source=${sourceNodeZeroBased + 1}, dest=${destinationNodeZeroBased + 1}, weight=${edgeWeightValue} on line ${edgeCounter + 2}. Skipping.`);
            continue;
        }

        // Update the distance matrix with the new edge weight.
        // If multiple edges exist between the same two nodes, the last one read will overwrite previous ones.
        currentGraphMatrix[sourceNodeZeroBased][destinationNodeZeroBased] = edgeWeightValue;
    }
}

/**
 * Applies the Floyd-Warshall algorithm to compute all-pairs shortest paths.
 * This function modifies the provided distance matrix in place.
 * @param {Array<Array<number>>} shortestPathMatrix - The matrix to be updated with shortest paths.
 * @param {number} graphSize - The total number of vertices in the graph.
 */
function computeAllPairsShortestPaths(shortestPathMatrix, graphSize) {
    // If the graph has 0 or 1 node, all shortest paths are already trivial.
    if (graphSize <= 1) {
        return;
    }

    // k: The intermediate vertex that can be used in the path.
    for (let intermediateVertexK = 0; intermediateVertexK < graphSize; intermediateVertexK++) {
        // i: The starting vertex of the path.
        for (let sourceVertexI = 0; sourceVertexI < graphSize; sourceVertexI++) {
            // j: The ending vertex of the path.
            for (let destinationVertexJ = 0; destinationVertexJ < graphSize; destinationVertexJ++) {
                // Calculate the distance if we go from i to k, then k to j.
                // We must ensure that both segments (i->k and k->j) are reachable.
                const distanceThroughIntermediate = shortestPathMatrix[sourceVertexI][intermediateVertexK] + shortestPathMatrix[intermediateVertexK][destinationVertexJ];

                // If the path through k is shorter than the currently known shortest path from i to j, update it.
                if (distanceThroughIntermediate < shortestPathMatrix[sourceVertexI][destinationVertexJ]) {
                    shortestPathMatrix[sourceVertexI][destinationVertexJ] = distanceThroughIntermediate;
                }
            }
        }
    }
}

/**
 * Calculates the minimum total distance for a specific path requirement:
 * from a starting node to an intermediate node, then from that intermediate node
 * to a first target, and finally from the same intermediate node to a second target.
 * @param {Array<Array<number>>} finalDistanceMatrix - The matrix containing all-pairs shortest paths.
 * @param {number} initialSourceIdx - The 0-indexed starting node.
 * @param {number} primaryTargetIdx - The 0-indexed first goal node.
 * @param {number} secondaryTargetIdx - The 0-indexed second goal node.
 * @param {number} totalGraphNodes - The total count of nodes in the graph.
 * @returns {number} The minimum calculated path sum, or INFINITE_PATH_WEIGHT if no valid path exists.
 */
function determineMinimumCombinedPath(finalDistanceMatrix, initialSourceIdx, primaryTargetIdx, secondaryTargetIdx, totalGraphNodes) {
    let overallMinimumPathSum = INFINITE_PATH_WEIGHT;

    // Iterate through all possible nodes to serve as the common intermediate point.
    for (let commonIntermediateNode = 0; commonIntermediateNode < totalGraphNodes; commonIntermediateNode++) {
        // Retrieve the distances for the three required path segments.
        const segmentFromSourceToIntermediate = finalDistanceMatrix[initialSourceIdx][commonIntermediateNode];
        const segmentFromIntermediateToPrimary = finalDistanceMatrix[commonIntermediateNode][primaryTargetIdx];
        const segmentFromIntermediateToSecondary = finalDistanceMatrix[commonIntermediateNode][secondaryTargetIdx];

        // Only consider paths where all three segments are reachable (not infinite).
        if (segmentFromSourceToIntermediate !== INFINITE_PATH_WEIGHT &&
            segmentFromIntermediateToPrimary !== INFINITE_PATH_WEIGHT &&
            segmentFromIntermediateToSecondary !== INFINITE_PATH_WEIGHT) {

            // Calculate the total sum for the current intermediate node.
            const currentPathTotal = segmentFromSourceToIntermediate + segmentFromIntermediateToPrimary + segmentFromIntermediateToSecondary;

            // Update the overall minimum if this path is shorter.
            if (currentPathTotal < overallMinimumPathSum) {
                overallMinimumPathSum = currentPathTotal;
            }
        }
    }
    return overallMinimumPathSum;
}

/**
 * The main orchestrator function that processes the entire graph scenario.
 * It handles input parsing, graph initialization, shortest path computation,
 * and the final calculation of the required minimum path sum.
 * @param {Array<string>} allInputLines - An array of strings, each representing a line from standard input.
 */
function processGraphScenario(allInputLines) {
    // --- Input Validation: Basic structural checks ---
    if (!allInputLines || allInputLines.length === 0 || allInputLines[0].trim() === '') {
        console.error("Critical Error: No input data found or the first line is empty. Cannot proceed.");
        return;
    }

    // Parse the first line which contains graph configuration (N, M, S, G1, G2).
    const configurationElements = allInputLines[0].split(' ');

    // Validate the number of configuration parameters.
    if (configurationElements.length < 5) {
        console.error(`Critical Error: Insufficient configuration parameters on the first line. Expected 5, received ${configurationElements.length}.`);
        return;
    }

    // --- Parameter Parsing and Initial Validation ---
    const totalNodeCount = parseStringAsInteger(configurationElements[0]);
    const totalEdgeCount = parseStringAsInteger(configurationElements[1]);
    // Adjust 1-based input indices to 0-based for array access.
    const startNodeIndex = parseStringAsInteger(configurationElements[2]) - 1;
    const firstGoalNodeIndex = parseStringAsInteger(configurationElements[3]) - 1;
    const secondGoalNodeIndex = parseStringAsInteger(configurationElements[4]) - 1;

    // Validate the parsed graph dimensions.
    if (totalNodeCount <= 0 || totalEdgeCount < 0) {
        console.error(`Critical Error: Invalid graph dimensions. Node count: ${totalNodeCount}, Edge count: ${totalEdgeCount}.`);
        return;
    }
    // Validate the parsed node indices against the total node count.
    if (startNodeIndex < 0 || startNodeIndex >= totalNodeCount ||
        firstGoalNodeIndex < 0 || firstGoalNodeIndex >= totalNodeCount ||
        secondGoalNodeIndex < 0 || secondGoalNodeIndex >= totalNodeCount) {
        console.error(`Critical Error: One or more specified node indices are out of bounds for a graph with ${totalNodeCount} nodes. Input indices (1-based): S=${startNodeIndex + 1}, G1=${firstGoalNodeIndex + 1}, G2=${secondGoalNodeIndex + 1}.`);
        return;
    }

    // --- Graph Initialization ---
    // Create the adjacency matrix and initialize distances.
    const graphDistanceMatrix = createInitialDistanceMatrix(totalNodeCount);
    // If matrix creation failed due to invalid dimensions, exit.
    if (graphDistanceMatrix.length === 0 && totalNodeCount > 0) {
        return;
    }

    // --- Edge Data Loading ---
    // Populate the distance matrix with edge weights from the input lines.
    loadGraphEdgeData(graphDistanceMatrix, allInputLines, totalEdgeCount, totalNodeCount);

    // --- All-Pairs Shortest Path Computation ---
    // Execute the Floyd-Warshall algorithm to find all shortest paths.
    computeAllPairsShortestPaths(graphDistanceMatrix, totalNodeCount);

    // --- Final Path Sum Calculation ---
    // Calculate the required minimum path sum using the computed shortest paths.
    const finalCalculatedPathValue = determineMinimumCombinedPath(
        graphDistanceMatrix,
        startNodeIndex,
        firstGoalNodeIndex,
        secondGoalNodeIndex,
        totalNodeCount
    );

    // --- Output Result ---
    // Print the final result to standard output.
    console.log(finalCalculatedPathValue);
}