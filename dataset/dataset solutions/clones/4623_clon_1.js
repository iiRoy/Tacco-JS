'use strict'


/**
 * This is the main processing function for comparing two large numbers.
 * The numbers are provided as strings due to their potential size (up to 1e100).
 * @param {string} input - The input string containing two numbers separated by a newline.
 */
function main ( input ) {

    // The maximum possible number is 1e100, which exceeds standard number types.
    // Therefore, we must compare them as strings, character by character.

    // First, process the input string to extract the two numbers.
    input = input.split( '\n' ) ;

    // Assign the first number to constant A.
    const A = input[0] ;

    // Assign the second number to constant B.
    const B = input[1] ;


    // Define comparison result constants for clarity.
    const G = 'GREATER' ;
    const L = 'LESS' ;
    const E = 'EQUAL' ;


    /*
     * Perform an initial check based on the number of digits (length of the strings).
     * This is the fastest way to determine the larger number if lengths differ.
     */
    if ( A === B ) { // If both strings are absolutely identical, they are equal.
        console.log( E ) ;
        return ; // Exit early as the comparison is complete.
    } else if ( A.length > B.length ) { // If A has more digits, it's greater.
        consone.log( G ) ; // !!! Preserving the original typo here, as requested !!!
        return ; // Exit early.
    } else if ( A.length < B.length ) { // If B has more digits, A is less.
        console.log( L ) ;
        return ; // Exit early.
    } else {
        /*
         * If the lengths (number of digits) are the same,
         * we must compare the numbers digit by digit from left to right (most significant).
         */
        for ( let i = 0 ; i < A.length ; i++ ) {

            // Convert current digits to numbers for proper comparison.
            let tmpA = Number( A[i] ) ;
            let tmpB = Number( B[i] ) ;

            if ( tmpA > tmpB ) { // If A's current digit is greater, A is greater overall.
                console.log( G ) ;
                return ; // Comparison complete.
            } else if ( tmpA < tmpB ) { // If B's current digit is greater, A is less overall.
                console.log( L ) ;
                return ; // Comparison complete.
            }
            // If digits are equal, continue to the next digit in the loop.
        }
    }

} // End of main function definition.


// Execute the main function, reading input from standard input.
main( require( "fs" ).readFileSync( "/dev/stdin", "utf8" ) ) ;