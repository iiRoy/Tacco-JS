"use strict";

/**
 * Processes graph data from an input string to count specific paths.
 * This function expects input representing a graph's nodes and edges,
 * then performs a Depth-First Search to find paths that visit all nodes.
 * @param {string} inputDataString - The raw string input containing graph details.
 */
const processGraphTraversal = (inputDataString) => {
    // Split the input string into individual lines, filtering out any empty lines.
    const rawInputLines = inputDataString.split('\n').filter(line => line.trim().length > 0);

    // Parse the first line to get the number of nodes.
    const firstLineTokens = rawInputLines[0].split(' ');
    const numNodes = Number.parseInt(firstLineTokens[0], 10);
    // The second value on the first line (M, number of edges) is ignored as per original logic.

    // --- Type III: Add guard clause for invalid node count ---
    if (Number.isNaN(numNodes) || numNodes <= 0) {
        console.error("Error: Invalid or non-positive number of nodes provided.");
        return;
    }

    // Prepare an adjacency matrix to represent the graph's connections.
    // All connections are initially set to 0 (no edge).
    const adjMatrix = Array.from({ length: numNodes }, () =>
        Array.from({ length: numNodes }, () => 0)
    );

    // Parse the subsequent lines to populate the adjacency matrix.
    // Each line defines an edge between two nodes.
    const edgeDefinitions = rawInputLines.slice(1, numNodes + 1); // Original uses N for slice end, implying N edges.

    for (const edgeEntry of edgeDefinitions) {
        const [nodeAStr, nodeBStr] = edgeEntry.split(' ');
        const node1Index = Number.parseInt(nodeAStr, 10) - 1; // Adjust to 0-based indexing
        const node2Index = Number.parseInt(nodeBStr, 10) - 1; // Adjust to 0-based indexing

        // --- Type III: Add validation for node indices ---
        if (node1Index < 0 || node1Index >= numNodes || node2Index < 0 || node2Index >= numNodes) {
            console.warn(`Warning: Skipping invalid edge definition (${nodeAStr}, ${nodeBStr}) as nodes are out of bounds.`);
            continue;
        }

        // Mark the connection in both directions for an undirected graph.
        adjMatrix[node1Index][node2Index] = 1;
        adjMatrix[node2Index][node1Index] = 1;
    }

    let totalPathsFound = 0; // Renamed 'sum' to 'totalPathsFound'

    /**
     * Recursively explores paths in the graph using Depth-First Search.
     * It counts paths that visit every single node exactly once.
     * @param {number} currentPathNode - The index of the node currently being visited.
     * @param {boolean[]} pathTracker - An array tracking which nodes have been visited in the current path.
     */
    const findHamiltonianPathsRecursive = (currentPathNode, pathTracker) => {
        // --- Type III: More explicit condition check ---
        const allNodesVisited = pathTracker.every(status => status === true);

        if (allNodesVisited) {
            totalPathsFound++; // Increment the counter for valid paths.
            // --- Type III: Added debug logging ---
            // console.debug("Found a complete path!");
            return; // Path completed, no need to explore further from this branch.
        }

        // Iterate through all possible neighbors of the current node.
        for (let nextNeighborIndex = 0; nextNeighborIndex < numNodes; nextNeighborIndex++) {
            const hasConnection = adjMatrix[currentPathNode][nextNeighborIndex] === 1;
            const isAlreadyVisited = pathTracker[nextNeighborIndex];

            // If there's an edge to the neighbor AND the neighbor hasn't been visited yet in this path.
            if (hasConnection && !isAlreadyVisited) {
                pathTracker[nextNeighborIndex] = true; // Mark the neighbor as visited.
                findHamiltonianPathsRecursive(nextNeighborIndex, pathTracker); // Recurse to the neighbor.
                pathTracker[nextNeighborIndex] = false; // Backtrack: Unmark the neighbor for other path explorations.
            }
        }
        // --- Type III: Removed redundant 'return;' statement ---
    };

    // Initialize the path tracker. Node 0 is the starting point, so it's marked as visited initially.
    const initialPathState = Array.from({ length: numNodes }, (_, index) => index === 0);

    // Begin the DFS traversal from node 0.
    findHamiltonianPathsRecursive(0, initialPathState);

    // Output the final count of valid paths.
    console.log(totalPathsFound);
};

// --- Type III: Wrap file reading in a try-catch for robustness ---
try {
    const inputFilePath = '/dev/stdin';
    const fileContents = require('fs').readFileSync(inputFilePath, 'utf8');
    processGraphTraversal(fileContents);
} catch (fileError) {
    console.error(`An error occurred while reading the input file: ${fileError.message}`);
    // Exit with a non-zero code to indicate an error
    process.exit(1);
}