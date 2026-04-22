'use strict'; // Enforce strict parsing and error handling in the script.

/**
 * Processes an incoming string containing numeric data,
 * extracts specific values, performs a range-based calculation,
 * and then outputs a sorted list of unique results.
 * @param {string} inputString - The raw string data received, typically from standard input.
 */
function processInput(  inputString  ) {

  // Parse the initial input string to extract numerical parameters.
  // 1. Split the string by newline and take the first line.
  // 2. Split that line by spaces to get individual string tokens.
  // 3. Convert each string token into a proper number type.
  let numericValues = inputString
    .split('\n')[0]
    .split(' ')
    .map(currentValue => Number(currentValue));

  // Assign the extracted numeric values to clearly named constants.
  const startVal        = numericValues[0]; // The initial boundary value.
  const endVal          = numericValues[1];   // The final boundary value.
  const iterationsCount = numericValues[2]; // The total number of steps or iterations to perform.

  // Initialize a new Set object to store unique numbers generated during the process.
  // A Set automatically handles duplicate entries, ensuring only unique values are kept.
  let resultSet = new Set();

  // Loop through a specified number of iterations to generate potential result values.
  for (let currentIteration = 0; currentIteration < iterationsCount; currentIteration++ ) {
    // Check if the values derived by adding to 'startVal' or subtracting from 'endVal'
    // still fall within the logical range determined by 'startVal' and 'endVal'.
    if (  ( startVal + currentIteration ) <= endVal  ||  ( endVal - currentIteration ) >= startVal  ) {
      // If the conditions are met, add both the incremented start value
      // and the decremented end value to our set of unique results.
      resultSet.add(startVal + currentIteration);
      resultSet.add(endVal - currentIteration);
    } else {
      // If neither of the derived values falls within the valid range,
      // it means further iterations will not yield new valid numbers,
      // so we can exit the loop early for efficiency.
      break;
    }
  }

  // Final processing of the result set:
  // 1. Convert the Set into an Array using the spread syntax.
  // 2. Sort the array numerically in ascending order.
  // 3. Join the sorted numbers into a single string, with each number
  //    separated by a newline character.
  resultSet = [ ...resultSet ]
    .sort( ( valA, valB ) => valA - valB )
    .join('\n');

  // Print the final formatted string containing the unique, sorted numbers to the console.
  console.log( resultSet );
}

// Entry point of the script:
// Read the entire content of standard input synchronously, using UTF-8 encoding,
// and pass this content as a string to the 'processInput' function for execution.
processInput(  require('node:fs') .readFileSync( '/dev/stdin' , 'utf8' )  ) ;