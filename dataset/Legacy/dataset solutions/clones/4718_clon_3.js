'use strict';

const VISITED_MARKER = 1;
const UNVISITED_MARKER = 0;

function checkAllNodesVisited(nodeVisitStates) {
  return nodeVisitStates.every(state => state === VISITED_MARKER);
}

let totalValidPaths = 0;

function performDFS(currentVertex, totalVertices, adjMatrix, currentVisitStatus) {
  if (checkAllNodesVisited(currentVisitStatus)) {
    totalValidPaths++;
    return;
  }

  for (let nextVertex = 0; nextVertex < totalVertices; nextVertex++) {
    const hasEdge = adjMatrix[currentVertex][nextVertex] === VISITED_MARKER;
    const isUnvisited = currentVisitStatus[nextVertex] === UNVISITED_MARKER;

    if (hasEdge && isUnvisited) {
      currentVisitStatus[nextVertex] = VISITED_MARKER;
      performDFS(nextVertex, totalVertices, adjMatrix, currentVisitStatus);
      currentVisitStatus[nextVertex] = UNVISITED_MARKER;
    }
  }
}

function processGraphInput(rawInputData) {
  const inputLines = rawInputData.split('\n');

  const [numNodesStr, numEdgesStr] = inputLines.shift().split(' ');
  const numNodes = parseInt(numNodesStr, 10);
  const numEdges = parseInt(numEdgesStr, 10);

  const adjacencyMatrix = Array.from({ length: numNodes }, () =>
    Array.from({ length: numNodes }, () => UNVISITED_MARKER)
  );

  for (const edgeDefinition of inputLines) {
    const [nodeAStr, nodeBStr] = edgeDefinition.split(' ');
    const nodeA = parseInt(nodeAStr, 10);
    const nodeB = parseInt(nodeBStr, 10);

    const idxA = nodeA - 1;
    const idxB = nodeB - 1;

    adjacencyMatrix[idxA][idxB] = VISITED_MARKER;
    adjacencyMatrix[idxB][idxA] = VISITED_MARKER;
  }

  const initialVisitStatus = Array(numNodes).fill(UNVISITED_MARKER);
  initialVisitStatus[0] = VISITED_MARKER;

  performDFS(0, numNodes, adjacencyMatrix, initialVisitStatus);

  console.log(totalValidPaths);
}

totalValidPaths = 0;
processGraphInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
