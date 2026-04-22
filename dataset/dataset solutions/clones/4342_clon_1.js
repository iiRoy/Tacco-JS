/*
 * This file contains a JavaScript program that processes
 * input from standard input to perform a specific calculation.
 * It's designed to be run in a Node.js environment.
 */

'use strict'; // Enforce strict mode for better error handling and cleaner code.


// Define the main function that takes 'input' as its argument.
const main = ( input ) =>
{
    // The core logic of the program resides within this function.

    /*
     * First, process the raw input string.
     * Split it by newline characters to get individual lines.
     * Then, for each line, split it by space characters to get an array of arguments.
     * The result 'args' will be a 2D array of strings.
     */
    const   args    =   input . split ( '\n' ) . map ( arg   =>   arg . split ( ' ' ) ) ;

    // Extract the first number 'n' from the first line of input.
    // Convert it from string to an integer using base 10.
    const   n   =   parseInt ( args [ 0 ] [ 0 ] ,   10 ) ;

    // Extract the second number 'a' from the second line of input.
    // Again, convert it to an integer using base 10.
    const   a   =   parseInt ( args [ 1 ] [ 0 ] ,   10 ) ;

    // Perform the final calculation: n squared minus a.
    // Then, print the result to the console (standard output).
    console . log ( n   *   n   -   a ) ;
}
// End of the main function definition.


/*
 * This is the entry point of the script.
 * It reads the entire content of '/dev/stdin' (standard input)
 * as a UTF-8 encoded string and passes it to the 'main' function.
 * This pattern is common in competitive programming environments.
 */
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;