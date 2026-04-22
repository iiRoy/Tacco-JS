// This script reads input from stdin, processes it, and prints results.
// It appears to perform calculations related to quaternion multiplication
// based on numerical input provided line by line.

var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' );

// The input string is first trimmed of any leading/trailing whitespace,
// then split into an array of strings based on newline characters.
var Arr = ( input.trim() ).split( "\n" );


// The first element of the array 'Arr' is treated as the number of test cases (N).
// 'shift()' removes this element from 'Arr' and returns it.
// The '- 0' operation explicitly converts the string to a number.
var N = Arr.shift() - 0;


/*
 * This loop iterates N times, processing one test case in each iteration.
 * Each test case involves reading a line of numbers and performing calculations.
 */
for ( var I = 0; I < N; I++ ) {

  // A specific condition to terminate processing: if the current line is '0'.
  // This acts as an early exit mechanism for the loop.
  if ( Arr[ I ] == 0 ) break;


  // The current line (Arr[I]) is split by spaces, and each part is converted to a Number.
  // This results in an array 'A' containing numerical values for the current test case.
  var A = Arr[ I ].split( " " ).map( Number );


  // The first four numbers from array 'A' are assigned to variables
  // x1, y1, z1, w1, likely representing components of a quaternion.
  var x1 = A[ 0 ];
  var y1 = A[ 1 ];
  var z1 = A[ 2 ];
  var w1 = A[ 3 ];


  // The next four numbers from array 'A' are assigned to variables
  // x2, y2, z2, w2, representing components of a second quaternion.
  var x2 = A[ 4 ];
  var y2 = A[ 5 ];
  var z2 = A[ 6 ];
  var w2 = A[ 7 ];


  // --- Start of Quaternion Product Calculation ---
  // Initial terms for the result quaternion (a, i, j, k) based on x1.
  var a = x1 * x2;
  var i = x1 * y2;
  var j = x1 * z2;
  var k = x1 * w2;


  // Adjust 'a', 'i', 'j', 'k' based on the y1 component.
  i += y1 * x2;
  a -= y1 * y2;
  k += y1 * z2;
  j -= y1 * w2;


  // Adjust 'a', 'i', 'j', 'k' based on the z1 component.
  j += z1 * x2;
  k -= z1 * y2;
  a -= z1 * z2;
  i += z1 * w2;


  // Adjust 'a', 'i', 'j', 'k' based on the w1 component.
  k += w1 * x2;
  j += w1 * y2;
  i -= w1 * z2;
  a -= w1 * w2;

  // --- End of Quaternion Product Calculation ---


  // The final calculated components (a, i, j, k) are printed to the console,
  // concatenated with spaces in between.
  console.log( a + " " + i + " " + j + " " + k );

} // End of the main loop for processing all test cases.