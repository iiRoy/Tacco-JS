/*
 * This is a JavaScript file for geometric calculations.
 * It calculates the perimeter, area, and height of a triangle.
 * The input is expected to be three space-separated numbers:
 * side 'a', side 'b', and angle 'C' in degrees.
 */
'use strict'; // Enforce strict mode for cleaner code.


// The main execution block of the program.
Main( ( input ) => {
  // Parse input string into numeric values for sides a, b, and angle C (in radians).
  const   [ a ,   b ,   radC ]   =
    input  .  split ( ' ' )
    .  map (  n  =>  parseInt ( n ,   10 )  ) ;


  // Convert angle C from degrees to radians.
  const   C   =   radC   *   Math . PI   /   180 ; // PI / 180 converts degrees to radians.


  // Calculate the perimeter (L) of the triangle using the Law of Cosines.
  // L = a + b + c, where c = sqrt(a^2 + b^2 - 2ab*cos(C))
  const   L   =   a   +   b   +
    Math . sqrt ( a   *   a   +   b   *   b   -   2   *   a   *   b   *   Math . cos ( C ) ) ;

  // Calculate the area (S) of the triangle using the formula: S = 0.5 * a * b * sin(C).
  const   S   =   0.5   *   a   *   b   *   Math . sin ( C ) ;


  // Calculate the height (h) relative to side 'a', using the formula: h = b * sin(C).
  const   h   =   b   *   Math . sin ( C ) ;

  // Output the calculated area, perimeter, and height to the console.
  console . log ( S ,   L ,   h ) ;
} ) ;


/**
 * @function Main
 * @description This function sets up the input stream listener
 *              and passes the collected input to the provided main callback.
 * @param {function(string): void} main - The callback function to execute with the collected input.
 * @returns {void}
 */
function   Main   (   main   )   {
  let   input   =   '' ; // Initialize an empty string to accumulate input data.
  const   sin   =   process . stdin ; // Get the standard input stream.

  sin . resume ( ) ; // Resume the stdin stream to start receiving data.
  sin . setEncoding ( 'utf8' ) ; // Set the encoding for the input stream to UTF-8.

  // Event listener for incoming data chunks.
  sin . on ( 'data' ,   chunk   =>   input   +=   chunk ) ;

  // Event listener for the end of the input stream.
  // Once all data is received, call the main processing function.
  sin . on ( 'end' ,   ( )   =>   main ( input ) ) ;
}