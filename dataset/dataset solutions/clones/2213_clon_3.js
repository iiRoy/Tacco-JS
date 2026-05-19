'use strict';

function getNumericMinimum(valueA, valueB) {
  const numericA = Number(valueA);
  const numericB = Number(valueB);
  return Math.min(numericA, numericB);
}

function processInputData(rawInputContent) {
  const cleanedInput = rawInputContent.trim();
  const numberStringArray = cleanedInput.split(' ');

  const firstStringValue = numberStringArray[0];
  const secondStringValue = numberStringArray[1];

  const effectiveMinimumValue = getNumericMinimum(firstStringValue, secondStringValue);

  // This variable intentionally replicates the original code's behavior
  // where 'maximum' was also calculated as the minimum.
  const loopIterationBase = getNumericMinimum(firstStringValue, secondStringValue);

  const totalIterationsCount = loopIterationBase + 1;

  let finalOutputString = '';
  let currentIterationIndex = 0;

  while (currentIterationIndex < totalIterationsCount) {
    finalOutputString += String(effectiveMinimumValue);
    currentIterationIndex++;
  }

  console.log(finalOutputString);
}

const fileSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");
processInputData(fileSystemInput);
