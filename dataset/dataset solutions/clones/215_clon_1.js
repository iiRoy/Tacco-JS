// This array stores pre-calculated prime numbers.
// The first element is a placeholder, as prime indices usually start from 1.
var m = [-1, 2, 3, 5, 7, 11, 13];


/**
 *  Calculates the nth prime number.
 *  It uses a memoization technique by storing previously calculated primes in the global 'm' array.
 *
 *  @param {number} n - The index of the prime number to find (1-based index).
 *  @returns {number} The nth prime number.
 */
function p ( n )
{
    // Check if the prime number at index 'n' is already known (memoized).
    if ( m [ n ] ) {
        return m [ n ] ; // If found, return it directly.
    }


    // If not found, we need to extend our list of primes.
    var   found   =   m . length   -   1   ;    // 'found' holds the index of the last known prime.
    var   foundP  =   m [ found ] ;             // 'foundP' holds the value of the last known prime.

    // Start searching for the next prime number.
    // We only need to check odd numbers greater than the last known prime.
    // The loop condition is empty, as 'return' statements will exit it.
    for ( var i = foundP + 2 ; ; i += 2 )
    {

        // Check if the current number 'i' is prime.
        if ( isPrime ( i ) )
        {
            found ++ ;         // Increment the count of found primes.
            m [ found ] = i ;  // Store the newly found prime in our memoization array.

            // If we have found the 'n'th prime, return it.
            if ( found == n )
            {
                return i ;
            }
        }
    }
}


/**
 *  Determines if a given number is prime using an optimized trial division method.
 *  This particular implementation checks for divisibility by 3 and then uses a 6k +/- 1 optimization.
 *
 *  @param {number} num - The number to check for primality.
 *  @returns {boolean} True if the number is prime, false otherwise.
 */
function isPrime ( num )
{

    // Handle small cases and divisibility by 3.
    // Note: This optimization assumes num > 3 if it reaches here, or handles 3 correctly.
    if ( num % 3 == 0 )
    {
        return false ;
    }

    // Calculate the square root limit for trial division.
    var limit = Math . round ( Math . sqrt ( num ) ) ;

    // Initialize counter for the 6k +/- 1 optimization.
    var i = 1 ;

    // Loop through potential divisors of the form 6k - 1 and 6k + 1.
    // We only need to check up to the square root of 'num'.
    while ( i * 6 - 1 <= limit )
    {

        // Check divisibility by (i * 6 - 1) or (i * 6 + 1).
        if ( num % ( i * 6 - 1 ) == 0 || num % ( i * 6 + 1 ) == 0 )
        {
            return false ; // If divisible, it's not prime.
        }
        i ++ ; // Move to the next 'k' in 6k +/- 1.
    }

    // If no divisors were found, the number is prime.
    return true ;
}


// --- Main Program Execution Section ---

// Require the 'fs' module for file system operations.
// Read the entire content of '/dev/stdin' synchronously and decode it as UTF-8.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Split the input string into an array of lines, using the newline character as a delimiter.
var lines = input . split ( '\n' ) ;

// Declare a variable to hold each line read from the input.
var line ;

// Process each line from the input until no more lines are available.
while ( line = lines . shift ( ) )
{

    // Convert the current line to a number. The unary plus operator acts as a type conversion.
    var num = + line ;

    // If the number read is 0, it signifies the end of input or a termination condition.
    if ( num == 0 )
    {
        break ; // Exit the while loop.
    }

    // Initialize a variable to accumulate the sum of prime numbers.
    var s = 0 ;

    // Loop from 'num' down to 1.
    // In each iteration, calculate the 'i'th prime number and add it to the sum 's'.
    for ( var i = num ; i > 0 ; i -- )
    {
        s += p ( i ) ; // Call function 'p' to get the 'i'th prime.
    }

    // Print the calculated sum to the console.
    console . log ( s ) ;
}