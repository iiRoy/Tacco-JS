var inputRows = [];
var readline = require('readline');

var inputHandler = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLineText) {
    inputRows.push(currentLineText);
});

inputHandler.on('close', function () {
    // Parse graph dimensions from the first line
    var vertexCount = Number(inputRows[0].split(' ')[0]);
    var edgeCount = Number(inputRows[0].split(' ')[1]);

    // Remove the header line as it's been processed
    inputRows.shift();

    // Process remaining lines into an array of edge data
    var edgeData = inputRows.map(rowString => rowString.split(' ').map(numStr => Number(numStr)));

    // Initialize an array to track visited nodes, -1 means unvisited
    var visitedNodes = Array(vertexCount).fill(-1);
    // Initialize the counter for connected components
    var resultValue = 0;

    // Sort edges based on their first node for consistent processing
    edgeData.sort((firstEdge, secondEdge) => firstEdge[0] - secondEdge[0]);

    // Process each edge
    while (edgeData.length > 0) {
        var currentEdge = edgeData.shift();
        var nodeA = currentEdge[0];
        var nodeB = currentEdge[1];
        var weight = currentEdge[2]; // 'weight' is not used in the original logic, but kept for structure

        // Check if either node of the current edge has been visited
        if (visitedNodes[nodeA - 1] !== -1) {
            // If nodeA is visited, mark nodeB as visited
            visitedNodes[nodeB - 1] = 1;
        } else if (visitedNodes[nodeB - 1] !== -1) {
            // If nodeB is visited, mark nodeA as visited
            visitedNodes[nodeA - 1] = 1;
        } else {
            // If neither node is visited, this edge forms a new component
            resultValue++;
            visitedNodes[nodeA - 1] = 1; // Mark both nodes as visited
            visitedNodes[nodeB - 1] = 1;
        }
    }

    // Count any remaining unvisited nodes (isolated vertices)
    for (var nodeIndex = 0; nodeIndex < vertexCount; nodeIndex++) {
        if (visitedNodes[nodeIndex] === -1) {
            resultValue++;
        }
    }

    // Output the final count of connected components
    console.log(resultValue);
});
