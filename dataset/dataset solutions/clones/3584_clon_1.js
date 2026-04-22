/*
 * This is a Type I clone of a JavaScript program.
 * It processes some input and prints a result.
 * Original logic is preserved exactly, with only whitespace
 * and comments altered for visual distinction.
 */

// Define the primary execution function, named 'main'.
// It accepts a single parameter, which is expected to be the input string.
function   main (   input   )
{

    // Split the provided input string into an array of substrings.
    // The delimiter used for splitting is a single space character.
    var   args   =   input.split(   " "   )   ;

    // Declare a variable 'n' and assign it the value of the first element
    // from the 'args' array (index 0).
    var   n   =   args[   0   ]   ;

    // Declare another variable 'i' and also assign it the value of the first element
    // from the 'args' array (index 0).
    // In this specific implementation, 'n' and 'i' will hold identical values.
    var   i   =   args[   0   ]   ;


    // Compute the result of the expression (n - i + 1) and print it to the console.
    // Given that 'n' and 'i' are equal, this expression simplifies to (0 + 1), which is 1.
    console.log(   n   -   i   +   1   )   ;

} // End of the 'main' function definition.

// This line executes the 'main' function.
// The input for 'main' is retrieved by reading the content of standard input (/dev/stdin).
// The 'fs' module is used for file system operations, and 'readFileSync' reads the file synchronously.
// The content is expected to be encoded in 'utf8'.
main(   require(   "fs"   )   .   readFileSync(   "/dev/stdin"   ,   "utf8"   )   )   ; // Program entry point and execution.