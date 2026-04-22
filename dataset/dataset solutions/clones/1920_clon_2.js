'use strict';
// This script calculates the number of periods required for an initial amount to reach a target amount
// under a specific growth rate.

/**
 * Orchestrates the primary processing logic.
 * @param {string} sourceString - The raw string input from the environment.
 */
function  executeCalculation ( sourceString )
{
  /* Define constant values from the parsed input */
  const
    // Split the input string into an array of lines, removing leading/trailing whitespace
    contentRows = sourceString. trim ( ) . split ( '\n' ) ,

    // Convert the first line to a numerical target value
    desiredAmount = Number ( contentRows [ 0 ] )
  ; // End of constant declarations


  /* Initialize mutable state variables */
  let
    // Starting capital amount
    capitalAmount = 100.00,

    // Counter for the number of periods elapsed
    periodCounter = 0
  ; // End of mutable variable declarations


  // Loop continues as long as the current capital is less than the desired target
  while ( capitalAmount < desiredAmount )
  {
    // Apply the growth multiplier to the capital amount
    capitalAmount *= 1.010;

    // Increment the period counter for each iteration
    periodCounter = periodCounter + 1;
  }

  // Output the final count of periods to the console
  console.log( periodCounter );
}

// Invoke the main processing function with data read from standard input
executeCalculation(
  require('fs')
    . readFileSync(
      '/dev/stdin',
      'utf8'
    )
);