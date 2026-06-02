'use strict';

function ProcessInput(inputData) {
  const lines = inputData.trim().split(/\r?\n/g);

  const firstLineTokens = lines[0].split(' ');
  const arraySize = Number(firstLineTokens[0]);
  const iterationsCount = Number(firstLineTokens[1]);

  let currentValues = lines[1].split(' ').map(numericString => Number(numericString));

  let upperBoundIndex = 0;
  let lowerBoundIndex = 0;

  const createZeroFilledArray = (size) => {
    return new Array(size).fill(0);
  };

  let temporaryCounts = createZeroFilledArray(arraySize);

  for (let iterationStep = 0; iterationStep < iterationsCount; iterationStep++) {
    temporaryCounts = createZeroFilledArray(arraySize);

    for (let elementPosition = 0; elementPosition < arraySize; elementPosition++) {
      const sumOfPositionAndValue = elementPosition + currentValues[elementPosition];
      const differenceOfPositionAndValue = elementPosition - currentValues[elementPosition];

      upperBoundIndex = (sumOfPositionAndValue > arraySize) ? arraySize - 1 : sumOfPositionAndValue;
      lowerBoundIndex = (differenceOfPositionAndValue < 1) ? 0 : differenceOfPositionAndValue;

      for (let targetPosition = lowerBoundIndex; targetPosition <= upperBoundIndex; targetPosition++) {
        temporaryCounts[targetPosition] += 1;
      }
    }
    currentValues = [...temporaryCounts];
  }

  console.log(temporaryCounts.join(' '));
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
