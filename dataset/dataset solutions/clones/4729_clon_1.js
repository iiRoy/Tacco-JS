/*
 * This JavaScript file demonstrates a basic
 * conditional program. It reads a number
 * from standard input and prints a string
 * based on its value.
 */
'use strict' // Enforces strict parsing and error handling rules for the code.


    // The primary function of the application, responsible for processing input.
const   main    =   (   input   )   =>  {

    // Declare a constant variable 'x' and assign it the integer value of the 'input' string.
    const   x   =   parseInt    (   input   )   ;

        /*
         * This block contains the core logic: a conditional statement.
         * It checks if the parsed integer 'x' is strictly less than 1200.
         */
    if  (   x   <   1200    )   {
        // If the condition (x < 1200) is true, print 'ABC' to the console.
        console .   log (   'ABC'   )   ;
    }   else    {
        // Otherwise (if x is 1200 or greater), print 'ARC' to the console.
        console .   log (   'ARC'   )   ;
    }
}


// This line executes the 'main' function.
// It retrieves the input by reading the entire content of '/dev/stdin'
// (standard input) as a UTF-8 encoded string using Node.js's 'fs' module.
main    (
    require (   'fs'    )   .   readFileSync    (   '/dev/stdin'    ,   'utf-8' )
)   ;