/*
 * This JavaScript file defines a main function to calculate the sum of numbers
 * that are not divisible by 3 and not divisible by 5, within a given range.
 * It also includes an execution block that handles reading input either
 * from a test source or standard input, depending on an environment variable.
 */

// Define the primary function, 'main', which accepts 'input' as a string.
const main = ( input ) =>
{
  // Convert the input string to a number, ensuring to trim any whitespace first.
  // This 'n' variable will determine the upper limit of our loop.
  const n = Number( input . trim () ) ;

  // Initialize a mutable variable 'ans' (short for answer) to zero.
  // This variable will accumulate the sum of qualifying numbers.
  let ans = 0 ;

  // Begin a 'for' loop to iterate through numbers from 1 up to 'n'.
  for
    (
      let i = 1 ; // Initialize the loop counter 'i' to 1.
      i <= n ;    // The loop continues as long as 'i' is less than or equal to 'n'.
      i ++        // Increment 'i' by 1 after each iteration.
    )
  {
    // Check if the current number 'i' is NOT divisible by 3 AND NOT divisible by 5.
    // The modulo operator (%) returns the remainder of a division.
    // If 'i % 3' is non-zero, it means 'i' is not divisible by 3.
    // If 'i % 5' is non-zero, it means 'i' is not divisible by 5.
    if ( ( i % 3 ) && ( i % 5 ) )
    {
      // If both conditions are true, add the current number 'i' to our sum 'ans'.
      ans += i ;
    }
  } // End of the for loop.

  // After the loop completes, print the final calculated sum to the console.
  // The 'return' statement here simply exits the function after the logging operation.
  return console . log ( ans ) ;
} ; // End of the main function definition.


// This section handles the execution flow based on the 'MYTEST' environment variable.
// It's a ternary operator chain for conditional logic.

// Check if 'process.env.MYTEST' is defined and has a truthy value.
process . env . MYTEST

  // If 'process.env.MYTEST' is truthy:
  ? (
      // Then, check if 'process.env.MYTEST' is strictly equal to the string 'test'.
      process . env . MYTEST === 'test'

        // If it is 'test', execute the 'test()' function (presumably for unit testing).
        ? test ()

        // If 'process.env.MYTEST' is truthy but not 'test',
        // read input from 'dev/stdin' and pass it to the 'main' function.
        : main ( require ( 'fs' ) . readFileSync ( 'dev/stdin' , 'utf8' ) )
    )

  // If 'process.env.MYTEST' is falsy (e.g., undefined or empty string):
  // Read input from the standard input path '/dev/stdin' and pass it to the 'main' function.
  : main ( require ( 'fs' ) . readFileSync ( '/dev/stdin' , 'utf8' ) )
; // Concludes the conditional execution block.