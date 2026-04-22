/*
 * This is a Type I clone of the original JavaScript code.
 * It maintains identical functionality and structure,
 * while extensively varying whitespace and comments.
 */

"use strict"
;  // Enforces strict parsing and error handling in the script.

const Main =
  ( input ) =>
  {

    // Process the input string: trim whitespace and split by newlines.
    let xs = input . trim ( ) . split ( '\n' ) ;

    /*
     * Defines a comparison function for sorting.
     * This function is used by Array.prototype.sort().
     * It performs a numeric ascending sort.
     */
    const compare = ( a, b ) => {
      return a - b;
    };


    // Sort the array 'xs' using the custom 'compare' function.
    xs . sort ( compare ) ;

    // Conditional logic based on the first two elements of the sorted array.
    if ( xs [ 0 ] == 1 && xs [ 1 ] == 2 ) {
      // If elements are 1 and 2, log 3.
      console . log ( 3 ) ;
    }

    else if ( xs [ 0 ] == 2 && xs [ 1 ] == 3 ) {
      // If elements are 2 and 3, log 1.
      console . log ( 1 ) ;
    }

    else {
      // For any other combination, log 2.
      console . log ( 2 ) ;
    }

  } ; // End of Main function definition.


// Execute the Main function with input read from standard input.
Main (
  require ( 'fs' ) . readFileSync (
    '/dev/stdin' , // Path to read standard input.
    'utf8'         // Encoding for the input file.
  )
) ;