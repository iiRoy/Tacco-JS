/*
 * This JavaScript file processes numerical input to solve a specific algorithmic problem.
 * It reads data from standard input, performs calculations, and outputs a single numerical result.
 * The implementation adheres to strict mode for better code quality and error prevention.
 */
"use strict"; // Enforces stricter parsing and error handling in the code.


const main = arg => { // Defines the primary function 'main' which takes a single argument 'arg'.

  // Step 1: Preprocess the input string.
  // First, remove leading/trailing whitespace, then split the string into an array of lines.
  arg = arg . trim() . split("\n");

  // Step 2: Parse problem-specific parameters N and K from the first line of input.
  // The first line is expected to contain two space-separated integers.
  const N = parseInt(arg[0] . split(" ")[0]); // N is the first integer.
  const K = parseInt(arg[0] . split(" ")[1]); // K is the second integer.


  let answer = 0; // Initialize a variable to accumulate the final calculated answer.


  // Step 3: Iterate from 1 to N (inclusive) to calculate probabilities for each case.
  for (let i = 1; i <= N; i++) {
    let temp; // Declare a temporary variable to store intermediate calculation results, specifically for the exponent 'j'.

    // Conditional logic: Check if the current value 'i' is already greater than or equal to K.
    if (i >= K) {
      // If 'i' is already >= K, the probability for this specific 'i' is simply 1/N.
      answer += (1 / N); // Add this probability directly to the total answer.
    } else {
      // If 'i' is less than K, we need to find how many times 'i' must be doubled
      // (multiplied by 2) until it exceeds K.
      // This inner loop finds the smallest integer 'j' such that 'i * (2^j)' is greater than 'K'.
      for (let j = 1; j < 100000; j++) { // Loop with an upper bound for 'j' to prevent infinite loops in edge cases.
        if (i * Math.pow(2, j) > K) {
          temp = j; // Store the found value of 'j' in 'temp'.
          break;    // Exit the inner loop as soon as the condition is met.
        }
      }

      // Once 'j' (stored in 'temp') is found, calculate the probability for this 'i'.
      // The probability is (1/N) * (1/2)^j, where (1/2)^j represents the chance of 'j' successful doublings.
      answer += (1 / N) * Math.pow((1 / 2), temp); // Add this calculated probability to the running total.
    }
  }


  // Step 4: Output the final computed answer to the standard output.
  console.log(answer); // Displays the result.
}; // End of the main function.


// Step 5: Read input from the standard input stream and execute the main function.
// This line uses Node.js's 'fs' module to read the entire content of '/dev/stdin' as a UTF-8 string.
main(require('fs').readFileSync('/dev/stdin', 'utf8')); // Call 'main' with the input data.