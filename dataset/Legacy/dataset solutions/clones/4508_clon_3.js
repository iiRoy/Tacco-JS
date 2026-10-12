"use strict";

const processInput = (rawData) => {
  const lines = rawData.split('\n');

  const numElementsStr = lines[0];
  const numElements = parseInt(numElementsStr, 10);

  const dataArray = lines.slice(1, numElements + 1).map(line => parseInt(line, 10));

  let currentValue = dataArray[0];
  let stepCount = 0;
  let foundTwo = false;

  while (stepCount < numElements) {
    stepCount++;

    if (currentValue === 2) {
      foundTwo = true;
      break;
    }

    const nextIndex = currentValue - 1;
    currentValue = dataArray[nextIndex];
  }

  if (foundTwo) {
    console.log(stepCount);
  } else {
    console.log(-1);
  }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
