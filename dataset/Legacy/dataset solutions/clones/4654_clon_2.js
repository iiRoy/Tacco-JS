"use strict"; // Enforce strict parsing and error handling
/*
 * This script processes input data to calculate a specific sum.
 * It's based on a problem from AtCoder.
 */
function ProcessInput(rawData) {
  // Split the raw input string into an array of lines, removing leading/trailing whitespace.
  const inputLines = rawData.trim().split("\n");

  // Parse the first line to get the number of groups.
  const countOfGroups = Number(inputLines[0].trim());

  // Process the second line: split by space, convert to numbers, and sort in descending order.
  const descendingNumbers = inputLines[1]
    .trim()
    .split(" ")
    .map(Number)
    .sort((valA, valB) => valB - valA); // Sort from largest to smallest

  // Initialize a variable to accumulate the sum.
  let cumulativeSum = 0;

  // Iterate 'countOfGroups' times to select specific elements from the sorted array.
  for (let idx = 0; idx < countOfGroups; idx++) {
    // Add the element at index (idx * 2 + 1) to the cumulative sum.
    cumulativeSum += descendingNumbers[idx * 2 + 1];
  }

  // Output the final calculated sum to the console.
  console.log(cumulativeSum);
}

// The following line handles reading from standard input and invoking the main processing function.
// It should not be modified for competitive programming environments.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
