(function executeGraphTraversal() {
  const inputSegments = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
  const nodeCount = Number(inputSegments.shift());

  const graphConnections = Array.from({ length: nodeCount }, () => []);
  const pathLengths = Array(nodeCount).fill(-1);

  inputSegments.forEach((lineContent, index) => {
    lineContent.split(' ').slice(2).forEach(element => graphConnections[index].push(Number(element) - 1));
  });

  const computedDistances = determineShortestPaths(graphConnections, 0);

  for (let i = 0; i < nodeCount; i++) {
    pathLengths[i] = computedDistances.has(i) ? computedDistances.get(i) : -1;
  }

  for (let i = 0; i < nodeCount; i++) {
    console.log(i + 1, pathLengths[i]);
  }
})();

function determineShortestPaths(graphStructure, startIdentifier) {
  const distanceRegistry = new Map();
  distanceRegistry.set(startIdentifier, 0);

  function processLevel(currentNodesInLevel) {
    if (currentNodesInLevel.length === 0) {
      return;
    }

    const nextNodesForLevel = [];
    for (const currentVertex of currentNodesInLevel) {
      const currentVertexDistance = distanceRegistry.get(currentVertex);
      for (const adjacentVertex of graphStructure[currentVertex]) {
        if (!distanceRegistry.has(adjacentVertex)) {
          distanceRegistry.set(adjacentVertex, currentVertexDistance + 1);
          nextNodesForLevel.push(adjacentVertex);
        }
      }
    }
    processLevel(nextNodesForLevel);
  }

  processLevel([startIdentifier]);
  return distanceRegistry;
}
