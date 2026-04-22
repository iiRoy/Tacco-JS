"use strict";

const processInput = inputStr => {
  inputStr = inputStr.trim().split('\n');

  const nodeCount = parseInt(inputStr[0].split(' ')[0], 10);
  const edgeCount = parseInt(inputStr[0].split(' ')[1], 10);

  const edgeList = inputStr.slice(1, nodeCount + 1).map(lineItem => lineItem.split(' ').map(strVal => parseInt(strVal, 10)));

  // Build the graph's connectivity representation.
  const adjMatrix = Array(nodeCount).fill(null).map(() => Array(nodeCount).fill(0));

  for (let edgeIdx in edgeList) {
    const sourceNode = edgeList[edgeIdx][0] - 1;
    const targetNode = edgeList[edgeIdx][1] - 1;

    adjMatrix[sourceNode][targetNode] = 1;
    adjMatrix[targetNode][sourceNode] = 1;
  }

  let fullPathCount = 0;

  const explorePaths = (currentVertex, visitedState) => {
    if (visitedState.every(status => status === true)) {
      fullPathCount++;
    }

    for (let vertexIndex = 0; vertexIndex < nodeCount; vertexIndex++) {
      if (adjMatrix[currentVertex][vertexIndex] === 0) continue;
      if (visitedState[vertexIndex]) continue;

      visitedState[vertexIndex] = true;
      explorePaths(vertexIndex, visitedState);
      visitedState[vertexIndex] = false;
    }

    return;
  };

  const vertexVisitTracker = [true, ...Array(nodeCount - 1).fill(false)];
  explorePaths(0, vertexVisitTracker);

  console.log(fullPathCount);
};
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));