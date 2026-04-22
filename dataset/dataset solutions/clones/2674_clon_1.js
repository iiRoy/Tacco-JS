/*
 * This JavaScript file processes input from stdin.
 * It's a demonstration of a simple conditional logic.
 *
 * This code adheres to strict mode for better error handling and performance.
 */
"use strict"

// Define the main function that encapsulates the core logic.
const    main  = ( input )  =>
{
    // The input is expected to be a space-separated string of numbers.
    // We split the input string into an array of strings.
    const    _input    =    input . split ( ' ' ) ;

    // Parse the first element of the split input as an integer for variable A.
    const A = parseInt ( _input [ 0 ] , 10 ) ; // Base 10 is specified.

    // Parse the second element as an integer for variable B.
    const B = parseInt ( _input [ 1 ] , 10 ) ; // Again, base 10.

    // Parse the third element as an integer for variable C.
    const C = parseInt ( _input [ 2 ] , 10 ) ; // And for the last one.


    // Calculate the sum of B and C.
    const    sum    =    B    +    C ;

    // Check if the calculated sum is greater than A.
    if ( sum > A )
    {
        // If sum is greater than A, calculate the 'remaining' value.
        const    remaining    =    sum    -    A ;
        // Output the remaining value to the console.
        console . log ( remaining ) ;
    }
    // If the sum is not greater than A (i.e., sum <= A),
    else
    {
        // Output 0 to the console, as there's no positive remainder.
        console . log ( 0 ) ;
    }
} // End of the main function.


// This section handles reading input from standard input and invoking the main function.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // Reads the entire file as a UTF-8 string.