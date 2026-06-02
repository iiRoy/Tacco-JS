const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInput.trim().split("\n");

// Helper function to apply cost updates for a directed edge (from -> to)
// This function encapsulates the core DP state transition logic.
const applyCostUpdates = (sourceNode, targetNode, edgeWeight, costsMatrix) => {
    // State 0: Path to sourceNode used no special edges.
    // Current edge is a normal edge.
    if (costsMatrix[sourceNode][0] !== Infinity) {
        costsMatrix[targetNode][0] = Math.min(costsMatrix[targetNode][0], costsMatrix[sourceNode][0] + edgeWeight);
        // If we reached sourceNode normally, and this is a normal edge,
        // then this edge can be considered the *first* special edge to reach targetNode.
        costsMatrix[targetNode][1] = Math.min(costsMatrix[targetNode][1], costsMatrix[sourceNode][0]);
    }

    // State 1: Path to sourceNode used one special edge.
    // Current edge is a normal edge.
    if (costsMatrix[sourceNode][1] !== Infinity) {
        // If we reached sourceNode with one special edge, and this is a normal edge,
        // then this edge can be considered the *second* special edge to reach targetNode.
        costsMatrix[targetNode][2] = Math.min(costsMatrix[targetNode][2], costsMatrix[sourceNode][1]);
    }

    // State 2: Path to sourceNode used two special edges.
    // Current edge is a normal edge.
    if (costsMatrix[sourceNode][2] !== Infinity) {
        // If we reached sourceNode with two special edges, and this is a normal edge,
        // then targetNode is reached with two special edges.
        costsMatrix[targetNode][2] = Math.min(costsMatrix[targetNode][2], costsMatrix[sourceNode][2] + edgeWeight);
    }
};

while (true) {
    const nodeEdgeCountsStr = inputLines.shift();
    const [numNodes, numEdges] = nodeEdgeCountsStr.split(" ").map(Number);

    // Break condition for the main loop
    if (numNodes === 0 && numEdges === 0) {
        break;
    }

    const maxSpecialEdgeStates = 2; // Corresponds to 'c' in original, meaning states 0, 1, 2
    const startNode = 1;
    const targetNode = numNodes;

    const edgeList = [];
    for (let i = 0; i < numEdges; i++) {
        edgeList.push(inputLines.shift().split(" ").map(Number));
    }

    // Initialize minCosts (dp) array
    // minCosts[node][state] stores the minimum cost to reach 'node' using 'state' special edges.
    const minCosts = Array.from({ length: numNodes + 1 }, () =>
        Array.from({ length: maxSpecialEdgeStates + 1 }, () => Infinity)
    );

    // Initial state: cost to startNode with 0 special edges is 0.
    minCosts[startNode][0] = 0;

    // Queue for nodes to process (similar to SPFA's queue)
    const nodesToProcess = [startNode];
    // Set to track nodes that have been processed from the queue in the current test case.
    // This prevents redundant processing of a node if it's added to the queue multiple times
    // before it's shifted out.
    const processedNodesInCurrentPass = new Set();

    while (nodesToProcess.length > 0) {
        const currentNode = nodesToProcess.shift();

        // If this node has already been processed in this pass, skip it.
        if (processedNodesInCurrentPass.has(currentNode)) {
            continue;
        }
        processedNodesInCurrentPass.add(currentNode);

        // Iterate through all edges to find neighbors of the currentNode
        edgeList.forEach(edgeData => {
            const [nodeA, nodeB, edgeWeight] = edgeData;

            if (nodeA === currentNode) {
                // If currentNode is nodeA, update costs for nodeB
                applyCostUpdates(nodeA, nodeB, edgeWeight, minCosts);
                nodesToProcess.push(nodeB); // Add neighbor to queue for further processing
            } else if (nodeB === currentNode) {
                // If currentNode is nodeB, update costs for nodeA
                applyCostUpdates(nodeB, nodeA, edgeWeight, minCosts);
                nodesToProcess.push(nodeA); // Add neighbor to queue for further processing
            }
        });
    }

    // Calculate the final minimum cost to the targetNode
    // The problem statement implies we should consider paths with 0 or 2 special edges.
    // State 1 (one special edge) is explicitly excluded from the final answer.
    const finalMinCost = Math.min(minCosts[targetNode][0], minCosts[targetNode][2]);

    console.log(finalMinCost);
}
