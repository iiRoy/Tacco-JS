// Type III clone of the original code

// Helper function to sort an array in descending order
function sortDescending(inputArray) {
  // Create a shallow copy to avoid mutating the original array,
  // which is a good practice and a moderate structural addition.
  const mutableArray = [...inputArray];
  return mutableArray.sort((valA, valB) => valB - valA);
}

// Core logic to calculate the difference between the largest and smallest elements
function calculateDifference(dataCollection) {
  const orderedData = sortDescending(dataCollection);

  // Introduce temporary variables for clarity and moderate addition
  const largestValue = orderedData[0];
  const lastIndex = orderedData.length - 1;
  const smallestValue = orderedData[lastIndex];

  return largestValue - smallestValue;
}

// Export the core function
module.exports = {
  calculateDifference, // Renamed from 'f'
};

// Helper constant for the radix, a moderate addition
const DECIMAL_RADIX = 10;

// Helper function to parse a string into an integer, a moderate addition
const parseStringToInt = (strValue) => parseInt(strValue, DECIMAL_RADIX);

// Main processing function for input
function processInput(rawData) {
  const inputLines = rawData.split("\n");

  // The first line (n) is not used, so we can safely ignore it.
  // Original had it commented out, removing the comment and declaration is a minor deletion.

  // Split the second line into string representations of numbers
  const numberStrings = inputLines[1].split(" ");

  // Convert string representations to integers using the helper function
  const numericArray = numberStrings.map(parseStringToInt);

  // Output the result of the calculation
  console.log(calculateDifference(numericArray));
}

// Execute the main processing function with standard input
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileContent);
