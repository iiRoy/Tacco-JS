/*
 * This JavaScript file contains the primary logic for processing an input.
 * It demonstrates a simple conditional check based on numerical input.
 *
 * File version: 1.0.0
 * Last modified: 2023-10-27
 */

function   Main   (   input   )
{
    // Step 1: Clean the input string by removing leading/trailing whitespace.
    // This ensures consistency before further processing.
    input   =   input  .  trim  (  )  ;


    /*
     * Step 2: Split the cleaned input string into an array of substrings.
     * The delimiter used is a single space character.
     * It's assumed the input will contain space-separated values.
     */
    input   =   input  .  split  (  " "  )  ;


    // Step 3: Evaluate a condition based on the first two elements of the input array.
    // We cast them to numbers implicitly via the multiplication operator.
    if   (   (   input   [   0   ]   *   input   [   1   ]   )   %   2   ==   0   )
    {
        // If the product of the first two numbers is an even number,
        // then we output "No" to the standard console.
        console  .  log  (   "No"   )  ;
    }
    else
    {
        // Otherwise, if the product is an odd number,
        // we output "Yes" to the standard console.
        console  .  log  (   "Yes"   )  ;
    }
} // End of the Main function definition.


/*
 * This is the primary execution block of the script.
 * It reads data from standard input and passes it to the Main function.
 * The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
 */
Main (
    require (  "fs"  )
        .  readFileSync (
              "/dev/stdin"   ,
              "utf8"
        )
) ; // Invokes the Main function with the processed input.