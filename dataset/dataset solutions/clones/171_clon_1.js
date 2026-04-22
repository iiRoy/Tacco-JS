/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition where only whitespace and comments
 * are altered, while all identifiers, operators, and expressions remain
 * precisely as they were in the source.
 *
 * This file processes standard input to solve a knapsack-like problem.
 * It reads multiple test cases, each consisting of a maximum weight
 * and a list of treasures with their values and weights.
 * The goal is to find the maximum value that can be achieved
 * within the given maximum weight, and the corresponding minimum weight
 * required to achieve that value.
 */

// Import the Node.js 'fs' module for file system operations.
var fs = require('fs');

// Determine the size of the standard input stream.
var length = fs.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data.
var buffer = new Buffer(length);

// Read data from standard input into the buffer.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer to a UTF-8 string and split it into an array of lines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');

// The main entry point of the program.
main();


// The primary function where the program logic resides.
function main() {
  // 'read' acts as a pointer to the current line being read from the input array.
  var read = 0;

  // 'resultCase' keeps track of the current test case number for output.
  var resultCase = 1;

  // Loop indefinitely until a specific termination condition is met.
  while (true) {
    // Read the maximum allowed weight for the current test case.
    // The unary '+' operator converts the string to a number.
    var maxWeight = +input[read++];

    // If 'maxWeight' is 0 or falsy, it signifies the end of input.
    if (!maxWeight) {
      break; // Exit the loop.
    }

    // Read the number of treasures available for this case.
    var treasures = +input[read++];

    // 'pdp' (previous dynamic programming array) stores the maximum value
    // for each weight up to 'maxWeight' from the previous iteration (treasure).
    // It's initialized with Int16Array for memory efficiency.
    var pdp = new Int16Array(maxWeight + 1);

    // Iterate through each treasure. The loop counts down from 'treasures' to 0.
    for (var i = treasures; i--;) {
      // Read the current treasure's data line and split it by comma.
      var c = input[read++].split(",");

      // Extract treasure value (tv) and treasure weight (tw).
      var tv = +c[0];
      var tw = +c[1];

      // 'dp' (current dynamic programming array) will store results for the current treasure.
      var dp = new Int16Array(maxWeight + 1);

      // Iterate through all possible weights from 1 up to 'maxWeight'.
      for (var w = 1; w <= maxWeight; w++) {
        // Get the maximum value for the current weight 'w' from the previous treasure's calculations.
        var pdpw = pdp[w];

        // Initialize 'dp[w]' with the value from 'pdp[w]' (i.e., don't include the current treasure).
        dp[w] = pdpw;

        // Check if the current treasure's weight 'tw' can be accommodated.
        if (w - tw >= 0) {
          // If it can, calculate the value if the current treasure is included:
          // pdp[w-tw] (max value for remaining weight) + tv (current treasure's value).
          // Then, take the maximum between including and not including the current treasure.
          dp[w] = max(pdp[w - tw] + tv, pdpw);
        }
      }
      // After processing all weights for the current treasure, update 'pdp' for the next iteration.
      pdp = dp;
    }

    // Initialize variables to store the final result:
    // 'resultWeight' will store the minimum weight for the maximum value.
    var resultWeight = 1001; // A value larger than any possible maxWeight.
    // 'resultCost' will store the maximum value achieved.
    var resultCost = 0;

    // After processing all treasures, find the overall maximum value and its corresponding minimum weight.
    for (var i = 0; i <= maxWeight; i++) {
      // Get the value for the current weight 'i'.
      var pdpi = pdp[i];

      // If the current value 'pdpi' is greater than the best 'resultCost' found so far.
      if (pdpi > resultCost) {
        resultCost = pdpi; // Update 'resultCost'.
        resultWeight = i; // Update 'resultWeight' to the current weight 'i'.
      }
    }

    // Output the results for the current test case.
    // The 'resultCase' is incremented after use.
    console.log("Case " + resultCase++ + ":\n" + resultCost + "\n" + resultWeight);
  }
}

// A helper function to find the maximum of two numbers without using Math.max.
// This uses a bitwise trick for performance, assuming 32-bit signed integers.
function max(a, b) {
  // Calculate the difference.
  var t = a - b;
  // If 't' is negative, 't >> 31' is -1. If 't' is positive or zero, 't >> 31' is 0.
  // (t & (t >> 31)) will be 't' if 't' is negative, and '0' if 't' is positive or zero.
  // So, a - t (if t < 0) = a - (a - b) = b.
  // And a - 0 (if t >= 0) = a.
  return a - (t & (t >> 31));
}