const fileSystem = require('fs');

let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim();

let dataRows = rawData.split('\n');

let nodeCount = +dataRows.shift();

let adjacencyMatrix = [[]];
for (let rowIdx = 1; rowIdx <= nodeCount; rowIdx++) {
    adjacencyMatrix.push([]);
    for (let colIdx = 1; colIdx <= nodeCount; colIdx++) {
        adjacencyMatrix[rowIdx][colIdx] = 0;
    }
}

for (let rowIdx = 1; rowIdx <= nodeCount; rowIdx++) {
    let parsedLine = dataRows.shift().split(' ').map(function(numStr) {
        return +numStr;
    });

    let currentNodeId = parsedLine[0];
    let numNeighbors = parsedLine[1];

    for (let neighborIdx = 0; neighborIdx < numNeighbors; neighborIdx++) {
        adjacencyMatrix[rowIdx][parsedLine[2 + neighborIdx]] = 1;
    }
}

let distances = [];
for (let idx = 0; idx <= nodeCount; idx++) {
    distances[idx] = -1;
}

let bfsQueue = [1];
distances[1] = 0;
let currentVertex;

while ((currentVertex = bfsQueue.shift()) !== undefined) {
    for (let neighborNode = 1; neighborNode <= nodeCount; neighborNode++) {
        if (!adjacencyMatrix[currentVertex][neighborNode]) {
            continue;
        }

        let adjacentVertex = neighborNode;
        if (distances[adjacentVertex] === -1) {
            distances[adjacentVertex] = distances[currentVertex] + 1;
            bfsQueue.push(adjacentVertex);
        }
    }
}

for (let outputNodeId = 1; outputNodeId <= nodeCount; outputNodeId++) {
    console.log(outputNodeId, distances[outputNodeId]);
}
