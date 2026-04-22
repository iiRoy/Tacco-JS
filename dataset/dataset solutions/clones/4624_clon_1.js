"use strict";

// This is the main function definition.
// It takes 'input' as a string parameter.
const Main = ( input ) =>
{
    // First, we trim any leading/trailing whitespace from the input.
    // Then, we split the input string by newline characters to get an array of lines.
    let xs = input . trim() . split( '\n' ) ;

    /*
     * For the first line (index 0) of the processed input 'xs':
     *   1. Trim any whitespace.
     *   2. Split the string into an array of individual characters.
     *   3. Map each character 'v' to its integer representation (base 10).
     * The result is stored in array 'A'.
     */
    let A = xs[ 0 ] . trim() . split( '' ) . map( v => parseInt( v , 10 ) ) ;

    // Perform the same operations for the second line (index 1) of 'xs'.
    // The result is stored in array 'B'.
    let B = xs[ 1 ] . trim() . split( '' ) . map( v => parseInt( v , 10 ) ) ;


    // Determine the length of array A.
    let A_len = A . length ;

    // Determine the length of array B.
    let B_len = B . length ;


    // Initialize a variable to accumulate the sum of digits in A.
    let ansA = 0 ;

    // Loop through each element of array A.
    for ( let i = 0 ; i < A_len ; i++ )
    {
        // Add the current digit to 'ansA'.
        ansA += A[ i ] ;
    }

    // Initialize a variable to accumulate the sum of digits in B.
    let ansB = 0 ;

    // Loop through each element of array B.
    for ( let i = 0 ; i < B_len ; i++ )
    {
        // Add the current digit to 'ansB'.
        ansB += B[ i ] ;
    }


    // Compare the two accumulated sums.
    if ( ansA > ansB )
    {
        // If the sum of digits in A is greater, print 'GREATER'.
        console . log( 'GREATER' ) ;
    }
    else
    {
        // Otherwise (if sum A is less than or equal to sum B), print 'LESS'.
        console . log( 'LESS' ) ;
    }
} ; // End of the Main function.

// This line reads the input from standard input (/dev/stdin)
// using Node.js's 'fs' module, converts it to 'utf8' encoding,
// and then passes it to the Main function for processing.
Main( require( 'fs' ) . readFileSync( '/dev/stdin' , 'utf8' ) ) ;