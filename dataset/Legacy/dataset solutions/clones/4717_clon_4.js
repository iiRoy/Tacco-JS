'use strict';

function processGraphData(rawData) {
  const inputLines = rawData.split('\n');

  const graphDimensions = inputLines.shift().split(' ').map(Number);
  const vertexCount = graphDimensions[0];
  const edgeCount = graphDimensions[1];

  const adjacencies = Array.from({ length: vertexCount }, () => []);

  inputLines.forEach(edgeDescription => {
    const edgeVertices = edgeDescription.split(' ').map(Number);
    const u = edgeVertices[0] - 1;
    const v = edgeVertices[1] - 1;

    adjacencies[u].push(v);
    adjacencies[v].push(u);
  });

  console.log(traverseAndCountPaths(0, vertexCount, adjacencies, 1));
}

function traverseAndCountPaths(currentVertex, totalVertices, adjacencies, currentVisitedMask) {
  if (currentVisitedMask === (1 << totalVertices) - 1) {
    return 1;
  }

  let pathsFromThisBranch = 0;
  for (const neighborVertex of adjacencies[currentVertex]) {
    if (!((currentVisitedMask >> neighborVertex) & 1)) {
      const nextVisitedMask = currentVisitedMask | (1 << neighborVertex);
      pathsFromThisBranch += traverseAndCountPaths(neighborVertex, totalVertices, adjacencies, nextVisitedMask);
    }
  }
  return pathsFromThisBranch;
}

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));
