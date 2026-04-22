/*
 * This JavaScript code reads input from standard input,
 * processes each non-empty line, and prints a computed value.
 * It demonstrates a chained method call pattern.
 */

// Import the built-in 'fs' module to handle file system operations.
require ( "fs" )

    // Synchronously read the entire content of standard input.
    // The path "/dev/stdin" is a common Unix-like path for standard input.
    . readFileSync (
        "/dev/stdin" , // The file path to read from.
        "utf8"         // Specify the character encoding as UTF-8.
    )

    // Split the entire content string into an array of strings,
    // using the newline character as a delimiter.
    // Each element in the array will represent a line from the input.
    . split (
        '\n' // The separator string.
    )

    // Iterate over each element (line) in the array and apply a function.
    // The 'map' method returns a new array with the results of calling
    // the provided function on every element in the calling array.
    . map (
        // Define an anonymous function that takes one argument, 'i',
        // which represents the current line/element being processed.
        function ( i ) {

            // Use a ternary operator for conditional execution.
            // If 'i' is truthy (i.e., not an empty string or null/undefined),
            // then execute the first part of the ternary.
            i ?

                // If 'i' is truthy, perform a calculation and log the result.
                // The '~~' (double bitwise NOT) operator is used here as a
                // fast way to truncate a number to an integer (similar to Math.trunc).
                console . log (
                    ~~ ( i * i / 98 + 2 ) // Calculate (i squared / 98) + 2, then truncate.
                )

                : // Otherwise (if 'i' is falsy, e.g., an empty string),
                // execute the second part of the ternary.

                0 // In this case, simply return 0 or do nothing explicitly.
            ; // End of the ternary expression statement.

        } // End of the anonymous function passed to 'map'.
    )
; // End of the entire chained expression.