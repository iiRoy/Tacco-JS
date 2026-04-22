/*
 *  This is a JavaScript program designed to process numeric input.
 *  The primary goal is to determine a specific parity condition based on
 *  the count of even numbers provided in the input.
 *  This file represents a Type I clone, meaning its functionality is identical
 *  to an original, but whitespace and comments have been extensively altered.
 */

function Main ( input ) // Function declaration for the primary processing logic.
{
  // Initialize two counter variables: 'a' for tracking odd numbers, 'b' for tracking even numbers.
  // Both are set to zero at the start of the function's execution.
  var a = 0 ; var b = 0 ; /* Declaration of multiple variables on a single line, separated by semicolons. */

  // The input parameter is expected to be a single string containing multiple lines.
  // We split this string by the newline character ("\n") to obtain an array of individual lines.
  var str = input . split ( "\n" ) ;

  // The second line of the input (accessed via array index 1) is presumed to contain
  // a sequence of numbers separated by spaces.
  // We split this specific line by a space character (" ") to get an array of number-strings.
  var str2 = str [ 1 ] . split ( " " ) ;

  // The first line of the input (accessed via array index 0) is expected to represent
  // the total count of numbers that are present in the second line.
  // We initiate a 'for' loop to iterate through each of these numbers.
  for ( i = 0 ; i < str [ 0 ] ; i ++ ) // Loop initialization, condition, and increment statement.
  {
    // Inside the loop, for each element in 'str2', we perform a modulo operation.
    // JavaScript's type coercion automatically converts the string element to a number for arithmetic operations.
    // If the result of 'str2[i] % 2' is non-zero (i.e., 1 for odd numbers),
    // it evaluates to 'true', and the 'a' counter (for odd numbers) is incremented.
    if ( str2 [ i ] % 2 ) // Conditional check to determine if the current number is odd.
    {
      a ++ ; // Increment the counter for odd numbers.
    }
    // If the condition in the 'if' statement is false (i.e., 'str2[i] % 2' is 0 for even numbers),
    // the 'else' block is executed, and the 'b' counter (for even numbers) is incremented.
    else // The alternative block executed when the number is even.
    {
      b ++ ; // Increment the counter for even numbers.
    }
  } // This marks the conclusion of the 'for' loop block.

  // Following the complete iteration through all numbers, we evaluate the parity of the
  // total count of even numbers, stored in variable 'b'.
  // If 'b' is an odd number (i.e., 'b % 2' evaluates to 1, which is truthy),
  // the program outputs "YES" to the console.
  if ( b % 2 ) // Final conditional check based on the parity of 'b'.
  {
    console . log ( "YES" ) ; // Output "YES" if the count of even numbers is odd.
  }
  // Otherwise, if 'b' is an even number (i.e., 'b % 2' evaluates to 0, which is falsy),
  // the program outputs "NO" to the console.
  else // The block executed when the count of even numbers is even.
  {
    console . log ( "NO" ) ; // Output "NO" if the count of even numbers is even.
  }

} // This curly brace signifies the end of the 'Main' function's definition.


// This final line is responsible for initiating the program's execution.
// It invokes the 'Main' function, supplying it with input read from the standard input stream.
// 'require("fs")' is used to import Node.js's built-in file system module.
// '.readFileSync("/dev/stdin", "utf8")' reads the entire content of '/dev/stdin' (which typically
// redirects to standard input on Unix-like systems) synchronously, interpreting the data
// as a UTF-8 encoded string. This string is then passed as the 'input' argument to 'Main'.
Main ( require ( "fs" ) . readFileSync ( "/dev/stdin" , "utf8" ) ) ; // The primary function call to begin execution.