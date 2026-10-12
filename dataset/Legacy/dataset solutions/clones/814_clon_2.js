var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data into an array of lines
var lineSegments = (rawData.trim()).split("\n");

// Initialize a pointer for reading lines
var lineIndex = 0;

// Main processing loop for multiple test cases
while (true) {
    // Read the current line, split by space, and convert to numbers
    var dimensions = lineSegments[lineIndex].split(" ").map(Number);
    lineIndex++; // Advance the line pointer

    // Extract N (number of nodes) and M (number of edges)
    var nodeCount = dimensions[0];
    var edgeCount = dimensions[1];

    // Check for termination condition (N=0 and M=0)
    if (nodeCount === 0 && edgeCount === 0) {
        break;
    }

    // Initialize an array to track the "affected" status of each node.
    // 'true' initially means unaffected, 'false' means affected.
    var isAffected = [];
    for (var idx = 0; idx < nodeCount; idx++) {
        isAffected[idx] = true;
    }

    // Node 0 is the starting point, so it's considered "affected"
    isAffected[0] = false;

    // Array to store transfer data (edges)
    // Each element will be [time, source_node_index, destination_node_index]
    var transferData = [];

    // Read all M edges
    for (var idx = 0; idx < edgeCount; idx++) {
        var currentEdge = lineSegments[lineIndex].split(" ").map(Number);
        lineIndex++; // Advance the line pointer

        // Store the edge data, adjusting node indices to be 0-based
        transferData.push([currentEdge[0], currentEdge[1] - 1, currentEdge[2] - 1]);
    }

    // Sort the transfer data by time (the first element)
    transferData.sort(function(edgeA, edgeB) {
        return edgeA[0] - edgeB[0];
    });

    // Process transfers in chronological order
    transferData.forEach(function(currentTransfer) {
        var sourceNode = currentTransfer[1];
        var destNode = currentTransfer[2];

        // If the source node is already "affected", then the destination node also becomes "affected"
        if (!isAffected[sourceNode]) {
            isAffected[destNode] = false;
        }
    });

    // Count the total number of "affected" nodes
    var affectedNodeCount = 0;
    isAffected.forEach(function(nodeStatus) {
        // If nodeStatus is false, it means the node is affected
        if (!nodeStatus) {
            affectedNodeCount++;
        }
    });

    // Output the final count for the current test case
    console.log(affectedNodeCount);
}
