/*
 * This file processes numerical data to find the difference between the maximum and minimum values.
 * The core logic involves sorting an array and then performing a subtraction.
 */

// Function to arrange an array of numbers in descending order.
function orderDescending(dataCollection) {
  // Uses the built-in sort method with a custom comparison function.
  return dataCollection.sort((firstElement, secondElement) => secondElement - firstElement);
}

// Computes the absolute difference between the largest and smallest numbers in an array.
function calculateDifference(inputArray) {
  // First, sort the provided array in descending order.
  const orderedElements = orderDescending(inputArray);

  // The largest element will be at index 0, and the smallest at the last index.
  // Subtract the smallest from the largest to get the difference.
  return orderedElements[0] - orderedElements[orderedElements.length - 1];
}

// Export the primary calculation function for external use.
module.exports = {
  calculateDifference,
};

// Main entry point for processing standard input.
function ProcessInput(rawData) {
  // Split the entire input string into individual lines.
  const textLines = rawData.split("\n");

  // The first line might contain 'n', but it's not used in this specific problem.
  // const count = parseInt(textLines[0], 10);

  // Parse the second line, splitting by spaces and converting each part to an integer.
  const numericValues = textLines[1].split(" ").map((currentString) => parseInt(currentString, 10));

  // Output the result of the difference calculation to the console.
  console.log(calculateDifference(numericValues));
}

// Read input from standard input and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
