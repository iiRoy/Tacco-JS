'use strict';

// This function processes the raw input data to determine unique numeric entries.
function processInput(rawData) {
  // Split the incoming string by newline characters and convert each part to an integer.
  // The '10' specifies base-10 for parsing.
  let numericValues = rawData.split('\n').map((itemStr) => parseInt(itemStr, 10));

  // Remove the first element from the array, as per the original logic.
  numericValues.shift();

  // Create a Set from the numeric values to get only unique elements.
  // Convert the Set back to an Array.
  // Sort the unique numbers in ascending order.
  // Finally, log the count of these unique, sorted numbers.
  console.log(Array.from(new Set(numericValues)).sort((valA, valB) => valA - valB).length);
}

// Read the input from standard input using Node.js 'fs' module.
// The 'utf8' encoding is specified for reading the file content.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
