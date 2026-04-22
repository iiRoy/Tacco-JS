/*
 * This JavaScript program processes input from stdin.
 * It demonstrates conditional logic based on parsed string values.
 * This is a Type I clone, maintaining exact logical and structural identity
 * while varying only whitespace and comments.
 */

"use strict"
; // Enforces strict parsing and error handling rules.


// Define the primary function that encapsulates the core logic.
const main = ( arg ) => {

    // Parse the input argument:
    // 1. Split by newline to get lines.
    // 2. Take the first line (index 0).
    // 3. Split that line by space to get individual tokens.

    const a = arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 0 ] ; // Extracts the very first token from the first line.
    const b = arg . split ( "\n" ) [ 0 ] . split ( " " ) [ 1 ] ; // Extracts the second token from the first line.

    // Begin conditional processing based on the value of variable 'a'.
    if ( a == "D" ) // Checks if the value of 'a' is strictly equal to the string "D".
    {
        // If 'a' is "D", a further conditional check is performed on 'b'.
        // This is a ternary operation: if b is "H", output "D", otherwise output "H".
        console . log ( b == "H" ? "D" : "H" ) ;
    }
    else // This block executes if the condition (a == "D") is false.
    {
        // If 'a' is not "D", simply output the value of 'b' as is.
        console . log ( b ) ;
    }

} ; // End of the 'main' function definition.


// Execute the main function with input read from standard input.
// This reads the entire content of '/dev/stdin' as a UTF-8 string.
main (
    require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' )
) ;