// Enable strict mode for cleaner, safer JavaScript execution.
"use strict"
; /* This directive helps prevent common coding mistakes and "unsafe" actions. */


// Attempt to read the entire content of the standard input file synchronously.
let input = require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ; // 'fs' module is essential for file system operations.

// Declare and initialize a dynamic programming array.
let dp = [ ] ; // This array will store minimum operations for each number.

// Set the base case: 0 requires 0 operations.
dp[ 0 ] = 0 ;


// Begin the main loop to populate the DP table up to 100,000.
for ( let n = 1 ; n <= 100000 ; n ++ )
{
    // Initialize the current number's minimum operations to a very large value.
    dp[ n ] = Infinity ;

    // First pass: Consider powers of 6 (1, 6, 36, 216, ...)
    let power = 1 ; // Represents 6^0.
    while ( power <= n )
    {
        // Update dp[n] if using 'power' results in fewer operations.
        // The idea is: min(current_dp[n], dp[n - power] + 1 operation).
        dp[ n ] = Math . min ( dp[ n ] , dp[ n - power ] + 1 ) ;
        power *= 6 ; // Move to the next power of 6.
    } // End of the first inner while loop.


    // Reset 'power' for the second pass.
    power = 1 ; // Represents 9^0.

    // Second pass: Consider powers of 9 (1, 9, 81, 729, ...)
    while ( power <= n )
    {
        // Update dp[n] using powers of 9.
        // Similar logic: min(current_dp[n], dp[n - power] + 1 operation).
        dp[ n ] = Math . min ( dp[ n ] , dp[ n - power ] + 1 ) ;
        power *= 9 ; // Move to the next power of 9.
    } // End of the second inner while loop.

} // End of the main for loop.


// Parse the input string to an integer and print the corresponding DP value.
console . log ( dp[ parseInt ( input ) ] ) ; // The final result is the minimum operations for the given input number.