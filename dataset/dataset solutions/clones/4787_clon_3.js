const standardIn = process.stdin;
const standardOut = process.stdout;

// Initialize global storage for incoming data from standard input
let accumulatedInput = "";
// Array to hold individual lines once all input is received
let parsedInputLines = [];
// Index to keep track of the current line being processed
let currentLinePointer = 0;

// Set up input encoding for standard input stream
standardIn.setEncoding('utf8'); // Using 'utf8' is more modern and robust than 'ascii'

// Event listener for incoming data chunks
standardIn.on('data', (inputChunk) => {
    accumulatedInput += inputChunk;
});

// Event listener for the end of the input stream
standardIn.on('end', () => {
    // Split the entire input by newline characters
    parsedInputLines = accumulatedInput.split('\n');
    // Trigger the main computation logic
    executeSolution();
});

/**
 * Retrieves the next line from the parsed input array.
 * Increments the line pointer for subsequent calls.
 * @returns {string} The next line of input.
 */
function fetchNextLine() {
    if (currentLinePointer >= parsedInputLines.length) {
        // Handle cases where more lines are requested than available
        console.error("Error: Attempted to read past end of input.");
        return null;
    }
    return parsedInputLines[currentLinePointer++];
}

/**
 * Main function containing the problem-solving logic.
 * This function orchestrates reading input, performing calculations, and outputting the result.
 */
function executeSolution() {
    // Define a large number to represent infinity for path calculations
    const INFINITY_VAL = 1000000000; // A sufficiently large number for path costs

    // Read the first line which contains the number of vertices (N) and edges (M)
    const dimensions = fetchNextLine().split(' ').map(Number);
    const numVertices = dimensions[0];
    const numEdges = dimensions[1];

    // Basic input validation for N and M
    if (isNaN(numVertices) || isNaN(numEdges) || numVertices < 0 || numEdges < 0) {
        standardOut.write("Error: Invalid graph dimensions provided.\n");
        process.exit(1);
    }
    if (numVertices === 0) {
        standardOut.write("0\n"); // No vertices, no edges, no paths
        process.exit(0);
    }

    // Store edges as objects for better readability and maintainability
    const graphEdges = [];
    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const edgeData = fetchNextLine().split(' ').map(Number);
        const sourceNode = edgeData[0] - 1; // Convert to 0-indexed
        const targetNode = edgeData[1] - 1; // Convert to 0-indexed
        const edgeWeight = edgeData[2];

        // Validate node indices and edge weight
        if (isNaN(sourceNode) || isNaN(targetNode) || isNaN(edgeWeight) ||
            sourceNode < 0 || sourceNode >= numVertices ||
            targetNode < 0 || targetNode >= numVertices ||
            edgeWeight < 0) {
            standardOut.write(`Error: Invalid edge data on line ${edgeIndex + 2}.\n`);
            process.exit(1);
        }
        graphEdges.push({ u: sourceNode, v: targetNode, weight: edgeWeight });
    }

    // Initialize the distance matrix for the Floyd-Warshall algorithm
    // All distances are initially INFINITY_VAL, except for self-loops (distance 0)
    const shortestPathMatrix = Array.from({ length: numVertices }, () =>
        Array(numVertices).fill(INFINITY_VAL)
    );

    // Set diagonal elements to 0 (distance from a node to itself)
    for (let nodeA = 0; nodeA < numVertices; nodeA++) {
        shortestPathMatrix[nodeA][nodeA] = 0;
    }

    // Populate the distance matrix with direct edge weights
    // Since the graph is undirected, add edges in both directions
    for (const currentEdge of graphEdges) {
        shortestPathMatrix[currentEdge.u][currentEdge.v] = Math.min(
            shortestPathMatrix[currentEdge.u][currentEdge.v],
            currentEdge.weight
        );
        shortestPathMatrix[currentEdge.v][currentEdge.u] = Math.min(
            shortestPathMatrix[currentEdge.v][currentEdge.u],
            currentEdge.weight
        );
    }

    // Apply the Floyd-Warshall algorithm to find all-pairs shortest paths
    // Iterate through all possible intermediate nodes
    for (let intermediate = 0; intermediate < numVertices; intermediate++) {
        // Iterate through all possible starting nodes
        for (let start = 0; start < numVertices; start++) {
            // Iterate through all possible ending nodes
            for (let end = 0; end < numVertices; end++) {
                // Only update if paths to and from the intermediate node are reachable
                if (shortestPathMatrix[start][intermediate] !== INFINITY_VAL &&
                    shortestPathMatrix[intermediate][end] !== INFINITY_VAL) {
                    shortestPathMatrix[start][end] = Math.min(
                        shortestPathMatrix[start][end],
                        shortestPathMatrix[start][intermediate] + shortestPathMatrix[intermediate][end]
                    );
                }
            }
        }
    }

    // Calculate the number of edges that are NOT part of any shortest path
    let nonEssentialEdgeCount = numEdges; // Initialize with total edges

    // If there are no edges, the count of non-essential edges is 0.
    if (numEdges === 0) {
        standardOut.write("0\n");
        process.exit(0);
    }

    // Iterate through each original edge to determine its "essentiality"
    for (const originalEdge of graphEdges) {
        let isPartOfAnyShortestPath = false; // Flag to check if the current edge is crucial
        
        // Iterate through all possible starting points (j) in the graph
        for (let pathOrigin = 0; pathOrigin < numVertices; pathOrigin++) {
            // Check if the path from `pathOrigin` to `originalEdge.v`
            // using `originalEdge.u` as an intermediate step and `originalEdge.weight`
            // is equal to the overall shortest path from `pathOrigin` to `originalEdge.v`.
            // This implies that the current edge (u,v) with its weight is part of a shortest path.
            // Also, ensure that pathOrigin can actually reach originalEdge.u
            if (shortestPathMatrix[pathOrigin][originalEdge.u] !== INFINITY_VAL &&
                shortestPathMatrix[pathOrigin][originalEdge.u] + originalEdge.weight === shortestPathMatrix[pathOrigin][originalEdge.v]) {
                isPartOfAnyShortestPath = true;
                break; // Found one case where it's part of a shortest path, no need to check further origins
            }
        }

        // If the edge was found to be part of at least one shortest path,
        // it means it's an essential edge, so we decrement our non-essential count.
        // The problem asks for the count of edges that are *not* part of any shortest path.
        // The original code decrements `ans` if `shortest == true`, so `ans` represents
        // `M - (count of edges that are part of at least one shortest path)`.
        // This is indeed the number of edges that are *not* part of any shortest path.
        if (isPartOfAnyShortestPath) {
            nonEssentialEdgeCount--;
        }
    }

    // Output the final count of non-essential edges
    standardOut.write(`${nonEssentialEdgeCount}\n`);

    // Ensure the process exits cleanly
    process.exit(0);
}