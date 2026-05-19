var inputData = [];
var ioHandler = require('readline');

var inputReader = ioHandler.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputReader.on('line', function (currentLine) {
    inputData.push(currentLine);
});

inputReader.on('close', function () {
    var nodeCount = Number(inputData[0]);
    var rawEdgeStrings = inputData.slice(1);

    var graphEdges = rawEdgeStrings.map(itemStr => itemStr.split(" ").map(valStr => Number(valStr)));

    // Helper function to determine the color of a node based on a known color and edge weight parity
    function calculateNodeColor(knownColorValue, edgeWeightParity) {
        return (edgeWeightParity === 0) ? knownColorValue : (1 - knownColorValue);
    }

    // Sort edges: primary key is the second node (v), secondary key is the first node (u)
    graphEdges.sort((edgeA, edgeB) => {
        if (edgeA[1] === edgeB[1]) { return (edgeA[0] - edgeB[0]); }
        else { return (edgeA[1] - edgeB[1]); }
    });
    console.log(graphEdges);

    var nodeColors = Array(nodeCount).fill(-1);
    nodeColors[0] = 0; // Assign color 0 (white) to the first node

    while (graphEdges.length > 0) {
        var currentEdge = graphEdges.shift();
        var nodeU = currentEdge[0];
        var nodeV = currentEdge[1];
        var edgeWeight = currentEdge[2];

        var uIndex = nodeU - 1;
        var vIndex = nodeV - 1;
        var weightParity = edgeWeight % 2;

        if (nodeColors[uIndex] !== -1) {
            // Node U is already colored, determine color for V
            nodeColors[vIndex] = calculateNodeColor(nodeColors[uIndex], weightParity);
        } else if (nodeColors[vIndex] !== -1) {
            // Node V is already colored (and U is not), determine color for U
            nodeColors[uIndex] = calculateNodeColor(nodeColors[vIndex], weightParity);
        } else {
            // Neither node is colored, re-add the edge to the end of the list for later processing
            graphEdges.push(currentEdge);
        }
    }

    for (var idx = 0; idx < nodeCount; idx++) {
        console.log(nodeColors[idx]);
    }
});
