/*
 * This JavaScript module defines a main function
 * to determine if the product of two integers is even or odd.
 * It reads input from standard input.
 */

function main ( input )
{
  // Split the input string by spaces to get individual arguments.
  // The 'args' variable will hold an array of strings.
  args = input . split ( " " ) ;

  /*
   * Parse the first argument as an integer with base 10.
   * This will be our first number, 'a'.
   */
  const a = parseInt ( args [ 0 ] , 10 ) ;


  /*
   * Parse the second argument as an integer with base 10.
   * This will be our second number, 'b'.
   */
  const b = parseInt ( args [ 1 ] , 10 ) ;


  // Check if the product of 'a' and 'b' is even.
  // An even number has a remainder of 0 when divided by 2.
  if ( ( a * b ) % 2 === 0 )
  {
    // If the product is even, print "Even" to the console.
    console . log ( "Even" ) ;
  }
  else
  {
    // Otherwise, if the product is odd, print "Odd" to the console.
    console . log ( "Odd" ) ;
  }
} // End of the main function definition.


// This section executes the main function
// by reading content from standard input.
// It uses Node.js 'fs' module to synchronously read the file.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;