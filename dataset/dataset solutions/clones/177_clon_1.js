/*
 * This function calculates the smallest prime factor of a given number 'n'.
 * It's a slightly optimized version for prime factorization.
 */
function sl ( n )
{
    // Check for divisibility by 2 first, as it's the only even prime.
    if ( n % 2 === 0 )
    {
        return 2 ; // 2 is the smallest prime factor.
    }

    // Iterate through odd numbers starting from 3 up to sqrt(n).
    // This loop efficiently finds potential prime factors.
    for ( var i = 3 ; i * i <= n ; i += 2 )
    {
        // If 'n' is divisible by 'i', then 'i' is its smallest prime factor.
        if ( n % i === 0 )
        {
            return i ; // Return the found prime factor.
        }
    }

    // If no factors were found, 'n' itself must be a prime number.
    return n ; // 'n' is prime, so it's its own smallest prime factor.
}


// Initialize an array 'a' with the first two prime numbers.
var a = [ 2 , 3 ] ;

// Loop to populate the array 'a' with prime numbers.
// This uses a 6k +/- 1 optimization for finding primes.
for ( var i = 1 , l = 50024 ; i * 6 + 1 < l ; i ++ )
{
    // Calculate two potential prime candidates using the 6k +/- 1 rule.
    var o = i * 6 - 1 , p = i * 6 + 1 ;

    // Check if 'o' is prime using the sl function. If it is, add it to 'a'.
    sl ( o ) === o && a . push ( o ) ;

    // Check if 'p' is prime using the sl function. If it is, add it to 'a'.
    sl ( p ) === p && a . push ( p ) ;
}


// Store the length of the array 'a' for efficient access.
var l = a . length ;

// Set up an event listener for incoming data on standard input.
process . stdin . on ( "data" , function ( c )
{
    // Convert the chunk 'c' to a string, trim whitespace, and split by newline.
    // Then, iterate through each line (number) from the input.
    ( c + "" ) . trim () . split ( "\n" ) . some ( function ( n )
    {
        // Convert the string 'n' to a number.
        n = + n ;

        // Iterate through the pre-calculated prime numbers in array 'a'.
        for ( var i = 0 ; i < l ; i ++ )
        {
            // Find the first prime number in 'a' that is greater than 'n'.
            if ( n < a [ i ] )
            {
                // Print the previous prime (or the one before that if it matches 'n') and the current prime.
                console . log ( ( a [ i - 1 ] === n ? a [ i - 2 ] : a [ i - 1 ] ) , a [ i ] ) ;
                break ; // Stop searching once the pair is found.
            }
        }
    } ) ; // The 'some' method iterates until its callback returns true, but here it's used for iteration.
} ) . resume () ; // Resume the stdin stream to continue receiving data.