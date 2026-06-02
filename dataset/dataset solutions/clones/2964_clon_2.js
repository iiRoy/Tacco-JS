var inputData = []; // Stores all lines read from standard input
var lineReaderModule = require('readline'); // Imports the 'readline' module for input processing

var interfaceHandler = lineReaderModule.createInterface({ // Creates an interface to read input line by line
    input: process.stdin, // Specifies standard input as the source
    output: process.stdout // Specifies standard output for internal readline operations (not used for problem output)
});

interfaceHandler.on('line', function (currentLine) { // Event listener for each line received
    inputData.push(currentLine); // Adds the current line to our array of input data
});

interfaceHandler.on('close', function () { // Event listener for when the input stream ends
    // The first line of input contains the number of nodes
    var nodeCount = Number(inputData[0]);
    inputData.shift(); // Removes the first line (node count) from the input array

    // Parses the remaining lines into an array of edges (u, v, w)
    // Each edge is represented as an array of three numbers
    var edgeList = inputData.map(edgeStr => edgeStr.split(" ").map(valStr => Number(valStr)));

    // This algorithm assigns one of two colors (0 or 1) to each node.
    // The color assignment depends on the weight of the edges connecting them.
    // If an edge has an even weight, connected nodes must have the same color.
    // If an edge has an odd weight, connected nodes must have different colors.
    // Node 0 (index 0) is arbitrarily assigned color 0 to start the process.

    // Sorts the edge list to prioritize processing.
    // Edges are sorted primarily by the second node index (v), then by the first node index (u).
    edgeList.sort((edgeA, edgeB) => {
        if (edgeA[1] === edgeB[1]) {
            return (edgeA[0] - edgeB[0]); // Secondary sort by first node if second nodes are equal
        } else {
            return (edgeA[1] - edgeB[1]); // Primary sort by second node
        }
    });

    // For debugging or verification, output the sorted edge list.
    console.log(edgeList);

    // Initializes an array to store the color of each node.
    // -1 indicates an uncolored node.
    var nodeColors = Array(nodeCount).fill(-1);
    nodeColors[0] = 0; // Assigns color 0 to the first node (node with index 0)

    // Processes edges until all nodes are colored or no more progress can be made.
    // Edges are processed in a loop, and if an edge cannot be processed (neither connected node is colored),
    // it's pushed back to the end of the list to be retried later.
    while (edgeList.length > 0) {
        var currentEdge = edgeList.shift(); // Takes the first edge from the list
        var nodeU = currentEdge[0]; // First node in the edge
        var nodeV = currentEdge[1]; // Second node in the edge
        var edgeWeight = currentEdge[2]; // Weight of the edge

        // Check if the first node (U) has already been colored
        if (nodeColors[nodeU - 1] !== -1) {
            // If U is colored, determine V's color based on U's color and edge weight
            if (edgeWeight % 2 === 0) { // Even weight: V gets the same color as U
                nodeColors[nodeV - 1] = nodeColors[nodeU - 1];
            } else { // Odd weight: V gets the opposite color of U
                nodeColors[nodeV - 1] = 1 - nodeColors[nodeU - 1];
            }
        } else {
            // If U is not colored, check if the second node (V) has been colored
            if (nodeColors[nodeV - 1] !== -1) {
                // If V is colored, determine U's color based on V's color and edge weight
                if (edgeWeight % 2 === 0) { // Even weight: U gets the same color as V
                    nodeColors[nodeU - 1] = nodeColors[nodeV - 1];
                } else { // Odd weight: U gets the opposite color of V
                    nodeColors[nodeU - 1] = 1 - nodeColors[nodeV - 1];
                }
            } else {
                // If neither U nor V is colored, this edge cannot be processed yet.
                // Push it back to the end of the list to be retried later.
                edgeList.push(currentEdge);
            }
        }
    }

    // After processing all edges, print the assigned color for each node.
    for (var idx = 0; idx < nodeCount; idx++) {
        console.log(nodeColors[idx]);
    }
});
