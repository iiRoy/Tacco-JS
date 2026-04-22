'use strict';

const PRIME_DIVISOR = 1000000007;

// Function to perform the recursive calculation for a subtree
// This calculates the number of ways to select nodes such that the current node
// is either included or excluded, adhering to specific rules (e.g., no adjacent chosen nodes).
const calculateSubtreeSelections = (
    currentVertex,
    connectionNetwork,
    alreadyVisited,
    modValue
) => {
    // 'excludedFromSet': currentVertex is NOT part of the selection.
    // Its children can be either included or excluded.
    // 'includedInSet': currentVertex IS part of the selection.
    // Its children MUST be excluded.
    let selectionCounts = { excludedFromSet: 1, includedInSet: 1 };

    alreadyVisited.add(currentVertex); // Mark current vertex as processed for this path

    const adjacentVertices = connectionNetwork.get(currentVertex) || new Set();

    for (const connectedVertex of adjacentVertices) {
        if (!alreadyVisited.has(connectedVertex)) {
            const childResult = calculateSubtreeSelections(
                connectedVertex,
                connectionNetwork,
                alreadyVisited,
                modValue
            );

            selectionCounts.excludedFromSet =
                (selectionCounts.excludedFromSet *
                    (childResult.excludedFromSet + childResult.includedInSet)) %
                modValue;

            selectionCounts.includedInSet =
                (selectionCounts.includedInSet * childResult.excludedFromSet) %
                modValue;
        }
    }
    return selectionCounts;
};

// Function to construct the graph's adjacency structure
const constructGraphConnections = (totalVertexCount, rawEdgeData) => {
    const networkMap = new Map();
    for (let j = 1; j <= totalVertexCount; ++j) {
        networkMap.set(j, new Set());
    }

    for (const edgePair of rawEdgeData) {
        const firstVertex = edgePair[0];
        const secondVertex = edgePair[1];
        networkMap.get(firstVertex).add(secondVertex);
        networkMap.get(secondVertex).add(firstVertex);
    }
    return networkMap;
};

// Main logic for processing the graph and deriving the final answer
const processGraphScenario = (nodeQuantity, edgeDescriptions) => {
    const graphStructure = constructGraphConnections(nodeQuantity, edgeDescriptions);
    const visitedTracker = new Set();

    // The problem implies starting from node 1 and calculating for its component.
    const finalSelectionResults = calculateSubtreeSelections(
        1,
        graphStructure,
        visitedTracker,
        PRIME_DIVISOR
    );

    return (finalSelectionResults.excludedFromSet + finalSelectionResults.includedInSet) % PRIME_DIVISOR;
};

// Entry point for input processing and output
const orchestrateCalculation = (inputString) => {
    const allInputLines = inputString.split("\n");
    const quantityOfNodes = parseInt(allInputLines[0], 10);
    // Parse edge data, ensuring each element is an integer
    const descriptionsOfEdges = allInputLines
        .slice(1)
        .map(lineText => lineText.split(' ').map(strNum => parseInt(strNum, 10)));

    const finalAnswer = processGraphScenario(quantityOfNodes, descriptionsOfEdges);
    console.log(finalAnswer);
};

orchestrateCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));