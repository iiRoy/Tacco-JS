/*
 * This file contains JavaScript code to process numerical input
 * and determine if three given numbers can form a right-angled triangle.
 *
 * Input is read from standard input.
 */

// --- Standard input processing setup ---
// Requires the built-in 'fs' (file system) module for I/O operations.
var fs = require('fs')
  , length = fs.fstatSync(process.stdin.fd).size // Get the total size of data from stdin
  , buffer = new Buffer(length) // Allocate a buffer to hold the incoming data
  , bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0) // Read the data into the buffer
  , input = buffer.toString('utf8', 0, bytesRead).split('\n') // Convert buffer to UTF-8 string, then split into lines
  ; // End of variable declarations for input handling

// Call the main execution function of the program.
main();


// --- Core Program Logic ---
// This is the primary function where the problem's solution is implemented.
function main ( )
{

  // Loop through each test case.
  // The first line of input (input[0]) is assumed to contain the count of test cases.
  // We start from line 1, as line 0 is the count itself.
  for ( var line = 1, maxLines = input[0] - 0; line <= maxLines; line++ )
  {

    // For each line, parse the numbers, sort them, and assign to descriptive variables.
    var inputArray = input[line].split(" ").sort( function ( a, b ) {
      // The sort function needs a custom comparator for numeric sorting.
      return a - b;
    } );

    // Extract the sorted sides.
    // After sorting, inputArray[0] is the shortest, inputArray[1] is the middle, and inputArray[2] is the longest.
    var longest  = inputArray[2];
    var middle   = inputArray[1];
    var shortest = inputArray[0];

    // Apply the Pythagorean theorem check: a^2 + b^2 = c^2
    // If the square of the longest side equals the sum of the squares of the other two sides,
    // then it's a right-angled triangle.
    console.log( ( longest * longest == middle * middle + shortest * shortest ) ? 'YES' : 'NO' );
  }

} // End of main function