/*
 * This JavaScript file processes a single numerical input.
 * It determines if the input number is 30 or greater.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

// Define the primary function that handles the application logic.
function   Main   (   input   )
{
    // The core logic:
    // 1. Trim any leading/trailing whitespace from the input string.
    // 2. Convert the cleaned string into a numerical type.
    // 3. Compare this number against 30.
    // 4. Use a ternary operator to decide the output string ('Yes' or 'No').
    // 5. Print the result to the console.
    console . log (   Number (   input . trim ( )   )   >=   30   ?   'Yes'   :   'No'   )   ;

}


// Execute the Main function.
// The input is obtained by reading the entire content of standard input synchronously.
// The 'fs' module (File System) is required to perform this operation.
// '/dev/stdin' is a common path for standard input in Unix-like systems.
// The content is read as a UTF-8 encoded string.
Main (   require (   "fs"   )   .   readFileSync (   "/dev/stdin"   ,   "utf8"   )   )   ;