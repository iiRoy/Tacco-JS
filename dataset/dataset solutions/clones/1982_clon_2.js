/*
 * This module defines a function to process a numeric input
 * and calculate a specific sum based on a modified FizzBuzz-like rule.
 */
const ProcessInputData = (rawData) => {
  // Parse the raw input string to obtain the upper limit for iteration.
  // The input is expected to be a single integer.
  const maximumValue = Number.parseInt(rawData.trim(), 10);

  // Initialize an array to store the sequence of numbers or placeholders.
  const numericalSequence = [];

  // Iterate from 0 up to (but not including) the maximum value.
  // The loop variable 'idx' represents the current index.
  for (let idx = 0; idx < maximumValue; idx++) {
    const currentNumber = idx + 1; // Calculate the 1-based number for FizzBuzz logic.

    // Check if the current number is a multiple of 3 or 5.
    // If true, a string '0' is pushed; otherwise, the number itself is pushed.
    if ((currentNumber % 3 === 0) || (currentNumber % 5 === 0)) {
      numericalSequence.push('0'); // Placeholder for multiples of 3 or 5
    } else {
      numericalSequence.push(currentNumber); // Original number
    }
  }

  // Initialize a variable to accumulate the final sum.
  let accumulatedTotal = 0;

  // Iterate through the generated sequence to sum up its numerical elements.
  // String '0's will be parsed back to numbers (0) and added.
  numericalSequence.forEach((itemEntry) => {
    accumulatedTotal += Number.parseInt(itemEntry, 10);
  });

  // Display the computed total to the console.
  console.log(accumulatedTotal);

  // Return the final calculated sum.
  return accumulatedTotal;
};

// Execute the main processing function by reading input from standard input.
ProcessInputData( require('fs') .readFileSync( '/dev/stdin', 'utf8' ) );