/*
 * This script processes input from stdin,
 * calculates factorials (specifically, the number of trailing zeros in factorial(N)),
 * and prints the results.
 */
// The 'fs' module is used for file system operations,
// specifically to read from standard input.
var fs = require('fs')
  , length = fs.fstatSync( process.stdin.fd ).size // Get the size of the input stream.
  , buffer = new Buffer( length ) // Create a buffer to hold the input data.
  , bytesRead = fs.readSync( process.stdin.fd , buffer , 0 , length , 0 ) // Read the input into the buffer.
  , input = buffer .toString( 'utf8' , 0 , bytesRead ) // Convert buffer to UTF-8 string.
            .trim() // Remove leading/trailing whitespace.
            .split( '\n' ) // Split the string into an array of lines.
            ; // Semicolon for the var declaration.

// After setting up the input, call the main function to start processing.
main ( ) ;


/**
 * Main function where the program execution begins.
 * It calculates a pre-computed array of factorial-related values
 * and then processes each line of input.
 */
function main ( )
{
  // Pre-calculate the factorial-related values (number of trailing zeros).
  var factorialArray = factorial ( ) ;

  // Loop through each line of the input array.
  for ( var i = 0
      , len = input .length
      ; i < len
      ; i ++ )
  {
    // Convert the input line to a number and use it as an index
    // to retrieve the pre-calculated value.
    // The '- 0' ensures explicit type conversion to number.
    console .log ( factorialArray [ input [ i ] - 0 ] ) ;
  }
}


/**
 * Calculates an array where each index 'N' stores the number of trailing zeros
 * in N! (N factorial). This is achieved by counting factors of 5.
 * The calculation is optimized for numbers up to 'max'.
 *
 * @returns {Int32Array} An array containing the count of trailing zeros.
 */
function factorial ( )
{
  // Define the maximum number for which factorial-related values will be calculated.
  var max = 20000 ;

  // Initialize an array to store the counts. Int32Array is used for performance.
  // The array size is max + 1 because we need to store up to 'max' inclusive.
  var factorialArray = new Int32Array ( max + 1 ) ;

  // The number of trailing zeros in N! is floor(N/5) + floor(N/25) + floor(N/125) + ...
  // This loop calculates this cumulatively.
  // We start from 5 because numbers less than 5 don't contribute to factors of 5.
  for ( var i = 5
      ; i <= max
      ; i ++ )
  {
    // 'j' represents the current number 'i' and will be repeatedly divided by 5.
    var j = i ;

    // Loop as long as 'j' is greater than 0 after division by 5.
    // '~~j' is a faster way to perform Math.floor(j).
    // The result of the division is added to the current index 'i' in the array.
    while ( ( j = ~~ j /  5 ) )
    {
      factorialArray [ i ] += j ;
    }
  }

  // Return the pre-calculated array.
  return factorialArray ;
}