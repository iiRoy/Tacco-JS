/*
 * This script is configured to run in strict mode,
 * which helps catch common coding errors and "unsafe" actions.
 */
'use strict' ;


// Define a concise logging utility function.
const   p   =   s   =>   console.log( s )   ;


// The following lines are commented out in the original source,
// and are retained here as such, along with a descriptive comment.
// let a,b,c,d;
// [a,b,c,d] = input[0].trim().split(" ").map(i => parseInt(i));


/**
 * The primary function responsible for processing the input data.
 * It checks for divisibility within a specified numerical range.
 *
 * @param {string[]} input   An array where the first element contains 'K'
 *                           and the second element contains 'A' and 'B'.
 */
function   main   (   input   )
{
    // Extract the divisor 'K' from the first line of the input.
    let   K   =   input[0] . split(" ") [0]   ;

    // Declare variables 'A' and 'B' for the start and end of the range.
    let   A   ,   B   ;

    // Parse the integer values for 'A' and 'B' from the second line.
    [   A   ,   B   ]   =   input[1] . split(" ") . map   (   i   =>   parseInt(i)   )   ;

    // Initialize a boolean flag to track if a divisible number is found.
    let   flag   =   false   ;


    // Iterate through each number within the inclusive range [A, B].
    for   (   let   i   =   A   ;   i   <   B   +   1   ;   i++   )
    {
        // Check if the current number 'i' is perfectly divisible by 'K'.
        // The modulo operator (%) returns the remainder of the division.
        // Math.floor ensures integer comparison.
        if   (   Math . floor   (   i   %   K   )   ===   0   )
        {
            // If a divisible number is found, output 'OK'.
            p   (   'OK'   )   ;

            // Set the flag to true to indicate success.
            flag   =   true   ;

            // Terminate the function immediately since the condition is met.
            return   ;
        }
    }


    // After checking all numbers in the range, if no divisible number was found...
    if   (   !   flag   )
    {
        // ...output 'NO'.
        p   (   'NO'   )   ;
    }

} // End of the 'main' function.


// This is the entry point for the script execution.
// It reads input from standard input, cleans it, splits it by newlines,
// and then passes it to the 'main' function for processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   .   trim   (   )   .   split   (   "\n"   )   )   ;