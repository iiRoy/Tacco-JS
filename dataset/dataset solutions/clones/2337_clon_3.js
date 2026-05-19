'use strict';

function processGraphData(rawInputString) {
  const inputLines = rawInputString.trim().split('\n');

  const [numNodes, startNodeU, startNodeV] = inputLines[0].split(' ').map(Number);

  const edgeDescriptions = inputLines.slice(1);

  const parsedEdges = edgeDescriptions.map(line => line.split(' ').map(Number));

  const adjacencyMap = new Map();

  const ensureNodeEntry = (nodeId) => {
    if (!adjacencyMap.has(nodeId)) {
      adjacencyMap.set(nodeId, []);
    }
  };

  for (const currentEdgePair of parsedEdges) {
    const nodeX = currentEdgePair[0];
    const nodeY = currentEdgePair[1];

    ensureNodeEntry(nodeX);
    ensureNodeEntry(nodeY);

    adjacencyMap.get(nodeX).push(nodeY);
    adjacencyMap.get(nodeY).push(nodeX);
  }

  const distancesFromU = Array.from({ length: numNodes + 1 }, () => 0);
  const distancesFromV = Array.from({ length: numNodes + 1 }, () => 0);

  const calculateDistancesDFS = (currentNodeId, previousNodeId, currentDistance, distanceArray) => {
    distanceArray[currentNodeId] = currentDistance;

    const neighbors = adjacencyMap.get(currentNodeId) || [];

    for (const neighborNodeId of neighbors) {
      if (neighborNodeId !== previousNodeId) {
        calculateDistancesDFS(neighborNodeId, currentNodeId, currentDistance + 1, distanceArray);
      }
    }
  };

  calculateDistancesDFS(startNodeU, 0, 0, distancesFromU);
  calculateDistancesDFS(startNodeV, 0, 0, distancesFromV);

  let maxRelevantDistance = 0;

  for (let nodeId = 1; nodeId <= numNodes; ++nodeId) {
    if (distancesFromU[nodeId] < distancesFromV[nodeId]) {
      const potentialMax = distancesFromV[nodeId] - 1;
      maxRelevantDistance = Math.max(maxRelevantDistance, potentialMax);
    }
  }

  console.log(maxRelevantDistance);
}

processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
