const dataStream = require('node:fs').readFileSync(0, 'utf8');
const rawSegments = dataStream.trim().split('\n');

const [vertexCountStr, edgeCountStr, initialElevationStr] = rawSegments[0].split(' ');
const vertexCount = parseInt(vertexCountStr, 10);
const edgeCount = parseInt(edgeCountStr, 10);
const initialElevation = parseInt(initialElevationStr, 10);

const elevationLevels = Array.from({ length: vertexCount }, (_, idx) =>
  parseInt(rawSegments[idx + 1], 10)
);

const connectionMap = Array.from({ length: vertexCount }, () => []);

for (let linkIdx = 0; linkIdx < edgeCount; linkIdx++) {
  const [originVertexStr, targetVertexStr, journeyCostStr] = rawSegments[linkIdx + vertexCount + 1].split(' ');
  const originVertex = parseInt(originVertexStr, 10) - 1;
  const targetVertex = parseInt(targetVertexStr, 10) - 1;
  const journeyCost = parseInt(journeyCostStr, 10);

  connectionMap[originVertex].push({
    destination: targetVertex,
    toll: journeyCost
  });
  connectionMap[targetVertex].push({
    destination: originVertex,
    toll: journeyCost
  });
}

let minimumJourneyTime = Infinity;

const explorePath = (currentVertex, accumulatedTime, currentElevation, visitedNodes) => {
  if (accumulatedTime >= minimumJourneyTime) {
    return;
  }

  if (currentVertex === vertexCount - 1) {
    minimumJourneyTime = Math.min(minimumJourneyTime, accumulatedTime + elevationLevels[currentVertex] - currentElevation);
    return;
  }

  const currentConnections = connectionMap[currentVertex];
  for (const connectionDetail of currentConnections) {
    const nextVertex = connectionDetail.destination;
    const journeyToll = connectionDetail.toll;

    if (visitedNodes.has(nextVertex)) {
      continue;
    }

    if (elevationLevels[currentVertex] < journeyToll) {
      continue;
    }

    const nextVisitedNodesSet = new Set(visitedNodes).add(nextVertex);

    let newAccumulatedTime;
    let newElevation;

    if (elevationLevels[nextVertex] + journeyToll < currentElevation) {
      newAccumulatedTime = accumulatedTime + journeyToll + currentElevation - (elevationLevels[nextVertex] + journeyToll);
      newElevation = elevationLevels[nextVertex];
    }
    else if (elevationLevels[nextVertex] + journeyToll >= currentElevation && currentElevation >= journeyToll) {
      newAccumulatedTime = accumulatedTime + journeyToll;
      newElevation = currentElevation - journeyToll;
    }
    else {
      newAccumulatedTime = accumulatedTime + journeyToll + journeyToll - currentElevation;
      newElevation = 0;
    }

    explorePath(nextVertex, newAccumulatedTime, newElevation, nextVisitedNodesSet);
  }
};

explorePath(0, 0, initialElevation, new Set([0]));

if (minimumJourneyTime === Infinity) {
  console.log(-1);
} else {
  console.log(minimumJourneyTime);
}