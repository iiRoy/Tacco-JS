const systemConfig = { sourceData: '/dev/stdin', lineSeparator: '\n' };

const dataStream = require('fs').readFileSync(systemConfig.sourceData, 'ascii');
const parsedSegments = dataStream.trim().split(systemConfig.lineSeparator);

const totalVertices = Number(parsedSegments.shift());

const graphStructure = new Array(totalVertices);

for (let currentVertexId = 0; currentVertexId < totalVertices; currentVertexId++) {
  graphStructure[currentVertexId] = {
    identity: currentVertexId,
    pathCost: Number.POSITIVE_INFINITY,
    prior: null,
    adjacencies: []
  };
}

for (let segmentIndex = 0; segmentIndex < parsedSegments.length; segmentIndex++) {
  const lineParts = parsedSegments[segmentIndex].split(' ').map(Number);
  const originatingNodeId = lineParts[0];

  for (let connectionSegment = 2; connectionSegment < lineParts.length; connectionSegment += 2) {
    const terminatingNodeId = lineParts[connectionSegment];
    const edgeExpense = lineParts[connectionSegment + 1];
    graphStructure[originatingNodeId].adjacencies.push({ destination: terminatingNodeId, expense: edgeExpense });
  }
}

graphStructure[0].pathCost = 0; // Assuming node 0 is the starting point

function computeOptimalRoutes(vertexCollection) {
  const unvisitedPoints = new Set(vertexCollection.map(v => v.identity));

  while (unvisitedPoints.size > 0) {
    let currentPathfinder = null;
    let lowestKnownCost = Number.POSITIVE_INFINITY;

    for (const pointId of unvisitedPoints) {
      const candidatePoint = vertexCollection[pointId];
      if (candidatePoint.pathCost < lowestKnownCost) {
        lowestKnownCost = candidatePoint.pathCost;
        currentPathfinder = candidatePoint;
      }
    }

    if (currentPathfinder === null) {
      break;
    }

    unvisitedPoints.delete(currentPathfinder.identity);

    for (const currentConnection of currentPathfinder.adjacencies) {
      const neighborPoint = vertexCollection[currentConnection.destination];
      const potentialNewCost = currentPathfinder.pathCost + currentConnection.expense;

      if (potentialNewCost < neighborPoint.pathCost) {
        neighborPoint.pathCost = potentialNewCost;
        neighborPoint.prior = currentPathfinder.identity;
      }
    }
  }
}

computeOptimalRoutes(graphStructure);

for (let resultIndex = 0; resultIndex < totalVertices; resultIndex++) {
  console.log(`${graphStructure[resultIndex].identity} ${graphStructure[resultIndex].pathCost}`);
}