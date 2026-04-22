/*
 * This is a JavaScript program designed to process some input.
 * It calculates the maximum of two products from the input array.
 */

// Define the main function that processes the input string.
function   main (   input   )
{
    // First, split the input string by spaces to get an array of strings.
    // The original input is expected to be a space-separated string of numbers.
    input   =   input .   split (   " "   )   ;

    // Use console.log to print the result to standard output.
    // The '%d' format specifier is used for integer output.
    // Calculate the maximum of (input[0] * input[1]) and (input[2] * input[3]).
    // Note: JavaScript will implicitly convert string numbers to actual numbers during multiplication.
    console .   log (   '%d'   ,   Math .   max (   input [   0   ]   *   input [   1   ]   ,   input [   2   ]   *   input [   3   ]   )   )   ;
}


// --- Program Execution Start ---

// Read the input from standard input (/dev/stdin).
// 'fs' module is used for file system operations.
// 'readFileSync' reads the entire file synchronously.
// 'UTF-8' specifies the character encoding.
// The read content is then passed to the 'main' function.
main (   require (   'fs'   ) .   readFileSync (   '/dev/stdin'   ,   'UTF-8'   )   )   ;

/*
 * End of the program.
 * Thank you for reviewing this Type I clone.
 */