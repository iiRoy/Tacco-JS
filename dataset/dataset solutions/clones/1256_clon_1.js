/*
 * This JavaScript file contains an Immediately Invoked Function Expression (IIFE).
 * It's designed to read data from standard input, process it,
 * and then output calculated statistics.
 */
( function ( ) {


  'use strict' ; /* Enforce strict parsing and error handling in the script. */


  // Declare a variable to hold the Node.js 'fs' (file system) module.
  var   fs   =   require ( 'fs' ) ;

  // Read the entire content of '/dev/stdin' synchronously.
  // The input is expected to be UTF-8 encoded.
  var   contents   =   fs . readFileSync ( '/dev/stdin' ,   'utf-8' ) ;


  /*
   * This function, 'minMaxSum', takes a string 'contents' as input.
   * It parses numbers from this string to find their minimum, maximum, and sum.
   */
  var minMaxSum = function ( contents ) {

    // First, trim any leading/trailing whitespace from the input string.
    // Then, split the string into an array of lines based on the newline character.
    var   lines   =   contents . trim ( ) . split ( "\n" ) ;


    // Parse the first line to get an integer value 'n'.
    // Note: 'n' is declared but not used in the subsequent logic of this specific problem.
    var   n   =   parseInt ( lines [ 0 ] . trim ( ) ) ;


    // Process the second line of the input.
    // Trim whitespace and split it by spaces to get an array of string representations of numbers.
    var   chars   =   lines [ 1 ] . trim ( ) . split ( " " ) ;


    // Initialize variables for tracking minimum, maximum, and sum.
    // 'min' is set to a very large number initially.
    var   min   =   1000000 ;

    // 'max' is set to a very small number initially.
    var   max   =   -1000000 ;

    // 'sum' is initialized to zero.
    var   sum   =   0 ;


    // Iterate through each element in the 'chars' array.
    for   ( var   i   =   0   ;   i   <   chars . length   ;   i++   )   {

      // Convert the current string element to an integer.
      var   a   =   parseInt ( chars [ i ] ) ;


      // Check if the current number 'a' is greater than the current maximum.
      if   (   a   >   max   )   {
        max   =   a ; // If true, update 'max'.
      }


      // Check if the current number 'a' is less than the current minimum.
      if   (   a   <   min   )   {
        min   =   a ; // If true, update 'min'.
      }

      // Add the current number 'a' to the running total 'sum'.
      sum   +=   a ;

    } // End of the loop.


    // Output the calculated minimum, maximum, and sum to the console,
    // separated by single spaces.
    console . log ( min   +   " "   +   max   +   " "   +   sum ) ;

  } ; // End of the 'minMaxSum' function definition.


  // Call the 'minMaxSum' function, passing the 'contents' read from stdin.
  minMaxSum ( contents ) ;


} ) ( ) ; // End of the IIFE.