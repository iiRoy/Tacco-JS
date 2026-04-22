// This line enables strict mode for the entire script, enforcing stricter parsing and error handling.
'use strict'
;


/*
 * This is the primary function responsible for processing the input data.
 * It expects a single string 'input' as its argument, which typically
 * contains multiple lines of space-separated numerical values.
 */
const   main    =    ( input )   =>
{
    // The input string is first split into individual lines, and then each line
    // is further split into space-separated string arguments.
    // This results in a 2D array where each inner array represents a line of input.
    const   args    =   input . split ( '\n' ) . map (   arg   =>   arg . split ( ' ' )   ) ;

    // The following lines parse specific numerical values from the 'args' array.
    // parseInt is used with a radix of 10 to ensure decimal interpretation.

    // h1 represents the height value from the first line of input.
    const   h1      =   parseInt (   args [ 0 ] [ 0 ]   ,   10   ) ;
    // w1 represents the width value from the first line of input.
    const   w1      =   parseInt (   args [ 0 ] [ 1 ]   ,   10   ) ;

    // h2 represents the height value from the second line of input.
    const   h2      =   parseInt (   args [ 1 ] [ 0 ]   ,   10   ) ;
    // w2 represents the width value from the second line of input.
    const   w2      =   parseInt (   args [ 1 ] [ 1 ]   ,   10   ) ;


    // Finally, the calculated result based on a specific formula is printed to the console.
    // The formula is: (h1 * w1) - (w1 * h2 + (h1 - h2) * w2)
    console . log (   ( h1 * w1 )   -   ( w1 * h2   +   ( h1 - h2 ) * w2 )   ) ;
}

// This section of code handles the execution of the 'main' function.
// It reads the entire content of '/dev/stdin' (standard input) as a UTF-8 string
// using Node.js's built-in 'fs' (file system) module, and then passes this
// content to the 'main' function for processing.
main (   require ( 'fs' ) . readFileSync (   '/dev/stdin'   ,   'utf8'   )   ) ;