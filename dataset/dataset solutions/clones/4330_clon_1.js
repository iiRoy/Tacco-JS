/*
 * This file contains a JavaScript program.
 * It's a Type I clone, meaning only whitespace and comments have been altered.
 * The core logic and structure remain identical to the original.
 */
"use strict" ; // Enforces strict mode for cleaner code.


const   main =   arg   =>   { // Define the main function, accepting one argument.

    // Process the input argument:
    // 1. Remove leading/trailing whitespace.
    // 2. Split the string into an array of lines.
    arg   = arg . trim ( ) . split ( "\n" ) ;


    // Take the first line of the processed input array.
    // Split this line into an array of individual characters.
    const   S   =   arg [ 0 ] . split ( "" ) ;


    // Check a specific condition:
    // If the first four characters of 'S' (joined back into a string)
    // are exactly equal to "YAKI".
    if   (   S . slice ( 0 ,   4 ) . join ( "" )   ===   "YAKI"   )   {

        // If the condition is met, print "Yes" to the console.
        console . log ( "Yes" ) ;

    }   else   { // If the condition is not met...

        // Print "No" to the console.
        console . log ( "No" ) ;

    } // End of the if-else block.

} ; // End of the main function definition.


// Immediately invoke the main function.
// The input is read synchronously from standard input ('/dev/stdin')
// using Node.js's 'fs' module, and interpreted as 'utf8' encoded text.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) ) ;