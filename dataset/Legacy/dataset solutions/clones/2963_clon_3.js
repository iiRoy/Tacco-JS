var inputLines = [];
var ioModule = require('readline');

// Helper function to create and initialize a 2D array (matrix)
function createMatrix(rows, cols, initialValue) {
    let matrix = new Array(rows);
    for (let r = 0; r < rows; r++) {
        matrix[r] = new Array(cols).fill(initialValue);
    }
    return matrix;
}

// Helper function to determine the opposite color
function getOppositeColor(currentColorValue) {
    return currentColorValue === "0" ? "1" : "0";
}

// Define constants for clarity and maintainability
const UNREACHABLE_EDGE_COST = Infinity;
const STARTING_NODE_INDEX = 0;
const COLOR_VALUE_ZERO = "0";
const COLOR_VALUE_ONE = "1";
const UNVISITED_NODE_MARKER = "";

var interfaceHandler = ioModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

interfaceHandler.on('close', function () {
    var nodeCount = Number(inputLines[0]);
    inputLines.shift(); // Remove the first line (nodeCount) as it's already processed

    // Parse the remaining input lines into an array of edge data
    var edgeConnections = inputLines.map(lineString => {
        const stringParts = lineString.split(" ");
        return stringParts.map(value => parseInt(value, 10));
    });

    // Initialize the adjacency cost matrix with a large value for unreachable edges
    var adjacencyCosts = createMatrix(nodeCount, nodeCount, UNREACHABLE_EDGE_COST);

    // Set the cost from a node to itself as 0
    for (var i = 0; i < nodeCount; i++) {
        adjacencyCosts[i][i] = 0;
    }

    // Populate the adjacency matrix with edge weights from the input
    // The problem implies N-1 edges for N nodes, forming a tree structure.
    for (var edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
        var currentEdgeData = edgeConnections[edgeIdx];
        var nodeA = currentEdgeData[0];
        var nodeB = currentEdgeData[1];
        var weight = currentEdgeData[2];

        // Adjust node indices to be 0-based
        var adjustedNodeA = nodeA - 1;
        var adjustedNodeB = nodeB - 1;

        adjacencyCosts[adjustedNodeA][adjustedNodeB] = weight;
        adjacencyCosts[adjustedNodeB][adjustedNodeA] = weight; // Graph is undirected
    }

    // Array to store the assigned color for each node
    var assignedNodeColors = Array(nodeCount).fill(UNVISITED_NODE_MARKER);

    // Initialize the processing queue for traversal (DFS-like due to .pop())
    var traversalQueue = [];

    // Start the traversal from the designated initial node (node 0)
    assignedNodeColors[STARTING_NODE_INDEX] = COLOR_VALUE_ZERO;
    traversalQueue.push([STARTING_NODE_INDEX, COLOR_VALUE_ZERO]);

    // Perform the graph traversal
    while (traversalQueue.length > 0) {
        var currentQueueItem = traversalQueue.pop();
        var currentNode = currentQueueItem[0];
        var currentNodeColor = currentQueueItem[1];

        // Iterate through all potential neighbors of the current node
        for (var neighborIdx = 0; neighborIdx < nodeCount; neighborIdx++) {
            var neighborStatus = assignedNodeColors[neighborIdx];
            var costToNeighbor = adjacencyCosts[currentNode][neighborIdx];

            // Skip if the neighbor is already colored or if there's no direct edge
            if (neighborStatus !== UNVISITED_NODE_MARKER || costToNeighbor === UNREACHABLE_EDGE_COST) {
                continue;
            }

            var newColorForNeighbor;
            // Determine the neighbor's color based on the edge weight parity
            if (costToNeighbor % 2 === 0) {
                newColorForNeighbor = currentNodeColor;
            } else { // Edge weight is odd
                newColorForNeighbor = getOppositeColor(currentNodeColor);
            }

            // Assign the color and add the neighbor to the queue for further processing
            assignedNodeColors[neighborIdx] = newColorForNeighbor;
            traversalQueue.push([neighborIdx, newColorForNeighbor]);
        }
    }

    // Output the final assigned colors for all nodes
    for (var outputIndex = 0; outputIndex < assignedNodeColors.length; outputIndex++) {
        console.log(assignedNodeColors[outputIndex]);
    }
});
