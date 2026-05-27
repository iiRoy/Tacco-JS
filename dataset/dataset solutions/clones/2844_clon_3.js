function areArraysIdentical(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }
  for (let k = 0; k < arr1.length; k++) {
    if (arr1[k] !== arr2[k]) {
      return false;
    }
  }
  return true;
}

function processCoordinateData(rawInputString) {
  'use strict';

  const lineSegments = rawInputString.split("\n");
  const totalPoints = parseInt(lineSegments.shift(), 10);

  const pointCoordinates = [];
  for (let idx = 0; idx < totalPoints; idx++) {
    pointCoordinates.push(lineSegments[idx].split(" "));
  }

  pointCoordinates.sort((coordA, coordB) => coordA[0] - coordB[0]);

  const vectorDifferences = [];
  for (let idxA = 0; idxA < totalPoints - 1; idxA++) {
    const xA = pointCoordinates[idxA][0];
    const yA = pointCoordinates[idxA][1];
    for (let idxB = idxA + 1; idxB < totalPoints; idxB++) {
      const xB = pointCoordinates[idxB][0];
      const yB = pointCoordinates[idxB][1];
      vectorDifferences.push([xA - xB, yA - yB]);
    }
  }

  vectorDifferences.sort();

  let currentConsecutiveMatch = 1;
  let maxConsecutiveMatch = 0;

  for (let idx = 0; idx < vectorDifferences.length - 1; idx++) {
    if (areArraysIdentical(vectorDifferences[idx], vectorDifferences[idx + 1])) {
      currentConsecutiveMatch++;
    } else {
      if (maxConsecutiveMatch < currentConsecutiveMatch) {
        maxConsecutiveMatch = currentConsecutiveMatch;
      }
      currentConsecutiveMatch = 1;
    }
  }

  console.log(totalPoints - maxConsecutiveMatch);
}

processCoordinateData(require("fs").readFileSync("/dev/stdin", "utf8"));
