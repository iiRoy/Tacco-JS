/*
 * This JavaScript file contains a single main function
 * that processes numerical input.
 *
 * The purpose is to demonstrate a Type I code clone,
 * where only whitespace and comments are altered.
 */

// Define the primary function that orchestrates the logic.
// It accepts a single argument, typically a string from input.
function   main   (   arg   )
{
        // First, we parse the input string.
        // It's expected to contain two numbers separated by a space.
        // Any newline characters (CRLF or LF) are removed first.
        const   [   _n   ,   _k   ]    =    arg   .   replace   (   / \r? \n /g   ,   ""   )   .   split   (   " "   )   ;

        // Convert the string representation of the first number to an actual Number type.
        const   n   =   Number   (   _n   )   ;

        // Convert the string representation of the second number to an actual Number type.
        const   k   =   Number   (   _k   )   ;

        // Now, we evaluate a specific mathematical condition.
        // The condition checks if 'n + 1 - (k * 2)' is greater than or equal to zero.
        if    (    n    +    1    -    (    k    *    2    )    >=    0    )
        {
                // If the condition holds true, output "YES" to the standard console.
                console   .   log   (   "YES"   )   ;
        }
        else
        {
                // Otherwise, if the condition is false, output "NO" to the standard console.
                console   .   log   (   "NO"   )   ;
        }

} // End of the main function definition.


// This is the entry point for the script execution.
// It reads the entire content of standard input as a UTF-8 string,
// and then passes it to the 'main' function for processing.
main   (   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   )   ;

// The program concludes after the main function has executed.
// No further operations are performed.