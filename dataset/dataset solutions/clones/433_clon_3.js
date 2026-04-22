const UNREACHABLE_DISTANCE = Infinity;
const MAX_GRAPH_NODES_CAPACITY = 101; 

/**
 * Converts a string line into an array of numeric values.
 * This function handles trimming whitespace and parsing each segment as a number.
 * @param {string} lineContent The string content of a single line from the input.
 * @returns {number[]} An array containing the numbers extracted from the line.
 */
function extractNumericValues(lineContent) {
    return lineContent.trim().split(" ").map(Number);
}

/**
 * Adjusts a 1-based index (common in problem statements) to a 0-based index (for array access).
 * @param {number} oneBasedIndex The original 1-based index.
 * @returns {number} The corresponding 0-based index.
 */
function getZeroBasedIndex(oneBasedIndex) {
    return oneBasedIndex - 1;
}

/**
 * Computes all-pairs shortest paths using a variant of the Floyd-Warshall algorithm.
 * This version simultaneously updates two distinct matrices, representing different metrics
 * (e.g., minimum cost and minimum time) for paths between nodes.
 *
 * @param {number} totalActiveNodes The actual number of nodes participating in the current graph instance.
 * @param {number[][]} minPathCostMatrix The 2D array storing the minimum costs between any two nodes.
 * @param {number[][]} minPathTimeMatrix The 2D array storing the minimum times between any two nodes.
 */
function calculateOptimalGraphPaths(totalActiveNodes, minPathCostMatrix, minPathTimeMatrix) {
    // The algorithm iterates through all possible nodes to consider them as intermediate points
    // on a path between any two other nodes.
    for (let intermediateNode = 0; intermediateNode < totalActiveNodes; intermediateNode++) {
        // For every possible starting node in the graph.
        for (let startNode = 0; startNode < totalActiveNodes; startNode++) {
            // For every possible ending node in the graph.
            for (let endNode = 0; endNode < totalActiveNodes; endNode++) {
                // --- Update for Cost Matrix ---
                // Calculate the cost of going from 'startNode' to 'endNode' via 'intermediateNode'.
                const costThroughIntermediate = minPathCostMatrix[startNode][intermediateNode] + minPathCostMatrix[intermediateNode][endNode];
                // If this new path is cheaper than the currently known shortest path, update it.
                if (costThroughIntermediate < minPathCostMatrix[startNode][endNode]) {
                    minPathCostMatrix[startNode][endNode] = costThroughIntermediate;
                }

                // --- Update for Time Matrix ---
                // Calculate the time taken to go from 'startNode' to 'endNode' via 'intermediateNode'.
                const timeThroughIntermediate = minPathTimeMatrix[startNode][intermediateNode] + minPathTimeMatrix[intermediateNode][endNode];
                // If this new path is faster than the currently known shortest path, update it.
                if (timeThroughIntermediate < minPathTimeMatrix[startNode][endNode]) {
                    minPathTimeMatrix[startNode][endNode] = timeThroughIntermediate;
                }
            }
        }
    }
}

// Read the entire standard input content as a single string.
const rawInputDataString = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the input string into an array of individual lines, removing any leading/trailing whitespace from the whole input.
const inputLinesArray = rawInputDataString.trim().split("\n");

let currentLineIndex = 0; // A pointer to keep track of which line in `inputLinesArray` is being processed.

