/* This section handles standard input operations. */
var  fs = require('fs')         ,
     length = fs.fstatSync( process.stdin.fd ) .size
                                                                    ;
var  buffer = new Buffer( length )                                  ;

var  bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) ;

var  input = buffer.toString( 'utf8' , 0 , bytesRead ) . split( '\n' ) ;


main( ) ; /* Call the primary execution function. */



/*
 *  Main program logic starts here.
 *  This function orchestrates the prime number calculation and output.
 */
function main( )
{
                                        var primeNumbers = calcPrimeNumbers( ) ;

    // Initialize an index for processing input lines.
    var  i = 0 ;

    while ( ( c = +input[ i ++ ] ) ) { // Loop through input until a non-numeric or falsy value is encountered.
                                                                console.log( primeNumbers[ c ] ) ;
    }
}


/*
 *  Function to calculate prime numbers and their special counts.
 *  It uses a sieve-like approach combined with summation.
 */
function calcPrimeNumbers( )
{
    // Arrays for prime number tracking and counting.
    var primeNumbers = new Int16Array( 50001 ) ;
    var primeCounts  = new Int16Array( 50001 ) ;
    var primeNums    = new Int16Array( 5134 )  ;

    /*
     *  Sieve phase: Mark multiples of numbers as non-prime.
     *  0 and 1 are explicitly marked as non-prime.
     */
    primeNumbers[ 0 ] = 1 ; /* Zero is not prime. */
    primeNumbers[ 1 ] = 1 ; /* One is not prime.  */

    for ( var i = 2 ; i <= 224 ; i ++ )
    {
        if ( primeNumbers[ i ] )
        {
            continue ; // If 'i' is already marked as non-prime, skip.
        }

        // Mark all multiples of 'i' as non-prime.
        for ( var j = ( i << 1 ) ; j <= max ; j += i )
        {
            primeNumbers[ j ] = 1 ; // 1 signifies non-prime.
        }
    }


    /*
     *  Second phase: Calculate counts based on sums of primes.
     *  This part iterates through numbers and, if prime, uses them
     *  to sum with previously found primes.
     */
    var c = 0 ; // Counter for primeNums array.

    for ( var i = 1 ; i <= max ; i ++ )
    {
        if ( primeNumbers[ i ] )
            continue ; // Skip if 'i' is not a prime number.

        primeNums[ ++ c ] = i ; // Store 'i' as a prime number.

        for ( var j = 1 ; j <= c ; j ++ )
        {
            var sum = i + primeNums[ j ] ; // Calculate the sum of two primes.

            if ( sum > 50000 )
                break ; // Optimization: If sum exceeds limit, no need to check further for this 'i'.

            primeCounts[ sum ] ++ ; // Increment count for this specific sum.
        }
    }

    return primeCounts ; // Return the array of prime counts.
}