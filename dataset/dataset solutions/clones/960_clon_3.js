const fileSystemModule = require('fs');

// Define a large number to represent infinity for distances
const MAX_PATH_VALUE = 1000000007; // A sufficiently large number

// Read the raw input data from standard input
const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLineSegments = rawInputContent.trim().split('\n');

// Extract the total number of vertices from the first line
const totalVertices = parseInt(inputLineSegments.shift(), 10);

// Initialize the adjacency matrix for the graph
// All distances are initially set to MAX_PATH_VALUE (infinity)
// The distance from a node to itself is 0
let graphConnections = Array.from({ length: totalVertices }, () => Array(totalVertices).fill(MAX_PATH_VALUE));
for (let vertexIndex = 0; vertexIndex < totalVertices; vertexIndex++) {
    graphConnections[vertexIndex][vertexIndex] = 0;
}

// Populate the graph connections from the input lines
for (let currentVertex = 0; currentVertex < totalVertices; currentVertex++) {
    const vertexEdgeData = inputLineSegments.shift().trim().split(' ').map(value => parseInt(value, 10));
    // The first element 'vertexEdgeData[0]' is the current vertex ID, which matches 'currentVertex'
    const edgesCount = vertexEdgeData[1]; // Number of outgoing edges for this vertex

    // Iterate through the neighbor information
    for (let edgeNum = 0; edgeNum < edgesCount; edgeNum++) {
        const neighborNodeId = vertexEdgeData[2 + edgeNum * 2];
        const travelCost = vertexEdgeData[2 + edgeNum * 2 + 1];
        graphConnections[currentVertex][neighborNodeId] = travelCost;
    }
}

// Initialize distances for Dijkstra's algorithm
// 'shortestDistances' will store the minimum distance from the source (node 0)
let shortestDistances = Array(totalVertices).fill(MAX_PATH_VALUE);
shortestDistances[0] = 0; // Distance from source to itself is 0

// 'isProcessed' tracks whether a node has been included in the shortest path tree
let isProcessed = Array(totalVertices).fill(false);

/**
 * Helper function to find the unvisited node with the smallest known distance.
 * @param {number[]} distancesArray - Array of current shortest distances from the source.
 * @param {boolean[]} processedNodesArray - Array indicating if a node has been processed.
 * @param {number} numVertices - Total number of vertices in the graph.
 * @returns {number|null} The index of the next unvisited node with minimum distance, or null if all nodes are processed.
 */
const selectNextUnvisitedNode = (distancesArray, processedNodesArray, numVertices) => {
    let minimumDistanceFound = MAX_PATH_VALUE;
    let chosenNode = null;

    for (let nodeIterator = 0; nodeIterator < numVertices; nodeIterator++) {
        // Check if the node is not yet processed and has a smaller distance
        if (!processedNodesArray[nodeIterator] && distancesArray[nodeIterator] < minimumDistanceFound) {
            minimumDistanceFound = distancesArray[nodeIterator];
            chosenNode = nodeIterator;
        }
    }
    return chosenNode;
};

// Main loop for Dijkstra's algorithm
while (true) {
    // Find the unvisited node with the minimum distance
    const activeProcessingNode = selectNextUnvisitedNode(shortestDistances, isProcessed, totalVertices);

    // If no unvisited node is found (all nodes processed or unreachable), terminate
    if (activeProcessingNode === null) {
        break;
    }

    // Mark the chosen node as processed
    isProcessed[activeProcessingNode] = true;

    // Relax all adjacent edges of the currently processed node
    for (let neighborCandidate = 0; neighborCandidate < totalVertices; neighborCandidate++) {
        // Calculate the distance to the neighbor through the active node
        const potentialNewPathDistance = shortestDistances[activeProcessingNode] + graphConnections[activeProcessingNode][neighborCandidate];

        // If this path is shorter than the current known shortest path to the neighbor, update it
        if (potentialNewPathDistance < shortestDistances[neighborCandidate]) {
            shortestDistances[neighborCandidate] = potentialNewPathDistance;
        }
    }
}

// Output the final shortest distances from the source node to all other nodes
for (let resultVertex = 0; resultVertex < totalVertices; resultVertex++) {
    console.log(resultVertex, shortestDistances[resultVertex]);
}