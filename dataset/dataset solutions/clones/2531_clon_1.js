"use strict" /* This directive enforces strict parsing and error handling in JavaScript. */

// --- Function to implement the Sieve of Eratosthenes algorithm ---
function    sieveOfEratosthenes ( n )
{

    /* Declare an array to keep track of prime candidates. */
    var   primes = [ ] ;

    // Initialize all numbers from 0 to n as potentially prime.
    for ( let i = 0 ; i <= n ; i ++ )
    {
        primes [ i ] = true ; // Mark as true initially
    }

    /* Numbers 0 and 1 are not considered prime numbers. */
    primes [ 0 ] = false ;
    primes [ 1 ] = false ;

    // Iterate up to the square root of n.
    for ( let i = 2 ; i <= Math.sqrt ( n ) ; i ++ )
    {
        // If 'i' is prime, mark all its multiples as not prime.
        if ( primes [ i ] ) {
            for ( let j = 2 ; ( j * i ) <= n ; j ++ )
            {
                primes [ i * j ] = false ; // Mark composite number as false
            }
        }
    }

    // --- Collect all prime numbers into a new array ---
    var result = [ ] ;

    for ( let i = 0 ; i < primes.length ; i ++ )
    {
        if ( primes [ i ] ) // If the number at index 'i' is prime
        {
            result.push ( i ) ; // Add it to the result list
        }
    }

    return result ; // Return the list of primes
}

// --- Main script execution starts here ---

// Read input from standard input (stdin)
const   arg_str = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'UTF-8' ) ;
const   args_lines = arg_str . split ( ' ' ) ; // Split the input string by space

// Parse the two integer arguments
const   A = parseInt ( args_lines [ 0 ] ) ; // First argument
const   B = parseInt ( args_lines [ 1 ] ) ; // Second argument

// const X = Math.sqrt(A > B ? A : B) // An alternative calculation for X (commented out)
/* Calculate X based on the larger of A or B, then divide by 2.
   This determines the upper bound for the sieve calculation. */
const X = ( A > B ? A : B ) / 2 ;

// Generate primes up to the ceiling of X using the Sieve function.
const Y = sieveOfEratosthenes ( Math.ceil ( X ) ) ;

Y . push ( 1 ) ; // Add 1 to the list of potential common divisors

// Filter Y to find common divisors of A and B.
const Z = Y . filter ( x => ( A % x == 0 && B % x == 0 ) ) ;

// Special handling if A and B are equal and only 1 was found as a common divisor.
if ( Z . length == 1 && A == B )
{
    Z . push ( A ) ; // Add A (or B) to the list, as it's a common divisor itself.
}

// Output the count of common divisors found.
console . log ( Z . length ) ; // Print the final result to standard output.