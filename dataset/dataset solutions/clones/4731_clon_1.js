/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the Type I definition:
 * - All identifiers, keywords, operators, and literals are preserved exactly.
 * - Only whitespace (spaces, tabs, newlines) and comments have been altered.
 * The purpose is to demonstrate extensive visual differences while maintaining
 * identical logical and structural equivalence to the source.
 */

// Enforce strict parsing and error handling for the entire script.
'use strict';

// Define the main function that processes the input argument.
const main =     (   arg   )   =>   {
    // The input argument is expected to be a string.
    // First, remove any leading/trailing whitespace.
    // Then, split the string into an array of lines based on newline characters.
    const input = arg.trim() . split  (  "\n"  )   ;

    // From the first line of the input array (index 0),
    // split it by spaces to get individual parts.
    // Take the very first part (index 0) of this split array.
    // Convert this string part into a number and assign it to variable N.
    let N = Number (  input   [   0   ]   .   split   (   ' '   )   [   0   ]   )   ;

    // Check if the value of N is greater than or equal to 1200.
    // If true, log 'ARC' to the console.
    // Otherwise (if false), log 'ABC' to the console.
    console.log(   N   >=   1200   ?   'ARC'   :   'ABC'   )   ;
}   ; // End of the main function definition.


// Read the entire content of standard input synchronously.
// The file path is '/dev/stdin', which is common for competitive programming environments.
// Specify 'utf8' encoding for proper character decoding.
// Pass the read content as an argument to the main function to start execution.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;
// The program finishes after the main function completes.