// Helper constant for representing unreachable paths
const UNREACHABLE_PATH_INDICATOR = Infinity;

/**
 * Calculates all-pairs shortest paths for two distinct matrices (e.g., cost and time)
 * using the Floyd-Warshall algorithm.
 * This function modifies the input matrices in place.
 *
 * @param {Array<Array<number>>} costMap - The adjacency matrix for costs.
 * @param {Array<Array<number>>} timeMap - The adjacency matrix for times.
 * @param {number} graphNodeCount - The total number of nodes in the graph.
 */
function calculateAllPairsShortestPaths(costMap, timeMap, graphNodeCount) {
    // Basic validation for input parameters
    if (!costMap || !timeMap || graphNodeCount <= 0 || costMap.length !== graphNodeCount || timeMap.length !== graphNodeCount) {
        console.error("Invalid input matrices or node count for path calculation.");
        return; // Exit if inputs are not valid
    }

    // Iterate through all possible intermediate nodes 'viaNode'
    for (let viaNode = 0; viaNode < graphNodeCount; viaNode++) {
        // Iterate through all possible source nodes 'startNode'
        for (let startNode = 0; startNode < graphNodeCount; startNode++) {
            // Iterate through all possible destination nodes 'endNode'
            for (let endNode = 0; endNode < graphNodeCount; endNode++) {
                // Calculate potential new path costs via 'viaNode'
                const potentialNewCost = costMap[startNode][viaNode] + costMap[viaNode][endNode];
                const potentialNewTime = timeMap[startNode][viaNode] + timeMap[viaNode][endNode];

                // Update cost map if a shorter path is found
                if (potentialNewCost < costMap[startNode][endNode]) {
                    costMap[startNode][endNode] = potentialNewCost;
                }

                // Update time map if a shorter path is found
                if (potentialNewTime < timeMap[startNode][endNode]) {
                    timeMap[startNode][endNode] = potentialNewTime;
                }
            }
        }
    }
}

// Read raw input data from standard input
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split the content into individual lines and remove any leading/trailing whitespace
const inputLines = rawInputContent.trim().split("\n");

// A simple utility to consume lines from the input array
let currentLinePointer = 0;
const fetchNextLine = () => {
    if (currentLinePointer >= inputLines.length) {
        return null; // Indicate no more lines
    }
    return inputLines[currentLinePointer++];
};

// Helper to initialize an N x N matrix with default values
const createInitializedMatrix = (size, defaultValue = UNREACHABLE_PATH_INDICATOR) => {
    const matrix = Array(size).fill(null).map(() => Array(size).fill(defaultValue));
    // Set diagonal elements to 0 (cost/time to self is zero)
    for (let diagIdx = 0; diagIdx < size; diagIdx++) {
        matrix[diagIdx][diagIdx] = 0;
    }
    return matrix;
};

// Helper to format output results
const formatResultForDisplay = (value) => {
    return value === UNREACHABLE_PATH_INDICATOR ? "NO_PATH" : value;
};


// Main processing loop for multiple graph configurations
while (true) {
    const networkConfigLine = fetchNextLine();
    if (networkConfigLine === null) {
        // No more input lines, gracefully exit
        break;
    }

    // Parse the number of nodes and edges for the current graph
    const [nodeCount, edgeCount] = networkConfigLine.split(" ").map(Number);

    // Check for termination condition: 0 0 indicates end of input set
    if (nodeCount === 0 && edgeCount === 0) {
        break;
    }

    // Input validation for node and edge counts
    if (isNaN(nodeCount) || isNaN(edgeCount) || nodeCount < 0 || edgeCount < 0) {
        console.error(`Invalid network configuration: ${networkConfigLine}. Skipping this set.`);
        // Optionally, could break here depending on desired error handling
        continue;
    }

    // Initialize the distance and time matrices for the current graph
    let travelCostMatrix = createInitializedMatrix(nodeCount);
    let travelTimeMatrix = createInitializedMatrix(nodeCount);

    // Populate the matrices with initial edge data
    for (let e = 0; e < edgeCount; e++) {
        const edgeDefinitionLine = fetchNextLine();
        if (edgeDefinitionLine === null) {
            console.error("Unexpected end of input while reading edges.");
            // Handle error, maybe break or continue to next dataset
            break;
        }

        const [sourceNode, destinationNode, directCost, directTime] = edgeDefinitionLine.split(" ").map(Number);

        // Input validation for edge details
        if (isNaN(sourceNode) || isNaN(destinationNode) || isNaN(directCost) || isNaN(directTime) ||
            sourceNode < 1 || sourceNode > nodeCount || destinationNode < 1 || destinationNode > nodeCount ||
            directCost < 0 || directTime < 0) {
            console.warn(`Skipping invalid edge definition: ${edgeDefinitionLine}`);
            continue; // Skip this malformed edge
        }

        // Adjust to 0-based indexing for matrix access
        const u = sourceNode - 1;
        const v = destinationNode - 1;

        // Update matrices with direct edge values
        travelCostMatrix[u][v] = directCost;
        travelTimeMatrix[u][v] = directTime;
    }

    // Execute the Floyd-Warshall algorithm to find all-pairs shortest paths
    calculateAllPairsShortestPaths(travelCostMatrix, travelTimeMatrix, nodeCount);

    // Read the number of queries for the current graph
    const queryCountLine = fetchNextLine();
    if (queryCountLine === null) {
        console.error("Unexpected end of input while reading query count.");
        break;
    }
    const numQueries = Number(queryCountLine);

    if (isNaN(numQueries) || numQueries < 0) {
        console.error(`Invalid number of queries: ${queryCountLine}. Skipping queries for this set.`);
        continue;
    }

    // Process each query
    for (let q = 0; q < numQueries; q++) {
        const queryDetailsLine = fetchNextLine();
        if (queryDetailsLine === null) {
            console.error("Unexpected end of input while reading query details.");
            break;
        }

        const [queryStartNode, queryEndNode, queryType] = queryDetailsLine.split(" ").map(Number);

        // Input validation for query details
        if (isNaN(queryStartNode) || isNaN(queryEndNode) || isNaN(queryType) ||
            queryStartNode < 1 || queryStartNode > nodeCount || queryEndNode < 1 || queryEndNode > nodeCount ||
            (queryType !== 0 && queryType !== 1)) {
            console.warn(`Skipping invalid query: ${queryDetailsLine}`);
            console.log(formatResultForDisplay(UNREACHABLE_PATH_INDICATOR)); // Indicate an issue for the query
            continue;
        }

        // Adjust to 0-based indexing
        const startIdx = queryStartNode - 1;
        const endIdx = queryEndNode - 1;

        let queryResult;
        // Determine which matrix to query based on queryType (0 for cost, 1 for time)
        if (queryType === 0) {
            queryResult = travelCostMatrix[startIdx][endIdx];
        } else { // queryType === 1
            queryResult = travelTimeMatrix[startIdx][endIdx];
        }

        // Output the formatted result
        console.log(formatResultForDisplay(queryResult));
    }
}