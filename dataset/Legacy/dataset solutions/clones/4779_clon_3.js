'use strict'

function parseInputLine(rawInputString) {
  const firstLineContent = rawInputString.split('\n')[0];
  return firstLineContent.split(' ').map(valueString => Number(valueString));
}

function isValueWithinBounds(valueToCheck, lowerBound, upperBound) {
  return valueToCheck >= lowerBound && valueToCheck <= upperBound;
}

function processInputAndCountCombinations(inputDataString) {
  const parsedNumericValues = parseInputLine(inputDataString);
  
  const maxAllowedTermValue = parsedNumericValues[0];
  const desiredTotalSum = parsedNumericValues[1];
  
  let totalValidCombinations = 0;

  for (let termA = 0; termA <= maxAllowedTermValue; termA++) {
    for (let termB = 0; termB <= maxAllowedTermValue; termB++) {
      const currentSumOfTwoTerms = termA + termB;
      const requiredTermC = desiredTotalSum - currentSumOfTwoTerms;

      // The condition (termA + termB + requiredTermC) === desiredTotalSum is always true
      // by definition of requiredTermC.
      // We only need to check if requiredTermC falls within the allowed range [0, maxAllowedTermValue].
      if (isValueWithinBounds(requiredTermC, 0, maxAllowedTermValue)) {
        totalValidCombinations++;
      }
    }
  }

  console.log(totalValidCombinations);
}

processInputAndCountCombinations(require("fs").readFileSync("/dev/stdin", "utf8"));
