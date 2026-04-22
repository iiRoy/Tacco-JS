'use strict';

const ingestNumericalData = (sourceString) => {
  let initialValue = 0;
  let secondaryValue = 0;
  let currentNumericSegment = 0;
  let processingFirst = true;

  for (let characterPosition = 0; characterPosition < sourceString.length; characterPosition++) {
    const characterUnit = sourceString[characterPosition];
    if (characterUnit >= '0' && characterUnit <= '9') {
      currentNumericSegment = currentNumericSegment * 10 + (characterUnit.charCodeAt(0) - '0'.charCodeAt(0));
    } else if (characterUnit === ' ' || characterUnit === '\n' || characterUnit === '\r') {
      if (processingFirst) {
        initialValue = currentNumericSegment;
        processingFirst = false;
      } else {
        secondaryValue = currentNumericSegment;
      }
      currentNumericSegment = 0;
    }
  }
  if (processingFirst) {
      initialValue = currentNumericSegment;
  } else {
      secondaryValue = currentNumericSegment;
  }
  return [initialValue, secondaryValue];
};

const createNumericalSeries = (upperBound) => {
  let sequenceCollection = [];
  let counter = 0;
  while (counter <= upperBound) {
    sequenceCollection.push(counter);
    counter++;
  }
  return sequenceCollection;
};

const determineCombinations = (maximumLimit, requiredTotal) => {
  let finalCount = 0;
  const firstComponentElements = createNumericalSeries(maximumLimit);

  for (const componentA of firstComponentElements) {
    const componentBLowerBound = Math.max(0, requiredTotal - componentA - maximumLimit);
    const componentBUpperBound = Math.min(maximumLimit, requiredTotal - componentA);

    if (componentBUpperBound >= componentBLowerBound) {
      finalCount += (componentBUpperBound - componentBLowerBound + 1);
    }
  }
  return finalCount;
};

const initiateProcess = (rawData) => {
  const processedInputs = ingestNumericalData(rawData);
  const boundaryValue = processedInputs[0];
  const targetValue = processedInputs[1];

  const ultimateResult = determineCombinations(boundaryValue, targetValue);
  console.log(ultimateResult);
};

initiateProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));