/* This program is designed to read two integer numbers from standard input,
 * calculate their Greatest Common Divisor (GCD) using the Euclidean algorithm,
 * and then output the result to the console.
 * It demonstrates basic file I/O operations and a common mathematical function.
 */

// Configuration object to hold various settings for the program.
const   config    =   {

    /*
     * The input source. In competitive programming contexts,
     * '/dev/stdin' is typically used to read from the standard input stream.
     */
    input  :   '/dev/stdin' ,


    // The character sequence that denotes a new line in the input stream.
    newline:   '\n'         /* Standard Unix-style newline character */
} ;


// --- Input Reading and Processing ---

/**
 * Reads data from the specified input source, decodes it as UTF-8,
 * and then splits the entire content into an array of strings based on the newline character.
 * The 'fs' module is used for file system operations.
 */
const   line    =   require ( 'fs' )
    .   readFileSync (   config . input   ,   'utf-8'   )
    .   split (   config . newline   )   ;


/*
 * Function definition for calculating the Greatest Common Divisor (GCD)
 * of two non-negative integers 'a' and 'b' using the Euclidean algorithm.
 * This is an arrow function for conciseness.
 */
const   gcd    =   (   a   ,   b   )   =>
    /*
     * Base case for the recursion: If 'b' is exactly 0,
     * then 'a' is the GCD.
     */
    b    ===    0
        ?   a
        :   /*
             * Recursive step: If 'b' is not 0, the GCD of 'a' and 'b'
             * is the same as the GCD of 'b' and the remainder of 'a' divided by 'b' (a % b).
             */
        gcd (   b   ,   a   %   b   )   ;


// --- Main Execution Block: Calculate and Output Result ---

// The `console.log` function is used to print the final result to standard output.
console .   log (
    // Call the GCD function with the parsed numbers.
    gcd (
        /*
         * The spread operator (...) is used here to pass elements of an array
         * as individual arguments to the `gcd` function.
         */
        ...   line [   0   ]                                  // Take the first line of input.
            .   split (   ' '   )                               // Split the line by spaces to get individual number strings.
            .   map (   x   =>   parseInt (   x   )   )         // Convert each string to an integer.
    )
)   ;

// End of the JavaScript program.