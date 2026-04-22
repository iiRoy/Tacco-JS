/*
 * This JavaScript program processes tabular numerical data.
 * It reads input from standard input, calculates row sums and column sums,
 * and then prints the data in a formatted manner.
 * The input consists of multiple data blocks, each preceded by a number 'n'
 * indicating the number of rows in that block. A '0' indicates termination.
 */

// Require the 'fs' (file system) module to read input.
var input = require('fs').readFileSync('/dev/stdin', 'utf8');


// --- Input Parsing Section ---
// Trim leading/trailing whitespace from the input and split it into an array of lines.
var Arr = (input.trim()).split("\n");


// --- Main Data Processing Loop ---
// This loop continues indefinitely until a specific break condition is met.
while (true) {

  // Extract the first element from 'Arr', which should be the number of rows 'n' for the current block.
  // The '-0' forces the string to be converted into a number.
  var n = Arr.shift() - 0;

  // Check for the termination condition: if 'n' is 0, the program should stop processing.
  if (n == 0) {
    break; // Exit the 'while' loop.
  }

  // Initialize an array 'S' to store the cumulative sum for each column.
  // This array will also include an extra element for the sum of row sums (total sum).
  var S = [];

  // Populate the 'S' array with zeros. Its size will be 'n + 1' (for 'n' data columns + 1 sum column).
  for (var i = 0; i <= n; i++) {
    S[i] = 0; // Initialize each column sum to zero.
  }

  // --- Row Processing Loop ---
  // Iterate 'n' times, once for each row in the current data block.
  for (var i = 0; i < n; i++) {

    // Take the next line from 'Arr', split it by spaces, and convert each part to a number.
    var arr = (Arr.shift()).split(" ").map(Number);

    // Calculate the sum of all numbers in the current row using the 'reduce' method.
    var s = arr.reduce(function (a, b) {
      return a + b; // Accumulate the sum.
    });

    // Append the calculated row sum 's' to the end of the current row array 'arr'.
    arr.push(s);

    // Update the overall column sums stored in 'S' by adding the corresponding values from 'arr'.
    arr.forEach(function (v, i) {
      S[i] += v; // Add current value 'v' to the i-th column sum.
    });


    // --- Row Output Formatting ---
    // Format each number in the current row to be right-aligned within a 5-character width.
    // This is achieved by padding with spaces and then taking the last 5 characters.
    arr.forEach(function (v, i) {
      arr[i] = ("    " + v).slice(-5); // Pad with 4 spaces, then take last 5 chars.
    });

    // Print the formatted row, joining its elements without any separator.
    console.log(arr.join(""));

  } // End of the 'for' loop for processing individual rows.


  // --- Final Column Sums Formatting and Output ---
  // After all rows are processed, format the final column sums stored in 'S'.
  // Apply the same 5-character right-aligned padding as for individual row elements.
  S.forEach(function (v, i) {
    S[i] = ("    " + v).slice(-5); // Format each total column sum.
  });

  // Print the formatted total column sums line.
  console.log(S.join(""));

}
// End of the main 'while' loop.
// The program terminates when 'n' is 0.