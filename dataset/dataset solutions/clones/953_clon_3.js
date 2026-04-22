// Expert-generated Type III clone of a JavaScript Prim's-like algorithm.

// Core module for file system operations.
const fileSystemModule = require('fs');

// Read the raw input from standard input, decode it, trim whitespace, and split into individual lines.
const inputDataLines = fileSystemModule.readFileSync('/dev/stdin', 'utf-8').trim().split('\n');

/**
 * Determines the Minimum Spanning Tree (MST) edges for a given graph representation.
 * This implementation uses a variant of Prim's algorithm.
 *
 * The graph is expected as an adjacency map, where each key represents a source node's identifier
 * and its corresponding value is an array of connection objects.
 * Each connection object specifies a `destinationNodeId` and an `edgeCost`.
 *
 * @param {Object.<number, Array<{destinationNodeId: number, edgeCost: number}>>} adjacencyMap - The graph's adjacency representation.
 * @returns {Array<{destinationNodeId: number, edgeCost: number}>} A collection of edge objects that constitute the MST.
 */
const calculateMinimumSpanningEdges = (adjacencyMap) => {
    // A set to efficiently track all nodes that have already been included in the growing MST.
    const includedNodes = new Set();
    // Initialize the MST with the first node (node ID 0).
    includedNodes.add(0);

    // An array to store the edges selected for the MST.
    const mstEdgesCollection = [];

    // Determine the total number of nodes in the graph to know when the MST is complete.
    const totalGraphNodes = Object.keys(adjacencyMap).length;

    // Continue adding nodes to the MST until all nodes are included.
    // An MST of N nodes will have N-1 edges.
    while (includedNodes.size < totalGraphNodes) {
        let availableEdgesForExpansion = [];

        // Iterate through each node that is currently part of the MST.
        for (const sourceNodeIdentifier of Array.from(includedNodes)) {
            // Retrieve all direct connections from the current source node.
            const connectionsFromSource = adjacencyMap[sourceNodeIdentifier] || [];

            // Filter these connections to only include those leading to nodes NOT yet in the MST.
            const validOutboundConnections = connectionsFromSource.filter(
                (connection) => !includedNodes.has(connection.destinationNodeId)
            );
            // Add these valid connections to our pool of potential edges for the next step.
            availableEdgesForExpansion.push(...validOutboundConnections);
        }

        // If no more edges can be added (e.g., graph is disconnected), exit the loop.
        if (availableEdgesForExpansion.length === 0) {
            // This scenario should ideally not occur in a connected graph where an MST exists.
            break;
        }

        // Find the edge with the minimum cost among all available edges.
        let cheapestAvailableEdge = availableEdgesForExpansion[0]; // Assume first is cheapest initially.
        for (let i = 1; i < availableEdgesForExpansion.length; i++) {
            const currentCandidateEdge = availableEdgesForExpansion[i];
            if (currentCandidateEdge.edgeCost < cheapestAvailableEdge.edgeCost) {
                cheapestAvailableEdge = currentCandidateEdge;
            }
        }

        // Add the destination node of the cheapest edge to the set of included nodes.
        includedNodes.add(cheapestAvailableEdge.destinationNodeId);
        // Add this cheapest edge itself to our collection of MST edges.
        mstEdgesCollection.push(cheapestAvailableEdge);
    }

    return mstEdgesCollection;
};

// A constant representing an invalid or non-existent connection in the input matrix.
const NON_EXISTENT_CONNECTION_VALUE = -1;

/**
 * Parses a single string representing a row of the adjacency matrix into a list of valid connections.
 * Each connection is an object with `destinationNodeId` and `edgeCost`.
 *
 * @param {string} rowContent - The string content of a single row from the input.
 * @param {number} currentSourceNodeIndex - The index of the source node for this row.
 * @returns {Array<{destinationNodeId: number, edgeCost: number}>} An array of parsed and validated connections.
 */
const processInputRowToConnections = (rowContent, currentSourceNodeIndex) => {
    // Split the row by spaces, converting each cell value to a number.
    return rowContent.trim().split(' ')
        .map((stringValue, targetNodeIndex) => ({
            destinationNodeId: targetNodeIndex,
            edgeCost: Number(stringValue) // Convert string to numeric edge cost.
        }))
        // Filter out connections that have the 'non-existent' marker.
        .filter(link => link.edgeCost !== NON_EXISTENT_CONNECTION_VALUE);
};

// Process the raw input lines to construct the graph's adjacency map.
// The first line of input is typically metadata (e.g., number of nodes), which is skipped for graph construction.
const graphAdjacencyStructure = inputDataLines
    .slice(1) // Skip the initial metadata line.
    .reduce((accumulatorMap, currentLineString, sourceNodeIdx) => {
        // Parse the current line into a list of connections for the current source node.
        const connectionsForNode = processInputRowToConnections(currentLineString, sourceNodeIdx);
        // Store these connections in the adjacency map, keyed by the source node's index.
        accumulatorMap[sourceNodeIdx] = connectionsForNode;
        return accumulatorMap;
    }, {}); // Initialize the accumulator as an empty object for the graph.

// Calculate the sum of all edge costs in the computed Minimum Spanning Tree.
const finalTotalSpanningCost = calculateMinimumSpanningEdges(graphAdjacencyStructure)
    .reduce((currentSumOfCosts, mstEdge) => currentSumOfCosts + mstEdge.edgeCost, 0);

// Output the final calculated total cost of the MST to standard output.
console.log(finalTotalSpanningCost);