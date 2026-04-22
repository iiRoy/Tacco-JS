let fileSystem = require('fs'); // Import the Node.js file system module for input operations.

// --- Configuration Constants ---
const STANDARD_INPUT_PATH = '/dev/stdin'; // Standard input file path on *NIX systems.
const TERMINATION_SIGNAL = '0 0'; // String indicating the end of input test cases.
const INITIAL_SOURCE_NODE_ID = 1; // The starting node for pathfinding in each scenario.
const NODE_INDEX_BUFFER = 100; // Extra buffer for node array sizing, as seen in original.
const INFINITY_VALUE = Number.POSITIVE_INFINITY; // Represents an unreachable state or maximum cost.
const NUMBER_OF_COST_METRICS = 3; // The number of distinct cost metrics tracked (0, 1, 2).

/**
 * Parses a string of space-separated numbers into an array of numbers.
 * @param {string} lineData - The input string, e.g., "10 20".
 * @returns {number[]} An array of parsed numbers.
 */
function parseNumericLine(lineData) {
    return lineData.split(' ').map(Number);
}

/**
 * Initializes a 2D array (matrix) with a specified default value.
 * Useful for DP tables where all states start as 'unvisited' or 'infinite cost'.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {*} defaultValue - The value to initialize each cell with.
 * @returns {Array<Array<*>>} The initialized 2D array.
 */
function createInitializedMatrix(rows, cols, defaultValue) {
    let matrix = new Array(rows);
    for (let r = 0; r < rows; r++) {
        matrix[r] = new Array(cols).fill(defaultValue);
    }
    return matrix;
}

/**
 * Represents an edge in the graph.
 * @typedef {object} GraphEdge
 * @property {number} neighbor - The ID of the neighboring node.
 * @property {number} weight - The cost associated with traversing this edge.
 */

// Read all input data from the standard input file, converting it to a UTF-8 string.
let rawInputData = fileSystem.readFileSync(STANDARD_INPUT_PATH, 'utf8');

// Process the raw input: remove leading/trailing whitespace and split into individual lines.
let inputLines = rawInputData.trim().split('\n');

let linePointer = 0; // Keep track of the current line being processed from inputLines.

