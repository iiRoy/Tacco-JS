'use strict';

// This function computes the sum of elements within a specified range
// using a pre-calculated array of cumulative sums.
function calculateRangeSum(startIndex, endIndex, cumulativeSums) {
  if (startIndex === 0) {
    // If the range starts from the beginning, just return the cumulative sum up to endIndex.
    return cumulativeSums[endIndex];
  }
  // Otherwise, subtract the cumulative sum up to (startIndex - 1)
  // from the cumulative sum up to endIndex.
  return cumulativeSums[endIndex] - cumulativeSums[startIndex - 1];
}

// This utility function generates an array of cumulative sums
// from a given input array.
function computeCumulativeSums(inputArray) {
  // Initialize a new array to store the cumulative sums.
  let cumulativeArray = new Array(inputArray.length);
  // The first element of the cumulative sum array is just the first element of the input array.
  cumulativeArray[0] = inputArray[0];

  // Iterate through the rest of the input array to build the cumulative sums.
  for (let idx = 1; idx < inputArray.length; idx++) {
    cumulativeArray[idx] = cumulativeArray[idx - 1] + inputArray[idx];
  }
  return cumulativeArray;
}

// The main function to solve the problem using dynamic programming.
function findOptimalPartition(arraySize, dataValues) {
  // Initialize a 2D DP table with dimensions arraySize x arraySize, filled with zeros.
  let memoTable = new Array(arraySize).fill(0).map(elementPlaceholder => new Array(arraySize).fill(0));
  // Pre-compute cumulative sums for efficient range sum calculations.
  let cumulativeData = computeCumulativeSums(dataValues);

  // Iterate through possible lengths of sub-problems (represented by 'currentColumn').
  // 'currentColumn' effectively represents the difference between column and row indices.
  let currentColumn = 1;
  while (currentColumn < arraySize) {
    let currentC = currentColumn; // 'c' represents the actual column index.
    // Iterate through possible starting row indices.
    for (let currentRow = 0; currentRow < arraySize; currentRow++) {
      // If the current column index exceeds the array bounds, break the inner loop.
      if (currentC === arraySize) {
        break;
      }

      // Initialize the current DP cell with a very large value.
      memoTable[currentRow][currentC] = Number.MAX_SAFE_INTEGER;

      // Iterate through all possible split points 'splitPoint' within the current range [currentRow, currentC].
      for (let splitPoint = currentRow; splitPoint < currentC; splitPoint++) {
        // Calculate the cost for the current split and update memoTable if it's smaller.
        // The cost is the sum of costs of two sub-problems plus the sum of elements in both parts.
        memoTable[currentRow][currentC] = Math.min(
          memoTable[currentRow][currentC],
          memoTable[currentRow][splitPoint] +
            memoTable[splitPoint + 1][currentC] +
            calculateRangeSum(currentRow, splitPoint, cumulativeData) +
            calculateRangeSum(splitPoint + 1, currentC, cumulativeData)
        );
      }
      currentC++; // Move to the next column for the current row.
    }
    currentColumn++; // Increase the sub-problem length.
  }
  // The final answer is stored in memoTable[0][arraySize-1], representing the whole array.
  return memoTable[0][arraySize - 1];
}

// Entry point function to handle input, call the solver, and output the result.
function processInputAndSolve(rawData) {
  // Split the input string into individual lines.
  let inputLines = rawData.split("\n");
  // Parse the first line to get the size of the array.
  let sizeOfArray = parseInt(inputLines[0]);
  // Parse the second line to get the array of numbers.
  let numericData = inputLines[1].split(' ').map(lineItem => parseInt(lineItem));

  // Call the main solver function.
  let finalResult = findOptimalPartition(sizeOfArray, numericData);
  // Print the computed result to the console.
  console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInputAndSolve(require('fs').readFileSync('/dev/stdin', 'utf8'));
