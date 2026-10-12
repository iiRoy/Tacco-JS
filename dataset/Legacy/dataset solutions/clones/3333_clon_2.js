'use strict';

(function(rawData) {
  // The initial input string is processed.
  // It's trimmed, split by whitespace, and each part is converted to a number.
  let processedData = rawData.trim().split(/\s+/).map(val => Number(val));

  // The first number in the processed array represents the total count of elements.
  const countElements = processedData.shift();

  // The remaining numbers form the primary array for calculations.
  const dataValues = processedData;

  // A special boundary value is set at an out-of-bounds index.
  dataValues[-1] = 0;

  // A 2D array (dynamic programming table) is initialized.
  // memoTable[length][startIdx] will store a computed value for a sub-sequence
  // of 'length' items beginning at 'startIdx'.
  const memoTable = new Array(countElements + 1)
    .fill(0)
    .map((_, idx) => new Array(countElements + 1 - idx).fill(0));

  // The final solution will be located at memoTable[countElements][0].

  // Outer loop iterates through possible sub-sequence lengths, from 1 up to the total count.
  for (let len = 1; len <= countElements; len++) {
    // Inner loop iterates through all possible starting indices for the current sub-sequence length.
    for (let startIndex = 0; startIndex <= countElements - len; startIndex++) {
      // The value for the current sub-sequence is determined by taking the maximum of two options:
      // 1. Taking the last element of the current sub-sequence (dataValues[len + startIndex - 1])
      //    and subtracting the opponent's optimal score from the remaining sub-sequence (memoTable[len - 1][startIndex]).
      // 2. Taking the first element of the current sub-sequence (dataValues[startIndex])
      //    and subtracting the opponent's optimal score from a specific remaining sub-sequence (memoTable[len - 1][startIndex]).
      memoTable[len][startIndex] = Math.max(
        dataValues[len + startIndex - 1] - memoTable[len - 1][startIndex],
        dataValues[startIndex] - memoTable[len - 1][startIndex]
      );
    }
  }

  // The ultimate answer is extracted from the DP table.
  const finalResult = memoTable[countElements][0];

  // The computed result is printed to the standard output.
  console.log(finalResult);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
