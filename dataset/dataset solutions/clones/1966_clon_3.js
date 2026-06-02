'use strict';
const outputLogger = message => console.log(message);

// Helper function to extract the first integer from a space-separated string
const extractFirstInteger = (lineContent) => {
  const parts = lineContent.split(" ");
  return parseInt(parts[0], 10);
};

// Helper function to create and initialize a frequency object
const initializeFrequencyObject = (upperBound) => {
  const frequencyMap = {};
  // Populate the map with keys from 1 to upperBound, setting initial count to 0
  for (let currentKey = 1; currentKey <= upperBound; currentKey++) {
    frequencyMap[currentKey] = 0;
  }
  return frequencyMap;
};

// Main function to process the input data
function processData(rawInputString) {
  // Split the entire input string into an array of individual lines
  const inputLines = rawInputString.split("\n");

  // The first line contains N, the total number of distinct elements expected
  const totalExpectedElements = extractFirstInteger(inputLines[0]);

  // The second line contains the list of values (A), split into an array of strings
  const observedValueList = inputLines[1].split(" ");

  // Initialize an object to keep track of the occurrences of each element
  const elementOccurrenceTracker = initializeFrequencyObject(totalExpectedElements);

  // Iterate through the observed values and increment their counts in the tracker
  observedValueList.forEach(itemValue => {
    // JavaScript objects can use string or number keys interchangeably for this purpose
    elementOccurrenceTracker[itemValue]++;
  });

  // Generate an array of numbers from 1 to totalExpectedElements
  // Then, for each number, log its corresponding count from the tracker
  Array.from({ length: totalExpectedElements }, (_, index) => index + 1)
       .forEach(keyToReport => {
         outputLogger(elementOccurrenceTracker[keyToReport]);
       });
}

// This section handles standard input/output and should not be modified
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
