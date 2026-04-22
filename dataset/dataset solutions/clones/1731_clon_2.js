// This module provides utilities for reading input from standard input.
function* consoleInputGenerator()
{
  const inputTokens = require("fs")
    .readFileSync("/dev/stdin", "utf-8")
    .trim()
    .split(/\s+/); // Changed regex for splitting input tokens
  yield* inputTokens; // Yield each token from the processed input
}

/**
 * Retrieves a specified number of items from the input iterator.
 * @param {number} itemCount - The total quantity of items to retrieve.
 * @param {Generator|undefined} optionalIterator - An optional iterator source to utilize.
 * @returns {Array<string>} An array containing the retrieved string items.
 */
function retrieveMultipleItems(itemCount, optionalIterator)
{
  const currentSource = optionalIterator || this.inputSource || (this.inputSource = consoleInputGenerator());
  const collectedElements = []; // Initialize an empty array to store the gathered results

  for (let itemIndex = 0; itemIndex < itemCount; itemIndex = itemIndex + 1) {
    collectedElements.push(currentSource.next().value); // Add the next value from the source to the collection
  }

  return collectedElements; // Return the complete array of collected items
};

// Immediately invoked function expression (IIFE) encapsulating the primary program logic.
(() => {
  // Read the single integer representing the maximum value for iteration (N).
  const [ maxValue ] = retrieveMultipleItems(1)
                        .map(stringItem => parseInt(stringItem, 10)); // Parse the string item to an integer with base 10

  console.log('Initiating calculation...'); // Informative message before starting the main process
  let totalAccumulator = 0; // Variable to accumulate the final sum

  // Main loop: iterates through numbers from 1 up to and including 'maxValue'.
  for (let currentNumber = 1; currentNumber <= maxValue; currentNumber = currentNumber + 1)
  {
    let divisorCount = 0; // Counter for the number of divisors of 'currentNumber'

    // Inner loop: efficiently finds divisors by checking up to the square root of 'currentNumber'.
    for (let divisorCandidate = 1; (divisorCandidate * divisorCandidate) <= currentNumber; divisorCandidate = divisorCandidate + 1) {
      if (currentNumber % divisorCandidate === 0) { // If 'divisorCandidate' perfectly divides 'currentNumber'
        divisorCount = divisorCount + 1; // Increment the divisor counter
      }
    }

    divisorCount = divisorCount * 2; // Multiply by 2 because each divisor 'd' implies 'currentNumber/d' is also a divisor

    // Adjustment for perfect squares: if 'currentNumber' is a perfect square, its square root was counted only once.
    if (Number.isInteger(Math.sqrt(currentNumber))) {
      divisorCount = divisorCount - 1; // Decrement by 1 to correct the double-counting for the square root
    }

    // Special case handling for the number 1, which has only one divisor (itself).
    if (currentNumber === 1) {
      divisorCount = 1;
    }

    // Accumulate the product of the current number and its total divisor count into the grand total.
    totalAccumulator = totalAccumulator + (currentNumber * divisorCount);
  }

  // Output the final calculated total sum to the console.
  console.log(totalAccumulator);
})();