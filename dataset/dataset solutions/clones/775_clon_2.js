/*
 * This file contains logic for processing graph data from standard input
 * and calculating shortest paths using the Floyd-Warshall algorithm.
 */
// Previous commented-out code for file system reading is omitted.

// Variable to accumulate incoming raw data from standard input.
var rawInputData = '';
// Variable to store lines after splitting the raw input.
var processedLines;

// Activate standard input stream to begin receiving data.
process.stdin.resume();
// Set the character encoding for the input stream.
process.stdin.setEncoding('utf-8');

// Event listener for when data chunks are received.
process.stdin.on('received_data', function (data_segment) {
    rawInputData += data_segment; // Append new data to the accumulated string.
});

// Event listener for when the standard input stream ends.
process.stdin.on('finished_input', function () {
    // Split the entire raw input string into an array of lines.
    processedLines = rawInputData.split('\n');
    // Invoke the primary logic function once all input is received.
    findOptimalRoute();
});

/**
 * Main function to perform graph processing and shortest path calculation.
 * It reads graph parameters, constructs an adjacency matrix, applies Floyd-Warshall,
 * and then computes a specific minimum path sum.
 */
function findOptimalRoute() {
    // Parse the first line of input to get graph dimensions and special node indices.
    var initialConfiguration = processedLines[0].split(' ');
    // Total number of vertices in the graph.
    var numVertices = Number(initialConfiguration[0]);
    // Total number of edges specified in the input.
    var numEdges = Number(initialConfiguration[1]);
    // The starting point for the path calculation (0-indexed).
    var initialPointIdx = Number(initialConfiguration[2]) - 1;
    // The first target destination node (0-indexed).
    var destinationOneIdx = Number(initialConfiguration[3]) - 1;
    // The second target destination node (0-indexed).
    var destinationTwoIdx = Number(initialConfiguration[4]) - 1;

    // Initialize the distance matrix for all-pairs shortest paths.
    // 'pathCosts' will store the minimum cost to travel between any two nodes.
    var pathCosts = new Array(numVertices);

    // Temporary variable for parsing edge data.
    var currentEdgeData;
    // Loop counters for iterating through nodes in the graph.
    var sourceNode, targetNode, viaNode;

    // Step 1: Initialize the distance matrix.
    // For each possible source node...
    for (sourceNode = 0; sourceNode < numVertices; sourceNode++) {
        pathCosts[sourceNode] = new Array(numVertices); // Create a row for the current source.
        // For each possible target node from the current source...
        for (targetNode = 0; targetNode < numVertices; targetNode++) {
            // Distance from a node to itself is 0. All other distances are initially infinite.
            pathCosts[sourceNode][targetNode] = sourceNode === targetNode ? 0 : Number.POSITIVE_INFINITY;
        }
    }

    // Step 2: Populate the distance matrix with direct edge weights from input.
    var edgeIndex = 1; // Start reading from the second line of input.
    while (edgeIndex <= numEdges) {
        currentEdgeData = processedLines[edgeIndex].split(' ');
        // Convert node indices from 1-based to 0-based and assign the edge weight.
        pathCosts[Number(currentEdgeData[0]) - 1][Number(currentEdgeData[1]) - 1] = Number(currentEdgeData[2]);
        edgeIndex++;
    }

    // Step 3: Apply the Floyd-Warshall algorithm to find all-pairs shortest paths.
    // Iterate through all possible intermediate nodes.
    for (viaNode = 0; viaNode < numVertices; viaNode++) {
        // Iterate through all possible source nodes.
        for (sourceNode = 0; sourceNode < numVertices; sourceNode++) {
            // Iterate through all possible target nodes.
            for (targetNode = 0; targetNode < numVertices; targetNode++) {
                // If a shorter path is found using 'viaNode' as an intermediate point, update the distance.
                pathCosts[sourceNode][targetNode] = Math.min(pathCosts[sourceNode][targetNode],
                                                             pathCosts[sourceNode][viaNode] + pathCosts[viaNode][targetNode]);
            }
        }
    }

    // Step 4: Calculate the minimum total distance for the specific problem.
    // The path is S -> X -> G1 + S -> X -> G2, where X is any intermediate node.
    var minimumTotalDistance = Number.POSITIVE_INFINITY;
    // Iterate through all possible intermediate nodes 'X' (represented by 'sourceNode' here).
    for (sourceNode = 0; sourceNode < numVertices; sourceNode++) {
        // Calculate the total path length: (S to X) + (X to G1) + (X to G2).
        // Note: The problem implies the path is S -> X -> G1 and S -> X -> G2,
        // which means the cost is (S to X) + (X to G1) + (S to X) + (X to G2) if it were two separate paths.
        // However, the original code calculates (S to X) + (X to G1) + (X to G2),
        // which suggests a path like S -> X -> G1 and X -> G2, where G1 and G2 are reached from X.
        // This interpretation is maintained for Type II cloning.
        minimumTotalDistance = Math.min(minimumTotalDistance,
                                        pathCosts[initialPointIdx][sourceNode] +
                                        pathCosts[sourceNode][destinationOneIdx] +
                                        pathCosts[sourceNode][destinationTwoIdx]);
    }

    // Output the final calculated minimum distance.
    console.log(minimumTotalDistance);
}