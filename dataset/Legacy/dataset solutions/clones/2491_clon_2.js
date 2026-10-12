"use strict";

// Read input from standard input and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "UTF-8"));

/**
 * Processes the raw input string to calculate a cumulative product sum.
 * @param {string} rawDataString The entire input content as a single string.
 */
function processInputData(rawDataString) {
  // Split the input string into an array of lines.
  rawDataString = rawDataString.split("\n");

  // Parse the first line to get the total number of items.
  const numberOfItems = parseInt(rawDataString[0]);
  // Initialize a variable to accumulate the sum of products.
  let cumulativeProductSum = 0;

  // Parse the second line, splitting by space and converting each part to an integer.
  let itemScores = rawDataString[1];
  itemScores = itemScores.split(" ").map(scoreStr => parseInt(scoreStr));

  // Iterate through all unique pairs of items.
  // The outer loop goes from the first item up to the second-to-last item.
  for (let firstIndex = 0; firstIndex < numberOfItems - 1; firstIndex++) {
    // The inner loop goes from the item immediately after 'firstIndex' up to the last item.
    for (let secondIndex = firstIndex + 1; secondIndex < numberOfItems; secondIndex++) {
      // Add the product of the scores of the current pair of items to the total sum.
      cumulativeProductSum += itemScores[firstIndex] * itemScores[secondIndex];
    }
  }
  // Output the final calculated sum to the console.
  console.log(cumulativeProductSum);
}
