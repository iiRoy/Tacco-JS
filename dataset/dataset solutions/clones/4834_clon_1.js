/*
 * This file contains the primary logic for processing
 * command-line input and generating a specific output.
 * It's designed to operate in a strict JavaScript environment.
 */

'use strict'
; // Enforces strict parsing and error handling for cleaner code.


const   main    =   (   arg )   =>  {       // Defines the main execution function that accepts an argument.

    // Processes the raw input string: removes leading/trailing whitespace and splits into lines.
    const   input   =   arg .   trim  ( ) .   split ( "\n" )    ;

    // Takes the first line of the input array and splits it by spaces to get individual string components.
    let     Ss      =   input   [   0   ] .   split   (   ' ' )   ;

    // Concatenates the first character of the first three components and prints the result to the console.
    // This effectively extracts initials or an acronym from the processed input.
    console .   log (   Ss  [   0   ]   [   0   ]   +   Ss  [   1   ]   [   0   ]   +   Ss  [   2   ]   [   0   ]   )   ;

}   ; // End of the main function definition.


// Executes the main function, providing it with content read synchronously from standard input.
main    (   require (   'fs'    ) .   readFileSync  (   '/dev/stdin'    ,   'utf8'  )   )   ;