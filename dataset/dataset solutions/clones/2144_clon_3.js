"use strict";
function processInput(rawData) {
  let parsedValues = rawData[0].trim().split(" ");
  let totalElements = parseInt(parsedValues[0]);
  let excludedIndexA = parseInt(parsedValues[1]);
  let excludedIndexB = parseInt(parsedValues[2]);

  let combinationResults = [];
  let cumulativeSumOfCombinations = 0;

  // Initialize the current combination value.
  // nC0 is 1, which serves as the base for calculating nC1.
  let currentCombinationTerm = 1;

  // Iterate from 1 up to totalElements to calculate nC1, nC2, ..., nCn
  for (let iterationCount = 1; iterationCount <= totalElements; iterationCount++) {
    // Calculate nC_iterationCount using the formula:
    // nCr = nC(r-1) * (n - r + 1) / r
    // Here, n is totalElements, r is iterationCount.
    currentCombinationTerm = (currentCombinationTerm * (totalElements - iterationCount + 1)) / iterationCount;

    // Store the calculated combination (nC_iterationCount)
    // The array is 0-indexed, so nC1 is at index 0, nC2 at index 1, etc.
    combinationResults[iterationCount - 1] = currentCombinationTerm;

    // Add the current combination to the running total
    cumulativeSumOfCombinations += currentCombinationTerm;
  }

  // Subtract the combinations at the specified excluded indices
  // Note: excludedIndexA and excludedIndexB are 1-based, so adjust for 0-based array access.
  cumulativeSumOfCombinations -= combinationResults[excludedIndexA - 1];
  cumulativeSumOfCombinations -= combinationResults[excludedIndexB - 1];

  // Define the modulo constant for clarity
  const MODULO_VALUE = Math.pow(10, 9) + 7;

  // Output the final sum modulo the specified constant
  console.log(cumulativeSumOfCombinations % MODULO_VALUE);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
