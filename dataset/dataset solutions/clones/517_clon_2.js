let fileSys = require('node:fs'),
  dataSize = fileSys.fstatSync(process.stdin.fd).size,
  rawBuffer = new Buffer(dataSize),
  octetsRead = fileSys.readSync(process.stdin.fd, rawBuffer, 0, dataSize, 0),
  incomingLines = rawBuffer.toString('utf8', 0, octetsRead).split('\n');

let limitVal, countNum;
let indexLoop;

function createAdjacencyMatrix(nodeCount) {
  let rowIdx, colIdx, adjMatrix;
  adjMatrix = [];
  for (rowIdx = 0; rowIdx < nodeCount; rowIdx++) {
    adjMatrix[rowIdx] = [];
    for (colIdx = 0; colIdx < nodeCount; colIdx++) {
      adjMatrix[rowIdx][colIdx] = rowIdx === colIdx ? 0 : Number.POSITIVE_INFINITY;
    }
  }
  return adjMatrix;
}

function computeAllPairsShortestPaths(distanceMatrix) {
  let sourceNode, destNode, intermediateNode, matrixDimension = distanceMatrix.length;
  for (intermediateNode = 0; intermediateNode < matrixDimension; intermediateNode++) {
    for (sourceNode = 0; sourceNode < matrixDimension; sourceNode++) {
      for (destNode = 0; destNode < matrixDimension; destNode++) {
        distanceMatrix[sourceNode][destNode] = distanceMatrix[sourceNode][destNode] > distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode] ? distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode] : distanceMatrix[sourceNode][destNode];
      }
    }
  }
  return distanceMatrix;
}

function analyzePath(maximumJump, itemCount, displacementArray) {
  let pathGraph = createAdjacencyMatrix(itemCount + 2);
  let outerIndex, innerIndex;
  let currentPosition;

  for (outerIndex = 0; outerIndex <= itemCount; outerIndex++) {
    for (let stepCount = maximumJump; stepCount--;) {
      currentPosition = outerIndex + stepCount + (outerIndex + stepCount < itemCount + 1 ? displacementArray[outerIndex + stepCount] : 0);
      currentPosition = Math.min(Math.max(currentPosition, 0), itemCount + 1);
      if (currentPosition !== outerIndex) {
        pathGraph[outerIndex][currentPosition] = 1;
      }
    }
  }

  computeAllPairsShortestPaths(pathGraph);

  for (outerIndex = 0; outerIndex <= itemCount; outerIndex++) {
    if (pathGraph[0][outerIndex] < Number.POSITIVE_INFINITY && pathGraph[outerIndex][itemCount + 1] === Number.POSITIVE_INFINITY) {
      return false;
    }
  }
  return true;
}

while ((limitVal = incomingLines.shift() - 0) !== 0) {
  let offsetValues = [];
  countNum = incomingLines.shift() - 0;
  offsetValues[0] = 0;
  offsetValues[countNum + 1] = 0;
  for (indexLoop = 1; indexLoop <= countNum; indexLoop++) {
    offsetValues[indexLoop] = incomingLines.shift() - 0;
  }
  console.log(analyzePath(limitVal, countNum, offsetValues) ? 'OK' : 'NG');
}