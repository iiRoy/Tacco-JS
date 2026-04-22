/*
 * This JavaScript code implements a modular exponentiation function,
 * often used in cryptography and number theory.
 * It computes (x^n) % M efficiently using a recursive approach.
 *
 * Parameters:
 *   x: The base number.
 *   n: The exponent.
 *   M: The modulus.
 *
 * The function ensures that intermediate products also stay within the modulo M
 * to prevent potential integer overflows for large numbers.
 */
function   power   (   x   ,   n   ,   M   )
{
    // Initialize a temporary variable 'tmp' with the identity element for multiplication.
    // This variable will store the result of the modular exponentiation.
    var   tmp   =   1   ;

    // The core recursive logic begins here.
    // We only proceed if the exponent 'n' is at least 1.
    // If 'n' is 0, x^0 is 1, which is our initial 'tmp' value.
    if   (   n   >=   1   )
    {
        // Recursive step: Calculate power for n/2.
        // This is a divide-and-conquer strategy.
        tmp   =   power   (   x   ,   n   /   2   ,   M   )   ;

        // Check if the current exponent 'n' is even or odd.
        if   (   n   %   2   ==   0   )
        {
            // If 'n' is even, then x^n = (x^(n/2))^2.
            // We calculate (tmp * tmp) % M to keep the result within the modulo.
            tmp   =   (   tmp   *   tmp   )   %   M   ;
        }
        else
        {
            // If 'n' is odd, then x^n = (x^(n/2))^2 * x.
            // We first calculate (tmp * tmp) % M, and then multiply by 'x' and take modulo M again.
            // This ensures all intermediate products are handled correctly modulo M.
            tmp   =   (   (   (   tmp   *   tmp   )   %   M   )   *   x   )   %   M   ;
        }
    }

    // Return the final calculated modular power.
    return   tmp   ;
}


// --- Main Program Execution ---

// This section handles reading input, parsing it, and calling the power function.

// Use Node.js 'fs' module to synchronously read the entire content
// of '/dev/stdin' (standard input) as a UTF-8 encoded string.
var   input   =   require   (   'fs'   )   .   readFileSync   (   '/dev/stdin'   ,   'utf8'   )   ;

// Process the input string:
// 1. '.trim()' removes any leading or trailing whitespace (like newlines).
// 2. '.split(" ")' splits the string into an array of substrings using space as a delimiter.
//    Assuming the input numbers are space-separated.
// 3. '.map(Number)' converts each string in the array to its numerical equivalent.
//    The resulting 'arr' will contain the numerical values from the input.
var   arr   =   input   .   trim   (   )   .   split   (   " "   )   .   map   (   Number   )   ;

// Call the 'power' function with the parsed input values.
// arr[0] is the base 'x'.
// arr[1] is the exponent 'n'.
// 1000000007 is the fixed modulus 'M' for this specific problem.
// The result is then printed to the console (standard output).
console   .   log   (   power   (   arr   [   0   ]   ,   arr   [   1   ]   ,   1000000007   )   )   ;