// Main loop to handle multiple test cases present in the input.
// Each iteration processes one graph configuration and its queries.
while (true) {
    // Read the first line of a test case, which contains the number of nodes (N) and edges (M).
    const networkDimensions = extractNumericValues(inputLinesArray[currentLineIndex++]);
    const [numNodesInGraph, numEdgesInGraph] = networkDimensions;

    // Check for the termination condition: N=0 and M=0 indicates the end of input.
    if (numNodesInGraph === 0 && numEdgesInGraph === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize two square matrices, each of size MAX_GRAPH_NODES_CAPACITY x MAX_GRAPH_NODES_CAPACITY.
    // One matrix tracks minimum costs, the other tracks minimum times.
    let minPathCostMatrix = [];
    let minPathTimeMatrix = [];

    // Populate the matrices with initial values:
    // - Distance from a node to itself is 0.
    // - Distance between distinct nodes is initially UNREACHABLE_DISTANCE (Infinity).
    for (let rowIterator = 0; rowIterator < MAX_GRAPH_NODES_CAPACITY; rowIterator++) {
        minPathCostMatrix[rowIterator] = [];
        minPathTimeMatrix[rowIterator] = [];
        for (let colIterator = 0; colIterator < MAX_GRAPH_NODES_CAPACITY; colIterator++) {
            if (rowIterator === colIterator) {
                // Path from a node to itself has zero cost and time.
                minPathCostMatrix[rowIterator][colIterator] = 0;
                minPathTimeMatrix[rowIterator][colIterator] = 0;
            } else {
                // Initialize all other paths as unreachable.
                minPathCostMatrix[rowIterator][colIterator] = UNREACHABLE_DISTANCE;
                minPathTimeMatrix[rowIterator][colIterator] = UNREACHABLE_DISTANCE;
            }
        }
    }

    // Read and apply the initial edge information (direct connections) to the matrices.
    // There are 'numEdgesInGraph' lines, each describing a directed edge.
    for (let edgeCounter = 0; edgeCounter < numEdgesInGraph; edgeCounter++) {
        const currentEdgeData = extractNumericValues(inputLinesArray[currentLineIndex++]);
        // Destructure the edge data into its components for better readability.
        const [sourceNodeOneBased, destinationNodeOneBased, edgeCostValue, edgeTimeValue] = currentEdgeData;

        // Convert 1-based node indices from input to 0-based for array access.
        const sourceNodeZeroBased = getZeroBasedIndex(sourceNodeOneBased);
        const destinationNodeZeroBased = getZeroBasedIndex(destinationNodeOneBased);

        // Update the matrices with the direct edge costs and times.
        minPathCostMatrix[sourceNodeZeroBased][destinationNodeZeroBased] = edgeCostValue;
        minPathTimeMatrix[sourceNodeZeroBased][destinationNodeZeroBased] = edgeTimeValue;
    }

    // After initializing the matrices with direct edges, run the Floyd-Warshall algorithm
    // to find all-pairs shortest paths considering all possible intermediate nodes.
    calculateOptimalGraphPaths(numNodesInGraph, minPathCostMatrix, minPathTimeMatrix);

    // Read the number of queries that follow for the current test case.
    const numberOfQueriesForThisGraph = Number(inputLinesArray[currentLineIndex++]);

    // Process each query and output the requested shortest path value.
    for (let queryCounter = 0; queryCounter < numberOfQueriesForThisGraph; queryCounter++) {
        const queryDetails = extractNumericValues(inputLinesArray[currentLineIndex++]);
        // Destructure query details: start node, end node, and the type of query (0 for cost, 1 for time).
        const [queryStartNodeOneBased, queryEndNodeOneBased, queryTypeIdentifier] = queryDetails;

        // Convert query node indices to 0-based.
        const queryStartNodeZeroBased = getZeroBasedIndex(queryStartNodeOneBased);
        const queryEndNodeZeroBased = getZeroBasedIndex(queryEndNodeOneBased);

        // Based on the query type, print either the minimum cost or minimum time.
        if (queryTypeIdentifier === 0) { // If the query is for minimum cost.
            console.log(minPathCostMatrix[queryStartNodeZeroBased][queryEndNodeZeroBased]);
        } else if (queryTypeIdentifier === 1) { // If the query is for minimum time.
            console.log(minPathTimeMatrix[queryStartNodeZeroBased][queryEndNodeZeroBased]);
        }
        // No explicit handling for other queryTypeIdentifier values, assuming valid input.
    }
}