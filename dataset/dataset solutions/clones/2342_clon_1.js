/*
 * This JavaScript program processes a string input.
 * It's designed to simulate a simple card game check.
 * This particular version is a Type I clone of an existing script,
 * meaning its functionality and core structure are identical,
 * but whitespace and comments have been extensively modified.
 */

'use strict'
; // Enforces strict parsing and error handling for better code quality.


function   main   (   inp   )
{
    // The input 'inp' is expected to be a string containing space-separated numbers.
    // First, remove any leading or trailing whitespace from the input string.
    // Then, split the string into an array of substrings using space as a delimiter.
    // Finally, transform each substring in the array into a numerical value.
    inp   =   inp . trim ( ) . split ( ' ' ) . map (   n   =>   Number (   n   )   )   ;


    // This line checks the sum of the first three numbers in the processed array.
    // If the sum of inp[0], inp[1], and inp[2] is greater than 21,
    // the program outputs the string 'bust'.
    // Otherwise, if the sum is 21 or less, it outputs 'win'.
    console . log (   inp [ 0 ]   +   inp [ 1 ]   +   inp [ 2 ]   >   21   ?   'bust'   :   'win'   )   ;

} // End of the 'main' function definition.


// This is the entry point of the script when run in a Node.js environment.
// It uses the built-in 'fs' (file system) module to read data.
// Specifically, it reads the entire content of '/dev/stdin' (standard input)
// as a UTF-8 encoded string.
// The read content is then passed as an argument to the 'main' function.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   )   ;

// End of the program execution flow.