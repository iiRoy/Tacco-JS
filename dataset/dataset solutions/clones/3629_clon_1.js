// This script is designed to process input data for a specific algorithmic problem.
// It leverages the 'readline' module from Node.js to manage standard input and output streams.

var lines = [ ] ; // This array will store each line read from standard input.
var result = 0 ; // A variable initialized to zero, though not explicitly used in this particular solution's final output.

// Import the 'readline' module to enable line-by-line input processing.
var readline = require('readline') ;

// Create an interface for reading input line by line.
var rl = readline.createInterface(
    {
        input: process.stdin,  // Specifies standard input as the source.
        output: process.stdout // Specifies standard output as the destination (though not directly used for output in this setup).
    }
) ;

// --- Event Listener for 'line' events ---
// This function is called every time a new line of input is received.
rl.on(
    'line',
    function ( x )
    {
        lines.push( x ) ; // Appends the received line (x) to the 'lines' array.
    }
) ;

// --- Event Listener for 'close' event ---
// This function is executed once the input stream has ended (e.g., EOF is received).
rl.on(
    'close',
    function ( )
    {
        // Parse the first line of input to get N and M.
        // N is the number of elements in array A, M is the divisor for modulo operations.
        var N = n( lines[ 0 ] , 0 ) ; // Extract the first number from the first line.
        var M = n( lines[ 0 ] , 1 ) ; // Extract the second number from the first line.

        // Parse the second line of input to get array A.
        var A = lines[ 1 ]
                    .split( " " ) // Splits the string by spaces into an array of string numbers.
                    .map( value => Number( value ) ) ; // Converts each string number to an actual number.

        // Initialize the prefix sum array.
        var sum = [ ] ;
        sum[ 0 ] = 0 ; // The prefix sum before any elements is zero.

        // --- Calculate Prefix Sums (Modulo M) ---
        // This loop computes the cumulative sum of elements in A,
        // taking the modulo M at each step.
        // The property exploited here is: if (sum[j] - sum[i]) % M == 0,
        // then sum[j] % M == sum[i] % M.
        // This helps in efficiently finding subarrays whose sum is divisible by M.
        for ( var i = 0 ; i < N ; i++ )
        {
            sum[ i + 1 ] = ( sum[ i ] + A[ i ] ) % M ;
        }

        // Initialize variables for counting the desired subarrays.
        var ans = 0 ; // Stores the final count of subarrays whose sum is divisible by M.
        var counter = { } ; // A hash map (object) to store the frequency of each (prefix_sum % M) value.

        // --- Count Subarrays with Sum Divisible by M ---
        // Iterate through the calculated prefix sums modulo M.
        // For each `sum[i]`, we check how many times this specific remainder has appeared before.
        // Each previous occurrence `sum[j]` (where `j < i`) with `sum[j] % M == sum[i] % M`
        // indicates a subarray `A[j...i-1]` whose sum is divisible by M.
        for ( var i = 0 ; i < sum.length ; i++ )
        {
            // If the current remainder `sum[i]` has not been encountered yet,
            // initialize its count in the 'counter' map to 0.
            if ( counter[ sum[ i ] ] === undefined )
            {
                counter[ sum[ i ] ] = 0 ;
            }

            // Add the current count of `sum[i]` (how many times it appeared before this iteration)
            // to the total answer. This represents the number of new valid subarrays found.
            ans += counter[ sum[ i ] ] ;

            // Increment the count for the current remainder `sum[i]` in the 'counter' map,
            // as we have now observed it one more time.
            counter[ sum[ i ] ]++ ;
        }

        // Output the final calculated answer to standard output.
        console.log( ans ) ;
    }
) ;

/**
 * Helper function to parse a specific number from a space-separated string.
 * @param {string} s - The input string (e.g., "10 5").
 * @param {number} n - The zero-based index of the number to extract from the split string.
 * @returns {number} The parsed number at the specified index.
 */
function n( s , n )
{
    return ( Number( s.split( " " )[ n ] ) ) ; // Splits the string, accesses the element at index 'n', and converts it to a number.
}