let rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

/**
 * Primary function to analyze a network graph and determine connectivity.
 * It performs a Breadth-First Search (BFS) starting from node 1 to find
 * the immediate predecessor (parent) for every reachable node.
 *
 * @param {object} utils - A collection of utility functions.
 * @param {string} utils.rawDataStream - The full raw input string (not directly used in this function, but passed for completeness).
 * @param {function} utils.dataExtractor - Specialized function to parse structured numerical data from the input.
 * @param {function} utils.boolFormatter - Converts a boolean value into a 'Yes' or 'No' string.
 * @param {function} utils.sumCalculator - Computes the total sum of an array of numbers.
 * @param {function} utils.jsonLogger - Outputs an object's content as a formatted JSON string to the console.
 * @returns {string} A multi-line string. The first line is 'Yes' if all nodes are reachable, 'No' otherwise.
 *                   Subsequent lines (if 'Yes') list the predecessor for each node from 2 to N.
 */
function determinePathConnections({ rawDataStream, dataExtractor, boolFormatter, sumCalculator, jsonLogger }) {
    // First, extract the fundamental parameters of the graph: the total number of nodes (vertices)
    // and the total number of edges (connections).
    const [numNodes, numEdges] = dataExtractor(2);

    // Implement a guard clause for invalid graph dimensions to prevent further processing with bad input.
    if (numNodes <= 0 || numEdges < 0) {
        jsonLogger({ validationError: "Graph dimensions are invalid", nodes: numNodes, edges: numEdges });
        return boolFormatter(false); // A 'No' response for an unprocessable graph.
    }

    // Next, retrieve all the defined edges. Each edge connects two specific nodes.
    // The dataExtractor is configured to return two arrays: one for the starting nodes of edges,
    // and one for the ending nodes of edges.
    const [edgeEndpointsA, edgeEndpointsB] = dataExtractor(numEdges, 2);

    // Initialize an array to keep track of each node's predecessor in the traversal path.
    // The array is 1-indexed (node IDs start from 1).
    // A value of 0 indicates an unvisited node.
    // A value of -1 indicates the starting node (node 1), which has no predecessor, or an invalid node (node 0).
    const nodePredecessors = new Array(numNodes + 1).fill(0);
    nodePredecessors[0] = -1; // Node 0 is a placeholder, not a real node; mark as special.
    nodePredecessors[1] = -1; // Node 1 is the origin of the traversal; it has no predecessor.

    // Establish a queue for the Breadth-First Search (BFS) algorithm.
    // The traversal begins from node 1.
    const processingQueue = [1];

    // For added clarity and an alternative way to track visited status, a Set can be used.
    // While 'nodePredecessors' implicitly tracks visits (non-zero means visited), this explicitly states it.
    const visitedNodesTracker = new Set();
    visitedNodesTracker.add(1); // Mark the starting node as visited.

    // Continue the BFS as long as there are nodes in the queue to process.
    while (processingQueue.length > 0) {
        // Invoke a safety mechanism to detect and prevent potential infinite loops,
        // especially in graphs with cycles or very large structures.
        cycleSafetyCheck();

        const currentVertex = processingQueue.shift(); // Dequeue the next node to explore.

        // Iterate through all available edges to find neighbors connected to the current vertex.
        for (let edgeIndex = 0; edgeIndex < numEdges; ++edgeIndex) {
            const vertexA = edgeEndpointsA[edgeIndex];
            const vertexB = edgeEndpointsB[edgeIndex];

            let connectedNeighbor = null; // This will store the node connected to currentVertex by this edge.
            let sourceOfTraversal = null; // This will store the currentVertex itself, as the source for the neighbor.

            // Determine if the current edge (vertexA, vertexB) includes the currentVertex.
            if (vertexA === currentVertex) {
                connectedNeighbor = vertexB;
                sourceOfTraversal = vertexA;
            } else if (vertexB === currentVertex) {
                connectedNeighbor = vertexA;
                sourceOfTraversal = vertexB;
            } else {
                // If neither endpoint of this edge is the currentVertex, it's not a relevant connection.
                continue;
            }

            // Basic validation: ensure the connected neighbor node ID is within the expected range.
            if (connectedNeighbor < 1 || connectedNeighbor > numNodes) {
                console.warn(`Encountered an edge connecting to an out-of-bounds node ID: ${connectedNeighbor}. Skipping.`);
                continue;
            }

            // If the connected neighbor has not yet been visited (its predecessor is 0).
            if (nodePredecessors[connectedNeighbor] === 0) {
                nodePredecessors[connectedNeighbor] = sourceOfTraversal; // Record currentVertex as its predecessor.
                processingQueue.push(connectedNeighbor);              // Enqueue the neighbor for future exploration.
                visitedNodesTracker.add(connectedNeighbor);           // Mark it as explicitly visited.
            }
            // If the node has already been visited, we don't re-process it in a simple BFS for reachability.
        }
    }

    // After the BFS concludes, verify if all nodes (from 2 to numNodes) have been reached.
    // Node 1 is the starting point and doesn't need a predecessor from the traversal.
    let allNodesAreReachable = true;
    for (let nodeIdentifier = 2; nodeIdentifier <= numNodes; ++nodeIdentifier) {
        if (nodePredecessors[nodeIdentifier] === 0) { // If any node still has a 0 predecessor, it's unvisited.
            allNodesAreReachable = false;
            break;
        }
    }

    if (!allNodesAreReachable) {
        return boolFormatter(false); // If even one node is unreachable, the condition is not met.
    }

    // If all nodes are reachable, construct the output string.
    // The output requires 'Yes' on the first line, followed by the predecessor for each node
    // from 2 to N, each on a new line.
    const predecessorResultLines = [];
    for (let outputIndex = 2; outputIndex <= numNodes; ++outputIndex) {
        predecessorResultLines.push(String(nodePredecessors[outputIndex]));
    }
    return boolFormatter(true) + '\n' + predecessorResultLines.join('\n');
}

