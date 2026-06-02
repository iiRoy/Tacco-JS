const cfg = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(cfg.input, 'ascii');
const inputLines = fileContent.trim().split(cfg.newline);

const nodeCount = Number(inputLines.shift());
const graphConnectionsNum = {};

inputLines.forEach(function(currentLine) {
  const parts = currentLine.split(' ');
  const sourceNodeIdentifier = Number(parts.shift());
  parts.shift(); // Discard the count of neighbors
  graphConnectionsNum[sourceNodeIdentifier] = parts.map(Number);
});

for (const vertexId in graphConnectionsNum) {
  graphConnectionsNum[vertexId].sort((a, b) => a - b);
}

const entryTimesNum = {};
const exitTimesNum = {};
let timeMarkerNum = 0;

function exploreNodeDepthFirst(currentVertex) {
  timeMarkerNum++;
  entryTimesNum[currentVertex] = timeMarkerNum;

  const adjacentVertices = graphConnectionsNum[currentVertex];
  if (adjacentVertices) {
    for (const adjacentVertex of adjacentVertices) {
      if (!entryTimesNum.hasOwnProperty(adjacentVertex)) {
        exploreNodeDepthFirst(adjacentVertex);
      }
    }
  }

  timeMarkerNum++;
  exitTimesNum[currentVertex] = timeMarkerNum;
}

exploreNodeDepthFirst(1);

for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
  console.log("%d %s %s", nodeIdx, entryTimesNum[nodeIdx], exitTimesNum[nodeIdx]);
}
