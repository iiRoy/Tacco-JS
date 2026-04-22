/*
 * This script reads two numbers from standard input,
 * calculates their common divisors, and then counts
 * how many of those common divisors are prime.
 *
 * Author: Code Clone Generator
 * Date: 2023-10-27
 */

//  Read the entire input from /dev/stdin as a UTF-8 string.
input = require('fs') . readFileSync ( '/dev/stdin' , 'utf8' )

// Split the input string into an array of lines.
lines = input . split ( '\n' )

// Take the first line, split it by spaces, and assign to 'line'.
line = lines . shift ( ) . split ( ' ' )

// Convert the first element of 'line' to a number and assign to 'a'.
a = line [ 0 ] * 1

// Convert the second element of 'line' to a number and assign to 'b'.
b = line [ 1 ] * 1


/**
 * Calculates all divisors of a given number n.
 *
 * @param {number} n - The number for which to find divisors.
 * @returns {Array<number>} An array of divisors, sorted in ascending order.
 */
_dividers = function ( n )
{
    var arr = [ ] ; // Initialize an empty array to store divisors.

    // Loop from 1 up to the square root of n.
    for ( var i = 1 ; i * i <= n ; i ++ )
    {
        // Check if 'i' is a divisor of 'n'.
        if ( n % i === 0 )
        {
            arr . push ( i ) ; // Add 'i' to the divisors array.

            // If 'i' is not the square root of 'n', then 'n / i' is also a divisor.
            if ( i != n / i )
            {
                arr . push ( n / i ) ; // Add the other divisor.
            }
        }
    }

    // Sort the array of divisors in ascending order.
    return arr . sort ( ( a , b ) => a - b ) ;
}


/**
 * Checks if a given number is prime.
 *
 * @param {number} n - The number to check for primality.
 * @returns {boolean} True if the number is prime, false otherwise.
 */
_isPrime = function ( n )
{
    // Numbers less than 2 are not prime.
    if ( n < 2 )
    {
        return false ;
    }

    // Loop from 2 up to the square root of n.
    for ( var i = 2 ; i * i <= n ; i ++ )
    {
        // If 'n' is divisible by 'i', it's not prime.
        if ( n % i === 0 )
        {
            return false ;
        }
    }

    // If no divisors were found, the number is prime.
    return true ;
}


/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the Euclidean algorithm.
 * Note: This function is defined but not actually used in the problem's logic.
 * It might be a leftover or a helper for a different approach.
 *
 * @param {number} m - The first number.
 * @param {number} n - The second number.
 * @param {number} t - A temporary variable (can be undefined initially).
 * @returns {number} The GCD of m and n.
 */
_gcd = function ( m , n , t )
{
	// Continue loop as long as 'm' is not perfectly divisible by 'n'.
	while ( m % n !== 0 )
	{
		t = n ;          // Store current 'n' in 't'.
		n = m % n ;      // Update 'n' to the remainder of 'm' divided by 'n'.
		m = t ;          // Update 'm' to the previous 'n' (stored in 't').
	}

	return n ; // When the loop ends, 'n' holds the GCD.
}


// Get all divisors for number 'a'.
a_div = _dividers ( a )

// Get all divisors for number 'b'.
b_div = _dividers ( b )


// Initialize an empty array to store common divisors.
c = [ ]

// Get the largest divisor of 'a' (last element after sorting).
ca = a_div . pop ( )

// Get the largest divisor of 'b' (last element after sorting).
cb = b_div . pop ( )


/*
 * Iterate through the divisors of 'a' and 'b' from largest to smallest
 * to find their common divisors.
 */
while ( ca != 1 || cb != 1 )
{
    // If the current divisors are equal, they are a common divisor.
    if ( ca == cb )
    {
        c . push ( ca ) ; // Add to the common divisors list.
        ca = a_div . pop ( ) ; // Move to the next largest divisor of 'a'.
        cb = b_div . pop ( ) ; // Move to the next largest divisor of 'b'.
    }
    else
    {
        // If 'ca' is smaller than 'cb', 'ca' cannot be equal to 'cb'
        // or any subsequent larger divisor of 'b'. So, discard 'cb'.
        if ( ca < cb )
        {
            cb = b_div . pop ( ) ;
        }
        else
        {
            // If 'cb' is smaller than 'ca', 'cb' cannot be equal to 'ca'
            // or any subsequent larger divisor of 'a'. So, discard 'ca'.
            ca = a_div . pop ( ) ;
        }
    }
}

// Initialize answer count. The problem implicitly counts 1 as a prime (which is incorrect mathematically)
// or it's simply counting the number of "prime common divisors" plus one for some reason.
// Based on typical competitive programming context, if 1 was a common divisor, it would be added to 'c'
// and then the _isPrime check would correctly return false for 1.
// The initial 'ans = 1' suggests that the number 1 is always counted as one of the "special" common divisors.
ans = 1

// Loop through the collected common divisors.
for ( i = 0 ; i < c . length ; i ++ )
{
    // Check if the current common divisor is prime.
    if ( _isPrime ( c [ i ] ) )
    {
        ans ++ ; // Increment the count if it's prime.
    }
}

// Print the final calculated answer to the console.
console . log ( ans )