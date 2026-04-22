/* This script processes standard input to find prime numbers
   and then determines nearest primes for each input number.
   It leverages Node.js's 'fs' module for synchronous file operations.
*/
var fs       = require ( 'fs' ) , // File system module for I/O operations
    length   = fs . fstatSync ( process . stdin . fd ) . size , // Get size of standard input
    buffer   = new Buffer ( length ) ,                          // Create buffer to hold input data
    bytesRead = fs . readSync ( process . stdin . fd , buffer , 0 , length , 0 ) , // Read input into buffer
    input    = buffer . toString ( 'utf8' , 0 , bytesRead ) . split ( '\n' ) ; // Convert buffer to string and split by newline

// Execute the main processing logic immediately after input preparation.
main ( ) ;


/*
 * Main function orchestrating the prime number search and input processing.
 * It first pre-calculates a list of prime numbers up to a certain limit.
 * Then, for each number provided in the input, it finds the closest prime
 * numbers (one less than or equal, and one greater than or equal).
 */
function main ( )
{
  var primeNumbers = calcPrimeNumbers ( ) ; // Pre-compute prime numbers
  
  // Iterate through each line of input, excluding the last empty line if present.
  for ( var i = 0 , len = input . length - 1 ; i < len ; i ++ )
  {
    var inp = input [ i ] - 0 ; // Convert input string to number (the `- 0` is a common JS trick)
    
    var min = 0 , max = 0 ; // Initialize min and max primes found for the current input.
    
    // Search for the nearest prime numbers in the pre-calculated list.
    for ( var j = 0 , jlen = primeNumbers . length ; j < jlen ; j ++ )
    {
      var nowPrimeNumber  = primeNumbers [ j ] ;     // Current prime number in the list.
      var nextPrimeNumber = primeNumbers [ j + 1 ] ; // Next prime number in the list.
      
      // Find the largest prime number less than or equal to 'inp'.
      if ( nowPrimeNumber < inp && nextPrimeNumber >= inp )
      {
        min = nowPrimeNumber ;
      }
      
      // Find the smallest prime number greater than or equal to 'inp'.
      if ( nowPrimeNumber <= inp && nextPrimeNumber > inp )
      {
        max = nextPrimeNumber ;
        break ; // Once max is found, we can stop searching for this 'inp'.
      }
    
    } // End of inner loop for prime number search.
    
    // Output the found min and max prime numbers.
    console . log ( min , max ) ;
  } // End of outer loop for input processing.
   
     
} // End of main function definition.
   
/*
 * Function to calculate prime numbers up to a predefined maximum using
 * a variation of the Sieve of Eratosthenes.
 * Returns an Int32Array containing the prime numbers.
 */
function calcPrimeNumbers ( )
{
  var max          = 50023 ; // The upper limit for prime number calculation.
  var primeNumbers = new Int8Array ( max + 1 ) ; // Boolean-like array to mark non-primes.
   
  // Mark 0 and 1 as not prime.
  primeNumbers [ 0 ] = 1 ;
  primeNumbers [ 1 ] = 1 ;
  
  /* The Sieve of Eratosthenes algorithm:
   * Iterate from 2 up to the square root of max.
   * If a number 'i' is not marked as non-prime, it's prime.
   * Then, mark all its multiples as non-prime.
   */
  for ( var i = 2 , maxI = ~~ Math . sqrt ( max ) ; i <= maxI ; i ++ )
  {
    if ( primeNumbers [ i ] )
    {
      continue ; // Skip if 'i' is already marked as non-prime.
    }
       
    // Mark all multiples of 'i' as non-prime, starting from i*i (or 2*i as in this code).
    for ( var j = ( i << 1 ) ; j <= max ; j += i )
    {
      primeNumbers [ j ] = 1 ; // Mark as non-prime.
    }
  } // End of Sieve marking loop.
   
  var primeNums = new Int32Array ( 5135 ) ; // Array to store the actual prime numbers.
  var j = 0 ; // Index for primeNums array.
  
  // Populate the primeNums array with numbers that were not marked as non-prime.
  for ( var i = 1 ; i <= max ; i ++ )
  {
    if ( ! primeNumbers [ i ] ) // If primeNumbers[i] is 0 (false), then 'i' is prime.
      primeNums [ j ++ ] = i ;   // Add 'i' to the list of primes.
  }
     
  return primeNums ; // Return the array of calculated prime numbers.
} // End of calcPrimeNumbers function.