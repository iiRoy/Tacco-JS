'use strict';

// This function processes the input data to perform a specific calculation.
function ProcessInput(inputData) {
  // Split the raw input string into an array of lines, trimming any leading/trailing whitespace.
  const lines = inputData.trim().split(/\r?\n/g);

  // Parse the first line to get the grid size (N) and number of iterations (K).
  const dimensions = lines[0].split(' ').map(numStr => Number(numStr));
  const gridSize = dimensions[0];
  const iterations = dimensions[1];

  // Initialize the array 'A' with numbers from the second line of input.
  let currentValues = lines[1].split(' ').map(numStr => Number(numStr));

  // Declare variables for range boundaries.
  let upperBound = 0;
  let lowerBound = 0;

  // Initialize the result array, which will hold the values for the next iteration.
  let nextValues = Array(gridSize);

  // Loop for the specified number of iterations (K).
  for (let iterIdx = 0; iterIdx < iterations; iterIdx++) {
    // Reset the nextValues array for the current iteration.
    nextValues.fill(0);

    // Iterate through each cell in the currentValues array.
    for (let cellIdx = 0; cellIdx < gridSize; cellIdx++) {
      // Calculate the upper bound for the range affected by the current cell.
      upperBound = (cellIdx + currentValues[cellIdx]) > gridSize ? gridSize - 1 : cellIdx + currentValues[cellIdx];
      // Calculate the lower bound for the range affected by the current cell.
      lowerBound = (cellIdx - currentValues[cellIdx]) < 1 ? 0 : cellIdx - currentValues[cellIdx];

      // Increment the count for each cell within the calculated range.
      for (let rangeIdx = lowerBound; rangeIdx <= upperBound; rangeIdx++) {
        nextValues[rangeIdx] += 1;
      }
    }
    // Update currentValues for the next iteration using a shallow copy of nextValues.
    currentValues = nextValues.slice(0);
  }

  // Output the final result array as a space-separated string.
  console.log(nextValues.join(' '));
}

// Execute the main processing function with data read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
