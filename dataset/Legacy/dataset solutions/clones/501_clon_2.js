var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the input data, splitting it into individual lines.
var lineData = rawData.trim().split("\n");

// Main loop to process multiple test cases until "0 0" is encountered.
while (true) {
    // Read the first line of the current test case, which contains N and M.
    // N: number of nodes, M: number of edges.
    var nodeEdgeCounts = lineData.shift().split(" ").map(Number);

    // Check for the termination condition (N=0, M=0).
    if (nodeEdgeCounts.join(" ") === "0 0") {
        break; // Exit the loop if the termination condition is met.
    }

    // Extract N and M from the parsed line.
    var numNodes = nodeEdgeCounts[0];
    var numEdges = nodeEdgeCounts[1];

    // Define constants for the algorithm.
    // 'costCategories' represents the number of cost dimensions (e.g., direct, one-stop, two-stop).
    var costCategories = 2; // This seems to be an index for the DP array, so 0, 1, 2 means 3 categories.
    var startNode = 1; // The starting node for pathfinding.
    var destinationNode = numNodes; // The target node.

    // Initialize an array to store edge information.
    var edgeList = [];
    // Populate the edgeList with M edges.
    for (var k = 0; k < numEdges; k++) {
        edgeList.push(lineData.shift().split(" ").map(Number));
    }

    // Initialize the dynamic programming table (minCosts).
    // minCosts[node][category] stores the minimum cost to reach 'node' with 'category' stops.
    var minCosts = [];
    for (var k = 0; k <= numNodes; k++) {
        minCosts[k] = [];
        for (var l = 0; l <= costCategories; l++) {
            minCosts[k][l] = Infinity; // Initialize all costs to infinity.
        }
    }

    // Set the initial cost for the start node (node 1) with 0 stops to 0.
    minCosts[startNode][0] = 0;

    // Initialize a queue for nodes to visit (similar to a BFS/Dijkstra queue).
    var queueNodes = [startNode];
    // Initialize an object to keep track of visited nodes to avoid redundant processing.
    var visitedNodes = {};

    // Main loop for the pathfinding algorithm.
    while (true) {
        // If the queue is empty, all reachable nodes have been processed.
        if (queueNodes.length === 0) {
            break;
        }

        // Dequeue a node to process.
        var currentNode = queueNodes.shift();

        // If this node has already been fully processed, skip it.
        if (visitedNodes.hasOwnProperty(currentNode)) {
            continue;
        }
        // Mark the current node as visited.
        visitedNodes[currentNode] = true;

        // Iterate through all edges to find connections from/to the currentNode.
        edgeList.forEach(function (edgeInfo) {
            var nodeA = edgeInfo[0]; // First node in the edge.
            var nodeB = edgeInfo[1]; // Second node in the edge.
            var edgeWeight = edgeInfo[2]; // Weight/cost of the edge.

            // If nodeA is the currentNode, consider paths from currentNode to nodeB.
            if (nodeA === currentNode) {
                // Update costs for nodeB:
                // Category 0: Direct path (no stops).
                minCosts[nodeB][0] = Math.min(minCosts[nodeB][0], minCosts[nodeA][0] + edgeWeight);
                // Category 1: One-stop path (from a direct path to nodeA).
                minCosts[nodeB][1] = Math.min(minCosts[nodeB][1], minCosts[nodeA][0]);
                // Category 2: Two-stop path (from a one-stop path to nodeA).
                minCosts[nodeB][2] = Math.min(minCosts[nodeB][2], minCosts[nodeA][1]);
                // Category 2: Also consider a two-stop path from a two-stop path to nodeA.
                minCosts[nodeB][2] = Math.min(minCosts[nodeB][2], minCosts[nodeA][2] + edgeWeight);
                // Add nodeB to the queue for further processing.
                queueNodes.push(nodeB);
            }
            // If nodeB is the currentNode, consider paths from currentNode to nodeA.
            else if (nodeB === currentNode) {
                // Update costs for nodeA:
                // Category 0: Direct path.
                minCosts[nodeA][0] = Math.min(minCosts[nodeA][0], minCosts[nodeB][0] + edgeWeight);
                // Category 1: One-stop path.
                minCosts[nodeA][1] = Math.min(minCosts[nodeA][1], minCosts[nodeB][0]);
                // Category 2: Two-stop path.
                minCosts[nodeA][2] = Math.min(minCosts[nodeA][2], minCosts[nodeB][1]);
                // Category 2: Also consider a two-stop path from a two-stop path to nodeB.
                minCosts[nodeA][2] = Math.min(minCosts[nodeA][2], minCosts[nodeB][2] + edgeWeight);
                // Add nodeA to the queue for further processing.
                queueNodes.push(nodeA);
            }
            // This line seems to be an error in the original logic, as it unconditionally sets
            // minCosts[destinationNode][1] to Infinity within the edge iteration.
            // However, Type II clone rules require preserving behavior, so it must be kept.
            minCosts[destinationNode][1] = Infinity;
        });
    }

    // After the pathfinding, find the minimum cost to the destination node across all categories.
    var finalResult = Infinity;
    minCosts[destinationNode].forEach(function (costValue, categoryIndex) {
        finalResult = Math.min(finalResult, costValue);
    });

    // Output the final minimum cost for the current test case.
    console.log(finalResult);
}
