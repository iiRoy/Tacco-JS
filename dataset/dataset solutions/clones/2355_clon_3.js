'use strict';

function parseNumbersFromString(numberStringContent) {
  return numberStringContent.split(' ').map(strValue => Number(strValue));
}

function processInput(rawInputString) {
  const moduloConstant = 1000000007;

  const trimmedContent = rawInputString.trim();
  const inputLinesArray = trimmedContent.split('\n');

  const firstLineValue = inputLinesArray.shift();
  const arrayLength = Number(firstLineValue);

  const numbersDataLine = inputLinesArray[0];
  const dataElementsArray = parseNumbersFromString(numbersDataLine);

  let accumulatedSum = 0;

  for (let outerLoopIndex = 0; outerLoopIndex < arrayLength; outerLoopIndex++) {
    const elementA = dataElementsArray[outerLoopIndex];

    for (let innerLoopIndex = outerLoopIndex + 1; innerLoopIndex < arrayLength; innerLoopIndex++) {
      const elementB = dataElementsArray[innerLoopIndex];

      const xorResult = elementA ^ elementB;
      const termToAdd = xorResult % moduloConstant;

      accumulatedSum += termToAdd;
    }
  }
  console.log(accumulatedSum);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
