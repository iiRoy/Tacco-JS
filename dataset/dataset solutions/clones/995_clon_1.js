// This script reads numbers from standard input,
// processes them, and counts how many are prime.

/*
 * Initial setup:
 *   - Import the 'fs' module for file system operations.
 *   - Read input from /dev/stdin.
 *   - Convert the input string into an array of numbers.
 */
var   numbers   =   require ( 'fs' ) . readFileSync ( '/dev/stdin' ,   'utf8' ) . trim ( ) . split ( '\n' ) . map ( Number ) ;

// The first number in the input indicates 'n', which is then removed from the 'numbers' array.
// For this particular problem, 'n' might not be used later, but it's part of the input spec.
var   n   =   numbers . shift ( ) ;


/**
 * Determines if a given number is a prime number.
 *
 * @param {number} num The number to check for primality.
 * @returns {number} 1 if the number is prime, 0 otherwise.
 */
function   isPrime ( num )
{
  // Numbers less than 2 are not prime.
  if   ( num   <   2 )
    return   0 ;

  // 2 is the only even prime number.
  if   ( num   ===   2 )
    {
      return   1 ;
    }

  // All other even numbers (greater than 2) are not prime.
  if   ( num   %   2   ===   0 )
    return   0 ;

  // Check for divisibility by odd numbers up to the square root of 'num'.
  // We only need to check odd divisors because even ones were already handled.
  for   ( var   i   =   3 ;   i   <=   Math . sqrt ( num ) ;   i   +=   2 )
  {
    // If 'num' is divisible by 'i', it's not prime.
    if   ( num   %   i   ===   0 )
      {
        return   0 ;
      }
  }

  // If no divisors were found, the number is prime.
  return   1 ;
}


// --- Main execution block ---

// Use the reduce method to iterate through the 'numbers' array.
// The accumulator 'acc' will store the count of prime numbers.
console . log ( numbers . reduce ( function ( acc ,   number )
{
  // For each number, call isPrime and add its result (0 or 1) to the accumulator.
  return   acc   +   isPrime ( number ) ;
} ,   0 ) ) ;

// End of script.