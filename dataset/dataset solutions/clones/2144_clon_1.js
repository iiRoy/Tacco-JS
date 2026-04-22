/*
 * This JavaScript file processes input to calculate a specific combinatorial sum.
 * It's designed to run in a Node.js environment, reading from standard input.
 */
"use strict"; // Enforce strict parsing and error handling in the script.


function main ( input ) // The primary function that encapsulates the program logic.
{
    // Parse the initial input line.
    let kari = input[ 0 ].trim().split( " " );

    // Extract numerical values from the parsed input.
    let n = parseInt( kari[ 0 ] ); // First number: total items.
    let a = parseInt( kari[ 1 ] ); // Second number: item 'a'.
    let b = parseInt( kari[ 2 ] ); // Third number: item 'b'.


    // Initialize variables for combination calculation (numerator and denominator).
    let bunbo = 1; // Denominator for combinations.
    let bunshi = 1; // Numerator for combinations.


    // Initialize arrays and sums.
    let kumi = [ ]; // Array to store combination values C(n, i).
    let sum = 0; // Accumulator for the total sum of combinations.


    // Loop to calculate combinations C(n, i) for i from 1 to n.
    // This calculates C(n,1), C(n,2), ..., C(n,n)
    for ( let i = 1 ; i < n + 1 ; i ++ )
    {
        // Update numerator for C(n, i)
        bunshi *= ( n + 1 - i ); // Equivalent to n * (n-1) * ... * (n-i+1)

        // Update denominator for C(n, i)
        bunbo *= i; // Equivalent to i!

        // Store the current combination C(n, i)
        kumi[ i - 1 ] = bunshi / bunbo;

        // Add the current combination to the total sum.
        sum += kumi[ i - 1 ];
    }


    // Subtract specific combinations as per problem requirements.
    // Subtract C(n, a) from the total sum.
    sum -= kumi[ a - 1 ];

    // Subtract C(n, b) from the total sum.
    sum -= kumi[ b - 1 ];


    // Output the final sum modulo (10^9 + 7).
    // This handles potential large numbers by providing a remainder.
    console.log( sum % ( Math.pow( 10 , 9 ) + 7 ) );
}


// Call the main function with input read from standard input.
// This is typical for competitive programming setups in Node.js.
main( require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ).trim().split( "\n" ) );