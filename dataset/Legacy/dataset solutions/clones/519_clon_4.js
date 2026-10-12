const fileSystem = require('fs');

// Helper to read numeric lines from stdin
let lineCursor = 0;
const inputLines = fileSystem.readFileSync(process.stdin.fd, 'utf8').split('\n');
const retrieveNumericLine = () => Number(inputLines[lineCursor++]);

// Function to create a 2D array (grid) initialized with a specific value
function createGrid(rows, columns, initialValue) {
    return Array.from({ length: rows }, () =>
        Array.from({ length: columns }, () => initialValue)
    );
}

// Dijkstra's algorithm implementation
function calculateShortestPaths(graphMatrix, sourceNode) {
    const nodeCount = graphMatrix.length;
    const pathDistances = Array(nodeCount).fill(Infinity);
    const unvisitedNodes = new Set(Array.from({ length: nodeCount }, (_, idx) => idx));

    pathDistances[sourceNode] = 0;

    while (unvisitedNodes.size > 0) {
        let currentMinNode = -1;
        let currentMinDistance = Infinity;

        // Find the unvisited node with the smallest known distance
        for (const nodeIdentifier of unvisitedNodes) {
            if (pathDistances[nodeIdentifier] < currentMinDistance) {
                currentMinDistance = pathDistances[nodeIdentifier];
                currentMinNode = nodeIdentifier;
            }
        }

        if (currentMinNode === -1) { // No reachable unvisited nodes left
            break;
        }

        unvisitedNodes.delete(currentMinNode); // Mark as visited

        // Update distances to neighbors
        for (let neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++) {
            const edgeWeight = graphMatrix[currentMinNode][neighborIdx];
            if (edgeWeight !== Infinity) { // If an edge exists
                const potentialNewDistance = pathDistances[currentMinNode] + edgeWeight;
                if (potentialNewDistance < pathDistances[neighborIdx]) {
                    pathDistances[neighborIdx] = potentialNewDistance;
                }
            }
        }
    }
    return pathDistances;
}

// Main logic function
function evaluateConnectivity(maxJumpLength, totalNodes, initialDisplacements) {
    const connectionGraph = createGrid(totalNodes + 2, totalNodes + 2, Infinity);

    // Build the graph based on jump rules
    Array.from({ length: totalNodes + 1 }, (_, originNode) => {
        Array.from({ length: maxJumpLength }, (_, jumpOffset) => {
            const displacementAtTarget = initialDisplacements[originNode + jumpOffset];
            const rawDestination = originNode + jumpOffset + displacementAtTarget;
            const boundedDestination = Math.min(Math.max(rawDestination, 0), totalNodes + 1);

            if (boundedDestination !== originNode) {
                connectionGraph[originNode][boundedDestination] = 1;
            }
        });
    });

    // Check reachability from node 0 to node totalNodes + 1
    const initialReachability = calculateShortestPaths(connectionGraph, 0);
    if (initialReachability[totalNodes + 1] === Infinity) {
        return false;
    }

    let temporaryDistances; // This variable shadows the 'initialDisplacements' parameter, preserving original behavior.
    // Check reachability from each intermediate node (1 to totalNodes) to node totalNodes + 1
    for (let nodeIndex = 1; nodeIndex <= totalNodes; nodeIndex++) {
        if (initialReachability[nodeIndex] < Infinity) { // Only if nodeIndex is reachable from 0
            temporaryDistances = calculateShortestPaths(connectionGraph, nodeIndex);
            if (temporaryDistances[totalNodes + 1] === Infinity) {
                return false;
            }
        }
    }
    return true;
}

// Main program loop
let currentMaxJump;
while ((currentMaxJump = retrieveNumericLine()) !== 0) {
    const displacementArray = [];
    const currentTotalNodes = retrieveNumericLine();
    displacementArray[0] = 0;
    displacementArray[currentTotalNodes + 1] = 0;
    for (let k = 1; k <= currentTotalNodes; k++) {
        displacementArray[k] = retrieveNumericLine();
    }
    console.log(evaluateConnectivity(currentMaxJump, currentTotalNodes, displacementArray) ? 'OK' : 'NG');
}
