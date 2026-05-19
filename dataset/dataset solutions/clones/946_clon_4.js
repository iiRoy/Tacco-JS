const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const contentLines = fileContent.split('\n');

const nodeCount = Number(contentLines.shift());

const graphAdjacency = new Map();
for (let i = 1; i <= nodeCount; i++) {
    graphAdjacency.set(i, []);
}

for (let lineIndex = 0; lineIndex < nodeCount; lineIndex++) {
    const currentLineParts = contentLines.shift().split(' ').map(Number);
    const sourceNode = currentLineParts[0];
    const neighborCount = currentLineParts[1];

    const neighborsList = graphAdjacency.get(sourceNode);
    for (let neighborIdx = 0; neighborIdx < neighborCount; neighborIdx++) {
        neighborsList.push(currentLineParts[2 + neighborIdx]);
    }
}

const pathDistances = new Map();

const bfsQueue = [];
const startNode = 1;
bfsQueue.push(startNode);
pathDistances.set(startNode, 0);

let queueHead = 0;
while (queueHead < bfsQueue.length) {
    const currentVertex = bfsQueue[queueHead++];

    const adjacentVertices = graphAdjacency.get(currentVertex);

    if (adjacentVertices) {
        for (const nextVertex of adjacentVertices) {
            if (!pathDistances.has(nextVertex)) {
                pathDistances.set(nextVertex, pathDistances.get(currentVertex) + 1);
                bfsQueue.push(nextVertex);
            }
        }
    }
}

for (let vertexId = 1; vertexId <= nodeCount; vertexId++) {
    const distance = pathDistances.has(vertexId) ? pathDistances.get(vertexId) : -1;
    console.log(vertexId, distance);
}
