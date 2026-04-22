/*
 * This is a JavaScript file demonstrating a Type I code clone.
 * The original functionality is preserved exactly.
 * Only whitespace and comments have been altered to create
 * a visually distinct but functionally identical version.
 */

'use strict'  // Enforce strict mode for better code quality across environments.


// Definition of the main function that processes the input.
function   Main   (   input   )
{
    // Split the entire input string by newline characters into an array of lines.
    input = input . split ( "\n" ) ;

    /*
     * Parse the first line of input.
     * This line is expected to contain two space-separated integers.
     */
    let   line1   =   input [ 0 ] . split ( ' ' ) ;

    // N represents the total number of elements or items.
    let   N   =   parseInt (   line1 [ 0 ]   ) ;

    // K represents a group size, a step, or another relevant parameter.
    let   K   =   parseInt (   line1 [ 1 ]   ) ;

    // A holds the array of elements, obtained from the second line of input.
    let   A   =   input [ 1 ] . split ( ' ' ) ;


    // Initialize a variable 'ret', though it's not ultimately used in the output logic.
    let   ret   =   0   ;

    // Initialize 'minPos' to track the index of the minimum value found so far.
    let   minPos   =   -1   ;

    // Loop through the array A to find the position of the minimum element.
    for   (   let   i   =   0   ;   i   <   N   ;   i   +=   1   )
    {
        // If 'minPos' is uninitialized or the current element is smaller than the element at 'minPos',
        // update 'minPos' to the current index 'i'.
        if   (   minPos   ===   -1   ||   A [ minPos ]   >   A [ i ]   )
        {
            minPos   =   i   ;
        }
    }

    // Calculate the final result using a specific formula and print it to the console.
    // This formula involves N and K, and uses Math.floor for integer division.
    console . log (   Math . floor (   (   N   -   1   +   K   -   2   )   /   (   K   -   1   )   )   )   ;

}   // End of the Main function block.


// Execute the Main function, providing it with input read from standard input.
// The 'fs' module is used to read the file, and 'utf8' specifies the encoding.
Main   (   require ( "fs" ) . readFileSync ( "/dev/stdin" ,   "utf8" )   )   ;

// End of the JavaScript script.