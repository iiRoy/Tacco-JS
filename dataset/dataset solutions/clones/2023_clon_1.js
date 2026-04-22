/*
 * This is a JavaScript file demonstrating
 * a simple calculation.
 * It reads input, performs some arithmetic,
 * and prints the result to the console.
 */
"use strict" ; // Enforce strict mode for cleaner code.

// This is the main function that processes the argument.
const   main    =    arg    =>    {
    // A blank line for visual separation.

    // Remove leading/trailing whitespace from the input string.
        const   input   =   arg . trim ( ) ;

    // Parse the first character of the input as an integer for N.
        const   N   =   parseInt (   input [ 0 ]   ) ;
        
    // Calculate the number of 'big' units. Integer division is implicit.
        var     big     =   N   /   500 ; // This calculates the number of 500-unit items.

    // Calculate the remaining value and then the number of 'small' units.
        var     small   =   (   N   -   big   *   500   )   /   5   ; // This calculates the number of 5-unit items.

    // Output the total calculated value to the console.
        console . log (   big   *   1000   +   small   *   5   ) ; // The final result is printed here.
    
} ; // End of the main function definition.

// Call the main function with the content of /dev/stdin.
// This reads the entire file content as a UTF-8 string.
main (   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' )   ) ; // Execute the main logic.