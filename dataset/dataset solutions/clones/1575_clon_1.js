/*
 * This is a Type I clone of the original JavaScript code.
 * It strictly adheres to the definition:
 * - All identifiers, variable names, function names, operators, and expressions are identical.
 * - Only whitespace (indentation, spacing, blank lines) and comments have been altered.
 * The purpose is to demonstrate visual difference while maintaining exact logical equivalence.
 */

// --- Main function definition starts here ---
// This function takes a single argument, 'input', which is expected to be a string.
function         Main    (input)
{
    // Step 1: Convert the input string into an array of individual characters.
    // The spread operator `...` is used here to achieve this conversion efficiently.
    const   charList    =   [   ...   input  ];


    // Step 2: Map the array of characters to an array of integers.
    // Each character is parsed into its integer representation using `parseInt()`.
    // This assumes the input string contains only numeric characters.
    const   intList     =   charList    .   map  (  x   =>
    {
            // The return statement is explicitly used within the arrow function's block body.
            return   parseInt ( x )
            ;
    }  )   ;


    // Step 3: Calculate the sum of all integers in the 'intList'.
    // The `reduce()` method iterates over the array, accumulating a single result.
    // The initial value for the accumulator (x) is the first element of the array if not specified.
    const   sum         =   intList     .   reduce   (  ( x  ,  y )  =>
    {
        // For each iteration, the current element (y) is added to the accumulator (x).
        return     x    +    y     ;
    }  )   ;


    // Step 4: Determine if the calculated sum is divisible by 9.
    // The modulo operator `%` is used to get the remainder of the division.
    // If the remainder is 0, the sum is divisible by 9.
    // A ternary operator (`? :`) is used for conditional output.
    console .   log   (   sum   %   9   ==   0   ?   "Yes"   :   "No"   )   ;

} // --- End of Main function definition ---


// ----------------------------------------------------------------------------------------------------
// This section handles the execution of the `Main` function.
// It reads input from the standard input (`/dev/stdin`) using Node.js's file system module.
// The `require("fs")` statement imports the file system module.
// `readFileSync()` reads the entire content of the specified file synchronously.
// The encoding "utf8" ensures the input is read as a string.
// Finally, the `Main` function is called with the read content.
Main   (   require (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;
// ----------------------------------------------------------------------------------------------------