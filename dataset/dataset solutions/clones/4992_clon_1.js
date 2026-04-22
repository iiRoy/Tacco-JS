/*
 * This is a JavaScript file that defines a main function
 * to process some numerical input from standard input.
 *
 * It calculates a value based on four input numbers (a, b, c, d)
 * and then prints the result to the console.
 */


// --- Function Definition Section ---

/**
 * The primary function responsible for processing the input and
 * calculating the final result.
 *
 * @param {string} input - The raw string input read from stdin.
 */
function    main ( input )
{
    // First, remove any leading or trailing whitespace from the input string.
    input  =  input.trim ( ) ;


    // Next, parse the input string into individual numbers.
    // The input is expected to be newline-separated.
    // We use array destructuring to assign the four numbers directly.
    const   [ a , b , c , d ]   =   input . split ( '\n' ) . map ( Number ) ;


    // Now, perform the core calculation.
    // This is a conditional expression:
    // If 'a' is greater than 'b', calculate 'b * c + (a - b) * d'.
    // Otherwise (if 'a' is not greater than 'b'), calculate 'b * c'.
    console . log ( a > b ? b * c + ( a - b ) * d : b * c ) ;

}   // End of main function definition.


// --- Program Execution Section ---

// Read the entire content of standard input synchronously.
// The input is expected to be UTF-8 encoded.
// Then, invoke the main function with the read content.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;

// End of the JavaScript program.