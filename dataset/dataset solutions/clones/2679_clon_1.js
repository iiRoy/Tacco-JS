/*
 * This file contains a JavaScript program
 * to solve a specific counting problem.
 * It determines how many numbers from 1 to N
 * have an odd number of digits.
 */

// Define the main function to encapsulate the program logic
function  main ( input )
{
  /*
   * The input is expected to be a single string representing a number.
   * We split it by space to handle potential extra arguments,
   * though only the first part is used.
   */
  var args = input . split ( ' ' ) ;

  // Parse the first argument into an integer, using base 10
  var N = parseInt ( args [ 0 ] , 10 ) ;

  // Initialize a counter. This variable will store our final result.
  var count = 0 ;

  // Start a loop that iterates from 1 up to N (inclusive)
  for ( var i = 1 ; i <= N ; i ++ )
  {
    // Convert the current number 'i' to a string to easily get its length
    // Then, check if the length of this string (number of digits) is odd
    if ( String ( i ) . length % 2 === 1 )
    {
      // If the number of digits is odd, increment our counter
      count ++ ; // Add one to the count
    } // End of the if statement block
  } // End of the for loop

  // After the loop completes, print the total count to the console
  console . log ( count ) ;
} // End of the main function definition


// This line reads input from standard input and passes it to the main function.
// It uses Node.js 'fs' module to read the file content as a UTF-8 string.
main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) ) ;