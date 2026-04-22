/*
 * This file contains two JavaScript functions: Main and checkZero.
 * It also includes a call to the Main function.
 */

function   Main  (  input  )
{
  // The primary function to process the input.
  // First, parse the input string into an integer.
  input = parseInt( input ) ;

  /*
   * Initialize a variable to accumulate the final result.
   * This will store the count of trailing zeros.
   */
  var result = 0 ;


  // Loop as long as the input value is greater than zero.
  while ( input > 0 )
  {
    // Call checkZero to count trailing zeros for the current 'input' value.
    result += checkZero( input ) ;

    // Decrement the input by 2 for the next iteration.
    input = input - 2 ;
  }

  // Log the final accumulated result to the console.
  console.log( result ) ;

} // End of Main function definition.


function checkZero ( multi )
{
  // This helper function counts the number of trailing zeros in a number.
  // It takes an integer 'multi' as input.

  var i = true ; /* A boolean flag to control the while loop. */

  // Convert the number to a string to easily access its digits.
  multi = multi.toString( ) ;

  // Calculate the index of the last character (digit) in the string.
  var index = multi.toString( ).length - 1 ;

  // Initialize a counter for the number of trailing zeros found.
  var result = 0 ;

  // Loop while the flag 'i' is true, which means we are still finding zeros.
  while ( i )
  {
    // Check if the character at the current 'index' is '0'.
    if ( multi[ index ] == "0" )
    {
      // If it's '0', decrement the index to check the previous character.
      index -- ;
      // Increment the count of trailing zeros.
      result ++ ;
    }
    else
    {
      // If the character is not '0', then we've reached the end of the trailing zeros.
      // Set the flag to false to exit the loop.
      i = false ;
    }
  }
  // Return the total count of trailing zeros.
  return result ;
} // End of checkZero function.


// This is the entry point of the script.
// It reads input from standard input, converts it to UTF-8, and passes it to the Main function.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ;
/*
 * Script execution concludes here.
 */