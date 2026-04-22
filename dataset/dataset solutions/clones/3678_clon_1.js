// This is a Type I clone of the original JavaScript code.
// No logical changes have been made; only whitespace and comments are modified.
// This version aims for visual dissimilarity while maintaining exact functional equivalence.

/**
 * Main function to process input and determine an operation based on two numbers.
 *
 * @param   {string}   s   -   The input string, expected to contain two space-separated numbers.
 */
function     Main  (    s    )
{
    // Step 1: Parse the input string.
    // Split the string by space and convert each resulting part into a number.
    s   =   s   .   split (   " "   )
        .   map (   a   =>   +a   )   ;


    // Step 2: Initialize the answer variable.
    // Default value is 'x', indicating no specific operation matches the criteria.
    var   ans   =   "x"   ;


    // Step 3: Check for the first condition: sum equals 15.
    if  (   s[0]   +   s[1]   ===   15   )
    {
        ans   =   "+"   ; // If the sum is 15, the operation is addition.
    }


    // Step 4: Check for the second condition: product equals 15.
    // This check runs regardless of the first condition, potentially overwriting 'ans'.
    if  (   s[0]   *   s[1]   ===   15   )
    {
        ans   =   "*"   ; // If the product is 15, the operation is multiplication.
    }


    // Step 5: Output the result.
    // Print the determined operation symbol (or 'x' if neither condition was met).
    console   .   log   (   ans   )   ;
}


// Invoke the Main function with input read from standard input.
// This line uses Node.js's 'fs' module to synchronously read data from '/dev/stdin'.
Main  (
    require (   "fs"   )
        .   readFileSync (   "/dev/stdin"   ,   "utf8"   )
)   ;