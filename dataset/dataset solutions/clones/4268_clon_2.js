"use strict"; /* Enable strict mode for better code quality and error handling */

// This utility function performs a binary search to find the insertion point
// for a given search key within a sorted data collection.
const findInsertionPoint = (dataCollection, searchKey) => {
  let upperBound = dataCollection.length - 1; /* Initialize the highest possible index */
  let lowerBound = 0; /* Initialize the lowest possible index */

  // Continue the search as long as the lower bound is less than the upper bound
  while (lowerBound < upperBound) {
    // Calculate the middle index, ensuring it's an integer
    const middleIndex = Math.trunc((lowerBound + upperBound) / 2);

    // If the search key is found at the middle index, return its position
    if (searchKey === dataCollection[middleIndex]) {
      return middleIndex;
    }

    // If the search key is smaller, narrow the search to the lower half
    if (searchKey < dataCollection[middleIndex]) {
      upperBound = middleIndex - 1;
    }
    // Otherwise, narrow the search to the upper half
    else {
      lowerBound = middleIndex + 1;
    }
  }

  // After the loop, 'lowerBound' points to the correct insertion spot or existing element
  if (dataCollection[lowerBound] < searchKey) return lowerBound + 1; // Key should be placed after this element
  if (dataCollection[lowerBound] >= searchKey) return lowerBound; // Key should be placed at or before this element
  return 0; // Fallback, typically for an empty or single-element array edge case
};

// This is the primary function to process the input data
const processInputData = (inputString) => {
  // Split the entire input string into an array of individual lines
  inputString = inputString.split("\n");

  // Parse the first line, which often represents a record count (though not directly used later)
  const recordCount = Number.parseInt(inputString[0], 10);

  // Process the second line: split by spaces, convert to numbers, and sort ascending
  const upperValues = inputString[1]
    .split(" ")
    .map((numStr) => Number.parseInt(numStr, 10))
    .sort((valA, valB) => valA - valB);

  // Process the third line similarly for a set of middle values
  const middleValues = inputString[2]
    .split(" ")
    .map((numStr) => Number.parseInt(numStr, 10))
    .sort((valA, valB) => valA - valB);

  // Process the fourth line similarly for a set of lower values
  const lowerValues = inputString[3]
    .split(" ")
    .map((numStr) => Number.parseInt(numStr, 10))
    .sort((valA, valB) => valA - valB);

  // Log the sorted upper and lower value arrays for inspection or debugging purposes
  console.log(upperValues);
  console.log(lowerValues);
  console.log("    "); // Print some extra space for visual separation

  let totalCombinations = 0; // Initialize a variable to accumulate the final count of combinations

  // Iterate through each element in the middle values collection
  for (const idx in middleValues) {
    // Find how many elements in 'upperValues' are less than or equal to the current 'middleValue'
    const upperCount = findInsertionPoint(upperValues, middleValues[idx]);

    // Find how many elements in 'lowerValues' are greater than or equal to the current 'middleValue'
    const lowerCount =
      lowerValues.length - findInsertionPoint(lowerValues, middleValues[idx]);

    // Log the raw insertion point for 'lowerValues' for debugging
    console.log(findInsertionPoint(lowerValues, middleValues[idx]));

    // Output detailed information for the current middle value
    console.log(middleValues[idx] + "以下の個数: " + upperCount + "件");
    console.log(middleValues[idx] + "以上の個数: " + lowerCount + "件");
    console.log("-------------------"); // Visual separator

    // Add the product of upperCount and lowerCount to the running total
    totalCombinations += upperCount * lowerCount;
  }

  // Display the final calculated total number of combinations
  console.log(totalCombinations);
};

// Invoke the main processing function, reading input from the standard input stream
processInputData(
  require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" })
);