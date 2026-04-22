/*
 * This module provides utilities to read standard input and process data.
 */

// Function to retrieve all lines from standard input.
// It reads the entire content of /dev/stdin and splits it into an array of lines.
function obtainInputLines() {

  // Utilize Node.js 'fs' module to read the file synchronously.
  const rawContent = require("fs").readFileSync("/dev/stdin", "utf8");

  // Split the raw content by newline characters, handling both Unix and Windows line endings.
  return rawContent.split(/\n\r?/);
}


// Function to generate a sequential list of numbers within a specified range.
// The list includes both the start and end points.
function createNumericalSeries(startPoint, endPoint) {

  // Initialize an empty array to store the generated numbers.
  let generatedList = [];

  // Loop from the starting point up to and including the ending point.
  for (let indexCounter = startPoint; indexCounter <= endPoint; indexCounter++) {
    // Add each number to the list.
    generatedList.push(indexCounter);
  }

  // Return the complete list of numbers.
  return generatedList;
}


// Initialize a comprehensive collection representing different categories,
// each containing a full range of 1 to 13 elements.
const masterCollection = {
  S: createNumericalSeries(1, 13),
  H: createNumericalSeries(1, 13),
  C: createNumericalSeries(1, 13),
  D: createNumericalSeries(1, 13)
};


// Process each input line from the second line onwards (skipping the first).
// Each line specifies an element to be removed from the masterCollection.
obtainInputLines().slice(1).forEach(function(currentTextLine) {

  // Split the current line into parts based on whitespace.
  const segmentParts = currentTextLine.split(' ');

  // The first part is the category key, the second part is the numeric value.
  // Convert the numeric value to an integer and adjust for zero-based indexing to delete.
  delete masterCollection[segmentParts[0]][+segmentParts[1] - 1];
});


// Iterate through each category within the masterCollection.
for (let collectionKey in masterCollection) {

  // For each category, filter out any 'falsy' (e.g., undefined) elements that were deleted.
  // Then, transform the remaining numeric elements into formatted strings.
  // Finally, join these formatted strings with newline characters for output.
  console.log(
    masterCollection[collectionKey]
    .filter(function(itemValue) {
      return itemValue;
    })
    .map(function(itemNumber) {
      return collectionKey + ' ' + itemNumber;
    })
    .join("\n")
  );
}