/*
 * This is a Type I clone of the original JavaScript code.
 * The primary goal of a Type I clone is to demonstrate
 * that two code fragments are exactly equal in functionality
 * and structure, with the only differences being
 * variations in whitespace and comments.
 */
"use strict" /* This directive enables strict mode for the entire script. */


// Define the main function which will process the input string.
// The function takes one argument, 's', which is expected to be a string.
function Main ( s )
{
    // The input string 's' is first split into an array of strings
    // using the newline character as a delimiter.
    s = s . split ( '\n' ) ;


    // The first element of the split array is converted to a Number
    // and assigned to the constant variable 'h' (representing height).
    const h = Number ( s [ 0 ] ) ;

    // The second element of the split array is converted to a Number
    // and assigned to the constant variable 'w' (representing width).
    const w = Number ( s [ 1 ] ) ;

    // The third element of the split array is converted to a Number
    // and assigned to the constant variable 'n' (representing total items).
    const n = Number ( s [ 2 ] ) ;


    // An 'if-else' conditional statement checks if 'h' is greater than 'w'.
    // Note: The logic inside both the 'if' and 'else' blocks is identical
    // in the original problem statement.
    if ( h > w )
    {
        // If height 'h' is greater than width 'w',
        // calculate 'n' divided by 'h', then round up to the nearest integer.
        // The result is then printed to the console.
        console . log ( Math . ceil ( n / h ) ) ;
    }
    else
    {
        // If width 'w' is greater than or equal to height 'h',
        // perform the same calculation as in the 'if' block:
        // calculate 'n' divided by 'h', round up, and print to console.
        console . log ( Math . ceil ( n / h ) ) ;
    }
}


/*
 * This is the entry point of the script when executed in a Node.js environment.
 * It reads the entire content of the standard input ("/dev/stdin"),
 * decodes it as a UTF-8 string, and then passes it to the 'Main' function.
 * This setup is common in competitive programming platforms.
 */
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;