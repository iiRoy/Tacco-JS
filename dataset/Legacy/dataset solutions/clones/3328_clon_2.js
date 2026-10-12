'use strict';

// This immediately invoked function expression (IIFE) encapsulates the entire program logic.
(function(rawInputData) {
  // First, process the raw input string.
  // It's trimmed, split by any whitespace, and then each part is converted to a number.
  rawInputData = rawInputData.trim().split(/\s+/).map(currentVal => currentVal - 0);

  // The very first number in the processed input represents the total number of items.
  const totalCount = rawInputData.shift();

  // Initialize an array to store the counts of items of type 1, 2, and 3.
  // The first element 'zero' is a placeholder as item types start from 1.
  const itemCategoryCounts = ['zero', 0, 0, 0];

  // Iterate through the remaining numbers in the input array.
  // For each number, increment the corresponding count in the itemCategoryCounts array.
  rawInputData.forEach(function(currentVal) {
    itemCategoryCounts[currentVal]++;
  });

  // Declare and initialize a 3D array, which will serve as our dynamic programming table.
  // The dimensions are set to accommodate indices from -1 up to totalCount + 1,
  // hence totalCount + 2 for each dimension to avoid out-of-bounds errors.
  const dynamicProgressionTable = new Array(totalCount + 2);

  // Populate the 3D array structure.
  // The outer loops create the nested arrays.
  for (let rowIdx = -1; rowIdx < totalCount + 2; rowIdx++) {
    dynamicProgressionTable[rowIdx] = new Array(totalCount + 2 - rowIdx);
    for (let colIdx = -1; colIdx < totalCount + 2 - rowIdx; colIdx++) {
      // Fill the innermost arrays with zeros initially.
      dynamicProgressionTable[rowIdx][colIdx] = new Array(totalCount + 2 - rowIdx - colIdx).fill(0);
      // A specific edge case handling for index -1, setting its value to 0.
      dynamicProgressionTable[rowIdx][colIdx][-1] = 0;
    }
  }

  // Begin the core dynamic programming calculation.
  // This set of nested loops computes the expected number of operations.
  for (let currentNum = 1; currentNum <= totalCount; currentNum++) {
    // Calculate the base case for when only items of type 1 are present.
    dynamicProgressionTable[currentNum][0][0] = dynamicProgressionTable[currentNum - 1][0][0] + (totalCount / currentNum);

    // Iterate for the count of items of type 2.
    for (let countOfTwo = 1; countOfTwo <= currentNum; countOfTwo++) {
      // Calculate the DP state considering items of type 1 and 2.
      dynamicProgressionTable[currentNum - countOfTwo][countOfTwo][0] =
        totalCount / currentNum +
        dynamicProgressionTable[currentNum - countOfTwo + 1][countOfTwo - 1][0] * (countOfTwo / currentNum) +
        dynamicProgressionTable[currentNum - countOfTwo - 1][countOfTwo][0] * ((currentNum - countOfTwo) / currentNum);

      // Iterate for the count of items of type 3.
      for (let countOfThree = 1; countOfThree <= countOfTwo; countOfThree++) {
        // Calculate the full DP state considering items of type 1, 2, and 3.
        dynamicProgressionTable[currentNum - countOfTwo][countOfTwo - countOfThree][countOfThree] =
          totalCount / currentNum +
          dynamicProgressionTable[currentNum - countOfTwo][countOfTwo - countOfThree + 1][countOfThree - 1] * (countOfThree / currentNum) +
          dynamicProgressionTable[currentNum - countOfTwo + 1][countOfTwo - 1 - countOfThree][countOfThree] * ((countOfTwo - countOfThree) / currentNum) +
          dynamicProgressionTable[currentNum - countOfTwo - 1][countOfTwo - countOfThree][countOfThree] * ((currentNum - countOfTwo) / currentNum);
      }
    }
  }

  // Finally, print the result from the DP table corresponding to the initial counts of items.
  console.log(dynamicProgressionTable[itemCategoryCounts[1]][itemCategoryCounts[2]][itemCategoryCounts[3]]);

// The input is read synchronously from standard input using Node.js 'fs' module.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
