/*
 * This is a JavaScript program demonstrating array processing.
 * It's structured as an Immediately Invoked Function Expression (IIFE).
 * The primary function reads a sequence of numbers and prints details
 * about each number as if it were a node in a binary tree (heap-like structure).
 */
( function main ( )
{
  // Read input from standard input, process it.
  // The input is expected to be multiple lines.
  const lines = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) . trim ( ) . split ( '\n' ) ;

  /*
   * The first line of input is expected to be a number, 'n'.
   * This value 'n' is consumed but not directly used in the output logic here.
   * It typically represents the count of elements in the subsequent line.
   */
  const n = Number ( lines . shift ( ) ) ;

  // Process the remaining line(s) as an array of numbers.
  // This line is assumed to contain space-separated integer values.
  lines . shift ( ) // Get the next line (which should contain space-separated numbers)
        . split ( ' ' ) // Split the string into an array of strings by space delimiter
        . map ( Number ) // Convert each string element to a numerical value
        . forEach ( function ( key , i , a ) // Iterate over the resulting array of numbers, treating 'a' as the full array
        {
          // Log details for each node, including its key, parent key, left child key, and right child key.
          // The indices for parent and children are calculated based on a 0-indexed complete binary tree (heap).
          // Conditional checks ensure that parent/child keys are only displayed if they exist within the array bounds.
          console . log (
            `node ${ i }: key = ${ a[i] }, `
            + ( i // Check if it's not the root node (index 0)
                ? `parent key = ${ a[ Math . floor ( ( i - 1 ) / 2 ) ] }, `
                : '' // No parent key for the root node
              )
            + ( 2 * i + 1 < a . length // Check if a left child exists
                ? `left key = ${ a[ 2 * i + 1 ] }, `
                : '' // No left child
              )
            + ( 2 * i + 2 < a . length // Check if a right child exists
                ? `right key = ${ a[ 2 * i + 2 ] }, `
                : '' // No right child
              )
          ) ; // End of console.log call for the current node
        } ) ; // End of forEach iteration over the array of numbers

} ) ( ) ; // End of the Immediately Invoked Function Expression