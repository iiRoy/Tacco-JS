/*
 * This JavaScript code implements a solution for a knapsack-like problem.
 * It reads input from standard input, processes multiple test cases,
 * and prints the optimal cost and corresponding weight for each case.
 *
 * The solution uses dynamic programming to solve the 0/1 knapsack problem.
 */


// --- Standard Input Initialization Block ---
// Dependencies: Node.js 'fs' module for file system operations.
var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size // Determine the size of the input stream.
  , buffer = new Buffer(length) // Allocate a buffer to hold the input.
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0) // Read input into the buffer synchronously.
  , input = buffer.toString('utf8', 0, bytesRead).split('\n') // Convert buffer to UTF-8 string and split by newline.
; // End of input variable declarations.

// Start the main execution flow of the program.
main();


/**
 * The main function orchestrates the processing of all test cases.
 * It reads problem parameters, runs the dynamic programming algorithm,
 * and outputs the results for each case.
 */
function main ( ) {

  var read = 0; // Global pointer to track the current line being read from the 'input' array.
  var resultCase = 1; // Counter for the current test case number, starting from 1.


  // The program continues to process test cases until a specific termination condition is met.
  while ( true ) {

    // Read the maximum allowed weight for the current knapsack instance.
    // The unary plus operator converts the string from input to a number.
    var maxWeight = +input[read++];

    // If 'maxWeight' is 0 or any other falsy value, it signifies the end of input.
    if ( !maxWeight ) {
      break; // Exit the infinite loop, as there are no more test cases.
    }


    // Read the total number of treasure items available for the current case.
    var treasures = +input[read++];

    // Initialize 'pdp' (previous dynamic programming array).
    // This array will store the maximum value that can be achieved for each weight up to 'maxWeight'.
    // Int32Array is used for performance, initialized with zeros.
    var pdp = new Int32Array(maxWeight + 1);


    // Iterate through each treasure item.
    // The loop runs 'treasures' times, with 'i' decrementing from 'treasures-1' down to 0.
    for ( var i = treasures; i--; ) {

      // Read the current treasure's details (value and weight) from the input line.
      // The line is split by a comma.
      var c = input[read++].split(",");
      var tv = +c[0]; // 'tv' (treasure value) is the first part, converted to a number.
      var tw = +c[1]; // 'tw' (treasure weight) is the second part, converted to a number.


      // Initialize 'dp' (current dynamic programming array) for this iteration.
      // This will store the results after considering the current treasure item.
      var dp = new Int32Array(maxWeight + 1);


      // Fill the 'dp' array for weights less than the current treasure's weight.
      // For these weights, the current treasure cannot be included, so values are copied from 'pdp'.
      for ( var w = 1; w < tw; w++ ) {
        dp[w] = pdp[w];
      }


      // Fill the 'dp' array for weights from 'tw' up to 'maxWeight'.
      // Here, we decide whether to include the current treasure or not.
      for ( var w = tw; w <= maxWeight; w++ ) {
        // The value for 'dp[w]' is the maximum of two options:
        // 1. Including the current treasure: value 'tv' plus the max value for 'w - tw' from 'pdp'.
        // 2. Excluding the current treasure: the max value for 'w' from 'pdp'.
        dp[w] = max(pdp[w - tw] + tv, pdp[w]);
      }

      // After processing the current treasure, the 'dp' array becomes the 'pdp' for the next iteration.
      pdp = dp;
    }


    // After all treasures have been processed, find the optimal result (max cost and corresponding weight).
    var resultWeight = 1001; // Initialize with a value greater than any possible 'maxWeight'.
    var resultCost = 0; // Initialize the maximum cost found so far to zero.


    // Iterate through the final 'pdp' array to find the highest cost and its associated weight.
    for ( var i = 0; i <= maxWeight; i++ ) {
      var pdpi = pdp[i]; // Get the cost for the current weight 'i'.
      if ( pdpi > resultCost ) {
        resultCost = pdpi; // Update 'resultCost' if a higher value is found.
        resultWeight = i; // Update 'resultWeight' to the weight corresponding to the new max cost.
      }
    }


    // Output the results for the current test case in the specified format.
    // 'resultCase++' increments the case counter for the next iteration.
    console.log("Case " + resultCase++ + ":\n" + resultCost + "\n" + resultWeight);
  } // End of the 'while(true)' loop.
} // End of the 'main' function.


/**
 * A utility function to find the maximum of two integer numbers.
 * This implementation uses a bitwise trick for potential performance benefits
 * over a simple 'Math.max()'.
 *
 * @param {number} a - The first number.
 * @param {number} b - The second number.
 * @returns {number} The greater of the two input numbers.
 */
function max ( a, b ) {
  var t = a - b; // Calculate the difference between 'a' and 'b'.
  // The expression '(t >> 31)' performs an arithmetic right shift.
  // If 't' is negative (a < b), 't >> 31' will be -1 (all bits set).
  // If 't' is non-negative (a >= b), 't >> 31' will be 0.
  // The '&' (bitwise AND) with 't' effectively returns 't' if 't' is negative, or 0 if 't' is non-negative.
  // So, 'a - (t & (t >> 31))' becomes:
  // - If a >= b: a - (0) = a
  // - If a < b:  a - (t) = a - (a - b) = b
  // This correctly returns the maximum of 'a' and 'b'.
  return a - ( t & ( t >> 31 ) );
}