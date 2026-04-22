"use strict"; // Enforce strict mode for cleaner code and better error handling.

/*
 * This JavaScript file contains a solution for a mathematical problem.
 * The main goal is to find integer solutions (h, n, w) for a given N,
 * where N is read from the input.
 * The specific equation being solved implicitly is related to finding
 * three integers h, n, w that satisfy a certain condition
 * derived from the calculation of 'w'.
 */

// Define the main entry point function for the program.
// It accepts a single argument, typically the raw input string.
const main = arg => {

  // Step 1: Prepare the input.
  // Remove any leading or trailing whitespace from the input string,
  // then split it into an array of strings based on newline characters.
  arg = arg.trim().split("\n");

  // Step 2: Parse the problem's primary numerical input.
  // The first line of the input (index 0 of the 'arg' array)
  // is parsed as an integer and stored in the constant 'N'.
  const N = parseInt(arg[0]);


  // Step 3: Implement a nested loop to iterate through possible values for 'h' and 'n'.
  // The problem constraints typically define the range for these variables.
  // In this case, both 'h' and 'n' iterate from 1 up to 3500.

  // Outer loop for 'h'.
  for (let h = 1; h <= 3500; h++) {

    // Inner loop for 'n'.
    // This loop runs for each iteration of the 'h' loop.
    for (let n = 1; n <= 3500; n++) {

      // Step 4: Calculate the value of 'w' based on the current 'h', 'n', and 'N'.
      // This formula is derived from the problem's mathematical requirements.
      // It's crucial that the denominator does not evaluate to zero,
      // though the problem constraints usually prevent this in valid solutions.
      let w = (N * h * n) / (4 * h * n - N * n - N * h);

      // Step 5: Check if 'w' is an integer.
      // An integer will have a remainder of 0 when divided by 1.
      // This is a common way in JavaScript to check if a number is a whole number.
      if (w % 1 === 0) {
        // Step 6: If 'w' is an integer, a valid triplet (h, n, w) has been found.
        // Print the triplet to the console, separated by spaces.
        console.log(h + " " + n + " " + w);

        // Step 7: Terminate the program execution after finding the first solution.
        // The 'return' statement exits the 'main' function immediately.
        // This implies the problem asks for any valid solution, not all solutions.
        return;
      }
    } // End of the inner loop (for 'n').
  }   // End of the outer loop (for 'h').

};    // End of the main function definition.

// This is the standard competitive programming boilerplate for reading input.
// It reads the entire content of '/dev/stdin' (standard input),
// decodes it as UTF-8, and then passes the resulting string to the 'main' function.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));