/*
 * This is a Type I clone of the original JavaScript code.
 * It demonstrates variations in whitespace and comments only.
 * All functional aspects, identifiers, and logic remain precisely identical.
 */

// Define the main function that processes the input
function    Main   (   input   )
{
    // Convert the input string to a numerical value.
    // The Number() constructor is used for this type conversion.
    input   =   Number  (   input   )   ;

    // Perform a bitwise XOR operation with 1 on the numerical input.
    // The result is then printed to the console.
    // For example, if input is 5 (binary 101), 5^1 is 4 (binary 100).
    // If input is 4 (binary 100), 4^1 is 5 (binary 101).
    console.log   (   input   ^   1   )   ;
}


// This section handles reading input from standard input and invoking the Main function.
// It uses Node.js's 'fs' module to read the file content.
Main    (   require("fs").readFileSync("/dev/stdin", "utf8")   )   ;