// --- Global Input Data Preparation and Utility Function Implementations ---

// Parse the raw input content by splitting it into individual tokens.
// This handles various whitespace separators and filters out any empty strings.
let processedInputTokens = rawInputContent.split(/[\s\n]+/).filter(token => token.length > 0);
let iterationCounter = 0; // Global counter for the loop safety check.

// Invoke the main graph processing logic, passing an object containing all required utility functions.
let finalResultString = determinePathConnections({
    rawDataStream: rawInputContent, // Provides the raw input, though not directly used by determinePathConnections.
    boolFormatter: value => value ? 'Yes' : 'No', // Simple boolean to string conversion.
    sumCalculator: collection => { // Custom implementation for summing numbers in an array.
        let runningTotal = 0;
        for (const numberValue of collection) {
            runningTotal += numberValue;
        }
        return runningTotal;
    },
    dataExtractor: (rowsToRead = 1, columnsToRead = 1, typeConversion = Number) => {
        const requiredElementCount = rowsToRead * columnsToRead;
        // Basic check to ensure there are enough tokens left in the processed input.
        if (processedInputTokens.length < requiredElementCount) {
            console.error("Critical Error: Insufficient input tokens for the requested data extraction.");
            throw new Error("Input data exhaustion.");
        }

        // Extract the required number of tokens from the beginning of the array.
        let extractedSlice = processedInputTokens.splice(0, requiredElementCount);
        if (typeConversion !== String) {
            // Apply type conversion (e.g., to Number) if not explicitly requesting strings.
            extractedSlice = extractedSlice.map(val => typeConversion(val));
        }

        // If multiple columns are specified, reshape the flat array into an array of columns.
        // This implies the input was originally structured row-by-row, and we're transposing it.
        if (columnsToRead > 1) {
            const transposedColumns = new Array(columnsToRead);
            for (let columnIndex = 0; columnIndex < columnsToRead; ++columnIndex) {
                transposedColumns[columnIndex] = new Array(rowsToRead);
                for (let rowIndex = 0; rowIndex < rowsToRead; ++rowIndex) {
                    // Calculate the original flat index based on row-major order.
                    const originalFlatIndex = rowIndex * columnsToRead + columnIndex;
                    transposedColumns[columnIndex][rowIndex] = extractedSlice[originalFlatIndex];
                }
            }
            return transposedColumns; // Return an array where each element is a column array.
        }
        return extractedSlice; // Return as a single flat array if only one column or a single row was requested.
    },
    jsonLogger: value => {
        // Output JavaScript objects as pretty-printed JSON for better readability.
        console.log(JSON.stringify(value, null, 2));
    },
});

// Final output stage: display the result of the main processing.
if (finalResultString === undefined || finalResultString === null) {
    console.error("Execution Warning: The graph processing function did not return a valid result string (it was undefined or null).");
    console.log("Processing Outcome: Failed or Incomplete.");
} else {
    console.log(finalResultString);
}

/**
 * A protective function designed to detect and prevent runaway loops in algorithms,
 * especially useful in graph traversals that might encounter cycles or complex structures.
 * Throws an error if a predefined maximum iteration count is surpassed.
 * @param {number} [maxIterationsAllowed=1000000] - The upper limit for iterations before an error is triggered.
 */
function cycleSafetyCheck(maxIterationsAllowed = 1_000_000) { // Increased default limit for robustness.
    iterationCounter++; // Increment the global counter with each check.
    if (iterationCounter >= maxIterationsAllowed) {
        throw new Error(`Execution Aborted: Loop iteration limit (${maxIterationsAllowed}) exceeded. This suggests a potential infinite loop or excessively large input.`);
    }
}

// Note: Unused helper functions (like math_max, math_min, math_prime_factors from the original code)
// have been intentionally removed as per Type III cloning requirements to delete non-essential fragments.