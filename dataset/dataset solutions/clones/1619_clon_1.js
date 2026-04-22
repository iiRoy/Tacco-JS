/*
 * This is a Type I clone generated from an original JavaScript snippet.
 * The purpose is to demonstrate extensive whitespace and comment variations
 * while preserving the exact logical and structural integrity of the source code.
 */

// Define the main function that processes the input value.
// This function takes a single argument, 'input'.
function    Main (   input   )
{
    // The core logic: check if the provided 'input' value is greater than or equal to 30.
    // Based on the comparison result, either "YES" or "NO" is outputted to the console.
    // The '%s' format specifier is used for string output.
    console.log (   '%s'    ,   input   >=  30  ?   "YES"   :   "NO"    )   ;

}   // End of Main function definition.
    // A blank line for visual separation.


/*
 * The following section handles reading input from standard input
 * and then invokes the 'Main' function with the processed data.
 * In a competitive programming context, this part is typically boilerplate.
 * PLEASE DO NOT EDIT THIS PART IN PRODUCTION ENVIRONMENTS.
 * It's crucial for the program's execution flow and interaction with the environment.
 */
Main  (
    require (   "fs"    )   // Require the built-in 'fs' (file system) module.
        .   readFileSync    (   "/dev/stdin"    ,   "utf8"  )   // Read content from standard input synchronously, using UTF-8 encoding.
)   ;
// This marks the very end of the JavaScript script execution.