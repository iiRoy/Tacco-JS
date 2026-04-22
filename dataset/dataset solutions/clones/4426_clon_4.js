const nativeFileSys = require('node:fs');
const rawInput = nativeFileSys.readFileSync("/dev/stdin", "UTF-8");
const inputLines = rawInput.split("\n");

let lineIndexer = 0;
const totalVertices = parseInt(inputLines[lineIndexer++], 10);
const connectionsMap = new Map();

for (let i = 0; i < totalVertices; ++i) {
    connectionsMap.set(i, []);
}

const queryAndPivotInfo = inputLines[totalVertices].split(" ").map(val => parseInt(val, 10));
const totalRequests = queryAndPivotInfo[0];
const pivotVertex = queryAndPivotInfo[1] - 1;

for (let i = 0; i < totalVertices - 1; ++i) {
    const linkData = inputLines[lineIndexer++].split(" ").map(val => parseInt(val, 10));
    const vertexA = linkData[0] - 1;
    const vertexB = linkData[1] - 1;
    const linkCost = linkData[2];

    if (vertexB !== pivotVertex) {
        connectionsMap.get(vertexA).push({ destination: vertexB, cost: linkCost });
    }
    if (vertexA !== pivotVertex) {
        connectionsMap.get(vertexB).push({ destination: vertexA, cost: linkCost });
    }
}

const vertexDistances = new Map();

const depthFirstSearch = (currentVertex, currentAccumulatedCost, previousVertex) => {
    if (vertexDistances.has(currentVertex) && vertexDistances.get(currentVertex) <= currentAccumulatedCost) {
        return;
    }

    vertexDistances.set(currentVertex, currentAccumulatedCost);

    const outgoingLinks = connectionsMap.get(currentVertex);
    if (outgoingLinks) {
        for (const link of outgoingLinks) {
            if (link.destination !== previousVertex) {
                depthFirstSearch(link.destination, currentAccumulatedCost + link.cost, currentVertex);
            }
        }
    }
};

depthFirstSearch(pivotVertex, 0, -1);

const finalResults = [];
for (let q = 0; q < totalRequests; ++q) {
    const requestPath = inputLines[lineIndexer++].split(" ").map(val => parseInt(val, 10));
    const firstRequestVertex = requestPath[0] - 1;
    const secondRequestVertex = requestPath[1] - 1;

    const distanceToFirst = vertexDistances.get(firstRequestVertex);
    const distanceToSecond = vertexDistances.get(secondRequestVertex);

    finalResults.push(distanceToFirst + distanceToSecond);
}

finalResults.forEach(resultValue => console.log(resultValue));