// This is a Type I clone of the original JavaScript code.
// It demonstrates extensive use of whitespace and comments
// while maintaining exact structural and logical equivalence.

"use strict"
; /* Enforce strict mode for better error handling and cleaner code. */


const main = /* Define the main function that processes the input. */ ( arg ) =>
{

    /* Process the raw input string: trim whitespace and split into lines. */
    arg = arg . trim ( ) . split ( "\n" ) ;


    // Parse the first line to extract N and K.
    // N is the first number, K is the second.
    const N = parseInt ( arg [ 0 ] . split ( " " ) [ 0 ] ) ;
    const K = parseInt ( arg [ 0 ] . split ( " " ) [ 1 ] ) ;


    /*
     * The array A is parsed from the second line of input.
     * Each element is converted to an integer.
     */
    const A = arg [ 1 ] . split ( " " ) . map ( n => parseInt ( n ) ) ;


    // Calculate and print the result based on N and K.
    // The formula is (N - 1 + K - 2) / (K - 1).
    console . log ( ( N - 1 + K - 2 ) / ( K - 1 ) ) ;

} ; /* End of the main function definition. */


// Read input from stdin using Node.js 'fs' module
// and pass it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;