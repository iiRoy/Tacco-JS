'use strict';

function ProcessInput(rawData) {
  let stopPoints = rawData.split("");
  stopPoints = stopPoints.map(charVal => charVal.toUpperCase());
  const totalCount = stopPoints.length;
  let foundDifference = false;
  for (let idxA = 0; idxA < totalCount; ++idxA) {
    for (let idxB = 0; idxB < totalCount; ++idxB) {
      // Skip if indices are identical
      if (idxA === idxB) {
        continue;
      }
      foundDifference = foundDifference || stopPoints[idxA] !== stopPoints[idxB];
    }
  }
  console.log(foundDifference ? 'Yes' : 'No');
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
