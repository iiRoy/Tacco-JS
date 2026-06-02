'use strict'; // Enforce strict mode for cleaner code

// Define a constant for the modulo operation, often used in dynamic programming problems
const moduloValue = 1000000007; // Original: 1e9 + 7

/**
 * Solves the problem using dynamic programming.
 * This function calculates the number of ways to achieve a target sum 'targetSum'
 * using elements from 'inputArray', considering constraints.
 *
 * @param {number} numElements - The number of elements in the input array.
 * @param {number} targetSum - The target sum to achieve.
 * @param {number[]} inputArray - The array of numbers to use.
 * @returns {number} The count of ways to achieve the target sum, modulo moduloValue.
 */
function calculateResult(numElements, targetSum, inputArray) {
  // Base case: If the target sum is 0, there's always one way (by choosing no elements).
  if (targetSum === 0) {
    return 1;
  }

  // Initialize a 1D array for current DP states.
  // dynamicProgArr[s] will store the number of ways to get sum 's' using elements processed so far.
  let dynamicProgArr = new Array(targetSum + 1).fill(0);

  // Initialize a 2D array for prefix sums.
  // prefixSumsMatrix[i][s] will store the sum of dynamicProgArr[0]...dynamicProgArr[s]
  // after processing the i-th element. This helps in efficient range sum queries.
  let prefixSumsMatrix = new Array(numElements).fill(0).map(_ => new Array(targetSum + 1).fill(0));

  // Iterate through each element of the input array
  for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
    // Iterate through all possible sums up to the target sum
    for (let currentPossibleSum = 0; currentPossibleSum <= targetSum; currentPossibleSum++) {
      // If this is the first element (index 0)
      if (elementIndex === 0) {
        // The number of ways to get 'currentPossibleSum' is 1 if 'currentPossibleSum'
        // is less than or equal to the first element's value, otherwise 0.
        dynamicProgArr[currentPossibleSum] = (currentPossibleSum <= inputArray[elementIndex]) ? 1 : 0;
        // Calculate prefix sum for the current row
        prefixSumsMatrix[elementIndex][currentPossibleSum] = currentPossibleSum > 0
          ? ((prefixSumsMatrix[elementIndex][currentPossibleSum - 1] + dynamicProgArr[currentPossibleSum]) % moduloValue)
          : dynamicProgArr[currentPossibleSum];
      } else {
        // For subsequent elements, calculate dp[currentPossibleSum] using prefix sums from the previous row.
        // The formula represents the sum of dp[currentPossibleSum - x] for x from 0 to inputArray[elementIndex],
        // which is equivalent to prefixSumsMatrix[elementIndex-1][currentPossibleSum] - prefixSumsMatrix[elementIndex-1][currentPossibleSum - inputArray[elementIndex] - 1].
        let lowerBoundSum = currentPossibleSum - inputArray[elementIndex] - 1;
        let waysCount = prefixSumsMatrix[elementIndex - 1][currentPossibleSum];

        if (lowerBoundSum >= 0) {
          waysCount = (waysCount - prefixSumsMatrix[elementIndex - 1][lowerBoundSum] + moduloValue) % moduloValue;
        }
        dynamicProgArr[currentPossibleSum] = waysCount;

        // Update prefix sum for the current row and current sum
        prefixSumsMatrix[elementIndex][currentPossibleSum] = currentPossibleSum > 0
          ? ((prefixSumsMatrix[elementIndex][currentPossibleSum - 1] + dynamicProgArr[currentPossibleSum]) % moduloValue)
          : dynamicProgArr[currentPossibleSum];
      }
    }
  }
  // The final answer is the number of ways to achieve the 'targetSum' after processing all elements.
  return dynamicProgArr[targetSum];
}

/**
 * Main function to read input, parse it, call the solver, and print the result.
 * @param {string} rawData - The raw input string from stdin.
 */
function processInput(rawData) {
  // Split the input string into individual lines
  const inputLines = rawData.split("\n");

  // Parse the first line to get N (number of elements) and K (target sum)
  const parametersArray = inputLines[0].split(' ').map(str => parseInt(str, 10));
  const numElementsCount = parametersArray[0];
  const targetSumValue = parametersArray[1];

  // Parse the second line to get the array A of element values
  const elementValues = inputLines[1].split(' ').map(str => parseInt(str, 10));

  // Call the dynamic programming solver
  const finalAnswer = calculateResult(numElementsCount, targetSumValue, elementValues);

  // Output the computed result to the console
  console.log(finalAnswer);
}

// Read input from standard input and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
