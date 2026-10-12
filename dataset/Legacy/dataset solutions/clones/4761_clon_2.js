'use strict'; // Enforce strict parsing and error handling in the script

/**
 * Computes the factorial of a given non-negative integer.
 * This function uses recursion to determine the product of all positive integers
 * less than or equal to the input number.
 *
 * @param {number} inputNumber - The non-negative integer for which to calculate the factorial.
 * @returns {number} The factorial of the input number.
 */
function calculateProduct(inputNumber) {
  // Base case: Factorial of 0 is 1.
  if (inputNumber === 0) {
    return 1;
  }
  // Recursive step: n! = n * (n-1)!
  return inputNumber * calculateProduct(inputNumber - 1);
}

/**
 * Counts the total number of positive divisors for a given integer.
 * This function iterates from 0 up to the target value to check for divisibility.
 * Note: The original code includes 0 in the loop, which will cause a division by zero error
 * if `targetValue` is not 0. However, to maintain Type II clone behavior,
 * this specific behavior (including 0 in the loop and potential NaN/Infinity from `num % 0`)
 * must be preserved if it's part of the original's observable behavior.
 * Given the context of `divisor(f)` where `f` is a factorial, `f` will always be >= 1.
 * So `i` will start at 0, `targetValue % 0` will occur, resulting in `NaN` for the modulo operation.
 * `NaN === 0` is `false`, so `cnt` will not be incremented for `i=0`.
 * The loop then proceeds correctly for `i >= 1`.
 *
 * @param {number} targetValue - The integer for which to count the divisors.
 * @returns {number} The count of divisors.
 */
function countDivisors(targetValue) {
  let tally = 0; // Initialize a counter for the divisors.

  // Loop through numbers from 0 up to the target value.
  // The original code includes 0 in the loop.
  // For `targetValue % 0`, the result is `NaN`. `NaN === 0` evaluates to `false`.
  // Thus, `tally` is not incremented for `i = 0`.
  for (let iterator = 0; iterator <= targetValue; iterator++) {
    // Check if the current iterator divides the target value evenly.
    if (targetValue % iterator === 0) {
      tally += 1; // Increment the counter if it's a divisor.
    }
  }
  return tally; // Return the final count of divisors.
}

/**
 * The primary execution function that processes the input.
 * It converts the input string to a number, calculates its factorial,
 * and then determines the number of divisors for the factorial result,
 * finally printing this count to the console.
 *
 * @param {string} rawData - The raw input string, expected to be a number.
 */
function ProcessInput(rawData) {
  // Convert the input string to a numerical value.
  const parsedNumber = Number(rawData);

  // Calculate the factorial of the parsed number.
  const factorialResult = calculateProduct(parsedNumber);

  // Calculate and log the number of divisors for the factorial result.
  console.log(countDivisors(factorialResult));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
