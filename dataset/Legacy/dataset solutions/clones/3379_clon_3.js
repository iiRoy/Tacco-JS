"use strict";

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const [elementCount] = parseNumbersFromText(inputLines[0]);

  const allParsedNumbers = parseNumbersFromText(rawData);
  const numbersForProcessing = allParsedNumbers.slice(1, elementCount + 1);

  const sortedValues = [...numbersForProcessing].sort((valA, valB) => valA - valB);

  const calculatedDifferences = [];
  const iterationLimit = elementCount - 1;

  for (let idx = 0; idx < iterationLimit; idx++) {
    calculatedDifferences.push(sortedValues[idx + 1] - sortedValues[idx]);
  }

  const totalDifferenceSum = calculatedDifferences.reduce((currentAccumulator, currentDifference) => currentAccumulator + currentDifference, 0);

  const isSumEven = totalDifferenceSum % 2 === 0;

  console.log(isSumEven ? 'first' : 'second');
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromText(textLine) {
  return textLine.split(/\s+/).map((numString) => parseInt(numString, 10));
}
