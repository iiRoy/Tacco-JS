"use strict";

/*
 * This function computes the factorial of a given positive integer.
 * It uses recursion to multiply the number by all positive integers below it.
 */
function calculateProduct(inputNumber) {
  // Base case: factorial of 1 is 1
  if (inputNumber === 1) {
    return inputNumber;
  } else {
    // Recursive step: n! = n * (n-1)!
    return inputNumber * calculateProduct(inputNumber - 1);
  }
}

// The primary execution block for processing the input data.
const processInput = rawData => {
  // Clean up the input string: remove leading/trailing whitespace and split by newlines.
  rawData = rawData.trim().split("\n");

  // Parse the first line of input to extract two integer values.
  const targetSum = parseInt(rawData[0].split(" ")[0], 10); // The first number, X
  const targetValue = parseInt(rawData[0].split(" ")[1], 10); // The second number, Y

  // Determine the maximum possible count of '2's that can be used to form targetSum.
  // This is based on the idea that 2 * countOfTwos <= targetSum.
  const countOfTwos = Math.floor(targetSum / 2);

  // Initialize an array to store valid combinations' results.
  const resultCollection = [];

  // Iterate downwards from the maximum possible count of '2's.
  for (let currentTwoCount = countOfTwos; currentTwoCount >= 0; currentTwoCount--) {
    // Calculate the required count of '1's for the current '2's count to reach targetSum.
    // targetSum = (2 * currentTwoCount) + (1 * countOfOnes)
    const countOfOnes = targetSum - (2 * currentTwoCount);

    // Check if this combination of '1's and '2's can also form targetValue.
    // targetValue = (1 * currentTwoCount) + (2 * countOfOnes)
    if (currentTwoCount + (2 * countOfOnes) === targetValue) {
      // If both conditions are met, this is a valid combination.
      // Calculate the first factorial term.
      const intermediateResultA = calculateProduct((2 * currentTwoCount) + countOfOnes);
      // Calculate the second factorial term (sum of two factorials).
      const intermediateResultB = calculateProduct((2 * currentTwoCount)) + calculateProduct(countOfOnes);

      // Store the ratio of the two factorial terms.
      resultCollection.push(intermediateResultA / intermediateResultB);
    }
  }

  // If no valid combinations were found, output 0.
  if (resultCollection.length === 0) {
    console.log(0);
    return;
  }

  // Sum all the results in the collection and apply a modulo operation.
  const finalSum = resultCollection.reduce((accumulator, currentValue) => accumulator + currentValue);
  console.log(finalSum % 10e9);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
