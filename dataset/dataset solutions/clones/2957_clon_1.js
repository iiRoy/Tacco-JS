/*
 * This JavaScript code snippet reads two integer values, N and K,
 * from standard input. It then computes a specific sum based on these values.
 * The calculation involves an outer loop from 1 to N, and an inner while loop
 * that doubles a value 'x' until it reaches or exceeds K.
 * Finally, it prints the calculated sum to the console.
 */


// Require the built-in 'fs' (file system) module to read input.
input   =   require( 'fs' )   .   readFileSync(
    '/dev/stdin'    ,   // Specifies the standard input file path
    'utf8'              // Specifies the character encoding for reading the file
)   ; // End of input reading operation.


// Split the entire input string by newline characters to get an array of lines.
lines   =   input   .   split( '\n' )   ;


// Get the first line from the array, remove it, and then split it by spaces.
// This line is expected to contain the N and K values.
line    =   lines   .   shift()   .   split( ' ' )   ;


// Convert the first element of the 'line' array to a number and assign it to N.
// The '* 1' is a common idiom to explicitly convert string to number.
N       =   line[0]   *   1   ;


// Convert the second element of the 'line' array to a number and assign it to K.
K       =   line[1]   *   1   ;


// Initialize the 'sum' variable to zero. This variable will accumulate the results.
sum     =   0   ;


// Start the main loop, iterating from i = 1 up to N (inclusive).
for (   i   =   1   ;   i   <=   N   ;   i++   )
{
    // Initialize 'x' with the current value of the loop counter 'i'.
    x   =   i   ;

    // Initialize 'c' to zero. This counter will track how many times 'x' is doubled.
    c   =   0   ;

    // Enter an inner while loop that continues as long as 'x' is less than K.
    while   (   x   <   K   )
    {
        // Double the value of 'x'.
        x   =   x   *   2   ;
        // Increment the counter 'c'.
        c++   ;
    }

    // Add a term to the 'sum'.
    // The term is (1 / N) multiplied by (1 / 2 raised to the power of 'c').
    sum   +=   (   1   /   N   )   *   (   1   /   Math   .   pow(   2   ,   c   )   )   ;
} // End of the for loop.


// Print the final calculated 'sum' to the console.
console   .   log(   sum   )   ;