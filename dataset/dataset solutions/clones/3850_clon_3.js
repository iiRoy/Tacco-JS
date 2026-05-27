'use strict';

function processInput(rawData) {
  const lineDelimiter = '\n';
  const inputLines = rawData.split(lineDelimiter);

  const numberSequenceString = inputLines[0];
  const operationCount = parseInt(inputLines[1], 10);

  function parseNumberArray(str) {
    const spaceDelimiter = ' ';
    return str.split(spaceDelimiter).map(s => parseInt(s, 10));
  }

  let numericValues = parseNumberArray(numberSequenceString);

  for (let currentIteration = 0; currentIteration < operationCount; currentIteration++) {
    numericValues = applyMaxDoublingTransformation(numericValues);
  }

  const finalSum = numericValues.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  console.log(finalSum);
}

function applyMaxDoublingTransformation(sourceArray) {
  const transformedArray = [...sourceArray];
  let highestValue = -Infinity;
  let highestValueIndex = -1;

  for (let idx = 0; idx < transformedArray.length; idx++) {
    const currentElement = transformedArray[idx];
    if (currentElement > highestValue) {
      highestValue = currentElement;
      highestValueIndex = idx;
    }
  }

  if (highestValueIndex !== -1) {
    transformedArray[highestValueIndex] = highestValue * 2;
  }

  return transformedArray;
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
