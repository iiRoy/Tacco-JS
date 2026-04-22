/*
 * This is a Type I clone of the original JavaScript code.
 * All identifiers, variable names, function names, operators,
 * and expressions remain precisely the same.
 * Only whitespace (indentation, spacing, blank lines)
 * and comments have been altered extensively to create
 * a visually distinct but functionally identical version.
 */
"use strict"
; // Enforce strict mode for cleaner code.


// The primary entry point for the application.
// It reads input from standard input and passes it to the main function.
main (
  require("fs")
    .readFileSync
      (
        "/dev/stdin", // Path to standard input file
        "UTF-8"       // Encoding for the input
      )
) ;


/**
 * Main function to process the input and compute the result.
 *
 * @param {string} input - The raw input string read from stdin.
 */
function main(
  input
)
{

  // Process the raw input string.
  // First, split by newline to get the first line.
  // Then, split that line by space to get individual string numbers.
  // Finally, map each string to an integer.
  input = input

    .split("\n") // Split the input string by newline characters.
    [0]          // Take only the first line of the input.

    .split(" ")  // Split the first line by spaces to get string numbers.

    .map(
      n =>
        parseInt(n) // Convert each string number 'n' into an integer.
    )
  ; // End of input processing chain.


  // Initialize a counter variable.
  // The name 'conut' is intentionally kept as per the original code.
  let  conut = 1
  ;


  // Check the initial condition: if the first number is greater than or equal to the second.
  if (
    input[0]
    >=
    input[1]
  )
  {
    // If the condition is met, print 1 and the program's logic implies termination here for this branch.
    console.log(1)
    ;
  }
  else
  {
    // If the first number is less than the second, enter a loop.

    /*
     * This loop continues as long as the second number is strictly greater than the first.
     * Inside the loop, the first number is incremented by a specific formula,
     * and the counter is also incremented.
     */
    while (
      input[1]
      >
      input[0]
    )
    {
      // Update the first number: add (its current value - 1) to itself.
      input[0]
      +=
      input[0] - 1
      ;

      // Increment the counter for each iteration of the loop.
      conut++
      ;
    } // End of while loop.

  } // End of else block.


  // After the conditional logic, print the final value of the counter.
  console.log(
    conut
  )
  ;

} // End of main function definition.