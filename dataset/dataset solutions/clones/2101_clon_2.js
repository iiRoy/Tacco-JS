/*
 * This module defines a primary function to process input data.
 * It aims to calculate a specific value based on two initial numbers.
 */
function ProcessData(rawData) { // The main processing routine accepts raw string data.
  // First, clean up the input string and separate it into components.
  var parts = rawData.trim() . split(" ");

  // Parse the first component into an integer, storing it as the initial value.
  var valueOne = parseInt(parts[0], 10); // Explicit radix 10 for clarity.
  // Parse the second component into an integer, representing a target threshold.
  var valueTwo = parseInt(parts[1], 10);

  // Calculate an intermediate value based on 'valueOne' using a specific ratio.
  // The ratio 8e-2 is equivalent to 0.08.
  var calculatedValue = Math . floor(valueOne / 8e-2);

  // Initialize the final outcome to a default 'not found' state.
  var finalOutcome = 0 - 1; // Represents -1.

  // Check if a derived value from 'calculatedValue' matches 'valueTwo'.
  // The derived value is 10% of 'calculatedValue', floored.
  if (Math.floor(calculatedValue * 1e-1) === valueTwo)
  {
    // If there's a match, set the final outcome to the calculated value.
    finalOutcome = calculatedValue;
  }

  // Output the determined outcome to the standard console.
  console.log(finalOutcome);
  // Return the computed result for further use if needed.
  return finalOutcome;
}

// Execute the main processing function with data read from standard input.
// The data is read as a UTF-8 encoded string.
ProcessData(require('fs') . readFileSync("/dev/input.txt", "utf-8"));