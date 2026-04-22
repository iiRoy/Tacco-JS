let rawLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");

let firstLineParts = rawLines[0].split(" ").map(Number);
let totalNodes = firstLineParts[0];
let totalEdges = firstLineParts[1];
let finalDestination = firstLineParts[2];

let graphEdgeLines = rawLines.slice(1);

let adjacencyMap = new Map();
for (let j = 1; j <= totalNodes; ++j) {
    adjacencyMap.set(j, []);
}

graphEdgeLines.forEach(line => {
    let parts = line.split(" ").map(Number);
    let origin = parts[0];
    let terminus = parts[1];
    let weight = parts[2];
    adjacencyMap.get(origin).push([terminus, weight]);
});

let overallMaxGain = -1;

function traversePaths(currentPoint, currentAccumulation, visitedPoints) {
    visitedPoints.add(currentPoint);

    if (currentPoint === finalDestination) {
        overallMaxGain = Math.max(overallMaxGain, currentAccumulation);
    }

    let outgoingConnections = adjacencyMap.get(currentPoint);

    if (outgoingConnections) {
        for (let [nextPoint, connectionValue] of outgoingConnections) {
            if (!visitedPoints.has(nextPoint)) {
                traversePaths(nextPoint, currentAccumulation + connectionValue, new Set(visitedPoints));
            }
        }
    }
}

traversePaths(1, 0, new Set());

console.log(overallMaxGain);