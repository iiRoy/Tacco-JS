const fs = require("fs");

/**
 * A robust helper function to ensure an iterable can be destructured into an array.
 * Mimics Babel's _slicedToArray helper.
 *
 * @param {Iterable} iterableInput The value to be destructured.
 * @param {number} [expectedLength] Optional. If provided, the function will stop
 *                                  iterating once this length is reached.
 * @returns {Array} An array representation of the iterable.
 * @throws {TypeError} If the input is not an array and not a valid iterable,
 *                     or if an error occurs during iteration.
 */
function ensureArrayDestructuring(iterableInput, expectedLength) {
    // If the input is already an array, return it directly.
    if (Array.isArray(iterableInput)) {
        return iterableInput;
    }

    let resultElements = [];
    let iterationCompleted = false;
    let encounteredError = false;
    let caughtIterationError = undefined;
    let currentIterator;

    try {
        // Attempt to get an iterator from the input.
        // If iterableInput is not iterable, this will throw a TypeError.
        currentIterator = iterableInput[Symbol.iterator]();
        let iterationItem;

        // Loop through the iterable, pushing values to resultElements.
        // Stop if the iterator is done, or if expectedLength is reached (if specified).
        while (!(iterationCompleted = (iterationItem = currentIterator.next()).done) &&
               (resultElements.push(iterationItem.value), !expectedLength || resultElements.length !== expectedLength)) {
            // Continue looping
        }
    } catch (err) {
        encounteredError = true;
        caughtIterationError = err;
    } finally {
        try {
            // If iteration was not completed (e.g., due to reaching expectedLength or an early break),
            // and the iterator has a 'return' method, call it to clean up resources.
            if (!iterationCompleted && currentIterator && typeof currentIterator.return === 'function') {
                currentIterator.return();
            }
        } finally {
            // If an error occurred during the main iteration, re-throw it.
            if (encounteredError) {
                throw caughtIterationError;
            }
        }
    }
    return resultElements;
}

/**
 * Parses a string line containing space-separated numbers into an array of numbers.
 * @param {string} lineContent The string line to parse.
 * @returns {number[]} An array of numbers.
 */
function parseNumbersFromLine(lineContent) {
    return lineContent.split(" ").map(Number);
}

/**
 * Constructs the adjacency list for the graph based on input lines.
 * Edges are added bidirectionally, excluding connections to the start node.
 *
 * @param {number} numNodes The total number of nodes in the graph.
 * @param {number} startNodeId The 1-based ID of the starting node.
 * @param {string[]} allInputLines All lines read from input.
 * @param {Array<Array<[number, number]>>} adjacencyList The graph's adjacency list (modified in place).
 */
function buildAdjacencyList(numNodes, startNodeId, allInputLines, adjacencyList) {
    const startNodeZeroIndexed = startNodeId - 1;

    for (let edgeIndex = 0; edgeIndex < numNodes - 1; edgeIndex++) {
        const edgeLine = allInputLines[edgeIndex + 1];
        const [nodeA_id, nodeB_id, edgeWeight] = ensureArrayDestructuring(parseNumbersFromLine(edgeLine), 3);

        const nodeA_zeroIndexed = nodeA_id - 1;
        const nodeB_zeroIndexed = nodeB_id - 1;

        // Add edge if neither node is the start node (or if it's not the start node for the other end)
        if (nodeB_zeroIndexed !== startNodeZeroIndexed) {
            adjacencyList[nodeA_zeroIndexed].push([nodeB_zeroIndexed, edgeWeight]);
        }
        if (nodeA_zeroIndexed !== startNodeZeroIndexed) {
            adjacencyList[nodeB_zeroIndexed].push([nodeA_zeroIndexed, edgeWeight]);
        }
    }
}

/**
 * Performs a Depth-First Search (DFS) to calculate distances from a starting node
 * to all reachable nodes in the graph.
 *
 * @param {number} currentNodeIndex The 0-based index of the current node in the DFS.
 * @param {number} currentAccumulatedDistance The distance from the start node to the currentNodeIndex.
 * @param {Array<Array<[number, number]>>} graph The adjacency list of the graph.
 * @param {number[]} distancesArray An array to store the calculated distances (modified in place).
 *                                  Initialized with -1 for unvisited nodes.
 */
function calculateDistancesDFS(currentNodeIndex, currentAccumulatedDistance, graph, distancesArray) {
    distancesArray[currentNodeIndex] = currentAccumulatedDistance;

    const neighbors = graph[currentNodeIndex];
    for (let neighborIndex = 0; neighborIndex < neighbors.length; neighborIndex++) {
        const [neighborNode, weightToNeighbor] = neighbors[neighborIndex];

        // If the neighbor has not been visited yet (distance is -1)
        if (distancesArray[neighborNode] === -1) {
            const newDistance = currentAccumulatedDistance + weightToNeighbor;
            calculateDistancesDFS(neighborNode, newDistance, graph, distancesArray);
        }
    }
}

/**
 * Processes all query lines and prints the sum of distances for each pair of query nodes.
 *
 * @param {number} numQueries The total number of queries.
 * @param {number} numNodes The total number of nodes in the graph.
 * @param {string[]} allInputLines All lines read from input.
 * @param {number[]} distancesArray The pre-calculated distances from the start node to all other nodes.
 */
function processQueries(numQueries, numNodes, allInputLines, distancesArray) {
    for (let queryIndex = 0; queryIndex < numQueries; queryIndex++) {
        // Query lines start after nodeCount + 1 (first line is N, then N-1 edge lines, then 1 line for Q and S)
        const queryLine = allInputLines[queryIndex + numNodes + 1];
        const [queryNodeA_id, queryNodeB_id] = ensureArrayDestructuring(parseNumbersFromLine(queryLine), 2);

        // Calculate the sum of distances from the start node to each query node.
        const totalPathDistance = distancesArray[queryNodeA_id - 1] + distancesArray[queryNodeB_id - 1];
        console.log(totalPathDistance);
    }
}

/**
 * Main function to orchestrate reading input, processing, and printing output.
 */
function main() {
    const allInputLines = fs.readFileSync("/dev/stdin", "UTF-8").split("\n");

    // Parse the first line for the number of nodes.
    const nodeCount = Number(allInputLines[0]);

    // Parse the line containing query count and start node ID.
    // This line is located after the N-1 edge lines, which follow the initial N line.
    const queryAndStartNodeLine = allInputLines[nodeCount];
    const [queryCount, startNodeId] = ensureArrayDestructuring(parseNumbersFromLine(queryAndStartNodeLine), 2);

    // Initialize adjacency list for the graph.
    // Each element is an array to store [neighborNodeIndex, edgeWeight] pairs.
    const adjList = Array.from({ length: nodeCount }, () => []);

    // Initialize distances array with -1 to mark all nodes as unvisited.
    const distances = new Array(nodeCount).fill(-1);

    // Build the graph's adjacency list from input lines.
    buildAdjacencyList(nodeCount, startNodeId, allInputLines, adjList);

    // Calculate distances from the start node using DFS.
    // Convert startNodeId to 0-based index for array access.
    calculateDistancesDFS(startNodeId - 1, 0, adjList, distances);

    // Process all queries and print results.
    processQueries(queryCount, nodeCount, allInputLines, distances);
}

// Execute the main function when the script runs.
main();
