const areVectorsEqual = (vecA, vecB) => {
  return vecA[0] === vecB[0] && vecA[1] === vecB[1];
};

function solveGeometricProblem(rawInputString) {
  'use strict';

  const inputLines = rawInputString.split("\n");

  const pointCountStr = inputLines.shift();
  const numPoints = parseInt(pointCountStr, 10);

  const pointsCoordinates = [];
  for (let k = 0; k < numPoints; k++) {
    const coords = inputLines[k].split(" ").map(Number);
    pointsCoordinates.push(coords);
  }

  const forwardVectors = [];
  const backwardVectors = [];

  for (let idx1 = 0; idx1 < numPoints - 1; idx1++) {
    const p1 = pointsCoordinates[idx1];
    for (let idx2 = idx1 + 1; idx2 < numPoints; idx2++) {
      const p2 = pointsCoordinates[idx2];

      const diffX_forward = p1[0] - p2[0];
      const diffY_forward = p1[1] - p2[1];
      forwardVectors.push([diffX_forward, diffY_forward]);

      const diffX_backward = p2[0] - p1[0];
      const diffY_backward = p2[1] - p1[1];
      backwardVectors.push([diffX_backward, diffY_backward]);
    }
  }

  forwardVectors.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  backwardVectors.sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  let currentConsecutiveMatchCount = 1;
  let maxConsecutiveMatchCount = 0;

  const totalVectorPairs = forwardVectors.length;

  if (totalVectorPairs > 0) {
    for (let k = 0; k < totalVectorPairs - 1; k++) {
      const currentVector = forwardVectors[k];
      const nextVectorInForward = forwardVectors[k + 1];
      const nextVectorInBackward = backwardVectors[k + 1];

      if (areVectorsEqual(currentVector, nextVectorInForward) || areVectorsEqual(currentVector, nextVectorInBackward)) {
        currentConsecutiveMatchCount++;
      } else {
        if (maxConsecutiveMatchCount < currentConsecutiveMatchCount) {
          maxConsecutiveMatchCount = currentConsecutiveMatchCount;
        }
        currentConsecutiveMatchCount = 1;
      }
    }
  }

  console.log(numPoints - maxConsecutiveMatchCount);
}

solveGeometricProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
