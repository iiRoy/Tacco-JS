"use strict" ; // Enforce strict mode for cleaner code.

// This class is designed to parse input strings, typically from standard input.
// It handles splitting the input into lines and then tokens within each line.
function I ( s , f )
{
  // The input string 's' is split into an array of lines.
  this . _s = s . split ( "\n" ) ;

  // _c represents the current column (token index) within the current line.
  this . _c = 0 ;

  // _l represents the current line index.
  this . _l = 0 ;

  // _f is the parsing function for each token; it defaults to the Number constructor.
  this . _f = f || Number ;
}

// Method 'a' (short for "advance" or "atom") reads the next single token from the input.
I . prototype . a = function ( )
{
  // Get the current line based on the line index.
  var l = this . _s [ this . _l ] ;

  // If the line is empty or undefined, there are no more tokens to read.
  if ( ! l )
    return ;

  // Trim whitespace from the current line and split it into tokens by space.
  var t = l . trim ( ) . split ( " " ) ;

  // Retrieve the token at the current column index.
  var a = t [ this . _c ] ;

  // Increment the column index to point to the next token.
  this . _c ++ ;

  // Check if all tokens on the current line have been consumed.
  if ( t . length === this . _c )
  {
    // If so, reset the column index and move to the next line.
    this . _c = 0 ;
    this . _l ++ ;
  }

  // Parse the retrieved token using the specified function and return the result.
  return this . _f ( a ) ;
} ; // End of I.prototype.a method.

// Method 'l' (short for "line") reads all remaining tokens from the current line.
I . prototype . l = function ( )
{
  // Get the current line from the stored array of lines.
  var l = this . _s [ this . _l ] ;

  // If the current line is empty or undefined, there's nothing to read.
  if ( ! l )
    return ;

  // Reset the column index to 0, as we are starting a new line read operation.
  this . _c = 0 ;

  // Increment the line index to move past the current line for subsequent reads.
  this . _l ++ ;

  // Split the line into tokens and apply the parsing function to each token, then return the array.
  return l . split ( " " ) . map ( this . _f ) ;
} ; // End of I.prototype.l method.

// This function implements the Sieve of Eratosthenes algorithm to find all prime numbers up to 'e'.
function sieveOfEratosthenes ( e )
{
  // Create a boolean array, initialized to true, indicating potential primality for each number up to 'e'.
  // The size is 'e + 1' to include 'e' itself in the range.
  const t = new Array ( e + 1 ) . fill ( ! 0 ) ; // !0 evaluates to true.

  // Mark 0 and 1 as not prime.
  t [ 0 ] = ! 1 ; // !1 evaluates to false.
  t [ 1 ] = ! 1 ;

  // This array will store the prime numbers found.
  const n = [ ] ;

  // Iterate from 2 up to the specified limit 'e'.
  for ( let r = 2 ; r <= e ; r += 1 )
  {
    // If t[r] is true, then 'r' is a prime number.
    if ( ! 0 === t [ r ] )
    {
      // Add 'r' to the list of primes.
      n . push ( r ) ;

      // Mark all multiples of 'r' as not prime.
      // Start marking from r*r because smaller multiples would have already been
      // marked by their own prime factors.
      let f = r * r ;

      // Loop through multiples of 'r' until 'f' exceeds 'e'.
      while ( f <= e )
      {
        // Mark 'f' as not prime.
        t [ f ] = ! 1 ;

        // Move to the next multiple of 'r'.
        f += r ;
      }
    }
  }

  // Return the array containing all prime numbers found.
  return n ;
} // End of sieveOfEratosthenes function.

// Pre-calculate a list of prime numbers up to 100,000 using the sieve.
// This list will be used later in the main logic.
var primes = sieveOfEratosthenes ( 100000 ) ;

