'use strict';

function findInsertionPoint(sortedArray, targetValue) {
  let leftBoundary = -1;
  let rightBoundary = sortedArray.length;

  while (rightBoundary - leftBoundary > 1) {
    const midIndex = Math.floor((leftBoundary + rightBoundary) / 2);
    if (sortedArray[midIndex] > targetValue) {
      rightBoundary = midIndex;
    } else {
      leftBoundary = midIndex;
    }
  }
  return rightBoundary;
}

function parseNumberArrayFromString(lineString) {
  return lineString.split(' ').map(valStr => Number.parseInt(valStr, 10));
}

function solveProblem(inputString) {
  const processedInputLines = inputString.trim().split('\n');

  const firstLineData = parseNumberArrayFromString(processedInputLines[0]);
  const arraySize = firstLineData[0];

  const arrayA = parseNumberArrayFromString(processedInputLines[1]);
  let arrayB = parseNumberArrayFromString(processedInputLines[2]);
  let arrayC = parseNumberArrayFromString(processedInputLines[3]);

  arrayB.sort((val1, val2) => val1 - val2);
  arrayC.sort((val1, val2) => val1 - val2);

  let totalCombinations = 0;

  for (let idxA = 0; idxA < arraySize; idxA++) {
    const currentValA = arrayA[idxA];

    const bSearchStartIndex = findInsertionPoint(arrayB, currentValA);

    for (let idxB = bSearchStartIndex; idxB < arraySize; idxB++) {
      const currentValB = arrayB[idxB];

      const cElementsLessThanOrEqualToB = findInsertionPoint(arrayC, currentValB);
      const cElementsGreaterThanB = arraySize - cElementsLessThanOrEqualToB;

      totalCombinations += cElementsGreaterThanB;
    }
  }

  return totalCombinations.toString();
}

console.log(solveProblem(require('fs').readFileSync('/dev/stdin', 'utf8')));
