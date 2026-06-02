process.stdin.resume();
process.stdin.setEncoding('ascii');

// Buffer to accumulate input data
let inputBuffer = "";
// Array to store input lines after splitting
let inputLines = [];
// Current index for reading lines
let currentLineIndex = 0;

process.stdin.on('data', function (chunk) {
    inputBuffer += chunk; // Append incoming data to the buffer
});

process.stdin.on('end', function () {
    inputLines = inputBuffer.split("\n"); // Split the accumulated buffer into lines
    executeMainLogic(); // Call the primary function
});

/**
 * Retrieves the next line from the input array.
 * @returns {string} The next line of input.
 */
function fetchLine() {
    return inputLines[currentLineIndex++];
}

/**
 * Main execution logic for the program.
 * This function processes input, performs calculations, and outputs the result.
 */
function executeMainLogic() {
    // Read the first line containing graph dimensions
    let dimensions = fetchLine().split(" ");
    let nodeCount = parseInt(dimensions[0]); // Number of nodes (N)
    let edgeCount = parseInt(dimensions[1]); // Number of edges (M)

    // Arrays to store edge details: source, target, and weight
    let sourceNodes = [];
    let targetNodes = [];
    let edgeWeights = [];

    // Loop through M edges to populate edge details
    for (let idx1 = 0; idx1 < edgeCount; idx1++) {
        let edgeData = fetchLine().split(" ");
        let srcIdx = parseInt(edgeData[0]) - 1; // Adjust to 0-indexed
        let tgtIdx = parseInt(edgeData[1]) - 1; // Adjust to 0-indexed
        let weightVal = parseInt(edgeData[2]);

        sourceNodes.push(srcIdx);
        targetNodes.push(tgtIdx);
        edgeWeights.push(weightVal);
    }

    // Initialize the distance matrix for Floyd-Warshall algorithm
    let distanceMatrix = [];
    // Initialize matrix with large values for non-self paths and 0 for self-paths
    for (let idx1 = 0; idx1 < nodeCount; idx1++) {
        distanceMatrix[idx1] = [];
        for (let idx2 = 0; idx2 < nodeCount; idx2++) {
            if (idx1 !== idx2) {
                distanceMatrix[idx1].push(1000000000); // Represents infinity
            } else {
                distanceMatrix[idx1].push(0); // Distance to self is zero
            }
        }
    }

    // Populate initial distances from direct edges
    for (let idx1 = 0; idx1 < edgeCount; idx1++) {
        let currentSrc = sourceNodes[idx1];
        let currentTgt = targetNodes[idx1];
        let currentWeight = edgeWeights[idx1];

        // Update distance if a shorter direct path is found
        if (distanceMatrix[currentSrc][currentTgt] > currentWeight) {
            distanceMatrix[currentSrc][currentTgt] = currentWeight;
        }
        // For undirected graph, update reverse path as well
        if (distanceMatrix[currentTgt][currentSrc] > currentWeight) {
            distanceMatrix[currentTgt][currentSrc] = currentWeight;
        }
    }

    // Apply Floyd-Warshall algorithm to find all-pairs shortest paths
    for (let idx3 = 0; idx3 < nodeCount; idx3++) { // Intermediate node
        for (let idx1 = 0; idx1 < nodeCount; idx1++) { // Source node
            for (let idx2 = 0; idx2 < nodeCount; idx2++) { // Destination node
                // If path through idx3 is shorter, update distance
                if (distanceMatrix[idx1][idx2] > distanceMatrix[idx1][idx3] + distanceMatrix[idx3][idx2]) {
                    distanceMatrix[idx1][idx2] = distanceMatrix[idx1][idx3] + distanceMatrix[idx3][idx2];
                }
            }
        }
    }

    // Calculate the final result: count of edges that are NOT part of any shortest path
    let resultCount = edgeCount; // Start with total edges
    for (let idx1 = 0; idx1 < edgeCount; idx1++) {
        let currentSrc = sourceNodes[idx1];
        let currentTgt = targetNodes[idx1];
        let currentWeight = edgeWeights[idx1];

        let isShortestPath = false;
        // Check if the current edge (currentSrc, currentTgt) with currentWeight
        // is part of any shortest path between any two nodes (j, currentTgt)
        // where the path goes through currentSrc.
        for (let idx2 = 0; idx2 < nodeCount; idx2++) {
            // If the path from idx2 to currentSrc plus the edge weight
            // equals the shortest path from idx2 to currentTgt,
            // then this edge is part of a shortest path.
            if (distanceMatrix[idx2][currentSrc] + currentWeight === distanceMatrix[idx2][currentTgt]) {
                isShortestPath = true;
                break; // Found one instance, no need to check further for this edge
            }
        }
        // If the edge is part of a shortest path, decrement the counter
        if (isShortestPath === true) {
            resultCount--;
        }
    }

    // Output the final calculated count
    console.log(resultCount);

    // Terminate the process
    process.exit();
}
