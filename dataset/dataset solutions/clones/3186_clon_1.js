'use strict' /* This directive enforces strict mode for the entire script. */

// This function processes the input to find the common elements.
 function   main ( input )  {

  // The input string is first split by newlines, and the first line is discarded.
  input = input.split ( "\n" ) . slice ( 1 ) ;

  /*
   * Each remaining line is processed:
   * - It's split by spaces.
   * - The first element of the split line is discarded.
   * - The remaining elements are parsed as integers (base 10).
   * This creates an array of arrays of numbers.
   */
  const data = input . map ( v => v.split ( " " ) . slice ( 1 ) . map ( v => parseInt ( v , 10 ) ) ) ;

  // Initialize 'ret' with the first array of numbers from 'data'.
  let ret = data [ 0 ] ;

  // Loop through the rest of the arrays in 'data', starting from the second one.
  for ( let i = 1 ; i < data . length ; i ++ )

    // For each subsequent array, filter 'ret' to keep only elements that are also present in the current array.
    ret = ret . filter ( v => data [ i ] . indexOf ( v ) != -1 ) ; // Check if 'v' exists in the current 'data[i]' array.

  // The final result is the count of elements remaining in 'ret'.
  return ret . length ;

} // End of main function definition.


/*
 * Standard Node.js practice:
 * Import the file system module.
 */
const fs = require ( "fs" ) ;

// Read the content from standard input, then pass it to the main function.
const msg = main ( fs . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// Print the final result to the console.
console . log ( msg ) ; // This outputs the calculated message.