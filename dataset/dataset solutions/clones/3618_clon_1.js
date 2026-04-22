/* This file contains a simple JavaScript program.
 * It reads two integers from standard input, performs a modulo operation,
 * and then prints a result to standard output.
 *
 * This implementation is designed to run in a Node.js environment.
 */
function   Main   (   input   )
{
    // The 'input' parameter is expected to be an array of strings,
    // where each element represents a line from the input stream.
    // We are interested in the very first line of input.
    tmp   =   input   [   0   ]   .   split   (   " "   )   ;

    // Extract the first number from the 'tmp' array.
    var   n   =   parseInt   (   tmp   [   0   ]   ,   10   )   ;
    // Extract the second number from the 'tmp' array.
    var   k   =   parseInt   (   tmp   [   1   ]   ,   10   )   ;

    // Declare a variable to hold the computed answer.
    var   ans   ;

    // Initialize the answer with a default value.
    ans   =   1   ;

    // Perform a conditional check: if n is perfectly divisible by k.
    if   (   n   %   k   ==   0   )
    {
        // If n is a multiple of k, set the answer to 0.
        ans   =   0   ;
    }

    // Output the final integer answer to the console.
    console   .   log   (   '%d'   ,   ans   )   ;
}


// This part of the code handles the execution context.
// It reads the entire standard input as a UTF-8 string
// and then passes it to the Main function.
Main   (   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )   )   ;