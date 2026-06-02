'use strict';

function allNodesVisited(currentVisitedSet, totalNodes) {
  return currentVisitedSet.size === totalNodes;
}

function explorePaths(currentNodeIdentifier, totalNodesCount, graphAdjacencyMap, currentVisitedNodeSet) {
  if (allNodesVisited(currentVisitedNodeSet, totalNodesCount)) {
    return 1;
  }

  let accumulatedPathCount = 0;
  const connectedNodes = graphAdjacencyMap.get(currentNodeIdentifier) || [];

  for (const nextConnectedNode of connectedNodes) {
    if (!currentVisitedNodeSet.has(nextConnectedNode)) {
      const nextVisitedNodeSet = new Set(currentVisitedNodeSet);
      nextVisitedNodeSet.add(nextConnectedNode);

      accumulatedPathCount += explorePaths(nextConnectedNode, totalNodesCount, graphAdjacencyMap, nextVisitedNodeSet);
    }
  }

  return accumulatedPathCount;
}

function processInputAndSolve(rawInputData) {
  const inputLines = rawInputData.split('\n');
  const [nodeQuantity, edgeQuantity] = inputLines.shift().split(' ').map(Number);

  const graphAdjacencyMap = new Map();
  for (let i = 0; i < nodeQuantity; i++) {
    graphAdjacencyMap.set(i, []);
  }

  for (const connectionLine of inputLines) {
    const [nodeOne, nodeTwo] = connectionLine.split(' ').map(Number);
    graphAdjacencyMap.get(nodeOne - 1).push(nodeTwo - 1);
    graphAdjacencyMap.get(nodeTwo - 1).push(nodeOne - 1);
  }

  const initialVisitedNodeSet = new Set();
  initialVisitedNodeSet.add(0);

  const finalResultCount = explorePaths(0, nodeQuantity, graphAdjacencyMap, initialVisitedNodeSet);
  console.log(finalResultCount);
}

processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
