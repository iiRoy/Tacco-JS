var inputBuffer = [];
var inputReader = require('readline');

var ioInterface = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

ioInterface.on('line', function (lineContent) {
    inputBuffer.push(lineContent);
});

ioInterface.on('close', function () {
    var totalNodes = Number(inputBuffer[0]);
    var rawEdgeInfo = inputBuffer.slice(1).map(entry => entry.split(" ").map(Number));

    var graphConnections = Array(totalNodes).fill(null).map(() => []);

    rawEdgeInfo.forEach(edgeTriplet => {
        var sourceNode = edgeTriplet[0] - 1;
        var targetNode = edgeTriplet[1] - 1;
        var edgeWeight = edgeTriplet[2];

        graphConnections[sourceNode].push({ neighbor: targetNode, weight: edgeWeight });
        graphConnections[targetNode].push({ neighbor: sourceNode, weight: edgeWeight });
    });

    function determineNodeColors(nodeCount, connections) {
        var colorsAssigned = Array(nodeCount).fill(null);
        var initialVertex = 0;

        colorsAssigned[initialVertex] = "0";
        var traversalQueue = [{ index: initialVertex, color: "0" }];
        let queueHead = 0;

        while (queueHead < traversalQueue.length) {
            var currentVertexInfo = traversalQueue[queueHead++];
            var currentVertexIndex = currentVertexInfo.index;
            var currentVertexColor = currentVertexInfo.color;

            for (const connectionDetail of connections[currentVertexIndex]) {
                var adjacentVertexIndex = connectionDetail.neighbor;
                var connectionWeight = connectionDetail.weight;

                if (colorsAssigned[adjacentVertexIndex] !== null) {
                    continue;
                }

                var nextVertexColor;
                if (connectionWeight % 2 === 0) {
                    nextVertexColor = currentVertexColor;
                } else {
                    nextVertexColor = (currentVertexColor === "0" ? "1" : "0");
                }

                colorsAssigned[adjacentVertexIndex] = nextVertexColor;
                traversalQueue.push({ index: adjacentVertexIndex, color: nextVertexColor });
            }
        }
        return colorsAssigned;
    }

    var finalColors = determineNodeColors(totalNodes, graphConnections);

    finalColors.forEach(nodeColor => {
        console.log(nodeColor);
    });
});
