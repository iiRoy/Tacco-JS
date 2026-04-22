"use strict" ; /* This directive enables strict mode, ensuring cleaner code and catching common errors. */


// This function is designed to find the largest proper divisor of a given number.
// A proper divisor is a positive divisor of a number, other than the number itself.
function divisor ( num )
{

  let curDiv = 1 ; // Initialize the current largest divisor found to 1.
                   // 1 is a divisor for any positive integer.

  // Calculate the midpoint. We only need to check divisors up to num/2.
  // Using parseInt to ensure 'num' is treated as an integer, though it should be.
  const midian = parseInt ( num ) / 2 ;

  // Loop from 2 up to, but not including, the midpoint.
  // We start from 2 because 1 is already handled by initialization.
  for ( let i = 2 ; i < midian ; i ++ )
  {
    // Check if 'i' is a divisor of 'num' AND if it's greater than the current largest divisor.
    if ( ( num % i === 0 ) && ( i > curDiv ) )
    {
      curDiv = i ; // If both conditions are true, update 'curDiv' to this new larger divisor.
    }
  }

  return curDiv ; // Return the largest proper divisor found.
}



// The main function that orchestrates the program's logic.
function main ( input )
{

  // Parse the input. The input string is expected to be a number followed by a newline.
  // We split by newline, take the first element, and convert it to an integer.
  input = parseInt ( input . split ( "\n" ) [ 0 ] ) ;

  console . log ( input ) ; // Output the parsed input number to the console for debugging or verification.


  let divis = divisor ( input ) ; // Call the 'divisor' function to find the largest proper divisor of the input.


  // Calculate and log the final result based on the problem's specific formula.
  // This formula involves the divisor found and the original input.
  console . log ( ( divis - 1 ) + ( input / divis ) - 1 ) ;

}


// Execute the main function by reading input from standard input.
// This is a common pattern for competitive programming or script execution.
main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "UTF-8" ) ) ;