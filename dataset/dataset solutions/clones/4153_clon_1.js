/*
 * This is a Type I clone of the original JavaScript program.
 * It strictly adheres to the definition:
 * - All identifiers, keywords, operators, and expressions are identical.
 * - Only whitespace and comments have been altered.
 * - Changes are extensive to ensure visual difference.
 */

// Enforce strict mode for better code quality and error handling.
"use strict"
;

// Define the main function to process the input.
const   Main    =    (   input   )    =>
    {
    // Declare a variable 'xs' to store processed input lines.
    let     xs     =     input
        .trim()       // Remove leading/trailing whitespace from the input string.
        .split('\n')  // Split the string into an array of lines.
    ;

    // Initialize 'a' with the first line of input, split into characters.
    let     a     =     xs[0]
        .split('')
    ;

    // Initialize 'b' with the second line of input, split into characters.
    let     b     =     xs[1]
        .split('')
    ;

    // Sort array 'a' in ascending order, then join characters back into a string.
    a     =     a
        .sort()
        .join()
    ;

    // Sort array 'b' in ascending order, reverse it, then join characters into a string.
    // This effectively sorts 'b' in descending order.
    b     =     b
        .sort()
        .reverse()
        .join()
    ;

    /*
     * Compare the lexicographically sorted string 'a' with
     * the lexicographically reverse-sorted string 'b'.
     *
     * If 'a' is lexicographically smaller than 'b',
     * it means 'a' can be transformed to be smaller than 'b'.
     */
    if   (   a    <    b   )
        {
        // Output 'Yes' if the condition is met.
        console
            .log(   'Yes'   )
        ;
        }
    else
        {
        // Otherwise, output 'No'.
        console
            .log(   'No'   )
        ;
        }
    }
; // End of Main function definition.


// Execute the Main function with input read from standard input.
Main   (
    require('fs') // Require the Node.js file system module.
        .readFileSync(   '/dev/stdin',   'utf8'   ) // Read the entire file synchronously from /dev/stdin as UTF-8.
)
; // Function call ends here.

/*
 * End of program.
 * This code compares two strings after specific sorting operations.
 */