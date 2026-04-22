// This file contains a JavaScript program to process numerical input.
// It calculates a specific value based on the first number provided.

'use strict' ; // Enforce strict mode for cleaner code and error prevention.

const   main  =  (  input  )  =>    {
    // Split the input string by newlines to get an array of lines.
    // Then, for each line, split it by spaces to get an array of arguments.
    const   args   =   input . split ( '\n' ) . map (   arg   =>   arg . split ( ' ' )   ) ;


    // Parse the first element of the first argument array into an integer.
    // The '10' specifies the radix (base 10) for parsing.
    const   n   =   parseInt (   args [ 0 ] [ 0 ] ,   10   ) ;


    // Calculate the result: n multiplied by (n modulo 2 plus 1).
    // This effectively multiplies n by 1 if n is even, and by 2 if n is odd.
    console . log (   n   *   (   n   %   2   +   1   )   ) ;
} ; // End of the main function definition.


// Read the entire content of the standard input asynchronously and
// then pass it to the main function for processing.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ;

// End of program execution.