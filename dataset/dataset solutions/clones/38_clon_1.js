// This function implements the Sieve of Eratosthenes algorithm
// to find all prime numbers up to a given maximum value.
function prime ( max )
{

    // Initialize an array to store numbers from 0 to max.
    var arr = [ ] ;

    // Populate the array with numbers.
    // The index represents the number itself.
    for ( var i = 0 ; i <= max ; i ++ ) arr [ i ] = i ;

    // Mark 0 and 1 as not prime.
    arr [ 0 ] = false ;
    arr [ 1 ] = false ;

    // Calculate the square root of max for optimization.
    var sqrt = Math.floor ( Math.sqrt ( max ) ) ;

    // Main loop for the Sieve algorithm.
    // Iterate from 2 up to the square root of max.
    for ( var i = 2 ; i <= sqrt ; i ++ ) {

        // If arr[i] is already marked as false, it's not prime, so skip it.
        if ( arr [ i ] == false ) continue ;

        // If arr[i] is prime, mark all its multiples as not prime.
        // The loop starts from 2*i because smaller multiples would have
        // already been marked by smaller prime factors.
        for ( var j = i + i ; j <= max ; j += i ) {
            arr [ j ] = false ; // Mark as not prime
        }

    } // End of outer loop

    // Collect all prime numbers into a new result array.
    var result = [ ] ;

    // Iterate through the processed array.
    for ( var i = 0 ; i <= max ; i ++ ) {
        // If the element is not false, it's a prime number.
        if ( arr [ i ] !== false ) result.push ( arr [ i ] ) ;
    }

    // Return the array of prime numbers.
    return result ;

} // End of prime function

// Generate prime numbers up to 999,999 using the prime function.
var p = prime ( 999999 ) ;


// This section handles input/output operations.
// It reads numbers from standard input and processes them.
var input = require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ;

// Process the input string: trim whitespace, split by newlines, and convert to numbers.
var Arr = ( input.trim ( ) ) . split ( "\n" ) . map ( Number ) ;


// Iterate through each number provided in the input array.
for ( var i = 0 ; i < Arr.length ; i ++ ) {

    // Get the current number from the input.
    var a = Arr [ i ] ;

    // Find the count of prime numbers less than or equal to 'a'.
    // This is done by iterating through the pre-computed primes 'p'.
    for ( var j = 0 ; j < p.length ; j ++ ) {
        // If a prime number is greater than 'a', we've passed the limit.
        if ( p [ j ] > a ) break ;
    }

    // Output the count (which is 'j' at this point, as it represents the number of primes found).
    console.log ( j ) ;

} // End of processing input array loop