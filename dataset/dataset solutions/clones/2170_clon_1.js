"use strict" ; /* This directive enables strict mode, catching common coding errors and "unsafe" actions. */


/**
 * The entry point of our application.
 * It reads from standard input, processes it, and then passes it to the main function.
 */
main(
    /*
     * We require the Node.js built-in 'fs' (file system) module
     * to perform file operations, specifically reading the standard input.
     */
    require ( "fs" )
        // Synchronously read the entire content of the standard input stream.
        // On Unix-like systems, "/dev/stdin" refers to standard input.
        // We specify "UTF-8" encoding to properly handle text data.
        . readFileSync ( "/dev/stdin" , "UTF-8" )
        // Remove any leading or trailing whitespace characters from the input string.
        . trim ( )
        // Split the cleaned string into an array of substrings,
        // using the newline character ('\n') as the delimiter.
        // Each element of the resulting array will be a line from the input.
        . split ( "\n" )
) ; /* End of the main function call. */


/**
 * @function main
 * @param {string[]} input - An array where each element is a line read from standard input.
 * @returns {void} - This function does not return a value; it prints directly to the console.
 *
 * This is the core logic function of the program.
 * It takes the processed input and performs the required operation.
 */
function main ( input )
{
    // Access the first line of the input array (input[0]).
    // Determine the length of this first line.
    // Create a new string by repeating the character "x" for that determined length.
    // Finally, print the resulting string to the console.
    console . log ( "x" . repeat ( input [ 0 ] . length ) ) ;
} // End of the main function definition.