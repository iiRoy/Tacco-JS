/*
 * This JavaScript file defines a function to process input.
 * It checks for a specific character 'Y' within a sliced portion of the input.
 * Based on the presence of 'Y', it prints either "Four" or "Three".
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

function     Main    (   input   )
{
    // Begin processing the input string.
    // The input is first sliced using '¥n' as a delimiter.
    // This operation modifies the 'input' variable in place (reassigns it).
    input  =   input.slice(   '¥n'   )   ;


    // Next, we access the second element (index 1) of the
    // now array-like 'input' variable.
    // This element is then sliced using a space character ' ' as a delimiter.
    // The result is stored in the 'arare' variable.
    arare   =   input   [   1   ]   .slice   (   ' '   )   ;


    // Now, we perform a conditional check.
    // We look for the character 'Y' within the 'arare' string.
    // The indexOf() method returns -1 if the character is not found.
    if      (   arare.indexOf   (   'Y'   )   !=   -1   )
    {
        // If 'Y' is found (indexOf does not return -1),
        // then "Four" is logged to the console.
        console.log     (   'Four'   )   ;
    }
    else
    {
        // Otherwise, if 'Y' is not present in 'arare',
        // "Three" is logged to the console instead.
        console.log     (   'Three'   )   ;
    }
    // End of conditional logic.
}
// End of the Main function definition.


// This part of the script handles the execution of the Main function.
// It reads data from standard input (typically for competitive programming).
// The 'fs' module is used to read the file synchronously.
// The path "/dev/stdin" is standard for reading from stdin in Unix-like systems.
// The 'utf8' encoding is specified for the input data.
Main    (   require (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;

// This marks the end of the program execution flow.