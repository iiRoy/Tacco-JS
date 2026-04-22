"use strict";
function ExecuteCalculation(rawInputData) {
  rawInputData = rawInputData.split("\n");
  let quantityOfElements = parseInt(rawInputData[0], 10);
  let elementValues = [];
  // Populate the array with numerical values from the input
  for (let rowIndex = 0; rowIndex < quantityOfElements; rowIndex++) {
    elementValues.push(parseInt(rawInputData[rowIndex + 1], 10));
  }
  let cumulativeSum = elementValues.reduce(function(previousVal, currentVal) {
    return previousVal + currentVal;
  });
  // Initialize dynamic programming tables
  let memoTableOne = new Array(quantityOfElements + 1);
  let memoTableTwo = new Array(quantityOfElements + 1);
  for (let iteratorA = 0; iteratorA <= quantityOfElements; iteratorA++) {
    memoTableOne[iteratorA] = new Array(cumulativeSum + 1).fill(0);
    memoTableTwo[iteratorA] = new Array(cumulativeSum + 1).fill(0);
  }
  // Base cases for the DP tables
  memoTableOne[0][0] = 1;
  memoTableTwo[0][0] = 1;
  // Fill the DP tables using iterative approach
  for (let iteratorB = 0; iteratorB <= quantityOfElements; iteratorB++) {
    for (let currentSumValue = 0; currentSumValue <= cumulativeSum; currentSumValue++) {
      let remainingSum = currentSumValue - elementValues[iteratorB - 1];
      // Condition for including the current element
      if (iteratorB > 0 && remainingSum >= 0) {
        memoTableOne[iteratorB][currentSumValue] += memoTableOne[iteratorB - 1][remainingSum];
        memoTableTwo[iteratorB][currentSumValue] += memoTableTwo[iteratorB - 1][remainingSum];
      }
      // Condition for not including the current element
      if (iteratorB > 0) {
        memoTableOne[iteratorB][currentSumValue] += memoTableOne[iteratorB - 1][currentSumValue];
        // Special case for the second DP table
        memoTableTwo[iteratorB][currentSumValue] += 2 * memoTableTwo[iteratorB - 1][currentSumValue];
      }
    }
  }
  let overallCombinations = Math.pow(3, quantityOfElements);
  let subtotalOne = 0;
  let subtotalTwo = 0;
  // Calculate final sums based on DP tables
  for (let iteratorC = parseInt(cumulativeSum / 2, 10); iteratorC <= cumulativeSum; iteratorC++) {
    if (iteratorC >= cumulativeSum / 2) {
      subtotalOne += memoTableTwo[quantityOfElements][iteratorC];
    }
    if (iteratorC === cumulativeSum / 2) {
      subtotalTwo += memoTableOne[quantityOfElements][iteratorC];
    }
  }
  // Output the final computed value modulo a large prime
  console.log((overallCombinations - 3 * subtotalOne + 3 * subtotalTwo) % 998244353);
}
ExecuteCalculation(require("fs").readFileSync("/dev/stdin", "utf8"));