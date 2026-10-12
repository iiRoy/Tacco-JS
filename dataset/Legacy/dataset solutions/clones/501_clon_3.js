const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lines = rawData.trim().split("\n");

// Constants for DP states and initial values
const DP_STATE_0 = 0;
const DP_STATE_1 = 1;
const DP_STATE_2 = 2;
const MAX_DP_STATE_INDEX = 2; // Corresponds to original 'c', meaning indices 0, 1, 2
const INITIAL_MIN_COST = Infinity;
const TERMINATION_SIGNAL = "0 0";

// Helper function to parse a space-separated string into an array of numbers
function parseNumericLine(inputLine) {
    return inputLine.split(" ").map(Number);
}

// Helper function to create and initialize a 2D DP table
function createCostTable(numNodes, maxStateIndex, initialValue) {
    const table = [];
    for (let nodeIndex = 0; nodeIndex <= numNodes; nodeIndex++) {
        table[nodeIndex] = new Array(maxStateIndex + 1).fill(initialValue);
    }
    return table;
}

// Helper function to update costs for a neighbor node based on current node's costs
function propagateCosts(sourceNode, targetNode, edgeWeight, costTable, processingQueue) {
    // Update for DP_STATE_0: direct path
    costTable[targetNode][DP_STATE_0] = Math.min(costTable[targetNode][DP_STATE_0], costTable[sourceNode][DP_STATE_0] + edgeWeight);

    // Update for DP_STATE_1: path using one special condition (e.g., "bomb" used at sourceNode)
    costTable[targetNode][DP_STATE_1] = Math.min(costTable[targetNode][DP_STATE_1], costTable[sourceNode][DP_STATE_0]);

    // Update for DP_STATE_2: path using two special conditions
    costTable[targetNode][DP_STATE_2] = Math.min(costTable[targetNode][DP_STATE_2], costTable[sourceNode][DP_STATE_1]);
    costTable[targetNode][DP_STATE_2] = Math.min(costTable[targetNode][DP_STATE_2], costTable[sourceNode][DP_STATE_2] + edgeWeight);

    processingQueue.push(targetNode);
}

// Main processing loop for multiple test cases
while (true) {
    const currentLine = lines.shift();
    if (currentLine === TERMINATION_SIGNAL) {
        break;
    }

    const [nodeCount, edgeCount] = parseNumericLine(currentLine);

    const startNode = 1;
    const destinationNode = nodeCount;

    const graphEdges = [];
    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        graphEdges.push(parseNumericLine(lines.shift()));
    }

    const minimumPathCosts = createCostTable(nodeCount, MAX_DP_STATE_INDEX, INITIAL_MIN_COST);
    minimumPathCosts[startNode][DP_STATE_0] = 0;

    const nodesQueue = [startNode];
    const visitedNodes = new Set(); // Using Set for efficient lookup of processed nodes

    // Breadth-First Search (BFS) like traversal for DP updates
    while (nodesQueue.length > 0) {
        const activeNode = nodesQueue.shift();

        if (visitedNodes.has(activeNode)) {
            continue;
        }
        visitedNodes.add(activeNode);

        // Iterate through all edges to find neighbors of the activeNode and update costs
        graphEdges.forEach(function(edgeDetails) {
            const nodeU = edgeDetails[0];
            const nodeV = edgeDetails[1];
            const weight = edgeDetails[2];

            if (nodeU === activeNode) {
                propagateCosts(nodeU, nodeV, weight, minimumPathCosts, nodesQueue);
            } else if (nodeV === activeNode) {
                propagateCosts(nodeV, nodeU, weight, minimumPathCosts, nodesQueue);
            }
            // This specific line is preserved from the original code.
            // It resets the DP_STATE_1 cost for the destination node to Infinity
            // for every edge processed within this loop iteration.
            minimumPathCosts[destinationNode][DP_STATE_1] = INITIAL_MIN_COST;
        });
    }

    let overallMinCost = INITIAL_MIN_COST;
    minimumPathCosts[destinationNode].forEach(function(costValue) {
        overallMinCost = Math.min(overallMinCost, costValue);
    });
    console.log(overallMinCost);
}
