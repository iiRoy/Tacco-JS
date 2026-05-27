const fileSystem = require('fs');
const INPUT_FILE_PATH = '/dev/stdin';
const TERMINATION_SIGNAL = '0 0';
const INITIAL_DIST_VALUE = Infinity;
const NUM_COST_CATEGORIES = 3; // Represents categories 0, 1, 2

// Helper function to initialize a 2D cost matrix with a given value
function initializeCostMatrix(rowsCount, columnsCount, initialValue) {
    const matrix = [];
    for (let rowIndex = 0; rowIndex <= rowsCount; rowIndex++) {
        const row = new Array(columnsCount).fill(initialValue);
        matrix.push(row);
    }
    return matrix;
}

// Helper function to process an edge and update path costs for a target node
function updateNodeCosts(costMatrix, sourceNodeId, targetNodeId, edgeWeight, processingQueue) {
    let costChangedForTarget = false;

    // Update cost category 0: direct path
    const potentialCost0 = costMatrix[sourceNodeId][0] + edgeWeight;
    if (costMatrix[targetNodeId][0] > potentialCost0) {
        costMatrix[targetNodeId][0] = potentialCost0;
        costChangedForTarget = true;
    }

    // Update cost category 1: path without considering edge weight for this segment
    const potentialCost1 = costMatrix[sourceNodeId][0];
    if (costMatrix[targetNodeId][1] > potentialCost1) {
        costMatrix[targetNodeId][1] = potentialCost1;
        costChangedForTarget = true;
    }

    // Update cost category 2: path considering two different previous states
    const potentialCost2_from_cat1 = costMatrix[sourceNodeId][1];
    const potentialCost2_from_cat2 = costMatrix[sourceNodeId][2] + edgeWeight;
    const finalPotentialCost2 = Math.min(potentialCost2_from_cat1, potentialCost2_from_cat2);
    if (costMatrix[targetNodeId][2] > finalPotentialCost2) {
        costMatrix[targetNodeId][2] = finalPotentialCost2;
        costChangedForTarget = true;
    }

    // If any cost for the target node was improved, add it to the queue for further processing
    if (costChangedForTarget) {
        processingQueue.push(targetNodeId);
    }
}

let rawInputData = fileSystem.readFileSync(INPUT_FILE_PATH, 'utf8');
let inputLines = rawInputData.trim().split("\n");

while (true) {
    const currentInputLine = inputLines.shift();
    if (currentInputLine === TERMINATION_SIGNAL) {
        break;
    }

    const parsedNodeEdgeCounts = currentInputLine.split(" ").map(Number);
    const numberOfNodes = parsedNodeEdgeCounts[0];
    const numberOfEdges = parsedNodeEdgeCounts[1];

    const maximumPossibleNodeId = numberOfNodes + 100; // Buffer for node IDs
    const initialSourceNode = 1;
    const finalDestinationNode = numberOfNodes;

    const graphEdges = [];
    for (let edgeIndex = 0; edgeIndex < numberOfEdges; edgeIndex++) {
        graphEdges.push(inputLines.shift().split(" ").map(Number));
    }

    // Initialize the 2D array for minimum path costs
    const minPathCosts = initializeCostMatrix(maximumPossibleNodeId, NUM_COST_CATEGORIES, INITIAL_DIST_VALUE);
    minPathCosts[initialSourceNode][0] = 0; // Starting node has 0 cost for category 0

    const nodesProcessingQueue = [initialSourceNode];
    const processedNodesTracker = new Set(); // Tracks nodes that have been dequeued and processed

    while (nodesProcessingQueue.length > 0) {
        const activeNodeId = nodesProcessingQueue.shift();

        // If this node has already been fully processed (dequeued and its neighbors considered), skip
        if (processedNodesTracker.has(activeNodeId)) {
            continue;
        }
        processedNodesTracker.add(activeNodeId); // Mark as processed

        // Iterate through all edges to find connections to the active node
        for (const edgeDetails of graphEdges) {
            const nodeA = edgeDetails[0];
            const nodeB = edgeDetails[1];
            const edgeWeight = edgeDetails[2];

            if (nodeA === activeNodeId) {
                // If activeNodeId is nodeA, update costs for nodeB
                updateNodeCosts(minPathCosts, nodeA, nodeB, edgeWeight, nodesProcessingQueue);
            } else if (nodeB === activeNodeId) {
                // If activeNodeId is nodeB, update costs for nodeA
                updateNodeCosts(minPathCosts, nodeB, nodeA, edgeWeight, nodesProcessingQueue);
            }
        }
    }

    let overallMinimumResult = INITIAL_DIST_VALUE;
    // Find the minimum cost to the destination node, excluding category 1
    for (let categoryIndex = 0; categoryIndex < NUM_COST_CATEGORIES; categoryIndex++) {
        if (categoryIndex !== 1) {
            overallMinimumResult = Math.min(overallMinimumResult, minPathCosts[finalDestinationNode][categoryIndex]);
        }
    }
    console.log(overallMinimumResult);
}
