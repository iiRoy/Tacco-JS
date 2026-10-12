'use strict'

let nodeCountGlobal, edgeCountGlobal, visitedNodesGlobal, adjacencyMatrixGlobal;

const IS_CONNECTED = true;
const NOT_CONNECTED = false;

const displayMatrix = (matrixToDisplay) => {
  let matrixString = '';
  for (let rowIdx in matrixToDisplay) {
    for (let colIdx in matrixToDisplay[rowIdx]) {
      matrixString += matrixToDisplay[rowIdx][colIdx] ? '@' : '-';
    }
    matrixString += '\n';
  }
  console.log(matrixString);
};

const depthFirstSearch = (currentNodeIdx) => {
  visitedNodesGlobal[currentNodeIdx] = IS_CONNECTED;
  for (let neighborIdx = 0; neighborIdx < nodeCountGlobal; neighborIdx++) {
    if (visitedNodesGlobal[neighborIdx] || adjacencyMatrixGlobal[currentNodeIdx][neighborIdx] === NOT_CONNECTED) {
      continue;
    }
    depthFirstSearch(neighborIdx);
  }
};

const areAllNodesVisited = (visitedArray) => {
  for (let i = 0; i < visitedArray.length; i++) {
    if (visitedArray[i] === NOT_CONNECTED) {
      return false;
    }
  }
  return true;
};

const createBooleanMatrix = (rows, cols, initialValue = NOT_CONNECTED) => {
  return Array.from({ length: rows }, () => Array(cols).fill(initialValue));
};

const createBooleanArray = (length, initialValue = NOT_CONNECTED) => {
  return Array(length).fill(initialValue);
};

function main(inputString) {
  const rawLines = inputString.split('\n');
  const firstLineValues = rawLines[0].split(' ').map(Number);
  nodeCountGlobal = firstLineValues[0];
  edgeCountGlobal = firstLineValues[1];

  const inputEdges = rawLines.slice(1, -1).map(line => line.split(' ').map(Number));

  adjacencyMatrixGlobal = createBooleanMatrix(nodeCountGlobal, nodeCountGlobal);

  for (let k = 0; k < edgeCountGlobal; k++) {
    const nodeA = inputEdges[k][0] - 1;
    const nodeB = inputEdges[k][1] - 1;
    adjacencyMatrixGlobal[nodeA][nodeB] = IS_CONNECTED;
    adjacencyMatrixGlobal[nodeB][nodeA] = IS_CONNECTED;
  }

  visitedNodesGlobal = createBooleanArray(nodeCountGlobal);

  let bridgeCounter = 0;

  for (let i = 0; i < nodeCountGlobal; i++) {
    for (let j = 0; j < nodeCountGlobal; j++) {
      if (adjacencyMatrixGlobal[i][j]) {
        adjacencyMatrixGlobal[i][j] = NOT_CONNECTED;
        adjacencyMatrixGlobal[j][i] = NOT_CONNECTED;

        visitedNodesGlobal.fill(NOT_CONNECTED);

        depthFirstSearch(0);

        if (!areAllNodesVisited(visitedNodesGlobal)) {
          bridgeCounter++;
        }

        adjacencyMatrixGlobal[i][j] = IS_CONNECTED;
        adjacencyMatrixGlobal[j][i] = IS_CONNECTED;
      }
    }
  }

  console.log(bridgeCounter / 2);
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
