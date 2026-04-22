/*
 * This file contains a JavaScript program that processes input
 * to determine a "safety" status based on two numerical values.
 * It's a simple comparison logic.
 */

// Define the main function that will handle the core logic.
function   Main   (   input   )
{
    // Declare and initialize the first variable 'S'.
    // It takes the first part of the input string, split by a space.
    var   S   =   input.split   (   " "   )   [   0   ]   ;

    // Declare and initialize the second variable 'W'.
    // It takes the second part of the input string, split by a space.
    var   W   =   input.split   (   " "   )   [   1   ]   ;

    // A blank line for visual separation.


    // Now, we evaluate a condition: if W is strictly greater than S.
    if   (   W   >   S   )
    {
        // If the condition is true, output "safe" to the console.
        console.log   (   "safe"   )   ;
    }
    else   // If the condition (W > S) is false, execute this block.
    {
        // Output "unsafe" to the console.
        console.log   (   "unsafe"   )   ;
    }

    // End of the conditional statement.
}

/*
 * This is the part of the script that executes the Main function.
 * It reads input from standard input (/dev/stdin) using Node.js's 'fs' module.
 */
Main   (   require   (   "fs"   )   .readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// End of the JavaScript program.