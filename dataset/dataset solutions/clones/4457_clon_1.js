/*
 * This JavaScript file processes input to find a specific pattern.
 * It reads lines from standard input, performs calculations,
 * and then outputs a result to standard output.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 * Version: 1.0.0
 *
 * This is a Type I clone, meaning only whitespace and comments have been altered.
 * The core logic and structure remain absolutely identical to the original.
 */


// Ensure standard input is ready to be processed.
process.stdin.resume();

// Set the encoding for standard input to UTF-8.
process.stdin.setEncoding('utf8');



// Initialize an array to store input lines.
var lines = [];

// Create a readline interface to handle input and output streams.
var reader = require('readline').createInterface(
  {
    input: process.stdin,   // Use standard input as the input source.
    output: process.stdout  // Use standard output for any potential output (though not directly used by reader here).
  }
);


// Event listener for each line of input received.
reader.on(
  'line',
  (line) => {
    // Push the received line into the 'lines' array.
    lines.push(line);
  }
);


// Event listener for when the input stream closes.
reader.on(
  'close',
  () => {
    // Parse the first line of input as a number, which represents 'n'.
    var n = Number(lines[0]);

    // Initialize an array to store calculated information.
    var info = [];

    // Loop from 1 up to 'n' (inclusive).
    for (
      i = 1;
      i <= n;
      i++
    ) {
      // Initialize 'num' with the current loop counter 'i'.
      var num = i;

      // Initialize a counter for how many times 'num' can be divided by 2.
      var count = 0;

      // While 'num' is an even number...
      while (
        num % 2 == 0
      ) {
        // Increment the count.
        count++;

        // Divide 'num' by 2.
        num = num / 2;
      }
      // After the while loop, 'count' holds the exponent of 2 in the prime factorization of 'i'.

      // Add the calculated 'count' to the 'info' array.
      info.push(count);
    } // End of for loop.


    // Find the maximum value within the 'info' array.
    var max = Math.max(...info);

    // Find the index of the first occurrence of the maximum value in the 'info' array.
    var index = info.indexOf(max);


    // Output the result: the index of the maximum value plus one (since indices are 0-based).
    console.log(index + 1);
  }
);
// End of 'close' event handler.