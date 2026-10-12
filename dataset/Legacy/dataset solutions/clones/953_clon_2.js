const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');

/**
 * Computes the Minimum Spanning Tree (MST) of a given graph using a Prim's-like algorithm.
 * The graph is expected to be represented as an adjacency list where each entry
 * maps a node index to an array of its connected edges.
 * Each edge object contains a 'nodeIdentifier' (the target node) and an 'edgeWeight'.
 *
 * @param {Object.<number, Array<{nodeIdentifier: number, edgeWeight: number}>>} adjacencyList - The graph structure.
 * @returns {Array<{nodeIdentifier: number, edgeWeight: number}>} An array of edge objects that constitute the MST.
 */
const calculateMinimumSpanningTree = (adjacencyList) => {
    // Initialize the set of nodes already included in the MST, starting with node 0.
    const visitedNodes = [0];
    // This array will store the edges selected for the MST.
    const mstEdges = [];
    // Determine the total number of nodes in the graph.
    const totalNodes = Object.keys(adjacencyList).length;

    // Continue adding edges until all nodes are part of the MST.
    while (visitedNodes.length !== totalNodes) {
        // Gather all possible edges from the currently visited nodes to unvisited nodes.
        const candidateEdges = visitedNodes
            .map((nodeIdentifier) => adjacencyList[nodeIdentifier]) // Get all edges connected to each visited node.
            .reduce((accumulator, currentEdges) => [...accumulator, ...currentEdges]) // Flatten the array of edge lists into a single list.
            .filter((edge) => visitedNodes.every((visitedId) => visitedId !== edge.nodeIdentifier)); // Filter out edges that lead to already visited nodes.

        // Find the edge with the minimum weight among the candidate edges.
        const minWeightEdge = candidateEdges.reduce((accumulator, currentEdge) =>
            accumulator.edgeWeight > currentEdge.edgeWeight ? currentEdge : accumulator
        );

        // Add the destination node of the minimum weight edge to the set of visited nodes.
        visitedNodes.push(minWeightEdge.nodeIdentifier);
        // Add this minimum weight edge to our MST result.
        mstEdges.push(minWeightEdge);
    }

    // Return the collection of edges that form the MST.
    return mstEdges;
};

// Parse the input data to construct the graph's adjacency list.
const parsedGraphData = inputLines
    .slice(1) // Skip the first line, which might contain metadata like node count.
    .map((lineStr) => {
        // For each subsequent line, split by space to get individual edge weights.
        return lineStr.trim().split(' ')
            .map((weightStr, nodeIndex) => {
                // Convert string weight to number and create an edge object.
                // 'nodeIdentifier' is the target node, 'edgeWeight' is the cost.
                return { nodeIdentifier: nodeIndex, edgeWeight: Number(weightStr) };
            })
            .filter((edge) => edge.edgeWeight !== -1); // Filter out non-existent connections (represented by -1).
    })
    .reduce((graphMap, nodeEdges, currentNodeIndex) => {
        // Populate the adjacency list object: key is source node, value is array of edges.
        graphMap[currentNodeIndex] = nodeEdges;
        return graphMap;
    }, {}); // Start with an empty object for the graph map.

// Calculate the MST using the parsed graph data, then sum the weights of all edges in the MST
// and print the total sum to the console.
console.log(
    calculateMinimumSpanningTree(parsedGraphData)
        .reduce((totalWeight, edge) => totalWeight + edge.edgeWeight, 0)
);
