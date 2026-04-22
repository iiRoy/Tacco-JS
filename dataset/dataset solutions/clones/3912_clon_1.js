/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition:
 * - No changes to identifiers, variable names, function names, operators, or expressions.
 * - Only whitespace and comments are modified.
 * The purpose is to demonstrate visual difference while maintaining exact logical equivalence.
 */

'use strict'; // Enforces strict mode for cleaner code and fewer errors.

// Define the main function that processes the input.
function   Main ( INPUT )
{
    // Split the input string into an array of characters.
    // Each character becomes an element in the 'S' array.
    const S = INPUT . split ( "" ) ;

    // Check if all three characters are distinct.
    // S[0] != S[1]   - Is the first character different from the second?
    // S[0] != S[2]   - Is the first character different from the third?
    // S[1] != S[2]   - Is the second character different from the third?
    // If all conditions are true, then all characters are unique.
    // Use a ternary operator for concise conditional logging.
    console . log ( S [ 0 ] != S [ 1 ] &&
                    S [ 0 ] != S [ 2 ] &&
                    S [ 1 ] != S [ 2 ]
                    ? "Yes"
                    : "No"
    ) ;
}

// --- Program Entry Point ---
// Read input from standard input asynchronously.
// The 'require("fs")' module provides file system functionality.
// 'readFileSync' reads the file synchronously.
// '/dev/stdin' is the conventional path for standard input on Unix-like systems.
// 'utf8' specifies the encoding for the input.
// The read content is then passed to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/* End of file */