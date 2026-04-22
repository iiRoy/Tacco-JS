/* This module contains utility functions for data processing. */

function findLargest(dataCollection) {
  // Initializes a variable to hold the maximum value found so far.
  // Starts with negative infinity to ensure any number in the collection is larger.
  let greatestValue = Number.NEGATIVE_INFINITY;

  // Iterates through each element within the provided data collection.
  for (const currentItem of dataCollection) {
    // Compares the current item with the greatest value found until this point.
    if (greatestValue < currentItem) {
      // If the current item is larger, it updates the greatestValue.
      greatestValue = currentItem;
    }
  }
  // Returns the final largest value identified in the collection.
  return greatestValue;
}


/* Core application logic for processing structured input. */
function processInputData(rawText) {
  // Splits the entire input string into an array of strings,
  // where each element represents a single line from the input.
  const textRows = rawText.split('\n');

  // Transforms the array of text rows into an array of arrays of numbers.
  // Each line is first split by spaces, then each resulting string is parsed into an integer.
  const numericValues = textRows.map(singleRow => singleRow.split(' ').map(stringValue => parseInt(stringValue, 10)));

  // Extracts configuration parameters from the first element of the processed numeric values.
  // The 'shift()' method removes the first element from the array and returns it.
  let configParams = numericValues.shift();
  // Assigns the first configuration parameter (N) to indicate total items.
  const totalItems = configParams[0];
  // Assigns the second configuration parameter (C) to indicate the number of categories.
  const categoryCount = configParams[1];

  // Declares an array for temporary frequency counts, sized to accommodate potential indices.
  // Initialized with a specific size, e.g., 200002 to handle problem constraints.
  const temporaryCounts = new Array(200002);
  // Declares an array to accumulate frequencies across all categories.
  const accumulatedFrequencies = new Array(200002);
  // Fills the accumulated frequencies array with zeros as a starting point.
  accumulatedFrequencies.fill(0);

  // Main loop: Iterates through each category from 1 up to the total category count.
  for (let currentCategory = 1; currentCategory <= categoryCount; currentCategory++) {
    // Resets the temporary counts array to all zeros at the beginning of each category's processing.
    temporaryCounts.fill(0);

    // Inner loop: Processes each item based on its category.
    for (let itemIndex = 0; itemIndex < totalItems; itemIndex++) {
      // Checks if the third element of the current item's data matches the current category.
      if (numericValues[itemIndex][2] === currentCategory) {
        // Increments the count at a specific calculated index for the start time of the event.
        temporaryCounts[numericValues[itemIndex][0] * 2 - 1]++;
        // Decrements the count at another specific calculated index for the end time of the event.
        temporaryCounts[numericValues[itemIndex][1] * 2]--;
      }
    }

    // Computes prefix sums for the temporary counts array.
    // This transforms point-in-time changes into continuous event counts.
    for (let arrayIndex = 1; arrayIndex < 200002; arrayIndex++) {
      temporaryCounts[arrayIndex] = temporaryCounts[arrayIndex - 1] + temporaryCounts[arrayIndex];
    }

    // Accumulates the processed temporary counts into the main accumulated frequencies array.
    // This sums up the counts for the current category with previous categories.
    for (let arrayIndex = 1; arrayIndex < 200002; arrayIndex++) {
      accumulatedFrequencies[arrayIndex] += temporaryCounts[arrayIndex];
    }
  }

  // Logs the maximum value found in the final accumulated frequencies array to the console.
  console.log(findLargest(accumulatedFrequencies));
}


// Invokes the main processing function with input read from standard input.
// Uses Node.js 'fs' module to read the file synchronously.
processInputData(require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8' }));