/*
 * This JavaScript program demonstrates basic file I/O and string manipulation.
 * It is designed to read the first line of standard input, perform a
 * character replacement operation, and then print the result to standard output.
 *
 * This script strictly adheres to the Type I clone definition, ensuring
 * logical and structural identity with the original code, while varying
 * only whitespace and comments extensively for visual distinction.
 */


// Declare and initialize the 's' variable.
// This variable will store the first line of input read from standard input.
// The 'fs' module is used for file system operations, specifically reading.
s   =   require (   'fs'   )
    .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   // Read the entire content of stdin as UTF-8.
    .   split (   '\n'   )                           // Split the content into an array of lines.
    [   0   ]                                        // Access the first line (index 0).
;   // End of the statement for reading input.


// A blank line for enhanced readability and visual separation.


// Now, process the acquired string 's' and output the result.
// The 'console.log' function is utilized to print to standard output.
console
    .   log (   s   .   replace (   /,/g   ,   ' '   )   )   // Replace all commas globally with a single space.
;   // End of the statement for logging the processed string.


// Program execution concludes here after printing the final output.