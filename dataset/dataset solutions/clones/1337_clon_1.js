/*
 * This JavaScript program is designed to compute and display
 * the prime factorization of an integer read from standard input.
 * It identifies all prime factors and lists them.
 */

// Obtain the input string from standard input, ensuring it's trimmed of leading/trailing whitespace.
var    input     =  require('fs') . readFileSync ( '/dev/stdin' ,  'utf8' ) . trim ( ) ;

// Convert the obtained string input into an integer.
// This integer 'n' is the number we will factorize.
var   n    =   parseInt ( input ) ;


// Initialize an empty array. This array will store all prime factors found during the process.
var primes   =   [ ] ;


/*
 * Main loop for prime factorization.
 * We iterate through potential divisors starting from 2.
 * The loop continues as long as 'i' is less than the current value of 'n'.
 */
for  ( var   i   =   2 ;   i   <   n ;   i++ )
{
    // Inner loop: Check if 'i' is a factor of 'n'.
    // If 'n' is divisible by 'i' (remainder is 0), then 'i' is a prime factor.
    while ( n % i == 0 )
    {
        // Add the current prime factor 'i' to our list of primes.
        primes . push ( i ) ;

        // Divide 'n' by 'i'. This reduces 'n' and allows us to find
        // subsequent prime factors of the remaining number.
        n   /=   i ;
    }
}


/*
 * Output the results to standard output.
 * First, print the final value of 'n' (which will be the largest prime factor if n > 1)
 * followed by a colon and a space.
 */
process . stdout . write ( n   +   ': ' ) ;

// Then, print all the collected prime factors, joined by a single space,
// followed by a newline character to terminate the output line.
process . stdout . write ( primes . join ( ' ' ) + "\n" ) ;