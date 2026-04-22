// System configuration for input/output handling
settings = {
    dataSourcePath: '/dev/stdin',
    lineDelimiter: '\n'
};

// Retrieve file system module and read input data
const fileSystem = require('fs');
const inputBuffer = fileSystem.readFileSync(settings.dataSourcePath, 'ascii');
const inputLines = inputBuffer
    .trim()
    .split(settings.lineDelimiter);

// Parse the total number of nodes from the first line of input
const nodeCount = Number(inputLines.shift());

// Initialize graph representations:
// forwardGraph stores outgoing edges (u -> v) with weights
// backwardGraph stores incoming edges (v -> u) with weights
const forwardGraph = {};
const backwardGraph = {};

/**
 * Inserts a directed edge with a specified weight into a given graph map.
 * If the source vertex does not exist in the map, it is initialized.
 * @param {object} graphMap The graph map (e.g., forwardGraph or backwardGraph).
 * @param {number} sourceVertex The node from which the edge originates.
 * @param {number} targetVertex The node to which the edge points.
 * @param {number} edgeWeight The numerical cost associated with traversing this edge.
 */
function establishEdge(graphMap, sourceVertex, targetVertex, edgeWeight) {
    if (!graphMap.hasOwnProperty(sourceVertex)) {
        graphMap[sourceVertex] = {};
    }
    graphMap[sourceVertex][targetVertex] = edgeWeight;
}

// Iterate through the remaining input lines to construct the graph
for (let lineIndex in inputLines) {
    const parsedSegment = inputLines[lineIndex]
        .split(' ')
        .map(Number);

    const currentSource = parsedSegment[0]; // The first number is the source node ID

    // Process pairs of (destination_node, edge_cost) starting from the third element
    for (let componentIndex = 2; componentIndex < parsedSegment.length; componentIndex += 2) {
        // Add edge to forward graph: currentSource -> parsedSegment[componentIndex]
        establishEdge(forwardGraph, currentSource, parsedSegment[componentIndex], parsedSegment[componentIndex + 1]);
        // Add edge to backward graph: parsedSegment[componentIndex] -> currentSource
        establishEdge(backwardGraph, parsedSegment[componentIndex], currentSource, parsedSegment[componentIndex + 1]);
    }
}

// --- Initial Breadth-First Search (BFS) Phase ---

let levelCounter = 0; // Tracks the current BFS depth level
const levelDepths = new Array(nodeCount); // Stores the BFS level for each node (null if unvisited)
const minDistances = new Array(nodeCount); // Stores the tentative minimum distance from source node 0

// Initialize all nodes: unvisited and with effectively infinite distance
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    levelDepths[nodeIdx] = null;
    minDistances[nodeIdx] = Number.MAX_VALUE;
}

// Set the starting node (node 0) for the BFS
levelDepths[0] = 0;
minDistances[0] = 0;

// Execute BFS until no new nodes are reachable at the current level
let moreToProcess;
do {
    moreToProcess = 0; // Flag: set to 1 if new nodes are visited in this iteration

    // Iterate through all nodes present in the forward graph
    for (let currentNodeId in forwardGraph) {
        // Only process nodes that belong to the current BFS level
        if (levelDepths[currentNodeId] !== levelCounter) {
            continue;
        }

        const currentAdjacencies = forwardGraph[currentNodeId];
        // Explore all neighbors of the current node
        for (let connectedNodeId in currentAdjacencies) {
            // If the neighbor has not been visited yet, assign its BFS level
            if (levelDepths[connectedNodeId] === null) {
                levelDepths[connectedNodeId] = levelCounter + 1;
                moreToProcess = 1; // Indicate a new node was found
            }
            // Update the minimum distance to the connected node if a shorter path is found
            minDistances[connectedNodeId] = Math.min(
                minDistances[connectedNodeId],
                minDistances[currentNodeId] + currentAdjacencies[connectedNodeId]
            );
        }
    }
    levelCounter++; // Advance to the next BFS level
} while (moreToProcess); // Continue as long as the BFS discovers new nodes

// --- Node Ordering for Dynamic Programming ---

const orderedVertices = new Array(nodeCount); // Array to hold node IDs, sorted by their initial minDistances
for (let vertexIndex = 0; vertexIndex < nodeCount; vertexIndex++) {
    orderedVertices[vertexIndex] = vertexIndex;
}

// Sort vertices in ascending order based on their initial minimum distances
orderedVertices.sort(function (vertexA, vertexB) {
    return minDistances[vertexA] - minDistances[vertexB];
});

const vertexOrderMap = {}; // A map from node ID to its index in the 'orderedVertices' array
for (let sortedIndex = 0; sortedIndex < nodeCount; sortedIndex++) {
    vertexOrderMap[orderedVertices[sortedIndex]] = sortedIndex;
}

// --- Dynamic Programming Phase with Iterative DFS ---

// Global array to track nodes that have been "explored" or included in a path during DFS calls.
// This array's state persists across multiple calls to `traversePath`.
const exploredNodes = new Array(nodeCount);
for (let nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
    exploredNodes[nodeIterator] = false; // Initialize all nodes as not explored
}

// Stacks for simulating iterative DFS traversal
const pathStack = new Array(nodeCount); // Stores the sequence of nodes in the current DFS path
const pendingNeighbors = new Array(nodeCount); // Stores lists of unvisited neighbors for nodes in pathStack

