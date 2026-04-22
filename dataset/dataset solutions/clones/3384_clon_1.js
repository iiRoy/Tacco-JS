/*
 * This file contains two main functions:
 * 1. `factorization`: Computes the prime factorization of a number.
 * 2. `main`: Processes input and uses factorization to compute a result.
 */


const factorization = ( n ) => {
  let primes = [ ] ; // Array to store prime factors and their exponents.

  // Loop through potential prime factors starting from 2.
  // We only need to check up to the square root of 'n'.
  for ( let i = 2 ; i * i <= n ; i ++ ) {
    let exponent = 0 ; // Initialize exponent for the current prime factor 'i'.

    // While 'i' divides 'n' evenly, keep dividing 'n' by 'i'.
    while ( n % i === 0 ) {
      n /= i ; // Reduce 'n' by dividing it by 'i'.
      exponent ++ ; // Increment the count of 'i' as a factor.
    }

    // If 'i' was a factor (i.e., its exponent is greater than 0),
    // add it to our list of primes.
    if ( exponent ) {
      primes.push( { p : i , e : exponent } ) ;
    }
  }


  // If 'n' is still greater than 1 after the loop, it means the remaining 'n'
  // is a prime factor itself (and its exponent is 1).
  if ( n !== 1 ) {
    primes.push( { p : n , e : 1 } ) ;
  }


  return primes ; // Return the complete list of prime factors.
} ;


const main = ( arg ) => {
  // Parse the input string, which contains two space-separated numbers N and P.
  const [ N , P ] = arg.split( " " ).map( Number ) ;

  // Compute the prime factorization of P.
  const f = factorization( P ) ;


  // Initialize 'gcd' variable. Note: The name 'gcd' here might be misleading
  // as the calculation doesn't strictly compute a greatest common divisor.
  gcd = 1 ;

  // Iterate through each prime factor found in 'f'.
  for ( let i = 0 ; i < f.length ; i ++ ) {
    // Calculate a temporary exponent for the current prime factor.
    // This involves integer division of the prime's exponent by N.
    let tmp = parseInt( f[ i ].e / N ) ;

    // Multiply 'gcd' by the current prime factor raised to the calculated 'tmp' exponent.
    gcd *= f[ i ].p ** tmp ;
  }


  // Output the final calculated 'gcd' value to the console.
  console.log( gcd ) ;
} ;


// Execute the main function by reading input from standard input.
// The `require("fs").readFileSync("/dev/stdin", "utf8")` part reads
// the content of /dev/stdin as a UTF-8 string.
main( require( "fs" ).readFileSync( "/dev/stdin" , "utf8" ) ) ;