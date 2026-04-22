var inputSegments = [];
var lineParserModule = require('readline');

var interfaceHandler = lineParserModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

interfaceHandler.on('line', function (currentSegment) {
    inputSegments.push(currentSegment);
});

interfaceHandler.on('close', function () {
    var vertexCount = Number(inputSegments[0]);
    var rawEdgeList = inputSegments.slice(1);

    var adjacencyStructure = new Array(vertexCount).fill(null).map(() => []);

    for (let idx = 0; idx < rawEdgeList.length; idx++) {
        let parts = rawEdgeList[idx].split(" ").map(s => Number(s));
        let nodeA = parts[0] - 1;
        let nodeB = parts[1] - 1;
        let pathValue = parts[2];

        adjacencyStructure[nodeA].push({ neighbor: nodeB, weight: pathValue });
        adjacencyStructure[nodeB].push({ neighbor: nodeA, weight: pathValue });
    }

    var vertexShades = new Array(vertexCount).fill(-1);
    var visitQueue = [];

    vertexShades[0] = 0;
    visitQueue.push(0);

    let headPointer = 0;
    while (headPointer < visitQueue.length) {
        let currentVertex = visitQueue[headPointer++];
        let currentShade = vertexShades[currentVertex];

        for (let connection of adjacencyStructure[currentVertex]) {
            let connectedVertex = connection.neighbor;
            let edgeVal = connection.weight;

            let requiredShade = (edgeVal % 2 === 0) ? currentShade : (1 - currentShade);

            if (vertexShades[connectedVertex] === -1) {
                vertexShades[connectedVertex] = requiredShade;
                visitQueue.push(connectedVertex);
            }
        }
    }

    for (var idx = 0; idx < vertexCount; idx++) {
        console.log(vertexShades[idx]);
    }
});