/**
 * Executes an iterative depth-first traversal to refine path costs.
 * This function explores paths backwards from `pathStartVertex` towards `targetVertex`
 * using the `backwardGraph` to potentially find a shorter path component.
 * @param {number} pathStartVertex The starting node for this specific DFS exploration.
 * @param {number} targetVertex The node whose minimum distance is currently being refined.
 * @param {number} initialEstimate A preliminary cost value used for pruning search branches.
 * @returns {number} The minimum path cost found from a suitable source to `pathStartVertex`.
 */
function traversePath(pathStartVertex, targetVertex, initialEstimate) {
    let stackPointer = 0; // Current depth within the simulated DFS stack
    let currentPathCost = 0; // Accumulated cost along the current path segment
    let minimumCandidate = initialEstimate; // Best path component found so far for this segment

    // Mark the initial nodes of this DFS call as globally explored.
    // This affects subsequent path explorations based on the 'exploredNodes' array.
    exploredNodes[targetVertex] = true;
    exploredNodes[pathStartVertex] = true;

    pathStack[0] = pathStartVertex;
    // Initialize the list of neighbors to visit for the starting node (predecessors in backwardGraph)
    pendingNeighbors[0] = Object.keys(backwardGraph[pathStartVertex]);

    // Main loop for iterative DFS traversal
    while (true) {
        // If the current node in the stack has no more unvisited neighbors
        if (pendingNeighbors[stackPointer].length === 0) {
            if (stackPointer === 0) {
                return minimumCandidate; // All paths from pathStartVertex have been explored
            }
            // Backtrack: remove the cost of the edge from the parent node to the current node
            currentPathCost -= backwardGraph[pathStack[stackPointer - 1]][pathStack[stackPointer]];
            stackPointer--; // Move up to the parent node in the stack
            continue;
        }

        const nextNode = pendingNeighbors[stackPointer].pop(); // Get the next neighbor to explore

        // Skip this neighbor if it has already been globally marked as explored
        if (exploredNodes[nextNode]) {
            continue;
        }

        // Pruning step: if extending the current path to 'nextNode' already exceeds the initial estimate
        if (currentPathCost + backwardGraph[pathStack[stackPointer]][nextNode] >= initialEstimate) {
            continue;
        }

        // If 'nextNode' appears earlier in the sorted vertex order than 'targetVertex'
        if (vertexOrderMap[nextNode] < vertexOrderMap[targetVertex]) {
            // Update the minimum candidate using the known minimum distance to 'nextNode'
            minimumCandidate = Math.min(
                minimumCandidate,
                currentPathCost + backwardGraph[pathStack[stackPointer]][nextNode] + minDistances[nextNode]
            );
            continue; // This path segment is complete; no need to explore further from 'nextNode'
        }

        // If all conditions are met, extend the current path to 'nextNode'
        currentPathCost += backwardGraph[pathStack[stackPointer]][nextNode];
        stackPointer++; // Move deeper into the stack
        pathStack[stackPointer] = nextNode;
        // Initialize neighbors for the newly added node (predecessors in backwardGraph)
        pendingNeighbors[stackPointer] = Object.keys(backwardGraph[nextNode]);
    }
}

// Main loop for dynamic programming: iterate through nodes in their sorted order
for (let sortedIndex in orderedVertices) {
    const currentVertex = orderedVertices[sortedIndex]; // The node being processed (analogous to 'u')

    // First pass: Update the minimum distance to 'currentVertex' using predecessors
    // that have already been processed (i.e., appear earlier in the sorted list).
    for (let predecessorVertex in backwardGraph[currentVertex]) { // Analogous to 'v'
        if (vertexOrderMap[predecessorVertex] < vertexOrderMap[currentVertex]) {
            minDistances[currentVertex] = Math.min(
                minDistances[currentVertex],
                minDistances[predecessorVertex] + forwardGraph[predecessorVertex][currentVertex]
            );
        }
    }

    // Second pass: Update the minimum distance to 'currentVertex' using predecessors
    // that appear *later* in the sorted list. This involves the DFS (`traversePath`)
    // to find paths through these 'later' predecessors.
    for (let predecessorVertex in backwardGraph[currentVertex]) {
        if (vertexOrderMap[predecessorVertex] > vertexOrderMap[currentVertex]) {
            // Call `traversePath` to find a potential shorter path component
            // from some node `x` to `predecessorVertex`, then add the edge cost
            // from `predecessorVertex` to `currentVertex`.
            minDistances[currentVertex] = Math.min(
                minDistances[currentVertex],
                traversePath(
                    predecessorVertex, // The starting node for this DFS segment (v)
                    currentVertex,     // The target node for which distance is being calculated (u)
                    minDistances[currentVertex] - forwardGraph[predecessorVertex][currentVertex] // Initial estimate for the path component
                ) + forwardGraph[predecessorVertex][currentVertex] // Add the final edge cost
            );
        }
    }
}

// Output the final calculated minimum distances for all nodes
for (let resultNodeIndex = 0; resultNodeIndex < nodeCount; resultNodeIndex++) {
    console.log(resultNodeIndex + ' ' + minDistances[resultNodeIndex]);
}