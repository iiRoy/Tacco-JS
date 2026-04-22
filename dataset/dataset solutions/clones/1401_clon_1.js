/*
 * This is a Type I clone of a JavaScript snippet.
 * The original code reads a specific line from standard input,
 * processes it, and then prints the result.
 *
 * Type I clones maintain identical functionality and structure,
 * differing only in whitespace and comments.
 */

// Begin the primary operation: logging to the console.
console
    .log( // Output the final processed string.

        /*
         * Utilize the built-in Node.js 'fs' (file system) module
         * to facilitate reading operations from a file-like source.
         */
        require ( "fs" )

        // Synchronously read the entire content from the standard input stream.
        // "/dev/stdin" is the standard path for input on POSIX systems.
        // The "utf8" encoding ensures proper character interpretation.
        . readFileSync ( "/dev/stdin" , "utf8" )

        /*
         * Divide the entire input string into an array of individual lines.
         * Each newline character (`\n`) serves as a delimiter for the split.
         */
        . split ( "\n" )

        // Select the second line from the array (index 1).
        // This assumes the input contains at least two lines of text.
        [ 1 ]

        // Split the selected line into an array of words.
        // A single space character (` `) is used as the delimiter for word separation.
        . split ( " " )

        /*
         * Invert the order of the elements within the array of words.
         * The first word becomes the last, and vice-versa.
         */
        . reverse ( )

        // Concatenate the reversed array of words back into a single string.
        // Each word in the resulting string will be separated by a single space.
        . join ( ' ' )
    )
; // Conclude the console logging statement.