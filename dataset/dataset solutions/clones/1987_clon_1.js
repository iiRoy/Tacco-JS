/*
 * This JavaScript file implements a solution to a problem that involves
 * calculating the sum of Greatest Common Divisors (GCDs) for triplets
 * of numbers within a specified range K.
 *
 * It utilizes a recursive function for binary GCD calculation and
 * an iterative function for multi-argument GCD.
 */


// This constant defines a recursive arrow function named 'gcdb'.
// It computes the Greatest Common Divisor (GCD) of two non-negative integers 'a' and 'b'
// using the Euclidean algorithm.
// The base case is when 'b' is 0, in which case 'a' is the GCD.
// Otherwise, it recursively calls itself with 'b' and the remainder of 'a' divided by 'b'.
const   gcdb    =   (   a   ,   b   )   =>   b   ?   gcdb   (   b   ,   a   %   b   )   :   a
;   // --- End of gcdb function definition ---


/**
 * Function named 'gcd' that calculates the Greatest Common Divisor (GCD)
 * for an arbitrary number of integer arguments.
 * It iteratively applies the 'gcdb' (binary GCD) function.
 *
 * @param   {...number}   args   -   A   variable   list   of   integer   arguments.
 * @returns {number}             -   The   GCD   of   all   provided   arguments.
 */
function    gcd   (   )   {
    // Initialize the result variable 'res' with the first argument.
    let   res   =   arguments   [   0   ]
    ;

    // Loop through the remaining arguments, starting from the second one (index 1).
    for   (   var   i   =   1   ;   i   <   arguments   .   length   ;   i   ++   )   {
        // Update 'res' by calculating the GCD of the current 'res' and the
        // next argument using the 'gcdb' function.
        res   =   gcdb   (   res   ,   arguments   [   i   ]   )
        ;
    }

    // Return the final computed GCD of all arguments.
    return   res
    ;
}   // --- End of gcd function definition ---


// This constant 'input' stores the content read from standard input.
// It uses Node.js's 'fs' module to synchronously read the file at "/dev/stdin"
// and decodes it as a UTF-8 string.
const   input   =   require   (   "fs"   )   .   readFileSync   (   "/dev/stdin"   ,   "utf8"   )
;


// This is an Immediately Invoked Function Expression (IIFE).
// It takes the 'input' string as an argument and executes its logic immediately.
;   (   (   input   )   =>   {

    // Split the input string by newline characters to get an array of lines.
    const   lines   =   input   .   split   (   '\n'   )
    ;

    // Extract the first line, which is expected to contain the integer 'K'.
    // The '- 0' operation is used to explicitly convert the string to a number.
    const   K   =   lines   [   0   ]   -   0
    ;

    // Initialize the 'ans' variable, which will accumulate the sum of GCDs.
    let   ans   =   0
    ;

    // Start of the triple nested loop.
    // This loop iterates through all possible integer combinations (i, j, k)
    // where each variable ranges from 1 to K (inclusive).
    for   (   let   i   =   1   ;   i   <=   K   ;   i   ++   )   {
        for   (   let   j   = 1   ;   j   <=   K   ;   j   ++   )   {
            for   (   let   k   = 1   ;   k   <=   K   ;   k   ++   )   {
                // For each triplet (i, j, k), calculate their GCD using the 'gcd' function
                // and add the result to the 'ans' accumulator.
                ans   +=   gcd   (   i   ,   j   ,   k   )
                ;
            }   // --- End of inner loop (k) ---
        }   // --- End of middle loop (j) ---
    }   // --- End of outer loop (i) ---


    // Finally, print the accumulated sum of GCDs to the console.
    console   .   log   (   ans   )
    ;

}   )   (   input   )
;   // --- End of IIFE ---