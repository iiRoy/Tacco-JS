'use strict';

// A simple helper function to output data to the console.
const logOutput = (messageContent) => console.log(messageContent);

/**
 * Processes the entire input string to determine and display element frequencies.
 * @param {string} rawInputString - The complete input data provided as a single string.
 */
function ProcessInputData(rawInputString) {
  // Divide the raw input string into individual lines.
  let dataLines = rawInputString.split("\n");

  // Extract the total count of expected elements from the first line.
  let totalElementCount = dataLines[0].split(" ")[0];

  // Retrieve the list of element values from the second line.
  let elementValuesList = dataLines[1].split(" ");

  // Initialize an empty object to keep track of element occurrences.
  let occurrenceTracker = {};

  // Set initial counts for all possible elements (from 1 up to totalElementCount) to zero.
  for (let currentIdx = 0; currentIdx < totalElementCount; currentIdx++) {
    occurrenceTracker[currentIdx + 1] = 0;
  }

  // Iterate through the provided element values and increment their respective counts.
  for (let valueIndex = 0; valueIndex < elementValuesList.length; valueIndex++) {
    occurrenceTracker[elementValuesList[valueIndex]]++;
  }

  // Output the final frequency count for each element, from 1 to totalElementCount.
  for (let displayIndex = 0; displayIndex < totalElementCount; displayIndex++) {
    logOutput(occurrenceTracker[displayIndex + 1]);
  }
}

// The following section handles reading input from standard input and executing the main processing function.
// This part should remain unaltered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