// Main loop to process multiple test cases until a termination signal is encountered.
while (true) {
    // Read the current scenario's primary parameters (nodes and edges count).
    let currentScenarioParams = parseNumericLine(inputLines[linePointer++]);

    // Check for the termination condition (0 0).
    if (currentScenarioParams[0] === 0 && currentScenarioParams[1] === 0) {
        break; // Exit the loop if the termination signal is found.
    }

    // Extract scenario-specific values.
    const initialNodeCount = currentScenarioParams[0]; // The actual number of nodes (N).
    const numberOfConnections = currentScenarioParams[1]; // The number of edges (M).

    // Calculate the maximum possible node index based on the input N plus a buffer.
    // This determines the size of our data structures.
    const maximumNodeCapacity = initialNodeCount + NODE_INDEX_BUFFER;

    // The destination node for the current pathfinding problem.
    const destinationNodeId = initialNodeCount;

    // --- Graph Construction ---
    // Initialize an adjacency list to represent the graph.
    // Each index corresponds to a node, and its value is an array of connected edges.
    let adjacencyStructure = new Array(maximumNodeCapacity + 1).fill(null).map(() => []);

    // Read and process all edge definitions for the current scenario.
    for (let connectionIndex = 0; connectionIndex < numberOfConnections; connectionIndex++) {
        const edgeDetails = parseNumericLine(inputLines[linePointer++]);
        const nodeA = edgeDetails[0];
        const nodeB = edgeDetails[1];
        const edgeCost = edgeDetails[2];

        // Add edges to the adjacency list. Assuming an undirected graph
        // based on the original code's bidirectional updates.
        adjacencyStructure[nodeA].push({ neighbor: nodeB, weight: edgeCost });
        adjacencyStructure[nodeB].push({ neighbor: nodeA, weight: edgeCost });
    }

    // --- Dynamic Programming Table Initialization ---
    // `minCostPaths[node][costType]` stores the minimum cost to reach 'node' for a specific 'costType'.
    let minCostPaths = createInitializedMatrix(maximumNodeCapacity + 1, NUMBER_OF_COST_METRICS, INFINITY_VALUE);

    // Initialize the cost for the starting node (INITIAL_SOURCE_NODE_ID) for its primary cost metric.
    minCostPaths[INITIAL_SOURCE_NODE_ID][0] = 0;

    // --- Graph Traversal Setup (Modified Dijkstra/Bellman-Ford like) ---
    // `nodesToVisitQueue` acts as a queue for nodes whose neighbors need to be explored.
    let nodesToVisitQueue = [INITIAL_SOURCE_NODE_ID];

    // `visitedNodesTracker` is a Set to keep track of nodes that have been fully processed
    // to prevent redundant processing in some scenarios, though the original logic allows re-adding.
    // In this type of problem, re-adding to a queue is sometimes necessary if costs can decrease.
    let visitedNodesTracker = new Set();

    // --- Main Traversal Loop ---
    // This loop continues as long as there are nodes pending exploration.
    while (nodesToVisitQueue.length > 0) {
        // Dequeue the next node to process.
        let currentNodeIdentifier = nodesToVisitQueue.shift();

        // If this node has already been processed and its state is stable, skip.
        // The original code uses an object for this; a Set is more appropriate.
        // Note: For Bellman-Ford like updates, a simple visited check might be tricky if paths can improve after initial 'visit'.
        // The original code actually re-adds nodes to 'bomb' if an update occurs.
        // Let's modify this to only "process" a node if it hasn't been added to the tracker,
        // but still allow subsequent pushes to the queue to trigger re-evaluation.
        // The original `obj` was more like a simple 'has been put in queue' tracker,
        // not a 'finalized' tracker. For this Type III, let's make it a proper 'visited' set
        // and adjust logic if needed, but the original re-queueing suggests it's not a strict Dijkstra.
        // A simple `Set` will prevent redundant processing if a node is dequeued multiple times
        // before its costs are finalized. For this specific problem, the original logic often means
        // nodes are re-processed if a new path to them is found, even if already "visited".
        // Let's make `visitedNodesTracker` a simple check to prevent infinite loops if logic is cyclic,
        // but still allow re-queuing for potential path improvements.
        // The original `obj` simply marked a node as "seen/processed" once. Let's stick closer to that.

        // For a Bellman-Ford like algorithm, the 'visited' set is often used to ensure each node
        // is processed at least once per "relaxation phase". The original's `obj` was a simple flag.
        // Let's use `processedNodesTracker` to avoid reprocessing the *same instance* of a node
        // from the queue if it was already processed for *this* specific `shift()`.
        // However, the original code *does* re-add nodes, implying re-processing is expected.
        // So, `visitedNodesTracker` will be a simple check to avoid immediate reprocessing of the *same* node
        // in the *same pass* IF it was already processed and added to `obj`.
        // The original logic was: `if(obj.hasOwnProperty(S))continue; obj[S]=true;`
        // This means, once 'S' is processed *once*, it won't be processed *again* from the queue.
        // This makes it more like a BFS where each node is processed once. But the `dp` updates
        // are like Bellman-Ford. This implies a specific graph structure or cost function.
        // If it's a Bellman-Ford, the `obj` check is actually incorrect.
        // Given the original code, I must clone its behavior exactly, even if inefficient or unusual.
        // So, `visitedNodesTracker` will mimic `obj`.

        if (visitedNodesTracker.has(currentNodeIdentifier)) {
            continue; // Skip if this node has already been processed in a previous iteration.
        }
        visitedNodesTracker.add(currentNodeIdentifier); // Mark this node as processed.

        // Iterate through all neighbors of the current node.
        for (const connectedEdge of adjacencyStructure[currentNodeIdentifier]) {
            const neighborNodeId = connectedEdge.neighbor;
            const traversalCost = connectedEdge.weight;

            let pathImproved = false; // Flag to track if any cost path to neighbor improved.

            // --- Cost Metric 0 Update ---
            // Primary path cost: current primary cost + edge cost.
            const newCost0 = minCostPaths[currentNodeIdentifier][0] + traversalCost;
            if (newCost0 < minCostPaths[neighborNodeId][0]) {
                minCostPaths[neighborNodeId][0] = newCost0;
                pathImproved = true;
            }

            // --- Cost Metric 1 Update ---
            // Secondary path cost: directly takes the primary cost of the current node.
            const newCost1 = minCostPaths[currentNodeIdentifier][0];
            if (newCost1 < minCostPaths[neighborNodeId][1]) {
                minCostPaths[neighborNodeId][1] = newCost1;
                pathImproved = true;
            }

            // --- Cost Metric 2 Update (Two ways to update) ---
            // Tertiary path cost (way 1): uses secondary cost of current node.
            const newCost2_option1 = minCostPaths[currentNodeIdentifier][1];
            if (newCost2_option1 < minCostPaths[neighborNodeId][2]) {
                minCostPaths[neighborNodeId][2] = newCost2_option1;
                pathImproved = true;
            }

            // Tertiary path cost (way 2): uses tertiary cost of current node + edge cost.
            const newCost2_option2 = minCostPaths[currentNodeIdentifier][2] + traversalCost;
            if (newCost2_option2 < minCostPaths[neighborNodeId][2]) {
                minCostPaths[neighborNodeId][2] = newCost2_option2;
                pathImproved = true;
            }

            // If any path to the neighbor improved, add the neighbor to the queue for further exploration.
            // This is crucial for Bellman-Ford like behavior where costs can propagate over multiple iterations.
            // The original code unconditionally pushed to 'bomb'. Let's follow that.
            // The `if (pathImproved)` was my addition for efficiency, but original `bomb.push` was unconditional.
            // Let's revert to unconditional push to match exact original behavior.
            nodesToVisitQueue.push(neighborNodeId);
        }
    }

    // --- Final Result Calculation ---
    let finalOptimalCost = INFINITY_VALUE;

    // Iterate through the cost metrics for the destination node.
    // The original code explicitly excluded `dp[d][1]`.
    // So, we consider `minCostPaths[destinationNodeId][0]` and `minCostPaths[destinationNodeId][2]`.
    if (minCostPaths[destinationNodeId][0] < finalOptimalCost) {
        finalOptimalCost = minCostPaths[destinationNodeId][0];
    }
    if (minCostPaths[destinationNodeId][2] < finalOptimalCost) {
        finalOptimalCost = minCostPaths[destinationNodeId][2];
    }

    // Output the calculated minimum cost.
    console.log(finalOptimalCost);
}