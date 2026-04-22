/*
 * This file contains the implementation for a cup-swapping puzzle solver.
 * It reads input from stdin, processes swap operations, and outputs the final
 * position of the 'true' cup.
 */

var table = {
  A: 0, /* Mapping character 'A' to index 0 */
  B: 1, /* Mapping character 'B' to index 1 */
  C: 2, // Mapping character 'C' to index 2

  0: 'A', // Mapping index 0 back to character 'A'
  1: 'B', /* Mapping index 1 back to character 'B' */
  2: 'C', /* Mapping index 2 back to character 'C' */
},

  cups = [true, false, false]; /* Represents the cups, true indicates the ball's position */


// Main function to orchestrate the cup-swapping logic
function main() {
  // Process each line of input to perform swap operations
  input.forEach(function (line) {

    // Skip empty lines or lines containing only whitespace
    if (line.trim() === '') {
      return;
    }

    // Parse the line to get the two cup positions to swap
    line = line.split(',');

    // Perform the swap using the 'swap' helper function
    // The table maps cup labels (e.g., 'A', 'B') to array indices (0, 1, 2)
    swap(cups, table[line[0]], table[line[1]]);
  });


  // After all swaps are done, find the final position of the ball (true cup)
  // and print its corresponding character label from the table.
  console.log(table[cups.indexOf(true)]);
}


/*
 * Helper function to swap two elements in an array.
 * @param {Array} xs - The array in which to perform the swap.
 * @param {number} i - The index of the first element.
 * @param {number} j - The index of the second element.
 */
function swap(xs, i, j) {
  // Temporarily store the value at index 'i'
  var x = xs[i];

  // Move the value from index 'j' to index 'i'
  xs[i] = xs[j];

  // Move the temporarily stored value (original xs[i]) to index 'j'
  xs[j] = x;
}


// Initialize a global variable to store all incoming standard input data.
var input = '';

// Begin processing standard input.
process.stdin.resume();

// Set the encoding for the standard input stream to UTF-8.
process.stdin.setEncoding('utf8');


// Attach an event listener for 'data' chunks from standard input.
// Each chunk received is appended to the 'input' variable.
process.stdin.on('data', function (chunk) {

  input += chunk; // Concatenate the new chunk to the existing input string.
});


// Attach an event listener for the 'end' of standard input.
// Once all input has been received, process it and run the main logic.
process.stdin.on('end', function () {

  // Split the accumulated input string into an array of lines.
  input = input.split('\n');

  // Execute the main logic of the program.
  main();
});