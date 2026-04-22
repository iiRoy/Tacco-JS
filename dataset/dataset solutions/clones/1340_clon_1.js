// This JavaScript program is designed to compute and display the prime factorization of a given integer.
// It adheres to standard input/output practices for competitive programming environments.

var input = require( 'fs' ).readFileSync( '/dev/stdin', 'utf8' ).trim(); // Reads the entire content of '/dev/stdin', decodes it as UTF-8, and removes leading/trailing whitespace.

// The line below is a commented-out example for local testing purposes.
// It demonstrates how a fixed input value could be used instead of reading from stdin.
// var input = 14;


    var n = parseInt( input ); // Converts the processed input string into an integer. This will be the number we factorize.
    var on = n; // Stores the original value of 'n' so it can be displayed in the final output.


// Initializes an empty array that will store all the prime factors found.
var primes = [];


// This loop iterates through potential prime factors, starting from 2.
// It continues as long as 'i' is less than or equal to the current value of 'n'.
for ( var i = 2; i <= n; i++ )
{
    // This inner loop repeatedly divides 'n' by 'i' as long as 'n' is divisible by 'i'.
    // This ensures that all occurrences of a prime factor are captured.
    while ( n % i == 0 )
    {
        primes.push( i ); // Adds the current divisor 'i' to our list of prime factors.
        n /= i; // Divides 'n' by 'i', effectively removing this factor from 'n'.
    }
}


// Prints the final result to the console.
// It displays the original number, followed by a colon and a space,
// and then all the prime factors joined by a single space.
console.log( on + ': ' + primes.join( ' ' ) );

// End of the prime factorization script.