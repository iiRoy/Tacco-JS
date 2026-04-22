/*
 * This file handles standard input processing and then calculates
 * and uses prime numbers for some computational task.
 * The entry point is the 'main' function.
 */

// Standard input handling setup for Node.js environment.
var fs = require('fs');

// Determine the size of the input stream.
var length = fs.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data.
var buffer = new Buffer(length);

// Read data from standard input into the buffer.
var bytesRead = fs.readSync(process.stdin.fd, buffer, 0, length, 0);

// Convert the buffer to a UTF-8 string and split it by newlines.
var input = buffer.toString('utf8', 0, bytesRead).split('\n');

// Immediately invoke the main function to start execution.
main ( ) ;


// Main program logic starts here.
function main ( )
{
  // First, generate a list of prime numbers up to a certain limit.
  var primeNumbers = calcPrimeNumbers ( ) ;

  // Initialize an array to count occurrences of sums of two primes.
  // The size is chosen to accommodate sums up to 50000.
  var primeCounts = new Int32Array ( 50001 ) ;


  // Iterate through pairs of prime numbers to find their sums.
  // The outer loop iterates through the 'primeNumbers' array.
  for ( var i = 1 ; i < 5133 ; i ++ )
  {
    // Get the current prime number from the list.
    var pni = primeNumbers [ i ] ;

    // The inner loop iterates from the first prime up to the current prime's index.
    for ( var k = 1 ; k <= i ; k ++ )
    {
      // Calculate the sum of two prime numbers.
      var sum = pni + primeNumbers [ k ] ;

      // If the sum exceeds the maximum limit, break the inner loop
      // as subsequent sums will also exceed it.
      if ( sum > 50000 )
      {
        break ; // Exit inner loop
      }

      // Increment the count for this specific sum.
      primeCounts [ sum ] ++ ;
    }
  }

  // Process input queries.
  // 'c' will store the integer value from the input.
  var i = 0 ; // Initialize index for input array.
  while ( c = + input [ i ++ ] ) // Read input line by line, converting to number.
  {
    // Output the count of prime sums for the current input number.
    console . log ( primeCounts [ c ] ) ;
  }

}


// This function calculates prime numbers up to a predefined maximum.
function calcPrimeNumbers ( )
{
  // Define the upper limit for prime number calculation.
  var max = 49999 ;

  // Create a boolean-like array for Sieve of Eratosthenes.
  // 0 means potentially prime, 1 means not prime (composite).
  var primeNumbers = new Int8Array ( max + 1 ) ;


  // Mark 0 and 1 as not prime, as per definition.
  primeNumbers [ 0 ] = primeNumbers [ 1 ] = 1 ;

  // Apply the Sieve of Eratosthenes algorithm.
  // Iterate from 2 up to the square root of 'max'.
  for ( var i = 2 , maxI = ~~ Math . sqrt ( max ) ; i <= maxI ; i ++ )
  {
    // If 'i' is already marked as composite, skip it.
    if ( primeNumbers [ i ] )
    {
      continue ; // Move to the next number.
    }

    // Mark all multiples of 'i' as composite.
    // Start from i*i, or (i<<1) for 2*i. The original code starts from 2*i.
    for ( var j = ( i << 1 ) ; j <= max ; j += i )
    {
      primeNumbers [ j ] = 1 ; // Mark as composite.
    }
  }


  // Extract the actual prime numbers into a new array.
  // The size 5134 is likely based on the number of primes up to 'max'.
  var primeNums = new Int32Array ( 5134 ) ;

  // Counter for the number of primes found.
  var c = 0 ;

  // Iterate through the sieve array.
  for ( var i = 1 ; i <= max ; i ++ )
  {
    // If the number is not marked as composite, it's a prime.
    if ( ! primeNumbers [ i ] )
    {
      // Store the prime number and increment the counter.
      primeNums [ ++ c ] = i ;
    }
  }

  // Return the array containing all found prime numbers.
  return primeNums ;
}