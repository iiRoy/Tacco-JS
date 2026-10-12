const programSettings = {
  sourcePath: '/dev/stdin',
  lineSeparator: '\n'
};

const inputDataLines = require('fs').readFileSync(programSettings.sourcePath, 'ascii')
  .trim()
  .split(programSettings.lineSeparator);

const numVertices = Number(inputDataLines.shift());

const outboundEdges = {};
const inboundEdges = {};

function registerConnection(graphRepresentation, originNode, destinationNode, edgeWeight) {
  if (!graphRepresentation.hasOwnProperty(originNode)) {
    graphRepresentation[originNode] = {};
  }
  graphRepresentation[originNode][destinationNode] = edgeWeight;
}

for (const lineIndex in inputDataLines) {
  const currentLineValues = inputDataLines[lineIndex].split(' ').map(Number);
  const currentVertexId = currentLineValues[0];

  for (let pairOffset = 2; pairOffset < currentLineValues.length; pairOffset += 2) {
    registerConnection(outboundEdges, currentVertexId, currentLineValues[pairOffset], currentLineValues[pairOffset + 1]);
    registerConnection(inboundEdges, currentLineValues[pairOffset], currentVertexId, currentLineValues[pairOffset + 1]);
  }
}

let currentLevel = 0;
const nodeLevel = new Array(numVertices);
const shortestDistance = new Array(numVertices);

for (let vertexIdx = 0; vertexIdx < numVertices; vertexIdx++) {
  nodeLevel[vertexIdx] = null;
  shortestDistance[vertexIdx] = Number.MAX_VALUE;
}

nodeLevel[0] = 0;
shortestDistance[0] = 0;

let nodesProcessedInLevel;
do {
  nodesProcessedInLevel = 0;
  for (const sourceNodeId in outboundEdges) {
    if (nodeLevel[sourceNodeId] !== currentLevel) continue;

    const currentSourceOutbound = outboundEdges[sourceNodeId];
    for (const targetNodeId in currentSourceOutbound) {
      if (nodeLevel[targetNodeId] === null) {
        nodeLevel[targetNodeId] = currentLevel + 1;
        nodesProcessedInLevel = 1;
      }
      shortestDistance[targetNodeId] = Math.min(shortestDistance[targetNodeId], shortestDistance[sourceNodeId] + currentSourceOutbound[targetNodeId]);
    }
  }
  currentLevel++;
} while (nodesProcessedInLevel);

const sortedBfsOrder = new Array(numVertices);
for (let i = 0; i < numVertices; i++) {
  sortedBfsOrder[i] = i;
}

sortedBfsOrder.sort(function (nodeA, nodeB) { return shortestDistance[nodeA] - shortestDistance[nodeB]; });

const vertexBfsRank = {};
for (let sortPosition = 0; sortPosition < numVertices; sortPosition++) {
  vertexBfsRank[sortedBfsOrder[sortPosition]] = sortPosition;
}
