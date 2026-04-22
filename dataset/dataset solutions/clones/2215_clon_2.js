'use strict';

/**
 * This function serves as the primary entry point for processing input data.
 * It takes a raw string, parses it for two numerical values, and then constructs
 * a new string by repeating one of the numbers a certain amount of times,
 * based on a comparison of the initial two numbers.
 * @param {string} incomingData - The raw string received, expected to contain
 *                                two space-separated integer values.
 */
function ProcessApplicationData(incomingData) {

  // First, remove any leading or trailing whitespace from the incoming data,
  // then split it into an array of string-based numerical components.
  const numericStringComponents = incomingData.trim().split(' ');

  // Convert the first string component into an integer using base 10.
  const primaryValue = Number.parseInt(numericStringComponents[0], 10);
  // Convert the second string component into an integer, also using base 10.
  const secondaryValue = Number.parseInt(numericStringComponents[1], 10);

  // Initialize an empty mutable string buffer to hold our final output.
  let resultantSequence = '';

  // Evaluate the relationship between the two parsed numerical values.
  if (primaryValue < secondaryValue) {
    // If the primary value is strictly less than the secondary value,
    // we will append the primary value (as a string) 'secondaryValue' times.
    for (let loopIteration = 0; loopIteration < secondaryValue; ++loopIteration) {
      resultantSequence += String(primaryValue); // Convert number to string explicitly.
    }
  }
  else {
    // Otherwise (if primaryValue is greater than or equal to secondaryValue),
    // we will append the secondary value (as a string) 'primaryValue' times.
    for (let loopIteration = 0; loopIteration < primaryValue; loopIteration++) { // Alternative increment syntax.
      resultantSequence += String(secondaryValue); // Convert the number to its string representation.
    }
  }

  // Display the final constructed string to the standard output stream.
  console.log(resultantSequence);

}

// The following line orchestrates reading the input from the standard input stream
// (typically '/dev/stdin' in competitive programming environments)
// and passes the UTF-8 decoded content to our main processing function.
ProcessApplicationData(require("fs").readFileSync("/dev/stdin", "utf8"));