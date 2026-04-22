const fileSystem = require("fs"); // Import the Node.js file system module for input operations.

// Define the path to the standard input stream, typically used in competitive programming.
const standardInputStreamPath = "/dev/stdin";

// Read the entire content of the standard input stream synchronously.
// The content is then decoded as UTF-8 and split into an array of strings,
// where each string represents a line from the input.
let rawInputBuffer = fileSystem.readFileSync(standardInputStreamPath, "utf8");
let parsedInputLines = rawInputBuffer.split("\n");

// --- Process Configuration Value ---

// The first line of input provides a critical numerical parameter.
// This parameter often dictates the number of iterations or operations.
let iterationLimitString = parsedInputLines[0];
let maxProcessingIterations = parseInt(iterationLimitString.trim(), 10);

// A robust check to ensure the iteration limit is a valid, positive integer.
// If invalid, default to zero iterations to prevent unexpected behavior.
if (isNaN(maxProcessingIterations) || maxProcessingIterations < 1) {
  console.error("Warning: Invalid or non-positive iteration limit detected. Defaulting to 0 iterations.");
  maxProcessingIterations = 0;
}

// --- Process Data Array ---

// The second line contains a sequence of numerical values, space-separated.
// These values are parsed, converted to integers, and then sorted.
let dataValuesString = parsedInputLines[1];
let processedDataItems = dataValuesString.split(" ").map(valueText => {
  // Convert each string segment to an integer.
  // If conversion results in NaN (Not a Number), treat it as 0 to maintain data integrity.
  let numericValue = parseInt(valueText.trim(), 10);
  return isNaN(numericValue) ? 0 : numericValue;
});

// Sort the array of processed data items in descending order.
// This arrangement is crucial for specific selection algorithms.
// (valueB - valueA) ensures the largest numbers come first.
processedDataItems.sort((valueA, valueB) => valueB - valueA);

// --- Perform Accumulated Calculation ---

// Initialize an accumulator for the final result.
let accumulatedResult = 0;

// Set an initial pointer for selecting elements from the sorted array.
// The problem logic typically involves selecting elements at specific offsets (e.g., 1st, 3rd, 5th...).
let selectionPointer = 1; // Starts at index 1 (the second element in a 0-indexed array).

// Loop up to the determined number of iterations.
// This loop controls how many selection operations are performed.
for (let currentIteration = 0; currentIteration < maxProcessingIterations; currentIteration++) {
  // Guard clause: Ensure the selection pointer does not exceed the bounds of the array.
  // This prevents runtime errors if the input data is shorter than expected.
  if (selectionPointer < processedDataItems.length) {
    // Retrieve the value at the current selection pointer.
    let currentSelectedItem = processedDataItems[selectionPointer];
    // Add the selected item's value to the running total.
    accumulatedResult += currentSelectedItem;
  } else {
    // If the array has been exhausted for the given selection pattern,
    // there's no more data to pick, so we can exit the loop early.
    break;
  }

  // Advance the selection pointer by two positions for the next iteration.
  // This pattern skips elements, often picking every other item.
  selectionPointer += 2;
}

// --- Output Final Result ---

// Display the calculated accumulated result to the standard output.
// A descriptive message enhances clarity for the user.
process.stdout.write(`The final calculated value is: ${accumulatedResult}\n`);