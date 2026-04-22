/* This function calculates all prime numbers up to a given maximum value
 * using the Sieve of Eratosthenes algorithm.
 * It returns an array of prime numbers.
 */
function prime ( max )
{
    // Initialize an array to store numbers up to 'max'.
    // Initially, all numbers are considered potential primes.
    var arr = [] ;

    // Populate the array with numbers from 0 to max.
    for ( var i = 0 ; i <= max ; i++ )
    {
        arr[i] = i ;
    }

    // Mark 0 and 1 as not prime numbers.
    arr[0] = false ;
    arr[1] = false ;

    // Calculate the integer part of the square root of max.
    // This is used as the upper limit for the outer loop in the sieve.
    var sqrt = Math.floor( Math.sqrt( max ) ) ;


    // Main Sieve of Eratosthenes process.
    // Iterate from the first prime number, 2, up to the square root of max.
    for ( var i = 2 ; i <= sqrt ; i++ )
    {
        // If arr[i] is false, it means 'i' has already been marked as a multiple
        // of a smaller prime, so it's not prime itself. Skip its multiples.
        if ( arr[i] == false )
        {
            continue ;
        }

        // If 'i' is prime, mark all its multiples (starting from i+i) as not prime.
        // We start from i+i because smaller multiples would have already been handled
        // by previous prime numbers.
        for ( var j = i + i ; j <= max ; j += i )
        {
            arr[j] = false ; // Mark as not prime.
        }
    }

    // Collect the prime numbers from the processed array into a new result array.
    var result = [] ;

    // Iterate through the array to find all numbers that were not marked false.
    for ( var i = 0 ; i <= max ; i++ )
    {
        // If arr[i] is not false, it means 'i' is a prime number.
        if ( arr[i] !== false )
        {
            result.push( arr[i] ) ; // Add the prime to the result list.
        }
    }

    // Return the array containing all prime numbers up to 'max'.
    return result ;
}


// Generate a list of prime numbers up to 50,000 once.
// This list will be used for subsequent calculations.
var p = prime( 50000 ) ;


// Read input from standard input.
// This assumes the input is provided via a file or pipe at '/dev/stdin'.
var input = require( 'fs' ).readFileSync( '/dev/stdin' , 'utf8' ) ;


// Process the input:
// 1. Remove leading/trailing whitespace.
// 2. Split the string into an array of strings by newline characters.
// 3. Convert each string element in the array to a number.
var Arr = ( input.trim() ).split( "\n" ).map( Number ) ;


// Main loop to process each query from the input array.
// The loop continues indefinitely until a specific termination condition is met.
while ( true )
{
    // Get the next number from the beginning of the 'Arr' array.
    // Arr.shift() removes the first element and returns it.
    var n = Arr.shift() ;

    // Check if the current query number 'n' is 0.
    // A value of 0 signifies the end of input queries.
    if ( n == 0 )
    {
        break ; // Exit the while loop.
    }

    // Initialize an empty object to store unique pairs of primes that sum to 'n'.
    // This object acts as a hash set to prevent counting (a,b) and (b,a) as distinct pairs.
    var obj = {} ;

    // Iterate through the pre-calculated list of prime numbers 'p'.
    // This is the outer loop for finding the first prime in a pair.
    for ( var i = 0 ; i < p.length ; i++ )
    {
        // Optimization: If the current prime p[i] is already greater than or equal to 'n',
        // then no combination with p[j] (where p[j] is positive) can sum up to 'n'.
        // Since 'p' is sorted, we can break out of this loop.
        if ( p[i] >= n )
        {
            break ;
        }

        // Inner loop: Iterate through the prime list again to find the second prime in a pair.
        for ( var j = 0 ; j < p.length ; j++ )
        {
            // Optimization: If the current prime p[j] is already greater than or equal to 'n',
            // it cannot be part of a sum equal to 'n' (with p[i] also positive).
            // We can skip to the next p[j].
            if ( p[j] >= n )
            {
                continue ;
            }

            // Check two conditions:
            // 1. If the sum of the two primes (p[i] + p[j]) is exactly equal to 'n'.
            // 2. If this specific pair (represented by the concatenated string p[j]+""+p[i])
            //    has not already been added to our 'obj' (to avoid duplicates like (3,7) and (7,3)).
            if ( p[i] + p[j] == n && obj.hasOwnProperty( p[j] + "" + p[i] ) == false )
            {
                // If both conditions are met, add this unique pair to our object.
                // The key is formed by concatenating the smaller prime first, then the larger,
                // to ensure (3,7) and (7,3) map to the same key if p[i] and p[j] are swapped.
                // Assigning 'true' is just a placeholder value.
                obj[ p[i] + "" + p[j] ] = true ;
            }
        }
    }

    // After checking all prime pairs for the current 'n',
    // print the total count of unique pairs found.
    // Object.keys(obj) returns an array of all keys in 'obj', and .length gives the count.
    console.log( Object.keys( obj ).length ) ;
}