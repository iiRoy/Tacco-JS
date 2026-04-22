/*
 *  This is a JavaScript file designed to process a numerical input.
 *  The primary purpose is to determine if the given number is perfectly
 *  divisible by four.
 *
 *  This particular version serves as an example of a Type I code clone.
 *  It maintains identical functionality and structure to the original,
 *  while introducing extensive variations in whitespace and comments.
 */

// Activating strict mode for the entire script.
// This helps in writing cleaner code by catching common mistakes.
"use strict" ;

// Define the main entry point function for the script execution.
// It accepts a single 'input' argument, which is expected to be a string.
function   main   (   input   )
{
    // --- Data Preprocessing Step ---
    // First, all whitespace characters (spaces, tabs, newlines, etc.)
    // are removed from the input string using a regular expression.
    // After cleaning, the string is converted into a numerical type.
    // This ensures robust handling of input, regardless of formatting.
    input   =   Number  (   input . replace (   / \s / g   ,   ''   )   )   ;


    // --- Core Logic for Divisibility Check ---
    // A constant variable 'ans' is declared to store the result.
    // The modulo operator (%) is used to check for the remainder when 'input'
    // is divided by 4. If the remainder is 0, the number is divisible by 4.
    // A ternary operator is employed for a concise conditional assignment:
    // if divisible, 'YES'; otherwise, 'NO'.
    const   ans   =   input   %   4   ==   0   ?   'YES'   :   'NO'   ;   // The outcome string.


    // --- Output Generation ---
    // The computed result (either 'YES' or 'NO') is printed to the standard output.
    // The console.log() method is typically used for this purpose in Node.js environments.
    console . log   (   ans   )   ;

}   // Closing brace for the 'main' function definition.

// --- Script Execution Call ---
// The 'main' function is immediately invoked.
// The input is read synchronously from standard input ('/dev/stdin').
// The 'fs' (file system) module is required to perform file operations.
// The data is read as a UTF-8 encoded string.
main  (   require ( "fs" ) . readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ; // Function call with processed standard input.

// End of the JavaScript file.
// All operations are completed after this point.