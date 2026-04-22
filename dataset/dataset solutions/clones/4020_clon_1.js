//
// This file contains a JavaScript program designed to find the maximum sum of digits
// for all integer numbers from a given input value down to zero.
// This is an example of a Type I code clone, preserving all identifiers, operators,
// and expressions, while extensively modifying whitespace and comments.
//

//
// Helper function 'f':
//   Calculates the sum of digits for a given number.
//   It first converts the number 'x' into a string.
//   Then, it splits the string into an array of individual character digits.
//   Finally, it uses the 'reduce' method to iterate over these characters,
//   converting each to a number (using the '~~' bitwise NOT operator for
//   a fast integer conversion) and summing them up.
//
f = x => (''+x).split('').reduce((x,y)=>~~x+~~y);


/*
 * Main function:
 *   This is the primary entry point for processing the program's logic.
 *   It takes a numerical 'input' and iterates downwards from this value to 0,
 *   calculating the sum of digits for each number.
 *   Its goal is to determine and output the largest sum of digits encountered.
 *
 * @param {number} input - The integer value from which the program starts counting down.
 */
function Main (input)
{
  // Initialize the 'max' variable. This variable will hold the
  // highest sum of digits found during the iteration.
  // It is set to 0 initially, as digit sums are non-negative.
  max = 0;

  // Begin a 'for' loop that iterates from the 'input' value down to 0.
  // The loop condition 'i--' first evaluates 'i' (which is truthy for
  // any non-zero number) and then decrements 'i'. The loop continues
  // as long as 'i' is truthy (i.e., not 0).
  for (i=input; i--;)
  {
    // Inside the loop, check if the sum of digits for the current number 'i'
    // (obtained by calling the helper function f(i)) is greater than
    // the current maximum sum stored in 'max'.
    if (max < f(i))
    {
      // If the sum of digits for the current number 'i' is indeed greater,
      // update 'max' to this new, higher sum.
      max = f(i);
    }
  }

  // After the loop has completed and all numbers from 'input' down to 0
  // have been processed, output the final maximum sum of digits found
  // to the console (standard output).
  console.log(max);
}


//
// Program execution entry point:
//   This line is responsible for initiating the program.
//   It reads the input from the standard input stream.
//   The 'require("fs").readFileSync("/dev/stdin", "utf8")' part uses
//   Node.js's 'fs' (file system) module to synchronously read the entire
//   content of "/dev/stdin" (standard input) as a UTF-8 encoded string.
//   This string content is then passed as an argument to the 'Main' function.
//
Main(require("fs").readFileSync("/dev/stdin", "utf8"));