const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineBuffer = rawData.trim().split("\n");

// Helper function to initialize a 2D array (matrix) with a given value
function initializeCostMatrix(rows, cols, initialValue) {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        matrix[r] = [];
        for (let c = 0; c < cols; c++) {
            matrix[r][c] = initialValue;
        }
    }
    return matrix;
}

// Helper function to update costs for a neighbor node based on the current node's state
function updateNeighborStateCosts(targetNode, currentSourceNodeCost, edgeWeight, sourceStateIndex, costMatrix) {
    // sourceStateIndex corresponds to 'i' in the original loop (0, 1, 2)
    if (sourceStateIndex === 0) {
        costMatrix[targetNode][0] = Math.min(costMatrix[targetNode][0], currentSourceNodeCost + edgeWeight);
        costMatrix[targetNode][1] = Math.min(costMatrix[targetNode][1], currentSourceNodeCost);
    } else if (sourceStateIndex === 1) {
        costMatrix[targetNode][2] = Math.min(costMatrix[targetNode][2], currentSourceNodeCost);
    } else if (sourceStateIndex === 2) {
        costMatrix[targetNode][2] = Math.min(costMatrix[targetNode][2], currentSourceNodeCost + edgeWeight);
    }
}

// Helper function to process all edges connected to the active node
function processConnectedEdges(activeNode, edges, costMatrix, nodeQueue) {
    edges.forEach(function(edgeData) {
        const nodeU = edgeData[0];
        const nodeV = edgeData[1];
        const edgeWeight = edgeData[2];

        let neighborNode = -1;
        if (nodeU === activeNode) {
            neighborNode = nodeV;
        } else if (nodeV === activeNode) {
            neighborNode = nodeU;
        }

        if (neighborNode !== -1) {
            // Iterate through all possible states of the activeNode (0, 1, 2)
            for (let stateIdx = 2; stateIdx >= 0; stateIdx--) {
                const currentActiveNodeCost = costMatrix[activeNode][stateIdx];
                // Only proceed if there's a valid path to activeNode in this state
                if (currentActiveNodeCost !== Infinity) {
                    updateNeighborStateCosts(neighborNode, currentActiveNodeCost, edgeWeight, stateIdx, costMatrix);
                }
            }
            // Add neighbor to queue. The original algorithm re-adds nodes if they might be improved.
            nodeQueue.push(neighborNode);
        }
    });
}

const TERMINATION_SIGNAL = "0 0";
const INITIAL_PATH_COST = Infinity;

while (true) {
    const dimensions = lineBuffer.shift().split(" ").map(Number);
    const [nodeCount, edgeCount] = dimensions;

    if (dimensions[0] === 0 && dimensions[1] === 0) { // Equivalent to "0 0" check
        break;
    }

    const maxStateIndex = 2; // Represents states 0, 1, 2
    const startNode = 1;
    const destinationNode = nodeCount;

    const edgeList = [];
    for (let idx = 0; idx < edgeCount; idx++) {
        edgeList.push(lineBuffer.shift().split(" ").map(Number));
    }

    // Initialize minCosts (dp) matrix
    const minCosts = initializeCostMatrix(nodeCount + 1, maxStateIndex + 1, INITIAL_PATH_COST);
    minCosts[startNode][0] = 0; // Cost to reach startNode in state 0 is 0

    const queueNodes = [startNode]; // Nodes to be processed
    const visitedNodes = {}; // Using an object as a set to track processed nodes for current iteration

    while (queueNodes.length > 0) {
        const currentNode = queueNodes.shift();

        // If this node has already been fully processed (its outgoing edges examined)
        if (visitedNodes.hasOwnProperty(currentNode)) {
            continue;
        }
        visitedNodes[currentNode] = true; // Mark as processed

        // Process all edges connected to the currentNode
        processConnectedEdges(currentNode, edgeList, minCosts, queueNodes);
    }

    // Calculate the final minimum cost to reach the destination node
    // The problem states to consider states 0 and 2 for the destination
    let finalMinCost = Math.min(minCosts[destinationNode][0], minCosts[destinationNode][2]);

    console.log(finalMinCost);
}
