"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawData.split(/ |\n/),
  tokenIndex = 0;

function readNextNum() {
  return +tokenizedInput[tokenIndex++];
}

function readNextStr() {
  return tokenizedInput[tokenIndex++];
}

function readNextBigInt() {
  return BigInt(tokenizedInput[tokenIndex++]);
}

function readNumArray(count, mapToNum) {
  if (mapToNum) {
    return tokenizedInput.slice(tokenIndex, tokenIndex += count);
  } else {
    return tokenizedInput.slice(tokenIndex, tokenIndex += count).map(val => +val);
  }
}

function readMatrix(height, width, mapToNum) {
  var resultMatrix = [],
    rowIdx = 0;
  if (mapToNum) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenizedInput.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenizedInput.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

// Original xArray function is replaced with a direct Array.from call for clarity and safety.
// The original xArray function used eval, which is generally discouraged.
// This change maintains the exact behavior of initializing an array of arrays.

var programResult = solveProblem();
if (programResult !== undefined) console.log(String(programResult));

function solveProblem() {
  const maxPossibleDistance = 1e9;
  const numEntries = readNextNum();
  const directionalPoints = Array.from({
    length: 4
  }, () => []); // Equivalent to xArray("[]", 4)
  const directionToGroupIndex = {
    U: 0,
    R: 1,
    D: 2,
    L: 3
  };

  for (let entryIdx = 0; entryIdx < numEntries; entryIdx++) {
    const currentX = readNextNum();
    const currentY = readNextNum();
    const currentDirection = readNextStr();
    const diffCoords = currentX - currentY;
    const sumCoords = currentX + currentY;
    directionalPoints[directionToGroupIndex[currentDirection]].push([currentX, currentY, diffCoords, sumCoords]);
  }

  let minDistance = maxPossibleDistance;

  // First Calculation Block: Vertical/Horizontal alignment (comparing U-D and R-L)
  for (let groupIdx = 0; groupIdx < 4; groupIdx++) {
    const primarySortAxis = groupIdx & 1; // 0 for U,D; 1 for R,L
    const secondarySortAxis = 1 - primarySortAxis;
    directionalPoints[groupIdx].sort((ptA, ptB) => {
      if (ptA[primarySortAxis] !== ptB[primarySortAxis]) {
        return ptA[primarySortAxis] - ptB[primarySortAxis];
      }
      return ptA[secondarySortAxis] - ptB[secondarySortAxis];
    });
  }

  for (let groupPairIdx = 0; groupPairIdx < 2; groupPairIdx++) {
    let currentPointer = 0;
    const groupA = directionalPoints[groupPairIdx];
    const groupB = directionalPoints[groupPairIdx + 2]; // U vs D, R vs L
    const comparisonAxis = groupPairIdx; // 0 for U-D (x), 1 for R-L (y)
    const valueAxis = 1 - groupPairIdx; // 1 for U-D (y), 0 for R-L (x)

    if (!groupB.length) continue;

    for (let i = 0; i < groupA.length; i++) {
      const pointFromA = groupA[i];
      while (currentPointer < groupB.length && groupB[currentPointer][comparisonAxis] < pointFromA[comparisonAxis]) {
        currentPointer++;
      }
      while (currentPointer < groupB.length &&
        groupB[currentPointer][comparisonAxis] === pointFromA[comparisonAxis] &&
        pointFromA[valueAxis] > groupB[currentPointer][valueAxis]) {
        currentPointer++;
      }
      if (currentPointer === groupB.length) break;

      const pointFromB = groupB[currentPointer];
      if (pointFromA[comparisonAxis] === pointFromB[comparisonAxis]) {
        minDistance = Math.min(minDistance, pointFromB[valueAxis] - pointFromA[valueAxis]);
      }
    }
  }

  // Second Calculation Block: Diagonal x+y alignment (comparing U-R and D-L)
  for (let groupIdx = 0; groupIdx < 4; groupIdx++) {
    const secondarySortKeyIndex = 1 - (groupIdx & 1); // 1 for U,D; 0 for R,L
    directionalPoints[groupIdx].sort((ptA, ptB) => {
      if (ptA[3] !== ptB[3]) { // Sort by x+y
        return ptA[3] - ptB[3];
      }
      return ptA[secondarySortKeyIndex] - ptB[secondarySortKeyIndex];
    });
  }

  for (let groupPairIdx = 0; groupPairIdx < 4; groupPairIdx += 2) {
    let currentPointer = 0;
    const groupA = directionalPoints[groupPairIdx];
    const groupB = directionalPoints[groupPairIdx + 1]; // U vs R, D vs L
    const comparisonAxis = 3; // x+y
    const valueAxis = 1 - (groupPairIdx / 2); // 1 for U-R (y), 0 for D-L (x)

    if (!groupB.length) continue;

    for (let i = 0; i < groupA.length; i++) {
      const pointFromA = groupA[i];
      while (currentPointer < groupB.length && groupB[currentPointer][comparisonAxis] < pointFromA[comparisonAxis]) {
        currentPointer++;
      }
      while (currentPointer < groupB.length &&
        groupB[currentPointer][comparisonAxis] === pointFromA[comparisonAxis] &&
        pointFromA[valueAxis] > groupB[currentPointer][valueAxis]) {
        currentPointer++;
      }
      if (currentPointer === groupB.length) break;

      const pointFromB = groupB[currentPointer];
      if (pointFromA[comparisonAxis] === pointFromB[comparisonAxis]) {
        minDistance = Math.min(minDistance, (pointFromB[valueAxis] - pointFromA[valueAxis]) * 2);
      }
    }
  }

  // Third Calculation Block: Diagonal x-y alignment (comparing U-L and R-D)
  for (let groupIdx = 0; groupIdx < 4; groupIdx++) {
    directionalPoints[groupIdx].sort((ptA, ptB) => {
      if (ptA[2] !== ptB[2]) { // Sort by x-y
        return ptA[2] - ptB[2];
      }
      return ptA[0] - ptB[0]; // Then by x
    });
  }

  for (let groupPairIdx = 0; groupPairIdx < 2; groupPairIdx++) {
    let currentPointer = 0;
    const groupA = directionalPoints[groupPairIdx];
    const groupB = directionalPoints[3 - groupPairIdx]; // U vs L, R vs D
    const comparisonAxis = 2; // x-y
    const valueAxis = 0; // x

    if (!groupB.length) continue;

    for (let i = 0; i < groupA.length; i++) {
      const pointFromA = groupA[i];
      while (currentPointer < groupB.length && groupB[currentPointer][comparisonAxis] < pointFromA[comparisonAxis]) {
        currentPointer++;
      }
      while (currentPointer < groupB.length &&
        groupB[currentPointer][comparisonAxis] === pointFromA[comparisonAxis] &&
        pointFromA[valueAxis] > groupB[currentPointer][valueAxis]) {
        currentPointer++;
      }
      if (currentPointer === groupB.length) break;

      const pointFromB = groupB[currentPointer];
      if (pointFromA[comparisonAxis] === pointFromB[comparisonAxis]) {
        minDistance = Math.min(minDistance, (pointFromB[valueAxis] - pointFromA[valueAxis]) * 2);
      }
    }
  }

  return minDistance === maxPossibleDistance ? "SAFE" : minDistance * 5;
}
