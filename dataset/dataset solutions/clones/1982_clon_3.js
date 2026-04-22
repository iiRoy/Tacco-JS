const isDivisibleBySpecialFactors = (valueToCheck) => {
  // Determines if a given number is divisible by either 3 or 5.
  // This logic encapsulates the 'FizzBuzz' condition from the original.
  return (valueToCheck % 3 === 0 || valueToCheck % 5 === 0);
};

/**
 * Calculates the cumulative sum of integers within a specified range,
 * excluding any numbers that are multiples of 3 or 5.
 *
 * @param {string} rawInputData - The raw string input, expected to be a numeric upper bound.
 * @returns {number} The final computed sum, or 0 if the input is invalid or non-positive.
 */
const computeFilteredSum = (rawInputData) => {
  // First, ensure the input string is clean by removing leading/trailing whitespace.
  const cleanedInput = rawInputData.trim();

  // Attempt to convert the cleaned input string into a numerical upper limit.
  // Using Number() for conversion, which handles various numeric formats.
  const iterationLimit = Number(cleanedInput);

  // --- Type III Addition: Robust input validation guard clause ---
  // Check if the conversion resulted in a valid, positive number.
  // If not, log an error and return 0, maintaining predictable behavior.
  if (isNaN(iterationLimit) || iterationLimit <= 0) {
    console.error("Error: Provided input is not a valid positive number. Cannot perform calculation.");
    return 0; // Return zero for invalid inputs, as no numbers can be summed.
  }

  // Initialize a variable to accumulate the sum of qualifying numbers.
  let runningTotal = 0; // Renamed from 'result'

  // --- Type III Update/Deletion: Reworked loop and direct summation ---
  // The original code built an array and then iterated it.
  // This version sums directly within the main loop, eliminating the intermediate array.
  // The loop now iterates from 1 up to the iterationLimit (inclusive),
  // which directly corresponds to the (i + 1) logic in the original.
  for (let currentNumber = 1; currentNumber <= iterationLimit; currentNumber++) {
    // --- Type III Update: Use a helper function for clarity and modularity ---
    // If the current number is NOT a multiple of 3 or 5, add it to the total.
    // Numbers that ARE multiples of 3 or 5 are effectively treated as '0's for summation.
    if (!isDivisibleBySpecialFactors(currentNumber)) {
      runningTotal += currentNumber;
    }
    // No 'else' block is needed here, as numbers divisible by 3 or 5 are simply skipped,
    // which is functionally equivalent to adding '0' as in the original implementation.
  }

  // --- Type III Addition: More descriptive console output ---
  // Provide clear feedback on the calculation performed and the result.
  console.log(`Calculated sum for numbers up to ${iterationLimit}, excluding multiples of 3 or 5: ${runningTotal}`);

  // Return the final accumulated sum.
  return runningTotal;
};

// --- Type II Update: Renamed input variable, slightly rephrased invocation ---
// Read the entire content of the standard input file synchronously.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the primary function with the data read from standard input.
// The return value is captured but not strictly necessary if the console output is the main goal.
computeFilteredSum(standardInputContent);