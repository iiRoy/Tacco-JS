'use strict'; // Enforce strict parsing and error handling

/**
 * Processes the raw input string to calculate a specific value.
 * @param {string} rawData - The raw input string from standard input.
 */
function processInput(rawData) {
  // Parse the input string into an array of numbers.
  const parsedValues = rawData.split(' ').map(currentVal => parseInt(currentVal, 10));

  // Extract the number of items and the starting value from the parsed input.
  const countItems = parsedValues[0];
  const startValue = parsedValues[1];

  // Initialize variables for the running total and the number with the smallest absolute value.
  let totalSum = 0;
  let smallestAbs = Infinity; // Use a large initial value for comparison

  // Iterate through a sequence of numbers starting from 'startValue'.
  for (let iteratorIndex = startValue; iteratorIndex < startValue + countItems; ++iteratorIndex) {
    // Add the current number to the running total.
    totalSum += iteratorIndex;

    // Check if the absolute value of the current number is smaller than the current smallest absolute value.
    if (Math.abs(iteratorIndex) < Math.abs(smallestAbs)) {
      smallestAbs = iteratorIndex; // Update the smallest absolute value found so far.
    }
  }
  
  // Output the result: the total sum minus the number with the smallest absolute value.
  console.log(totalSum - smallestAbs);
}

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
