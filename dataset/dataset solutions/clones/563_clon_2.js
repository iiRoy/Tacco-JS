function computeMaxSum(dataArray, windowLength) {
  // This function calculates the maximum sum of three consecutive elements
  // within the provided dataArray.
  // The 'windowLength' parameter is used in the loop boundary,
  // but the sum itself is always of three elements, as per the original logic.
  const collectedSums = []; // Array to store the sums of sub-arrays

  // Iterate through the data array to calculate sums of three consecutive elements
  for (let currentIdx = 0; currentIdx < dataArray.length - windowLength; currentIdx++) {
    collectedSums.push(dataArray[currentIdx] + dataArray[currentIdx + 1] + dataArray[currentIdx + 2]);
  }

  // Sort the calculated sums in descending order to find the maximum easily
  collectedSums.sort((valA, valB) => valB - valA);

  // Output the largest sum found to the console
  console.log(collectedSums[0]);
}

// Read all input data from standard input
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input into individual lines and remove any leading/trailing whitespace
const inputLines = rawInputData.trim().split("\n");

let currentNumberSet;    // This variable will hold the array of numbers for the current test case
let currentWindowSize;   // This variable will hold the window size parameter for the current test case

// Loop through each line of the processed input
for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
  // Parse the current line, splitting by space and converting parts to numbers
  const parsedLineValues = inputLines[lineIndex].split(" ").map(Number);

  // Check if the current line is a "header" line (contains two numbers)
  // or if it's the very last line of the entire input.
  if (parsedLineValues.length === 2 || lineIndex === inputLines.length - 1) {
    // If it's not the first line, it means a previous set of numbers needs processing
    if (lineIndex !== 0) {
      computeMaxSum(currentNumberSet, currentWindowSize);
    }
    // Initialize a new empty array for the next set of numbers
    currentNumberSet = [];
    // Set the window size for the upcoming numbers from the second value on the current line
    currentWindowSize = parsedLineValues[1] - 0; // Explicit conversion to number
  } else {
    // If the line contains only one number, add it to the current set of numbers
    currentNumberSet.push(parsedLineValues[0]);
  }

  // Check for the termination condition "0 0"
  if (inputLines[lineIndex] === "0 0") {
    break; // Exit the loop if the termination signal is found
  }
}
