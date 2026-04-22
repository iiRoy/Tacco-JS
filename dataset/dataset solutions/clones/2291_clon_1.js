// This is a Type I clone of a JavaScript program.
// The purpose of this clone is to demonstrate variations
// in whitespace and comments while maintaining exact
// lexical and structural identity.

"use strict" // Enable strict mode for better error handling and cleaner code.

/**
 * Main function to process input.
 * It takes a string input, trims it, splits it by space,
 * and then prints the second element concatenated with the first element.
 *
 * @param {string} input - The raw input string from stdin.
 */
function  Main (  input  )   {
    // First, process the input string.
    // Trim any leading or trailing whitespace from the input.
    // Then, split the string into an array of substrings using a space as a delimiter.
    input  =  input . trim ( ) . split ( ' ' ) ;

    /*
     * Output the result to the console.
     * The problem statement requires concatenating the second element (index 1)
     * with the first element (index 0) of the processed array.
     */
    console . log ( input [ 1 ]  +  input [ 0 ] ) ;
} // End of Main function definition.

// Call the Main function with input read from standard input.
// This uses the 'fs' (file system) module to read the content of /dev/stdin.
// The content is read synchronously and decoded as UTF-8.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;

// End of file.