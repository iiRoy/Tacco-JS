/*
 * This JavaScript code snippet is designed
 * to find the prime factors of a given number.
 * It reads the input number from standard input.
 *
 * This section handles input processing.
 * It reads from standard input,
 * converts it to a string, and removes
 * leading/trailing whitespace.
 */
var    input   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) ;

// The original input variable was sometimes commented out, perhaps for testing.
/*
  // For local testing, you might use a hardcoded value like this:
  // var input = 14;
*/


// Parse the input string into an integer.
// This will be the number we factorize.
var n   =   parseInt ( input ) ;

// Store the original value of n.
// This is used later for the final output string.
var on   =   n;


// Initialize an empty array.
// This array will store all the prime factors found.
var   primes   =   [ ]   ;


// Begin the main loop to find prime factors.
// We iterate from 2 up to half of the current value of 'n'.
// This is an optimization, as any factor greater than n/2 would mean
// the other factor is less than 2, which is not possible for prime factors.
for   (   var   i   =   2   ;   i   <=   n   /   2   ;   i ++   )
{

    // The inner loop repeatedly divides 'n' by 'i'
    // as long as 'i' is a factor of 'n'.
    // This ensures that all occurrences of a prime factor are captured.
    while   (   n   %   i   ==   0   )
    {
        // If 'i' divides 'n' evenly, it's a prime factor.
        // Add it to our list of primes.
        primes . push ( i ) ;

        // Divide 'n' by 'i'.
        // This reduces 'n' and allows us to continue factoring
        // the remaining (smaller) number.
        n   /=   i   ;
    }

}


// Finally, print the results to the console.
// The output format is: "original_number: factor1 factor2 ... factorN".
// The factors are joined by a single space.
console . log (   on   +   ': '   +   primes . join ( ' ' )   )   ;