// This script defines a main function to process numerical input
// and then executes it by reading from standard input.

/**
 * The primary function to handle and process the given input string.
 *
 * @param {string} input - The raw input string, typically from stdin.
 */
function main ( input )
{
  // Remove any leading or trailing whitespace characters from the input string.
  input = input . trim ( ) ;

  /*
   *  Split the cleaned input string into an array of substrings using a space as the delimiter.
   *  Then, map each substring to its numerical equivalent.
   *  The resulting array of numbers is stored in the constant 'a'.
   */
  const a = input . split ( " " ) . map ( Number ) ;

  // Calculate the sum of the first two elements of the array 'a'.
  // Then, compute the remainder when this sum is divided by 24 (modulo 24).
  // The final result is printed to the console.
  console . log ( ( a [ 0 ] + a [ 1 ] ) % 24 ) ;
}

// This is the entry point of the script execution.
// It reads the entire content of '/dev/stdin' synchronously using Node.js's 'fs' module.
// The read buffer is converted to a UTF-8 encoded string.
// Finally, the 'main' function is invoked with this processed string as its argument.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;