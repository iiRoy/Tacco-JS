// This script processes graph adjacency list data from standard input
// and converts it into an adjacency matrix representation, which is then printed.

// --- Input Acquisition Stage ---
// Acquire raw textual data from the standard input stream.
// Using 'fs' module for synchronous file reading, targeting '/dev/stdin' on Unix-like systems.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// --- Pre-processing Input Data ---
// Clean up the raw input: remove leading/trailing whitespace and split into individual lines.
const textualLines = rawInputContent.trim().split('\n');

// The first line typically contains the total number of nodes in the graph.
// Parse this value and ensure it's a valid positive integer.
const totalNodeCountStr = textualLines[0];
const graphNodeQuantity = parseInt(totalNodeCountStr, 10);

// --- Input Validation (Added Guard Clause) ---
// Ensure that the number of nodes is a positive value.
if (isNaN(graphNodeQuantity) || graphNodeQuantity <= 0) {
    console.error("Error: Invalid or non-positive node count provided. Exiting.");
    process.exit(1); // Terminate execution with an error code
}

// Extract subsequent lines which represent the adjacency list for each node.
// Each line describes a node and its connections.
const adjacencyListLines = textualLines.slice(1);

// Helper function to parse a single line of space-separated numbers.
const parseLineToNumbers = (text) => text.split(' ').map(val => parseInt(val, 10));

// Parse each adjacency list line into an array of numbers.
// The first element is the source node, the second is the count of neighbors,
// and the rest are the neighbor nodes.
const parsedConnectionDetails = adjacencyListLines.map(lineText => {
    return parseLineToNumbers(lineText);
});

// --- Adjacency Matrix Initialization Stage ---
// Create a square matrix of size 'graphNodeQuantity' x 'graphNodeQuantity'.
// All cells are initially set to 0, indicating no direct connection.
const graphAdjacencyMatrix = Array.from({ length: graphNodeQuantity }, () =>
    Array.from({ length: graphNodeQuantity }, () => 0)
);

// --- Matrix Population Stage ---
// Iterate through each entry in the parsed connection details.
// Each entry corresponds to a node's adjacency information.
parsedConnectionDetails.forEach(nodeConnectionInfo => {
    // Extract node identifiers and neighbor list from the current line.
    // Node identifiers are typically 1-based in problem statements,
    // so we need to adjust them to 0-based for array indexing.
    const sourceNodeIdentifierOneBased = nodeConnectionInfo[0];
    const numberOfNeighbors = nodeConnectionInfo[1]; // This variable is extracted but not explicitly iterated with a for-loop counter anymore.
    const neighborIdentifiersOneBased = nodeConnectionInfo.slice(2);

    // Convert the 1-based source node identifier to 0-based index.
    const sourceNodeIndexZeroBased = sourceNodeIdentifierOneBased - 1;

    // --- Further Validation (Added Intermediate Check) ---
    // Ensure the source node index is within valid bounds.
    if (sourceNodeIndexZeroBased < 0 || sourceNodeIndexZeroBased >= graphNodeQuantity) {
        console.warn(`Warning: Source node ${sourceNodeIdentifierOneBased} out of bounds (${graphNodeQuantity} nodes total). Skipping connection entry.`);
        return; // Skip this entry
    }

    // Iterate through the list of neighbors for the current source node.
    neighborIdentifiersOneBased.forEach(targetNodeIdentifierOneBased => {
        // Convert the 1-based target node identifier to 0-based index.
        const targetNodeIndexZeroBased = targetNodeIdentifierOneBased - 1;

        // --- Further Validation (Added Intermediate Check) ---
        // Ensure the target node index is within valid bounds.
        if (targetNodeIndexZeroBased < 0 || targetNodeIndexZeroBased >= graphNodeQuantity) {
            console.warn(`Warning: Target node ${targetNodeIdentifierOneBased} for source ${sourceNodeIdentifierOneBased} out of bounds (${graphNodeQuantity} nodes total). Skipping neighbor.`);
            return; // Skip this neighbor
        }

        // Set the corresponding cell in the adjacency matrix to 1,
        // indicating a direct connection from the source to the target.
        // (Assuming a directed graph representation, as per original problem context)
        graphAdjacencyMatrix[sourceNodeIndexZeroBased][targetNodeIndexZeroBased] = 1;
    });
});

// --- Output Generation Stage ---
// Print the resulting adjacency matrix to standard output.
// Each row of the matrix is printed on a new line, with elements separated by spaces.
graphAdjacencyMatrix.forEach(matrixRow => {
    console.log(matrixRow.join(' '));
});

// End of script execution.