'use strict';

// This function processes the given string data to calculate a maximum value.
function processInput(rawData) {
  // Convert the raw input string into an array of characters.
  let charArray = rawData.split('');

  // The first character of the input determines the effective length for processing.
  const dataSize = charArray[0];

  // Initialize a counter for the current value, starting at zero.
  let currentValue = 0;

  // Maintain a record of all computed values, starting with the initial zero.
  let valueHistory = [0];

  // Iterate through the relevant part of the character array.
  for (let idx = 0; idx < dataSize; idx++) {
    // Check the character at an offset of 2 from the current index.
    if (charArray[idx + 2] === 'I') { // Use strict equality for comparison.
      currentValue++; // Increment the counter.
    } else {
      currentValue--; // Decrement the counter.
    }
    // Store the updated current value in the history list.
    valueHistory.push(currentValue);
  }

  // Output the maximum value found in the entire history.
  console.log(Math.max(...valueHistory));
}

// Execute the main processing function with data read from standard input.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
