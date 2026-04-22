'use strict'

// This is an introductory comment for the entire script.
// It sets the strict mode for JavaScript parsing and execution.

/*
 * The following code block contains a commented-out utility function.
 * This function was originally intended for converting hexadecimal characters
 * (A-F) into their corresponding decimal values (10-15).
 * It is currently not active in the main logic of the program.
 */
/*
const conv = ( str ) =>
{
    if ( str === 'A' ) return 10 ; // Converts 'A' to 10
    if ( str === 'B' ) return 11 ; // Converts 'B' to 11
    if ( str === 'C' ) return 12 ; // Converts 'C' to 12
    if ( str === 'D' ) return 13 ; // Converts 'D' to 13
    if ( str === 'E' ) return 14 ; // Converts 'E' to 14
    if ( str === 'F' ) return 15 ; // Converts 'F' to 15
}
*/

/**
 * The main function processes the input string to compare two values.
 * @param {string} input - The raw input string, typically from standard input.
 */
const    main   =    ( input )    =>
{
        // Parse the input string to extract the first value, X.
        // It splits by newline, takes the first line, then splits by space, and takes the first part.
        let    X    =    input . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 0 ]    ;

        // Parse the input string to extract the second value, Y.
        // Similar to X, but takes the second part after splitting by space.
        let    Y    =    input . split ( '\n' ) [ 0 ] . split ( ' ' ) [ 1 ]    ;

        // --- Comparison Logic ---

        // Check if X is strictly equal to Y.
        if    ( X    ===    Y )
        {
                console . log ( '=' )    ; // Output '=' if both values are identical.
        }
        // If not equal, check if X is greater than Y.
        else    if    ( X    >    Y )
        {
                console . log ( '>' )    ; // Output '>' if X is numerically greater than Y.
        }
        // If neither of the above conditions is met, X must be less than Y.
        else
        {
                console . log ( '<' )    ; // Output '<' if X is numerically less than Y.
        }

} ; // End of the main function definition.


// This section handles the execution of the script.
// It reads input from standard input, decodes it as UTF-8, and passes it to the main function.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf-8' ) )    ;

/*
 * End of JavaScript file.
 * This program performs a simple comparison of two string-parsed values.
 */