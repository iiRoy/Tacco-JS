/*
 * This JavaScript code defines a function to find prime numbers
 * up to a given maximum value using the Sieve of Eratosthenes algorithm,
 * and then processes an array of numbers based on user input
 * to find the largest prime sum less than or equal to a target 'x'.
 */

// Function to generate prime numbers up to 'max'
function prime( max )
{
    // Initialize an array to mark numbers.
    var arr = [];

    // Populate the array with numbers from 0 to max.
    for ( var i = 0 ; i <= max ; i++ )
        arr[i] = i; // Each number is initially considered a potential prime.

    // 0 and 1 are not prime numbers, so mark them as false.
    arr[0] = false;
    arr[1] = false;

    // Calculate the square root of max, as we only need to iterate up to this point
    // for the Sieve of Eratosthenes.
    var sqrt = Math.floor( Math.sqrt( max ) );

    // Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the square root of max.
    for ( var i = 2 ; i <= sqrt ; i++ )
    {
        // If the current number 'i' is already marked as false (not prime),
        // then skip to the next number.
        if ( arr[i] == false )
            continue; // Move to the next potential prime.

        // If 'i' is prime, mark all its multiples (starting from i*i, but here i+i)
        // as not prime.
        // The inner loop starts from i+i because smaller multiples would have
        // already been marked by smaller prime factors.
        for ( var j = i + i ; j <= max ; j += i )
        {
            arr[j] = false; // Mark multiples as not prime.
        }
    }

    // Create an object to store the prime numbers found.
    // This allows for efficient lookup (O(1) average time complexity).
    var obj = {};

    // Populate the object with prime numbers.
    for ( var i = 0 ; i <= max ; i++ )
    {
        // If the number is not marked as false, it's a prime.
        if ( arr[i] !== false )
            obj[arr[i]] = true; // Add the prime number as a key with a true value.
    }

    // Return the object containing all prime numbers up to 'max'.
    return obj;
}


// Generate a lookup table for prime numbers up to 1,000,000.
// This will be used later to check if a sum is prime.
var p = prime( 1000000 );

// The original input line was commented out; this is a hardcoded example input.
// var input = require('fs').readFileSync('/dev/stdin', 'utf8');
input = '4 15000\n305\n260\n129\n500\n3 400\n10\n20\n30\n3 200909\n5\n9\n12\n0 0\n';

// Process the input string: trim whitespace and split into an array of lines.
var Arr = ( input.trim() ).split( "\n" );


// Main processing loop: continues until '0 0' is encountered.
while ( true )
{
    // Extract the first line, split it by space, and convert parts to numbers.
    // This line contains 'n' (number of elements) and 'x' (target sum).
    var nx = Arr.shift().split( " " ).map( Number );

    var n = nx[0]; // Number of elements in the current set.
    var x = nx[1]; // Target sum.

    // Check for the termination condition: if both n and x are 0, break the loop.
    if ( n == 0 && x == 0 )
        break; // Exit the infinite loop.

    // Initialize a dynamic programming array (dp) to keep track of possible sums.
    // The size is fixed up to 1,000,000, which is the maximum possible sum given constraints.
    var dp = [];
    for ( var i = 0 ; i <= 1000000 ; i++ )
        dp[i] = false; // Initially, no sums are possible.

    // Initialize an array to store the numbers for the current test case.
    var arr = [];

    // Read 'n' numbers from the input array.
    for ( var i = 0 ; i < n ; i++ )
    {
        // Get the number from the input, convert it to a number.
        var v = Arr.shift() - 0;
        arr.push( v ); // Add the number to the current set.
        dp[v] = true; // Mark this number itself as a possible sum.
    }

    // Base case for DP: a sum of 0 is always possible (by choosing no elements).
    dp[0] = true;


    // Dynamic programming approach to find all possible sums.
    // Iterate through all possible sums from 0 up to 1,000,000.
    for ( var i = 0 ; i <= 1000000 ; i++ )
    {
        // For each possible sum 'i', check if it can be formed.
        if ( dp[i] )
        {
            // If sum 'i' is possible, then 'i + arr[j]' is also possible
            // for every number 'arr[j]' in the current set.
            for ( var j = 0 ; j < arr.length ; j++ )
            {
                // Mark the new sum as possible.
                // This builds up all reachable sums.
                dp[ i + arr[j] ] = true;
            }
        }
    }


    // Find the largest prime sum that is less than or equal to 'x'.
    // Iterate downwards from 'x' to 1.
    for ( var i = x ; i > 0 ; i-- )
    {
        // Check two conditions:
        // 1. Is 'i' a possible sum (from our DP array)?
        // 2. Is 'i' a prime number (from our pre-calculated prime lookup table 'p')?
        if ( dp[i] && p.hasOwnProperty(i) )
            break; // If both conditions are met, we found the largest prime sum.
    }

    // Output the result.
    // If 'i' is 0, it means no prime sum was found (loop finished without breaking).
    // Otherwise, 'i' holds the largest prime sum found.
    console.log( ( i == 0 ) ? "NA" : i );
}