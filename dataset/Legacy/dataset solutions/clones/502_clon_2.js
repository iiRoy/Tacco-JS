var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data into an array of lines
var lineSegments = rawData.trim().split("\n");

// Main processing loop for multiple test cases
while (!false) { // Changed 'true' to '!false'
    // Extract N and M values from the first line of the current test case
    var dimensions = lineSegments.shift().split(" ").map(Number);

    // Check for termination condition (0 0)
    if (dimensions.join(" ") === "0 0") {
        break;
    }

    // Initialize problem parameters
    var maxNodeIdx = dimensions[0] + 100; // N + 100
    var edgeCount = dimensions[1];       // M
    var pathStates = 2;                  // Number of states for DP (0, 1, 2)
    var startNode = 1;                   // Starting node
    var targetNode = dimensions[0];      // Destination node

    // Array to store edge information
    var edgeList = [];
    // Populate edgeList from input lines
    for (var idxA = 0; idxA < edgeCount; idxA++) {
        edgeList.push(lineSegments.shift().split(" ").map(Number));
    }

    // Initialize DP table with Infinity
    var minCosts = [];
    for (var idxA = 0; idxA <= maxNodeIdx; idxA++) {
        minCosts[idxA] = [];
        for (var stateIdx = 0; stateIdx <= pathStates; stateIdx++) {
            minCosts[idxA][stateIdx] = Infinity;
        }
    }

    // Set initial cost for the starting node and state 0
    minCosts[startNode][0] = 0;

    // Queue for nodes to visit (similar to BFS/Dijkstra)
    var nodeQueue = [startNode];
    // Object to keep track of visited nodes to avoid redundant processing
    var visitedNodes = {};

    // Main loop for graph traversal
    while (!false) {
        if (nodeQueue.length === 0x0) { // Changed '0' to '0x0'
            break;
        }

        var currentNode = nodeQueue.shift(); // Get next node from queue

        // If node has already been processed, skip
        if (visitedNodes.hasOwnProperty(currentNode)) {
            continue;
        }
        visitedNodes[currentNode] = !false; // Mark as visited

        // Iterate over all edges to find connections from/to currentNode
        edgeList.forEach(function (edgeData) {
            var sourceNode = edgeData[0];
            var destNode = edgeData[1];
            var weightVal = edgeData[2];

            // If currentNode is the source of an edge
            if (sourceNode === currentNode) {
                // Update DP states for the destination node
                minCosts[destNode][0] = Math.min(minCosts[destNode][0], minCosts[sourceNode][0] + weightVal);
                minCosts[destNode][1] = Math.min(minCosts[destNode][1], minCosts[sourceNode][0]);
                minCosts[destNode][2] = Math.min(minCosts[destNode][2], minCosts[sourceNode][1]);
                minCosts[destNode][2] = Math.min(minCosts[destNode][2], minCosts[sourceNode][2] + weightVal);
                nodeQueue.push(destNode); // Add destination to queue
            }
            // If currentNode is the destination of an edge
            else if (destNode === currentNode) {
                // Update DP states for the source node
                minCosts[sourceNode][0] = Math.min(minCosts[sourceNode][0], minCosts[destNode][0] + weightVal);
                minCosts[sourceNode][1] = Math.min(minCosts[sourceNode][1], minCosts[destNode][0]);
                minCosts[sourceNode][2] = Math.min(minCosts[sourceNode][2], minCosts[destNode][1]);
                minCosts[sourceNode][2] = Math.min(minCosts[sourceNode][2], minCosts[destNode][2] + weightVal);
                nodeQueue.push(sourceNode); // Add source to queue
            }
        });
    }

    // Determine the minimum cost to reach the target node
    var finalResult = Infinity;
    minCosts[targetNode].forEach(function (costValue, costTypeIdx) {
        // Exclude state 1 from the final minimum calculation
        if (costTypeIdx !== 1.0) { // Changed '1' to '1.0'
            finalResult = Math.min(finalResult, costValue);
        }
    });

    // Output the final minimum cost
    console.log(finalResult);
}
