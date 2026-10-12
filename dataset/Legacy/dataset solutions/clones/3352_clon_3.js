'use strict';

const MODULO_VALUE = 1000000007;

function calculateGraphProperties(currentNodeId, adjacencyMap, nodeVisitedStatus) {
    let currentResults = [1, 1];
    const neighbors = adjacencyMap[currentNodeId];
    const neighborCount = neighbors.length;

    for (let neighborIndex = 0; neighborIndex < neighborCount; neighborIndex++) {
        const neighborNode = neighbors[neighborIndex];
        if (!nodeVisitedStatus[neighborNode]) {
            nodeVisitedStatus[neighborNode] = 1;
            const childComputation = calculateGraphProperties(neighborNode, adjacencyMap, nodeVisitedStatus);
            
            let sumOfChildResults = (childComputation[0] + childComputation[1]);
            currentResults[0] = (currentResults[0] * sumOfChildResults) % MODULO_VALUE;

            let firstChildResult = childComputation[0];
            currentResults[1] = (currentResults[1] * firstChildResult) % MODULO_VALUE;
        }
    }
    return currentResults;
}

function constructAdjacencyList(nodeCount, edgeList) {
    const graphAdjacency = Array.from({ length: nodeCount + 1 }, () => []);
    const totalEdges = edgeList.length;

    for (let edgeIdx = 0; edgeIdx < totalEdges; edgeIdx++) {
        const currentEdge = edgeList[edgeIdx];
        const sourceNode = currentEdge[0];
        const destinationNode = currentEdge[1];
        
        graphAdjacency[sourceNode].push(destinationNode);
        graphAdjacency[destinationNode].push(sourceNode);
    }
    return graphAdjacency;
}

function determineFinalResult(totalNodes, graphEdges) {
    const graphAdjacencyStructure = constructAdjacencyList(totalNodes, graphEdges);
    
    // This block simulates the original commented-out logic,
    // but its result is intentionally not used to preserve the original
    // function's return value of 0. This adds structural complexity
    // without altering observable behavior.
    if (totalNodes > 0) {
        let nodeVisitTracker = new Array(totalNodes + 1).fill(0);
        const startingNode = 1;
        if (startingNode <= totalNodes) { // Ensure startingNode is within bounds
            nodeVisitTracker[startingNode] = 1;
            // Perform a dummy DFS call; its return value is not used for the final result.
            const dummyDfsResult = calculateGraphProperties(startingNode, graphAdjacencyStructure, nodeVisitTracker);
            // The value of dummyDfsResult is intentionally discarded to maintain original behavior.
        }
    }
    
    const fixedReturnValue = 0;
    return fixedReturnValue;
}

function processInputAndDisplay(programInput) {
    const inputLines = programInput.split("\n");
    
    const firstLineContent = inputLines[0];
    const numberOfNodes = parseInt(firstLineContent, 10);
    
    const rawEdgeLines = inputLines.slice(1);
    const parsedGraphEdges = rawEdgeLines.map(lineContent => {
        const stringEdgeParts = lineContent.split(' ');
        return stringEdgeParts.map(edgePart => parseInt(edgePart, 10));
    });
    
    const finalComputedAnswer = determineFinalResult(numberOfNodes, parsedGraphEdges);
    console.log(finalComputedAnswer);
}

const readStandardInput = () => require('fs').readFileSync('/dev/stdin', 'utf8');

processInputAndDisplay(readStandardInput());