// The main function that orchestrates the problem-solving logic.
// It takes the raw input string as an argument.
function main ( input )
{
  // Initialize the custom input parser with the provided input string.
  var o = new I ( input ) ;

  // Read the first number from the input, which is 'n'.
  var n = o . a ( ) ;

  // Initialize an empty array 'a' to store subsequent input numbers.
  var a = [ ] ;

  // Loop 'n + 1' times (from 0 to n inclusive) to read the required number of elements.
  for ( var i = 0 ; i <= n ; i ++ )
  {
    // Read each number and add it to array 'a'.
    a . push ( o . a ( ) ) ;
  }

  // Reverse the array 'a'. The order of elements is crucial for the problem.
  a = a . reverse ( ) ;

  // Initialize 'agcd' (aggregate greatest common divisor) with the first element of the reversed array.
  let agcd = a [ 0 ] ;

  // Calculate the GCD of all elements in array 'a'.
  // The loop starts from the second element (index 1) as the first is already in 'agcd'.
  for ( var i = 1 ; i <= n ; i ++ )
  {
    // Update 'agcd' by finding the GCD of the current 'agcd' and the next array element.
    agcd = gcd ( agcd , a [ i ] ) ;
  }

  // Normalize array 'a' by dividing each element by the calculated 'agcd'.
  // This simplifies the numbers while preserving their relative properties.
  a = a . map ( x => x / agcd ) ;

  // Initialize an array 'ans' to store the final list of prime factors.
  var ans = [ ] ;

  // Iterate through the pre-calculated list of primes.
  primes . forEach ( prime =>
  {
    // If the first element of the normalized array 'a' is not divisible by the current prime,
    // then this prime cannot satisfy the problem's conditions, so skip it.
    if ( a [ 0 ] % prime !== 0 )
      return ; // Move to the next prime in the `forEach` loop.

    // This nested loop checks a specific modular arithmetic condition related to the prime.
    // It iterates from 1 up to 'prime - 1'.
    for ( var i = 1 ; i < prime ; i ++ )
    {
      // Initialize 'j' with 'i' for the inner `while` loop's starting index.
      var j = i ;

      // Initialize a sum variable for elements at specific indices.
      var ajsum = 0 ;

      // Sum elements of 'a' at indices `j`, `j + (prime - 1)`, `j + 2*(prime - 1)`, and so on.
      while ( j <= n )
      {
        ajsum += a [ j ] ;
        j += prime - 1 ;
      }

      // If this calculated sum is not divisible by 'prime', then this 'prime' is not a valid answer.
      if ( ajsum % prime !== 0 )
        return ; // Skip to the next prime in the outer `forEach` loop.
    }

    // If all conditions pass for the current 'prime', add it to the answer list.
    ans . push ( prime ) ;
  } ) ; // End of primes.forEach loop.

  // Now, we need to find the prime factors of the initial 'agcd' value itself.
  // 'i' is used as an index to iterate through our pre-calculated 'primes' array.
  var i = 0 ;

  // Continue as long as 'agcd' is greater than 1 and we have primes left to check.
  while ( agcd > 1 && i < primes . length )
  {
    // Check if the current prime divides 'agcd'.
    if ( agcd % primes [ i ] === 0 )
    {
      // If it divides, add this prime factor to our answer list.
      ans . push ( primes [ i ] ) ;

      // Keep dividing 'agcd' by this prime until it's no longer divisible.
      // This extracts all occurrences of this prime factor.
      while ( agcd % primes [ i ] === 0 )
      {
        agcd = agcd / primes [ i ] ;
      }
    }
    // Move to the next prime in our list.
    i += 1 ;
  }

  // After iterating through all known primes, if 'agcd' is still greater than 1,
  // it means the remaining 'agcd' itself is a prime factor (or a product of primes
  // larger than those in our pre-calculated list).
  if ( agcd > 1 )
  {
    ans . push ( agcd ) ;
  }

  // Sort the collected prime factors in ascending order.
  ans . sort ( ( a , b ) => a - b ) ;

  // Initialize a variable to keep track of the previously printed value,
  // used to ensure only unique values are printed.
  var prev ;

  // Iterate through the sorted answer list to print unique prime factors.
  for ( var i = 0 ; i < ans . length ; i ++ )
  {
    // Only print the current element if it's different from the previous one.
    if ( prev !== ans [ i ] )
    {
      console . log ( ans [ i ] ) ;
    }
    // Update 'prev' to the current element for the next iteration.
    prev = ans [ i ] ;
  }
} // End of main function.

// This function calculates the Greatest Common Divisor (GCD) of two numbers
// using the Euclidean algorithm (recursive implementation).
function gcd ( a , b )
{
  // The base case for the Euclidean algorithm: if 'b' is 0, 'a' is the GCD.
  if ( b === 0 )
    return a ;

  // Recursive step: GCD(a, b) is equivalent to GCD(b, a % b).
  return gcd ( b , a % b ) ;
} // End of gcd function.

// This is the entry point of the script.
// It reads the entire content of standard input synchronously,
// decodes it as UTF-8, and then passes it to the 'main' function for processing.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;