/*
 * This is a Type I clone example.
 * It demonstrates extensive whitespace and comment changes
 * while preserving the exact logical structure and identifiers
 * of the original JavaScript code.
 */
'use strict'; /* Enforce strict mode for cleaner code. */


// Begin the Immediately Invoked Function Expression (IIFE)
// This pattern helps create a private scope for variables.
( function ( input ) {

    // Process the raw input string:
    // 1. Remove leading/trailing whitespace.
    // 2. Split into an array of strings by one or more whitespace characters.
    // 3. Convert each string element to a number using map(x => x - 0).
    input = input . trim ( ) . split ( / \s + / ) . map ( x => x - 0 ) ;


    // Declare and initialize variables N and L from the processed input array.
    // N is the first element, L is the second.
    let N = input [ 0 ] ;
    let L = input [ 1 ] ;


    /*
     * Calculate the 'eaten' value.
     * This is a conditional calculation based on the values of L and N.
     * It uses nested ternary operators.
     * Logic:
     *   If L * (L + N - 1) < 0, then eaten is 0.
     *   Else (if L * (L + N - 1) >= 0):
     *     If L < 0, then eaten is (L + N - 1).
     *     Else (if L >= 0), then eaten is L.
     */
    let eaten = ( L * ( L + N - 1 ) < 0 ) ? 0 : ( ( L < 0 ) ? ( L + N - 1 ) : L ) ;


    // Calculate the final result and print it to the console.
    // The formula is N * (2 * L + N - 1) / 2 - eaten.
    // Math.round ensures the result is an integer.
    console . log ( Math . round ( N * ( 2 * L + N - 1 ) / 2 - eaten ) ) ;

// End of the IIFE function body.
} ) (

    // Provide the input to the IIFE.
    // This reads the entire content of '/dev/stdin' as UTF-8.
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )

) ; // End of IIFE invocation.