/*
 * This file contains an implementation of modular exponentiation.
 * The modPow function calculates (a^b) % n efficiently using binary exponentiation.
 */


function modPow ( a, b, n ) {
  let d = 1n ; // Initialize result to 1 (BigInt literal)


  // Loop while the exponent 'b' is greater than zero
  while ( b > 0 ) {
    // Check if the least significant bit of 'b' is set
    if ( b & 1n ) {
      // If the bit is set, multiply the current result 'd' by 'a' modulo 'n'
      d = ( d * a ) % n ;
    }

    // Square 'a' modulo 'n' for the next iteration
    a = ( a * a ) % n ;

    // Right-shift 'b' by 1 bit, effectively dividing it by 2
    b >>= 1n ;
  }

  // Return the final modular exponentiation result
  return d ;
}


// The 'main' function processes the input and calls the modular exponentiation.
function main ( input ) {
  // Split the input string into an array of lines
  input = input . split ( "\n" ) ;

  // Split the first line into an array of strings based on space
  const line = input [ 0 ] . split ( " " ) ;

  // Parse 'm' and 'n' from the line as integers
  // Note: parseInt is used for base 10 conversion
  const m = parseInt ( line [ 0 ] , 10 ) , n = parseInt ( line [ 1 ] , 10 ) ;

  // Calculate (m^n) % 1000000007 using BigInts and print the result
  console . log ( modPow ( BigInt ( m ) , BigInt ( n ) , 1000000007n ) . toString ( ) ) ;
}


// This section is typically used for competitive programming environments
// and should not be modified. It reads from standard input.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;