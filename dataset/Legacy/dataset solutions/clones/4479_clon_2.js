"use strict";

/**
 * Processes the input data to find the minimum absolute difference
 * between two sums formed by a specific splitting algorithm.
 * @param {string} inputDataString - The raw input string from standard input.
 */
const processInputData = (inputDataString) => {
  // Trim whitespace and split the input string into an array of lines.
  inputDataString = inputDataString.trim().split("\n");

  // Parse the first line to get the count of elements.
  // This variable is declared but not used in the subsequent logic.
  const elementCount = parseInt(inputDataString[0], 10);

  // Parse the second line, splitting by space and converting each part to an integer.
  const numericValues = inputDataString[1].split(" ").map(strVal => parseInt(strVal, 10));

  // Calculate the total sum of all numeric values in the array.
  const overallTotal = numericValues.reduce((currentSum, valueItem) => currentSum + valueItem);

  // Initialize the sum for the first segment (left part).
  // This starts with the first element of the array.
  let firstSegmentSum = numericValues[0];
  // Initialize the sum for the second segment (right part).
  // This is the total sum minus the first element.
  let secondSegmentSum = overallTotal - numericValues[0];

  // Initialize the variable to store the minimum absolute difference found.
  // Set to positive infinity initially to ensure any calculated difference will be smaller.
  let minimumAbsoluteDifference = Infinity;

  // Iterate through the array using a for...in loop, which provides string indices.
  // The algorithm calculates differences and updates sums in a specific way.
  for (let currentIdxStr in numericValues) {
    // Calculate the absolute difference between the current two segment sums.
    let currentDifference = Math.abs(secondSegmentSum - firstSegmentSum);

    // Update the minimum absolute difference if the current difference is smaller.
    minimumAbsoluteDifference = Math.min(minimumAbsoluteDifference, currentDifference);

    // Retrieve the numeric value at the current index.
    // The index from for...in is a string, so it's parsed to an integer.
    const elementAtCurrentIndex = numericValues[parseInt(currentIdxStr, 10)];

    // Update the segment sums for the next iteration.
    // The element at the current index is subtracted from the second segment sum
    // and added to the first segment sum.
    secondSegmentSum -= elementAtCurrentIndex;
    firstSegmentSum += elementAtCurrentIndex;
  }

  // Output the final calculated minimum absolute difference to the console.
  console.log(minimumAbsoluteDifference);
};

// Read the entire content of standard input as a UTF-8 string
// and pass it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
