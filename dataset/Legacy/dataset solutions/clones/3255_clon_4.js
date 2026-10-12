'use strict';

const transformValue = (numericInput) => {
  if (!(numericInput & 1)) {
    return numericInput >> 1;
  } else {
    return (numericInput << 1) + numericInput + 1;
  }
};

const traverseSequence = (currentValue, visitedElements, iterationCount) => {
  if (visitedElements.has(currentValue)) {
    return iterationCount;
  }
  visitedElements.add(currentValue);
  const nextCalculatedValue = transformValue(currentValue);
  return traverseSequence(nextCalculatedValue, visitedElements, iterationCount + 1);
};

const processNumericChain = (rawInputString) => {
  const startingPoint = +rawInputString;
  const historySet = new Set();
  historySet.add(startingPoint);

  const firstStepResult = transformValue(startingPoint);
  return traverseSequence(firstStepResult, historySet, 2);
};

function ApplicationEntry(dataSource) {
  console.log(processNumericChain(dataSource));
}

ApplicationEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
