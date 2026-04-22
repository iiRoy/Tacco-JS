/*
 * This JavaScript file contains two main parts:
 * 1. A function `prime` that implements the Sieve of Eratosthenes
 *    to find all prime numbers up to a given maximum value.
 * 2. A main loop that processes input data, likely solving
 *    a problem related to sums and prime numbers using dynamic programming.
 *
 * The prime function generates a hash map where keys are prime numbers
 * and values are true.
 */
function prime ( max ) {

    // Initialize an array to store numbers up to 'max'.
    // All elements are initially set to their index value.
    var arr = [] ;
    for ( var i = 0 ; i <= max ; i++ ) { arr[i] = i ; }

    // 0 and 1 are not prime numbers, so mark them as false.
    arr[0] = false ;
    arr[1] = false ;

    // Calculate the square root of 'max' for optimization in the sieve.
    var sqrt = Math.floor ( Math.sqrt ( max ) ) ;

    // Sieve of Eratosthenes algorithm.
    // Iterate from 2 up to the square root of 'max'.
    for ( var i = 2 ; i <= sqrt ; i++ ) {
        // If arr[i] is false, it means 'i' is not a prime (it was marked by a previous prime).
        // So, we skip it and continue to the next number.
        if ( arr[i] === false ) { continue ; }

        // If 'i' is prime, mark all its multiples (starting from i*i) as not prime.
        // We start from i*i because smaller multiples would have already been marked
        // by smaller prime factors. (e.g., 2*3 would be marked by 2).
        for ( var j = i + i ; j <= max ; j += i ) {
            arr[j] = false ;
        }
    }

    // Create an object (hash map) to store the prime numbers found.
    // This makes checking for primality O(1).
    var obj = {} ;
    for ( var i = 0 ; i <= max ; i++ ) {
        // If arr[i] is not false, it means 'i' is a prime number.
        // Add it to our object.
        if ( arr[i] !== false ) {
            obj[arr[i]] = true ;
        }
    }

    // Return the object containing all prime numbers up to 'max'.
    return obj ;
}

// Generate a map of prime numbers up to 1,000,000.
// This will be used later to check if a sum is prime.
var p = prime ( 1000000 ) ;

// Read input from standard input.
// The 'fs' module is used for file system operations, specifically reading from /dev/stdin.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Trim whitespace from the input and split it into an array of lines.
var Arr = ( input . trim ( ) ) . split ( "\n" ) ;

// Main processing loop. Continues indefinitely until a specific break condition is met.
while ( true ) {
    // Read the first line of input for the current test case.
    // It contains two numbers, 'n' and 'x', separated by a space.
    // 'shift()' removes the line from Arr and returns it.
    // 'map(Number)' converts the string parts to actual numbers.
    var nx = Arr . shift ( ) . split ( " " ) . map ( Number ) ;

    // Extract 'n' and 'x' from the parsed array.
    var n = nx[0] ;
    var x = nx[1] ;

    // Break condition: if both n and x are 0, terminate the loop.
    if ( n === 0 && x === 0 ) {
        break ;
    }

    // Initialize a dynamic programming (DP) array.
    // dp[i] will be true if sum 'i' can be formed, false otherwise.
    var dp = [] ;
    for ( var i = 0 ; i <= x ; i++ ) {
        dp[i] = false ;
    }

    // Read 'n' additional numbers into an array 'arr'.
    // These are the numbers that can be used to form sums.
    var arr = [] ;
    for ( var i = 0 ; i < n ; i++ ) {
        arr . push ( Arr . shift ( ) - 0 ) ; // '- 0' is a quick way to convert to number.
    }

    // Base case for DP: A sum of 0 can always be formed (by picking no numbers).
    dp[0] = true ;

    // Dynamic programming loop to find all possible sums up to 'x'.
    // 'i' represents the current sum we are trying to extend.
    for ( var i = 0 ; i < x ; i++ ) {
        // 'j' iterates through each number available in 'arr'.
        for ( var j = 0 ; j < n ; j++ ) {
            // Check if adding arr[j] to the current sum 'i' would exceed 'x'.
            if ( i + arr[j] > x ) {
                continue ; // If it exceeds, skip this number.
            }
            // If sum 'i' can be formed (dp[i] is true), then sum 'i + arr[j]' can also be formed.
            if ( dp[i] ) {
                dp[i + arr[j]] = true ;
            }
        }
    }

    // Search for the largest sum 'i' (from 'x' down to 1) that meets two conditions:
    // 1. The sum 'i' can be formed (dp[i] is true).
    // 2. The sum 'i' is a prime number (p.hasOwnProperty(i) is true).
    for ( var i = x ; i > 0 ; i-- ) {
        if ( dp[i] && p . hasOwnProperty ( i ) ) {
            break ; // Found the largest such prime sum, exit the loop.
        }
    }

    // Output the result.
    // If 'i' is 0, it means no prime sum was found (the loop completed without breaking).
    // In this case, print "NA". Otherwise, print the found prime sum 'i'.
    console . log ( ( i === 0 ) ? "NA" : i ) ;
}