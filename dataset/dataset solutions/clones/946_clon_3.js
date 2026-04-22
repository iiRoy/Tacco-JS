const fileSystem = require('fs');
const inputFilePath = '/dev/stdin'; // Standard input stream for competitive programming

/**
 * Reads data from a specified file path.
 * @param {string} path The path to the input file.
 * @returns {string} The raw content of the file.
 */
function acquireSourceData(path) {
    try {
        return fileSystem.readFileSync(path, 'utf8').trim();
    } catch (error) {
        console.error(`Error reading input file: ${error.message}`);
        // In a real application, you might throw or return a specific error code.
        // For this context, we'll return an empty string to allow subsequent checks to fail gracefully.
        return '';
    }
}

// Retrieve the raw input content and split it into individual lines
const rawInputData = acquireSourceData(inputFilePath);
const graphDescriptionLines = rawInputData.split('\n').filter(line => line.length > 0);

// Ensure there's at least one line for the total node count
if (graphDescriptionLines.length === 0) {
    console.error("No input data provided. Exiting.");
    process.exit(1);
}

// Parse the total number of vertices in the graph from the first line
const totalNodesCount = parseInt(graphDescriptionLines.shift(), 10);

// Basic validation for the number of nodes
if (isNaN(totalNodesCount) || totalNodesCount < 1) {
    console.error("Invalid or missing total number of nodes. Must be a positive integer. Exiting.");
    process.exit(1);
}

/**
 * Initializes an adjacency matrix for a graph of a given size.
 * Connections are represented by 1, no connections by null.
 * Rows and columns are 1-indexed for convenience.
 * @param {number} size The number of nodes in the graph.
 * @returns {Array<Array<number|null>>} The initialized adjacency matrix.
 */
function createAdjacencyMatrix(size) {
    // Initialize matrix with `null` indicating no connection, 1-indexed
    const matrix = Array.from({ length: size + 1 }, () =>
        Array.from({ length: size + 1 }, () => null)
    );
    // Ensure self-loops are not implicitly set or handled
    // for (let i = 1; i <= size; i++) {
    //     matrix[i][i] = 0; // Or some other indication if self-loops are explicitly forbidden/ignored
    // }
    return matrix;
}

let nodeConnectionsMatrix = createAdjacencyMatrix(totalNodesCount);

// Helper to parse a single line describing a node's connections
/**
 * Parses a line from the input describing a node and its neighbors.
 * @param {string} line A string representing node ID, number of neighbors, and neighbor IDs.
 * @returns {{sourceId: number, neighbors: number[]}} Parsed information.
 */
function parseNodeConnections(line) {
    const parts = line.split(' ').map(Number);
    const sourceId = parts[0];
    const numberOfNeighbors = parts[1];
    const neighbors = parts.slice(2, 2 + numberOfNeighbors);
    return { sourceId, neighbors };
}

// Populate the adjacency matrix based on the input lines
// We iterate through the remaining lines, each describing a vertex's outgoing edges.
for (let lineIdx = 0; lineIdx < totalNodesCount; lineIdx++) {
    if (graphDescriptionLines.length === 0) {
        console.error(`Insufficient graph description lines. Expected ${totalNodesCount}, got less.`);
        process.exit(1);
    }
    const { sourceId, neighbors } = parseNodeConnections(graphDescriptionLines.shift());

    // Validate sourceId
    if (sourceId < 1 || sourceId > totalNodesCount) {
        console.error(`Invalid source node ID ${sourceId} found. Must be between 1 and ${totalNodesCount}.`);
        continue; // Skip this line and try to process others
    }

    // Set connections in the matrix
    for (const connectedNodeId of neighbors) {
        // Validate connectedNodeId
        if (connectedNodeId < 1 || connectedNodeId > totalNodesCount) {
            console.warn(`Warning: Invalid neighbor ID ${connectedNodeId} for node ${sourceId}. Skipping.`);
            continue;
        }
        nodeConnectionsMatrix[sourceId][connectedNodeId] = 1;
    }
}

// --- Breadth-First Search (BFS) Implementation ---

// Array to store the shortest path distances from the starting node (node 1)
// Initialized with Infinity for all nodes, indicating they are unreachable.
// The starting node's distance will be set to 0.
const shortestPathDistances = Array.from({ length: totalNodesCount + 1 }, () => Infinity);

// The queue used for BFS traversal.
// Nodes are added to the end and removed from the beginning.
const processingQueue = [];

// Define the starting node for BFS
const startNodeIdentifier = 1;

// Set the distance of the starting node to 0 and add it to the queue
shortestPathDistances[startNodeIdentifier] = 0;
processingQueue.push(startNodeIdentifier);

// Process nodes in the queue until it's empty
while (processingQueue.length > 0) {
    // Dequeue the next node to visit
    const currentProcessingNode = processingQueue.shift();

    // Guard: If the current node is unreachable (distance is Infinity),
    // it means it was added to the queue erroneously or the graph is disconnected
    // in a way that this path is invalid. (Shouldn't happen with correct BFS logic).
    if (shortestPathDistances[currentProcessingNode] === Infinity) {
        continue;
    }

    // Iterate through all possible nodes to find neighbors of the current node
    for (let potentialNextNode = 1; potentialNextNode <= totalNodesCount; potentialNextNode++) {
        // Check if there is a direct connection from currentProcessingNode to potentialNextNode
        if (nodeConnectionsMatrix[currentProcessingNode][potentialNextNode] !== 1) {
            // No direct edge, skip to the next potential neighbor
            continue;
        }

        // If the potentialNextNode has not been visited yet (its distance is still Infinity)
        if (shortestPathDistances[potentialNextNode] === Infinity) {
            // Update its shortest path distance
            shortestPathDistances[potentialNextNode] = shortestPathDistances[currentProcessingNode] + 1;
            // Enqueue the newly visited node for further processing
            processingQueue.push(potentialNextNode);
        }
    }
}

// --- Output Results ---

// Header for the output
console.log("--- BFS Distances ---");

// Print the shortest path distance for each node
for (let outputNodeId = 1; outputNodeId <= totalNodesCount; outputNodeId++) {
    let finalDistance = shortestPathDistances[outputNodeId];
    // If a node was unreachable (distance remained Infinity), output -1 as per original problem spec.
    if (finalDistance === Infinity) {
        finalDistance = -1;
    }
    console.log(`Node ${outputNodeId}: ${finalDistance}`);
}

console.log("---------------------");