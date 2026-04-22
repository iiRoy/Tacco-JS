/*
 * This is a Type I clone of a JavaScript program.
 * Original creation date: 2013-10-04.
 * Purpose: Process input data from stdin to calculate a score.
 */

// Core Node.js file system module for I/O operations.
var fs = require('fs');

// Determine the size of the standard input stream.
var length = fs.fstatSync( process.stdin.fd ).size;

// Allocate a buffer to hold the incoming data.
var buffer = new Buffer( length );

// Read data synchronously from standard input into the buffer.
// Parameters: file descriptor, buffer, offset, length, position.
var bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 );

// Convert the buffer content to a UTF-8 string and split it into lines.
var input = buffer.toString( 'utf8' , 0 , bytesRead ).split( '\n' );


// Declare variables that will be used globally or within the main loop scope.
var temp; // Temporary array for parsed input line.
var n;    // Number of items.
var m;    // Index of the specific item.
var p;    // Percentage value.
var arr;  // Array to store input numbers.


/**
 * Calculates a 'score' based on an array of numbers and specific parameters.
 *
 * @param   {number}   n  - Total count of items (not directly used in calculation, but part of signature).
 * @param   {number}   m  - Index of the item in 'xl' array to be used as a divisor.
 * @param   {number}   p  - Percentage value to adjust the sum.
 * @param   {number[]} xl - Array of numbers to be summed and processed.
 * @returns {number}      - The calculated score, or 0 if xl[m] is zero.
 */
function solve ( n , m , p , xl )
{
  // If the divisor element is zero, return 0 to prevent division by zero.
  if ( xl[ m ] === 0 )
  {
    return 0;
  }

  // Calculate the sum of all elements in the 'xl' array using reduce.
  var sum = xl.reduce( function ( p , c )
                       {
                         return p + c; // Accumulate the sum.
                       }
                     );

  // Apply the percentage adjustment to the sum.
  sum *= ( 100 - p );

  // Perform integer division and return the result.
  // The '~~' operator is a fast way to truncate to an integer (floor for positive, ceil for negative).
  return ~~ ( sum / xl[ m ] );
}


// Main processing loop: continues as long as the first input line is not '0 0 0'.
while ( input[ 0 ] !== '0 0 0' )
{
  // Shift the first line from the input array and split it by space.
  temp = input.shift().split( ' ' );

  // Initialize an empty array for storing numbers.
  arr = [];

  // Parse the numerical values from the 'temp' array.
  // The '- 0' converts string to number.
  n = temp[ 0 ] - 0; // First element is 'n'.
  m = temp[ 1 ] - 1; // Second element is 'm', adjusted by -1 for zero-based indexing.
  p = temp[ 2 ] - 0; // Third element is 'p'.

  // Loop 'n' times to read 'n' numbers into the 'arr' array.
  for ( var i = 0 ; i < n ; i++ )
  {
    arr[ i ] = input.shift() - 0; // Read a line, convert to number, and store.
  }

  // Call the solve function with the parsed parameters and print the result to console.
  console.log( solve( n , m , p , arr ) );
}