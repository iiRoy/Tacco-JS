/*
 * This is a Type I clone of an original JavaScript program.
 * It strictly adheres to the definition where only whitespace
 * and comments are altered.
 * All identifiers, operators, and expressions remain identical.
 */

'use strict' ; // Enforce strict mode for better code quality.

// Define the main function that processes the input.
const   main  =   (  input  )   =>   {
    // Split the input string by newlines, then map each line
    // to an array of strings split by spaces.
    const   args   =   input .   split (   '\n'   ) .   map (   arg   =>   arg .   split (   ' '   )   ) ;


    // Parse the first element of the first argument array as an integer.
    // The radix (10) is explicitly provided for robustness.
    const   N   =   parseInt (   args [   0   ] [   0   ] ,   10   ) ;

    // Calculate N divided by 3, then take the floor (integer part),
    // and print the result to the console.
    console .   log (   Math .   floor (   N   /   3   )   ) ;
}   ;   // End of the main function definition.


// This section handles reading input from standard input and calling the main function.
// It uses Node.js's 'fs' module to read the file synchronously.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'utf8'   )   ) ;
// The program execution starts here, feeding the input to the main function.