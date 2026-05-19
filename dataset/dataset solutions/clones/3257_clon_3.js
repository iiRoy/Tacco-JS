'use strict';

function ProcessInput(rawData) {
  const NEWLINE_SEPARATOR = '\n';
  const inputLines = rawData.split(NEWLINE_SEPARATOR);
  const totalFlowerCount = Number(inputLines[0]);

  const convertStringToNumbers = (str) => str.split(' ').map(Number);
  const flowerHeights = convertStringToNumbers(inputLines[1]);

  let currentBaselineHeight = 0;
  let accumulatedAddedHeight = 0;

  for (const individualHeight of flowerHeights) {
    if (individualHeight < currentBaselineHeight) {
      currentBaselineHeight = individualHeight;
      continue;
    }

    const heightDifference = individualHeight - currentBaselineHeight;
    accumulatedAddedHeight += heightDifference;
    currentBaselineHeight = individualHeight;
  }

  console.log(accumulatedAddedHeight);
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
